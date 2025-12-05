/**
 * Security utilities for frontend protection
 * Implements rate limiting, input validation, and XSS prevention
 */

// Rate limiting store (in-memory for client-side)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Client-side rate limiter
 * @param key - Unique identifier for the rate limit (e.g., 'login', 'feedback')
 * @param maxRequests - Maximum requests allowed in the window
 * @param windowMs - Time window in milliseconds
 * @returns boolean - true if request is allowed, false if rate limited
 */
export function checkRateLimit(
  key: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

/**
 * Get remaining requests for a rate limit key
 */
export function getRateLimitRemaining(key: string, maxRequests: number = 10): number {
  const record = rateLimitStore.get(key);
  if (!record || Date.now() > record.resetTime) {
    return maxRequests;
  }
  return Math.max(0, maxRequests - record.count);
}

/**
 * Sanitize text input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .replace(/`/g, '&#x60;')
    .replace(/=/g, '&#x3D;');
}

/**
 * Validate URL format (only allow http/https)
 */
export function isValidUrl(url: string): boolean {
  if (!url || url.trim() === '') return true; // Allow empty
  
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number format (Indian)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(\+91)?[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Generate a secure random string (for CSRF tokens, etc.)
 */
export function generateSecureToken(length: number = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Hash a string using SHA-256 (for fingerprinting, not passwords)
 */
export async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate device fingerprint for abuse detection
 */
export async function getDeviceFingerprint(): Promise<string> {
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency || 'unknown',
    navigator.platform,
  ];
  
  return await hashString(components.join('|'));
}

/**
 * Check if request appears to be from a bot
 */
export function detectBot(): boolean {
  const botPatterns = [
    /bot/i, /crawler/i, /spider/i, /scraper/i,
    /headless/i, /phantom/i, /selenium/i
  ];
  
  const ua = navigator.userAgent;
  return botPatterns.some(pattern => pattern.test(ua));
}

/**
 * Validate input length
 */
export function validateLength(
  input: string,
  minLength: number = 0,
  maxLength: number = 1000
): { valid: boolean; message?: string } {
  if (input.length < minLength) {
    return { valid: false, message: `Minimum ${minLength} characters required` };
  }
  if (input.length > maxLength) {
    return { valid: false, message: `Maximum ${maxLength} characters allowed` };
  }
  return { valid: true };
}

/**
 * Debounce function to prevent rapid-fire requests
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function to limit request frequency
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Content Security Policy nonce generator
let cspNonce: string | null = null;

export function getCSPNonce(): string {
  if (!cspNonce) {
    cspNonce = generateSecureToken(16);
  }
  return cspNonce;
}


/**
 * Reset rate limit for a specific key
 */
export function resetRateLimit(key: string): void {
  rateLimitStore.delete(key);
}

/**
 * Predefined rate limits for common actions
 */
export const RATE_LIMITS = {
  // Auth actions - relaxed for better UX
  login: { maxRequests: 10, windowMs: 300000 }, // 10 per 5 minutes
  signup: { maxRequests: 10, windowMs: 300000 }, // 10 per 5 minutes
  passwordReset: { maxRequests: 5, windowMs: 600000 }, // 5 per 10 minutes
  passwordChange: { maxRequests: 5, windowMs: 600000 }, // 5 per 10 minutes
  
  // User actions - moderate limits
  feedback: { maxRequests: 10, windowMs: 60000 }, // 10 per minute
  menuUpload: { maxRequests: 20, windowMs: 60000 }, // 20 per minute
  profileUpdate: { maxRequests: 20, windowMs: 60000 }, // 20 per minute
  
  // Public actions - relaxed limits
  viewMenu: { maxRequests: 100, windowMs: 60000 }, // 100 per minute
  search: { maxRequests: 30, windowMs: 60000 }, // 30 per minute
} as const;

/**
 * Password strength validation
 * Returns score 0-4 and feedback
 */
export function validatePasswordStrength(password: string): {
  score: number;
  feedback: string[];
  isStrong: boolean;
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) score++;
  else feedback.push("At least 8 characters");

  if (password.length >= 12) score++;

  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  else feedback.push("Mix of uppercase and lowercase");

  if (/\d/.test(password)) score++;
  else feedback.push("At least one number");

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
  else feedback.push("At least one special character");

  // Check for common weak patterns
  const weakPatterns = [
    /^123456/,
    /^password/i,
    /^qwerty/i,
    /^abc123/i,
    /(.)\1{3,}/, // 4+ repeated characters
  ];
  
  if (weakPatterns.some(pattern => pattern.test(password))) {
    score = Math.max(0, score - 2);
    feedback.push("Avoid common patterns");
  }

  return {
    score: Math.min(score, 4),
    feedback,
    isStrong: score >= 3,
  };
}