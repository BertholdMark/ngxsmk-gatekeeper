import {
  Rule,
  SchematicContext,
  Tree,
  apply,
  url,
  template,
  move,
  mergeWith,
  branchAndMerge,
} from '@angular-devkit/schematics';
import { strings } from '@angular-devkit/core';
import { Schema } from './schema';
import { getWorkspace } from '@schematics/angular/utility/workspace';

/**
 * Generate a middleware function
 */
export default function middleware(options: Schema): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    const workspace = await getWorkspace(tree);
    const projectName = options.project || Array.from(workspace.projects.keys())[0];
    const project = workspace.projects.get(projectName);

    if (!project) {
      throw new Error(`Project "${projectName}" not found.`);
    }

    const projectRoot = project.root;
    const sourceRoot = project.sourceRoot || `${projectRoot}/src`;
    const middlewarePath = options.path || `${sourceRoot}/app/middlewares`;

    // Determine template based on type
    const templatePath = options.type === 'auth' 
      ? './auth-middleware' 
      : options.type === 'role'
      ? './role-middleware'
      : './custom-middleware';

    const templateSource = apply(url(templatePath), [
      template({
        ...strings,
        ...options,
        middlewareName: strings.classify(options.name),
        fileName: strings.dasherize(options.name),
      }),
      move(middlewarePath),
    ]);

    return branchAndMerge(mergeWith(templateSource));
  };
}

