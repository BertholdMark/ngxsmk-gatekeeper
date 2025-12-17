/**
 * Playground URL Generator
 * 
 * Generates shareable StackBlitz and CodeSandbox URLs for examples
 */

export interface PlaygroundConfig {
  example: string;
  platform: 'stackblitz' | 'codesandbox';
  files?: Record<string, string>;
}

export interface PlaygroundURLs {
  stackblitz: string;
  codesandbox: string;
}

/**
 * Generate StackBlitz URL
 */
export function generateStackBlitzURL(config: PlaygroundConfig): string {
  const baseURL = 'https://stackblitz.com/github';
  const repo = 'NGXSMK/ngxsmk-gatekeeper';
  const examplePath = `tools/playground/stackblitz/examples/${config.example}`;
  
  // StackBlitz supports embedding via GitHub paths
  return `${baseURL}/${repo}/tree/main/${examplePath}`;
}

/**
 * Generate CodeSandbox URL
 */
export function generateCodeSandboxURL(config: PlaygroundConfig): string {
  // CodeSandbox uses a different approach - you can create sandboxes via API
  // For now, return a template URL that can be used with their import feature
  const baseURL = 'https://codesandbox.io/s';
  // This would typically be generated via their API or import feature
  return `${baseURL}/ngxsmk-gatekeeper-${config.example}`;
}

/**
 * Generate both playground URLs
 */
export function generatePlaygroundURLs(example: string): PlaygroundURLs {
  return {
    stackblitz: generateStackBlitzURL({ example, platform: 'stackblitz' }),
    codesandbox: generateCodeSandboxURL({ example, platform: 'codesandbox' }),
  };
}

/**
 * Available playground examples
 */
export const PLAYGROUND_EXAMPLES = {
  'minimal-auth': {
    name: 'Minimal Authentication',
    description: 'Basic authentication protection example',
    tags: ['auth', 'route-protection', 'beginner'],
  },
  'role-based': {
    name: 'Role-Based Access Control',
    description: 'Role-based access control example',
    tags: ['rbac', 'roles', 'intermediate'],
  },
  'http-protection': {
    name: 'HTTP Request Protection',
    description: 'Protect HTTP requests with middleware',
    tags: ['http', 'interceptor', 'intermediate'],
  },
} as const;

export type PlaygroundExample = keyof typeof PLAYGROUND_EXAMPLES;

