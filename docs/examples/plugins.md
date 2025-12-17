# Plugins

Examples of using plugins to extend ngxsmk-gatekeeper functionality.

## Overview

Plugins allow you to extend the core library with additional middleware and features without modifying the core code.

## Using Plugins

```typescript
import { provideExtensions } from 'ngxsmk-gatekeeper/lib/extensions';
import { AuthPlugin } from 'ngxsmk-gatekeeper/lib/plugins';

provideExtensions([
  new AuthPlugin({
    apiKey: 'your-api-key',
    mfaRequired: true,
  }),
]);
```

## Plugin Types

### Pre-Middleware Plugin

Execute before user middleware:

```typescript
class PreAuthPlugin implements Extension {
  getPreMiddleware(): NgxMiddleware[] {
    return [preAuthCheck];
  }
}
```

### Post-Middleware Plugin

Execute after user middleware:

```typescript
class AuditPlugin implements Extension {
  getPostMiddleware(): NgxMiddleware[] {
    return [auditLogging];
  }
}
```

### Merged Middleware Plugin

Merge with user middleware:

```typescript
class FeatureFlagPlugin implements Extension {
  getMergedMiddleware(): NgxMiddleware[] {
    return [featureFlagCheck];
  }
}
```

## Creating Custom Plugins

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

## Available Plugins

The library includes various plugins for extended functionality:

- Authentication features with MFA support
- Comprehensive audit logging
- Compliance mode (SOC2, ISO)
- License verification
- Feature flags
- Rate limiting

All plugins are **open source** and **free to use**.

## Next Steps

- [Plugin Architecture](../../projects/ngxsmk-gatekeeper/src/lib/extensions/PLUGIN_ARCHITECTURE.md) - Learn about plugin architecture
- [Plugins Guide](/guide/plugins) - Complete plugin guide

