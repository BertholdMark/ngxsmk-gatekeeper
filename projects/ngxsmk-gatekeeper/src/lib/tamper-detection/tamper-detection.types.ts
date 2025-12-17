/**
 * Tamper detection types and configuration
 */

/**
 * Tamper detection configuration
 */
export interface TamperDetectionConfig {
  /**
   * Enable tamper detection
   * @default false
   */
  enabled?: boolean;
  /**
   * Strict mode - blocks execution when tampering is detected
   * When false, only logs warnings (development mode)
   * @default false
   */
  strict?: boolean;
  /**
   * Check for missing gatekeeper provider
   * @default true
   */
  checkMissingProvider?: boolean;
  /**
   * Check for disabled interceptors
   * @default true
   */
  checkDisabledInterceptors?: boolean;
  /**
   * Check for unexpected execution order
   * @default true
   */
  checkExecutionOrder?: boolean;
  /**
   * Expected middleware execution order (for order validation)
   * If provided, validates that middleware executes in this order
   */
  expectedOrder?: string[];
}

/**
 * Tamper detection result
 */
export interface TamperDetectionResult {
  /**
   * Whether tampering was detected
   */
  tampered: boolean;
  /**
   * Array of detected tampering issues
   */
  issues: TamperIssue[];
}

/**
 * Tamper detection issue
 */
export interface TamperIssue {
  /**
   * Type of tampering detected
   */
  type: 'missing-provider' | 'disabled-interceptor' | 'execution-order' | 'unknown';
  /**
   * Description of the issue
   */
  message: string;
  /**
   * Severity level
   */
  severity: 'warning' | 'error';
}

