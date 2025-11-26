# Payment System

## Overview
The Payment system handles the finder's fee collection for successful property matches. It integrates with Stripe for secure payment processing, automated fee calculation, and transparent transaction management.

## Core Components

### 1. Finder's Fee Structure

#### Fee Calculation
```typescript
interface FeeStructure {
  baseRate: number;      // Base percentage (e.g., 0.05 for 5%)
  listingTier: 'standard' | 'premium' | 'featured';
  propertyType: 'room' | 'apartment';
  urgencyBonus?: number; // Additional fee for quick matches
  minimumFee: number;    // Minimum fee amount (ILS)
  maximumFee: number;    // Maximum fee cap (ILS)
}

function calculateFinderFee(listingRent: number, tier: string): number {
  const baseRate = 0.05; // 5% base rate
  const tierMultiplier = {
    'standard': 1.0,
    'premium': 1.2,
    'featured': 1.5
  };

  let fee = listingRent * baseRate * tierMultiplier[tier];

  // Apply minimum and maximum caps
  fee = Math.max(fee, 50); // Minimum 50 ILS
  fee = Math.min(fee, 2000); // Maximum 2000 ILS

  return Math.round(fee * 100) / 100; // Round to 2 decimal places
}
```

#### Payment Triggers
- **Application to Viewing**: Fee collected when viewing is scheduled
- **Viewing to Move-in**: Final fee collection upon successful move-in
- **Milestone-Based**: Partial payments at different stages
- **Refund Policy**: Pro-rated refunds for failed matches

### 2. Stripe Integration

#### Payment Flow
```typescript
interface PaymentSession {
  id: string;
  listingId: string;
  seekerId: string;
  listerId: string;
  amount: number;
  currency: 'ils';
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded';
  stripePaymentIntentId: string;
  metadata: {
    matchId: string;
    feeType: 'application' | 'viewing' | 'completion';
  };
}
```

#### Webhook Handling
- **Payment Succeeded**: Update payment status, trigger notifications
- **Payment Failed**: Handle failed payments, retry logic
- **Refund Processed**: Update transaction records
- **Dispute Created**: Admin notification and investigation

### 3. Transaction Management

#### Payment Records
```prisma
model Payment {
  id                    String   @id @default(cuid())
  listingId             String
  listing               Listing  @relation(fields: [listingId], references: [id])

  seekerId              String
  seeker                User     @relation(fields: [seekerId], references: [id])

  listerId              String
  lister                User     @relation(fields: [listerId], references: [id])

  amount                Float
  currency              String   @default("ils")
  status                String
  stripePaymentIntentId String   @unique
  stripeChargeId        String?

  feeType               String   // 'application' | 'viewing' | 'completion'
  matchId               String?  // Associated match/application ID

  createdAt             DateTime @default(now())
  processedAt           DateTime?
  refundedAt            DateTime?

  @@index([listingId, status])
  @@index([seekerId])
  @@index([stripePaymentIntentId])
}
```

## API Endpoints

### Payment Processing
```
POST   /api/payments/create-session    # Create Stripe checkout session
GET    /api/payments/session/:id       # Get payment session status
POST   /api/payments/webhook           # Stripe webhook handler

GET    /api/payments/history           # User's payment history
GET    /api/payments/:id               # Get payment details
```

### Fee Management
```
GET    /api/payments/fee-calculation   # Calculate finder fee
GET    /api/payments/fee-structure     # Get current fee structure
PUT    /api/payments/fee-structure     # Update fee structure (admin)
```

### Refunds & Disputes
```
POST   /api/payments/:id/refund        # Process refund
GET    /api/payments/disputes          # List payment disputes
POST   /api/payments/disputes/:id/resolve # Resolve dispute
```

## Implementation Details

### Stripe Checkout Integration
```typescript
async function createCheckoutSession(paymentData: PaymentData): Promise<Stripe.Checkout.Session> {
  const feeAmount = calculateFinderFee(paymentData.listingRent, paymentData.tier);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'ils',
        product_data: {
          name: `Finder's Fee - ${paymentData.listingAddress}`,
          description: 'Platform fee for successful property match'
        },
        unit_amount: Math.round(feeAmount * 100) // Convert to agorot
      },
      quantity: 1
    }],
    mode: 'payment',
    success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/payment/cancelled`,
    metadata: {
      listingId: paymentData.listingId,
      seekerId: paymentData.seekerId,
      listerId: paymentData.listerId,
      feeType: paymentData.feeType
    }
  });

  // Store session in database for tracking
  await createPaymentRecord({
    ...paymentData,
    stripeSessionId: session.id,
    amount: feeAmount
  });

  return session;
}
```

### Webhook Processing
```typescript
async function handleStripeWebhook(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      await handlePaymentSuccess(session);
      break;

    case 'payment_intent.payment_failed':
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await handlePaymentFailure(paymentIntent);
      break;

    case 'charge.dispute.created':
      const dispute = event.data.object as Stripe.Dispute;
      await handlePaymentDispute(dispute);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
}
```

## Security Considerations

### Payment Security
- **PCI Compliance**: Stripe handles sensitive payment data
- **Webhook Verification**: Signature validation for all webhooks
- **Amount Validation**: Server-side fee calculation and validation
- **Fraud Detection**: Integration with Stripe Radar

### Data Protection
- **Payment Data**: Never stored locally, only Stripe references
- **PII Handling**: Minimal personal data in payment metadata
- **Encryption**: All payment communications over HTTPS
- **Audit Logging**: Complete payment transaction logging

## Error Handling

### Payment Errors
- `PAYMENT_AMOUNT_INVALID`: Fee calculation error
- `STRIPE_SESSION_FAILED`: Checkout session creation failed
- `PAYMENT_TIMEOUT`: Payment processing timeout
- `CURRENCY_NOT_SUPPORTED`: Unsupported currency

### Webhook Errors
- `WEBHOOK_SIGNATURE_INVALID`: Invalid webhook signature
- `WEBHOOK_PROCESSING_FAILED`: Error processing webhook event
- `DUPLICATE_WEBHOOK`: Duplicate webhook event received

## Integration Points

### Application Workflow
- **Fee Preview**: Show estimated fee during application
- **Payment Timing**: Strategic payment collection points
- **Status Updates**: Payment status integration with application flow
- **Refund Automation**: Automatic refunds for failed matches

### Notification Integration
- **Payment Success**: Confirmation emails and in-app notifications
- **Payment Failure**: Clear error messages and retry options
- **Refund Processing**: Refund confirmation and status updates
- **Dispute Alerts**: Admin notifications for payment disputes

### Analytics Integration
- **Revenue Tracking**: Payment volume and success rates
- **Fee Optimization**: A/B testing of fee structures
- **Conversion Analysis**: Payment completion rates by funnel stage
- **Geographic Insights**: Payment patterns by location

## Testing Strategy

### Unit Tests
- Fee calculation algorithms
- Stripe session creation
- Webhook signature validation
- Payment status transitions

### Integration Tests
- Complete payment flow with Stripe test mode
- Webhook processing and database updates
- Refund processing workflow
- Dispute handling scenarios

### E2E Tests
- Full payment checkout flow
- Mobile payment processing
- Cross-browser payment compatibility
- Error recovery scenarios

### Security Tests
- Webhook signature validation
- Payment data exposure prevention
- Rate limiting effectiveness
- Fraud detection accuracy

