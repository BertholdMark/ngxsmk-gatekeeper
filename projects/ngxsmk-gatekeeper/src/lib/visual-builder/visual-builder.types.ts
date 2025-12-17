/**
 * Visual builder types for drag-and-drop middleware construction
 */

import { NgxMiddleware } from '../core';
import { MiddlewarePipeline } from '../helpers';

/**
 * Node types in the visual builder
 */
export enum NodeType {
  /** Middleware node */
  MIDDLEWARE = 'middleware',
  /** Pipeline node */
  PIPELINE = 'pipeline',
  /** Start node */
  START = 'start',
  /** End node */
  END = 'end',
  /** Condition node */
  CONDITION = 'condition',
}

/**
 * Visual node representation
 */
export interface VisualNode {
  /** Unique node ID */
  id: string;
  /** Node type */
  type: NodeType;
  /** Node label */
  label: string;
  /** Node position */
  position: { x: number; y: number };
  /** Node size */
  size: { width: number; height: number };
  /** Middleware instance (if type is MIDDLEWARE) */
  middleware?: NgxMiddleware;
  /** Pipeline instance (if type is PIPELINE) */
  pipeline?: MiddlewarePipeline;
  /** Configuration options */
  config?: Record<string, unknown>;
  /** Node metadata */
  metadata?: {
    description?: string;
    category?: string;
    icon?: string;
    color?: string;
  };
}

/**
 * Connection between nodes
 */
export interface VisualConnection {
  /** Connection ID */
  id: string;
  /** Source node ID */
  sourceId: string;
  /** Target node ID */
  targetId: string;
  /** Connection type */
  type: 'success' | 'failure' | 'default';
  /** Connection label */
  label?: string;
}

/**
 * Visual builder state
 */
export interface VisualBuilderState {
  /** All nodes */
  nodes: VisualNode[];
  /** All connections */
  connections: VisualConnection[];
  /** Selected node IDs */
  selectedNodes: string[];
  /** Zoom level */
  zoom: number;
  /** Pan offset */
  pan: { x: number; y: number };
  /** Viewport size */
  viewport: { width: number; height: number };
}

/**
 * Middleware template for the builder
 */
export interface MiddlewareTemplate {
  /** Template ID */
  id: string;
  /** Template name */
  name: string;
  /** Template description */
  description: string;
  /** Template category */
  category: string;
  /** Template icon */
  icon?: string;
  /** Template color */
  color?: string;
  /** Factory function to create middleware */
  factory: (config?: Record<string, unknown>) => NgxMiddleware;
  /** Configuration schema */
  configSchema?: {
    [key: string]: {
      type: 'string' | 'number' | 'boolean' | 'array' | 'object';
      label: string;
      description?: string;
      default?: unknown;
      required?: boolean;
      options?: unknown[];
    };
  };
}

/**
 * Builder configuration
 */
export interface VisualBuilderConfig {
  /** Available middleware templates */
  templates: MiddlewareTemplate[];
  /** Enable drag and drop */
  enableDragDrop?: boolean;
  /** Enable snap to grid */
  enableSnapToGrid?: boolean;
  /** Grid size */
  gridSize?: number;
  /** Default node size */
  defaultNodeSize?: { width: number; height: number };
  /** Enable validation */
  enableValidation?: boolean;
  /** Auto-save interval (ms) */
  autoSaveInterval?: number;
}

/**
 * Export format for visual builder
 */
export interface VisualBuilderExport {
  /** Version */
  version: string;
  /** Builder state */
  state: VisualBuilderState;
  /** Metadata */
  metadata?: {
    name?: string;
    description?: string;
    createdAt?: string;
    updatedAt?: string;
  };
}

/**
 * Import result
 */
export interface VisualBuilderImportResult {
  /** Success flag */
  success: boolean;
  /** Error message (if failed) */
  error?: string;
  /** Imported state */
  state?: VisualBuilderState;
  /** Warnings */
  warnings?: string[];
}

/**
 * Node drag data
 */
export interface NodeDragData {
  /** Template ID */
  templateId?: string;
  /** Node data */
  node?: VisualNode;
  /** Drag type */
  type: 'template' | 'node';
}

/**
 * Connection validation result
 */
export interface ConnectionValidationResult {
  /** Valid flag */
  valid: boolean;
  /** Error message */
  error?: string;
  /** Warning message */
  warning?: string;
}

/**
 * Builder action types
 */
export enum BuilderActionType {
  ADD_NODE = 'add_node',
  REMOVE_NODE = 'remove_node',
  UPDATE_NODE = 'update_node',
  ADD_CONNECTION = 'add_connection',
  REMOVE_CONNECTION = 'remove_connection',
  SELECT_NODE = 'select_node',
  DESELECT_NODE = 'deselect_node',
  CLEAR_SELECTION = 'clear_selection',
  ZOOM = 'zoom',
  PAN = 'pan',
  RESET_VIEW = 'reset_view',
}

/**
 * Builder action
 */
export interface BuilderAction {
  /** Action type */
  type: BuilderActionType;
  /** Action payload */
  payload?: unknown;
  /** Timestamp */
  timestamp: number;
}

