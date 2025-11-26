# Scheduling System

## Overview
The Scheduling system manages property viewing appointments between seekers and listers. It provides calendar integration, automated reminders, conflict detection, and seamless coordination through the messaging system.

## Core Components

### 1. Viewing Appointment Management

#### Viewing Model
```typescript
interface Viewing {
  id: string;
  listingId: string;
  seekerId: string;
  listerId: string;          // Derived from listing ownership
  proposedTimes: Date[];     // Multiple time slot options
  confirmedTime?: Date;      // Final confirmed time
  duration: number;          // Meeting duration in minutes (default: 30)
  status: ViewingStatus;     // pending, confirmed, cancelled, completed
  location: ViewingLocation; // physical/virtual/hybrid
  notes?: string;           // Special instructions or requirements
  createdAt: Date;
  updatedAt: Date;
}
```

#### Viewing Status Flow
```
pending → confirmed → completed
    ↓        ↓
cancelled   cancelled
```

#### Viewing Location Types
```typescript
type ViewingLocation =
  | { type: 'physical'; address: string; instructions?: string }
  | { type: 'virtual'; meetingUrl: string; platform: 'zoom' | 'google_meet' | 'teams' }
  | { type: 'hybrid'; physicalAddress: string; virtualUrl: string }
```

### 2. Calendar Integration

#### ICS Calendar Export
- **Automatic Generation**: ICS file creation for confirmed viewings
- **Calendar Platforms**: Google Calendar, Outlook, Apple Calendar support
- **Recurring Events**: Support for recurring viewing slots
- **Time Zone Handling**: Proper timezone conversion and display

#### Calendar Sync Features
- **Availability Checking**: Integration with external calendars
- **Conflict Detection**: Automatic scheduling conflict prevention
- **Free/Busy Status**: Real-time availability updates
- **Meeting Creation**: One-click calendar event creation

### 3. Automated Workflow

#### Proposal Process
1. **Time Slot Selection**: Seeker proposes multiple time options
2. **Availability Check**: System validates lister availability
3. **Notification**: Lister receives viewing proposal via messaging
4. **Response Window**: 24-hour response deadline
5. **Confirmation**: Lister selects preferred time slot
6. **Calendar Integration**: Automatic calendar event creation

#### Reminder System
- **24 Hours Before**: Email and SMS reminder to both parties
- **2 Hours Before**: Final reminder with location details
- **15 Minutes Before**: Push notification for virtual meetings
- **Missed Viewing**: Follow-up communication for no-shows

#### Cancellation Policy
- **Same-Day Cancellation**: Immediate notification to both parties
- **Advance Notice**: 24-hour minimum notice requirement
- **Rescheduling**: Automatic proposal of alternative times
- **Penalty System**: Repeated cancellations trigger warnings

## API Endpoints

### Viewing Management
```
POST   /api/listings/:id/viewings        # Propose viewing times
GET    /api/viewings                    # List user's viewings
GET    /api/viewings/:id                # Get viewing details
PUT    /api/viewings/:id                # Update viewing (confirm/cancel/reschedule)
DELETE /api/viewings/:id                # Cancel viewing

POST   /api/viewings/:id/confirm        # Confirm proposed time
POST   /api/viewings/:id/reschedule     # Propose new times
POST   /api/viewings/:id/complete       # Mark as completed
```

### Calendar Integration
```
GET    /api/calendar/availability       # Check availability
POST   /api/calendar/events             # Create calendar event
GET    /api/calendar/export/:id         # Export viewing as ICS
POST   /api/calendar/sync               # Sync external calendar
```

### Bulk Operations
```
GET    /api/viewings/bulk               # Bulk viewing operations
POST   /api/viewings/bulk/confirm       # Bulk confirm multiple viewings
POST   /api/viewings/bulk/cancel        # Bulk cancel viewings
```

## Database Schema

### Viewing Model
```prisma
model Viewing {
  id            String   @id @default(cuid())
  listingId     String
  listing       Listing  @relation(fields: [listingId], references: [id])

  seekerId      String
  seeker        User     @relation(fields: [seekerId], references: [id])

  listerId      String   // Denormalized for performance
  proposedTimes DateTime[]
  confirmedTime DateTime?
  duration      Int      @default(30)
  status        String   @default("pending")
  location      Json     // Flexible location data
  notes         String?

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([listingId, status])
  @@index([seekerId, status])
  @@index([listerId, status])
  @@index([confirmedTime])
}
```

### Extended Application Model
```prisma
model Application {
  // ... existing fields ...
  viewingRequested Boolean @default(false)
  viewingScheduled  Boolean @default(false)
  viewingCompleted  Boolean @default(false)
  viewingCount      Int     @default(0)
}
```

## Implementation Details

### Time Slot Management

#### Availability Algorithm
```typescript
interface AvailabilitySlot {
  startTime: Date;
  endTime: Date;
  available: boolean;
  conflicts: Viewing[];
}

function calculateAvailability(
  userId: string,
  dateRange: { start: Date; end: Date },
  duration: number
): AvailabilitySlot[] {
  const existingViewings = await getUserViewingsInRange(userId, dateRange);
  const workingHours = getUserWorkingHours(userId); // 9 AM - 6 PM default

  const slots: AvailabilitySlot[] = [];

  // Generate 30-minute slots within working hours
  let currentTime = new Date(dateRange.start);
  while (currentTime < dateRange.end) {
    const slotEnd = new Date(currentTime.getTime() + duration * 60000);

    // Check working hours
    const isWorkingHour = isWithinWorkingHours(currentTime, workingHours);

    // Check conflicts
    const conflicts = existingViewings.filter(viewing =>
      timeSlotsOverlap(currentTime, slotEnd, viewing.confirmedTime, viewing.duration)
    );

    slots.push({
      startTime: currentTime,
      endTime: slotEnd,
      available: isWorkingHour && conflicts.length === 0,
      conflicts
    });

    currentTime = new Date(currentTime.getTime() + 30 * 60000); // Next 30min slot
  }

  return slots;
}
```

#### ICS Generation
```typescript
function generateICS(viewing: Viewing): string {
  const event = {
    start: viewing.confirmedTime,
    end: new Date(viewing.confirmedTime.getTime() + viewing.duration * 60000),
    summary: `Property Viewing - ${viewing.listing.address}`,
    description: `Viewing appointment for ${viewing.listing.address}\n\nNotes: ${viewing.notes || 'N/A'}`,
    location: getViewingLocation(viewing),
    organizer: { name: viewing.lister.name, email: viewing.lister.email },
    attendees: [
      { name: viewing.seeker.name, email: viewing.seeker.email },
      { name: viewing.lister.name, email: viewing.lister.email }
    ]
  };

  return ical.generateICalendar(event);
}
```

### Notification System

#### Automated Communications
- **Proposal Sent**: "New viewing request received"
- **Proposal Accepted**: "Viewing confirmed for [date/time]"
- **24h Reminder**: "Viewing tomorrow at [time]"
- **2h Reminder**: "Viewing in 2 hours"
- **Cancellation**: "Viewing cancelled by [party]"

#### Multi-Channel Delivery
- **In-App**: Real-time notifications in messaging
- **Email**: HTML emails with calendar attachments
- **SMS**: Critical updates and reminders
- **Push**: Mobile push notifications

### Conflict Resolution

#### Automatic Conflict Detection
```typescript
function detectConflicts(viewing: Viewing): Conflict[] {
  const seekerViewings = await getUserViewingsOnDate(viewing.seekerId, viewing.confirmedTime);
  const listerViewings = await getUserViewingsOnDate(viewing.listerId, viewing.confirmedTime);

  const conflicts: Conflict[] = [];

  // Check seeker conflicts
  seekerViewings.forEach(existing => {
    if (timeSlotsOverlap(viewing.confirmedTime, viewing.duration, existing.confirmedTime, existing.duration)) {
      conflicts.push({
        type: 'seeker_conflict',
        existingViewing: existing,
        severity: 'high'
      });
    }
  });

  // Check lister conflicts
  listerViewings.forEach(existing => {
    if (timeSlotsOverlap(viewing.confirmedTime, viewing.duration, existing.confirmedTime, existing.duration)) {
      conflicts.push({
        type: 'lister_conflict',
        existingViewing: existing,
        severity: 'critical'
      });
    }
  });

  return conflicts;
}
```

## Error Handling

### Scheduling Errors
- `TIME_SLOT_UNAVAILABLE`: Requested time already booked
- `CONFLICT_DETECTED`: Scheduling conflict with existing viewing
- `INVALID_TIME_RANGE`: Time outside allowed hours
- `TOO_MANY_PROPOSALS`: Exceeded maximum proposal limit

### Calendar Errors
- `CALENDAR_SYNC_FAILED`: External calendar integration error
- `ICS_GENERATION_FAILED`: Calendar export creation error
- `TIMEZONE_INVALID`: Unsupported timezone specification

### Validation Errors
- `DURATION_INVALID`: Meeting duration outside limits (15-120 min)
- `LOCATION_MISSING`: Required location information missing
- `PARTICIPANT_INVALID`: Invalid participant user ID

## Security Considerations

### Access Control
- **Ownership Verification**: Users can only manage their own viewings
- **Participant Validation**: Only listing owner and applicant can participate
- **Status Transition Rules**: Strict state machine for viewing status changes
- **Audit Logging**: All scheduling actions logged with user attribution

### Data Privacy
- **Contact Information**: Only shared after viewing confirmation
- **Location Privacy**: Address details protected until confirmation
- **Calendar Data**: Minimal personal data in calendar exports
- **Deletion Handling**: Soft deletes with data retention policies

### Rate Limiting
- **Viewing Proposals**: Maximum 5 proposals per day per user
- **Bulk Operations**: Limited batch sizes for performance
- **API Calls**: Rate limiting on scheduling endpoints
- **Calendar Sync**: Limited external calendar API calls

## Integration Points

### Messaging Integration
- **Thread Creation**: Automatic thread creation with viewing proposals
- **Status Updates**: Real-time messaging updates for status changes
- **Reminder Integration**: Coordinated messaging and email reminders
- **Cancellation Communication**: Automated messaging for cancellations

### Calendar Integration
- **Google Calendar**: OAuth integration for availability checking
- **Outlook Calendar**: Microsoft Graph API integration
- **Apple Calendar**: iCloud calendar sync support
- **Third-party Tools**: Zapier/webhook integrations

### Application Workflow
- **Viewing Requests**: Integration with application submission flow
- **Status Tracking**: Application status updates based on viewing outcomes
- **Conversion Metrics**: Viewing-to-application conversion tracking
- **Follow-up Process**: Automated follow-ups after viewings

### Analytics Integration
- **Viewing Metrics**: Success rates, no-show rates, conversion tracking
- **Time Analysis**: Average response times, scheduling efficiency
- **Geographic Insights**: Popular viewing locations and times
- **User Behavior**: Scheduling patterns and preferences

## Testing Strategy

### Unit Tests
- Time slot availability calculations
- Conflict detection algorithms
- ICS calendar generation
- Status transition validation

### Integration Tests
- Complete viewing proposal and confirmation flow
- Calendar export functionality
- Notification system integration
- External calendar API interactions

### E2E Tests
- Full viewing scheduling workflow
- Calendar integration end-to-end
- Mobile viewing management
- Multi-user scheduling conflicts

### Performance Tests
- Large-scale availability checking
- Concurrent viewing scheduling
- Calendar sync performance
- Database query optimization

### Edge Case Testing
- Timezone boundary handling
- Daylight saving time transitions
- International date format support
- Network connectivity issues during scheduling

