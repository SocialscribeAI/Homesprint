# Infrastructure 🏗️

Infrastructure as code and deployment configurations for HomeSprint.

## Overview

This directory contains all infrastructure-related configurations and deployment scripts for the HomeSprint platform. It includes Terraform configurations for cloud resources and Vercel configurations for application deployment.

## Architecture

HomeSprint's infrastructure is designed for:
- **Scalability**: Handle varying traffic loads
- **Reliability**: Minimize downtime and data loss
- **Security**: Protect user data and platform integrity
- **Cost Efficiency**: Optimize resource usage

## Components

### Database (Supabase)

- **PostgreSQL**: Primary database with PostGIS for geospatial data
- **Real-time**: Live subscriptions for messaging and updates
- **Row Level Security**: Automatic data access controls
- **Backup**: Automated daily backups with point-in-time recovery

### Application (Vercel)

- **Edge Functions**: Global CDN deployment
- **Serverless**: Auto-scaling based on demand
- **Image Optimization**: Built-in Next.js image processing
- **Analytics**: Built-in performance monitoring

### Storage (Supabase)

- **File Uploads**: Listing photos and documents
- **CDN**: Global content delivery
- **Access Control**: Authenticated upload/download

## Deployment

### Vercel Deployment

The web application is configured for automatic deployment on Vercel:

#### Environment Variables

Set these in your Vercel project settings:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
JWT_SECRET=generate-a-secure-random-string-here
STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### Build Configuration

```json
{
  "buildCommand": "pnpm build",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "regions": ["fra1", "cdg1"]
}
```

### Database Deployment

#### Supabase Setup

1. Create project on [supabase.com](https://supabase.com)
2. Enable required extensions:
   - `postgis` for geospatial queries
   - `pgcrypto` for UUID generation
3. Configure authentication providers
4. Set up storage buckets for file uploads

#### Migration Strategy

```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types if needed
CREATE TYPE user_role AS ENUM ('SEEKER', 'LISTER', 'ADMIN');
```

## Terraform Configuration

### Planned Infrastructure

The `terraform/` directory will contain configurations for:

#### Variables

```hcl
variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "homesprint"
}

variable "environment" {
  description = "Environment (dev/staging/prod)"
  type        = string
}

variable "region" {
  description = "AWS region"
  type        = string
  default     = "eu-west-1"
}
```

#### Supabase Resources

```hcl
resource "supabase_project" "main" {
  name       = var.project_name
  database_password = var.database_password
  region     = var.region

  auth {
    enable_signup = true
    jwt_secret    = var.jwt_secret
  }
}
```

#### DNS Configuration

```hcl
resource "cloudflare_record" "app" {
  zone_id = var.cloudflare_zone_id
  name    = var.domain_name
  value   = vercel_deployment.app.domains[0]
  type    = "CNAME"
}
```

## Monitoring & Observability

### Vercel Analytics

- **Performance**: Core Web Vitals tracking
- **Errors**: Client-side error monitoring
- **Traffic**: Request volume and geography

### Supabase Monitoring

- **Database Performance**: Query execution times
- **Real-time Metrics**: Connection counts and latency
- **Storage Usage**: File upload/download statistics

### Custom Metrics

```typescript
// Track key business metrics
analytics.track('listing_viewed', {
  listingId: id,
  userId: user.id,
  source: 'search'
})
```

## Security

### Authentication

- **OTP Verification**: Phone number authentication
- **JWT Tokens**: Secure session management
- **Row Level Security**: Database-level access control

### Data Protection

- **Encryption**: Data encrypted at rest and in transit
- **Backup**: Automated daily backups
- **Access Control**: Principle of least privilege

### Compliance

- **GDPR**: User data protection and privacy
- **Data Retention**: Configurable data lifecycle policies

## Development

### Local Development

```bash
# Start local Supabase instance
supabase start

# Reset database
supabase db reset

# Generate types
supabase gen types typescript --local > types/supabase.ts
```

### Testing Infrastructure

```bash
# Run infrastructure tests
cd infra
terraform validate

# Plan infrastructure changes
terraform plan

# Apply changes
terraform apply
```

## Environments

### Development

- **Database**: Local Supabase instance
- **Application**: localhost:3000
- **Features**: All features enabled with debug logging

### Staging

- **Database**: Separate Supabase project
- **Application**: staging.homesprint.com
- **Data**: Anonymized production data

### Production

- **Database**: Production Supabase project
- **Application**: homesprint.com
- **Monitoring**: Full observability stack
- **Backups**: Daily automated backups

## Cost Optimization

### Resource Scaling

- **Serverless**: Pay per request model
- **Database**: Auto-scaling based on load
- **Storage**: Cost-effective object storage

### Monitoring Costs

- **Budgets**: Set spending limits and alerts
- **Optimization**: Regular review of resource usage

## Disaster Recovery

### Backup Strategy

- **Database**: Daily automated backups
- **Application**: Vercel deployment history
- **Storage**: Versioned file storage

### Recovery Procedures

1. **Database Failure**: Restore from latest backup
2. **Application Issues**: Rollback to previous deployment
3. **Data Corruption**: Point-in-time recovery

## Future Infrastructure

### Planned Enhancements

- **Multi-region**: Global deployment for better performance
- **CDN**: Advanced caching strategies
- **Microservices**: Break down into smaller services
- **Event Streaming**: Real-time data processing pipeline
