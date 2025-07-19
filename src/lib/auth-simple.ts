import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { 
  AuthErrorType, 
  AuthenticationError, 
  validateEmail, 
  logAuthenticationAttempt, 
  logAuthenticationError 
} from './auth-errors'

// Prismaクライアントを直接初期化
const prisma = new PrismaClient()

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        // ログリクエスト詳細情報の記録
        logAuthenticationAttempt(credentials?.email || 'NO_EMAIL', 'START', {
          hasEmail: !!credentials?.email,
          hasPassword: !!credentials?.password,
          emailLength: credentials?.email?.length || 0,
          passwordLength: credentials?.password?.length || 0
        })
        
        try {
          // 基本的な入力値チェック
          if (!credentials?.email || !credentials?.password) {
            const error = new AuthenticationError(
              AuthErrorType.MISSING_CREDENTIALS,
              '認証失敗: メールアドレスまたはパスワードが入力されていません',
              `Email: ${!!credentials?.email}, Password: ${!!credentials?.password}`,
              credentials?.email
            )
            logAuthenticationError(error.toAuthError())
            throw error
          }

          // メールアドレス形式チェック
          if (!validateEmail(credentials.email)) {
            const error = new AuthenticationError(
              AuthErrorType.INVALID_EMAIL_FORMAT,
              '認証失敗: メールアドレスの形式が正しくありません',
              `Provided email: ${credentials.email}`,
              credentials.email
            )
            logAuthenticationError(error.toAuthError())
            throw error
          }

          logAuthenticationAttempt(credentials.email, 'VALIDATION_PASSED')

          // データベースからユーザーを検索
          logAuthenticationAttempt(credentials.email, 'DB_QUERY_START')
          
          let user
          try {
            user = await prisma.user.findUnique({
              where: {
                email: credentials.email
              }
            })
            logAuthenticationAttempt(credentials.email, 'DB_QUERY_SUCCESS', {
              userFound: !!user,
              userId: user?.id || 'NOT_FOUND'
            })
          } catch (dbError: unknown) {
            const error = new AuthenticationError(
              AuthErrorType.DATABASE_ERROR,
              '認証失敗: データベース接続エラー',
              `DB Error: ${dbError instanceof Error ? dbError.message : 'Unknown database error'}`,
              credentials.email
            )
            logAuthenticationError(error.toAuthError())
            throw error
          }

          if (!user) {
            const error = new AuthenticationError(
              AuthErrorType.USER_NOT_FOUND,
              '認証失敗: ユーザーが見つかりません',
              `Email ${credentials.email} not found in database`,
              credentials.email
            )
            logAuthenticationError(error.toAuthError())
            throw error
          }

          // パスワード検証
          logAuthenticationAttempt(credentials.email, 'PASSWORD_VERIFICATION_START')
          
          let isValidPassword = false
          try {
            isValidPassword = await bcrypt.compare(credentials.password, user.password)
            logAuthenticationAttempt(credentials.email, 'PASSWORD_VERIFICATION_COMPLETE', {
              isValid: isValidPassword
            })
          } catch (bcryptError: unknown) {
            const error = new AuthenticationError(
              AuthErrorType.BCRYPT_ERROR,
              '認証失敗: パスワード検証エラー',
              `Bcrypt error: ${bcryptError instanceof Error ? bcryptError.message : 'Unknown bcrypt error'}`,
              credentials.email
            )
            logAuthenticationError(error.toAuthError())
            throw error
          }
          
          if (!isValidPassword) {
            const error = new AuthenticationError(
              AuthErrorType.INVALID_PASSWORD,
              '認証失敗: パスワードが間違っています',
              'Password comparison failed',
              credentials.email
            )
            logAuthenticationError(error.toAuthError())
            throw error
          }

          // 認証成功
          const successUser = {
            id: user.id,
            email: user.email,
            username: user.username,
          }

          logAuthenticationAttempt(credentials.email, 'SUCCESS', {
            userId: user.id,
            username: user.username
          })

          return successUser
        } catch (error) {
          // AuthenticationError以外のエラーもキャッチ
          if (error instanceof AuthenticationError) {
            throw error
          }
          
          const unknownError = new AuthenticationError(
            AuthErrorType.UNKNOWN_ERROR,
            '認証失敗: 予期しないエラー',
            `Unknown error: ${error instanceof Error ? error.message : 'No error message'}`,
            credentials?.email
          )
          logAuthenticationError(unknownError.toAuthError())
          throw unknownError
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, account }) {
      logAuthenticationAttempt(token.email || 'NO_EMAIL', 'JWT_CALLBACK', { 
        hasUser: !!user, 
        hasAccount: !!account,
        tokenUserId: token.userId || 'NOT_SET'
      })
      
      if (user) {
        token.userId = user.id
        token.username = user.username
      }
      return token
    },
    async session({ session, token }) {
      logAuthenticationAttempt(session.user?.email || 'NO_EMAIL', 'SESSION_CALLBACK', {
        tokenUserId: token.userId || 'NOT_SET',
        sessionUserId: session.user?.id || 'NOT_SET'
      })
      
      if (token.userId && session.user) {
        session.user.id = token.userId as string
        session.user.username = token.username as string
        // nameもusernameで設定
        session.user.name = token.username as string
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/signin' // リダイレクト先を統一
  },
  debug: true, // 本番環境でもデバッグを有効化
  events: {
    signIn: async (message) => {
      logAuthenticationAttempt(message.user?.email || 'NO_EMAIL', 'SIGNIN_EVENT', {
        account: message.account?.provider,
        profile: !!message.profile
      })
    },
    signInError: async (message) => {
      console.error('[NEXTAUTH SIGNIN ERROR]', JSON.stringify({
        error: message.error.message,
        type: message.error.type || 'UNKNOWN',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        vercel: process.env.VERCEL || false
      }, null, 2))
    },
    session: async (message) => {
      logAuthenticationAttempt(message.session?.user?.email || 'NO_EMAIL', 'SESSION_EVENT')
    }
  },
}
