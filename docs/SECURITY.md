# Security Implementation

## Overview
HomeSprint implements comprehensive security measures across all layers of the application, from authentication to data protection. Security is built-in by design, not added as an afterthought.

## Core Security Components

### 1. Authentication Security

#### JWT Token Security
```typescript
// Secure JWT configuration
const jwtConfig = {
  secret: process.env.JWT_SECRET,
  expiresIn: '15m',  // Short-lived access tokens
  refreshExpiresIn: '7d',
  algorithm: 'HS256',
  issuer: 'homesprint',
  audience: 'homesprint-api'
};

// Token generation with claims
const generateAccessToken = (user: User) => {
  return jwt.sign({
    sub: user.id,
    role: user.role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (15 * 60), // 15 minutes
    iss: 'homesprint',
    aud: 'homesprint-api'
  }, jwtConfig.secret, { algorithm: 'HS256' });
};
```

#### OTP Security Implementation
```typescript
const otpSecurity = {
  length: 6,
  charset: '0123456789',
  window: 10 * 60 * 1000, // 10 minutes validity
  maxAttempts: 5,
  lockoutDuration: 60 * 60 * 1000, // 1 hour lockout
  rateLimit: {
    window: 60 * 60 * 1000, // 1 hour
    maxRequests: 5
  }
};

// Secure OTP generation
const generateOTP = (): string => {
  const crypto = require('crypto');
  const buffer = crypto.randomBytes(4);
  const otp = (parseInt(buffer.toString('hex'), 16) % 1000000).toString().padStart(6, '0');
  return otp;
};
```

### 2. Input Validation & Sanitization

#### Zod Schema Validation
```typescript
// Comprehensive input validation
const UserInputSchema = z.object({
  phone: z.string()
    .regex(/^\+972\d{9}$/, 'Invalid Israeli phone number')
    .transform(phone => phone.replace(/\s+/g, '')), // Remove spaces

  email: z.string()
    .email('Invalid email format')
    .transform(email => email.toLowerCase().trim()),

  name: z.string()
    .min(2, 'Name too short')
    .max(100, 'Name too long')
    .regex(/^[a-zA-Z\s\u0590-\u05FF]+$/, 'Invalid characters')
    .transform(name => name.trim()),

  bio: z.string()
    .max(500, 'Bio too long')
    .optional()
});

// HTML sanitization for rich content
import DOMPurify from 'dompurify';

const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u'],
    ALLOWED_ATTR: [],
    ALLOW_DATA_ATTR: false
  });
};
```

#### SQL Injection Prevention
```typescript
// Parameterized queries with Prisma
const safeUserLookup = await prisma.user.findUnique({
  where: {
    phone: inputPhone, // Automatically parameterized
  },
});

// Raw query with proper escaping (when necessary)
const safeNeighborhoodSearch = await prisma.$queryRaw`
  SELECT * FROM listings
  WHERE neighborhood = ${neighborhood}
  AND status = 'active'
  LIMIT ${limit}
`;
```

### 3. Rate Limiting & Abuse Prevention

#### Multi-Layer Rate Limiting
```typescript
// Upstash Rate Limiting configuration
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.REDIS_URL,
  token: process.env.REDIS_TOKEN,
});

// OTP rate limiting
export const otpLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 h'), // 5 OTP requests per hour
  analytics: true,
  prefix: 'otp',
});

// API rate limiting
export const apiLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, '1 m'), // 60 requests per minute
  analytics: true,
  prefix: 'api',
});

// File upload rate limiting
export const uploadLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 h'), // 10 uploads per hour
  analytics: true,
  prefix: 'upload',
});
```

#### Automated Threat Detection
```typescript
const threatDetection = {
  // Suspicious patterns
  suspiciousPatterns: [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /eval\(/i,
    /base64,/i
  ],

  // Rate-based detection
  detectBruteForce: (identifier: string, attempts: number): boolean => {
    return attempts > otpSecurity.maxAttempts;
  },

  // Geographic anomalies
  detectAnomaly: (currentLocation: GeoPoint, userHistory: GeoPoint[]): boolean => {
    const distances = userHistory.map(point =>
      calculateDistance(currentLocation, point)
    );
    const avgDistance = distances.reduce((a, b) => a + b, 0) / distances.length;
    return avgDistance > 1000; // More than 1000km from usual locations
  }
};
```

### 4. File Upload Security

#### Image Processing Security
```typescript
const imageSecurity = {
  // File type validation
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  maxSize: 10 * 1024 * 1024, // 10MB
  maxDimensions: { width: 4096, height: 4096 },

  // Virus scanning integration
  virusScan: async (buffer: Buffer): Promise<boolean> => {
    const clamscan = require('clamscan')();
    const result = await clamscan.scanBuffer(buffer);
    return result.isInfected === false;
  },

  // Image processing with security
  processImage: async (inputBuffer: Buffer): Promise<Buffer> => {
    // Validate file type
    const fileType = await fileTypeFromBuffer(inputBuffer);
    if (!imageSecurity.allowedTypes.includes(fileType?.mime || '')) {
      throw new Error('Invalid file type');
    }

    // Scan for viruses
    const isClean = await imageSecurity.virusScan(inputBuffer);
    if (!isClean) {
      throw new Error('File contains malware');
    }

    // Process with Sharp
    const processed = await sharp(inputBuffer)
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85, progressive: true })
      .toBuffer();

    return processed;
  }
};
```

### 5. Data Protection & Privacy

#### Encryption at Rest
```typescript
// Database field encryption
const encryptField = (value: string): string => {
  const algorithm = 'aes-256-gcm';
  const key = crypto.scryptSync(process.env.ENCRYPTION_KEY, 'salt', 32);
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipher(algorithm, key);
  cipher.setAAD(Buffer.from('additional_authenticated_data'));

  let encrypted = cipher.update(value, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return JSON.stringify({
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  });
};

// Secure field decryption
const decryptField = (encryptedData: string): string => {
  const { encrypted, iv, authTag } = JSON.parse(encryptedData);
  const algorithm = 'aes-256-gcm';
  const key = crypto.scryptSync(process.env.ENCRYPTION_KEY, 'salt', 32);

  const decipher = crypto.createDecipher(algorithm, key);
  decipher.setAAD(Buffer.from('additional_authenticated_data'));
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
};
```

#### GDPR Compliance
```typescript
const gdprCompliance = {
  // Data retention policies
  retentionPeriods: {
    user_data: 2 * 365 * 24 * 60 * 60 * 1000, // 2 years
    messages: 2 * 365 * 24 * 60 * 60 * 1000,  // 2 years
    analytics: 1 * 365 * 24 * 60 * 60 * 1000, // 1 year
    audit_logs: 7 * 365 * 24 * 60 * 60 * 1000 // 7 years
  },

  // Right to be forgotten
  deleteUserData: async (userId: string) => {
    // Anonymize personal data
    await prisma.user.update({
      where: { id: userId },
      data: {
        name: '[DELETED]',
        email: null,
        phone: '[DELETED]',
        verifiedFlags: {}
      }
    });

    // Delete associated data
    await prisma.profile.deleteMany({ where: { userId } });
    await prisma.application.deleteMany({ where: { seekerUserId: userId } });
    await prisma.message.updateMany({
      where: { senderId: userId },
      data: { body: '[DELETED]' }
    });
  },

  // Data export
  exportUserData: async (userId: string) => {
    const userData = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        listings: true,
        applications: true,
        messages: true
      }
    });

    return JSON.stringify(userData, null, 2);
  }
};
```

### 6. API Security

#### Request Signing & Verification
```typescript
// HMAC request signing
const signRequest = (payload: string, secret: string): string => {
  return crypto.createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
};

// Request verification middleware
export const verifyRequestSignature = (req: NextRequest): boolean => {
  const signature = req.headers.get('x-signature');
  const timestamp = req.headers.get('x-timestamp');
  const payload = JSON.stringify(req.body);

  // Check timestamp (prevent replay attacks)
  const now = Date.now();
  const requestTime = parseInt(timestamp || '0');
  if (Math.abs(now - requestTime) > 5 * 60 * 1000) { // 5 minutes
    return false;
  }

  const expectedSignature = signRequest(payload + timestamp, process.env.API_SECRET);
  return crypto.timingSafeEqual(
    Buffer.from(signature || ''),
    Buffer.from(expectedSignature)
  );
};
```

#### CORS Configuration
```typescript
// Secure CORS configuration
const corsOptions = {
  origin: (origin: string | undefined) => {
    const allowedOrigins = [
      'https://homesprint.com',
      'https://www.homesprint.com',
      process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : null
    ].filter(Boolean);

    return allowedOrigins.includes(origin || '') || false;
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-signature', 'x-timestamp'],
  maxAge: 86400 // 24 hours
};
```

### 7. Infrastructure Security

#### Environment Security
```bash
# Secure environment variables
export JWT_SECRET="$(openssl rand -hex 32)"
export ENCRYPTION_KEY="$(openssl rand -hex 32)"
export API_SECRET="$(openssl rand -hex 32)"
export DATABASE_URL="postgresql://user:password@host:5432/db?sslmode=require"

# File permissions
chmod 600 .env
chmod 700 ssl/
```

#### Database Security
```sql
-- Create restricted database user
CREATE USER homesprint_app WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE homesprint TO homesprint_app;
GRANT USAGE ON SCHEMA public TO homesprint_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO homesprint_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO homesprint_app;

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

-- Create security policies
CREATE POLICY user_data_policy ON users
FOR ALL USING (id = current_user_id());
```

## Security Monitoring & Incident Response

### Security Event Logging
```typescript
const securityLogger = {
  logSecurityEvent: (event: SecurityEvent) => {
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      type: 'security_event',
      severity: event.severity,
      event: event.type,
      userId: event.userId,
      ipAddress: event.ipAddress,
      details: event.details,
      userAgent: event.userAgent
    }));
  },

  logSuspiciousActivity: (activity: SuspiciousActivity) => {
    // Send to security monitoring system
    securityLogger.logSecurityEvent({
      type: 'suspicious_activity',
      severity: 'high',
      ...activity
    });
  }
};
```

### Automated Alerts
```typescript
const securityAlerts = {
  // Failed login attempts
  alertBruteForce: (userId: string, attempts: number) => {
    if (attempts >= 5) {
      // Send alert to security team
      sendAlert('Brute force attempt detected', {
        userId,
        attempts,
        timestamp: new Date()
      });
    }
  },

  // Unusual data access patterns
  alertAnomalousAccess: (userId: string, pattern: AccessPattern) => {
    if (pattern.isAnomalous) {
      sendAlert('Anomalous access pattern', {
        userId,
        pattern,
        timestamp: new Date()
      });
    }
  }
};
```

## Penetration Testing & Security Audits

### Automated Security Testing
```bash
# OWASP ZAP API scanning
zap-api-scan.py -t http://localhost:3000/api -f openapi

# SQL injection testing
sqlmap -u "http://localhost:3000/api/listings?id=1" --batch

# XSS vulnerability scanning
xsser --url "http://localhost:3000" --auto
```

### Security Headers
```typescript
// Security headers middleware
export const securityHeaders = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
};
```

## Compliance & Regulatory Requirements

### Data Protection Impact Assessment
- **Risk Assessment**: Regular DPIA for new features
- **Privacy by Design**: Security built into all new features
- **Data Minimization**: Only collect necessary user data
- **Purpose Limitation**: Clear data usage policies

### Security Training & Awareness
- **Developer Training**: Security best practices training
- **Incident Response Drills**: Regular security incident simulations
- **Third-party Vendor Assessment**: Security evaluation of all vendors
- **Continuous Monitoring**: 24/7 security monitoring and alerting

## Testing Strategy

### Security Unit Tests
- Input validation testing
- Authentication logic testing
- Authorization rule testing
- Encryption/decryption testing

### Integration Security Tests
- End-to-end authentication flow testing
- API security testing
- Database security testing
- File upload security testing

### Penetration Testing
- Automated vulnerability scanning
- Manual security assessment
- Third-party security audits
- Bug bounty program management

### Compliance Testing
- GDPR compliance verification
- Accessibility security testing
- International standard compliance
- Regulatory requirement validation

