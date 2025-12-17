# Visual Middleware Builder

A web-based visual builder with drag-and-drop interface for creating middleware chains.

## Overview

The visual builder provides:

- **Drag-and-drop interface** for building middleware chains
- **Visual node editor** for configuring middleware
- **Real-time code generation** from visual representation
- **Export/import** functionality
- **Undo/redo** support
- **Template library** with pre-built middleware

## Quick Start

### 1. Install Dependencies

```bash
npm install ngxsmk-gatekeeper
```

### 2. Set Up Visual Builder

```typescript
import { VisualBuilderService } from 'ngxsmk-gatekeeper/lib/visual-builder';
import { TemplateRegistry, createDefaultTemplateRegistry } from 'ngxsmk-gatekeeper/lib/visual-builder';

@Component({
  selector: 'app-builder',
  template: `
    <div class="visual-builder">
      <!-- Your builder UI here -->
    </div>
  `,
})
export class BuilderComponent {
  private builderService = new VisualBuilderService();
  private templateRegistry = createDefaultTemplateRegistry();

  constructor() {
    // Initialize builder
  }
}
```

## Architecture

```
┌─────────────────┐
│  Template       │
│  Registry       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Visual Builder │
│  Service        │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌──────────────┐
│ Nodes  │ │ Connections  │
└────────┘ └──────────────┘
    │
    ▼
┌─────────────────┐
│  Code Generator │
└─────────────────┘
```

## Components

### VisualBuilderService

Main service for managing builder state.

```typescript
import { VisualBuilderService } from 'ngxsmk-gatekeeper/lib/visual-builder';

const service = new VisualBuilderService();

// Add a node
const nodeId = service.addNode({
  type: NodeType.MIDDLEWARE,
  label: 'Authentication',
  position: { x: 100, y: 100 },
  size: { width: 200, height: 100 },
  middleware: createAuthMiddleware(),
});

// Add a connection
service.addConnection(sourceNodeId, targetNodeId);

// Generate middleware chain
const middlewares = service.generateMiddlewareChain();
```

### TemplateRegistry

Registry for middleware templates.

```typescript
import { TemplateRegistry, createDefaultTemplateRegistry } from 'ngxsmk-gatekeeper/lib/visual-builder';

const registry = createDefaultTemplateRegistry();

// Get all templates
const templates = registry.getAll();

// Get templates by category
const authTemplates = registry.getByCategory('Authentication');

// Create middleware from template
const middleware = registry.createMiddleware('auth', {
  authPath: 'user.isAuthenticated',
});
```

### Code Generator

Generate TypeScript code from visual builder state.

```typescript
import { generateCode } from 'ngxsmk-gatekeeper/lib/visual-builder';

const code = generateCode(builderService.state, {
  pipelineName: 'myPipeline',
  exportFormat: 'pipeline',
  includeImports: true,
});
```

## Drag and Drop

### Setting Up Drag and Drop

```typescript
import { setDragData, getDragData, calculateDropPosition } from 'ngxsmk-gatekeeper/lib/visual-builder';

// On template drag start
onTemplateDragStart(event: DragEvent, template: MiddlewareTemplate) {
  setDragData(event, {
    type: 'template',
    templateId: template.id,
  });
}

// On canvas drop
onCanvasDrop(event: DragEvent) {
  event.preventDefault();
  const dragData = getDragData(event);
  if (dragData?.type === 'template') {
    const position = calculateDropPosition(event, canvasElement);
    // Create node at position
  }
}
```

## Node Types

- **START** - Start node (entry point)
- **MIDDLEWARE** - Middleware node
- **PIPELINE** - Pipeline node
- **CONDITION** - Conditional node
- **END** - End node

## Connections

Connections link nodes together:

- **success** - Success path (green)
- **failure** - Failure path (red)
- **default** - Default path (gray)

```typescript
// Add connection
service.addConnection(sourceId, targetId, 'success');

// Remove connection
service.removeConnection(connectionId);
```

## Export/Import

### Export Builder State

```typescript
const exportData = builderService.export();

// Save to file
const blob = new Blob([JSON.stringify(exportData, null, 2)], {
  type: 'application/json',
});
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'middleware-builder.json';
a.click();
```

### Import Builder State

```typescript
const result = builderService.import(exportData);
if (result.success) {
  console.log('Import successful');
} else {
  console.error('Import failed:', result.error);
}
```

## Code Generation

Generate TypeScript code from visual builder:

```typescript
import { generateCode, generateConfigCode } from 'ngxsmk-gatekeeper/lib/visual-builder';

// Generate pipeline code
const pipelineCode = generateCode(builderService.state, {
  pipelineName: 'myPipeline',
  exportFormat: 'pipeline',
});

// Generate configuration code
const configCode = generateConfigCode(builderService.state);
```

## UI Libraries

The visual builder is framework-agnostic. You can use any UI library:

- **Angular CDK Drag-Drop** - For Angular applications
- **React Flow** - For React applications
- **Cytoscape.js** - For graph visualization
- **mxGraph** - For diagramming
- **D3.js** - For custom visualizations

## Example Implementation

See `visual-builder.component.example.ts` for a complete Angular component example.

## Best Practices

1. **Use Templates**: Leverage the template registry for common middleware
2. **Validate Connections**: Check for cycles and invalid connections
3. **Auto-save**: Implement auto-save functionality
4. **Undo/Redo**: Use the built-in history system
5. **Export Regularly**: Export your work frequently

## See Also

- [Middleware Pattern](./middleware-pattern.md)
- [Pipeline Guide](./pipeline-guide.md)
- [Examples](../../projects/ngxsmk-gatekeeper/examples/)

