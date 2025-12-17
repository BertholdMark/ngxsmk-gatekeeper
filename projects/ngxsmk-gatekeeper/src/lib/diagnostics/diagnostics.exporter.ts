/**
 * Diagnostics exporter utilities
 * 
 * Exports diagnostic information in various formats.
 */

import { DiagnosticsInfo, DiagnosticsExportFormat, DiagnosticsExportOptions } from './diagnostics.types';

/**
 * Exports diagnostic information
 * 
 * This function must be called explicitly by the user - it never runs automatically.
 * 
 * @param diagnostics - Diagnostic information to export
 * @param options - Export options
 * @returns Exported data as string
 * 
 * @example
 * ```typescript
 * import { collectDiagnostics, exportDiagnostics } from 'ngxsmk-gatekeeper/lib/diagnostics';
 * import { inject } from '@angular/core';
 * import { GATEKEEPER_CONFIG } from 'ngxsmk-gatekeeper';
 * 
 * // Collect diagnostics
 * const config = inject(GATEKEEPER_CONFIG);
 * const diagnostics = collectDiagnostics(config);
 * 
 * // Export diagnostics (explicit call)
 * const exported = exportDiagnostics(diagnostics, { format: 'json' });
 * console.log(exported);
 * 
 * // Or download as file
 * downloadDiagnostics(diagnostics, { format: 'json', filename: 'diagnostics.json' });
 * ```
 */
export function exportDiagnostics(
  diagnostics: DiagnosticsInfo,
  options: DiagnosticsExportOptions = {}
): string {
  const format = options.format || 'json';

  switch (format) {
    case 'json':
      return exportAsJson(diagnostics, options);
    case 'txt':
      return exportAsText(diagnostics, options);
    case 'markdown':
      return exportAsMarkdown(diagnostics, options);
    default:
      return exportAsJson(diagnostics, options);
  }
}

/**
 * Exports diagnostics as JSON
 */
function exportAsJson(
  diagnostics: DiagnosticsInfo,
  options: DiagnosticsExportOptions
): string {
  // Sanitize if sensitive data should be excluded
  const sanitized = options.includeSensitive
    ? diagnostics
    : sanitizeDiagnostics(diagnostics);

  return JSON.stringify(sanitized, null, 2);
}

/**
 * Exports diagnostics as plain text
 */
function exportAsText(
  diagnostics: DiagnosticsInfo,
  _options: DiagnosticsExportOptions
): string {
  const lines: string[] = [];

  lines.push('=== ngxsmk-gatekeeper Diagnostics ===');
  lines.push(`Timestamp: ${diagnostics.timestamp}`);
  lines.push('');

  // Application
  if (diagnostics.application.name || diagnostics.application.version) {
    lines.push('Application:');
    if (diagnostics.application.name) {
      lines.push(`  Name: ${diagnostics.application.name}`);
    }
    if (diagnostics.application.version) {
      lines.push(`  Version: ${diagnostics.application.version}`);
    }
    lines.push('');
  }

  // Angular
  lines.push('Angular:');
  lines.push(`  Version: ${diagnostics.angular.version}`);
  lines.push(`  Major: ${diagnostics.angular.major}`);
  lines.push(`  Minor: ${diagnostics.angular.minor}`);
  lines.push(`  Patch: ${diagnostics.angular.patch}`);
  lines.push('');

  // Browser
  lines.push('Browser:');
  lines.push(`  Name: ${diagnostics.browser.name}`);
  lines.push(`  Version: ${diagnostics.browser.version}`);
  lines.push(`  Platform: ${diagnostics.browser.platform}`);
  lines.push(`  Language: ${diagnostics.browser.language}`);
  if (diagnostics.browser.screen) {
    lines.push(`  Screen: ${diagnostics.browser.screen.width}x${diagnostics.browser.screen.height}`);
  }
  lines.push('');

  // Gatekeeper
  lines.push('Gatekeeper:');
  lines.push(`  Middleware Count: ${diagnostics.gatekeeper.middleware.count}`);
  lines.push('');
  
  lines.push('  Middleware List:');
  diagnostics.gatekeeper.middleware.list.forEach(item => {
    lines.push(`    [${item.index}] ${item.name || 'unnamed'} (${item.type})`);
    if (item.isPipeline && item.pipelineName) {
      lines.push(`      Pipeline: ${item.pipelineName}`);
    }
  });
  lines.push('');

  // Execution Order
  if (diagnostics.gatekeeper.executionOrder.statistics) {
    lines.push('  Execution Statistics:');
    lines.push(`    Total Executions: ${diagnostics.gatekeeper.executionOrder.statistics.totalExecutions}`);
    lines.push(`    Guard Executions: ${diagnostics.gatekeeper.executionOrder.statistics.guardExecutions}`);
    lines.push(`    Interceptor Executions: ${diagnostics.gatekeeper.executionOrder.statistics.interceptorExecutions}`);
    lines.push('');
  }

  // Features
  lines.push('  Features:');
  Object.entries(diagnostics.gatekeeper.features).forEach(([key, value]) => {
    lines.push(`    ${key}: ${value ? 'enabled' : 'disabled'}`);
  });

  return lines.join('\n');
}

/**
 * Exports diagnostics as Markdown
 */
function exportAsMarkdown(
  diagnostics: DiagnosticsInfo,
  _options: DiagnosticsExportOptions
): string {
  const lines: string[] = [];

  lines.push('# ngxsmk-gatekeeper Diagnostics');
  lines.push('');
  lines.push(`**Timestamp:** ${diagnostics.timestamp}`);
  lines.push('');

  // Application
  if (diagnostics.application.name || diagnostics.application.version) {
    lines.push('## Application');
    if (diagnostics.application.name) {
      lines.push(`- **Name:** ${diagnostics.application.name}`);
    }
    if (diagnostics.application.version) {
      lines.push(`- **Version:** ${diagnostics.application.version}`);
    }
    lines.push('');
  }

  // Angular
  lines.push('## Angular');
  lines.push(`- **Version:** ${diagnostics.angular.version}`);
  lines.push(`- **Major:** ${diagnostics.angular.major}`);
  lines.push(`- **Minor:** ${diagnostics.angular.minor}`);
  lines.push(`- **Patch:** ${diagnostics.angular.patch}`);
  lines.push('');

  // Browser
  lines.push('## Browser');
  lines.push(`- **Name:** ${diagnostics.browser.name}`);
  lines.push(`- **Version:** ${diagnostics.browser.version}`);
  lines.push(`- **Platform:** ${diagnostics.browser.platform}`);
  lines.push(`- **Language:** ${diagnostics.browser.language}`);
  if (diagnostics.browser.screen) {
    lines.push(`- **Screen:** ${diagnostics.browser.screen.width}x${diagnostics.browser.screen.height}`);
  }
  lines.push('');

  // Gatekeeper
  lines.push('## Gatekeeper');
  lines.push('');
  lines.push(`**Middleware Count:** ${diagnostics.gatekeeper.middleware.count}`);
  lines.push('');

  lines.push('### Middleware List');
  lines.push('');
  lines.push('| Index | Name | Type |');
  lines.push('|-------|------|------|');
  diagnostics.gatekeeper.middleware.list.forEach(item => {
    const name = item.name || 'unnamed';
    const type = item.isPipeline ? `Pipeline: ${item.pipelineName}` : item.type;
    lines.push(`| ${item.index} | ${name} | ${type} |`);
  });
  lines.push('');

  // Execution Order
  if (diagnostics.gatekeeper.executionOrder.statistics) {
    lines.push('### Execution Statistics');
    lines.push('');
    lines.push(`- **Total Executions:** ${diagnostics.gatekeeper.executionOrder.statistics.totalExecutions}`);
    lines.push(`- **Guard Executions:** ${diagnostics.gatekeeper.executionOrder.statistics.guardExecutions}`);
    lines.push(`- **Interceptor Executions:** ${diagnostics.gatekeeper.executionOrder.statistics.interceptorExecutions}`);
    lines.push('');
  }

  // Features
  lines.push('### Features');
  lines.push('');
  Object.entries(diagnostics.gatekeeper.features).forEach(([key, value]) => {
    lines.push(`- **${key}:** ${value ? '✅ enabled' : '❌ disabled'}`);
  });

  return lines.join('\n');
}

/**
 * Sanitizes diagnostics to remove sensitive information
 */
function sanitizeDiagnostics(diagnostics: DiagnosticsInfo): DiagnosticsInfo {
  // Create a copy
  const sanitized = { ...diagnostics };

  // Remove sensitive information from metadata if present
  if (sanitized.metadata) {
    const sensitiveKeys = ['apiKey', 'secret', 'token', 'password', 'authorization'];
    const sanitizedMetadata = { ...sanitized.metadata };
    
    sensitiveKeys.forEach(key => {
      if (key in sanitizedMetadata) {
        delete sanitizedMetadata[key];
      }
    });

    sanitized.metadata = sanitizedMetadata;
  }

  return sanitized;
}

/**
 * Downloads diagnostics as a file
 * 
 * This function must be called explicitly by the user - it never runs automatically.
 * 
 * @param diagnostics - Diagnostic information to download
 * @param options - Export options
 * @param filename - Optional filename (default: 'gatekeeper-diagnostics.{format}')
 * 
 * @example
 * ```typescript
 * const diagnostics = collectDiagnostics(config);
 * downloadDiagnostics(diagnostics, { format: 'json' }, 'my-diagnostics.json');
 * ```
 */
export function downloadDiagnostics(
  diagnostics: DiagnosticsInfo,
  options: DiagnosticsExportOptions = {},
  filename?: string
): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    console.warn('[Diagnostics] Cannot download file in non-browser environment');
    return;
  }

  const format = options.format || 'json';
  const defaultFilename = `gatekeeper-diagnostics-${new Date().toISOString().split('T')[0]}.${format}`;
  const finalFilename = filename || defaultFilename;

  const exported = exportDiagnostics(diagnostics, options);
  const blob = new Blob([exported], { type: getMimeType(format) });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = finalFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Gets MIME type for export format
 */
function getMimeType(format: DiagnosticsExportFormat): string {
  switch (format) {
    case 'json':
      return 'application/json';
    case 'txt':
      return 'text/plain';
    case 'markdown':
      return 'text/markdown';
    default:
      return 'text/plain';
  }
}

