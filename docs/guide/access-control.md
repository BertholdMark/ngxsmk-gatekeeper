# Access Control

Control when and where users can access your application.

## Time-Based Access

Restrict access to business hours or specific time windows:

```typescript
import { createTimeWindowMiddleware, DayOfWeek } from 'ngxsmk-gatekeeper';

const businessHoursMiddleware = createTimeWindowMiddleware({
  allowedHours: { start: 9, end: 17 }, // 9 AM to 5 PM
  allowedDays: [
    DayOfWeek.Monday,
    DayOfWeek.Tuesday,
    DayOfWeek.Wednesday,
    DayOfWeek.Thursday,
    DayOfWeek.Friday
  ],
  timezone: 'America/New_York',
  redirect: '/outside-hours'
});
```

### Overnight Windows

Handle overnight time windows:

```typescript
const overnightMiddleware = createTimeWindowMiddleware({
  allowedHours: { start: 22, end: 6 }, // 10 PM to 6 AM
  timezone: 'UTC'
});
```

## Maintenance Mode

Enable maintenance mode with admin access:

```typescript
import { createMaintenanceModeMiddleware } from 'ngxsmk-gatekeeper';

const maintenanceMiddleware = createMaintenanceModeMiddleware({
  enabled: process.env.MAINTENANCE_MODE === 'true',
  message: 'Scheduled maintenance in progress',
  allowedIPs: ['10.0.0.1', '192.168.1.1'], // Admin IPs
  exemptPaths: ['/maintenance', '/health', '/api/status'],
  redirect: '/maintenance',
  shouldAllowAccess: (context) => {
    // Custom access check
    return context['user']?.role === 'admin';
  }
});
```

## Geographic Restrictions

Block or allow access by country:

```typescript
import { createGeoBlockMiddleware } from 'ngxsmk-gatekeeper';

// Allow only specific countries
const geoAllowMiddleware = createGeoBlockMiddleware({
  allowedCountries: ['US', 'CA', 'GB', 'AU'],
  redirect: '/geo-blocked'
});

// Block specific countries
const geoBlockMiddleware = createGeoBlockMiddleware({
  blockedCountries: ['CN', 'RU'],
  redirect: '/geo-blocked'
});

// Custom country detection
const customGeoMiddleware = createGeoBlockMiddleware({
  allowedCountries: ['US'],
  getCountryCode: async (context) => {
    // Custom country detection logic
    const ip = getClientIP(context);
    const country = await lookupCountryByIP(ip);
    return country;
  }
});
```

## Combining Access Controls

Combine multiple access control middleware:

```typescript
import { definePipeline } from 'ngxsmk-gatekeeper';

const accessControlPipeline = definePipeline('access-control', [
  businessHoursMiddleware,
  geoBlockMiddleware,
  maintenanceMiddleware
]);

provideGatekeeper({
  middlewares: [accessControlPipeline]
});
```

## Conditional Access

Use conditional middleware for complex logic:

```typescript
import { createConditionalMiddleware } from 'ngxsmk-gatekeeper';

const conditionalAccess = createConditionalMiddleware({
  condition: (context) => {
    const user = context['user'];
    const isPremium = user?.subscription === 'premium';
    const isBusinessHours = isBusinessHoursNow();
    return isPremium || isBusinessHours;
  },
  ifTrue: allowMiddleware,
  ifFalse: redirectToUpgradeMiddleware
});
```

## Examples

### Business Hours Only

```typescript
const businessOnly = createTimeWindowMiddleware({
  allowedHours: { start: 9, end: 17 },
  allowedDays: [
    DayOfWeek.Monday,
    DayOfWeek.Tuesday,
    DayOfWeek.Wednesday,
    DayOfWeek.Thursday,
    DayOfWeek.Friday
  ],
  timezone: 'America/New_York'
});
```

### Maintenance with Admin Access

```typescript
const maintenance = createMaintenanceModeMiddleware({
  enabled: true,
  allowedIPs: ['10.0.0.0/8'], // Internal network
  exemptPaths: ['/admin', '/api/health']
});
```

### GDPR Compliance

```typescript
const gdprCompliance = createGeoBlockMiddleware({
  blockedCountries: ['US'], // Block US for GDPR compliance
  redirect: '/gdpr-notice'
});
```

## Next Steps

- [Security Features](/guide/security) - Security middleware
- [Request Processing](/guide/request-processing) - Request validation and limits

