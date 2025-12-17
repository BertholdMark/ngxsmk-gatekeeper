# Performance Optimization

Optimize your application's performance with caching and batching.

## Caching

Cache middleware results to reduce computation:

```typescript
import { createCacheMiddleware } from 'ngxsmk-gatekeeper';

const cacheMiddleware = createCacheMiddleware({
  ttl: 3600, // 1 hour in seconds
  keyGenerator: (context) => {
    const request = context['request'];
    if (request) {
      return `${request.method}:${request.url}`;
    }
    return context['path'] || 'unknown';
  },
  cacheOnlySuccess: true, // Only cache successful results
  storage: new MemoryCacheStorage() // Or custom storage
});
```

### Custom Cache Storage

```typescript
import { CacheStorage } from 'ngxsmk-gatekeeper';

class RedisCacheStorage implements CacheStorage {
  async get(key: string) {
    return await redis.get(key);
  }
  
  async set(key: string, value: unknown, ttl?: number) {
    await redis.setex(key, ttl || 3600, JSON.stringify(value));
  }
  
  async delete(key: string) {
    await redis.del(key);
  }
}

const redisCache = createCacheMiddleware({
  ttl: 3600,
  storage: new RedisCacheStorage()
});
```

## Request Batching

Batch multiple requests together:

```typescript
import { createRequestBatchingMiddleware } from 'ngxsmk-gatekeeper';

const batchingMiddleware = createRequestBatchingMiddleware({
  batchWindow: 100, // 100ms window
  maxBatchSize: 10,
  canCombine: (req1, req2) => {
    // Determine if requests can be combined
    return req1['path'] === req2['path'];
  },
  combineRequests: (requests) => {
    // Combine multiple requests into one
    return requests[0]!; // Use first request
  },
  splitResult: (combinedResult, requests) => {
    // Split combined result back to individual results
    return requests.map(() => combinedResult);
  }
});
```

### API Request Batching

```typescript
const apiBatching = createRequestBatchingMiddleware({
  batchWindow: 50, // 50ms
  maxBatchSize: 20,
  canCombine: (req1, req2) => {
    const r1 = req1['request'];
    const r2 = req2['request'];
    return r1?.url === r2?.url && r1?.method === r2?.method;
  },
  combineRequests: (requests) => {
    // Combine into batch request
    const batchData = requests.map(r => r['request']?.body);
    return {
      ...requests[0]!,
      'batchData': batchData
    };
  },
  splitResult: (result, requests) => {
    // Split batch response
    if (typeof result === 'object' && 'batchResults' in result) {
      return (result as { batchResults: unknown[] }).batchResults;
    }
    return requests.map(() => result);
  }
});
```

## Combining Performance Features

```typescript
import { definePipeline } from 'ngxsmk-gatekeeper';

const performancePipeline = definePipeline('performance', [
  cacheMiddleware,
  batchingMiddleware
]);
```

## Examples

### Cached API Responses

```typescript
const cachedAPI = definePipeline('cached-api', [
  createCacheMiddleware({
    ttl: 300, // 5 minutes
    keyGenerator: (ctx) => {
      const request = ctx['request'];
      return `${request?.method}:${request?.url}`;
    }
  }),
  apiMiddleware
]);
```

### Batched Database Queries

```typescript
const batchedQueries = createRequestBatchingMiddleware({
  batchWindow: 100,
  maxBatchSize: 50,
  canCombine: (req1, req2) => {
    // Combine similar queries
    return req1['queryType'] === req2['queryType'];
  },
  combineRequests: (requests) => {
    // Combine into batch query
    const queries = requests.map(r => r['query']);
    return {
      ...requests[0]!,
      'batchQueries': queries
    };
  }
});
```

## Best Practices

1. **Cache wisely** - Don't cache sensitive or frequently changing data
2. **Set appropriate TTL** - Balance freshness and performance
3. **Monitor cache hit rates** - Track cache effectiveness
4. **Batch similar requests** - Only batch requests that can be combined
5. **Test performance** - Measure before and after optimization

## Performance Metrics

Track performance improvements:

```typescript
import { createAnalyticsMiddleware } from 'ngxsmk-gatekeeper';

const performanceAnalytics = createAnalyticsMiddleware({
  sink: {
    track: async (event) => {
      if (event.duration) {
        // Track response times
        await trackMetric('response_time', event.duration);
      }
    }
  },
  trackMetrics: true
});
```

## Next Steps

- [Monitoring](/guide/monitoring) - Analytics and logging
- [Debug Mode](/guide/debug-mode) - Performance debugging
