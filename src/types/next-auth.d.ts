import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      username: string
      name?: string
    }
  }

  interface User {
    id: string
    email: string
    username: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId: string
    username: string
  }
}
