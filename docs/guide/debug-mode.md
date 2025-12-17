# Debug Mode

Enable detailed logging to understand middleware execution.

## Enabling Debug Mode

Enable debug mode in your configuration:

```typescript
provideGatekeeper({
  middlewares: [authMiddleware],
  onFail: '/login',
  debug: true, // Enable debug logging
});
```

## Debug Output

When debug mode is enabled, you'll see:

- Execution order and timing
- Pass/fail status for each middleware
- Route path and context information
- Lazy module chunk names (for CanLoad)
- Blocked chunk loading warnings

## Example Output

```
[Gatekeeper] Chain started: /dashboard
[Gatekeeper] Middleware[0] (auth): ✓ Passed (2.3ms)
[Gatekeeper] Middleware[1] (role): ✓ Passed (1.1ms)
[Gatekeeper] Chain completed: ✓ Allowed (3.4ms)
```

## Global Debug Hook

Access middleware execution data from browser console:

```typescript
// In browser console
const hook = window.__NGXSMK_GATEKEEPER__;
if (hook) {
  const stats = hook.getStats();
  const latest = hook.getLatestChain();
  console.log('Stats:', stats);
  console.log('Latest chain:', latest);
}
```

## Debug Hook API

### `getStats()`

Get execution statistics:

```typescript
const stats = hook.getStats();
// Returns: { totalChains, totalMiddleware, averageTime, ... }
```

### `getLatestChain()`

Get the most recent chain execution:

```typescript
const chain = hook.getLatestChain();
// Returns: ChainExecutionRecord | null
```

### `getMiddlewareExecutions()`

Get all middleware executions:

```typescript
const executions = hook.getMiddlewareExecutions();
// Returns: MiddlewareExecutionRecord[]
```

### `getChains()`

Get all chain executions:

```typescript
const chains = hook.getChains();
// Returns: ChainExecutionRecord[]
```

## Production Considerations

Debug mode is automatically disabled in production builds:

```typescript
// Automatically disabled when NODE_ENV === 'production'
debug: true
```

## Next Steps

- [Performance](/guide/performance) - Monitor performance with benchmarking
- [Configuration](/guide/configuration) - Learn about all configuration options

