/**
 * Visual builder component example
 * 
 * This is a reference implementation showing how to create
 * a visual middleware builder component with drag-and-drop.
 * 
 * In a real implementation, you would create an Angular component
 * with proper UI using Angular CDK drag-drop or a library like
 * React Flow, Cytoscape.js, or mxGraph.
 */

/**
 * Example Angular component structure
 * 
 * This example shows the structure and logic for a visual builder component.
 * You would need to implement the actual UI using your preferred
 * drag-and-drop library.
 */
export const VisualBuilderComponentExample = `
import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { VisualBuilderService } from 'ngxsmk-gatekeeper/lib/visual-builder';
import { TemplateRegistry, createDefaultTemplateRegistry } from 'ngxsmk-gatekeeper/lib/visual-builder';
import { VisualNode, VisualConnection, NodeType } from 'ngxsmk-gatekeeper/lib/visual-builder';
import { setDragData, getDragData, calculateDropPosition, snapToGrid } from 'ngxsmk-gatekeeper/lib/visual-builder';

@Component({
  selector: 'app-visual-builder',
  template: \`
    <div class="visual-builder">
      <!-- Toolbar -->
      <div class="toolbar">
        <button (click)="export()">Export</button>
        <button (click)="import()">Import</button>
        <button (click)="generateCode()">Generate Code</button>
        <button (click)="clear()">Clear</button>
        <button (click)="undo()" [disabled]="!canUndo">Undo</button>
        <button (click)="redo()" [disabled]="!canRedo">Redo</button>
      </div>

      <div class="builder-container">
        <!-- Sidebar with templates -->
        <div class="sidebar">
          <h3>Middleware Templates</h3>
          <div class="template-list">
            <div
              *ngFor="let template of templates"
              class="template-item"
              draggable="true"
              (dragstart)="onTemplateDragStart($event, template)"
            >
              <div class="template-icon" [style.background-color]="template.color">
                {{ template.icon }}
              </div>
              <div class="template-info">
                <div class="template-name">{{ template.name }}</div>
                <div class="template-description">{{ template.description }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Canvas -->
        <div
          class="canvas"
          #canvas
          (drop)="onCanvasDrop($event)"
          (dragover)="onCanvasDragOver($event)"
          (click)="onCanvasClick($event)"
        >
          <!-- Grid background -->
          <svg class="grid" *ngIf="showGrid">
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e0e0e0" stroke-width="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          <!-- Connections -->
          <svg class="connections">
            <path
              *ngFor="let connection of connections"
              [attr.d]="getConnectionPath(connection)"
              [attr.stroke]="getConnectionColor(connection)"
              stroke-width="2"
              fill="none"
              marker-end="url(#arrowhead)"
            />
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                <polygon points="0 0, 10 3, 0 6" fill="#666" />
              </marker>
            </defs>
          </svg>

          <!-- Nodes -->
          <div
            *ngFor="let node of nodes"
            class="node"
            [class.selected]="isSelected(node.id)"
            [style.left.px]="node.position.x"
            [style.top.px]="node.position.y"
            [style.width.px]="node.size.width"
            [style.height.px]="node.size.height"
            [style.border-color]="node.metadata?.color"
            (mousedown)="onNodeMouseDown($event, node)"
            (click)="onNodeClick($event, node)"
          >
            <div class="node-header">
              <div class="node-icon" [style.background-color]="node.metadata?.color">
                {{ node.metadata?.icon }}
              </div>
              <div class="node-label">{{ node.label }}</div>
              <button class="node-delete" (click)="deleteNode(node.id)">×</button>
            </div>
            <div class="node-body">
              <div class="node-description">{{ node.metadata?.description }}</div>
            </div>
            <!-- Connection points -->
            <div class="connection-point input" (mousedown)="onConnectionStart($event, node, 'input')"></div>
            <div class="connection-point output" (mousedown)="onConnectionStart($event, node, 'output')"></div>
          </div>
        </div>

        <!-- Properties panel -->
        <div class="properties-panel" *ngIf="selectedNode">
          <h3>Properties</h3>
          <div class="property-form">
            <div class="property-field">
              <label>Label</label>
              <input [(ngModel)]="selectedNode.label" (blur)="updateNode()" />
            </div>
            <div class="property-field" *ngIf="selectedNode.config">
              <label *ngFor="let key of getConfigKeys(selectedNode)">
                {{ key }}
                <input
                  type="text"
                  [(ngModel)]="selectedNode.config[key]"
                  (blur)="updateNode()"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  \`,
  styles: [\`
    .visual-builder {
      display: flex;
      flex-direction: column;
      height: 100vh;
    }
    .toolbar {
      display: flex;
      gap: 10px;
      padding: 10px;
      background: #f5f5f5;
      border-bottom: 1px solid #ddd;
    }
    .builder-container {
      display: flex;
      flex: 1;
      overflow: hidden;
    }
    .sidebar {
      width: 250px;
      background: white;
      border-right: 1px solid #ddd;
      overflow-y: auto;
    }
    .template-list {
      padding: 10px;
    }
    .template-item {
      display: flex;
      align-items: center;
      padding: 10px;
      margin-bottom: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      cursor: grab;
      background: white;
    }
    .template-item:active {
      cursor: grabbing;
    }
    .template-icon {
      width: 40px;
      height: 40px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      margin-right: 10px;
    }
    .canvas {
      flex: 1;
      position: relative;
      overflow: auto;
      background: #fafafa;
    }
    .grid {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }
    .connections {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }
    .node {
      position: absolute;
      background: white;
      border: 2px solid #ddd;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      cursor: move;
    }
    .node.selected {
      border-color: #2196f3;
      box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.2);
    }
    .node-header {
      display: flex;
      align-items: center;
      padding: 10px;
      border-bottom: 1px solid #eee;
    }
    .node-icon {
      width: 24px;
      height: 24px;
      border-radius: 4px;
      margin-right: 8px;
    }
    .node-label {
      flex: 1;
      font-weight: 600;
    }
    .connection-point {
      position: absolute;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #2196f3;
      border: 2px solid white;
      cursor: crosshair;
    }
    .connection-point.input {
      top: -6px;
      left: 50%;
      transform: translateX(-50%);
    }
    .connection-point.output {
      bottom: -6px;
      left: 50%;
      transform: translateX(-50%);
    }
    .properties-panel {
      width: 300px;
      background: white;
      border-left: 1px solid #ddd;
      overflow-y: auto;
      padding: 20px;
    }
  \`],
})
export class VisualBuilderComponent implements OnInit, OnDestroy {
  @ViewChild('canvas', { static: false }) canvasRef!: ElementRef<HTMLDivElement>;

  nodes: VisualNode[] = [];
  connections: VisualConnection[] = [];
  templates: any[] = [];
  selectedNode: VisualNode | null = null;
  showGrid = true;
  canUndo = false;
  canRedo = false;

  private templateRegistry: TemplateRegistry;
  private subscription: any;

  constructor(private builderService: VisualBuilderService) {
    this.templateRegistry = createDefaultTemplateRegistry();
  }

  ngOnInit() {
    this.templates = this.templateRegistry.getAll();
    
    this.subscription = this.builderService.state$.subscribe((state) => {
      this.nodes = state.nodes;
      this.connections = state.connections;
      this.selectedNode = state.selectedNodes.length > 0
        ? this.nodes.find(n => n.id === state.selectedNodes[0]) || null
        : null;
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  onTemplateDragStart(event: DragEvent, template: any) {
    setDragData(event, {
      type: 'template',
      templateId: template.id,
    });
  }

  onCanvasDragOver(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }
  }

  onCanvasDrop(event: DragEvent) {
    event.preventDefault();
    const dragData = getDragData(event);
    if (!dragData || !this.canvasRef) {
      return;
    }

    const position = calculateDropPosition(event, this.canvasRef.nativeElement);
    const snappedPosition = snapToGrid(position, 20);

    if (dragData.type === 'template' && dragData.templateId) {
      const template = this.templateRegistry.get(dragData.templateId);
      if (template) {
        const middleware = this.templateRegistry.createMiddleware(dragData.templateId);
        if (middleware) {
          this.builderService.addNode({
            type: NodeType.MIDDLEWARE,
            label: template.name,
            position: snappedPosition,
            size: { width: 200, height: 100 },
            middleware,
            config: {},
            metadata: {
              description: template.description,
              category: template.category,
              icon: template.icon,
              color: template.color,
            },
          });
        }
      }
    }
  }

  onNodeClick(event: MouseEvent, node: VisualNode) {
    event.stopPropagation();
    this.builderService.selectNode(node.id);
  }

  onCanvasClick(event: MouseEvent) {
    this.builderService.clearSelection();
  }

  deleteNode(nodeId: string) {
    this.builderService.removeNode(nodeId);
  }

  updateNode() {
    if (this.selectedNode) {
      this.builderService.updateNode(this.selectedNode.id, this.selectedNode);
    }
  }

  isSelected(nodeId: string): boolean {
    return this.builderService.state.selectedNodes.includes(nodeId);
  }

  export() {
    const exportData = this.builderService.export();
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'middleware-builder.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  import() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event: any) => {
          try {
            const data = JSON.parse(event.target.result);
            const result = this.builderService.import(data);
            if (!result.success) {
              alert('Import failed: ' + result.error);
            }
          } catch (error) {
            alert('Failed to parse file');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }

  generateCode() {
    try {
      const pipeline = this.builderService.generatePipeline('myPipeline');
      const code = \`import { definePipeline } from 'ngxsmk-gatekeeper';

export const myPipeline = definePipeline('myPipeline', [
  // Generated middleware chain
  ...\${JSON.stringify(pipeline.middlewares, null, 2)}
]);
\`;
      console.log(code);
      // In a real implementation, you would show this in a code editor or copy to clipboard
    } catch (error) {
      alert('Failed to generate code: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  clear() {
    if (confirm('Are you sure you want to clear all nodes?')) {
      this.builderService.clear();
    }
  }

  undo() {
    this.builderService.undo();
  }

  redo() {
    this.builderService.redo();
  }

  getConnectionPath(connection: VisualConnection): string {
    const sourceNode = this.nodes.find(n => n.id === connection.sourceId);
    const targetNode = this.nodes.find(n => n.id === connection.targetId);
    if (!sourceNode || !targetNode) {
      return '';
    }

    const sourceY = sourceNode.position.y + sourceNode.size.height;
    const sourceX = sourceNode.position.x + sourceNode.size.width / 2;
    const targetY = targetNode.position.y;
    const targetX = targetNode.position.x + targetNode.size.width / 2;

    return \`M \${sourceX} \${sourceY} L \${targetX} \${targetY}\`;
  }

  getConnectionColor(connection: VisualConnection): string {
    switch (connection.type) {
      case 'success':
        return '#4caf50';
      case 'failure':
        return '#f44336';
      default:
        return '#666';
    }
  }

  getConfigKeys(node: VisualNode): string[] {
    return node.config ? Object.keys(node.config) : [];
  }

  onNodeMouseDown(event: MouseEvent, node: VisualNode) {
    // Handle node dragging
    // In a real implementation, you would implement drag functionality
  }

  onConnectionStart(event: MouseEvent, node: VisualNode, type: 'input' | 'output') {
    event.stopPropagation();
    // Handle connection creation
    // In a real implementation, you would implement connection drawing
  }
}
`;

