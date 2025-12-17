# Guards API

APIs for route protection using guards.

## `gatekeeperGuard`

Functional guard for route protection (Angular 17+).

### Usage

```typescript
const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [gatekeeperGuard],
  },
];
```

### Type

```typescript
const gatekeeperGuard: CanActivateFn = (route, state) => {
  // Implementation
};
```

## `gatekeeperLoadGuard`

Functional guard for lazy-loaded routes (Angular 17+).

### Usage

```typescript
const routes: Routes = [
  {
    path: 'admin',
    loadChildren: () => import('./admin.routes'),
    canLoad: [gatekeeperLoadGuard],
  },
];
```

### Type

```typescript
const gatekeeperLoadGuard: CanLoadFn = (route, segments) => {
  // Implementation
};
```

## Route Configuration

Routes can override global middleware:

```typescript
const routes: Routes = [
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [gatekeeperGuard],
    data: {
      gatekeeper: {
        middlewares: [adminPipeline],
        onFail: '/unauthorized',
      },
    },
  },
];
```

## Next Steps

- [Route Protection](/guide/route-protection) - Complete route protection guide
- [Interceptors API](/api/interceptors) - HTTP protection APIs

