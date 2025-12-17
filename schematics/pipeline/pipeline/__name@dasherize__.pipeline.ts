import { definePipeline } from 'ngxsmk-gatekeeper';
<%- middlewareImports %>

/**
 * Middleware pipeline: <%- pipelineName %>
 * 
 * This pipeline combines multiple middleware functions to create a reusable
 * protection chain.
 * 
 * @example
 * ```typescript
 * // Use in route configuration
 * {
 *   path: '<%= fileName %>',
 *   canActivate: [gatekeeperGuard],
 *   data: {
 *     gatekeeper: {
 *       middlewares: [<%= pipelineName %>Pipeline]
 *     }
 *   }
 * }
 * 
 * // Or use in global configuration
 * provideGatekeeper({
 *   middlewares: [<%= pipelineName %>Pipeline],
 *   onFail: '/login'
 * });
 * ```
 */
export const <%= pipelineName %>Pipeline = definePipeline('<%= pipelineName %>', [
<%- middlewareList %>
]);

