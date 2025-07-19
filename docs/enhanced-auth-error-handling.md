# Enhanced Authentication Error Handling

This document describes the enhanced error handling system implemented for login failures in the Vercel deployment.

## Overview

The enhanced error handling system provides detailed error categorization, comprehensive logging, and environment-specific error reporting to help debug login failures in production environments.

## Key Features

### 1. Error Categorization
All authentication errors are categorized into specific types:
- `MISSING_CREDENTIALS`: Email or password not provided
- `INVALID_EMAIL_FORMAT`: Email doesn't match valid format
- `USER_NOT_FOUND`: Email not found in database
- `INVALID_PASSWORD`: Password verification failed
- `DATABASE_ERROR`: Database connection or query errors
- `BCRYPT_ERROR`: Password hashing/comparison errors
- `UNKNOWN_ERROR`: Unexpected errors

### 2. Detailed Logging
Every authentication step is logged with structured data:
- Request initiation with input validation details
- Database query attempts and results
- Password verification steps
- Error occurrences with full context
- Success flows with user information

### 3. Environment-Specific Error Display
- **Development**: Basic error messages for user experience
- **Production/Vercel**: Additional debug information panel with:
  - Timestamp and error type
  - Detailed error context
  - Environment information
  - Request/response details

### 4. Comprehensive Console Logging
All authentication attempts generate detailed console logs with:
- Structured JSON format for easy parsing
- Step-by-step authentication flow tracking
- Environment and deployment information
- Request headers and user agent data

## Implementation Details

### Files Modified/Created

#### `/src/lib/auth-errors.ts` (NEW)
- Error type enumeration
- `AuthenticationError` class for structured error handling
- Email validation utility
- Detailed logging functions
- Environment-aware error message generation

#### `/src/lib/auth-simple.ts` (ENHANCED)
- Replaced simple null returns with detailed error throwing
- Step-by-step authentication flow logging
- Specific error handling for each failure scenario
- Enhanced NextAuth callbacks with logging
- Production debug mode enabled

#### `/src/app/auth/signin/page.tsx` (ENHANCED)
- Detailed request/response logging
- Environment-aware error display
- Collapsible debug information panel for production
- Structured error categorization

#### `/src/app/api/auth/register/route.ts` (ENHANCED)
- Applied same error handling pattern to registration
- Detailed validation and logging
- Production-specific error details

#### `/src/app/api/debug/auth/route.ts` (NEW)
- Debug endpoint for environment information
- Request header analysis
- Environment variable status checking

## Error Flow Example

1. **User submits login form**
   ```json
   [AUTH START] {
     "timestamp": "2024-01-20T10:30:00.000Z",
     "email": "user@example.com",
     "step": "START",
     "details": {
       "hasEmail": true,
       "hasPassword": true,
       "emailLength": 16,
       "passwordLength": 8
     }
   }
   ```

2. **Validation passes**
   ```json
   [AUTH VALIDATION_PASSED] {
     "timestamp": "2024-01-20T10:30:00.001Z",
     "email": "user@example.com",
     "step": "VALIDATION_PASSED"
   }
   ```

3. **Database query**
   ```json
   [AUTH DB_QUERY_SUCCESS] {
     "timestamp": "2024-01-20T10:30:00.050Z",
     "email": "user@example.com",
     "step": "DB_QUERY_SUCCESS",
     "details": {
       "userFound": true,
       "userId": "clx123abc"
     }
   }
   ```

4. **Password verification**
   ```json
   [AUTH PASSWORD_VERIFICATION_COMPLETE] {
     "timestamp": "2024-01-20T10:30:00.100Z",
     "email": "user@example.com",
     "step": "PASSWORD_VERIFICATION_COMPLETE",
     "details": {
       "isValid": true
     }
   }
   ```

5. **Success or Error**
   - Success: `[AUTH SUCCESS]` with user details
   - Error: `[AUTH ERROR]` with full error context

## Production Debug Information

In Vercel/production environment, failed login attempts show a collapsible debug panel with:

```
[デバッグ情報]
時刻: 2024-01-20T10:30:00.000Z
エラー: CredentialsSignin
ステータス: 401
環境: production
Vercel: true
```

## Usage in Vercel Debugging

1. **Access the debug endpoint**: `GET /api/debug/auth`
   - Returns environment variable status
   - Shows request headers and deployment info

2. **Monitor console logs** in Vercel dashboard:
   - Search for `[AUTH` to find authentication-related logs
   - Each log entry contains structured JSON for easy parsing

3. **Use the signin page debug panel**:
   - Only visible in production environment
   - Expandable section with detailed error information
   - Helps identify specific failure points

## Testing Error Scenarios

### Manual Test Cases
1. **Missing credentials**: Submit empty form
2. **Invalid email format**: Use "invalid-email" as email
3. **User not found**: Use non-existent email
4. **Wrong password**: Use existing email with wrong password
5. **Database errors**: Simulated through connection issues

### Expected Console Output
Each test should produce structured console logs with:
- Clear step identification
- Timestamp for debugging timing issues
- Relevant context data for each step
- Environment information for deployment tracking

## Security Considerations

- No passwords are logged (only length is recorded)
- User IDs are logged for debugging but not sensitive data
- Error messages balance user experience with debugging needs
- Production debug info is behind environment checks

## Monitoring and Maintenance

- All logs use structured JSON format for easy parsing
- Error categorization enables automated monitoring
- Environment-specific behavior allows different handling per deployment
- Debug endpoint provides runtime environment verification

This enhanced error handling system provides the detailed information needed to diagnose login failures in Vercel deployments while maintaining security and user experience standards.