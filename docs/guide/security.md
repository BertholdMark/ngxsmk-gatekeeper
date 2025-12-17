# Security Features

ngxsmk-gatekeeper provides comprehensive security middleware to protect your Angular application.

## IP Filtering

### IP Whitelisting

Allow requests only from specific IP addresses or CIDR ranges:

```typescript
import { createIPWhitelistMiddleware } from 'ngxsmk-gatekeeper';

const whitelistMiddleware = createIPWhitelistMiddleware({
  allowedIPs: [
    '192.168.1.1',        // Single IP
    '10.0.0.0/8',         // CIDR range
    '172.16.0.0/12'       // Another CIDR range
  ],
  blockMode: 'redirect',
  redirect: '/access-denied'
});

provideGatekeeper({
  middlewares: [whitelistMiddleware]
});
```

### IP Blacklisting

Block specific IP addresses:

```typescript
import { createIPBlacklistMiddleware } from 'ngxsmk-gatekeeper';

const blacklistMiddleware = createIPBlacklistMiddleware({
  blockedIPs: ['1.2.3.4', '5.6.7.8'],
  reason: 'Suspicious activity',
  redirect: '/blocked'
});
```

## CSRF Protection

Protect against Cross-Site Request Forgery attacks:

```typescript
import { createCSRFMiddleware, getCSRFToken } from 'ngxsmk-gatekeeper';

const csrfMiddleware = createCSRFMiddleware({
  tokenHeader: 'X-CSRF-Token',
  cookieName: 'csrf-token',
  protectedMethods: ['POST', 'PUT', 'PATCH', 'DELETE'],
  exemptPaths: ['/api/public']
});

// Server-side: Generate token
const token = getCSRFToken();
// Set in cookie: document.cookie = `csrf-token=${token}`

provideGatekeeper({
  middlewares: [csrfMiddleware]
});
```

## Session Management

Automatic session timeout and renewal:

```typescript
import { createSessionMiddleware } from 'ngxsmk-gatekeeper';

const sessionMiddleware = createSessionMiddleware({
  timeout: 3600, // 1 hour in seconds
  extendOnActivity: true,
  sessionPath: 'session',
  lastActivityPath: 'lastActivity',
  expiresAtPath: 'expiresAt',
  redirect: '/login'
});
```

## API Key Validation

Protect APIs with key validation:

```typescript
import { createAPIKeyMiddleware } from 'ngxsmk-gatekeeper';

const apiKeyMiddleware = createAPIKeyMiddleware({
  headerName: 'X-API-Key',
  queryParamName: 'api_key', // Alternative to header
  validateKey: async (key, context) => {
    // Check key in database
    const isValid = await checkAPIKeyInDatabase(key);
    return isValid;
  },
  rateLimitPerKey: true,
  rateLimitConfig: {
    maxRequests: 1000,
    windowMs: 60000 // 1 minute
  }
});
```

## Account Lockout

Protect against brute force attacks:

```typescript
import { createAccountLockoutMiddleware } from 'ngxsmk-gatekeeper';

const lockoutMiddleware = createAccountLockoutMiddleware({
  maxAttempts: 5,
  lockoutDuration: 900, // 15 minutes
  resetOnSuccess: true,
  userIdPath: 'user.id',
  checkAuthSuccess: (context) => {
    return context['user']?.isAuthenticated === true;
  }
});
```

## Webhook Signature Verification

Verify webhook signatures:

```typescript
import { createWebhookSignatureMiddleware } from 'ngxsmk-gatekeeper';

const webhookMiddleware = createWebhookSignatureMiddleware({
  secret: process.env.WEBHOOK_SECRET!,
  algorithm: 'sha256',
  headerName: 'X-Signature'
});
```

## Device Fingerprinting

Track and validate devices:

```typescript
import { createDeviceFingerprintMiddleware } from 'ngxsmk-gatekeeper';

const fingerprintMiddleware = createDeviceFingerprintMiddleware({
  trackDevices: true,
  blockSuspicious: true,
  requireDeviceRegistration: false,
  generateFingerprint: (context) => {
    // Custom fingerprint generation
    const ua = context['request']?.headers.get('user-agent') || '';
    return btoa(ua).substring(0, 32);
  },
  isSuspicious: async (fingerprint, context) => {
    // Check if device is suspicious
    return await checkSuspiciousDevice(fingerprint);
  }
});
```

## User-Agent Validation

Block bots and validate browsers:

```typescript
import { createUserAgentMiddleware } from 'ngxsmk-gatekeeper';

const userAgentMiddleware = createUserAgentMiddleware({
  allowedAgents: [/Chrome/, /Firefox/, /Safari/],
  blockedAgents: [/bot/i, /crawler/i],
  blockBots: true,
  redirect: '/unsupported-browser'
});
```

## Multi-Factor Authentication

Enforce MFA:

```typescript
import { createMFAMiddleware } from 'ngxsmk-gatekeeper';

const mfaMiddleware = createMFAMiddleware({
  required: true,
  methods: ['totp', 'sms', 'email'],
  mfaPath: 'user.mfaVerified',
  mfaMethodPath: 'user.mfaMethod',
  redirect: '/mfa-verify'
});
```

## OAuth2 Integration

OAuth2 authentication:

```typescript
import { createOAuth2Middleware } from 'ngxsmk-gatekeeper';

const oauth2Middleware = createOAuth2Middleware({
  provider: 'google',
  clientId: process.env.GOOGLE_CLIENT_ID!,
  scopes: ['openid', 'profile', 'email'],
  validateToken: async (token, context) => {
    return await verifyOAuth2Token(token);
  },
  redirect: '/login'
});
```

## JWT Token Refresh

Automatic token refresh:

```typescript
import { createJWTRefreshMiddleware } from 'ngxsmk-gatekeeper';

const jwtRefreshMiddleware = createJWTRefreshMiddleware({
  refreshThreshold: 300, // 5 minutes before expiry
  autoRefresh: true,
  refreshEndpoint: '/api/auth/refresh',
  refreshToken: async (context) => {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${context['token']}` }
    });
    const data = await response.json();
    return {
      token: data.token,
      expiresAt: data.expiresAt
    };
  }
});
```

## Best Practices

1. **Always use HTTPS** - Security middleware is ineffective over HTTP
2. **Server-side validation** - Client-side middleware can be bypassed
3. **Rate limiting** - Combine with server-side rate limiting
4. **Logging** - Enable audit logging for security events
5. **Monitoring** - Monitor security events and alerts

## Security Checklist

- [ ] IP whitelisting/blacklisting configured
- [ ] CSRF protection enabled
- [ ] Session management configured
- [ ] API keys validated
- [ ] Account lockout enabled
- [ ] MFA required for sensitive operations
- [ ] Webhook signatures verified
- [ ] Device fingerprinting enabled (if needed)
- [ ] User-agent validation configured
- [ ] Security headers set
- [ ] Audit logging enabled

## Next Steps

- [Request Validation](/guide/request-validation) - Validate request data
- [Access Control](/guide/access-control) - Time windows and geo-blocking
- [Monitoring](/guide/monitoring) - Analytics and logging

