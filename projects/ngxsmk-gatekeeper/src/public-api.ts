/*
 * Public API Surface of ngxsmk-gatekeeper
 */

// Core middleware types
export type {
  MiddlewareContext,
  NgxMiddleware,
  MiddlewareResult,
  MiddlewareResponse,
  MiddlewareReturn,
} from './lib/core';

// Angular providers and configuration
export type { GatekeeperConfig, RouteGatekeeperConfig } from './lib/angular';
export { provideGatekeeper, withGatekeeper } from './lib/angular';

// Angular guards and interceptors
export { gatekeeperGuard, gatekeeperLoadGuard, GatekeeperGuard } from './lib/angular';
export { gatekeeperInterceptor, GatekeeperInterceptor } from './lib/angular';

// Helper utilities
export { createMiddleware, definePipeline, resolvePipelines, isPipeline } from './lib/helpers';
export type { MiddlewareHandler, NamedMiddleware, MiddlewarePipeline } from './lib/helpers';

// Feature flag providers
export type { FeatureFlagProvider } from './lib/providers';
export { 
  FEATURE_FLAG_PROVIDER,
  provideFeatureFlagProvider,
  LocalStorageFeatureFlagProvider,
  RemoteApiFeatureFlagProvider,
} from './lib/providers';
export type { RemoteApiFeatureFlagProviderConfig } from './lib/providers';

// SSR adapter (optional - for Angular Universal support)
export type { SsrAdapterConfig } from './lib/angular';
export { 
  provideSsrAdapter,
  SsrAdapter,
  SSR_ADAPTER,
} from './lib/angular';

// Benchmark utilities (optional - for performance monitoring)
export type { 
  BenchmarkConfig,
  MiddlewareBenchmarkStats,
  ChainBenchmarkStats,
} from './lib/core/benchmark';
export {
  getBenchmarkStats,
  clearBenchmarkStats,
} from './lib/core/benchmark';

// Policy engine (optional - for enterprise policy management)
export type { 
  Policy,
  PolicyEvaluator,
  PolicyRegistry,
} from './lib/policies';
export {
  policy,
  providePolicyRegistry,
  POLICY_REGISTRY,
  DefaultPolicyRegistry,
  createPolicyMiddleware,
} from './lib/policies';
export type { PolicyMiddlewareOptions } from './lib/policies';

// Permissions and role matrix (optional - for permission-based access control)
export {
  permissionMiddleware,
  parsePermission,
  matchesPermission,
  hasPermission,
  hasAllPermissions,
  resolveRoles,
  hasRole,
  hasAnyRole,
  hasAllRoles,
} from './lib/permissions';
export type {
  PermissionMiddlewareOptions,
  RoleHierarchy,
} from './lib/permissions';

// Audit logging (optional - for access decision logging)
export {
  createAuditMiddleware,
  logAuditDecision,
  ConsoleAuditSink,
  LocalStorageAuditSink,
  RemoteApiAuditSink,
  sanitizeObject,
  extractUserId,
} from './lib/audit';
export type {
  AuditLogEntry,
  AuditSink,
  AuditMiddlewareConfig,
  RemoteApiAuditSinkOptions,
} from './lib/audit';

// Zero Trust enforcement mode (optional - for enterprise security)
export { publicMiddleware } from './lib/zero-trust';

// Environment-aware middleware (optional - for environment-specific behavior)
export {
  environmentMiddleware,
  detectEnvironment,
  isDevelopment,
  isStaging,
  isProduction,
} from './lib/environment';
export type {
  Environment,
  EnvironmentConfig,
  EnvironmentMiddlewareOptions,
} from './lib/environment';

// Security headers (optional - for injecting headers into HTTP requests)
export {
  securityHeadersMiddleware,
  createSecurityHeaders,
} from './lib/security-headers';
export type {
  SecurityHeadersConfig,
  CommonSecurityHeadersOptions,
} from './lib/security-headers';

// Tamper detection (optional - for detecting misconfiguration and tampering)
export {
  detectTampering,
  logTamperIssues,
  getExecutionOrderTracker,
} from './lib/tamper-detection';
export type {
  TamperDetectionConfig,
  TamperDetectionResult,
  TamperIssue,
} from './lib/tamper-detection';

// Compliance mode (optional - for SOC2, ISO 27001, and similar compliance frameworks)
export {
  ComplianceAuditSink,
  generateComplianceLog,
  formatComplianceLog,
  createExecutionTrace,
  createDecisionRationale,
  createCompliantMiddleware,
} from './lib/compliance';
export type {
  ComplianceConfig,
  ComplianceLogEntry,
  ComplianceExecutionTrace,
  ComplianceDecisionRationale,
} from './lib/compliance';

// Extension API (for plugin architecture)
export {
  provideExtensions,
  getExtensionRegistry,
  ExtensionRegistry,
} from './lib/extensions';
export type {
  GatekeeperExtension,
  ExtensionContext,
  ExtensionRegistration,
} from './lib/extensions';

// Adapter API (for enterprise authentication providers)
export {
  provideAdapters,
  getAdapterRegistry,
  createAdapterMiddleware,
  AdapterRegistry,
} from './lib/adapters';
export type {
  AuthAdapter,
  AuthResult,
  AuthUser,
  AdapterConfig,
  AdapterMiddlewareOptions,
} from './lib/adapters';

// License verification hook (optional - for enterprise plugins)
export {
  provideLicenseVerifiers,
  getLicenseRegistry,
  verifyLicense,
  createLicenseMiddleware,
  createLicenseFeatureMiddleware,
  LicenseRegistry,
} from './lib/license';
export type {
  LicenseVerifier,
  LicenseVerificationResult,
  LicenseMetadata,
  LicenseVerificationContext,
  LicenseVerificationOptions,
} from './lib/license';

// Diagnostics export (optional - for debugging and support)
export {
  collectDiagnostics,
  exportDiagnostics,
  downloadDiagnostics,
} from './lib/diagnostics';
export type {
  DiagnosticsInfo,
  DiagnosticsExportFormat,
  DiagnosticsExportOptions,
  MiddlewareDiagnostics,
  ExecutionOrderDiagnostics,
} from './lib/diagnostics';
