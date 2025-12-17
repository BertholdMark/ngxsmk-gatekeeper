# Pipelines

Group middleware into reusable pipelines for better organization and maintainability.

## What are Pipelines?

Pipelines are named groups of middleware that can be reused across multiple routes or HTTP requests.

## Creating Pipelines

Use `definePipeline` to create a pipeline:

```typescript
import { definePipeline } from 'ngxsmk-gatekeeper';
import { createAuthMiddleware, createRoleMiddleware } from 'ngxsmk-gatekeeper/lib/middlewares';

const authMiddleware = createAuthMiddleware();
const adminMiddleware = createRoleMiddleware({ roles: ['admin'] });

const adminPipeline = definePipeline('adminOnly', [
  authMiddleware,
  adminMiddleware,
]);
```

## Using Pipelines

Pipelines can be used just like individual middleware:

```typescript
provideGatekeeper({
  middlewares: [
    adminPipeline,      // Use pipeline
    customMiddleware,   // Mix with individual middleware
  ],
  onFail: '/login',
});
```

## Route-Level Pipelines

Use pipelines in route configuration:

```typescript
const routes: Routes = [
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [gatekeeperGuard],
    data: {
      gatekeeper: {
        middlewares: [adminPipeline],
      },
    },
  },
];
```

## HTTP Request Pipelines

Use pipelines in HTTP requests:

```typescript
this.http.get('/api/admin/data', {
  context: withGatekeeper([adminPipeline]),
});
```

## Pipeline Examples

### Admin Pipeline

```typescript
const adminPipeline = definePipeline('adminOnly', [
  createAuthMiddleware(),
  createRoleMiddleware({ roles: ['admin'] }),
]);
```

### Moderator Pipeline

```typescript
const moderatorPipeline = definePipeline('moderatorOnly', [
  createAuthMiddleware(),
  createRoleMiddleware({ roles: ['moderator', 'admin'], mode: 'any' }),
]);
```

### User Pipeline

```typescript
const userPipeline = definePipeline('userOnly', [
  createAuthMiddleware(),
]);
```

## Composing Pipelines

Pipelines can include other pipelines:

```typescript
const baseAuthPipeline = definePipeline('baseAuth', [
  createAuthMiddleware(),
]);

const adminPipeline = definePipeline('admin', [
  ...baseAuthPipeline,
  createRoleMiddleware({ roles: ['admin'] }),
]);
```

## Benefits of Pipelines

1. **Reusability**: Define once, use everywhere
2. **Organization**: Group related middleware together
3. **Maintainability**: Update in one place
4. **Readability**: Clear, named middleware groups

## Next Steps

- [Route Protection](/guide/route-protection) - Use pipelines in routes
- [HTTP Protection](/guide/http-protection) - Use pipelines in HTTP requests
- [Examples](/examples/) - See complete pipeline examples

