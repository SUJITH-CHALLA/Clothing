# Transactional Email Strategy (Resend)

## Overview
This document details the transactional emails required for the **Clothify** e-commerce app. All emails will be delivered programmatically using **[Resend](https://resend.com/)**, leveraging React Email for highly stylized, dark-themed HTML email templates matching the Clothify brand aesthetics.

## Email Scenarios & Triggers

### 1. Authentication & Account
- **OTP / Login Link**: 
  - *Trigger*: User attempts to log in or register.
  - *Content*: 6-digit OTP code or an immediate magic link. Minimalist design styling.
- **Welcome / Account Creation**: 
  - *Trigger*: User successfully verifies account for the first time.
  - *Content*: Welcome message, brand ethos introduction, and a small one-time "Welcome" discount code.
- **Account Deletion / Security**: 
  - *Trigger*: A request to change critical account info.

### 2. General E-commerce / Order Flow
- **Order Confirmation (Invoice)**:
  - *Trigger*: Successful Razorpay payment captured.
  - *Content*: Order ID, itemized list of products (with thumbnail images), totals, applied discounts, and shipping address.
- **Shipping Update**:
  - *Trigger*: Admin marks order as "Shipped" from the dashboard.
  - *Content*: Shipment tracking URL/number, estimated delivery date.
- **Out for Delivery**:
  - *Trigger*: Last-mile carrier update.
  - *Content*: Real-time notification that the package is arriving today.
- **Delivery Confirmation**:
  - *Trigger*: Carrier marks order as delivered.
  - *Content*: "Enjoy your gear" message, prompts for leaving a review or tagging the brand on social media (Instagram/X).

### 3. Retention & Conversions
- **Abandoned Cart Reminder**:
  - *Trigger*: User leaves items in the cart without checking out for 2+ hours.
  - *Content*: Dynamic list of the items left behind, emphasizing "Limited Drop" scarcity.
- **Flash Sale / Drop Notification**:
  - *Trigger*: A new "Limited Drop" is activated in the admin panel.
  - *Content*: Marketing blast showcasing the new drops. High-urgency copywriting.
- **Review / Feedback Request**:
  - *Trigger*: 7 days post-delivery.
  - *Content*: Rating prompt, asking for honest reviews of the streetwear materials.

## Technical Implementation Plan
1. **Providers**: Resend SDK (`resend`) + `@react-email/components`.
2. **Setup**: Create an `emails` directory at the project root for `.tsx` email templates.
3. **API Routing**: Integrate standard send events into existing Supabase Webhooks or Next.js server actions (e.g., `app/api/checkout/route.ts` triggering the Order Confirmation).
4. **Environment Variables**:
   - `RESEND_API_KEY`: Secret API key.
   - `SENDER_EMAIL`: Default sender alias (e.g., `drops@clothify.shop`).
