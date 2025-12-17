import { createMiddleware } from '../helpers';
import { MiddlewareContext } from '../core';

/**
 * Account lockout record
 */
interface LockoutRecord {
  attempts: number;
  lockedUntil: number;
  lastAttempt: number;
}

/**
 * In-memory lockout store (in production, use Redis or database)
 */
const lockoutStore = new Map<string, LockoutRecord>();

/**
 * Configuration options for account lockout middleware
 */
export interface AccountLockoutMiddlewareOptions {
  /**
   * Maximum number of failed attempts before lockout
   * Default: 5
   */
  maxAttempts?: number;
  /**
   * Lockout duration in seconds
   * Default: 900 (15 minutes)
   */
  lockoutDuration?: number;
  /**
   * Reset attempts on successful authentication
   * Default: true
   */
  resetOnSuccess?: boolean;
  /**
   * Path to user identifier in context
   * Default: 'user.id'
   */
  userIdPath?: string;
  /**
   * Function to check if authentication was successful
   * Should return true if auth succeeded
   */
  checkAuthSuccess?: (context: MiddlewareContext) => boolean;
  /**
   * Custom storage for lockout records (optional)
   * If not provided, uses in-memory storage
   */
  storage?: {
    get: (key: string) => LockoutRecord | undefined | Promise<LockoutRecord | undefined>;
    set: (key: string, value: LockoutRecord) => void | Promise<void>;
    delete: (key: string) => void | Promise<void>;
  };
  /**
   * Redirect URL when account is locked
   */
  redirect?: string;
  /**
   * Custom message when account is locked
   */
  message?: string;
}

/**
 * Gets a value from an object using a dot-separated path
 */
function getValueByPath(obj: unknown, path: string): unknown {
  const keys = path.split('.');
  let current: unknown = obj;
  for (const key of keys) {
    if (current == null || typeof current !== 'object') {
      return undefined;
    }
    current = (current as Record<string, unknown>)[key];
  }
  return current;
}

/**
 * Creates middleware that locks accounts after multiple failed authentication attempts
 *
 * @param options - Configuration options
 * @returns Middleware function
 *
 * @example
 * ```typescript
 * const lockoutMiddleware = createAccountLockoutMiddleware({
 *   maxAttempts: 5,
 *   lockoutDuration: 900, // 15 minutes
 *   resetOnSuccess: true
 * });
 * ```
 */
export function createAccountLockoutMiddleware(
  options: AccountLockoutMiddlewareOptions = {}
): ReturnType<typeof createMiddleware> {
  const {
    maxAttempts = 5,
    lockoutDuration = 900,
    resetOnSuccess = true,
    userIdPath = 'user.id',
    checkAuthSuccess = (context) => {
      // Default: check if user is authenticated
      const isAuth = getValueByPath(context, 'user.isAuthenticated');
      return isAuth === true;
    },
    storage,
    redirect,
    message = 'Account temporarily locked due to multiple failed attempts',
  } = options;

  const getRecord = async (key: string): Promise<LockoutRecord | undefined> => {
    if (storage) {
      return await storage.get(key);
    }
    return lockoutStore.get(key);
  };

  const setRecord = async (key: string, record: LockoutRecord): Promise<void> => {
    if (storage) {
      await storage.set(key, record);
    } else {
      lockoutStore.set(key, record);
    }
  };

  const deleteRecord = async (key: string): Promise<void> => {
    if (storage) {
      await storage.delete(key);
    } else {
      lockoutStore.delete(key);
    }
  };

  return createMiddleware('account-lockout', async (context: MiddlewareContext) => {
    const userId = getValueByPath(context, userIdPath);
    
    if (!userId || typeof userId !== 'string') {
      // No user ID, skip lockout check
      return true;
    }

    const key = `lockout:${userId}`;
    const now = Math.floor(Date.now() / 1000);
    let record = await getRecord(key);

    // Check if account is currently locked
    if (record && record.lockedUntil > now) {
      const remainingSeconds = record.lockedUntil - now;
      if (redirect) {
        return {
          allow: false,
          redirect,
          reason: `${message}. Try again in ${Math.ceil(remainingSeconds / 60)} minutes.`,
        };
      }
      return false;
    }

    // Check if authentication was successful
    const authSuccess = checkAuthSuccess(context);

    if (authSuccess) {
      // Reset attempts on success
      if (resetOnSuccess && record) {
        await deleteRecord(key);
      }
      return true;
    }

    // Authentication failed, increment attempts
    if (!record) {
      record = {
        attempts: 1,
        lockedUntil: 0,
        lastAttempt: now,
      };
    } else {
      record.attempts++;
      record.lastAttempt = now;
    }

    // Check if max attempts reached
    if (record.attempts >= maxAttempts) {
      record.lockedUntil = now + lockoutDuration;
      await setRecord(key, record);
      
      if (redirect) {
        return {
          allow: false,
          redirect,
          reason: message,
        };
      }
      return false;
    }

    // Update record
    await setRecord(key, record);

    // Allow access but log the failed attempt
    return true;
  });
}

