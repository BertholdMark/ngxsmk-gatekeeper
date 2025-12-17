# How to Run Demo Examples

The demo examples in this directory are **copy-paste ready** code snippets that demonstrate how to use `ngxsmk-gatekeeper`. They are not directly runnable in this repository, but can be easily integrated into an Angular application.

## Quick Start: Create a Demo App

### Option 1: Create a New Angular App (Recommended for Testing)

1. **Create a new Angular application:**
   ```bash
   ng new gatekeeper-demo
   cd gatekeeper-demo
   ```

2. **Install ngxsmk-gatekeeper:**
   ```bash
   npm install ngxsmk-gatekeeper
   ```

3. **Copy a demo file:**
   ```bash
   # Copy the minimal auth demo
   cp path/to/ngxsmk-gatekeeper/projects/ngxsmk-gatekeeper/examples/demos/minimal-auth-demo.ts src/app/app.component.ts
   ```

4. **Update the main.ts file:**
   ```typescript
   import { bootstrapApplication } from '@angular/platform-browser';
   import { AppComponent } from './app/app.component';
   
   bootstrapApplication(AppComponent);
   ```

5. **Run the application:**
   ```bash
   ng serve
   ```

### Option 2: Integrate into Existing Angular App

1. **Install ngxsmk-gatekeeper:**
   ```bash
   npm install ngxsmk-gatekeeper
   ```

2. **Copy the demo code** into your existing Angular application:
   - Copy the demo file content
   - Update imports to match your project structure
   - Add the components to your routes
   - Update `app.config.ts` or `main.ts` with the providers

3. **Example integration in `app.config.ts`:**
   ```typescript
   import { ApplicationConfig } from '@angular/core';
   import { provideRouter } from '@angular/router';
   import { provideHttpClient } from '@angular/common/http';
   import { provideGatekeeper } from 'ngxsmk-gatekeeper';
   import { createAuthMiddleware } from 'ngxsmk-gatekeeper/lib/middlewares';
   
   export const appConfig: ApplicationConfig = {
     providers: [
       provideRouter(routes),
       provideHttpClient(),
       provideGatekeeper({
         middlewares: [createAuthMiddleware()],
         onFail: '/login',
       }),
     ],
   };
   ```

## Available Demos

### 1. Minimal Auth Demo (`minimal-auth-demo.ts`)

**What it demonstrates:**
- Basic authentication protection
- Public vs protected routes
- Simple login/logout flow

**To run:**
1. Copy the entire file content
2. Replace your `app.component.ts` with the demo code
3. Update `main.ts` to bootstrap the app
4. Run `ng serve`

**Expected behavior:**
- Home page is accessible without authentication
- Dashboard requires authentication
- Clicking "Login" allows access to dashboard

### 2. Role-Based Routing Demo (`role-based-routing-demo.ts`)

**What it demonstrates:**
- Role-based access control
- Multiple protected routes with different role requirements
- Reusable middleware pipelines

**To run:**
1. Copy the demo file
2. Update your routes configuration
3. Add the components
4. Run `ng serve`

**Expected behavior:**
- Different routes require different roles (admin, moderator, user)
- Unauthorized users are redirected appropriately
- Role-based middleware blocks access

### 3. HTTP Protection Demo (`http-protection-demo.ts`)

**What it demonstrates:**
- HTTP request protection
- Per-request middleware configuration
- API call blocking based on authentication/roles

**To run:**
1. Copy the demo file
2. Set up HTTP client in your app
3. Configure the HTTP interceptor
4. Test API calls

**Expected behavior:**
- HTTP requests are protected by middleware
- Unauthenticated requests are blocked
- Role-based API protection works

## Step-by-Step: Running Minimal Auth Demo

Here's a detailed walkthrough for the minimal auth demo:

### Step 1: Create Angular App
```bash
ng new gatekeeper-demo --standalone
cd gatekeeper-demo
```

### Step 2: Install Library
```bash
npm install ngxsmk-gatekeeper
```

### Step 3: Copy Demo Code

Create `src/app/app.component.ts`:
```typescript
// Copy entire content from minimal-auth-demo.ts
```

### Step 4: Update main.ts

Create `src/main.ts`:
```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent);
```

### Step 5: Run
```bash
ng serve
```

Navigate to `http://localhost:4200` and test the authentication flow.

## Troubleshooting

### Import Errors

If you see import errors:
- Make sure `ngxsmk-gatekeeper` is installed: `npm install ngxsmk-gatekeeper`
- Check that the library is built: `npm run build` (in the library directory)
- Verify the import paths match your installed version

### Route Not Found

If routes don't work:
- Make sure `provideRouter()` is in your providers
- Check that routes are properly configured
- Verify components are imported

### Middleware Not Working

If middleware doesn't execute:
- Enable debug mode: `provideGatekeeper({ debug: true, ... })`
- Check browser console for middleware logs
- Verify user context is provided correctly

## Next Steps

After running the demos:

1. **Read the documentation**: See [README.md](../../../README.md)
2. **Explore more examples**: Check other example files in the `examples/` directory
3. **Build your own middleware**: Use `createMiddleware()` helper
4. **Create custom pipelines**: Group middleware for reuse

## Need Help?

- Check the [main README](../../../README.md) for full documentation
- Review [API documentation](../../../README.md#api-reference)
- Open an issue on GitHub

