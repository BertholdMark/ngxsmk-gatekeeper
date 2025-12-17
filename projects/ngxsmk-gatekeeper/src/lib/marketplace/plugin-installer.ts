/**
 * Plugin installer for npm packages
 */

import { MarketplacePlugin } from './marketplace.types';
import { NpmClient } from './npm-client';

/**
 * Plugin installer service
 */
export class PluginInstaller {
  private readonly npmClient: NpmClient;

  constructor(npmRegistryUrl: string = 'https://registry.npmjs.org') {
    this.npmClient = new NpmClient(npmRegistryUrl);
  }

  /**
   * Gets installation commands for a plugin
   *
   * @param plugin - Plugin to install
   * @returns Installation commands
   */
  getInstallationCommands(plugin: MarketplacePlugin): {
    npm: string;
    yarn: string;
    pnpm: string;
  } {
    return this.npmClient.getInstallationCommands(plugin.packageName, plugin.version);
  }

  /**
   * Validates plugin installation
   *
   * @param packageName - Package name
   * @returns Whether package is installed
   */
  async isInstalled(packageName: string): Promise<boolean> {
    try {
      // In a real implementation, this would check node_modules or package.json
      // For now, we'll just check if we can require the package
      if (typeof require !== 'undefined') {
        try {
          require.resolve(packageName);
          return true;
        } catch {
          return false;
        }
      }
      return false;
    } catch {
      return false;
    }
  }

  /**
   * Gets installed version of a package
   *
   * @param packageName - Package name
   * @returns Installed version or null
   */
  async getInstalledVersion(packageName: string): Promise<string | null> {
    try {
      if (typeof require !== 'undefined') {
        const packageJson = require(`${packageName}/package.json`);
        return packageJson.version || null;
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Checks if plugin update is available
   *
   * @param plugin - Plugin to check
   * @returns Whether update is available
   */
  async isUpdateAvailable(plugin: MarketplacePlugin): Promise<boolean> {
    const installedVersion = await this.getInstalledVersion(plugin.packageName);
    if (!installedVersion) {
      return false;
    }

    const packageInfo = await this.npmClient.getPackageInfo(plugin.packageName);
    if (!packageInfo) {
      return false;
    }

    const latestVersion = packageInfo['dist-tags']?.latest;
    return latestVersion !== installedVersion;
  }

  /**
   * Gets update information for a plugin
   *
   * @param plugin - Plugin to check
   * @returns Update information
   */
  async getUpdateInfo(plugin: MarketplacePlugin): Promise<{
    currentVersion: string | null;
    latestVersion: string;
    updateAvailable: boolean;
  }> {
    const installedVersion = await this.getInstalledVersion(plugin.packageName);
    const packageInfo = await this.npmClient.getPackageInfo(plugin.packageName);

    if (!packageInfo) {
      return {
        currentVersion: installedVersion,
        latestVersion: plugin.version,
        updateAvailable: false,
      };
    }

    const latestVersion = packageInfo['dist-tags']?.latest || plugin.version;

    return {
      currentVersion: installedVersion,
      latestVersion,
      updateAvailable: installedVersion !== latestVersion,
    };
  }
}

