# Razorpay Recurring Subscription Integration Guide

A comprehensive guide for implementing Razorpay recurring subscriptions with Supabase, including new user registration, existing user subscriptions, plan upgrades, and webhook handling.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Database Schema](#database-schema)
4. [Edge Functions](#edge-functions)
5. [Frontend Implementation](#frontend-implementation)
6. [Webhook Handling](#webhook-handling)
7. [Plan Upgrade Flow](#plan-upgrade-flow)
8. [Security Considerations](#security-considerations)
9. [Testing Checklist](#testing-checklist)

---

## Overview

This integration supports two subscription modes:

### Mode 1: New User Registration with Payment
- User fills registration form → Payment → Account created after successful payment
- Prevents fake accounts (payment required before account creation)
- Uses `pending_registrations` table to store registration data temporarily

### Mode 2: Existing User Subscription/Upgrade
- Logged-in user selects plan → Payment → Subscription activated
- Supports plan upgrades without losing current subscription
- Uses `pending_plan_id` fields for safe upgrade handling

---

## Prerequisites

### Razorpay Setup
1. Create Razorpay account at https://razorpay.com
2. Get API keys from Dashboard → Settings → API Keys
3. Enable Subscriptions in Dashboard → Settings → Product Configuration

### Environment Variables (Supabase Edge Functions)
```
RAZORPAY_KEY_ID=rzp_live_xxxxx (or rzp_test_xxxxx for testing)
RAZORPAY_KEY_SECRET=your_secret_key
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Frontend Environment Variables
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

---

## Database Schema

### 1. subscription_plans Table
Stores available subscription plans.

```sql
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price_monthly INTEGER NOT NULL,  -- Amount in paise (₹249 = 24900)
  price_yearly INTEGER,
  razorpay_plan_id_monthly TEXT,   -- Auto-created on first subscription
  razorpay_plan_id_yearly TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Custom feature flags (add as needed)
  max_images INTEGER DEFAULT 5,
  bell_feature_enabled BOOLEAN DEFAULT false,
  plan_tier INTEGER DEFAULT 1  -- For upgrade comparison
);

-- Enable RLS
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- Anyone can view active plans
CREATE POLICY "Anyone can view active plans" ON subscription_plans
  FOR SELECT USING (is_active = true);
```

### 2. user_subscriptions Table
Tracks user subscription status.

```sql
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES subscription_plans(id),
  razorpay_subscription_id TEXT UNIQUE,
  razorpay_customer_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'active', 'paused', 'cancelled', 'expired', 'halted')),
  billing_cycle TEXT DEFAULT 'monthly'
    CHECK (billing_cycle IN ('monthly', 'yearly')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Pending upgrade fields (CRITICAL for safe upgrades)
  pending_plan_id UUID REFERENCES subscription_plans(id),
  pending_razorpay_subscription_id TEXT,
  pending_billing_cycle TEXT
);

-- Enable RLS
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions" ON user_subscriptions
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- Users can insert own subscriptions
CREATE POLICY "Users can insert own subscriptions" ON user_subscriptions
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

-- Create index for faster lookups
CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_razorpay_id ON user_subscriptions(razorpay_subscription_id);
```

### 3. payment_transactions Table
Records all payment transactions.

```sql
CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  subscription_id UUID REFERENCES user_subscriptions(id),
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT UNIQUE,
  razorpay_signature TEXT,
  amount INTEGER NOT NULL,  -- Amount in paise
  currency TEXT DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'authorized', 'captured', 'failed', 'refunded')),
  payment_method TEXT,
  error_code TEXT,
  error_description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own transactions
CREATE POLICY "Users can view own transactions" ON payment_transactions
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));
```

### 4. pending_registrations Table (For Mode 1)
Temporary storage for registration data before payment.

```sql
CREATE TABLE pending_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,  -- Store temporarily, clear after completion
  restaurant_name TEXT NOT NULL,
  restaurant_description TEXT,
  plan_id TEXT NOT NULL,
  billing_cycle TEXT DEFAULT 'monthly',
  razorpay_subscription_id TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '30 minutes'),
  completed_at TIMESTAMPTZ,
  user_id UUID  -- Set after account creation
);

-- Enable RLS
ALTER TABLE pending_registrations ENABLE ROW LEVEL SECURITY;

-- Only service role can access (via edge functions)
-- No public policies needed
```

### 5. razorpay_webhook_events Table
Stores webhook events for idempotency.

```sql
CREATE TABLE razorpay_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE razorpay_webhook_events ENABLE ROW LEVEL SECURITY;
```

### 6. Helper Functions

```sql
-- Function to get user subscription status (SECURITY DEFINER bypasses RLS)
CREATE OR REPLACE FUNCTION get_user_subscription_status(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_result JSONB;
  v_subscription RECORD;
  v_plan RECORD;
  v_is_active BOOLEAN := false;
BEGIN
  -- Get the latest subscription
  SELECT * INTO v_subscription
  FROM user_subscriptions
  WHERE user_id = p_user_id
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'has_subscription', false,
      'is_active', false,
      'subscription', null,
      'plan', null
    );
  END IF;
  
  -- Get plan details
  SELECT * INTO v_plan
  FROM subscription_plans
  WHERE id = v_subscription.plan_id;
  
  -- Determine if active
  IF v_subscription.status = 'active' THEN
    IF v_subscription.current_period_end IS NULL 
       OR v_subscription.current_period_end > NOW() THEN
      v_is_active := true;
    END IF;
  END IF;
  
  RETURN jsonb_build_object(
    'has_subscription', true,
    'is_active', v_is_active,
    'subscription', to_jsonb(v_subscription),
    'plan', to_jsonb(v_plan)
  );
END;
$$;
```

---

## Edge Functions

### 1. create-registration-subscription (Mode 1: New Users)

Creates a Razorpay subscription for new user registration.

**File:** `supabase/functions/create-registration-subscription/index.ts`

```typescript
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email, password, restaurant_name, restaurant_description, plan_id, billing_cycle } = await req.json();

    // Validate required fields
    if (!email || !password || !restaurant_name || !plan_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate password
    if (password.length < 8) {
      return new Response(
        JSON.stringify({ error: 'Password must be at least 8 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID')!;
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET')!;

    if (!razorpayKeyId || !razorpayKeySecret) {
      return new Response(
        JSON.stringify({ error: 'Payment gateway not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const authHeader = 'Basic ' + btoa(`${razorpayKeyId}:${razorpayKeySecret}`);

    // Delete any existing pending registrations for this email
    await supabase
      .from('pending_registrations')
      .delete()
      .eq('email', normalizedEmail);

    // Get plan details
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', plan_id)
      .single();

    if (planError || !plan) {
      return new Response(
        JSON.stringify({ error: 'Invalid plan selected' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const amount = billing_cycle === 'yearly' ? plan.price_yearly : plan.price_monthly;
    let razorpayPlanId = billing_cycle === 'yearly' 
      ? plan.razorpay_plan_id_yearly 
      : plan.razorpay_plan_id_monthly;

    // Create Razorpay plan if doesn't exist
    if (!razorpayPlanId) {
      const planResponse = await fetch('https://api.razorpay.com/v1/plans', {
        method: 'POST',
        headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          period: billing_cycle === 'yearly' ? 'yearly' : 'monthly',
          interval: 1,
          item: {
            name: `${plan.name} - ${billing_cycle === 'yearly' ? 'Yearly' : 'Monthly'}`,
            amount: amount,
            currency: 'INR',
            description: plan.description || `${plan.name} subscription`,
          },
        }),
      });

      if (!planResponse.ok) {
        const err = await planResponse.json();
        return new Response(
          JSON.stringify({ error: err.error?.description || 'Failed to create plan' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const newPlan = await planResponse.json();
      razorpayPlanId = newPlan.id;

      // Save plan ID to database
      const updateField = billing_cycle === 'yearly' ? 'razorpay_plan_id_yearly' : 'razorpay_plan_id_monthly';
      await supabase
        .from('subscription_plans')
        .update({ [updateField]: razorpayPlanId })
        .eq('id', plan_id);
    }

    // Create Razorpay subscription
    const subscriptionResponse = await fetch('https://api.razorpay.com/v1/subscriptions', {
      method: 'POST',
      headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        plan_id: razorpayPlanId,
        total_count: billing_cycle === 'yearly' ? 10 : 120,
        customer_notify: 1,
        notes: {
          email: normalizedEmail,
          restaurant_name: restaurant_name,
          plan_name: plan.name,
          billing_cycle: billing_cycle,
          registration_type: 'new_account'
        },
      }),
    });

    if (!subscriptionResponse.ok) {
      const err = await subscriptionResponse.json();
      return new Response(
        JSON.stringify({ error: err.error?.description || 'Failed to create subscription' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const subscription = await subscriptionResponse.json();

    // Store pending registration
    await supabase.from('pending_registrations').insert({
      email: normalizedEmail,
      password_hash: password,  // Store temporarily
      restaurant_name: restaurant_name,
      restaurant_description: restaurant_description || null,
      plan_id: plan_id,
      billing_cycle: billing_cycle || 'monthly',
      razorpay_subscription_id: subscription.id,
      status: 'pending',
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString()
    });

    return new Response(JSON.stringify({
      subscription_id: subscription.id,
      key_id: razorpayKeyId,
      amount: amount,
      currency: 'INR',
      plan_name: plan.name,
      email: normalizedEmail,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

### 2. verify-registration-payment (Mode 1: New Users)

Verifies payment and creates user account.

**File:** `supabase/functions/verify-registration-payment/index.ts`

```typescript
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const apiKey = req.headers.get('apikey');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Missing API key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { razorpay_subscription_id, razorpay_payment_id, razorpay_signature, email, password } = await req.json();

    if (!razorpay_subscription_id || !razorpay_payment_id || !razorpay_signature || !email || !password) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID')!;
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET')!;
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // CRITICAL: Verify Razorpay signature
    const encoder = new TextEncoder();
    const data = encoder.encode(razorpay_payment_id + '|' + razorpay_subscription_id);
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(razorpayKeySecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signatureBuffer = await crypto.subtle.sign('HMAC', key, data);
    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    if (expectedSignature !== razorpay_signature) {
      return new Response(
        JSON.stringify({ error: 'Invalid payment signature' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify payment with Razorpay API
    const authHeader = 'Basic ' + btoa(`${razorpayKeyId}:${razorpayKeySecret}`);
    const paymentResponse = await fetch(`https://api.razorpay.com/v1/payments/${razorpay_payment_id}`, {
      headers: { 'Authorization': authHeader },
    });
    
    const paymentData = await paymentResponse.json();
    if (paymentData.status !== 'captured' && paymentData.status !== 'authorized') {
      return new Response(
        JSON.stringify({ error: 'Payment not completed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const normalizedEmail = email.toLowerCase().trim();

    // Get pending registration
    const { data: pendingReg, error: pendingError } = await supabase
      .from('pending_registrations')
      .select('*')
      .eq('razorpay_subscription_id', razorpay_subscription_id)
      .eq('email', normalizedEmail)
      .eq('status', 'pending')
      .single();

    if (pendingError || !pendingReg) {
      return new Response(
        JSON.stringify({ error: 'Registration not found or already completed' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check expiry
    if (new Date(pendingReg.expires_at) < new Date()) {
      await supabase.from('pending_registrations').update({ status: 'expired' }).eq('id', pendingReg.id);
      return new Response(
        JSON.stringify({ error: 'Registration has expired. Please try again.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create user account
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: normalizedEmail,
      password: password,
      email_confirm: true,
      user_metadata: {
        restaurant_name: pendingReg.restaurant_name,
        restaurant_description: pendingReg.restaurant_description
      }
    });

    if (authError) {
      return new Response(
        JSON.stringify({ error: 'Failed to create account: ' + authError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = authData.user.id;

    // Create profile
    await supabase.from('profiles').insert({
      id: userId,
      restaurant_name: pendingReg.restaurant_name,
      restaurant_description: pendingReg.restaurant_description,
    });

    // Get subscription details from Razorpay
    const subResponse = await fetch(`https://api.razorpay.com/v1/subscriptions/${razorpay_subscription_id}`, {
      headers: { 'Authorization': authHeader },
    });
    const subscription = await subResponse.json();

    // Create subscription record
    await supabase.from('user_subscriptions').insert({
      user_id: userId,
      plan_id: pendingReg.plan_id,
      razorpay_subscription_id: razorpay_subscription_id,
      razorpay_customer_id: subscription.customer_id,
      status: 'active',
      billing_cycle: pendingReg.billing_cycle,
      current_period_start: subscription.current_start 
        ? new Date(subscription.current_start * 1000).toISOString() 
        : new Date().toISOString(),
      current_period_end: subscription.current_end 
        ? new Date(subscription.current_end * 1000).toISOString() 
        : null
    });

    // Record payment
    await supabase.from('payment_transactions').insert({
      user_id: userId,
      razorpay_payment_id: razorpay_payment_id,
      amount: paymentData.amount,
      currency: paymentData.currency || 'INR',
      status: 'captured',
      payment_method: paymentData.method
    });

    // Mark registration complete and clear password
    await supabase.from('pending_registrations').update({ 
      status: 'completed',
      completed_at: new Date().toISOString(),
      user_id: userId,
      password_hash: '***CLEARED***'
    }).eq('id', pendingReg.id);

    // Sign in user
    const { data: signInData } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password: password
    });

    return new Response(JSON.stringify({
      success: true,
      user_id: userId,
      session: signInData?.session,
      auto_login: !!signInData?.session
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

### 3. create-razorpay-subscription (Mode 2: Existing Users)

Creates subscription for logged-in users. Handles upgrades safely.

**File:** `supabase/functions/create-razorpay-subscription/index.ts`

```typescript
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // Verify user is authenticated
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { plan_id, billing_cycle = 'monthly' } = await req.json();

    if (!plan_id) {
      return new Response(JSON.stringify({ error: 'Plan ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get plan details
    const { data: plan, error: planError } = await supabaseClient
      .from('subscription_plans')
      .select('*')
      .eq('id', plan_id)
      .eq('is_active', true)
      .single();

    if (planError || !plan) {
      return new Response(JSON.stringify({ error: 'Plan not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID')!;
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET')!;
    const authHeader = 'Basic ' + btoa(`${razorpayKeyId}:${razorpayKeySecret}`);

    // Get or create Razorpay Plan
    let razorpayPlanId = billing_cycle === 'yearly' 
      ? plan.razorpay_plan_id_yearly 
      : plan.razorpay_plan_id_monthly;
    
    if (!razorpayPlanId) {
      const amount = billing_cycle === 'yearly' ? plan.price_yearly : plan.price_monthly;
      
      const planResponse = await fetch('https://api.razorpay.com/v1/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': authHeader },
        body: JSON.stringify({
          period: billing_cycle === 'yearly' ? 'yearly' : 'monthly',
          interval: 1,
          item: {
            name: `${plan.name} - ${billing_cycle === 'yearly' ? 'Yearly' : 'Monthly'}`,
            amount: amount,
            currency: 'INR',
            description: plan.description || `${plan.name} subscription`,
          },
        }),
      });

      if (!planResponse.ok) {
        return new Response(JSON.stringify({ error: 'Failed to create plan' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const razorpayPlan = await planResponse.json();
      razorpayPlanId = razorpayPlan.id;

      // Save plan ID
      const serviceClient = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      );
      const updateField = billing_cycle === 'yearly' ? 'razorpay_plan_id_yearly' : 'razorpay_plan_id_monthly';
      await serviceClient.from('subscription_plans').update({ [updateField]: razorpayPlanId }).eq('id', plan_id);
    }

    // Create Razorpay Subscription
    const subscriptionResponse = await fetch('https://api.razorpay.com/v1/subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': authHeader },
      body: JSON.stringify({
        plan_id: razorpayPlanId,
        total_count: billing_cycle === 'yearly' ? 10 : 120,
        quantity: 1,
        customer_notify: 1,
        notes: {
          user_id: user.id,
          plan_id: plan_id,
          plan_name: plan.name,
          billing_cycle: billing_cycle,
        },
      }),
    });

    if (!subscriptionResponse.ok) {
      return new Response(JSON.stringify({ error: 'Failed to create subscription' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const subscription = await subscriptionResponse.json();

    // Store subscription in database
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Check for existing subscription
    const { data: existingSub } = await serviceClient
      .from('user_subscriptions')
      .select('id, status')
      .eq('user_id', user.id)
      .single();

    if (existingSub) {
      // CRITICAL: Handle upgrades safely
      if (existingSub.status === 'active') {
        // Store pending upgrade - don't touch active subscription!
        await serviceClient.from('user_subscriptions').update({
          pending_plan_id: plan_id,
          pending_razorpay_subscription_id: subscription.id,
          pending_billing_cycle: billing_cycle,
          updated_at: new Date().toISOString(),
        }).eq('id', existingSub.id);
      } else {
        // Not active, safe to update directly
        await serviceClient.from('user_subscriptions').update({
          plan_id: plan_id,
          razorpay_subscription_id: subscription.id,
          status: 'pending',
          billing_cycle: billing_cycle,
          updated_at: new Date().toISOString(),
        }).eq('id', existingSub.id);
      }
    } else {
      // New subscription
      await serviceClient.from('user_subscriptions').insert({
        user_id: user.id,
        plan_id: plan_id,
        razorpay_subscription_id: subscription.id,
        status: 'pending',
        billing_cycle: billing_cycle,
      });
    }

    return new Response(JSON.stringify({
      subscription_id: subscription.id,
      key_id: razorpayKeyId,
      plan_name: plan.name,
      billing_cycle: billing_cycle,
      amount: billing_cycle === 'yearly' ? plan.price_yearly : plan.price_monthly,
      user_email: user.email,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
```

### 4. verify-razorpay-subscription (Mode 2: Existing Users)

Verifies payment and activates subscription. Handles pending upgrades.

**File:** `supabase/functions/verify-razorpay-subscription/index.ts`

```typescript
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "https://deno.land/std@0.177.0/node/crypto.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { razorpay_subscription_id, razorpay_payment_id, razorpay_signature } = await req.json();

    if (!razorpay_subscription_id || !razorpay_payment_id || !razorpay_signature) {
      return new Response(JSON.stringify({ error: 'Missing payment details' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET')!;
    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID')!;

    // Verify signature
    const body = razorpay_payment_id + '|' + razorpay_subscription_id;
    const expectedSignature = createHmac('sha256', razorpayKeySecret).update(body).digest('hex');
    
    if (expectedSignature !== razorpay_signature) {
      return new Response(JSON.stringify({ error: 'Invalid payment signature' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get subscription details from Razorpay
    const authHeader = 'Basic ' + btoa(`${razorpayKeyId}:${razorpayKeySecret}`);
    const subResponse = await fetch(`https://api.razorpay.com/v1/subscriptions/${razorpay_subscription_id}`, {
      headers: { 'Authorization': authHeader },
    });
    const razorpaySub = await subResponse.json();

    const now = new Date();
    const periodEnd = new Date(razorpaySub.current_end * 1000);

    // Get existing subscription
    const { data: existingSub } = await serviceClient
      .from('user_subscriptions')
      .select('id, status, plan_id, pending_plan_id, pending_razorpay_subscription_id, pending_billing_cycle')
      .eq('user_id', user.id)
      .single();

    let updateData: Record<string, any> = {
      status: 'active',
      razorpay_customer_id: razorpaySub.customer_id,
      current_period_start: now.toISOString(),
      current_period_end: periodEnd.toISOString(),
      updated_at: now.toISOString(),
      // Clear pending upgrade fields
      pending_plan_id: null,
      pending_razorpay_subscription_id: null,
      pending_billing_cycle: null,
    };

    // Check if this is a pending upgrade
    if (existingSub?.pending_razorpay_subscription_id === razorpay_subscription_id) {
      // Apply the pending plan upgrade
      updateData.plan_id = existingSub.pending_plan_id;
      updateData.razorpay_subscription_id = razorpay_subscription_id;
      updateData.billing_cycle = existingSub.pending_billing_cycle;
    }

    // Update subscription
    const { data: updatedSub } = await serviceClient
      .from('user_subscriptions')
      .update(updateData)
      .eq('user_id', user.id)
      .select('id, plan_id, billing_cycle')
      .single();

    // Record payment
    if (updatedSub) {
      await serviceClient.from('payment_transactions').insert({
        user_id: user.id,
        subscription_id: updatedSub.id,
        razorpay_payment_id: razorpay_payment_id,
        amount: razorpaySub.plan?.item?.amount || 0,
        currency: 'INR',
        status: 'captured',
        metadata: {
          razorpay_subscription_id: razorpay_subscription_id,
          plan_id: updatedSub.plan_id,
          billing_cycle: updatedSub.billing_cycle,
        },
      });
    }

    // Enable user account (if was disabled)
    await serviceClient.from('profiles').update({
      is_disabled: false,
      disabled_at: null,
      disabled_by: null,
      updated_at: now.toISOString(),
    }).eq('id', user.id);

    return new Response(JSON.stringify({
      success: true,
      message: 'Subscription activated successfully',
      subscription: {
        status: 'active',
        current_period_end: periodEnd.toISOString(),
      },
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
```


### 5. razorpay-webhook (Handles All Webhook Events)

Processes Razorpay webhook events for subscription lifecycle.

**File:** `supabase/functions/razorpay-webhook/index.ts`

```typescript
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-razorpay-signature',
};

async function verifyWebhookSignature(body: string, signature: string, secret: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    return expectedSignature === signature;
  } catch {
    return false;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const webhookSecret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET')!;
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const body = await req.text();
    const signature = req.headers.get('x-razorpay-signature') || '';

    // Verify signature
    const isValid = await verifyWebhookSignature(body, signature, webhookSecret);
    if (!isValid) {
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const event = JSON.parse(body);
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const eventType = event.event;
    const payload = event.payload;
    const eventId = `${eventType}_${payload?.subscription?.entity?.id || payload?.payment?.entity?.id || Date.now()}_${Date.now()}`;

    // Check for duplicate event (idempotency)
    const { data: existingEvent } = await supabase
      .from('razorpay_webhook_events')
      .select('id')
      .eq('event_id', eventId)
      .single();

    if (existingEvent) {
      return new Response(JSON.stringify({ message: 'Event already processed' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Store event
    await supabase.from('razorpay_webhook_events').insert({
      event_id: eventId,
      event_type: eventType,
      payload: event,
      processed: false
    });

    // Handle subscription.activated or subscription.charged
    if (eventType === 'subscription.activated' || eventType === 'subscription.charged') {
      const subscription = payload.subscription?.entity;
      const payment = payload.payment?.entity;
      
      if (subscription) {
        const { data: existingSub } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('razorpay_subscription_id', subscription.id)
          .single();

        if (existingSub) {
          await supabase.from('user_subscriptions').update({
            status: 'active',
            razorpay_customer_id: subscription.customer_id,
            current_period_start: subscription.current_start 
              ? new Date(subscription.current_start * 1000).toISOString() 
              : new Date().toISOString(),
            current_period_end: subscription.current_end 
              ? new Date(subscription.current_end * 1000).toISOString() 
              : null,
            updated_at: new Date().toISOString()
          }).eq('id', existingSub.id);

          // Enable user account
          await supabase.from('profiles').update({ 
            is_disabled: false, 
            disabled_at: null, 
            disabled_by: null 
          }).eq('id', existingSub.user_id);

          // Record payment if present
          if (payment) {
            const { data: existingPayment } = await supabase
              .from('payment_transactions')
              .select('id')
              .eq('razorpay_payment_id', payment.id)
              .single();

            if (!existingPayment) {
              await supabase.from('payment_transactions').insert({
                user_id: existingSub.user_id,
                subscription_id: existingSub.id,
                razorpay_payment_id: payment.id,
                amount: payment.amount,
                currency: payment.currency || 'INR',
                status: 'captured',
                payment_method: payment.method
              });
            }
          }
        }
      }
    }

    // Handle subscription.halted (payment failed multiple times)
    if (eventType === 'subscription.halted') {
      const subscription = payload.subscription?.entity;
      if (subscription) {
        const { data: sub } = await supabase
          .from('user_subscriptions')
          .select('user_id')
          .eq('razorpay_subscription_id', subscription.id)
          .single();

        await supabase.from('user_subscriptions').update({ 
          status: 'halted', 
          updated_at: new Date().toISOString() 
        }).eq('razorpay_subscription_id', subscription.id);

        if (sub) {
          await supabase.from('profiles').update({ 
            is_disabled: true, 
            disabled_at: new Date().toISOString(), 
            disabled_by: 'system' 
          }).eq('id', sub.user_id);
        }
      }
    }

    // Handle subscription.cancelled
    if (eventType === 'subscription.cancelled') {
      const subscription = payload.subscription?.entity;
      if (subscription) {
        const { data: sub } = await supabase
          .from('user_subscriptions')
          .select('user_id')
          .eq('razorpay_subscription_id', subscription.id)
          .single();

        await supabase.from('user_subscriptions').update({ 
          status: 'cancelled', 
          cancelled_at: new Date().toISOString(), 
          updated_at: new Date().toISOString() 
        }).eq('razorpay_subscription_id', subscription.id);

        if (sub) {
          await supabase.from('profiles').update({ 
            is_disabled: true, 
            disabled_at: new Date().toISOString(), 
            disabled_by: 'system' 
          }).eq('id', sub.user_id);
        }
      }
    }

    // Handle subscription.paused
    if (eventType === 'subscription.paused') {
      const subscription = payload.subscription?.entity;
      if (subscription) {
        await supabase.from('user_subscriptions').update({ 
          status: 'paused', 
          updated_at: new Date().toISOString() 
        }).eq('razorpay_subscription_id', subscription.id);
      }
    }

    // Handle subscription.resumed
    if (eventType === 'subscription.resumed') {
      const subscription = payload.subscription?.entity;
      if (subscription) {
        const { data: sub } = await supabase
          .from('user_subscriptions')
          .select('user_id')
          .eq('razorpay_subscription_id', subscription.id)
          .single();

        await supabase.from('user_subscriptions').update({ 
          status: 'active', 
          updated_at: new Date().toISOString() 
        }).eq('razorpay_subscription_id', subscription.id);

        if (sub) {
          await supabase.from('profiles').update({ 
            is_disabled: false, 
            disabled_at: null, 
            disabled_by: null 
          }).eq('id', sub.user_id);
        }
      }
    }

    // Handle payment.failed
    if (eventType === 'payment.failed') {
      const payment = payload.payment?.entity;
      if (payment?.subscription_id) {
        const { data: sub } = await supabase
          .from('user_subscriptions')
          .select('user_id, id')
          .eq('razorpay_subscription_id', payment.subscription_id)
          .single();

        if (sub) {
          await supabase.from('payment_transactions').insert({
            user_id: sub.user_id,
            subscription_id: sub.id,
            razorpay_payment_id: payment.id,
            amount: payment.amount,
            currency: payment.currency || 'INR',
            status: 'failed',
            error_code: payment.error_code,
            error_description: payment.error_description
          });
        }
      }
    }

    // Mark event as processed
    await supabase.from('razorpay_webhook_events').update({ 
      processed: true, 
      processed_at: new Date().toISOString() 
    }).eq('event_id', eventId);

    return new Response(JSON.stringify({ success: true, event: eventType }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
```

---

## Frontend Implementation

### useRazorpay Hook

**File:** `src/hooks/useRazorpay.ts`

```typescript
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RazorpayOptions {
  key: string;
  subscription_id: string;
  name: string;
  description: string;
  prefill: { name: string; email: string };
  theme: { color: string };
  handler: (response: RazorpayResponse) => void;
  modal: { ondismiss: () => void };
}

interface RazorpayInstance {
  on: (event: string, callback: (response: RazorpayErrorResponse) => void) => void;
  open: () => void;
}

interface RazorpayErrorResponse {
  error: { description: string; code?: string };
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_subscription_id: string;
  razorpay_signature: string;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export function useRazorpay() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // MODE 1: New User Registration Payment
  const initiateRegistrationPayment = useCallback(async (
    params: {
      email: string;
      password: string;
      restaurantName: string;
      restaurantDescription?: string;
      planId: string;
      billingCycle: "monthly" | "yearly";
    },
    onSuccess?: (data: any) => void,
    onFailure?: (error: any) => void
  ) => {
    setLoading(true);
    setError(null);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) throw new Error("Failed to load payment gateway");

      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/create-registration-subscription`,
        {
          method: "POST",
          headers: { 
            "Content-Type": "application/json", 
            "apikey": SUPABASE_KEY,
            "Authorization": `Bearer ${SUPABASE_KEY}`
          },
          body: JSON.stringify({
            email: params.email,
            password: params.password,
            restaurant_name: params.restaurantName,
            restaurant_description: params.restaurantDescription || "",
            plan_id: params.planId,
            billing_cycle: params.billingCycle,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok || data.error) throw new Error(data.error || "Failed to create subscription");

      const rzp = new window.Razorpay({
        key: data.key_id,
        subscription_id: data.subscription_id,
        name: "YourAppName",
        description: `${data.plan_name} Plan`,
        prefill: { name: params.restaurantName, email: params.email },
        theme: { color: "#f97316" },
        handler: async (res: RazorpayResponse) => {
          try {
            const verifyResponse = await fetch(
              `${SUPABASE_URL}/functions/v1/verify-registration-payment`,
              {
                method: "POST",
                headers: { 
                  "Content-Type": "application/json", 
                  "apikey": SUPABASE_KEY,
                  "Authorization": `Bearer ${SUPABASE_KEY}`
                },
                body: JSON.stringify({
                  razorpay_subscription_id: res.razorpay_subscription_id,
                  razorpay_payment_id: res.razorpay_payment_id,
                  razorpay_signature: res.razorpay_signature,
                  email: params.email,
                  password: params.password,
                }),
              }
            );
            const verifyData = await verifyResponse.json();
            if (!verifyResponse.ok || verifyData.error) throw new Error(verifyData.error);
            if (verifyData.session) await supabase.auth.setSession(verifyData.session);
            toast.success("Account created!");
            onSuccess?.(verifyData);
          } catch (err: any) {
            toast.error(err.message || "Payment verification failed");
            onFailure?.(err);
          } finally {
            setLoading(false);
          }
        },
        modal: { ondismiss: () => { setLoading(false); toast.info("Payment cancelled"); } },
      });
      rzp.on("payment.failed", (res: RazorpayErrorResponse) => { 
        setLoading(false); 
        toast.error(res.error.description || "Payment failed");
        onFailure?.(res.error); 
      });
      rzp.open();
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
      onFailure?.(err);
      setLoading(false);
    }
  }, []);

  // MODE 2: Existing User Subscription/Upgrade Payment
  const initiatePayment = useCallback(async (
    params: { planId: string; billingCycle: "monthly" | "yearly" },
    onSuccess?: (data: any) => void,
    onFailure?: (error: any) => void
  ) => {
    setLoading(true);
    setError(null);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) throw new Error("Failed to load payment");

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Please login to continue");

      const response = await supabase.functions.invoke("create-razorpay-subscription", {
        body: { plan_id: params.planId, billing_cycle: params.billingCycle },
      });
      if (response.error) throw new Error(response.error.message);
      const data = response.data;

      const rzp = new window.Razorpay({
        key: data.key_id,
        subscription_id: data.subscription_id,
        name: "YourAppName",
        description: `${data.plan_name} Plan`,
        prefill: { name: data.user_name || "", email: data.user_email || "" },
        theme: { color: "#f97316" },
        handler: async (res: RazorpayResponse) => {
          try {
            const verifyRes = await supabase.functions.invoke("verify-razorpay-subscription", {
              body: {
                razorpay_subscription_id: res.razorpay_subscription_id,
                razorpay_payment_id: res.razorpay_payment_id,
                razorpay_signature: res.razorpay_signature,
                plan_id: params.planId,
                billing_cycle: params.billingCycle,
              },
            });
            if (verifyRes.error) throw new Error(verifyRes.error.message);
            toast.success("Subscription activated!");
            onSuccess?.(verifyRes.data);
          } catch (err: any) {
            toast.error(err.message || "Verification failed");
            onFailure?.(err);
          } finally {
            setLoading(false);
          }
        },
        modal: { ondismiss: () => setLoading(false) },
      });
      rzp.on("payment.failed", (res: RazorpayErrorResponse) => { 
        setLoading(false); 
        toast.error(res.error.description || "Payment failed");
        onFailure?.(res.error); 
      });
      rzp.open();
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
      onFailure?.(err);
      setLoading(false);
    }
  }, []);

  return { initiateRegistrationPayment, initiatePayment, loading, error };
}
```

### Usage Examples

**Registration with Payment:**
```tsx
const { initiateRegistrationPayment, loading } = useRazorpay();

const handleRegister = () => {
  initiateRegistrationPayment(
    {
      email: "user@example.com",
      password: "securepassword",
      restaurantName: "My Restaurant",
      planId: "plan-uuid-here",
      billingCycle: "monthly",
    },
    (data) => {
      // Success - user is logged in
      navigate("/dashboard");
    },
    (error) => {
      // Handle error
      console.error(error);
    }
  );
};
```

**Existing User Subscription:**
```tsx
const { initiatePayment, loading } = useRazorpay();

const handleSubscribe = () => {
  initiatePayment(
    { planId: "plan-uuid-here", billingCycle: "monthly" },
    () => {
      toast.success("Subscription activated!");
      window.location.reload();
    },
    (error) => console.error(error)
  );
};
```

---

## Plan Upgrade Flow

### How Upgrades Work Safely

1. **User clicks upgrade** → `create-razorpay-subscription` is called
2. **If user has active subscription:**
   - Stores upgrade info in `pending_plan_id`, `pending_razorpay_subscription_id`, `pending_billing_cycle`
   - Does NOT modify the current active subscription
3. **User completes payment** → `verify-razorpay-subscription` is called
4. **Verification checks if subscription ID matches pending:**
   - If yes: Applies the upgrade (updates `plan_id`, clears pending fields)
   - If no: Normal subscription activation
5. **If user cancels payment:**
   - Active subscription remains unchanged
   - Pending fields can be cleared by cleanup function or overwritten on next upgrade attempt

### Cleanup Stale Pending Upgrades

```sql
CREATE OR REPLACE FUNCTION cleanup_stale_pending_upgrades()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE user_subscriptions
  SET 
    pending_plan_id = NULL,
    pending_razorpay_subscription_id = NULL,
    pending_billing_cycle = NULL,
    updated_at = NOW()
  WHERE 
    pending_plan_id IS NOT NULL
    AND updated_at < NOW() - INTERVAL '24 hours'
    AND status = 'active';
END;
$$;
```

---

## Webhook Configuration

### Razorpay Dashboard Setup

1. Go to Razorpay Dashboard → Settings → Webhooks
2. Add webhook URL: `https://your-project.supabase.co/functions/v1/razorpay-webhook`
3. Select events:
   - `subscription.activated`
   - `subscription.charged`
   - `subscription.pending`
   - `subscription.halted`
   - `subscription.cancelled`
   - `subscription.paused`
   - `subscription.resumed`
   - `payment.failed`
4. Copy the webhook secret and add to Supabase Edge Function secrets

---

## Security Considerations

### 1. Signature Verification
Always verify Razorpay signatures before processing:
```typescript
const body = razorpay_payment_id + '|' + razorpay_subscription_id;
const expectedSignature = createHmac('sha256', secret).update(body).digest('hex');
if (expectedSignature !== razorpay_signature) {
  throw new Error('Invalid signature');
}
```

### 2. Verify Payment with Razorpay API
Don't trust client-side data. Always verify with Razorpay:
```typescript
const response = await fetch(`https://api.razorpay.com/v1/payments/${payment_id}`, {
  headers: { 'Authorization': 'Basic ' + btoa(`${keyId}:${keySecret}`) },
});
const payment = await response.json();
if (payment.status !== 'captured') {
  throw new Error('Payment not completed');
}
```

### 3. Use Service Role Key Only in Edge Functions
Never expose `SUPABASE_SERVICE_ROLE_KEY` to the frontend.

### 4. RLS Policies
Use `(SELECT auth.uid())` instead of `auth.uid()` for better performance:
```sql
CREATE POLICY "Users can view own data" ON table_name
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));
```

### 5. Webhook Idempotency
Store webhook events and check for duplicates before processing.

---

## Testing Checklist

### Mode 1: New User Registration
- [ ] Registration form validation works
- [ ] Razorpay checkout opens
- [ ] Payment success creates account
- [ ] User is auto-logged in after payment
- [ ] Payment cancellation doesn't create account
- [ ] Expired registration shows error

### Mode 2: Existing User Subscription
- [ ] User can select plan and pay
- [ ] Subscription activates after payment
- [ ] Payment cancellation doesn't affect existing subscription

### Plan Upgrades
- [ ] Upgrade from Basic to Plus works
- [ ] Active subscription preserved if upgrade cancelled
- [ ] Pending upgrade fields cleared after successful upgrade

### Webhooks
- [ ] subscription.activated updates status
- [ ] subscription.charged records payment
- [ ] subscription.cancelled disables account
- [ ] subscription.halted disables account
- [ ] payment.failed records failed transaction
- [ ] Duplicate events are ignored

### Edge Cases
- [ ] Network failure during payment
- [ ] User closes browser during payment
- [ ] Multiple rapid payment attempts
- [ ] Webhook arrives before verify call

---

## Troubleshooting

### Common Issues

1. **"Payment gateway not configured"**
   - Check `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in Edge Function secrets

2. **"Invalid signature"**
   - Ensure webhook secret matches Razorpay dashboard
   - Check signature calculation uses correct format

3. **"Registration not found"**
   - Check `pending_registrations` table
   - Verify email matches exactly (case-sensitive)

4. **Subscription not activating**
   - Check webhook is configured correctly
   - Verify webhook URL is accessible
   - Check Edge Function logs for errors

5. **Upgrade not applying**
   - Verify `pending_razorpay_subscription_id` matches
   - Check `verify-razorpay-subscription` logs

---

## Summary

This integration provides:
- ✅ New user registration with payment-first flow
- ✅ Existing user subscription management
- ✅ Safe plan upgrades without losing active subscription
- ✅ Webhook handling for subscription lifecycle
- ✅ Payment verification and security
- ✅ Idempotent webhook processing
- ✅ Automatic account enable/disable based on subscription status
