import { createAuthMiddleware } from 'ngxsmk-gatekeeper/lib/middlewares';

/**
 * Authentication middleware for <%- fileName %>
 * 
 * Checks if the user is authenticated before allowing access.
 */
export const <%= fileName %>AuthMiddleware = createAuthMiddleware({
  authPath: 'user.isAuthenticated',
  requireUser: true,
});

