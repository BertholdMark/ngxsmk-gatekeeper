/**
 * Environment detection utilities
 * 
 * Provides runtime environment detection without requiring build-time replacements.
 */

/**
 * Environment type
 */
export type Environment = 'development' | 'staging' | 'production';

/**
 * Environment detection configuration
 */
export interface EnvironmentConfig {
  /**
   * Explicitly set the environment
   * If provided, this takes precedence over automatic detection
   */
  environment?: Environment;
  /**
   * Custom function to detect environment
   * If provided, this takes precedence over default detection
   */
  detectEnvironment?: () => Environment;
  /**
   * Hostname patterns for staging environment
   * Default: ['staging', 'stage', 'preview', 'test']
   */
  stagingHostnamePatterns?: string[];
  /**
   * Hostname patterns for development environment
   * Default: ['localhost', '127.0.0.1', '0.0.0.0', 'dev', 'local']
   */
  developmentHostnamePatterns?: string[];
}

/**
 * Default staging hostname patterns
 */
const DEFAULT_STAGING_PATTERNS = ['staging', 'stage', 'preview', 'test', 'qa'];

/**
 * Default development hostname patterns
 */
const DEFAULT_DEV_PATTERNS = ['localhost', '127.0.0.1', '0.0.0.0', 'dev', 'local'];

/**
 * Detects the current environment at runtime
 * 
 * Detection priority:
 * 1. Explicit environment in config
 * 2. Custom detection function
 * 3. Hostname-based detection
 * 4. NODE_ENV check (if available)
 * 5. Default to 'production' for safety
 * 
 * @param config - Optional environment configuration
 * @returns Detected environment
 */
export function detectEnvironment(config?: EnvironmentConfig): Environment {
  // Priority 1: Explicit environment
  if (config?.environment) {
    return config.environment;
  }

  // Priority 2: Custom detection function
  if (config?.detectEnvironment) {
    return config.detectEnvironment();
  }

  // Priority 3: Hostname-based detection (browser)
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname.toLowerCase();
    
    const stagingPatterns = config?.stagingHostnamePatterns ?? DEFAULT_STAGING_PATTERNS;
    const devPatterns = config?.developmentHostnamePatterns ?? DEFAULT_DEV_PATTERNS;

    // Check for staging patterns
    if (stagingPatterns.some(pattern => hostname.includes(pattern))) {
      return 'staging';
    }

    // Check for development patterns
    if (devPatterns.some(pattern => hostname.includes(pattern))) {
      return 'development';
    }
  }

  // Priority 4: NODE_ENV check (if available, e.g., in SSR)
  if (typeof process !== 'undefined' && process.env) {
    const nodeEnv = process.env['NODE_ENV'];
    if (nodeEnv === 'development') {
      return 'development';
    }
    if (nodeEnv === 'staging' || nodeEnv === 'test') {
      return 'staging';
    }
    if (nodeEnv === 'production') {
      return 'production';
    }
  }

  // Priority 5: Default to production for safety
  return 'production';
}

/**
 * Checks if the current environment is development
 */
export function isDevelopment(config?: EnvironmentConfig): boolean {
  return detectEnvironment(config) === 'development';
}

/**
 * Checks if the current environment is staging
 */
export function isStaging(config?: EnvironmentConfig): boolean {
  return detectEnvironment(config) === 'staging';
}

/**
 * Checks if the current environment is production
 */
export function isProduction(config?: EnvironmentConfig): boolean {
  return detectEnvironment(config) === 'production';
}

