# Middleware Marketplace

Discover, install, and rate community-contributed middleware plugins for ngxsmk-gatekeeper.

## Overview

The ngxsmk-gatekeeper marketplace provides:

- **Plugin Discovery** - Find middleware plugins from npm
- **Ratings & Reviews** - See what others think about plugins
- **Easy Installation** - Get installation commands for any package manager
- **Update Management** - Check for plugin updates

## Quick Start

```typescript
import { MarketplaceRegistry, provideMarketplace } from 'ngxsmk-gatekeeper/lib/marketplace';

// Configure marketplace
bootstrapApplication(AppComponent, {
  providers: [
    provideMarketplace({
      registryUrl: 'https://registry.ngxsmk-gatekeeper.com',
      enableCache: true,
    }),
  ],
});
```

## Discovering Plugins

### Search npm Registry

```typescript
import { MarketplaceRegistry } from 'ngxsmk-gatekeeper/lib/marketplace';
import { inject } from '@angular/core';

@Component({...})
export class PluginBrowserComponent {
  private marketplace = inject(MarketplaceRegistry);

  async searchPlugins() {
    // Search npm for plugins
    const plugins = await this.marketplace.discoverFromNpm('auth', 20);
    console.log('Found plugins:', plugins);
  }
}
```

### Search Marketplace

```typescript
const results = await this.marketplace.searchPlugins({
  query: 'authentication',
  category: PluginCategory.Authentication,
  minRating: 4.0,
  verifiedOnly: true,
  sortBy: 'rating',
  sortOrder: 'desc',
  page: 1,
  limit: 20,
});

console.log(`Found ${results.total} plugins`);
results.plugins.forEach(plugin => {
  console.log(`${plugin.name} - ${plugin.rating?.average || 'N/A'} stars`);
});
```

## Installing Plugins

### Get Installation Commands

```typescript
import { PluginInstaller } from 'ngxsmk-gatekeeper/lib/marketplace';

const installer = new PluginInstaller();
const plugin = await this.marketplace.getPlugin('@vendor/auth-plugin');

if (plugin) {
  const commands = installer.getInstallationCommands(plugin);
  console.log('npm:', commands.npm);
  console.log('yarn:', commands.yarn);
  console.log('pnpm:', commands.pnpm);
}
```

### Check Installation Status

```typescript
const isInstalled = await installer.isInstalled('@vendor/auth-plugin');
const version = await installer.getInstalledVersion('@vendor/auth-plugin');

if (isInstalled) {
  console.log(`Installed version: ${version}`);
}
```

### Check for Updates

```typescript
const updateInfo = await installer.getUpdateInfo(plugin);

if (updateInfo.updateAvailable) {
  console.log(`Update available: ${updateInfo.currentVersion} -> ${updateInfo.latestVersion}`);
}
```

## Ratings & Reviews

### Add a Review

```typescript
import { PluginReview } from 'ngxsmk-gatekeeper/lib/marketplace';

const review: PluginReview = {
  id: 'review-1',
  pluginId: '@vendor/auth-plugin',
  userId: 'user-123',
  userName: 'John Doe',
  rating: 5,
  comment: 'Great plugin! Works perfectly with my setup.',
  timestamp: new Date().toISOString(),
  verified: true,
};

this.marketplace.addReview(review);
```

### Get Reviews

```typescript
const reviews = this.marketplace.getReviews('@vendor/auth-plugin');

reviews.forEach(review => {
  console.log(`${review.userName}: ${review.rating} stars`);
  console.log(review.comment);
});
```

### Get Rating

```typescript
const rating = this.marketplace.getRating('@vendor/auth-plugin');

if (rating) {
  console.log(`Average: ${rating.average} stars`);
  console.log(`Total reviews: ${rating.count}`);
  console.log(`5 stars: ${rating.distribution?.[5] || 0}`);
}
```

## Plugin Categories

```typescript
import { PluginCategory } from 'ngxsmk-gatekeeper/lib/marketplace';

// Available categories:
// - PluginCategory.Authentication
// - PluginCategory.Authorization
// - PluginCategory.Security
// - PluginCategory.Analytics
// - PluginCategory.Performance
// - PluginCategory.Monitoring
// - PluginCategory.Integration
// - PluginCategory.Utility
// - PluginCategory.Other
```

## Registering Your Plugin

To register your plugin in the marketplace:

1. **Publish to npm** with the `ngxsmk-gatekeeper` keyword
2. **Add metadata** to your package.json:
   ```json
   {
     "name": "@your-org/your-plugin",
     "keywords": ["ngxsmk-gatekeeper", "middleware", "auth"],
     "ngxsmk-gatekeeper": {
       "category": "authentication",
       "compatibility": {
         "ngxsmkGatekeeper": "^1.0.0",
         "angular": "^17.0.0"
       }
     }
   }
   ```

3. **Create extension** that implements `GatekeeperExtension`:
   ```typescript
   import { GatekeeperExtension } from 'ngxsmk-gatekeeper/lib/extensions';

   export class YourPlugin implements GatekeeperExtension {
     readonly id = '@your-org/your-plugin';
     readonly name = 'Your Plugin';
     readonly version = '1.0.0';
     readonly description = 'Description of your plugin';

     initialize(context: ExtensionContext) {
       // Return your middleware
       return [yourMiddleware];
     }
   }
   ```

## Marketplace Configuration

```typescript
provideMarketplace({
  // Custom registry URL
  registryUrl: 'https://your-registry.com',
  
  // npm registry URL
  npmRegistryUrl: 'https://registry.npmjs.org',
  
  // Enable caching
  enableCache: true,
  
  // Cache TTL (1 hour)
  cacheTTL: 3600000,
  
  // API key for authenticated requests
  apiKey: 'your-api-key',
})
```

## Best Practices

1. **Use Verified Plugins** - Filter by `verifiedOnly: true` for trusted plugins
2. **Check Ratings** - Look for plugins with high ratings and many reviews
3. **Read Reviews** - Check user reviews before installing
4. **Check Compatibility** - Verify plugin compatibility with your Angular version
5. **Keep Updated** - Regularly check for plugin updates

## API Reference

- [Marketplace Types](../api/marketplace/types)
- [Marketplace Registry](../api/marketplace/registry)
- [NPM Client](../api/marketplace/npm-client)
- [Plugin Installer](../api/marketplace/installer)

