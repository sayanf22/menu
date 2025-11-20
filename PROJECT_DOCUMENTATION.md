# AddMenu - Digital Menu QR Code System

## Overview
AddMenu is a complete digital menu solution for restaurants in Tripura. It allows restaurants to create QR code-based menus, manage content, track analytics, and receive customer feedback.

## Features

### For Restaurant Owners
- **Digital Menu Management**: Upload and manage menu images
- **QR Code Generation**: Downloadable QR codes for tables
- **Analytics Dashboard**: Track menu views and engagement
- **Customer Feedback**: Receive and manage customer reviews
- **Social Media Integration**: Link social profiles to menu
- **Restaurant Profile**: Customize restaurant information and logo

### For Admins
- **User Account Management**: Enable/disable restaurant accounts
- **Signup Code System**: Generate and manage signup codes
- **Custom Codes**: Create custom signup codes with configurable usage limits
- **Usage Tracking**: Monitor code usage and account status
- **Email Visibility**: View user emails in admin dashboard

## Tech Stack
- **Frontend**: React + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui components
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **Deployment**: Netlify

## Admin System

### Admin Login
- Secure admin authentication with session management
- Access at `/adminlogin`
- Credentials stored in `admin_credentials` table

### Admin Dashboard Features
1. **User Accounts Tab**
   - View all registered restaurants
   - See email, restaurant name, description, status
   - Enable/disable accounts for payment management
   - Track creation dates

2. **Signup Codes Tab**
   - Generate random codes (auto-generated)
   - Create custom codes (min 6 characters)
   - Set usage limits (1 to unlimited)
   - View usage statistics (X/Y uses)
   - Copy codes to clipboard
   - Delete unused codes

### Creating Admin Account
Run the SQL in `add-admin.sql` to create an admin account.

## Signup Code System

### How It Works
1. Admin generates signup codes with usage limits
2. Users enter code during registration
3. System validates code and checks remaining uses
4. Code usage increments automatically
5. Code becomes invalid when fully used

### Multi-Use Codes
- Codes can be configured for multiple uses
- Usage tracked in real-time
- Atomic operations prevent race conditions
- Remaining uses displayed in admin dashboard

### Test Codes
- **TEST2024**: 10 uses available
- **SAMPLE123456**: Multi-use code
- **HL5FDBOJNJ6**: Single-use code

## Database Structure

### Key Tables
- `profiles`: Restaurant information
- `menu_images`: Menu image storage
- `signup_codes`: Signup code management
- `feedback`: Customer feedback
- `view_logs`: Analytics tracking
- `social_links`: Social media links
- `admin_credentials`: Admin accounts
- `admin_sessions`: Admin session management

### Key Functions
- `admin_get_profiles()`: Get all profiles with emails
- `admin_get_signup_codes()`: Get all signup codes
- `admin_create_signup_code()`: Create new codes
- `admin_delete_signup_code()`: Delete codes
- `admin_update_profile_status()`: Enable/disable accounts
- `use_signup_code()`: Validate and use signup codes
- `create_user_profile()`: Create user profile on signup

## Setup Instructions

### Prerequisites
- Node.js 18+
- Supabase account
- Netlify account (for deployment)

### Local Development
1. Clone the repository
2. Copy `.env.example` to `.env`
3. Add your Supabase credentials
4. Install dependencies: `npm install`
5. Run dev server: `npm run dev`

### Database Setup
1. Create Supabase project
2. Run migrations in `supabase/migrations/` folder in order
3. Create admin account using `add-admin.sql`
4. Deploy Edge Functions if needed

### Environment Variables
```
VITE_SUPABASE_PROJECT_ID=your_project_id
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
```

## Deployment

### Netlify Configuration
- Build command: `npm run build`
- Publish directory: `dist`
- Node version: 18

### Post-Deployment
1. Configure custom domain
2. Set up redirects in `public/_redirects`
3. Configure headers in `public/_headers`
4. Test signup flow with codes
5. Verify admin dashboard access

## Security

### Authentication
- Supabase Auth for user authentication
- Custom admin authentication system
- Session-based admin access
- JWT tokens for API calls

### Row Level Security (RLS)
- All tables have RLS enabled
- Users can only access their own data
- Admin functions use SECURITY DEFINER
- Service role for admin operations

### Signup Codes
- Public validation function (no auth required)
- Row-level locking prevents race conditions
- Usage tracking with atomic operations
- Admin-only code management

## API Endpoints

### Edge Functions
- `validate-signup`: Validate signup codes (legacy, not used)
- `get-client-info`: Get client IP and device info
- `send-approval-email`: Send approval emails
- `process-approval`: Process approval tokens

### RPC Functions
All admin functions require service_role access:
- `admin_get_profiles()`
- `admin_get_signup_codes()`
- `admin_create_signup_code(code_value, max_uses_value)`
- `admin_delete_signup_code(code_id)`
- `admin_update_profile_status(profile_id, is_disabled_value, disabled_by_email)`

Public functions:
- `use_signup_code(code_value)` - Used during signup

## Troubleshooting

### Signup Code Issues
- Ensure `use_signup_code` function has public access
- Check code exists in database
- Verify code hasn't reached max uses
- Check browser console for errors

### Admin Dashboard Issues
- Verify admin session is valid
- Check admin credentials in database
- Ensure RPC functions have proper permissions
- Clear browser cache and cookies

### Database Issues
- Run migrations in correct order
- Check RLS policies are enabled
- Verify function permissions
- Check Supabase logs for errors

## Support
- Email: addmenu.in@gmail.com
- WhatsApp: +91-7005832798

## License
MIT License - See LICENSE file for details
