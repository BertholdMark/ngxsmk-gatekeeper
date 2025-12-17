/**
 * Drag and drop utilities for visual builder
 */

import { NodeDragData, VisualNode } from './visual-builder.types';

/**
 * Drag data transfer key
 */
export const DRAG_DATA_KEY = 'application/x-ngxsmk-gatekeeper-node';

/**
 * Set drag data on drag event
 */
export function setDragData(event: DragEvent, data: NodeDragData): void {
  if (event.dataTransfer) {
    event.dataTransfer.setData(DRAG_DATA_KEY, JSON.stringify(data));
    event.dataTransfer.effectAllowed = 'copy';
  }
}

/**
 * Get drag data from drop event
 */
export function getDragData(event: DragEvent): NodeDragData | null {
  if (!event.dataTransfer) {
    return null;
  }

  try {
    const data = event.dataTransfer.getData(DRAG_DATA_KEY);
    if (!data) {
      return null;
    }
    return JSON.parse(data) as NodeDragData;
  } catch (error) {
    console.error('Failed to parse drag data:', error);
    return null;
  }
}

/**
 * Check if drag event contains valid data
 */
export function hasDragData(event: DragEvent): boolean {
  if (!event.dataTransfer) {
    return false;
  }

  const types = event.dataTransfer.types;
  return types.includes(DRAG_DATA_KEY);
}

/**
 * Calculate drop position relative to container
 */
export function calculateDropPosition(
  event: DragEvent | MouseEvent,
  container: HTMLElement
): { x: number; y: number } {
  const rect = container.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}

/**
 * Snap position to grid
 */
export function snapToGrid(
  position: { x: number; y: number },
  gridSize: number
): { x: number; y: number } {
  return {
    x: Math.round(position.x / gridSize) * gridSize,
    y: Math.round(position.y / gridSize) * gridSize,
  };
}

/**
 * Check if position is within bounds
 */
export function isWithinBounds(
  position: { x: number; y: number },
  bounds: { x: number; y: number; width: number; height: number }
): boolean {
  return (
    position.x >= bounds.x &&
    position.x <= bounds.x + bounds.width &&
    position.y >= bounds.y &&
    position.y <= bounds.y + bounds.height
  );
}

/**
 * Find node at position
 */
export function findNodeAtPosition(
  position: { x: number; y: number },
  nodes: VisualNode[]
): VisualNode | null {
  for (const node of nodes) {
    if (
      position.x >= node.position.x &&
      position.x <= node.position.x + node.size.width &&
      position.y >= node.position.y &&
      position.y <= node.position.y + node.size.height
    ) {
      return node;
    }
  }
  return null;
}

/**
 * Calculate connection points for a node
 */
export function getConnectionPoints(node: VisualNode): {
  input: { x: number; y: number };
  output: { x: number; y: number };
} {
  const centerX = node.position.x + node.size.width / 2;
  return {
    input: {
      x: centerX,
      y: node.position.y,
    },
    output: {
      x: centerX,
      y: node.position.y + node.size.height,
    },
  };
}

/**
 * Calculate distance between two points
 */
export function distance(
  p1: { x: number; y: number },
  p2: { x: number; y: number }
): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Find nearest connection point
 */
export function findNearestConnectionPoint(
  position: { x: number; y: number },
  nodes: VisualNode[]
): { node: VisualNode; point: { x: number; y: number }; type: 'input' | 'output' } | null {
  let nearest: {
    node: VisualNode;
    point: { x: number; y: number };
    type: 'input' | 'output';
    distance: number;
  } | null = null;

  for (const node of nodes) {
    const points = getConnectionPoints(node);
    const inputDist = distance(position, points.input);
    const outputDist = distance(position, points.output);

    if (!nearest || inputDist < nearest.distance) {
      nearest = {
        node,
        point: points.input,
        type: 'input',
        distance: inputDist,
      };
    }

    if (!nearest || outputDist < nearest.distance) {
      nearest = {
        node,
        point: points.output,
        type: 'output',
        distance: outputDist,
      };
    }
  }

  return nearest ? { node: nearest.node, point: nearest.point, type: nearest.type } : null;
}

