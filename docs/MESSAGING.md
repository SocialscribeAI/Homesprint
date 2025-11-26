# Messaging System

## Overview
The Messaging system enables secure, real-time communication between property seekers and listers. It supports threaded conversations, file attachments, read receipts, and integrates with the broader platform workflow for applications and viewings.

## Core Components

### 1. Message Architecture

#### Thread Model
```typescript
interface Thread {
  id: string;
  participants: string[];     // User IDs involved
  listingId?: string;         // Associated listing (optional)
  applicationId?: string;     // Associated application (optional)
  title: string;              // Auto-generated thread title
  lastMessageAt: Date;        // Last activity timestamp
  isActive: boolean;          // Thread active status
  messageCount: number;       // Total messages in thread
  unreadCount: { [userId: string]: number }; // Unread per user
}
```

#### Message Model
```typescript
interface Message {
  id: string;
  threadId: string;
  senderId: string;
  body: string;               // Message content (text/markdown)
  attachments: Attachment[];  // File attachments
  sentAt: Date;               // Message timestamp
  readAt?: { [userId: string]: Date }; // Read receipts
  editedAt?: Date;           // Edit timestamp
  replyToId?: string;        // Reply reference
  isSystemMessage: boolean;  // Automated messages
}
```

#### Attachment Model
```typescript
interface Attachment {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;              // File size in bytes
  url: string;              // Signed download URL
  thumbnailUrl?: string;    // Preview for images
  uploadedAt: Date;
}
```

### 2. Real-time Communication

#### WebSocket Implementation
- **Connection Management**: Persistent WebSocket connections with reconnection
- **Message Broadcasting**: Real-time message delivery to all thread participants
- **Presence Indicators**: Online/offline status and typing indicators
- **Connection Pooling**: Efficient connection management for scale

#### Real-time Events
```
message.sent          # New message in thread
message.read          # Message marked as read
user.typing           # User started typing
user.online          # User came online
thread.updated       # Thread metadata changed
```

### 3. Message Templates & Automation

#### System Messages
- **Application Received**: Auto-generated when seeker applies
- **Viewing Scheduled**: Confirmation of viewing appointment
- **Listing Filled**: Notification when property is rented
- **Profile Updates**: Changes to user profiles or listings

#### Automated Responses
- **Initial Contact**: Suggested opening messages
- **Follow-up Reminders**: After periods of inactivity
- **Viewing Confirmations**: Automated booking confirmations
- **Deadline Alerts**: Upcoming viewing or application deadlines

### 4. Content Moderation

#### Message Filtering
- **Spam Detection**: Automated spam and abuse detection
- **Content Moderation**: Inappropriate content flagging
- **Link Validation**: Malicious link detection
- **Attachment Scanning**: Virus and malware checking

#### Moderation Actions
- **Message Hiding**: Hide inappropriate messages
- **User Warnings**: Automated warnings for policy violations
- **Thread Suspension**: Temporary communication restrictions
- **Account Actions**: Escalation to account-level restrictions

## API Endpoints

### Thread Management
```
GET    /api/threads              # List user's threads
GET    /api/threads/:id          # Get thread details
POST   /api/threads              # Create new thread
PUT    /api/threads/:id          # Update thread (rename, archive)
DELETE /api/threads/:id          # Delete thread (soft delete)
```

### Message Operations
```
GET    /api/threads/:id/messages # Get messages in thread
POST   /api/threads/:id/messages # Send new message
PUT    /api/messages/:id         # Edit message
DELETE /api/messages/:id         # Delete message
POST   /api/messages/:id/read    # Mark message as read
```

### Attachment Handling
```
POST   /api/messages/attachments # Upload attachment
GET    /api/attachments/:id      # Get attachment (signed URL)
DELETE /api/attachments/:id      # Delete attachment
```

### Real-time Connection
```
GET    /api/websocket            # WebSocket connection endpoint
POST   /api/presence             # Update user presence
GET    /api/presence             # Get online users
```

## Database Schema

### Thread Model
```prisma
model Thread {
  id            String    @id @default(cuid())
  participants  String[]  // Array of user IDs
  listingId     String?
  applicationId String?

  title         String
  lastMessageAt DateTime  @default(now())
  isActive      Boolean   @default(true)
  messageCount  Int       @default(0)
  unreadCount   Json      @default("{}")

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  Messages      Message[]
  Listing       Listing?  @relation(fields: [listingId], references: [id])
  Application   Application? @relation(fields: [applicationId], references: [id])

  @@index([participants])
  @@index([lastMessageAt])
  @@index([isActive])
}
```

### Message Model
```prisma
model Message {
  id              String    @id @default(cuid())
  threadId        String
  thread          Thread    @relation(fields: [threadId], references: [id], onDelete: Cascade)

  senderId        String
  sender          User      @relation(fields: [senderId], references: [id])

  body            String
  attachments     Json      @default("[]")  // Array of attachment objects
  sentAt          DateTime  @default(now())
  readAt          Json?     // Read receipts per user
  editedAt        DateTime?
  replyToId       String?
  isSystemMessage Boolean   @default(false)

  @@index([threadId, sentAt])
  @@index([senderId])
}
```

## Implementation Details

### Real-time Infrastructure

#### WebSocket Server Setup
```typescript
// Socket.IO configuration
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"]
  },
  transports: ['websocket', 'polling']
});

// Connection handling
io.on('connection', (socket) => {
  const userId = socket.handshake.auth.userId;

  // Join user-specific room
  socket.join(`user:${userId}`);

  // Join active thread rooms
  const activeThreads = await getUserActiveThreads(userId);
  activeThreads.forEach(thread => {
    socket.join(`thread:${thread.id}`);
  });

  // Handle message sending
  socket.on('message:send', async (data) => {
    const message = await createMessage(data);
    io.to(`thread:${data.threadId}`).emit('message:new', message);
  });
});
```

#### Message Encryption
- **End-to-End**: Optional E2E encryption for sensitive conversations
- **At-Rest**: Database-level encryption for message content
- **In-Transit**: TLS encryption for all WebSocket connections
- **Attachment Security**: Signed URLs with expiration and access control

### Attachment Processing

#### File Upload Pipeline
1. **Client Upload**: Direct to S3/R2 with presigned URLs
2. **Virus Scanning**: ClamAV integration for malware detection
3. **Content Analysis**: Image recognition and content moderation
4. **Thumbnail Generation**: Automatic thumbnail creation for images
5. **Metadata Extraction**: File type, size, and EXIF data extraction

#### Attachment Types Supported
- **Images**: JPEG, PNG, WebP (max 10MB, auto-compression)
- **Documents**: PDF, DOC, DOCX (max 25MB, virus scan required)
- **Other**: Limited support for additional file types

### Message Search & History

#### Full-Text Message Search
```sql
-- Message search index
CREATE INDEX CONCURRENTLY idx_message_body_trgm
ON messages USING gin (body gin_trgm_ops);

-- Thread-based search
SELECT m.* FROM messages m
JOIN threads t ON m.thread_id = t.id
WHERE t.participants @> ARRAY[$1]
AND m.body ILIKE $2
ORDER BY m.sent_at DESC;
```

#### Message History Management
- **Retention Policy**: Messages kept for 2 years
- **Archive Process**: Automatic archiving of old threads
- **Deletion Handling**: Soft deletes with recovery period
- **Export Functionality**: User data export including messages

## Error Handling

### Connection Errors
- `WEBSOCKET_DISCONNECTED`: Connection lost, auto-reconnection
- `AUTHENTICATION_FAILED`: Invalid connection credentials
- `RATE_LIMITED`: Too many connection attempts

### Message Errors
- `MESSAGE_TOO_LONG`: Exceeds character limit (2000 chars)
- `ATTACHMENT_TOO_LARGE`: File size exceeds limits
- `INVALID_FILE_TYPE`: Unsupported file format
- `MODERATION_BLOCKED`: Message flagged by content filters

### Thread Errors
- `THREAD_NOT_FOUND`: Invalid thread ID
- `PERMISSION_DENIED`: User not in thread participants
- `THREAD_LOCKED`: Thread frozen due to moderation

## Security Considerations

### Authentication & Authorization
- **Connection Auth**: JWT validation on WebSocket handshake
- **Message Auth**: Sender verification for each message
- **Thread Access**: Participant validation for thread operations
- **Rate Limiting**: Message sending and connection limits

### Content Security
- **XSS Prevention**: HTML sanitization in message content
- **Injection Protection**: Parameterized queries and input validation
- **Attachment Security**: File type validation and virus scanning
- **Link Safety**: Automatic link preview with security checks

### Privacy Protection
- **Message Encryption**: Optional end-to-end encryption
- **Read Receipts**: User-controlled privacy settings
- **Data Retention**: Configurable message retention periods
- **Export Controls**: User data portability compliance

## Integration Points

### Application Workflow Integration
- **Auto-Thread Creation**: New thread on application submission
- **Status Updates**: System messages for application status changes
- **Viewing Coordination**: Integrated viewing scheduling messages
- **Completion Notifications**: Automated completion confirmations

### Notification Integration
- **Push Notifications**: Browser/mobile push for new messages
- **Email Digests**: Daily/weekly message summaries
- **SMS Alerts**: Critical message notifications
- **In-App Notifications**: Real-time notification badges

### Moderation Integration
- **Content Flagging**: Integration with admin moderation queue
- **User Reporting**: Report functionality for inappropriate messages
- **Automated Actions**: Pattern-based moderation responses
- **Escalation Process**: Admin review for complex cases

### Analytics Integration
- **Message Metrics**: Conversation volume and engagement tracking
- **Response Times**: Average response time analytics
- **Conversion Tracking**: Messages leading to viewings/applications
- **User Behavior**: Communication pattern analysis

## Testing Strategy

### Unit Tests
- Message validation and sanitization
- Thread permission checking
- Attachment processing pipeline
- WebSocket connection handling

### Integration Tests
- End-to-end message sending and receiving
- Real-time WebSocket communication
- File upload and attachment handling
- Thread creation and management

### E2E Tests
- Complete conversation flows between users
- Real-time messaging interface
- Attachment upload and viewing
- Mobile messaging experience

### Performance Tests
- Concurrent user messaging load
- Large file attachment handling
- WebSocket connection scaling
- Message search performance
- Database query optimization under load

### Load Testing
- Peak usage scenario simulation
- Message broadcast efficiency
- Attachment upload concurrency
- Connection pool management

