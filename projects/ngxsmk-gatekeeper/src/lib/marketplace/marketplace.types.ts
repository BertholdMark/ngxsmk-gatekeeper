/**
 * Marketplace types for plugin registry and ratings
 */

/**
 * Marketplace plugin metadata
 */
export interface MarketplacePlugin {
  /**
   * Unique identifier (npm package name)
   */
  id: string;
  /**
   * Package name on npm
   */
  packageName: string;
  /**
   * Human-readable name
   */
  name: string;
  /**
   * Version
   */
  version: string;
  /**
   * Description
   */
  description: string;
  /**
   * Author information
   */
  author?: {
    name: string;
    email?: string;
    url?: string;
  };
  /**
   * Keywords/tags
   */
  keywords?: string[];
  /**
   * Repository URL
   */
  repository?: string;
  /**
   * Homepage URL
   */
  homepage?: string;
  /**
   * License
   */
  license?: string;
  /**
   * Download statistics
   */
  downloads?: {
    weekly?: number;
    monthly?: number;
    total?: number;
  };
  /**
   * Rating information
   */
  rating?: PluginRating;
  /**
   * Installation instructions
   */
  installation?: {
    npm?: string;
    yarn?: string;
    pnpm?: string;
  };
  /**
   * Compatibility information
   */
  compatibility?: {
    ngxsmkGatekeeper?: string;
    angular?: string;
  };
  /**
   * Plugin category
   */
  category?: PluginCategory;
  /**
   * Whether plugin is verified by ngxsmk-gatekeeper team
   */
  verified?: boolean;
  /**
   * Last updated timestamp
   */
  lastUpdated?: string;
}

/**
 * Plugin categories
 */
export enum PluginCategory {
  Authentication = 'authentication',
  Authorization = 'authorization',
  Security = 'security',
  Analytics = 'analytics',
  Performance = 'performance',
  Monitoring = 'monitoring',
  Integration = 'integration',
  Utility = 'utility',
  Other = 'other',
}

/**
 * Plugin rating
 */
export interface PluginRating {
  /**
   * Average rating (0-5)
   */
  average: number;
  /**
   * Total number of ratings
   */
  count: number;
  /**
   * Rating distribution (1-5 stars)
   */
  distribution?: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

/**
 * Plugin review
 */
export interface PluginReview {
  /**
   * Review ID
   */
  id: string;
  /**
   * Plugin ID
   */
  pluginId: string;
  /**
   * User ID or name
   */
  userId: string;
  /**
   * User name (optional)
   */
  userName?: string;
  /**
   * Rating (1-5)
   */
  rating: number;
  /**
   * Review text
   */
  comment?: string;
  /**
   * Review timestamp
   */
  timestamp: string;
  /**
   * Whether review is verified (user actually installed plugin)
   */
  verified?: boolean;
}

/**
 * Marketplace search options
 */
export interface MarketplaceSearchOptions {
  /**
   * Search query
   */
  query?: string;
  /**
   * Category filter
   */
  category?: PluginCategory;
  /**
   * Minimum rating
   */
  minRating?: number;
  /**
   * Whether to show only verified plugins
   */
  verifiedOnly?: boolean;
  /**
   * Sort order
   */
  sortBy?: 'relevance' | 'rating' | 'downloads' | 'updated';
  /**
   * Sort direction
   */
  sortOrder?: 'asc' | 'desc';
  /**
   * Page number (for pagination)
   */
  page?: number;
  /**
   * Items per page
   */
  limit?: number;
}

/**
 * Marketplace search result
 */
export interface MarketplaceSearchResult {
  /**
   * Plugins matching search
   */
  plugins: MarketplacePlugin[];
  /**
   * Total number of results
   */
  total: number;
  /**
   * Current page
   */
  page: number;
  /**
   * Total pages
   */
  totalPages: number;
}

/**
 * Marketplace registry configuration
 */
export interface MarketplaceConfig {
  /**
   * Registry API endpoint
   */
  registryUrl?: string;
  /**
   * npm registry URL
   */
  npmRegistryUrl?: string;
  /**
   * Enable caching
   */
  enableCache?: boolean;
  /**
   * Cache TTL in milliseconds
   */
  cacheTTL?: number;
  /**
   * API key for authenticated requests (optional)
   */
  apiKey?: string;
}

/**
 * Plugin installation result
 */
export interface PluginInstallationResult {
  /**
   * Whether installation was successful
   */
  success: boolean;
  /**
   * Installed package name
   */
  packageName: string;
  /**
   * Installed version
   */
  version: string;
  /**
   * Error message if installation failed
   */
  error?: string;
  /**
   * Installation path
   */
  installPath?: string;
}

