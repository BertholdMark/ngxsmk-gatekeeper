# Template Library

Pre-built configuration templates and industry-specific presets for ngxsmk-gatekeeper.

## Overview

The template library provides ready-to-use configurations for common scenarios:

- **Basic Templates** - Simple configurations for getting started
- **Industry Templates** - SaaS, E-commerce, API, etc.
- **Security Templates** - High-security configurations
- **Compliance Templates** - SOC2, ISO 27001 ready

## Quick Start

```typescript
import { TemplateLoader } from 'ngxsmk-gatekeeper/lib/templates';

const loader = createTemplateLoader();
const config = await loader.createConfig('basic', {
  authPath: 'user.isAuthenticated',
  onFail: '/login',
});

provideGatekeeper(config);
```

## Available Templates

### Basic Templates

#### Basic Authentication

Simple template with authentication only.

```typescript
const config = await loader.createConfig('basic', {
  authPath: 'user.isAuthenticated',
  onFail: '/login',
  debug: false,
});
```

**Use cases:**
- Simple applications
- Getting started
- Prototyping

### Industry Templates

#### SaaS Application

Complete template for multi-tenant SaaS applications.

```typescript
const config = await loader.createConfig('saas', {
  authPath: 'user.isAuthenticated',
  roles: ['user', 'admin'],
  checkSubscription: true,
  enableRateLimit: true,
  enableAnalytics: true,
  onFail: '/login',
});
```

**Features:**
- Authentication
- Role-based access control
- Subscription checks
- Rate limiting
- Analytics

**Use cases:**
- Multi-tenant SaaS platforms
- Subscription-based applications
- Enterprise software

#### E-commerce Application

Template for e-commerce with payment protection.

```typescript
const config = await loader.createConfig('ecommerce', {
  authPath: 'user.isAuthenticated',
  enableCSRF: true,
  enableSession: true,
  enableRateLimit: true,
  onFail: '/login',
});
```

**Features:**
- CSRF protection
- Authentication
- Session management
- Rate limiting
- Audit logging

**Use cases:**
- Online stores
- Shopping carts
- Payment processing

#### API Endpoints

Template for protecting API endpoints.

```typescript
const config = await loader.createConfig('api', {
  validateAPIKey: async (key) => {
    return key === process.env['API_KEY'];
  },
  rateLimit: {
    maxRequests: 1000,
    windowMs: 60000,
  },
  enableValidation: true,
  enableLogging: true,
  onFail: '/api/unauthorized',
});
```

**Features:**
- API key authentication
- Rate limiting
- Request validation
- Request logging

**Use cases:**
- REST APIs
- GraphQL endpoints
- Microservices

### Security Templates

#### Maximum Security

High-security template with multiple protection layers.

```typescript
const config = await loader.createConfig('security', {
  authPath: 'user.isAuthenticated',
  allowedIPs: ['10.0.0.0/8'],
  rateLimit: {
    maxRequests: 50,
    windowMs: 60000,
  },
  accountLockout: {
    maxAttempts: 5,
    lockoutDuration: 900000,
  },
  sessionTimeout: 1800,
  onFail: '/unauthorized',
});
```

**Features:**
- IP filtering
- Rate limiting
- Account lockout
- CSRF protection
- Authentication
- Session management
- Zero trust mode
- Audit logging
- Compliance mode

**Use cases:**
- Financial applications
- Healthcare systems
- Government applications
- High-security enterprise

### Compliance Templates

#### Compliance Ready

Template configured for SOC2, ISO 27001, and similar frameworks.

```typescript
const config = await loader.createConfig('compliance', {
  authPath: 'user.isAuthenticated',
  roles: ['admin'],
  logFormat: 'json',
  logRetentionDays: 90,
  compliancePolicy: 'SOC2-CC6.1',
  onFail: '/unauthorized',
});
```

**Features:**
- Authentication
- Role-based access
- Request logging
- Audit trails
- Execution traces
- Decision rationale
- Structured logging

**Use cases:**
- SOC2 compliance
- ISO 27001 compliance
- HIPAA compliance
- GDPR compliance

## Using Templates

### With Template Loader

```typescript
import { createTemplateLoader } from 'ngxsmk-gatekeeper/lib/templates';

const loader = createTemplateLoader();

// Get template
const template = await loader.getTemplate('saas');

// Create configuration
const config = await loader.createConfig('saas', {
  roles: ['user', 'admin'],
  enableRateLimit: true,
});

// Use in application
provideGatekeeper(config);
```

### With Template Registry

```typescript
import { TemplateRegistry } from 'ngxsmk-gatekeeper/lib/templates';
import { inject } from '@angular/core';

@Component({...})
export class AppComponent {
  private registry = inject(TemplateRegistry);

  async ngOnInit() {
    // Search templates
    const templates = this.registry.search('saas');
    
    // Get by category
    const saasTemplates = this.registry.getByCategory(TemplateCategory.SaaS);
    
    // Create configuration
    const config = await this.registry.createConfig('saas', {
      roles: ['admin'],
    });
  }
}
```

### Direct Template Usage

```typescript
import { createSaaSTemplate } from 'ngxsmk-gatekeeper/lib/templates';

const template = createSaaSTemplate();
const config = await template.factory({
  roles: ['user', 'admin'],
  enableRateLimit: true,
});

provideGatekeeper(config);
```

## Custom Templates

### Creating Custom Templates

```typescript
import { Template, TemplateCategory } from 'ngxsmk-gatekeeper/lib/templates';

const myTemplate: Template = {
  metadata: {
    id: 'my-custom-template',
    name: 'My Custom Template',
    description: 'Custom template for my use case',
    category: TemplateCategory.Basic,
    version: '1.0.0',
  },
  factory: async (options = {}) => {
    return {
      middlewares: [
        // Your middleware configuration
      ],
      onFail: '/login',
    };
  },
};

// Register template
registry.register(myTemplate);
```

## Template Categories

- `TemplateCategory.Basic` - Basic templates
- `TemplateCategory.Enterprise` - Enterprise templates
- `TemplateCategory.SaaS` - SaaS applications
- `TemplateCategory.ECommerce` - E-commerce
- `TemplateCategory.Admin` - Admin panels
- `TemplateCategory.Public` - Public applications
- `TemplateCategory.API` - API endpoints
- `TemplateCategory.Security` - Security-focused
- `TemplateCategory.Compliance` - Compliance-ready

## Best Practices

1. **Start with Basic** - Use basic template to get started
2. **Customize as Needed** - Templates are starting points, customize for your needs
3. **Use Industry Templates** - Choose templates that match your industry
4. **Combine Templates** - Mix and match middleware from different templates
5. **Validate Configuration** - Use configuration validator after creating from template

## Examples

### SaaS Application

```typescript
import { createTemplateLoader } from 'ngxsmk-gatekeeper/lib/templates';

const loader = createTemplateLoader();
const config = await loader.createConfig('saas', {
  authPath: 'user.isAuthenticated',
  roles: ['user', 'admin', 'superadmin'],
  checkSubscription: true,
  enableRateLimit: true,
  enableAnalytics: true,
});

bootstrapApplication(AppComponent, {
  providers: [
    provideGatekeeper(config),
  ],
});
```

### E-commerce Store

```typescript
const config = await loader.createConfig('ecommerce', {
  authPath: 'customer.isAuthenticated',
  enableCSRF: true,
  enableSession: true,
  enableRateLimit: true,
});

provideGatekeeper(config);
```

### API Service

```typescript
const config = await loader.createConfig('api', {
  validateAPIKey: async (key) => {
    // Validate against database
    return await validateKeyInDatabase(key);
  },
  rateLimit: {
    maxRequests: 5000,
    windowMs: 60000,
  },
  enableValidation: true,
  enableLogging: true,
});

provideGatekeeper(config);
```

## Next Steps

- [Template API Reference](../api/templates)
- [Configuration Guide](../guide/configuration)
- [Security Guide](../guide/security)
- [Compliance Guide](../guide/compliance)

