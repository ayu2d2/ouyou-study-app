import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

// Vercel用の簡略化された認証設定
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
        
        // 開発環境での簡単な認証（本番では適切なDBを使用）
        if (credentials?.email === 'demo@example.com' && credentials?.password === 'demo123') {
          console.log('認証成功')
          return {
            id: '1',
            email: 'demo@example.com',
            username: 'Demo User',
          }
        }
        
        console.log('認証失敗')
        return null
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
