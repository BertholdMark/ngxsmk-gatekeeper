# Plugins

Extend ngxsmk-gatekeeper with plugins for additional functionality.

## Plugin Architecture

The core library provides a plugin architecture that allows extending functionality without modifying the core code.

## Using Plugins

Register plugins using `provideExtensions`:

```typescript
import { provideExtensions } from 'ngxsmk-gatekeeper/lib/extensions';
import { AuthPlugin } from 'ngxsmk-gatekeeper/lib/plugins';

provideExtensions([
  new AuthPlugin({
    apiKey: 'your-api-key',
  }),
]);
```

## Plugin Types

### Pre-Middleware Plugins

Execute before user middleware:

```typescript
class PreMiddlewarePlugin implements Extension {
  getPreMiddleware(): NgxMiddleware[] {
    return [preAuthMiddleware];
  }
}
```

### Post-Middleware Plugins

Execute after user middleware:

```typescript
class PostMiddlewarePlugin implements Extension {
  getPostMiddleware(): NgxMiddleware[] {
    return [auditMiddleware];
  }
}
```

### Merged Middleware Plugins

Merge with user middleware:

```typescript
class MergedPlugin implements Extension {
  getMergedMiddleware(): NgxMiddleware[] {
    return [featureFlagMiddleware];
  }
}
```

## Creating Plugins

Create custom plugins by implementing the `Extension` interface:

```typescript
import { Extension, NgxMiddleware } from 'ngxsmk-gatekeeper';

class CustomPlugin implements Extension {
  getPreMiddleware(): NgxMiddleware[] {
    return [customPreMiddleware];
  }
  
  getPostMiddleware(): NgxMiddleware[] {
    return [customPostMiddleware];
  }
  
  getMergedMiddleware(): NgxMiddleware[] {
    return [customMergedMiddleware];
  }
}
```

## Plugin Execution Order

Middleware executes in this order:

1. Pre-middleware (from plugins)
2. User middleware
3. Merged middleware (from plugins)
4. Post-middleware (from plugins)

## Available Plugins

The library includes various plugins for extended functionality:

- **Authentication Adapters**: Auth0, Firebase, Custom JWT
- **Audit Logging**: Comprehensive audit logging with SIEM integration
- **Compliance Mode**: SOC2 and ISO 27001 compliant logging
- **License Verification**: Full license management
- **Feature Flags**: Feature flag integration
- **Rate Limiting**: Built-in rate limiting middleware

All plugins are **open source** and **free to use**.

## Next Steps

- [Examples - Plugins](/examples/plugins) - See plugin examples
- [API Reference](/api/) - Learn about the plugin API

