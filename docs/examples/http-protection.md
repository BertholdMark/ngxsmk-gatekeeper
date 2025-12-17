# HTTP Protection Demo

Complete example demonstrating HTTP request protection with ngxsmk-gatekeeper.

## Overview

This demo shows:
- Global HTTP request protection
- Per-request middleware configuration
- Role-based API protection
- Request blocking on middleware failure

## Complete Example

```typescript
import { Component, inject } from '@angular/core';
import { provideHttpClient, HttpClient, withInterceptors } from '@angular/common/http';
import { provideGatekeeper, gatekeeperInterceptor, withGatekeeper } from 'ngxsmk-gatekeeper';
import { createAuthMiddleware, createRoleMiddleware } from 'ngxsmk-gatekeeper/lib/middlewares';

// Create middleware
const authMiddleware = createAuthMiddleware({
  authPath: 'user.isAuthenticated',
});

const adminMiddleware = createRoleMiddleware({
  roles: ['admin'],
  mode: 'any',
});

// Configure Gatekeeper
provideGatekeeper({
  middlewares: [authMiddleware],
  onFail: '/login',
});

// Configure HTTP client with interceptor
provideHttpClient(
  withInterceptors([gatekeeperInterceptor])
);

// Use in service
class DataService {
  private http = inject(HttpClient);

  // Public API - no protection
  getPublicData() {
    return this.http.get('/api/public/data');
  }

  // Protected API - uses global middleware (auth required)
  getProtectedData() {
    return this.http.get('/api/protected/data');
  }

  // Admin API - requires authentication AND admin role
  getAdminData() {
    return this.http.get('/api/admin/data', {
      context: withGatekeeper([authMiddleware, adminMiddleware]),
    });
  }

  // Admin API with custom redirect
  deleteAdminData(id: string) {
    return this.http.delete(`/api/admin/data/${id}`, {
      context: withGatekeeper(
        [authMiddleware, adminMiddleware],
        '/unauthorized'
      ),
    });
  }
}
```

## How It Works

1. **Global Protection**: All HTTP requests are protected by default
2. **Request Override**: Use `withGatekeeper()` to override per request
3. **Role-Based**: Apply role middleware to specific API calls
4. **Error Handling**: Requests are blocked when middleware fails

## Next Steps

- [Minimal Auth Demo](./minimal-auth) - Start with basic authentication
- [Role-Based Routing Demo](./role-based-routing) - Add role-based access
- [HTTP Protection Guide](/guide/http-protection) - Learn more about HTTP protection

