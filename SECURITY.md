# AddMenu Security Implementation

This document outlines the security measures implemented to protect the AddMenu application from common attacks and vulnerabilities.

## Security Measures Implemented

### 1. Database Security (Supabase)

#### Row Level Security (RLS)
- All tables have RLS enabled
- Policies use optimized `(SELECT auth.uid())` pattern for better performance
- Users can only access their own data

#### Function Security
- All database functions use `SET search_path = public` to prevent search path injection attacks
- Functions use `SECURITY DEFINER` where appropriate
- Input validation at database level with CHECK constraints

#### Input Validation Constraints
- Restaurant name: max 200 characters
- Restaurant description: max 2000 characters
- Feedback comment: max 1000 characters
- Customer name: max 100 characters
- Rating: 1-5 only
- URLs: must start with http:// or https://

### 2. Rate Limiting

#### Database-Level Rate Limiting
- `rate_limits` table tracks API requests
- `check_rate_limit()` function enforces limits
- Automatic cleanup of old records

#### Frontend Rate Limiting
- Client-side rate limiting in `src/lib/security.ts`
- Rate limits for:
  - Login: 5 attempts per 5 minutes
  - Signup: 3 attempts per 10 minutes
  - Password reset: 3 attempts per 10 minutes
  - Feedback: 5 per minute
  - Menu upload: 10 per minute

### 3. Brute Force Protection

#### Failed Login Tracking
- `failed_login_attempts` table tracks failed logins
- Automatic blocking after 5 failed attempts
- 30-minute lockout period
- `is_login_blocked()` function checks block status

### 4. XSS Prevention

#### Input Sanitization
- `sanitizeInput()` function escapes HTML entities
- Database-level `sanitize_text()` function
- Content Security Policy headers

### 5. Security Headers

Located in `public/_headers`:

```
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Content-Security-Policy: [configured for Supabase]
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: credentialless
Cross-Origin-Resource-Policy: same-origin
```

### 6. Audit Logging

- `audit_logs` table records security events
- Tracks: login, logout, signup, password reset, profile updates
- 90-day retention policy
- Automatic cleanup function

### 7. Session Security

- Automatic cleanup of expired sessions
- Admin sessions have expiration
- Approval tokens expire after 7 days

## Performance Optimizations

### Database Indexes
- Foreign key indexes for faster joins
- Time-based indexes for analytics queries
- Status indexes for filtering

### RLS Policy Optimization
- Using `(SELECT auth.uid())` instead of `auth.uid()` to prevent re-evaluation per row
- Consolidated policies where possible

## Manual Steps Required

### Enable Leaked Password Protection (Supabase Dashboard)
1. Go to Supabase Dashboard > Authentication > Providers > Email
2. Enable "Prevent use of leaked passwords"
3. This checks passwords against HaveIBeenPwned database

Note: This feature requires Pro Plan or above.

### Recommended Additional Security

1. **Enable MFA**: Consider implementing Multi-Factor Authentication
2. **Regular Audits**: Review audit logs regularly
3. **Update Dependencies**: Keep all npm packages updated
4. **SSL/TLS**: Ensure HTTPS is enforced in production
5. **Backup Strategy**: Implement regular database backups

## Security Functions Reference

| Function | Purpose |
|----------|---------|
| `check_rate_limit()` | Enforce API rate limits |
| `is_login_blocked()` | Check if IP/user is blocked |
| `record_failed_login()` | Log failed login attempt |
| `clear_failed_logins()` | Clear on successful login |
| `log_security_event()` | Record audit log entry |
| `cleanup_expired_sessions()` | Remove old sessions |
| `cleanup_audit_logs()` | Remove old audit logs |
| `sanitize_text()` | Remove dangerous HTML |
| `is_valid_url()` | Validate URL format |
| `is_valid_email()` | Validate email format |

## Frontend Security Utilities

Located in `src/lib/security.ts`:

- `checkRateLimit()` - Client-side rate limiting
- `sanitizeInput()` - XSS prevention
- `isValidUrl()` - URL validation
- `isValidEmail()` - Email validation
- `isValidPhone()` - Phone validation
- `generateSecureToken()` - CSRF token generation
- `hashString()` - SHA-256 hashing
- `getDeviceFingerprint()` - Abuse detection
- `detectBot()` - Bot detection
- `debounce()` / `throttle()` - Request limiting

## Contact

For security concerns, contact: support@addmenu.in
