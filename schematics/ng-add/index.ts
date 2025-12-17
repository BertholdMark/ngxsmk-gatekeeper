import {
  Rule,
  SchematicContext,
  Tree,
  chain,
  mergeWith,
  apply,
  url,
  template,
  move,
} from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { Schema as NgAddSchema } from './schema';
import { getWorkspace } from '@schematics/angular/utility/workspace';

interface Schema extends NgAddSchema {
  project?: string;
}

/**
 * Main schematic function for ng-add
 */
export default function ngAdd(options: Schema): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    const workspace = await getWorkspace(tree);
    const projectName = options.project || Array.from(workspace.projects.keys())[0];
    const project = workspace.projects.get(projectName);

    if (!project) {
      throw new Error(`Project "${projectName}" not found.`);
    }

    const rules: Rule[] = [];

    // Add package installation task
    if (!options.skipInstall) {
      context.addTask(new NodePackageInstallTask());
    }

    // Create example files if requested
    if (options.createExample) {
      rules.push(createExampleFiles(projectName));
    }

    // Set up guard configuration
    if (options.setupGuard) {
      rules.push(setupGuardConfiguration(projectName));
    }

    // Set up interceptor configuration
    if (options.setupInterceptor) {
      rules.push(setupInterceptorConfiguration(projectName));
    }

    return chain(rules);
  };
}

/**
 * Create example middleware and route files
 */
function createExampleFiles(projectName: string): Rule {
  return mergeWith(
    apply(url('./files'), [
      template({
        projectName,
      }),
      move(`projects/${projectName}/src/app`),
    ])
  );
}

/**
 * Set up guard configuration in app.config.ts or main.ts
 * Creates a configuration file if it doesn't exist
 */
function setupGuardConfiguration(projectName: string): Rule {
  return (tree: Tree) => {
    const projectPath = `projects/${projectName}/src`;
    const mainPath = `${projectPath}/main.ts`;
    const appConfigPath = `${projectPath}/app/app.config.ts`;

    // Try app.config.ts first (standalone)
    if (tree.exists(appConfigPath)) {
      const configContent = tree.read(appConfigPath)?.toString() || '';
      
      // Check if already configured
      if (configContent.includes('provideGatekeeper')) {
        return tree;
      }

      // Add imports if not present
      let updatedContent = configContent;
      if (!configContent.includes("from 'ngxsmk-gatekeeper'")) {
        updatedContent = `import { provideGatekeeper } from 'ngxsmk-gatekeeper';\nimport { createAuthMiddleware } from 'ngxsmk-gatekeeper/lib/middlewares';\n${updatedContent}`;
      }

      // Add to providers array
      const providersMatch = updatedContent.match(/providers:\s*\[([^\]]*)\]/);
      if (providersMatch) {
        const insertPos = providersMatch.index! + providersMatch[0].indexOf('[') + 1;
        const existingProviders = providersMatch[1].trim();
        const newProvider = existingProviders
          ? `\n    provideGatekeeper({\n      middlewares: [createAuthMiddleware()],\n      onFail: '/login',\n    }),`
          : `provideGatekeeper({\n      middlewares: [createAuthMiddleware()],\n      onFail: '/login',\n    })`;
        updatedContent = updatedContent.slice(0, insertPos) + newProvider + updatedContent.slice(insertPos);
        tree.overwrite(appConfigPath, updatedContent);
      }
      return tree;
    }

    // Try main.ts (standalone)
    if (tree.exists(mainPath)) {
      const mainContent = tree.read(mainPath)?.toString() || '';
      
      // Check if already configured
      if (mainContent.includes('provideGatekeeper')) {
        return tree;
      }

      // Add imports if not present
      let updatedContent = mainContent;
      if (!updatedContent.includes("from 'ngxsmk-gatekeeper'")) {
        updatedContent = `import { provideGatekeeper } from 'ngxsmk-gatekeeper';\nimport { createAuthMiddleware } from 'ngxsmk-gatekeeper/lib/middlewares';\n${updatedContent}`;
      }

      // Add provider to providers array
      const providersMatch = updatedContent.match(/providers:\s*\[([^\]]*)\]/);
      if (providersMatch) {
        const insertPos = providersMatch.index! + providersMatch[0].indexOf('[') + 1;
        const existingProviders = providersMatch[1].trim();
        const newProvider = existingProviders
          ? `\n    provideGatekeeper({\n      middlewares: [createAuthMiddleware()],\n      onFail: '/login',\n    }),`
          : `provideGatekeeper({\n      middlewares: [createAuthMiddleware()],\n      onFail: '/login',\n    })`;
        updatedContent = updatedContent.slice(0, insertPos) + newProvider + updatedContent.slice(insertPos);
        tree.overwrite(mainPath, updatedContent);
      }
    }

    return tree;
  };
}

/**
 * Set up HTTP interceptor configuration
 */
function setupInterceptorConfiguration(projectName: string): Rule {
  return (tree: Tree) => {
    const projectPath = `projects/${projectName}/src`;
    const mainPath = `${projectPath}/main.ts`;
    const appConfigPath = `${projectPath}/app/app.config.ts`;

    // Try app.config.ts first
    if (tree.exists(appConfigPath)) {
      const configContent = tree.read(appConfigPath)?.toString() || '';
      
      // Check if already configured
      if (configContent.includes('gatekeeperInterceptor')) {
        return tree;
      }

      // Add imports if not present
      let updatedContent = configContent;
      if (!updatedContent.includes("from '@angular/common/http'")) {
        updatedContent = `import { provideHttpClient, withInterceptors } from '@angular/common/http';\n${updatedContent}`;
      }
      if (!updatedContent.includes("from 'ngxsmk-gatekeeper'")) {
        updatedContent = `import { gatekeeperInterceptor } from 'ngxsmk-gatekeeper';\n${updatedContent}`;
      }

      // Update or add provideHttpClient
      const httpClientMatch = updatedContent.match(/provideHttpClient\(([^)]*)\)/);
      if (httpClientMatch) {
        // Update existing
        const insertPos = httpClientMatch.index! + httpClientMatch[0].indexOf('(') + 1;
        const existingArgs = httpClientMatch[1].trim();
        const newArg = existingArgs
          ? `\n    ${existingArgs},\n    withInterceptors([gatekeeperInterceptor])`
          : `withInterceptors([gatekeeperInterceptor])`;
        updatedContent = updatedContent.slice(0, insertPos) + newArg + updatedContent.slice(insertPos);
      } else {
        // Add new provideHttpClient to providers
        const providersMatch = updatedContent.match(/providers:\s*\[([^\]]*)\]/);
        if (providersMatch) {
          const insertPos = providersMatch.index! + providersMatch[0].indexOf('[') + 1;
          const existingProviders = providersMatch[1].trim();
          const newProvider = existingProviders
            ? `\n    provideHttpClient(withInterceptors([gatekeeperInterceptor])),`
            : `provideHttpClient(withInterceptors([gatekeeperInterceptor]))`;
          updatedContent = updatedContent.slice(0, insertPos) + newProvider + updatedContent.slice(insertPos);
        }
      }
      tree.overwrite(appConfigPath, updatedContent);
      return tree;
    }

    // Try main.ts
    if (tree.exists(mainPath)) {
      const mainContent = tree.read(mainPath)?.toString() || '';
      
      // Check if already configured
      if (mainContent.includes('gatekeeperInterceptor')) {
        return tree;
      }

      // Add imports if not present
      let updatedContent = mainContent;
      if (!updatedContent.includes("from '@angular/common/http'")) {
        updatedContent = `import { provideHttpClient, withInterceptors } from '@angular/common/http';\n${updatedContent}`;
      }
      if (!updatedContent.includes("from 'ngxsmk-gatekeeper'")) {
        updatedContent = `import { gatekeeperInterceptor } from 'ngxsmk-gatekeeper';\n${updatedContent}`;
      }

      // Update or add provideHttpClient
      const httpClientMatch = updatedContent.match(/provideHttpClient\(([^)]*)\)/);
      if (httpClientMatch) {
        const insertPos = httpClientMatch.index! + httpClientMatch[0].indexOf('(') + 1;
        const existingArgs = httpClientMatch[1].trim();
        const newArg = existingArgs
          ? `\n    ${existingArgs},\n    withInterceptors([gatekeeperInterceptor])`
          : `withInterceptors([gatekeeperInterceptor])`;
        updatedContent = updatedContent.slice(0, insertPos) + newArg + updatedContent.slice(insertPos);
      } else {
        const providersMatch = updatedContent.match(/providers:\s*\[([^\]]*)\]/);
        if (providersMatch) {
          const insertPos = providersMatch.index! + providersMatch[0].indexOf('[') + 1;
          const existingProviders = providersMatch[1].trim();
          const newProvider = existingProviders
            ? `\n    provideHttpClient(withInterceptors([gatekeeperInterceptor])),`
            : `provideHttpClient(withInterceptors([gatekeeperInterceptor]))`;
          updatedContent = updatedContent.slice(0, insertPos) + newProvider + updatedContent.slice(insertPos);
        }
      }
      tree.overwrite(mainPath, updatedContent);
    }

    return tree;
  };
}

