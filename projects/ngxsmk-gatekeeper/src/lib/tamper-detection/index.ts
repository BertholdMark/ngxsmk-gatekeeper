/**
 * Tamper detection exports for ngxsmk-gatekeeper
 * 
 * Provides client-side tamper detection capabilities.
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
 * **Best Practices:**
 * 
 * - Use tamper detection in development to catch configuration issues
 * - Enable strict mode only in development (not recommended for production)
 * - Always implement server-side security measures
 * - Use audit logging to track suspicious activity
 * - Monitor server logs for unexpected requests
 */

export * from './tamper-detection.types';
export * from './tamper-detection.utils';

