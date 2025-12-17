/**
 * Code generator for visual builder
 * 
 * Generates TypeScript code from visual builder state
 */

import { VisualBuilderState, VisualNode, NodeType } from './visual-builder.types';

/**
 * Code generation options
 */
export interface CodeGenerationOptions {
  /** Pipeline name */
  pipelineName?: string;
  /** Export format */
  exportFormat?: 'pipeline' | 'array' | 'inline';
  /** Include imports */
  includeImports?: boolean;
  /** Indentation */
  indent?: number;
}

/**
 * Generate TypeScript code from builder state
 */
export function generateCode(
  state: VisualBuilderState,
  options: CodeGenerationOptions = {}
): string {
  const {
    pipelineName = 'myPipeline',
    exportFormat = 'pipeline',
    includeImports = true,
    indent = 2,
  } = options;

  const indentStr = ' '.repeat(indent);

  // Generate imports
  let code = '';
  if (includeImports) {
    code += "import { definePipeline } from 'ngxsmk-gatekeeper';\n";
    code += '\n';
  }

  // Generate middleware chain
  const middlewares = generateMiddlewareChain(state);

  // Generate code based on format
  switch (exportFormat) {
    case 'pipeline':
      code += generatePipelineCode(pipelineName, middlewares, indentStr);
      break;

    case 'array':
      code += generateArrayCode(middlewares, indentStr);
      break;

    case 'inline':
      code += generateInlineCode(middlewares, indentStr);
      break;
  }

  return code;
}

/**
 * Generate middleware chain from state
 */
function generateMiddlewareChain(state: VisualBuilderState): string[] {
  const { nodes, connections } = state;

  // Find start node
  const startNode = nodes.find((n) => n.type === NodeType.START);
  if (!startNode) {
    return [];
  }

  // Build execution order
  const executionOrder: VisualNode[] = [];
  const visited = new Set<string>();

  const visit = (nodeId: string) => {
    if (visited.has(nodeId)) {
      return;
    }

    const node = nodes.find((n) => n.id === nodeId);
    if (!node) {
      return;
    }

    // Visit all target nodes
    const outgoingConnections = connections.filter(
      (c) => c.sourceId === nodeId && c.type !== 'failure'
    );
    outgoingConnections.forEach((c) => visit(c.targetId));

    visited.add(nodeId);
    if (node.type === NodeType.MIDDLEWARE || node.type === NodeType.PIPELINE) {
      executionOrder.push(node);
    }
  };

  visit(startNode.id);

  // Generate code for each middleware
  return executionOrder.map((node) => generateMiddlewareCode(node));
}

/**
 * Generate code for a middleware node
 */
function generateMiddlewareCode(node: VisualNode): string {
  if (node.type === NodeType.PIPELINE && node.pipeline) {
    const pipelineName = (node.pipeline as any).pipelineName || node.label;
    return `// Pipeline: ${node.label}\n${generatePipelineCode(pipelineName, node.pipeline.middlewares.map(() => '/* middleware */'), '  ')}`;
  }

  // For middleware nodes, generate placeholder
  // In a real implementation, you would serialize the middleware
  const configStr = node.config ? JSON.stringify(node.config, null, 2) : '{}';
  return `// ${node.label}\n// Config: ${configStr}`;
}

/**
 * Generate pipeline code
 */
function generatePipelineCode(
  name: string,
  middlewares: string[],
  indent: string
): string {
  let code = `export const ${name} = definePipeline('${name}', [\n`;

  middlewares.forEach((mw, index) => {
    const isLast = index === middlewares.length - 1;
    const lines = mw.split('\n');
    lines.forEach((line, lineIndex) => {
      code += indent + line;
      if (lineIndex === lines.length - 1 && !isLast) {
        code += ',';
      }
      code += '\n';
    });
  });

  code += ']);\n';
  return code;
}

/**
 * Generate array code
 */
function generateArrayCode(middlewares: string[], indent: string): string {
  let code = 'export const middlewares = [\n';

  middlewares.forEach((mw, index) => {
    const isLast = index === middlewares.length - 1;
    const lines = mw.split('\n');
    lines.forEach((line, lineIndex) => {
      code += indent + line;
      if (lineIndex === lines.length - 1 && !isLast) {
        code += ',';
      }
      code += '\n';
    });
  });

  code += '];\n';
  return code;
}

/**
 * Generate inline code
 */
function generateInlineCode(middlewares: string[], indent: string): string {
  let code = '[\n';

  middlewares.forEach((mw, index) => {
    const isLast = index === middlewares.length - 1;
    const lines = mw.split('\n');
    lines.forEach((line, lineIndex) => {
      code += indent + line;
      if (lineIndex === lines.length - 1 && !isLast) {
        code += ',';
      }
      code += '\n';
    });
  });

  code += ']\n';
  return code;
}

/**
 * Generate configuration code
 */
export function generateConfigCode(
  _state: VisualBuilderState,
  options: CodeGenerationOptions = {}
): string {
  const { indent = 2 } = options;
  const indentStr = ' '.repeat(indent);

  let code = "import { provideGatekeeper } from 'ngxsmk-gatekeeper';\n";
  code += '\n';
  code += 'export const gatekeeperConfig = provideGatekeeper({\n';
  code += `${indentStr}middlewares: [\n`;
  code += `${indentStr}${indentStr}// Generated from visual builder\n`;
  code += `${indentStr}],\n`;
  code += '});\n';

  return code;
}

