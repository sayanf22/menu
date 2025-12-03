# Razorpay Integration Setup Guide

This guide explains how to set up Razorpay payment gateway for AddMenu.

## Prerequisites

1. Razorpay Account (https://dashboard.razorpay.com)
2. Supabase Project with Edge Functions enabled

## Step 1: Get Razorpay API Keys

1. Go to https://dashboard.razorpay.com/app/keys
2. Generate API Keys (Test mode for development, Live mode for production)
3. Note down:
   - **Key ID**: `rzp_test_xxxxxxxxxxxxx` or `rzp_live_xxxxxxxxxxxxx`
   - **Key Secret**: `xxxxxxxxxxxxxxxxxxxxx`

## Step 2: Set Up Webhook Secret

1. Go to https://dashboard.razorpay.com/app/webhooks
2. Click "Add New Webhook"
3. Set Webhook URL: `https://owibhiiwghyznptfgfcr.supabase.co/functions/v1/razorpay-webhook`
4. Select events:
   - `payment.captured`
   - `payment.failed`
   - `subscription.activated`
   - `subscription.charged`
   - `subscription.cancelled`
   - `subscription.halted`
   - `refund.created`
   - `refund.processed`
5. Copy the **Webhook Secret**

## Step 3: Configure Supabase Edge Function Secrets

Run these commands in your terminal (with Supabase CLI installed):

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref owibhiiwghyznptfgfcr

# Set the secrets
supabase secrets set RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
supabase secrets set RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxx
supabase secrets set RAZORPAY_WEBHOOK_SECRET=xxxxxxxxxxxxxxxxxxxxx
```

Or set them via Supabase Dashboard:
1. Go to https://supabase.com/dashboard/project/owibhiiwghyznptfgfcr/settings/functions
2. Click "Add new secret" for each:
   - `RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`
   - `RAZORPAY_WEBHOOK_SECRET`

## Edge Functions Deployed

The following Edge Functions have been deployed:

1. **create-registration-subscription** - Creates Razorpay subscription for new user registration
2. **verify-registration-payment** - Verifies payment and creates user account
3. **create-razorpay-subscription** - Creates subscription for existing users
4. **verify-razorpay-subscription** - Verifies subscription payment for existing users
5. **razorpay-webhook** - Handles all Razorpay webhook events

## New Onboarding Flow

The registration flow now works as follows:

1. **User enters details**: Restaurant name, email, password
2. **User selects plan**: Basic or Premium (monthly/yearly)
3. **Payment**: Razorpay checkout opens for subscription payment
4. **Account creation**: After successful payment, account is automatically created
5. **Auto-login**: User is automatically signed in and redirected to dashboard

### Key Features:
- **No signup code required** - Payment validates the registration
- **Duplicate prevention** - Same email cannot register twice
- **Secure** - Account only created after successful payment
- **Recurring billing** - Subscriptions auto-renew monthly/yearly

## Database Tables

1. **subscription_plans** - Available subscription plans
2. **user_subscriptions** - User subscription records
3. **payment_transactions** - Payment history
4. **razorpay_webhook_events** - Webhook event log (idempotency)
5. **pending_registrations** - Temporary storage for registration data before payment

## Current Plans (Test Pricing)

- **Basic**: ₹2/month (₹20/year)
- **Premium**: ₹2/month (₹20/year)

*Note: Update prices in `subscription_plans` table for production*

## Testing with Live Keys

Since you're using Live keys, you need to make real payments. For testing:
1. Use a real card with small amounts (₹2)
2. Refund immediately after testing via Razorpay Dashboard
3. Or switch to Test Mode keys for development

### Test Mode Keys
To get Test Mode keys:
1. Go to Razorpay Dashboard
2. Toggle "Test Mode" in the top-right
3. Go to Settings > API Keys
4. Generate Test Mode keys

### Test Card (Test Mode Only)
- Card: `4111 1111 1111 1111`
- Expiry: Any future date
- CVV: Any 3 digits

## Webhook URL

```
https://owibhiiwghyznptfgfcr.supabase.co/functions/v1/razorpay-webhook
```

## IMPORTANT: Disable JWT Verification for Webhook

The webhook function needs JWT verification disabled because Razorpay sends webhooks without JWT tokens.

**To fix webhook 401 errors:**

1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/owibhiiwghyznptfgfcr/functions
2. Click on `razorpay-webhook` function
3. Go to "Settings" tab
4. Toggle OFF "Enforce JWT Verification"
5. Save changes

The webhook uses its own signature verification (HMAC-SHA256) with the `RAZORPAY_WEBHOOK_SECRET` to validate requests from Razorpay.

## Troubleshooting

### Payment fails immediately
- Check if Razorpay keys are correctly set in Supabase secrets
- Verify webhook URL is accessible
- Check Edge Function logs in Supabase Dashboard

### Account not created after payment
- Check `pending_registrations` table for status
- Review Edge Function logs for errors
- Verify webhook is receiving events

### Duplicate subscription error
- User may have already registered with that email
- Check `auth.users` table for existing account

## Cleanup: Unused Edge Functions

The following Edge Functions are no longer needed and can be deleted from Supabase Dashboard:

1. **create-razorpay-order** - Old one-time payment function (replaced by subscription flow)
2. **verify-razorpay-payment** - Old one-time payment verification (replaced by subscription flow)
3. **validate-signup** - Signup code validation (signup codes removed)

To delete:
1. Go to https://supabase.com/dashboard/project/owibhiiwghyznptfgfcr/functions
2. Click on each function above
3. Click "Delete function"

## Support

- Razorpay: https://razorpay.com/support/
- Supabase: https://supabase.com/docs
- AddMenu: support@addmenu.in
