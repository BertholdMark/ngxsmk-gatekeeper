# Advanced Control Patterns

Advanced middleware patterns for complex scenarios.

## Conditional Middleware

Execute different middleware based on conditions:

```typescript
import { createConditionalMiddleware } from 'ngxsmk-gatekeeper';

const conditionalMiddleware = createConditionalMiddleware({
  condition: (context) => {
    const user = context['user'];
    return user?.role === 'admin';
  },
  ifTrue: adminMiddleware,
  ifFalse: userMiddleware,
  executeBoth: false // Set to true for audit/logging
});
```

### Multiple Conditions

```typescript
const complexConditional = createConditionalMiddleware({
  condition: (context) => {
    const user = context['user'];
    const isPremium = user?.subscription === 'premium';
    const isBusinessHours = isBusinessHoursNow();
    return isPremium && isBusinessHours;
  },
  ifTrue: premiumAccessMiddleware,
  ifFalse: standardAccessMiddleware
});
```

## Circuit Breaker

Protect against cascading failures:

```typescript
import { createCircuitBreakerMiddleware } from 'ngxsmk-gatekeeper';

const circuitBreakerMiddleware = createCircuitBreakerMiddleware({
  name: 'external-api',
  middleware: externalAPIMiddleware,
  failureThreshold: 5,
  timeout: 60000, // 1 minute
  successThreshold: 2, // Close after 2 successes
  fallback: (context) => {
    // Fallback behavior
    return { allow: false, redirect: '/service-unavailable' };
  }
});
```

### Circuit States

- **Closed**: Normal operation
- **Open**: Circuit is open, using fallback
- **Half-Open**: Testing if service recovered

## Retry Logic

Retry failed requests with backoff:

```typescript
import { createRetryMiddleware } from 'ngxsmk-gatekeeper';

const retryMiddleware = createRetryMiddleware({
  middleware: externalAPIMiddleware,
  maxRetries: 3,
  backoff: 'exponential', // 'linear' | 'exponential' | 'fixed'
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds max
  retryableErrors: [500, 502, 503, 504],
  isRetryable: (error, context) => {
    // Custom retry logic
    if (error instanceof NetworkError) {
      return true;
    }
    return false;
  }
});
```

### Backoff Strategies

```typescript
// Exponential backoff (default)
const exponential = createRetryMiddleware({
  backoff: 'exponential',
  initialDelay: 1000
  // Delays: 1s, 2s, 4s, 8s...
});

// Linear backoff
const linear = createRetryMiddleware({
  backoff: 'linear',
  initialDelay: 1000
  // Delays: 1s, 2s, 3s, 4s...
});

// Fixed delay
const fixed = createRetryMiddleware({
  backoff: 'fixed',
  initialDelay: 2000
  // Delays: 2s, 2s, 2s, 2s...
});
```

## Concurrent Limits

Limit concurrent requests:

```typescript
import { createConcurrentLimitMiddleware } from 'ngxsmk-gatekeeper';

const concurrentLimitMiddleware = createConcurrentLimitMiddleware({
  maxConcurrent: 10,
  perUser: true, // Limit per user, not global
  userIdPath: 'user.id',
  queueStrategy: 'reject', // 'reject' | 'fifo'
  maxQueueSize: 100, // For fifo strategy
  redirect: '/too-many-requests'
});
```

### Global vs Per-User

```typescript
// Global limit (all users share)
const globalLimit = createConcurrentLimitMiddleware({
  maxConcurrent: 100,
  perUser: false
});

// Per-user limit
const perUserLimit = createConcurrentLimitMiddleware({
  maxConcurrent: 5,
  perUser: true,
  userIdPath: 'user.id'
});
```

## Combining Advanced Patterns

```typescript
import { definePipeline } from 'ngxsmk-gatekeeper';

const resilientPipeline = definePipeline('resilient', [
  concurrentLimitMiddleware,
  circuitBreakerMiddleware,
  retryMiddleware
]);
```

## Examples

### Resilient External API Call

```typescript
const resilientExternalAPI = definePipeline('external-api', [
  createConcurrentLimitMiddleware({
    maxConcurrent: 5,
    perUser: false
  }),
  createCircuitBreakerMiddleware({
    name: 'external-api',
    middleware: externalAPIMiddleware,
    failureThreshold: 5,
    timeout: 60000,
    fallback: () => ({ allow: false, redirect: '/service-unavailable' })
  }),
  createRetryMiddleware({
    middleware: externalAPIMiddleware,
    maxRetries: 3,
    backoff: 'exponential'
  })
]);
```

### Conditional with Fallback

```typescript
const smartAccess = createConditionalMiddleware({
  condition: (context) => {
    return context['user']?.subscription === 'premium';
  },
  ifTrue: premiumMiddleware,
  ifFalse: createCircuitBreakerMiddleware({
    name: 'standard-api',
    middleware: standardMiddleware,
    fallback: () => ({ allow: false, redirect: '/upgrade' })
  })
});
```

## Best Practices

1. **Use circuit breakers** - Protect against cascading failures
2. **Retry wisely** - Don't retry non-retryable errors
3. **Set reasonable limits** - Balance performance and user experience
4. **Monitor patterns** - Track circuit breaker and retry metrics
5. **Test fallbacks** - Ensure fallback behavior works

## Next Steps

- [Performance](/guide/performance) - Performance optimization
- [Monitoring](/guide/monitoring) - Analytics and logging

