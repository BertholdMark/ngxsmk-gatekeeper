/**
 * npm client for marketplace integration
 */

import { MarketplacePlugin } from './marketplace.types';

/**
 * npm package information from registry
 */
export interface NpmPackageInfo {
  name: string;
  version: string;
  description?: string;
  author?: string | { name: string; email?: string; url?: string };
  keywords?: string[];
  repository?: string | { url: string; type?: string };
  homepage?: string;
  license?: string;
  'dist-tags'?: {
    latest?: string;
    [tag: string]: string | undefined;
  };
  time?: {
    created?: string;
    modified?: string;
    [version: string]: string | undefined;
  };
  versions?: Record<string, NpmPackageVersion>;
}

/**
 * npm package version information
 */
export interface NpmPackageVersion {
  name: string;
  version: string;
  description?: string;
  keywords?: string[];
  repository?: string | { url: string; type?: string };
  homepage?: string;
  license?: string;
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

/**
 * npm download statistics
 */
export interface NpmDownloadStats {
  downloads: number;
  start: string;
  end: string;
  package: string;
}

/**
 * npm client for interacting with npm registry
 */
export class NpmClient {
  private readonly registryUrl: string;

  constructor(registryUrl: string = 'https://registry.npmjs.org') {
    this.registryUrl = registryUrl.replace(/\/$/, '');
  }

  /**
   * Fetches package information from npm registry
   *
   * @param packageName - npm package name
   * @returns Package information
   */
  async getPackageInfo(packageName: string): Promise<NpmPackageInfo | null> {
    try {
      const url = `${this.registryUrl}/${encodeURIComponent(packageName)}`;
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to fetch package info: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`[NpmClient] Error fetching package info for "${packageName}":`, error);
      return null;
    }
  }

  /**
   * Searches npm registry for packages
   *
   * @param query - Search query
   * @param limit - Maximum number of results
   * @returns Search results
   */
  async searchPackages(query: string, limit: number = 20): Promise<Array<{ package: { name: string; version: string; description?: string } }>> {
    try {
      const url = `${this.registryUrl}/-/v1/search?text=${encodeURIComponent(query)}&size=${limit}`;
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to search packages: ${response.statusText}`);
      }

      const data = await response.json();
      return data.objects || [];
    } catch (error) {
      console.error(`[NpmClient] Error searching packages:`, error);
      return [];
    }
  }

  /**
   * Gets download statistics for a package
   *
   * @param packageName - npm package name
   * @param period - Time period (last-day, last-week, last-month)
   * @returns Download statistics
   */
  async getDownloadStats(
    packageName: string,
    period: 'last-day' | 'last-week' | 'last-month' = 'last-week'
  ): Promise<NpmDownloadStats | null> {
    try {
      // Using npm API for download stats
      const url = `https://api.npmjs.org/downloads/point/${period}/${encodeURIComponent(packageName)}`;
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error(`[NpmClient] Error fetching download stats for "${packageName}":`, error);
      return null;
    }
  }

  /**
   * Converts npm package info to marketplace plugin
   *
   * @param packageInfo - npm package information
   * @param downloads - Optional download statistics
   * @returns Marketplace plugin
   */
  async convertToMarketplacePlugin(
    packageInfo: NpmPackageInfo,
    downloads?: NpmDownloadStats
  ): Promise<MarketplacePlugin> {
    const latestVersion = packageInfo['dist-tags']?.latest || packageInfo.version;
    const versionInfo = packageInfo.versions?.[latestVersion];

    const author = typeof packageInfo.author === 'string'
      ? { name: packageInfo.author }
      : packageInfo.author;

    const repository = typeof packageInfo.repository === 'string'
      ? packageInfo.repository
      : packageInfo.repository?.url;

    return {
      id: packageInfo.name,
      packageName: packageInfo.name,
      name: packageInfo.name,
      version: latestVersion,
      description: versionInfo?.description || packageInfo.description || '',
      ...(author !== undefined && { author }),
      ...(versionInfo?.keywords || packageInfo.keywords ? { keywords: versionInfo?.keywords || packageInfo.keywords } : {}),
      ...(repository !== undefined && { repository }),
      ...(versionInfo?.homepage || packageInfo.homepage ? { homepage: versionInfo?.homepage || packageInfo.homepage } : {}),
      ...(versionInfo?.license || packageInfo.license ? { license: versionInfo?.license || packageInfo.license } : {}),
      ...(downloads ? { downloads: { weekly: downloads.downloads } } : {}),
      ...(packageInfo.time?.modified || packageInfo.time?.created ? { lastUpdated: packageInfo.time?.modified || packageInfo.time?.created } : {}),
    };
  }

  /**
   * Generates installation command for a package
   *
   * @param packageName - npm package name
   * @param version - Optional version
   * @returns Installation commands
   */
  getInstallationCommands(packageName: string, version?: string): {
    npm: string;
    yarn: string;
    pnpm: string;
  } {
    const packageSpec = version ? `${packageName}@${version}` : packageName;

    return {
      npm: `npm install ${packageSpec}`,
      yarn: `yarn add ${packageSpec}`,
      pnpm: `pnpm add ${packageSpec}`,
    };
  }
}

