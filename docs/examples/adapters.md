# Adapters

Examples of using authentication adapters with ngxsmk-gatekeeper.

## Overview

Adapters provide integration with popular authentication systems like Auth0, Firebase, and custom JWT implementations. All adapters are **open source** and **free to use**.

## Auth0 Adapter

```typescript
import { provideAdapters, createAdapterMiddleware } from 'ngxsmk-gatekeeper/lib/adapters';
import { Auth0Adapter } from 'ngxsmk-gatekeeper/lib/adapters/auth0';

provideAdapters([
  new Auth0Adapter({
    domain: 'your-domain.auth0.com',
    clientId: 'your-client-id',
    audience: 'your-api-audience',
  }),
]);

provideGatekeeper({
  middlewares: [
    createAdapterMiddleware(new Auth0Adapter({...}), {
      requireAuth: true,
      redirectOnFail: '/login',
      autoRefresh: true,
    }),
  ],
  onFail: '/login',
});
```

## Firebase Adapter

```typescript
import { FirebaseAdapter } from 'ngxsmk-gatekeeper/lib/adapters/firebase';

provideAdapters([
  new FirebaseAdapter({
    apiKey: 'your-api-key',
    authDomain: 'your-domain.firebaseapp.com',
  }),
]);
```

## JWT Adapter

```typescript
import { JWTAdapter } from 'ngxsmk-gatekeeper/lib/adapters/jwt';

provideAdapters([
  new JWTAdapter({
    secret: 'your-jwt-secret',
    issuer: 'your-issuer',
  }),
]);
```

## Custom Adapter

Create your own adapter:

```typescript
import { Adapter } from 'ngxsmk-gatekeeper/lib/adapters';

class CustomAdapter implements Adapter {
  async authenticate(context: MiddlewareContext): Promise<boolean> {
    // Your authentication logic
    return true;
  }
  
  getUser(context: MiddlewareContext): User | null {
    // Extract user from context
    return context.user || null;
  }
}
```

## Next Steps

- [Adapters Documentation](../../projects/ngxsmk-gatekeeper/src/lib/adapters/ADAPTER_ARCHITECTURE.md) - Learn about adapter architecture
- [Examples](../../projects/ngxsmk-gatekeeper/examples/adapters/) - See more adapter examples

