# User Management System

## Overview
The User Management system handles user profiles, verification processes, and role-based permissions across the HomeSprint platform. It ensures data integrity, user privacy, and compliance with platform policies.

## Core Components

### 1. User Profile Management

#### Profile Structure
```typescript
interface UserProfile {
  userId: string;
  budgetMin: number;        // Minimum monthly budget (ILS)
  budgetMax: number;        // Maximum monthly budget (ILS)
  moveInEarliest: Date;     // Earliest move-in date
  moveInLatest: Date;       // Latest move-in date
  areas: string[];          // Preferred neighborhoods
  occupancyType: string;    // 'room' | 'apartment'
  lifestyle: LifestylePreferences;
  bio?: string;            // Optional personal description
}
```

#### Lifestyle Preferences
```typescript
interface LifestylePreferences {
  smoking: 'no' | 'occasional' | 'regular';
  pets: 'no' | 'cats' | 'dogs' | 'both';
  guests: 'rarely' | 'occasionally' | 'frequently';
  cleaning: 'very_important' | 'somewhat_important' | 'flexible';
  noise: 'quiet' | 'moderate' | 'lively';
  religion: 'observant' | 'traditional' | 'secular';
}
```

### 2. Verification System

#### Verification Types
- **Phone Verification**: Required for all users (OTP-based)
- **Email Verification**: Optional but recommended
- **ID Verification**: For premium features (future)
- **Lister Verification**: Enhanced checks for listing creation

#### Verification Flags
```json
{
  "phone_verified": true,
  "email_verified": false,
  "id_verified": false,
  "lister_verified": false,
  "premium_badge": false,
  "trusted_seller": false
}
```

### 3. Role-Based Permissions

#### Permission Matrix

| Feature | Seeker | Lister | Admin |
|---------|--------|--------|-------|
| View Listings | ✅ | ✅ | ✅ |
| Create Listings | ❌ | ✅ | ❌ |
| Edit Own Listings | ❌ | ✅ | ❌ |
| Delete Listings | ❌ | ❌ | ✅ |
| View Applications | ❌ | ✅ | ✅ |
| Moderate Content | ❌ | ❌ | ✅ |
| User Management | ❌ | ❌ | ✅ |
| System Analytics | ❌ | ❌ | ✅ |

### 4. Profile Completion System

#### Completeness Scoring
- **Budget Range**: 20 points
- **Move-in Dates**: 15 points
- **Preferred Areas**: 15 points
- **Occupancy Type**: 10 points
- **Lifestyle Preferences**: 20 points
- **Profile Photo**: 10 points
- **Bio/Description**: 10 points

#### Completion Thresholds
- **Basic Profile**: 60% (core matching features)
- **Complete Profile**: 80% (full feature access)
- **Premium Profile**: 100% (enhanced visibility)

## API Endpoints

### Profile Management
```
GET    /api/me/profile          # Get current user profile
PUT    /api/me/profile          # Update profile (budget, dates, areas, etc.)
POST   /api/me/profile/photo    # Upload profile photo
DELETE /api/me/profile          # Delete profile (admin only)
```

### User Management (Admin)
```
GET    /api/admin/users         # List all users with filters
GET    /api/admin/users/:id     # Get user details
PUT    /api/admin/users/:id     # Update user (admin actions)
DELETE /api/admin/users/:id     # Delete user account
POST   /api/admin/verify-user   # Verify user account
```

### Verification
```
POST   /api/auth/verify-email   # Send email verification
GET    /api/auth/verify-email   # Confirm email verification
POST   /api/auth/verify-phone   # Re-verify phone (if needed)
```

## Database Schema

### Profile Model
```prisma
model Profile {
  userId           String  @id
  user             User    @relation(fields: [userId], references: [id])
  budgetMin        Int
  budgetMax        Int
  moveInEarliest   DateTime
  moveInLatest     DateTime
  areas            String[]
  occupancyType    String
  lifestyle        Json
  bio              String?

  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}
```

### Extended User Model
```prisma
model User {
  id             String   @id @default(cuid())
  role           Role
  phone          String   @unique
  email          String?  @unique
  name           String?
  lang           String   @default("en")
  verifiedFlags  Json     @default("{}")
  profileCompleteness Int  @default(0)

  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  Profile        Profile?
  Listings       Listing[]
  Messages       Message[]
  Applications   Application[]
  Threads        Thread[]
  Reports        Report[]
}
```

## Implementation Details

### Profile Validation
- **Budget Range**: Must be positive, min ≤ max, reasonable limits
- **Date Range**: Earliest ≤ latest, not in past
- **Areas**: Valid Jerusalem neighborhoods only
- **Bio Length**: 50-500 characters recommended

### Data Privacy
- **Profile Visibility**: Seekers can hide sensitive preferences
- **Contact Info**: Phone/email only shared after application
- **Data Retention**: Profiles kept for 2 years after inactivity
- **GDPR Compliance**: Right to be forgotten implementation

### User Onboarding Flow

#### Seeker Onboarding (3 Steps)
1. **Budget & Timeline**: Set budget range and move-in dates
2. **Location Preferences**: Select preferred neighborhoods
3. **Lifestyle Match**: Choose lifestyle compatibility preferences

#### Lister Onboarding (2 Steps)
1. **Account Setup**: Basic profile and verification
2. **First Listing**: Guided listing creation process

### Admin Moderation

#### User Actions
- **Warning**: Non-blocking notification for policy violations
- **Suspension**: Temporary account restriction (1-30 days)
- **Termination**: Permanent account closure
- **Verification Revocation**: Remove verified status

#### Audit Trail
- **Action Logging**: All admin actions recorded with timestamps
- **Reason Documentation**: Required explanation for each action
- **Appeal Process**: User ability to contest decisions
- **Data Retention**: Admin logs kept for 7 years

## Error Handling

### Profile Errors
- `PROFILE_INCOMPLETE`: Required fields missing
- `INVALID_BUDGET`: Budget range out of acceptable limits
- `INVALID_DATES`: Move-in dates in past or invalid range
- `UNSUPPORTED_AREA`: Neighborhood not in supported list

### Permission Errors
- `INSUFFICIENT_PERMISSIONS`: User lacks required role
- `ACCOUNT_SUSPENDED`: User account temporarily disabled
- `FEATURE_LOCKED`: Feature requires profile completion

## Security Considerations

### Data Protection
- **Encryption**: Sensitive profile data encrypted at rest
- **Access Control**: Row-level security for profile data
- **Audit Logging**: All profile changes tracked
- **PII Handling**: Personal data minimization

### Fraud Prevention
- **Duplicate Detection**: Multiple accounts from same device
- **Pattern Analysis**: Unusual profile update patterns
- **Verification Requirements**: Enhanced checks for high-value features

## Integration Points

### Frontend Integration
- **Profile Wizard**: Step-by-step onboarding flow
- **Progress Indicators**: Visual completeness tracking
- **Permission Guards**: Feature access based on role/profile status
- **Real-time Updates**: Live profile changes without refresh

### Matching Integration
- **Profile Scoring**: Completeness affects match priority
- **Preference Filtering**: Lifestyle preferences drive matching
- **Compatibility Calculation**: Profile-based compatibility scores

### Notification Integration
- **Profile Reminders**: Incomplete profile notifications
- **Verification Alerts**: Pending verification reminders
- **Admin Alerts**: Suspicious activity notifications

## Testing Strategy

### Unit Tests
- Profile validation logic
- Completeness scoring calculations
- Permission checking functions
- Role-based access control

### Integration Tests
- Profile CRUD operations
- Verification flow end-to-end
- Admin moderation actions
- Data privacy compliance

### E2E Tests
- Complete user onboarding flow
- Profile update and validation
- Role-based feature access
- Admin user management interface

