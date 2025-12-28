# AddMenu - Digital Menu QR Code Platform

A modern digital menu solution for restaurants in India with QR code generation, customer feedback, bell calling, and call service features.

**Live:** https://addmenu.in

---

## 🌟 Features

### Core Features
- **Digital Menu** - Upload menu images and create beautiful digital menus
- **QR Code Generation** - Unique QR codes for each restaurant
- **Drag & Drop Reordering** - Organize menu images in your preferred order
- **Dashboard** - Manage menu, view analytics, collect feedback
- **Analytics** - Track menu views and engagement
- **Feedback System** - Collect customer ratings and comments
- **Social Links** - Display social media profiles (Facebook, Instagram, WhatsApp, etc.)
- **Dark/Light Mode** - Customer-friendly viewing options

### Premium Features
- **Bell Calling Service** - Customers can call for service with table number
- **Call Service** - Direct phone call button for customer inquiries
- **Real-time Notifications** - Instant bell notifications in dashboard
- **Advanced Analytics** - Detailed view statistics and trends

---

## 💰 Pricing Plans

### Basic Plan - ₹249/month (₹2,739/year)
- Digital Menu with QR Code
- 5 Menu Image Uploads
- Basic Analytics
- Customer Feedback
- Social Media Links
- Drag & Drop Image Ordering

### Standard Plan - ₹369/month (₹4,059/year) ⭐ Popular
- Everything in Basic
- 10 Menu Images
- **Bell Calling Feature**
- Priority Support
- Advanced Analytics
- Call Service Feature

### Advanced Plan - ₹599/month (₹6,589/year)
- Menu categories
- 50 menu items
- Toggle availability
- Advanced Bell
- Dark/Light mode
- *Available at [addmenu.site](https://addmenu.site)*

### Premium Plan - ₹999/month (₹10,989/year) 🚀 Best Value
- Everything in Advanced
- Unlimited items
- Order management
- Order notifications
- Priority support
- *Available at [addmenu.site](https://addmenu.site)*

> **Note:** Yearly plans include 1 month FREE (pay for 11 months, get 12 months)

---

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS, shadcn/ui, Framer Motion
- **Backend:** Supabase (PostgreSQL, Auth, Edge Functions)
- **Storage:** Cloudflare R2
- **Payments:** Razorpay
- **Hosting:** Cloudflare Pages

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Start development server
npm run dev

# Build for production
npm run build
```

---

## 🔐 Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
VITE_R2_WORKER_URL=your_r2_worker_url
```

---

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── dashboard/        # Dashboard components (MenuUpload, Settings, etc.)
│   └── ui/               # shadcn/ui components
├── hooks/                # Custom React hooks (useRazorpay, etc.)
├── integrations/         # Supabase client and types
├── lib/                  # Utilities (image compression, R2 upload)
└── pages/                # Route pages
    ├── Index.tsx         # Landing page
    ├── Auth.tsx          # Login/Signup
    ├── Dashboard.tsx     # User dashboard
    ├── MenuView.tsx      # Public menu view
    ├── Pricing.tsx       # Pricing page
    ├── AdminLogin.tsx    # Admin login
    └── AdminDashboard.tsx # Admin panel
```

---

## 🗄️ Database Schema

### Tables
| Table | Description |
|-------|-------------|
| `profiles` | Restaurant profiles with settings |
| `menu_images` | Menu image uploads with ordering |
| `user_subscriptions` | Active subscriptions |
| `subscription_plans` | Available plans |
| `payment_transactions` | Payment history |
| `feedback` | Customer ratings & comments |
| `bell_notifications` | Bell service calls |
| `view_logs` | Menu view analytics |
| `social_links` | Social media links |
| `admin_credentials` | Admin accounts (bcrypt hashed) |
| `admin_sessions` | Admin session tokens |
| `admin_audit_log` | Admin action logs |

### Key Database Functions
- `verify_admin_login` - Secure admin authentication with bcrypt
- `admin_create_user_account` - Create new user accounts
- `admin_delete_user_account` - Delete user and all related data
- `admin_grant_subscription` - Grant subscription to user
- `admin_revoke_subscription` - Revoke subscription
- `check_restaurant_subscription` - Check subscription status
- `check_bell_feature_access` - Check bell feature access
- `check_image_upload_limit` - Check upload limits

---

## 👨‍💼 Admin Dashboard

**Access:** `/adminlogin`

### Features
- View all users and subscriptions
- Create new user accounts
- Delete user accounts (with all data)
- Grant/revoke subscriptions
- Enable/disable accounts
- Audit logging for all actions

### Security
- Bcrypt password hashing (cost factor 12)
- Rate limiting (5 failed attempts = 30 min lockout)
- Session-based authentication
- No passwords exposed in frontend

---

## 🔒 Security Features

- Row Level Security (RLS) on all tables
- Secure database functions with `SECURITY DEFINER`
- Fixed `search_path` on all functions
- Bcrypt password hashing for admin
- Admin session validation
- Rate limiting on sensitive endpoints
- Input validation and sanitization
- HTTPS enforced

---

## 💳 Razorpay Integration

### Supported Payment Methods
- UPI
- Credit/Debit Cards
- Net Banking
- Wallets

### Webhook Events
| Event | Action |
|-------|--------|
| `subscription.activated` | Activate subscription |
| `subscription.charged` | Renew subscription |
| `subscription.cancelled` | Cancel subscription |
| `subscription.halted` | Payment failed |

### Webhook URL
```
https://your-supabase-url/functions/v1/razorpay-webhook
```

---

## 🌐 Deployment

### Cloudflare Pages
```bash
npm run build
# Deploy dist/ folder to Cloudflare Pages
```

### Environment Setup
1. Set environment variables in Cloudflare Pages
2. Configure Supabase project URL and keys
3. Set up Razorpay webhook for payment events
4. Configure Cloudflare R2 for image storage

---

## 📞 Support

| Channel | Contact |
|---------|---------|
| **Email** | support@addmenu.in |
| **Phone** | +91 700-583-2798 |
| **WhatsApp** | +91 700-583-2798 |
| **Website** | https://addmenu.in |

---

## 📍 Service Areas

Currently serving restaurants in **Tripura, India**:
- Agartala
- Khowai
- Belonia
- Dharmanagar
- Udaipur
- Kailashahar
- Ambassa
- Sabroom
- And all other cities in Tripura

---

## 📄 Legal

See [POLICIES.md](./POLICIES.md) for:
- Terms and Conditions
- Privacy Policy
- Refund Policy
- Shipping Policy
- Contact Information

---

## 📝 License

Proprietary - All rights reserved © 2024 AddMenu

---

*Built with ❤️ for restaurants in Tripura*
