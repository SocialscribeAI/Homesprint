# Authentication System

## Overview
HomeSprint implements a secure, role-based authentication system supporting OTP-based login with JWT tokens. The system handles three distinct user roles with different permission levels.

## Core Components

### 1. Authentication Flow
- **OTP Request**: SMS-based one-time password generation
- **OTP Verification**: Token validation and JWT issuance
- **Session Management**: JWT refresh token rotation
- **Logout**: Secure token invalidation

### 2. User Roles & Permissions

#### Admin Role
**Permissions:**
- Full CRUD on all users, listings, and reports
- Content moderation and user verification
- Analytics dashboard access
- Feature placement and boost management

#### Lister Role
**Permissions:**
- Create and manage listings
- Review and accept/reject applicants
- Messaging with seekers
- Schedule viewing appointments

#### Seeker Role
**Permissions:**
- Browse and search listings
- Save favorite listings
- Message listers
- Apply to listings
- Schedule viewings

### 3. Security Features

#### JWT Implementation
- **Access Tokens**: Short-lived (15min) for API access
- **Refresh Tokens**: Longer-lived (7 days) for token rotation
- **Role Claims**: Embedded in JWT payload for authorization

#### OTP Security
- **SMS Delivery**: MessageBird/Twilio integration
- **Rate Limiting**: 5 OTP requests/hour per phone
- **Lockout**: 60s lockout after 5 failed attempts
- **Expiration**: 10-minute OTP validity window

#### Rate Limiting
- **API Level**: 60 requests/minute per IP
- **OTP Level**: Phone number rate limiting
- **Login Attempts**: Progressive lockout for failed auth

## API Endpoints

### Authentication Routes
```
POST /api/auth/otp/request
- Request OTP via SMS
- Body: { phone: string }

POST /api/auth/otp/verify
- Verify OTP and return tokens
- Body: { phone: string, otp: string }
- Returns: { accessToken, refreshToken, user }

POST /api/auth/logout
- Invalidate current session
- Headers: Authorization: Bearer <token>
```

## Database Schema

### User Model
```prisma
model User {
  id             String   @id @default(cuid())
  role           Role     // ADMIN, LISTER, SEEKER
  phone          String   @unique
  email          String?  @unique
  name           String?
  lang           String   @default("en")
  verifiedFlags  Json     @default("{}")
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  Profile        Profile?
  Listings       Listing[]
  Messages       Message[]
  Applications   Application[]
  Threads        Thread[]
}
```

## Implementation Details

### Token Management
- **Access Token**: Contains user ID, role, and expiration
- **Refresh Token**: Stored securely, used for token renewal
- **Blacklisting**: Invalidated tokens tracked for security

### Phone Verification
- **International Format**: E.164 standard validation
- **Carrier Validation**: SMS deliverability checks
- **Duplicate Prevention**: One active OTP per phone at a time

### Session Handling
- **Server-Side**: Row-level security via owner checks
- **Client-Side**: Token storage and automatic refresh
- **Cross-Tab Sync**: Session state synchronization

## Error Handling

### Authentication Errors
- `INVALID_OTP`: Wrong or expired code
- `RATE_LIMITED`: Too many attempts
- `PHONE_BLOCKED`: Suspicious activity detected
- `TOKEN_EXPIRED`: Access token needs refresh

### Validation Rules
- **Phone Format**: Must be valid international number
- **OTP Format**: 6-digit numeric code
- **Role Assignment**: Automatic based on first action

## Security Considerations

### Threat Mitigation
- **Brute Force Protection**: Exponential backoff
- **Token Theft Protection**: Refresh token rotation
- **Session Fixation**: Secure random token generation
- **CSRF Protection**: Stateless JWT implementation

### Audit Logging
- **Login Events**: All authentication attempts logged
- **Role Changes**: Admin role assignments tracked
- **Failed Attempts**: Suspicious activity monitoring

## Integration Points

### Frontend Integration
- **Auth Context**: React context for global auth state
- **Route Protection**: HOC for role-based access
- **Auto Refresh**: Background token renewal

### Backend Integration
- **Middleware**: JWT validation on protected routes
- **Permission Checks**: Role-based authorization
- **Audit Middleware**: Request logging for security

## Testing Strategy

### Unit Tests
- OTP generation and validation
- JWT token creation and parsing
- Rate limiting logic
- Role permission checks

### Integration Tests
- Complete auth flow (request → verify → access)
- Token refresh mechanism
- Multi-device session handling
- Rate limit enforcement

### E2E Tests
- Phone number registration flow
- Role-based feature access
- Session persistence across page reloads
- Logout and re-authentication

