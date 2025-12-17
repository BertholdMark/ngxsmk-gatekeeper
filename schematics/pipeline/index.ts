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
 * Generate a middleware pipeline
 */
export default function pipeline(options: Schema): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    const workspace = await getWorkspace(tree);
    const projectName = options.project || Array.from(workspace.projects.keys())[0];
    const project = workspace.projects.get(projectName);

    if (!project) {
      throw new Error(`Project "${projectName}" not found.`);
    }

    const projectRoot = project.root;
    const sourceRoot = project.sourceRoot || `${projectRoot}/src`;
    const pipelinePath = options.path || `${sourceRoot}/app/pipelines`;

    // Process middlewares array
    const middlewares = options.middlewares || ['auth'];
    const middlewareImports = middlewares.map((mw) => {
      const mwName = strings.camelize(mw);
      return `import { ${mwName}Middleware } from '../middlewares/${strings.dasherize(mw)}.middleware';`;
    });
    const middlewareList = middlewares
      .map((mw) => `    ${strings.camelize(mw)}Middleware,`)
      .join('\n');

    const templateSource = apply(url('./pipeline'), [
      template({
        ...strings,
        ...options,
        pipelineName: strings.camelize(options.name),
        fileName: strings.dasherize(options.name),
        middlewareImports: middlewareImports.join('\n'),
        middlewareList,
      }),
      move(pipelinePath),
    ]);

    return branchAndMerge(mergeWith(templateSource));
  };
}

