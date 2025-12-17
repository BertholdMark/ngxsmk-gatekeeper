/**
 * Configuration validator types
 */

/**
 * Validation issue severity
 */
export enum ValidationSeverity {
  Error = 'error',
  Warning = 'warning',
  Info = 'info',
}

/**
 * Validation issue category
 */
export enum ValidationCategory {
  Type = 'type',
  Performance = 'performance',
  Security = 'security',
  BestPractice = 'best-practice',
  Configuration = 'configuration',
}

/**
 * Validation issue
 */
export interface ValidationIssue {
  /**
   * Issue severity
   */
  severity: ValidationSeverity;
  /**
   * Issue category
   */
  category: ValidationCategory;
  /**
   * Issue code (for programmatic handling)
   */
  code: string;
  /**
   * Human-readable message
   */
  message: string;
  /**
   * Detailed description
   */
  description?: string;
  /**
   * Path to the configuration property (e.g., 'middlewares[0]')
   */
  path?: string;
  /**
   * Suggested fix
   */
  suggestion?: string;
  /**
   * Related documentation URL
   */
  documentationUrl?: string;
}

/**
 * Validation result
 */
export interface ValidationResult {
  /**
   * Whether validation passed (no errors)
   */
  valid: boolean;
  /**
   * Total number of issues
   */
  totalIssues: number;
  /**
   * Number of errors
   */
  errors: number;
  /**
   * Number of warnings
   */
  warnings: number;
  /**
   * Number of info messages
   */
  info: number;
  /**
   * All validation issues
   */
  issues: ValidationIssue[];
  /**
   * Errors only
   */
  errorIssues: ValidationIssue[];
  /**
   * Warnings only
   */
  warningIssues: ValidationIssue[];
  /**
   * Info messages only
   */
  infoIssues: ValidationIssue[];
  /**
   * Issues grouped by category
   */
  issuesByCategory: Record<ValidationCategory, ValidationIssue[]>;
  /**
   * Performance analysis
   */
  performance?: PerformanceAnalysis;
  /**
   * Security analysis
   */
  security?: SecurityAnalysis;
}

/**
 * Performance analysis
 */
export interface PerformanceAnalysis {
  /**
   * Total middleware count
   */
  middlewareCount: number;
  /**
   * Estimated execution time (ms)
   */
  estimatedExecutionTime: number;
  /**
   * Performance score (0-100)
   */
  score: number;
  /**
   * Performance recommendations
   */
  recommendations: ValidationIssue[];
  /**
   * Potential bottlenecks
   */
  bottlenecks: Array<{
    middleware: string;
    estimatedTime: number;
    reason: string;
  }>;
}

/**
 * Security analysis
 */
export interface SecurityAnalysis {
  /**
   * Security score (0-100)
   */
  score: number;
  /**
   * Security recommendations
   */
  recommendations: ValidationIssue[];
  /**
   * Missing security features
   */
  missingFeatures: string[];
  /**
   * Security risks identified
   */
  risks: Array<{
    risk: string;
    severity: ValidationSeverity;
    description: string;
  }>;
}

/**
 * Validator options
 */
export interface ValidatorOptions {
  /**
   * Enable type checking
   */
  checkTypes?: boolean;
  /**
   * Enable performance analysis
   */
  checkPerformance?: boolean;
  /**
   * Enable security analysis
   */
  checkSecurity?: boolean;
  /**
   * Enable best practice checks
   */
  checkBestPractices?: boolean;
  /**
   * Maximum middleware count before warning
   */
  maxMiddlewareCount?: number;
  /**
   * Maximum estimated execution time (ms) before warning
   */
  maxExecutionTime?: number;
  /**
   * Require authentication middleware
   */
  requireAuth?: boolean;
  /**
   * Require audit logging in production
   */
  requireAuditInProduction?: boolean;
}

