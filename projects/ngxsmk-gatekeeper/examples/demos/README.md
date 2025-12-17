# Demo Examples

Complete, copy-paste ready examples for ngxsmk-gatekeeper.

## Available Demos

### 1. Minimal Auth Demo (`minimal-auth-demo.ts`)

Basic authentication protection example.

**Features:**
- Simple authentication check
- Protected route (dashboard)
- Public route (home)
- Login/logout functionality

**Use Case:** Perfect for getting started with basic route protection.

### 2. Role-Based Routing Demo (`role-based-routing-demo.ts`)

Role-based access control example.

**Features:**
- Authentication middleware
- Role-based middleware (admin, moderator)
- Reusable pipelines
- Multiple protected routes with different role requirements
- Unauthorized page handling

**Use Case:** Applications that need role-based access control.

### 3. HTTP Protection Demo (`http-protection-demo.ts`)

HTTP request protection example.

**Features:**
- Global HTTP request protection
- Per-request middleware configuration
- Role-based API protection
- Request blocking on middleware failure
- Error handling

**Use Case:** Protecting API calls based on authentication and roles.

## How to Use

1. **Copy the demo file** to your Angular project
2. **Install ngxsmk-gatekeeper**: `npm install ngxsmk-gatekeeper`
3. **Update imports** if needed (paths may vary)
4. **Run the application**: `ng serve`

## Important Notes

### User Context

These demos use localStorage for simplicity. In a real application:

- Use an authentication service
- Provide user context through dependency injection
- Store tokens securely
- Handle authentication state properly

### Middleware Context

The middleware checks for user data in the context. The demos show the structure needed:

```typescript
{
  user: {
    isAuthenticated: true,
    roles: ['admin', 'user'], // For role middleware
  }
}
```

### Production Considerations

- **Server-side validation**: Always implement server-side protection
- **Token management**: Use secure token storage and refresh
- **Error handling**: Implement proper error handling and user feedback
- **Security**: Never rely solely on client-side protection

## Next Steps

After trying these demos:

1. **Read the documentation**: See [README.md](../../../README.md)
2. **Explore middleware**: Check out [built-in middleware examples](../../../src/lib/middlewares)
3. **Create custom middleware**: Use `createMiddleware()` helper
4. **Build pipelines**: Group middleware for reuse

## Support

For questions or issues:
- Check the [main README](../../../README.md)
- Review [API documentation](../../../README.md#api-reference)
- Open an issue on GitHub

