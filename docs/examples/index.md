# Examples

Complete, copy-paste ready examples demonstrating how to use ngxsmk-gatekeeper.

## Demo Examples

### [Minimal Auth Demo](./minimal-auth)

Basic authentication protection example showing:
- Simple authentication check
- Protected route (dashboard)
- Public route (home)
- Login/logout functionality

**Perfect for:** Getting started with basic route protection.

### [Role-Based Routing Demo](./role-based-routing)

Role-based access control example showing:
- Authentication middleware
- Role-based middleware (admin, moderator)
- Reusable pipelines
- Multiple protected routes with different role requirements

**Perfect for:** Applications that need role-based access control.

### [HTTP Protection Demo](./http-protection)

HTTP request protection example showing:
- Global HTTP request protection
- Per-request middleware configuration
- Role-based API protection
- Request blocking on middleware failure

**Perfect for:** Protecting API calls based on authentication and roles.

## How to Use Examples

1. **Copy the example code** to your Angular project
2. **Install ngxsmk-gatekeeper**: `npm install ngxsmk-gatekeeper`
3. **Update imports** if needed (paths may vary)
4. **Run the application**: `ng serve`

## More Examples

- [Adapters](./adapters) - Authentication adapter examples (Auth0, Firebase, JWT)
- [Plugins](./plugins) - Plugin development examples
- [Standalone Usage](./standalone) - Using the library in standalone components

## Important Notes

### User Context

These examples use localStorage for simplicity. In a real application:

- Use an authentication service
- Provide user context through dependency injection
- Store tokens securely
- Handle authentication state properly

### Production Considerations

- **Server-side validation**: Always implement server-side protection
- **Token management**: Use secure token storage and refresh
- **Error handling**: Implement proper error handling and user feedback
- **Security**: Never rely solely on client-side protection

## Next Steps

After trying these examples:

1. **Read the documentation**: See [Getting Started](/guide/getting-started)
2. **Explore middleware**: Check out [Middleware Pattern](/guide/middleware-pattern)
3. **Create custom middleware**: Use `createMiddleware()` helper
4. **Build pipelines**: Group middleware for reuse

