# Admin Moderation System

## Overview
The Admin Moderation system provides comprehensive tools for content moderation, user management, and platform safety. It includes automated detection, manual review queues, audit logging, and escalation workflows to maintain platform integrity.

## Core Components

### 1. Content Moderation Pipeline

#### Automated Detection
- **Spam Detection**: Pattern-based spam and abuse identification
- **Content Analysis**: Text analysis for inappropriate content
- **Image Moderation**: Automated image content detection
- **Behavioral Analysis**: User behavior pattern monitoring

#### Manual Review Queue
```typescript
interface ModerationQueue {
  id: string;
  itemType: 'listing' | 'message' | 'user' | 'application';
  itemId: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  reason: ModerationReason;
  reportedBy?: string;      // User who reported (if applicable)
  assignedTo?: string;      // Admin assigned to review
  status: 'pending' | 'in_review' | 'resolved' | 'escalated';
  createdAt: Date;
  resolvedAt?: Date;
}
```

#### Moderation Reasons
```typescript
type ModerationReason =
  | 'spam'
  | 'inappropriate_content'
  | 'fake_listing'
  | 'harassment'
  | 'scam_suspicion'
  | 'copyright_violation'
  | 'duplicate_content'
  | 'off_platform_sale'
  | 'prohibited_service'
  | 'other';
```

### 2. User Management Tools

#### Account Actions
- **Warning System**: Non-punitive notifications for policy violations
- **Suspension**: Temporary account restrictions (1 day to 30 days)
- **Termination**: Permanent account closure with data retention
- **Verification Revocation**: Removal of verified status and badges

#### User Investigation Tools
- **Activity History**: Complete user action timeline
- **Device Tracking**: Login device and location history
- **Communication Analysis**: Message pattern and content review
- **Network Analysis**: Connection to other flagged accounts

### 3. Reporting System

#### User Reports
```typescript
interface UserReport {
  id: string;
  reporterId: string;
  targetType: 'user' | 'listing' | 'message';
  targetId: string;
  reason: ModerationReason;
  description: string;
  evidence: string[];       // Additional evidence URLs
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  priority: ReportPriority;
  assignedTo?: string;
  createdAt: Date;
  resolvedAt?: Date;
}
```

#### Report Categories
- **Content Violations**: Inappropriate listings or messages
- **User Conduct**: Harassment, spam, or abusive behavior
- **Platform Abuse**: Fake accounts, duplicate listings, scams
- **Technical Issues**: System abuse or security concerns

### 4. Audit & Compliance

#### Audit Logging
- **Action Tracking**: All admin actions logged with timestamps
- **Change History**: Before/after states for data modifications
- **Access Logging**: Admin login and permission usage tracking
- **Export Capabilities**: Audit log export for compliance reviews

#### Compliance Features
- **Data Retention**: Configurable retention periods for different data types
- **Right to Deletion**: User data removal request handling
- **Data Portability**: User data export functionality
- **Privacy Controls**: Data minimization and access controls

## API Endpoints

### Moderation Queue
```
GET    /api/admin/queue              # Get moderation queue
GET    /api/admin/queue/:id          # Get specific queue item
PUT    /api/admin/queue/:id          # Update queue item (assign, resolve)
POST   /api/admin/queue/:id/escalate # Escalate queue item

GET    /api/admin/queue/stats        # Queue statistics
GET    /api/admin/queue/assigned     # Admin's assigned items
```

### User Reports
```
GET    /api/admin/reports            # List user reports
GET    /api/admin/reports/:id        # Get report details
POST   /api/admin/reports/:id/investigate # Start investigation
PUT    /api/admin/reports/:id/resolve # Resolve report
POST   /api/admin/reports/:id/escalate # Escalate report
```

### Content Moderation
```
POST   /api/admin/moderate/listing/:id # Moderate listing
POST   /api/admin/moderate/message/:id # Moderate message
POST   /api/admin/moderate/user/:id    # Moderate user account

GET    /api/admin/moderation/rules    # Get moderation rules
PUT    /api/admin/moderation/rules    # Update moderation rules
```

### User Management
```
GET    /api/admin/users               # List users with filters
GET    /api/admin/users/:id           # Get user details
PUT    /api/admin/users/:id           # Update user (admin actions)
POST   /api/admin/users/:id/warn      # Issue warning
POST   /api/admin/users/:id/suspend   # Suspend account
POST   /api/admin/users/:id/terminate # Terminate account

GET    /api/admin/users/:id/activity  # User activity history
GET    /api/admin/users/:id/reports   # Reports involving user
```

### Audit & Analytics
```
GET    /api/admin/audit               # Audit log entries
GET    /api/admin/analytics           # Moderation analytics
GET    /api/admin/metrics             # Platform health metrics

POST   /api/admin/export/audit        # Export audit logs
POST   /api/admin/export/users        # Export user data
```

## Database Schema

### Moderation Queue Model
```prisma
model ModerationQueue {
  id          String   @id @default(cuid())
  itemType    String   // 'listing' | 'message' | 'user' | 'application'
  itemId      String
  priority    String   @default("medium")
  reason      String
  reportedBy  String?
  assignedTo  String?
  status      String   @default("pending")
  notes       String?
  createdAt   DateTime @default(now())
  resolvedAt  DateTime?
  updatedAt   DateTime @updatedAt

  @@index([status, priority])
  @@index([assignedTo, status])
  @@index([itemType, itemId])
}
```

### User Report Model
```prisma
model UserReport {
  id          String   @id @default(cuid())
  reporterId  String
  reporter    User     @relation(fields: [reporterId], references: [id])

  targetType  String
  targetId    String
  reason      String
  description String
  evidence    String[] @default([])
  status      String   @default("pending")
  priority    String   @default("medium")
  assignedTo  String?
  createdAt   DateTime @default(now())
  resolvedAt  DateTime?
  updatedAt   DateTime @updatedAt

  @@index([status, priority])
  @@index([targetType, targetId])
  @@index([assignedTo])
}
```

### Audit Log Model
```prisma
model AuditLog {
  id          String   @id @default(cuid())
  adminId     String
  admin       User     @relation(fields: [adminId], references: [id])

  action      String   // Action performed
  targetType  String   // Type of target affected
  targetId    String   // ID of affected item
  changes     Json?    // Before/after data
  reason      String?  // Reason for action
  ipAddress   String?
  userAgent   String?
  createdAt   DateTime @default(now())

  @@index([adminId, createdAt])
  @@index([targetType, targetId])
  @@index([action])
}
```

## Implementation Details

### Automated Moderation Engine

#### Content Analysis Pipeline
```typescript
interface ContentAnalysis {
  text: string;
  images?: string[];
  metadata: {
    authorId: string;
    createdAt: Date;
    platform: string;
  };
}

async function analyzeContent(content: ContentAnalysis): Promise<ModerationResult> {
  const results = await Promise.all([
    checkSpam(content.text),
    analyzeSentiment(content.text),
    detectProfanity(content.text),
    content.images ? analyzeImages(content.images) : Promise.resolve([]),
    checkUserHistory(content.metadata.authorId)
  ]);

  const riskScore = calculateRiskScore(results);
  const flags = results.flat().filter(r => r.severity > 0.7);

  return {
    riskScore,
    flags,
    recommendedAction: determineAction(riskScore, flags),
    confidence: calculateConfidence(results)
  };
}
```

#### Queue Prioritization Algorithm
```typescript
function prioritizeQueueItem(item: ModerationQueue): number {
  let priority = 0;

  // Base priority by reason
  const reasonWeights = {
    'scam_suspicion': 100,
    'harassment': 80,
    'fake_listing': 70,
    'inappropriate_content': 50,
    'spam': 30,
    'duplicate_content': 20
  };

  priority += reasonWeights[item.reason] || 10;

  // User history factor
  const userRisk = getUserRiskScore(item.itemId);
  priority += userRisk * 20;

  // Time decay (older items get higher priority)
  const ageHours = (Date.now() - item.createdAt.getTime()) / (1000 * 60 * 60);
  priority += Math.min(ageHours * 5, 50);

  // Report count bonus
  const reportCount = getReportCount(item.itemType, item.itemId);
  priority += reportCount * 10;

  return Math.min(priority, 100);
}
```

### Escalation Workflows

#### Automatic Escalation Rules
- **Critical Issues**: Immediate admin notification
- **Pattern Detection**: Repeated violations trigger investigation
- **High-Risk Users**: Automatic account review
- **Legal Concerns**: Immediate legal team notification

#### Manual Escalation Process
1. **Initial Review**: Queue item assigned to admin
2. **Investigation**: Gather evidence and user history
3. **Decision Making**: Apply appropriate action
4. **Documentation**: Record decision and reasoning
5. **Communication**: Notify affected users (when appropriate)

### User Communication

#### Warning Templates
- **Content Violation**: Clear explanation of policy violation
- **Account Standing**: Impact on account status and features
- **Appeal Process**: How to request review of decision
- **Prevention Tips**: Guidance for future compliance

#### Appeal System
- **Appeal Window**: 14 days to request review
- **Review Process**: Independent admin review
- **Final Decision**: Binding resolution with explanation
- **Pattern Tracking**: Appeal history affects future moderation

## Error Handling

### Moderation Errors
- `QUEUE_ITEM_NOT_FOUND`: Invalid queue item ID
- `PERMISSION_DENIED`: Insufficient admin permissions
- `ACTION_ALREADY_TAKEN`: Item already moderated
- `INVALID_ESCALATION`: Cannot escalate resolved items

### User Management Errors
- `USER_NOT_FOUND`: Invalid user ID
- `ACCOUNT_ALREADY_SUSPENDED`: User already suspended
- `INVALID_SUSPENSION_PERIOD`: Suspension duration out of range

### Report Errors
- `REPORT_ALREADY_EXISTS`: Duplicate report for same item
- `INVALID_REPORT_TARGET`: Target item doesn't exist
- `SELF_REPORT_NOT_ALLOWED`: Users cannot report themselves

## Security Considerations

### Access Control
- **Role-Based Permissions**: Granular admin permission system
- **Action Auditing**: All admin actions logged and monitored
- **Session Security**: Secure admin session management
- **IP Restrictions**: Admin access limited to approved networks

### Data Protection
- **Sensitive Data Handling**: Proper masking of personal information
- **Encryption**: Sensitive moderation data encrypted at rest
- **Retention Policies**: Configurable data retention periods
- **Access Logging**: Comprehensive audit trails

### Platform Safety
- **Rate Limiting**: Protection against abuse of moderation tools
- **Automated Alerts**: Suspicious admin activity detection
- **Backup Systems**: Redundant moderation queue backups
- **Failover Handling**: Graceful degradation during system issues

## Integration Points

### Content Management Integration
- **Real-time Flagging**: Instant content analysis on creation
- **Batch Processing**: Scheduled processing of accumulated content
- **Feedback Loop**: ML model improvement through admin decisions
- **External APIs**: Integration with third-party moderation services

### User Management Integration
- **Account Status Sync**: Real-time account status updates
- **Notification System**: Automated user notifications for actions
- **Profile Updates**: Automatic profile adjustments based on moderation
- **Verification Revocation**: Integration with user verification system

### Analytics Integration
- **Moderation Metrics**: Queue performance and resolution times
- **Trend Analysis**: Platform health and violation patterns
- **Admin Productivity**: Individual and team performance metrics
- **Impact Assessment**: Effectiveness of moderation actions

### Legal & Compliance Integration
- **Data Export**: GDPR-compliant user data export capabilities
- **Audit Reports**: Regular compliance reporting generation
- **Retention Management**: Automated data deletion scheduling
- **Legal Holds**: Preservation of data for legal proceedings

## Testing Strategy

### Unit Tests
- Moderation rule validation
- Queue prioritization algorithms
- Audit logging functionality
- Permission checking logic

### Integration Tests
- Complete moderation workflow
- User report processing
- Admin action execution
- Audit log generation

### E2E Tests
- Admin dashboard functionality
- Content moderation interface
- User report submission flow
- Account suspension workflow

### Security Tests
- Admin access control validation
- Data export security testing
- Audit log integrity checks
- Permission escalation prevention

### Load Testing
- High-volume report processing
- Concurrent admin operations
- Large queue management
- Database performance under load

