# Developer Tools

ngxsmk-gatekeeper includes a comprehensive set of developer tools to make development easier and faster.

## Overview

| Tool | Description | Status |
|------|-------------|--------|
| **Angular Schematics** | Code generators for middleware and pipelines | ✅ Available |
| **Interactive Playground** | Try it live in StackBlitz/CodeSandbox | ✅ Available |
| **CLI Tool** | Standalone command-line interface | ✅ Available |
| **Visual Builder** | Drag-and-drop middleware builder | ✅ Available |
| **Testing Utilities** | Mock contexts and test helpers | ✅ Available |
| **Configuration Validator** | Validate your setup | ✅ Available |
| **Template Library** | Pre-built configurations | ✅ Available |
| **Observability Dashboard** | Real-time monitoring | ✅ Available |
| **Middleware Marketplace** | Discover plugins | ✅ Available |
| **Showcase Gallery** | User implementations | ✅ Available |

## Angular Schematics

Generate middleware and pipelines with Angular CLI.

### Installation

```bash
ng add ngxsmk-gatekeeper
```

### Generate Middleware

```bash
ng generate ngxsmk-gatekeeper:middleware auth
ng generate ngxsmk-gatekeeper:middleware role --type=role
ng generate ngxsmk-gatekeeper:middleware rate-limit --type=custom
```

### Generate Pipeline

```bash
ng generate ngxsmk-gatekeeper:pipeline admin
ng generate ngxsmk-gatekeeper:pipeline security --middlewares=auth,role,csrf
```

[Learn more →](../schematics/)

## Interactive Playground

Try ngxsmk-gatekeeper without installing anything.

- [StackBlitz Playground](../playground/) - Run examples in StackBlitz
- [CodeSandbox Playground](../playground/) - Run examples in CodeSandbox

[Learn more →](../playground/)

## CLI Tool

Standalone command-line tool for analyzing and testing configurations.

### Installation

```bash
npm install -g @ngxsmk-gatekeeper/cli
```

### Commands

```bash
# Initialize configuration
gatekeeper init

# Analyze route protection
gatekeeper analyze

# Test middleware
gatekeeper test

# Export configuration
gatekeeper export
```

[Learn more →](../../tools/cli/)

## Visual Builder

Build middleware chains visually with drag-and-drop.

```typescript
import { VisualBuilderService } from 'ngxsmk-gatekeeper/lib/visual-builder';

const builder = new VisualBuilderService();
// Use the visual builder UI to create middleware chains
```

[Learn more →](../visual-builder/)

## Testing Utilities

Test middleware easily with mock contexts and assertions.

```typescript
import {
  createMockContext,
  expectMiddlewareToAllow,
  runMiddlewareChain,
} from 'ngxsmk-gatekeeper/lib/testing';

// Create mock context
const context = createMockContext({
  user: { isAuthenticated: true, roles: ['admin'] },
});

// Test middleware
await expectMiddlewareToAllow(authMiddleware(context));

// Test chain
const result = await runMiddlewareChain([auth, role], context);
```

[Learn more →](../testing/)

## Configuration Validator

Validate your configuration for type errors, performance issues, and security vulnerabilities.

```typescript
import { ConfigValidator } from 'ngxsmk-gatekeeper/lib/validator';

const validator = inject(ConfigValidator);
const result = await validator.validate(config);

if (!result.valid) {
  console.error('Validation errors:', result.errorIssues);
  console.warn('Warnings:', result.warningIssues);
}
```

[Learn more →](../validation/)

## Template Library

Use pre-built configurations for common scenarios.

```typescript
import { createTemplateLoader } from 'ngxsmk-gatekeeper/lib/templates';

const loader = createTemplateLoader();

// Create SaaS configuration
const config = await loader.createConfig('saas', {
  roles: ['user', 'admin'],
  enableRateLimit: true,
});

provideGatekeeper(config);
```

[Learn more →](../templates/)

## Observability Dashboard

Monitor middleware execution in real-time with WebSocket.

```typescript
import { provideObservability } from 'ngxsmk-gatekeeper/lib/observability';

provideObservability({
  websocketUrl: 'ws://localhost:8080',
  enableRealtime: true,
});
```

[Learn more →](../observability/)

## Middleware Marketplace

Discover and install community plugins.

```typescript
import { MarketplaceRegistry } from 'ngxsmk-gatekeeper/lib/marketplace';

const marketplace = inject(MarketplaceRegistry);
const plugins = await marketplace.search({ category: 'security' });
```

[Learn more →](../marketplace/)

## Showcase Gallery

Browse real-world implementations and case studies.

```typescript
import { ShowcaseService } from 'ngxsmk-gatekeeper/lib/showcase';

const showcase = inject(ShowcaseService);
const entries = await showcase.search({ category: ShowcaseCategory.SAAS });
```

[Learn more →](../showcase/)

## Getting Started

1. **Install ngxsmk-gatekeeper**: `npm install ngxsmk-gatekeeper`
2. **Try the playground**: [Interactive Playground](../playground/)
3. **Generate code**: Use Angular schematics
4. **Validate setup**: Use the CLI tool
5. **Test middleware**: Use testing utilities

## Next Steps

- [Quick Start Guide](../guide/quick-start.md)
- [Middleware Pattern](../guide/middleware-pattern.md)
- [Examples](../examples/)

