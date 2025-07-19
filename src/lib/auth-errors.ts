// Authentication error types and utilities for detailed error reporting

export enum AuthErrorType {
  MISSING_CREDENTIALS = 'MISSING_CREDENTIALS',
  INVALID_EMAIL_FORMAT = 'INVALID_EMAIL_FORMAT',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  INVALID_PASSWORD = 'INVALID_PASSWORD',
  DATABASE_ERROR = 'DATABASE_ERROR',
  BCRYPT_ERROR = 'BCRYPT_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface AuthError {
  type: AuthErrorType
  message: string
  details?: string
  timestamp: string
  userEmail?: string
}

export class AuthenticationError extends Error {
  public type: AuthErrorType
  public details?: string
  public userEmail?: string

  constructor(type: AuthErrorType, message: string, details?: string, userEmail?: string) {
    super(message)
    this.name = 'AuthenticationError'
    this.type = type
    this.details = details
    this.userEmail = userEmail
  }

  toAuthError(): AuthError {
    return {
      type: this.type,
      message: this.message,
      details: this.details,
      timestamp: new Date().toISOString(),
      userEmail: this.userEmail
    }
  }
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function getDetailedErrorMessage(error: AuthError, isProduction = false): string {
  const baseMessages = {
    [AuthErrorType.MISSING_CREDENTIALS]: 'メールアドレスとパスワードを入力してください',
    [AuthErrorType.INVALID_EMAIL_FORMAT]: 'メールアドレスの形式が正しくありません',
    [AuthErrorType.USER_NOT_FOUND]: 'このメールアドレスで登録されたユーザーが見つかりません',
    [AuthErrorType.INVALID_PASSWORD]: 'パスワードが間違っています',
    [AuthErrorType.DATABASE_ERROR]: 'データベース接続エラーが発生しました',
    [AuthErrorType.BCRYPT_ERROR]: 'パスワード検証中にエラーが発生しました',
    [AuthErrorType.UNKNOWN_ERROR]: '予期しないエラーが発生しました'
  }

  let message = baseMessages[error.type] || baseMessages[AuthErrorType.UNKNOWN_ERROR]

  // In production (Vercel), add detailed debugging information
  if (isProduction && error.details) {
    message += `\n\n[DEBUG INFO] ${error.details}`
  }

  if (isProduction) {
    message += `\n[時刻] ${error.timestamp}`
    message += `\n[エラータイプ] ${error.type}`
  }

  return message
}

export function logAuthenticationAttempt(email: string, step: string, details?: unknown): void {
  const logData = {
    timestamp: new Date().toISOString(),
    email: email,
    step: step,
    details: details,
    environment: process.env.NODE_ENV,
    vercel: process.env.VERCEL || false
  }

  console.log(`[AUTH ${step.toUpperCase()}]`, JSON.stringify(logData, null, 2))
}

export function logAuthenticationError(error: AuthError): void {
  const logData = {
    ...error,
    environment: process.env.NODE_ENV,
    vercel: process.env.VERCEL || false,
    databaseUrl: process.env.DATABASE_URL ? 'SET' : 'NOT_SET',
    nextauthUrl: process.env.NEXTAUTH_URL || 'NOT_SET',
    nextauthSecret: process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT_SET'
  }

  console.error('[AUTH ERROR]', JSON.stringify(logData, null, 2))
}