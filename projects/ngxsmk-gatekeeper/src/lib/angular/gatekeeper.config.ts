import { NgxMiddleware } from '../core';
import { MiddlewarePipeline } from '../helpers';
import { BenchmarkConfig } from '../core/benchmark';
import { AuditMiddlewareConfig } from '../audit/audit.types';
import { TamperDetectionConfig } from '../tamper-detection/tamper-detection.types';
import { ComplianceConfig } from '../compliance/compliance.types';

/**
 * Configuration for the Gatekeeper
 */
export interface GatekeeperConfig {
  /**
   * Array of middleware functions and/or pipelines to execute
   * 
   * You can mix individual middlewares and pipelines:
   * ```typescript
   * middlewares: [
   *   authMiddleware,
   *   adminPipeline,
   *   customMiddleware
   * ]
   * ```
   */
  middlewares: (NgxMiddleware | MiddlewarePipeline)[];
  /**
   * Redirect path or URL when middleware chain fails
   */
  onFail: string;
  /**
   * Enable debug logging for middleware execution
   * 
   * When enabled, logs middleware execution order, timing, and results to console.
   * Automatically disabled in production builds.
   * 
   * @default false
   */
  debug?: boolean;
  /**
   * Benchmark configuration for performance monitoring
   * 
   * When enabled, measures middleware execution times and warns when thresholds are exceeded.
   * Provides optimization suggestions for slow middlewares.
   * 
   * @default { enabled: false }
   */
  benchmark?: BenchmarkConfig;
  /**
   * Audit logging configuration
   * 
   * When provided, logs access decisions (allow/deny) to configured audit sinks.
   * PII is automatically sanitized before logging.
   * 
   * @default undefined (audit logging disabled)
   */
  audit?: AuditMiddlewareConfig;
  /**
   * Zero Trust enforcement mode
   * 
   * When enabled, enforces a zero trust security model:
   * - Every route and request must explicitly opt in with middleware
   * - Default behavior is deny (access denied if no middleware is configured)
   * - Public routes must explicitly declare `publicMiddleware()` to allow access
   * 
   * **Enterprise Usage:**
   * 
   * Zero trust mode is designed for enterprise applications where security is paramount.
   * It ensures that no route or API endpoint is accidentally left unprotected.
   * 
   * **How it works:**
   * 1. Routes without `canActivate: [gatekeeperGuard]` are automatically denied
   * 2. Routes with the guard but no middleware configuration are denied
   * 3. Routes must explicitly configure middleware (global, route-level, or publicMiddleware)
   * 4. HTTP requests without middleware configuration are denied
   * 5. Public routes must use `publicMiddleware()` to explicitly allow access
   * 
   * **Best Practices:**
   * - Use route-level middleware for fine-grained control
   * - Use `publicMiddleware()` sparingly and only for truly public content
   * - Combine with audit logging to track all access decisions
   * - Use policies and permissions for complex authorization logic
   * 
   * @default false (zero trust mode disabled)
   * 
   * @example
   * ```typescript
   * // Enable zero trust mode
   * provideGatekeeper({
   *   middlewares: [], // No default middleware - each route must opt in
   *   onFail: '/unauthorized',
   *   zeroTrust: true,
   * });
   * 
   * // Routes must explicitly configure middleware
   * const routes: Routes = [
   *   // Protected route - requires authentication
   *   {
   *     path: 'dashboard',
   *     canActivate: [gatekeeperGuard],
   *     data: {
   *       gatekeeper: {
   *         middlewares: [authMiddleware],
   *       },
   *     },
   *   },
   *   // Public route - must explicitly declare
   *   {
   *     path: 'about',
   *     canActivate: [gatekeeperGuard],
   *     data: {
   *       gatekeeper: {
   *         middlewares: [publicMiddleware()],
   *       },
   *     },
   *   },
   * ];
   * ```
   */
  zeroTrust?: boolean;
  /**
   * Tamper detection configuration
   * 
   * **IMPORTANT LIMITATIONS:**
   * 
   * Client-side tamper detection has inherent limitations:
   * 
   * 1. **Can be bypassed**: Since this runs in the browser, determined attackers
   *    can disable JavaScript, modify code, or use browser dev tools to bypass checks.
   * 
   * 2. **Not a security measure**: This is a **detection and warning system**, not a
   *    security measure. It helps identify misconfiguration and accidental tampering,
   *    but should not be relied upon for security.
   * 
   * 3. **Development tool**: Primarily useful for:
   *    - Detecting misconfiguration during development
   *    - Identifying accidental removal of providers/interceptors
   *    - Monitoring execution order for debugging
   * 
   * 4. **Server-side validation required**: For actual security, always implement
   *    server-side validation and authentication. Client-side checks are easily bypassed.
   * 
   * @default { enabled: false, strict: false }
   * 
   * @example
   * ```typescript
   * // Development mode - warnings only
   * provideGatekeeper({
   *   middlewares: [authMiddleware],
   *   onFail: '/login',
   *   tamperDetection: {
   *     enabled: true,
   *     strict: false, // Only log warnings
   *   },
   * });
   * 
   * // Strict mode - block execution (development only, not recommended for production)
   * provideGatekeeper({
   *   middlewares: [authMiddleware],
   *   onFail: '/login',
   *   tamperDetection: {
   *     enabled: true,
   *     strict: true, // Block execution when tampering detected
   *   },
   * });
   * ```
   */
  tamperDetection?: TamperDetectionConfig;
  /**
   * Compliance mode configuration
   * 
   * **Designed for SOC2, ISO 27001, and similar compliance frameworks.**
   * 
   * When enabled, ensures:
   * - **Deterministic execution order**: Middleware executes in a predictable, documented order
   * - **Explicit allow/deny outcomes**: All decisions are clear and traceable
   * - **Structured logs**: Generates parseable logs (JSON, CSV, JSONL) for audit purposes
   * - **Complete audit trails**: Includes execution traces and decision rationale
   * 
   * **Compliance Features:**
   * 
   * 1. **Deterministic Execution**: Middleware always executes in the same order,
   *    ensuring consistent behavior for compliance reviews.
   * 
   * 2. **Explicit Decisions**: All access decisions are explicitly documented with
   *    clear reasons, making it easy to demonstrate access control in audits.
   * 
   * 3. **Structured Logging**: Logs are generated in structured formats (JSON, CSV, JSONL)
   *    that can be easily parsed, analyzed, and retained for compliance purposes.
   * 
   * 4. **Execution Traces**: Complete traces of middleware execution, including timing
   *    and results, for full auditability.
   * 
   * 5. **Decision Rationale**: Documents why decisions were made, which middleware
   *    passed/failed, and what policies were applied.
   * 
   * **Best Practices for Compliance:**
   * 
   * - Enable compliance mode in production for audit readiness
   * - Use structured log format (JSON recommended)
   * - Configure log retention policy according to compliance requirements
   * - Integrate with compliance audit sinks (SIEM, log management systems)
   * - Review logs regularly for compliance reporting
   * - Document middleware execution order in compliance documentation
   * 
   * @default { enabled: false }
   * 
   * @example
   * ```typescript
   * // Enable compliance mode
   * provideGatekeeper({
   *   middlewares: [authMiddleware, permissionMiddleware],
   *   onFail: '/unauthorized',
   *   compliance: {
   *     enabled: true,
   *     logFormat: 'json',
   *     includeExecutionTrace: true,
   *     includeDecisionRationale: true,
   *     logRetention: {
   *       days: 90, // Retain logs for 90 days
   *       policy: 'SOC2-CC6.1',
   *     },
   *   },
   * });
   * 
   * // With compliance audit sink
   * import { ComplianceAuditSink } from 'ngxsmk-gatekeeper/lib/compliance';
   * import { RemoteApiAuditSink } from 'ngxsmk-gatekeeper/lib/audit';
   * 
   * const complianceSink = new ComplianceAuditSink(
   *   new RemoteApiAuditSink({ endpoint: 'https://logs.example.com/audit' }),
   *   { logFormat: 'json' }
   * );
   * 
   * provideGatekeeper({
   *   middlewares: [authMiddleware],
   *   onFail: '/login',
   *   audit: {
   *     sinks: complianceSink,
   *   },
   *   compliance: {
   *     enabled: true,
   *   },
   * });
   * ```
   */
  compliance?: ComplianceConfig;
}

