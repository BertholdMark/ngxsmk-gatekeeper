/**
 * Default showcase entries
 * 
 * Example case studies and implementations
 */

import {
  ShowcaseEntry,
  ShowcaseCategory,
  ImplementationType,
} from './showcase.types';

/**
 * Get default showcase entries
 */
export function getDefaultShowcaseEntries(): ShowcaseEntry[] {
  return [
    {
      id: 'ecommerce-payment-protection',
      title: 'E-commerce Payment Protection with Multi-Layer Security',
      description:
        'How a leading e-commerce platform implemented comprehensive payment protection using ngxsmk-gatekeeper with CSRF protection, rate limiting, and session management.',
      category: ShowcaseCategory.ECOMMERCE,
      type: ImplementationType.CASE_STUDY,
      featured: true,
      tags: ['ecommerce', 'payment', 'security', 'csrf', 'rate-limiting'],
      company: {
        name: 'ShopSecure',
        industry: 'E-commerce',
        size: 'large',
      },
      author: {
        name: 'Sarah Johnson',
        role: 'Senior Security Engineer',
        company: 'ShopSecure',
      },
      publishedAt: '2024-01-15',
      views: 1250,
      likes: 89,
      content: `
# E-commerce Payment Protection

## Challenge
ShopSecure needed to protect their payment processing endpoints from various attacks including CSRF, brute force, and session hijacking.

## Solution
We implemented a comprehensive middleware chain using ngxsmk-gatekeeper:

1. **CSRF Protection** - Validates CSRF tokens on all payment requests
2. **Rate Limiting** - Prevents brute force attacks on payment endpoints
3. **Session Management** - Ensures secure session handling
4. **IP Filtering** - Blocks known malicious IPs
5. **Request Validation** - Validates payment request structure

## Results
- 99.9% reduction in fraudulent payment attempts
- Zero successful CSRF attacks
- 50% reduction in support tickets related to payment issues
      `,
      codeExamples: [
        {
          language: 'typescript',
          code: `import { provideGatekeeper } from 'ngxsmk-gatekeeper';
import {
  createCSRFMiddleware,
  createRateLimitMiddleware,
  createSessionMiddleware,
  createIPBlacklistMiddleware,
} from 'ngxsmk-gatekeeper/lib/middlewares';

export const paymentConfig = provideGatekeeper({
  middlewares: [
    createCSRFMiddleware({
      tokenHeader: 'X-CSRF-Token',
    }),
    createRateLimitMiddleware({
      maxRequests: 10,
      windowMs: 60000, // 1 minute
    }),
    createSessionMiddleware({
      timeoutMs: 1800000, // 30 minutes
    }),
    createIPBlacklistMiddleware({
      blockedIPs: ['192.168.1.100'], // Known malicious IPs
    }),
  ],
  onFail: '/payment-error',
});`,
          description: 'Payment protection configuration',
        },
      ],
      metrics: {
        performanceImprovement: '50% faster payment processing',
        securityImprovement: '99.9% reduction in fraud',
        timeSaved: '2 hours/week in security maintenance',
      },
      links: [
        {
          label: 'GitHub Repository',
          url: 'https://github.com/shopsecure/payment-protection',
          type: 'github',
        },
      ],
    },
    {
      id: 'saas-multi-tenant',
      title: 'Multi-Tenant SaaS Application with Role-Based Access',
      description:
        'A SaaS platform implemented fine-grained access control using ngxsmk-gatekeeper to manage multi-tenant isolation and role-based permissions.',
      category: ShowcaseCategory.SAAS,
      type: ImplementationType.CASE_STUDY,
      featured: true,
      tags: ['saas', 'multi-tenant', 'rbac', 'access-control'],
      company: {
        name: 'CloudWorks',
        industry: 'SaaS',
        size: 'medium',
      },
      author: {
        name: 'Michael Chen',
        role: 'Lead Developer',
        company: 'CloudWorks',
      },
      publishedAt: '2024-02-20',
      views: 980,
      likes: 67,
      content: `
# Multi-Tenant SaaS with RBAC

## Challenge
CloudWorks needed to implement secure multi-tenant isolation with role-based access control across thousands of tenants.

## Solution
We used ngxsmk-gatekeeper to create a flexible middleware chain:

1. **Tenant Isolation** - Custom middleware to verify tenant context
2. **Role-Based Access** - Role middleware for permission checks
3. **Feature Flags** - Feature flag middleware for tenant-specific features
4. **Audit Logging** - Comprehensive audit trail for compliance

## Results
- Zero tenant data leakage incidents
- 90% reduction in access control bugs
- Simplified permission management
      `,
      codeExamples: [
        {
          language: 'typescript',
          code: `import { createMiddleware } from 'ngxsmk-gatekeeper';
import { createRoleMiddleware } from 'ngxsmk-gatekeeper/lib/middlewares';

// Tenant isolation middleware
const tenantIsolation = createMiddleware('tenantIsolation', (context) => {
  const user = context['user'] as any;
  const tenant = context['tenant'] as any;
  
  // Ensure user belongs to the tenant
  return user?.tenantId === tenant?.id;
});

// Role-based access
const adminAccess = createRoleMiddleware({
  roles: ['admin', 'super-admin'],
  mode: 'any',
});

export const saasConfig = provideGatekeeper({
  middlewares: [
    tenantIsolation,
    adminAccess,
  ],
});`,
          description: 'Multi-tenant RBAC configuration',
        },
      ],
      metrics: {
        securityImprovement: 'Zero tenant data leakage',
        timeSaved: '5 hours/week in access control management',
      },
    },
    {
      id: 'api-rate-limiting',
      title: 'API Rate Limiting for Public API',
      description:
        'A public API service implemented intelligent rate limiting using ngxsmk-gatekeeper to prevent abuse while maintaining good user experience.',
      category: ShowcaseCategory.API,
      type: ImplementationType.CODE_EXAMPLE,
      featured: false,
      tags: ['api', 'rate-limiting', 'public-api'],
      company: {
        name: 'DataAPI',
        industry: 'API Services',
        size: 'small',
      },
      publishedAt: '2024-03-10',
      views: 650,
      likes: 45,
      codeExamples: [
        {
          language: 'typescript',
          code: `import { createRateLimitMiddleware } from 'ngxsmk-gatekeeper/lib/middlewares';

// Different rate limits for different user tiers
const freeTierLimit = createRateLimitMiddleware({
  maxRequests: 100,
  windowMs: 60000, // 1 minute
});

const premiumTierLimit = createRateLimitMiddleware({
  maxRequests: 1000,
  windowMs: 60000,
});

// Apply based on user tier
const rateLimit = createMiddleware('rateLimit', (context) => {
  const user = context['user'] as any;
  const tier = user?.tier || 'free';
  
  if (tier === 'premium') {
    return premiumTierLimit(context);
  }
  return freeTierLimit(context);
});`,
          description: 'Tiered rate limiting implementation',
        },
      ],
    },
    {
      id: 'enterprise-compliance',
      title: 'Enterprise Compliance with SOC2 and ISO 27001',
      description:
        'An enterprise application achieved SOC2 and ISO 27001 compliance using ngxsmk-gatekeeper\'s compliance mode for comprehensive audit logging and decision tracking.',
      category: ShowcaseCategory.COMPLIANCE,
      type: ImplementationType.CASE_STUDY,
      featured: true,
      tags: ['compliance', 'soc2', 'iso27001', 'enterprise', 'audit'],
      company: {
        name: 'EnterpriseCorp',
        industry: 'Enterprise Software',
        size: 'enterprise',
      },
      author: {
        name: 'David Williams',
        role: 'Compliance Officer',
        company: 'EnterpriseCorp',
      },
      publishedAt: '2024-04-05',
      views: 1120,
      likes: 78,
      content: `
# Enterprise Compliance Implementation

## Challenge
EnterpriseCorp needed to achieve SOC2 Type II and ISO 27001 compliance for their enterprise software platform.

## Solution
We leveraged ngxsmk-gatekeeper's compliance mode:

1. **Compliance Mode** - Enabled comprehensive audit logging
2. **Execution Traces** - Detailed traces of all access decisions
3. **Decision Rationale** - Clear documentation of why access was granted/denied
4. **Structured Logging** - Machine-readable logs for compliance reporting

## Results
- Successfully passed SOC2 Type II audit
- ISO 27001 certification achieved
- Automated compliance reporting
      `,
      codeExamples: [
        {
          language: 'typescript',
          code: `import { provideGatekeeper } from 'ngxsmk-gatekeeper';

export const complianceConfig = provideGatekeeper({
  middlewares: [
    // Your middleware chain
  ],
  compliance: {
    enabled: true,
    auditSink: {
      log: async (entry) => {
        // Send to compliance logging system
        await sendToComplianceSystem(entry);
      },
    },
  },
});`,
          description: 'Compliance configuration',
        },
      ],
      metrics: {
        securityImprovement: '100% compliance audit pass rate',
        timeSaved: '20 hours/week in compliance reporting',
      },
    },
    {
      id: 'admin-panel-security',
      title: 'Secure Admin Panel with MFA',
      description:
        'An admin panel implemented multi-factor authentication and IP whitelisting using ngxsmk-gatekeeper for enhanced security.',
      category: ShowcaseCategory.ADMIN,
      type: ImplementationType.INTEGRATION,
      featured: false,
      tags: ['admin', 'mfa', 'security', 'ip-whitelist'],
      company: {
        name: 'SecureAdmin',
        industry: 'Security',
        size: 'small',
      },
      publishedAt: '2024-05-12',
      views: 420,
      likes: 32,
      codeExamples: [
        {
          language: 'typescript',
          code: `import {
  createAuthMiddleware,
  createMFAMiddleware,
  createIPWhitelistMiddleware,
} from 'ngxsmk-gatekeeper/lib/middlewares';

export const adminConfig = provideGatekeeper({
  middlewares: [
    createAuthMiddleware({
      authPath: 'user.isAuthenticated',
    }),
    createMFAMiddleware({
      required: true,
      methods: ['totp', 'sms'],
    }),
    createIPWhitelistMiddleware({
      allowedIPs: [
        '192.168.1.0/24', // Office network
        '10.0.0.0/8', // VPN network
      ],
    }),
  ],
  onFail: '/admin/unauthorized',
});`,
          description: 'Admin panel security configuration',
        },
      ],
    },
  ];
}

