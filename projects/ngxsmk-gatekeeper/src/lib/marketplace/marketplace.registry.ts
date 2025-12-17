/**
 * Marketplace registry for managing plugins
 */

import { Injectable, Inject, Optional } from '@angular/core';
import {
  MarketplacePlugin,
  MarketplaceSearchOptions,
  MarketplaceSearchResult,
  PluginReview,
  PluginRating,
  MarketplaceConfig,
} from './marketplace.types';
import { NpmClient } from './npm-client';

/**
 * Marketplace registry service
 */
@Injectable({
  providedIn: 'root',
})
export class MarketplaceRegistry {
  private readonly plugins = new Map<string, MarketplacePlugin>();
  private readonly reviews = new Map<string, PluginReview[]>();
  private readonly npmClient: NpmClient;
  private readonly config: MarketplaceConfig;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();

  constructor(@Optional() @Inject('MarketplaceConfig') config: MarketplaceConfig = {}) {
    this.config = {
      registryUrl: 'https://registry.ngxsmk-gatekeeper.com',
      npmRegistryUrl: 'https://registry.npmjs.org',
      enableCache: true,
      cacheTTL: 3600000, // 1 hour
      ...config,
    };
    this.npmClient = new NpmClient(this.config.npmRegistryUrl);
  }

  /**
   * Registers a plugin in the marketplace
   *
   * @param plugin - Plugin to register
   */
  registerPlugin(plugin: MarketplacePlugin): void {
    this.plugins.set(plugin.id, plugin);
  }

  /**
   * Gets a plugin by ID
   *
   * @param pluginId - Plugin ID
   * @returns Plugin or null if not found
   */
  getPlugin(pluginId: string): MarketplacePlugin | null {
    return this.plugins.get(pluginId) || null;
  }

  /**
   * Gets all registered plugins
   *
   * @returns Array of all plugins
   */
  getAllPlugins(): MarketplacePlugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Searches for plugins
   *
   * @param options - Search options
   * @returns Search results
   */
  async searchPlugins(options: MarketplaceSearchOptions = {}): Promise<MarketplaceSearchResult> {
    let results = Array.from(this.plugins.values());

    // Apply filters
    if (options.query) {
      const query = options.query.toLowerCase();
      results = results.filter(plugin =>
        plugin.name.toLowerCase().includes(query) ||
        plugin.description.toLowerCase().includes(query) ||
        plugin.keywords?.some(k => k.toLowerCase().includes(query))
      );
    }

    if (options.category) {
      results = results.filter(plugin => plugin.category === options.category);
    }

    if (options.minRating !== undefined) {
      results = results.filter(plugin =>
        plugin.rating && plugin.rating.average >= options.minRating!
      );
    }

    if (options.verifiedOnly) {
      results = results.filter(plugin => plugin.verified);
    }

    // Sort
    if (options.sortBy) {
      results.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (options.sortBy) {
          case 'rating':
            aValue = a.rating?.average || 0;
            bValue = b.rating?.average || 0;
            break;
          case 'downloads':
            aValue = a.downloads?.weekly || 0;
            bValue = b.downloads?.weekly || 0;
            break;
          case 'updated':
            aValue = a.lastUpdated ? new Date(a.lastUpdated).getTime() : 0;
            bValue = b.lastUpdated ? new Date(b.lastUpdated).getTime() : 0;
            break;
          default:
            return 0;
        }

        const comparison = aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
        return options.sortOrder === 'desc' ? -comparison : comparison;
      });
    }

    // Pagination
    const page = options.page || 1;
    const limit = options.limit || 20;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedResults = results.slice(start, end);
    const totalPages = Math.ceil(results.length / limit);

    return {
      plugins: paginatedResults,
      total: results.length,
      page,
      totalPages,
    };
  }

  /**
   * Discovers plugins from npm
   *
   * @param query - Search query
   * @param limit - Maximum number of results
   * @returns Discovered plugins
   */
  async discoverFromNpm(query: string, limit: number = 20): Promise<MarketplacePlugin[]> {
    const cacheKey = `npm-discover-${query}-${limit}`;

    // Check cache
    if (this.config.enableCache) {
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < (this.config.cacheTTL || 3600000)) {
        return cached.data;
      }
    }

    try {
      const searchResults = await this.npmClient.searchPackages(
        `ngxsmk-gatekeeper ${query}`,
        limit
      );

      const plugins: MarketplacePlugin[] = [];

      for (const result of searchResults) {
        const packageName = result.package.name;
        const packageInfo = await this.npmClient.getPackageInfo(packageName);

        if (packageInfo) {
          const downloads = await this.npmClient.getDownloadStats(packageName, 'last-week');
          const plugin = await this.npmClient.convertToMarketplacePlugin(packageInfo, downloads || undefined);
          plugins.push(plugin);
        }
      }

      // Cache results
      if (this.config.enableCache) {
        this.cache.set(cacheKey, {
          data: plugins,
          timestamp: Date.now(),
        });
      }

      return plugins;
    } catch (error) {
      console.error('[MarketplaceRegistry] Error discovering from npm:', error);
      return [];
    }
  }

  /**
   * Adds a review for a plugin
   *
   * @param review - Review to add
   */
  addReview(review: PluginReview): void {
    const reviews = this.reviews.get(review.pluginId) || [];
    reviews.push(review);
    this.reviews.set(review.pluginId, reviews);

    // Update plugin rating
    this.updatePluginRating(review.pluginId);
  }

  /**
   * Gets reviews for a plugin
   *
   * @param pluginId - Plugin ID
   * @returns Array of reviews
   */
  getReviews(pluginId: string): PluginReview[] {
    return this.reviews.get(pluginId) || [];
  }

  /**
   * Updates plugin rating based on reviews
   *
   * @param pluginId - Plugin ID
   */
  private updatePluginRating(pluginId: string): void {
    const reviews = this.reviews.get(pluginId) || [];
    if (reviews.length === 0) return;

    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    const average = total / reviews.length;

    const distribution = {
      1: reviews.filter(r => r.rating === 1).length,
      2: reviews.filter(r => r.rating === 2).length,
      3: reviews.filter(r => r.rating === 3).length,
      4: reviews.filter(r => r.rating === 4).length,
      5: reviews.filter(r => r.rating === 5).length,
    };

    const rating: PluginRating = {
      average: Math.round(average * 10) / 10,
      count: reviews.length,
      distribution,
    };

    const plugin = this.plugins.get(pluginId);
    if (plugin) {
      plugin.rating = rating;
      this.plugins.set(pluginId, plugin);
    }
  }

  /**
   * Gets rating for a plugin
   *
   * @param pluginId - Plugin ID
   * @returns Rating or null
   */
  getRating(pluginId: string): PluginRating | null {
    const plugin = this.plugins.get(pluginId);
    return plugin?.rating || null;
  }

  /**
   * Clears cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

