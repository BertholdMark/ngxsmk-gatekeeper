/**
 * Example: Using Diagnostics Export
 * 
 * This demonstrates how to collect and export diagnostic information.
 * Diagnostics export is explicit and manual - it never runs automatically.
 */

import { inject } from '@angular/core';
import { GATEKEEPER_CONFIG } from 'ngxsmk-gatekeeper';
import { GatekeeperConfig } from 'ngxsmk-gatekeeper/lib/angular';
import {
  collectDiagnostics,
  exportDiagnostics,
  downloadDiagnostics,
  DiagnosticsExportOptions,
} from 'ngxsmk-gatekeeper/lib/diagnostics';

/**
 * Example 1: Collect and Export Diagnostics (JSON)
 * 
 * Collects diagnostic information and exports it as JSON.
 */
export function exampleExportJson() {
  // Get gatekeeper configuration
  const config = inject<GatekeeperConfig>(GATEKEEPER_CONFIG);

  // Collect diagnostics (explicit call)
  const diagnostics = collectDiagnostics(config, {
    customField: 'custom-value',
  });

  // Export as JSON (explicit call)
  const exported = exportDiagnostics(diagnostics, {
    format: 'json',
    includeSensitive: false, // Exclude sensitive data
  });

  // Log or use exported data
  console.log('Diagnostics:', exported);

  // Or copy to clipboard
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(exported);
    console.log('Diagnostics copied to clipboard');
  }
}

/**
 * Example 2: Download Diagnostics as File
 * 
 * Downloads diagnostic information as a file.
 */
export function exampleDownloadDiagnostics() {
  const config = inject<GatekeeperConfig>(GATEKEEPER_CONFIG);

  // Collect diagnostics (explicit call)
  const diagnostics = collectDiagnostics(config);

  // Download as JSON file (explicit call)
  downloadDiagnostics(diagnostics, {
    format: 'json',
    includeSensitive: false,
  }, 'gatekeeper-diagnostics.json');
}

/**
 * Example 3: Export as Markdown
 * 
 * Exports diagnostic information as Markdown for documentation.
 */
export function exampleExportMarkdown() {
  const config = inject<GatekeeperConfig>(GATEKEEPER_CONFIG);

  // Collect diagnostics (explicit call)
  const diagnostics = collectDiagnostics(config);

  // Export as Markdown (explicit call)
  const exported = exportDiagnostics(diagnostics, {
    format: 'markdown',
  });

  console.log(exported);
}

/**
 * Example 4: Export as Plain Text
 * 
 * Exports diagnostic information as plain text.
 */
export function exampleExportText() {
  const config = inject<GatekeeperConfig>(GATEKEEPER_CONFIG);

  // Collect diagnostics (explicit call)
  const diagnostics = collectDiagnostics(config);

  // Export as text (explicit call)
  const exported = exportDiagnostics(diagnostics, {
    format: 'txt',
  });

  console.log(exported);
}

/**
 * Example 5: Custom Diagnostics Button Component
 * 
 * Creates a button component that exports diagnostics when clicked.
 */
export function createDiagnosticsButton() {
  return {
    // Component implementation
    onClick: () => {
      const config = inject<GatekeeperConfig>(GATEKEEPER_CONFIG);

      // Collect diagnostics (explicit call - only when button is clicked)
      const diagnostics = collectDiagnostics(config, {
        userAction: 'diagnostics-export',
        timestamp: new Date().toISOString(),
      });

      // Download diagnostics (explicit call)
      downloadDiagnostics(diagnostics, {
        format: 'json',
        includeSensitive: false,
      });
    },
  };
}

/**
 * Example 6: Send Diagnostics to Support
 * 
 * Collects diagnostics and sends them to support (explicit user action).
 */
export async function exampleSendToSupport() {
  const config = inject<GatekeeperConfig>(GATEKEEPER_CONFIG);

  // Collect diagnostics (explicit call)
  const diagnostics = collectDiagnostics(config, {
    supportTicket: 'TICKET-12345',
    userEmail: 'user@example.com',
  });

  // Export as JSON
  const exported = exportDiagnostics(diagnostics, {
    format: 'json',
    includeSensitive: false,
  });

  // Send to support API (explicit user action)
  try {
    await fetch('https://support.example.com/diagnostics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        diagnostics: exported,
        ticket: 'TICKET-12345',
      }),
    });
    console.log('Diagnostics sent to support');
  } catch (error) {
    console.error('Failed to send diagnostics:', error);
  }
}

/**
 * Example 7: Diagnostics in Development Mode Only
 * 
 * Only collect and export diagnostics in development mode.
 */
export function exampleDevelopmentOnly() {
  // Check if in development mode
  const isDevelopment = !('production' in window && (window as { production?: boolean }).production);

  if (!isDevelopment) {
    console.log('Diagnostics export only available in development mode');
    return;
  }

  const config = inject<GatekeeperConfig>(GATEKEEPER_CONFIG);

  // Collect diagnostics (explicit call)
  const diagnostics = collectDiagnostics(config);

  // Export (explicit call)
  const exported = exportDiagnostics(diagnostics, {
    format: 'json',
  });

  console.log('Development Diagnostics:', exported);
}

