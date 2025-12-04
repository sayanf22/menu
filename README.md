# AddMenu - Digital Menu QR Code Platform

A modern digital menu solution for restaurants with QR code generation, customer feedback, and bell calling features.

**Live:** https://addmenu.in

---

## Features

- **Digital Menu** - Upload menu images and create beautiful digital menus
- **QR Code Generation** - Unique QR codes for each restaurant
- **Dashboard** - Manage menu, view analytics, collect feedback
- **Bell Calling** - Customers can call for service (Basic Plus)
- **Analytics** - Track menu views and engagement
- **Feedback** - Collect customer ratings and comments
- **Social Links** - Display social media profiles

---

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS, shadcn/ui
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **Payments:** Razorpay
- **Hosting:** Cloudflare Pages / Netlify

---

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase and Razorpay credentials

# Start development server
npm run dev

# Build for production
npm run build
```

---

## Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

---

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── dashboard/    # Dashboard-specific components
│   └── ui/           # shadcn/ui components
├── hooks/            # Custom React hooks
├── integrations/     # Supabase client and types
├── lib/              # Utility functions
└── pages/            # Route pages
```

---

## Database Schema

### Tables
- `profiles` - Restaurant profiles
- `menu_images` - Menu image uploads
- `user_subscriptions` - Subscription records
- `subscription_plans` - Available plans
- `payment_transactions` - Payment history
- `feedback` - Customer feedback
- `bell_notifications` - Bell service calls
- `view_logs` - Menu view analytics
- `social_links` - Social media links
- `admin_credentials` - Admin accounts
- `admin_sessions` - Admin sessions
- `admin_audit_log` - Admin action logs

### Key Functions
- `admin_grant_subscription` - Grant subscription to user
- `admin_revoke_subscription` - Revoke subscription
- `check_restaurant_subscription` - Check subscription status
- `check_bell_feature_access` - Check bell feature access
- `check_image_upload_limit` - Check upload limits

---

## Subscription Plans

| Plan | Price | Images | Bell Feature |
|------|-------|--------|--------------|
| Basic | ₹249/mo | 5 | No |
| Basic Plus | ₹369/mo | 10 | Yes |

---

## Admin Dashboard

Access: `/adminlogin`

Features:
- View all users and subscriptions
- Grant/revoke subscriptions
- Enable/disable accounts
- Audit logging

---

## Security

- Row Level Security (RLS) on all tables
- Secure database functions with `SECURITY DEFINER`
- Fixed `search_path` on all functions
- Admin session validation
- Rate limiting on sensitive endpoints
- Input validation and sanitization

---

## Deployment

### Cloudflare Pages
```bash
npm run build
# Deploy dist/ folder
```

### Environment Setup
1. Set environment variables in hosting platform
2. Configure Supabase project URL and keys
3. Set up Razorpay webhook for payment events

---

## Razorpay Integration

### Webhook Events
- `subscription.activated` - Activate subscription
- `subscription.charged` - Renew subscription
- `subscription.cancelled` - Cancel subscription
- `subscription.halted` - Payment failed

### Webhook URL
`https://your-supabase-url/functions/v1/razorpay-webhook`

---

## Support

- **Email:** support@addmenu.in
- **Phone:** +91 700-583-2798
- **WhatsApp:** +91 700-583-2798

---

## Legal

See [POLICIES.md](./POLICIES.md) for:
- Terms and Conditions
- Privacy Policy
- Refund Policy
- Shipping Policy
- Contact Information
- Pricing Details

---

## License

Proprietary - All rights reserved

---

*Built with ❤️ for restaurants*
