# Security Policy

## Supported Versions

We actively support security updates for the following versions:

| Version | Supported          | Security Updates |
| ------- | ------------------ | ----------------- |
| Latest  | :white_check_mark: | :white_check_mark: |
| Latest - 1 | :white_check_mark: | :white_check_mark: |
| Latest - 2 | :white_check_mark: | Security patches only |
| < Latest - 2 | :x: | :x: |

**Security updates are provided for:**
- The latest major version
- The previous major version (for 6 months after new major release)
- Critical security patches for older versions on a case-by-case basis

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security vulnerability, please follow our responsible disclosure process.

### Responsible Disclosure Process

1. **Do not** create a public GitHub issue for security vulnerabilities
2. **Email** security details to: `security@example.com` (replace with actual email)
3. **Include** the following information:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if you have one)
   - Your contact information

### What to Report

Please report:
- Authentication or authorization bypasses
- Injection vulnerabilities (XSS, code injection, etc.)
- Data exposure or leakage
- Denial of service vulnerabilities
- Privilege escalation issues
- Any security issue that could impact users

### What NOT to Report

Please do not report:
- Issues that require physical access to the device
- Issues that require social engineering
- Issues that require already-compromised user accounts
- Issues in third-party dependencies (report to the dependency maintainers)
- Issues that require non-standard configurations
- Issues that are already publicly known

### Response Timeline

We commit to:

- **Initial Response**: Within 48 hours of receiving your report
- **Status Update**: Within 7 days with an assessment
- **Resolution**: As quickly as possible, typically within 30 days
- **Public Disclosure**: After a fix is released and users have had time to update

### Security Update Process

1. **Acknowledgment**: We will acknowledge receipt of your report within 48 hours
2. **Investigation**: We will investigate and verify the vulnerability
3. **Fix Development**: We will develop a fix for the vulnerability
4. **Testing**: We will test the fix thoroughly
5. **Release**: We will release a security patch
6. **Disclosure**: We will publicly disclose the vulnerability after users have had time to update (typically 7-14 days)

### Recognition

We believe in recognizing security researchers who help keep our project secure:

- **Hall of Fame**: Security researchers who report valid vulnerabilities will be listed in our Security Hall of Fame (with permission)
- **Credit**: You will be credited in the security advisory (if desired)
- **Responsible Disclosure**: We appreciate responsible disclosure and will work with you throughout the process

### Security Best Practices

For users of ngxsmk-gatekeeper:

1. **Keep Updated**: Always use the latest version of the library
2. **Review Changes**: Review changelog and security advisories
3. **Server-Side Validation**: Always implement server-side validation (client-side protection is not sufficient)
4. **Secure Storage**: Store authentication tokens securely
5. **Regular Audits**: Regularly audit your middleware configuration
6. **Monitor**: Monitor for security advisories and updates

### Security Advisories

Security advisories are published:
- On GitHub Security Advisories
- In the project's security announcements
- Via email to registered users (if applicable)

### Contact

**Security Email**: `security@example.com` (replace with actual email)

**PGP Key**: (Optional - add if you have one)

```
-----BEGIN PGP PUBLIC KEY BLOCK-----
[Your PGP key here]
-----END PGP PUBLIC KEY BLOCK-----
```

### Security Policy Updates

This security policy may be updated from time to time. Significant changes will be announced via:
- GitHub releases
- Project announcements
- Security advisories

## Security Considerations

### Client-Side Protection Limitations

**ngxsmk-gatekeeper** runs in the browser and provides client-side protection. Important security considerations:

1. **Not a Security Measure**: Client-side protection can be bypassed and should not be relied upon for security
2. **Server-Side Required**: Always implement server-side validation and protection
3. **Defense in Depth**: Use client-side protection as part of a defense-in-depth strategy
4. **Token Security**: Store authentication tokens securely (httpOnly cookies, secure storage)
5. **HTTPS Required**: Always use HTTPS in production

### Known Limitations

- Client-side middleware can be disabled or bypassed
- Tokens stored in localStorage are accessible to JavaScript
- Execution order can be modified by determined attackers
- Tamper detection is best-effort and can be bypassed

### Security Recommendations

1. **Use HTTPS**: Always use HTTPS in production
2. **Secure Tokens**: Use httpOnly cookies or secure storage for tokens
3. **Server Validation**: Always validate on the server side
4. **Regular Updates**: Keep the library and dependencies updated
5. **Security Headers**: Use security headers middleware
6. **Audit Logging**: Enable audit logging for compliance and monitoring
7. **Zero Trust**: Consider zero trust mode for enterprise applications

## Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Angular Security Guide](https://angular.io/guide/security)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

## Thank You

Thank you for helping keep ngxsmk-gatekeeper secure. We appreciate your responsible disclosure and commitment to security.

