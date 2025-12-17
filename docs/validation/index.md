# Configuration Validator

Validate your ngxsmk-gatekeeper configuration for type errors, performance issues, and security concerns.

## Overview

The configuration validator helps you:

- **Type Check** - Ensure configuration matches expected types
- **Performance Analysis** - Identify potential performance bottlenecks
- **Security Recommendations** - Get security best practice suggestions
- **Best Practices** - Validate against recommended patterns

## Quick Start

```typescript
import { validateConfig } from 'ngxsmk-gatekeeper/lib/validator';

const config = {
  middlewares: [authMiddleware],
  onFail: '/login',
};

const result = validateConfig(config);

if (!result.valid) {
  console.error('Configuration errors:', result.errorIssues);
}
```

## Usage

### Basic Validation

```typescript
import { ConfigValidator } from 'ngxsmk-gatekeeper/lib/validator';
import { inject } from '@angular/core';

@Component({...})
export class AppComponent {
  private validator = inject(ConfigValidator);

  ngOnInit() {
    const config = this.getConfig();
    const result = this.validator.validate(config);

    if (!result.valid) {
      console.error('Configuration is invalid:', result.errorIssues);
    }

    if (result.warnings > 0) {
      console.warn('Configuration warnings:', result.warningIssues);
    }
  }
}
```

### Validation Options

```typescript
const result = this.validator.validate(config, {
  checkTypes: true,              // Enable type checking
  checkPerformance: true,        // Enable performance analysis
  checkSecurity: true,            // Enable security analysis
  checkBestPractices: true,      // Enable best practice checks
  maxMiddlewareCount: 10,        // Max middlewares before warning
  maxExecutionTime: 100,         // Max execution time (ms) before warning
  requireAuth: true,             // Require authentication middleware
  requireAuditInProduction: false, // Require audit in production
});
```

### Validation Result

```typescript
interface ValidationResult {
  valid: boolean;                    // Whether config is valid
  totalIssues: number;               // Total number of issues
  errors: number;                   // Number of errors
  warnings: number;                  // Number of warnings
  info: number;                     // Number of info messages
  issues: ValidationIssue[];        // All issues
  errorIssues: ValidationIssue[];    // Errors only
  warningIssues: ValidationIssue[]; // Warnings only
  infoIssues: ValidationIssue[];     // Info only
  issuesByCategory: {                // Issues grouped by category
    type: ValidationIssue[];
    performance: ValidationIssue[];
    security: ValidationIssue[];
    'best-practice': ValidationIssue[];
    configuration: ValidationIssue[];
  };
  performance?: PerformanceAnalysis; // Performance analysis
  security?: SecurityAnalysis;        // Security analysis
}
```

## Type Checking

Validates that configuration matches expected types:

```typescript
// ❌ Invalid - middlewares is not an array
const invalid = {
  middlewares: 'not-an-array',
  onFail: '/login',
};

const result = validateConfig(invalid);
// result.valid = false
// result.errorIssues = [
//   {
//     severity: 'error',
//     category: 'type',
//     code: 'MIDDLEWARES_NOT_ARRAY',
//     message: '"middlewares" must be an array',
//     path: 'middlewares',
//   }
// ]
```

## Performance Analysis

Analyzes configuration for performance issues:

```typescript
const result = validateConfig(config, {
  checkPerformance: true,
  maxMiddlewareCount: 10,
  maxExecutionTime: 100,
});

if (result.performance) {
  console.log('Performance Score:', result.performance.score);
  console.log('Estimated Time:', result.performance.estimatedExecutionTime, 'ms');
  console.log('Bottlenecks:', result.performance.bottlenecks);
}
```

### Performance Recommendations

- **Too Many Middlewares** - Warns if middleware count exceeds threshold
- **Slow Middleware** - Identifies potentially slow middleware
- **Slow Chain** - Warns if estimated execution time exceeds threshold
- **Benchmark Recommended** - Suggests enabling benchmark mode

## Security Analysis

Analyzes configuration for security concerns:

```typescript
const result = validateConfig(config, {
  checkSecurity: true,
  requireAuth: true,
});

if (result.security) {
  console.log('Security Score:', result.security.score);
  console.log('Missing Features:', result.security.missingFeatures);
  console.log('Risks:', result.security.risks);
}
```

### Security Recommendations

- **Missing Authentication** - Warns if no auth middleware found
- **Missing CSRF Protection** - Suggests CSRF middleware
- **Missing Rate Limiting** - Suggests rate limiting
- **Debug in Production** - Warns if debug enabled in production
- **Missing Audit Logging** - Suggests audit logging for production
- **Insecure Redirect** - Warns about insecure redirect paths

## Best Practices

Validates against recommended patterns:

- Empty middlewares array
- Debug mode in development
- Benchmark in production
- Compliance mode for complex chains
- Default onFail paths

## Validation Summary

Get a formatted summary of validation results:

```typescript
const result = this.validator.validate(config);
const summary = this.validator.getSummary(result);
console.log(summary);
```

Output:
```
Configuration Validation Summary
========================================
Status: ✓ Valid
Total Issues: 3
  Errors: 0
  Warnings: 2
  Info: 1

Performance Analysis:
  Middleware Count: 5
  Estimated Time: 45ms
  Performance Score: 90/100

Security Analysis:
  Security Score: 75/100
  Missing Features: CSRF protection, Rate limiting
```

## Validate and Throw

Validate configuration and throw on errors:

```typescript
import { ConfigValidator } from 'ngxsmk-gatekeeper/lib/validator';

const validator = new ConfigValidator();

try {
  validator.validateOrThrow(config);
  console.log('Configuration is valid!');
} catch (error) {
  console.error('Configuration validation failed:', error.message);
}
```

## Integration with CLI

The CLI tool uses the validator:

```bash
gatekeeper analyze
```

This will:
- Analyze route protection
- Validate configuration
- Show performance and security recommendations

## Custom Validation

You can create custom validators:

```typescript
import { ValidationIssue, ValidationSeverity, ValidationCategory } from 'ngxsmk-gatekeeper/lib/validator';

function customValidator(config: GatekeeperConfig): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Your custom validation logic
  if (config.middlewares.length === 0) {
    issues.push({
      severity: ValidationSeverity.Error,
      category: ValidationCategory.Configuration,
      code: 'CUSTOM_ERROR',
      message: 'Custom validation failed',
      path: 'middlewares',
    });
  }

  return issues;
}
```

## Best Practices

1. **Validate Early** - Validate configuration during development
2. **Fix Errors First** - Address errors before warnings
3. **Review Warnings** - Don't ignore warnings, review them
4. **Use in CI/CD** - Add validation to your build pipeline
5. **Monitor Performance** - Enable benchmark mode to track actual performance

## Next Steps

- [Type Checking API](../api/validator/type-checker)
- [Performance Analysis API](../api/validator/performance)
- [Security Analysis API](../api/validator/security)
- [Best Practices API](../api/validator/best-practices)

