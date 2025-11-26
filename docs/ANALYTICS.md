# Analytics & Monitoring System

## Overview
The Analytics system provides comprehensive tracking, reporting, and monitoring capabilities for the HomeSprint platform. It integrates with PostHog for user behavior analytics and implements custom metrics for business intelligence.

## Core Components

### 1. Event Tracking System

#### Core Events
```typescript
// User Journey Events
signup_started: { source: string, campaign?: string }
signup_completed: { role: 'seeker' | 'lister', phone_verified: boolean }
profile_completed: { completeness_percentage: number, time_to_complete: number }

// Listing Events
listing_created: { type: 'room' | 'apartment', neighborhood: string, rent: number }
listing_published: { completeness_score: number, photo_count: number }
listing_viewed: { listing_id: string, user_id: string, source: 'search' | 'saved' | 'direct' }

// Search & Matching Events
search_performed: { query?: string, filters: SearchFilters, result_count: number }
match_found: { listing_id: string, compatibility_score: number, reasons: string[] }
application_submitted: { listing_id: string, seeker_id: string, motivation?: string }

// Communication Events
message_sent: { thread_id: string, message_length: number, has_attachments: boolean }
viewing_scheduled: { listing_id: string, proposed_times: number, confirmed_time?: Date }
viewing_completed: { listing_id: string, outcome: 'interested' | 'not_interested' | 'no_show' }

// Business Events
payment_completed: { amount: number, listing_type: string, tier: string }
listing_filled: { listing_id: string, time_to_fill: number, application_count: number }
user_reported: { target_type: string, reason: string, resolved: boolean }
```

### 2. PostHog Integration

#### User Properties
```typescript
interface UserProperties {
  role: 'seeker' | 'lister' | 'admin';
  signup_date: Date;
  phone_verified: boolean;
  email_verified: boolean;
  profile_completeness: number;
  preferred_language: 'en' | 'he';
  total_listings?: number;
  total_applications?: number;
  account_status: 'active' | 'suspended' | 'terminated';
}
```

#### Custom Properties Tracking
- **Geographic Data**: User location, preferred neighborhoods
- **Behavioral Data**: Search patterns, feature usage
- **Business Metrics**: Revenue per user, conversion rates
- **Technical Metrics**: Page load times, error rates

### 3. Performance Monitoring

#### Application Metrics
```typescript
interface AppMetrics {
  // Performance
  page_load_time: number;
  api_response_time: number;
  error_rate: number;

  // User Engagement
  session_duration: number;
  page_views: number;
  feature_usage: Record<string, number>;

  // Business KPIs
  conversion_rate: number;
  user_retention: number;
  revenue_per_user: number;
}
```

#### Real-time Dashboards
- **User Activity**: Live user counts, active sessions
- **System Health**: API response times, error rates
- **Business Metrics**: Revenue, conversion funnels
- **Geographic Distribution**: User locations, market penetration

## API Endpoints

### Analytics Data
```
GET    /api/analytics/events         # Get event data with filters
GET    /api/analytics/users          # User analytics and segmentation
GET    /api/analytics/listings       # Listing performance metrics
GET    /api/analytics/search         # Search and matching analytics

POST   /api/analytics/export         # Export analytics data
GET    /api/analytics/dashboard      # Dashboard configuration
```

### Monitoring
```
GET    /api/monitoring/health        # System health check
GET    /api/monitoring/metrics       # Application metrics
GET    /api/monitoring/errors        # Error tracking and reporting
GET    /api/monitoring/performance   # Performance monitoring data
```

### Admin Analytics
```
GET    /api/admin/analytics/overview  # Platform overview metrics
GET    /api/admin/analytics/users     # User behavior analytics
GET    /api/admin/analytics/revenue   # Revenue and payment analytics
GET    /api/admin/analytics/moderation # Moderation effectiveness metrics
```

## Database Schema

### Analytics Events Model
```prisma
model AnalyticsEvent {
  id          String   @id @default(cuid())
  eventName   String
  userId      String?
  sessionId   String?
  properties  Json     @default("{}")
  timestamp   DateTime @default(now())

  // Denormalized for performance
  userRole    String?
  userLang    String?
  ipAddress   String?
  userAgent   String?

  @@index([eventName, timestamp])
  @@index([userId, timestamp])
  @@index([sessionId])
}
```

### Metrics Aggregation Model
```prisma
model MetricsAggregation {
  id          String   @id @default(cuid())
  metricType  String   // 'daily_active_users', 'conversion_rate', etc.
  value       Float
  dimensions  Json     @default("{}")  // Breakdown dimensions
  date        Date     @unique
  createdAt   DateTime @default(now())

  @@index([metricType, date])
}
```

## Implementation Details

### Event Collection Pipeline
```typescript
class AnalyticsService {
  async trackEvent(eventName: string, properties: Record<string, any>, userId?: string): Promise<void> {
    // PostHog tracking
    if (process.env.POSTHOG_KEY) {
      await posthog.capture({
        distinctId: userId || 'anonymous',
        event: eventName,
        properties: {
          ...properties,
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV,
          platform: 'web'
        }
      });
    }

    // Database storage for custom analytics
    await prisma.analyticsEvent.create({
      data: {
        eventName,
        userId,
        properties,
        userRole: await this.getUserRole(userId),
        userLang: await this.getUserLanguage(userId)
      }
    });

    // Real-time metrics update
    await this.updateRealTimeMetrics(eventName, properties);
  }
}
```

### Metrics Calculation
```typescript
async function calculateConversionRate(timeframe: string): Promise<number> {
  const [applications, viewings] = await Promise.all([
    prisma.analyticsEvent.count({
      where: {
        eventName: 'application_submitted',
        timestamp: { gte: getTimeframeStart(timeframe) }
      }
    }),
    prisma.analyticsEvent.count({
      where: {
        eventName: 'viewing_scheduled',
        timestamp: { gte: getTimeframeStart(timeframe) }
      }
    })
  ]);

  return viewings > 0 ? (applications / viewings) * 100 : 0;
}
```

## Security Considerations

### Data Privacy
- **PII Protection**: Personal data anonymization in analytics
- **Retention Policies**: Configurable data retention periods
- **Access Controls**: Role-based analytics access
- **Data Export**: GDPR-compliant data export capabilities

### Performance Security
- **Rate Limiting**: Analytics endpoint rate limiting
- **Data Validation**: Input validation for tracking events
- **Audit Logging**: Analytics data access logging
- **Encryption**: Sensitive analytics data encryption

## Integration Points

### Frontend Integration
- **Event Tracking**: Page views, user interactions, feature usage
- **User Properties**: Dynamic user property updates
- **A/B Testing**: Experiment tracking and analysis
- **Error Monitoring**: Client-side error tracking

### Backend Integration
- **API Analytics**: Request/response tracking and performance
- **Database Metrics**: Query performance and usage analytics
- **Business Logic**: Conversion funnel and user journey tracking
- **Error Handling**: Server-side error tracking and alerting

### External Services Integration
- **PostHog**: User behavior and product analytics
- **Monitoring Tools**: Application performance monitoring
- **Alert Systems**: Automated alerting for critical metrics
- **Business Intelligence**: Data warehouse integration for advanced analytics

## Testing Strategy

### Unit Tests
- Event tracking functionality
- Metrics calculation accuracy
- Data validation and sanitization
- Privacy compliance checks

### Integration Tests
- End-to-end event tracking flow
- PostHog integration validation
- Real-time metrics updates
- Data export functionality

### E2E Tests
- Complete user journey analytics
- Dashboard data accuracy
- Cross-browser analytics tracking
- Mobile analytics functionality

### Performance Tests
- High-volume event processing
- Concurrent analytics queries
- Database performance under load
- Real-time dashboard responsiveness