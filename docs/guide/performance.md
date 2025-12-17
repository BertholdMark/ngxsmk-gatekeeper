# Performance

Monitor and optimize middleware performance with built-in benchmarking.

## Enabling Benchmarking

Enable benchmark mode in your configuration:

```typescript
provideGatekeeper({
  middlewares: [authMiddleware],
  onFail: '/login',
  benchmark: {
    enabled: true,
    middlewareThreshold: 100, // Warn if middleware > 100ms
    chainThreshold: 500,      // Warn if chain > 500ms
    sampleSize: 50,          // Number of executions to track
  },
});
```

## Benchmark Features

- Automatic warnings when thresholds are exceeded
- Optimization suggestions
- Performance statistics
- Identify slow middlewares

## Threshold Configuration

### `middlewareThreshold`

Warn when individual middleware exceeds this time (in milliseconds):

```typescript
benchmark: {
  enabled: true,
  middlewareThreshold: 100, // Warn if any middleware > 100ms
}
```

### `chainThreshold`

Warn when entire chain exceeds this time (in milliseconds):

```typescript
benchmark: {
  enabled: true,
  chainThreshold: 500, // Warn if chain > 500ms
}
```

### `sampleSize`

Number of executions to track for statistics:

```typescript
benchmark: {
  enabled: true,
  sampleSize: 50, // Track last 50 executions
}
```

## Performance Warnings

When thresholds are exceeded, you'll see warnings like:

```
⚠ [Gatekeeper] Middleware "slowMiddleware" exceeded threshold: 150ms (threshold: 100ms)
⚠ [Gatekeeper] Chain exceeded threshold: 600ms (threshold: 500ms)
```

## Optimization Tips

1. **Async Operations**: Use async middleware for I/O operations
2. **Caching**: Cache expensive checks
3. **Early Returns**: Return false early when possible
4. **Pipeline Order**: Put fast checks first

## Example

```typescript
provideGatekeeper({
  middlewares: [
    fastCheckMiddleware,    // Fast check first
    slowAsyncMiddleware,     // Slow check last
  ],
  benchmark: {
    enabled: true,
    middlewareThreshold: 50,
    chainThreshold: 200,
  },
});
```

## Next Steps

- [Debug Mode](/guide/debug-mode) - Enable detailed logging
- [Configuration](/guide/configuration) - Learn about all options

