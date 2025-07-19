import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        console.log('認証試行:', credentials?.email)
        
        if (!credentials?.email || !credentials?.password) {
          console.log('認証失敗: 資格情報が不足')
          return null
        }

        try {
          // データベースからユーザーを検索
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email
            }
          })

          if (!user) {
            console.log('認証失敗: ユーザーが見つかりません')
            return null
          }

          // パスワード検証
          const isValidPassword = await bcrypt.compare(credentials.password, user.password)
          
          if (!isValidPassword) {
            console.log('認証失敗: パスワードが間違っています')
            return null
          }

          console.log('認証成功:', user.email)
          return {
            id: user.id,
            email: user.email,
            username: user.username,
          }
        } catch (error) {
          console.error('認証エラー:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      console.log('JWT callback:', { token, user })
      if (user) {
        token.userId = user.id
        token.username = user.username
      }
      return token
    },
    async session({ session, token }) {
      console.log('Session callback:', { session, token })
      if (token.userId && session.user) {
        session.user.id = token.userId as string
        session.user.username = token.username as string
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin'
  },
  debug: process.env.NODE_ENV === 'development',
}
