import type { StateInfo } from "../types";

export interface BoxPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RenderConfig {
  boxSize: number;
  boxesPerRow: number;
  L: number;
  canvasWidth: number;
  canvasHeight: number;
}

/**
 * Calculate the position and dimensions of a state box
 */
export function getBoxBounds(
  stateIndex: number,
  config: RenderConfig
): BoxPosition {
  const { boxSize, boxesPerRow, L } = config;
  const row = Math.floor(stateIndex / boxesPerRow);
  const col = stateIndex % boxesPerRow;
  const boxHeight = Math.floor(boxSize * 0.6);

  // Calculate group-aware positioning
  const groupSize = L;
  const groupIndex = Math.floor(col / groupSize);
  const gapSize = 6;

  const x = col * boxSize + groupIndex * gapSize;
  const y = row * boxHeight;

  return { x, y, width: boxSize, height: boxHeight };
}

/**
 * Get the center point of a box for edge drawing
 */
export function getBoxCenter(
  stateIndex: number,
  config: RenderConfig
): { x: number; y: number } {
  const bounds = getBoxBounds(stateIndex, config);
  return {
    x: bounds.x + bounds.width / 2,
    y: bounds.y + bounds.height / 2,
  };
}

/**
 * Find which box (if any) is at the given mouse coordinates
 */
export function getBoxAtPosition(
  mouseX: number,
  mouseY: number,
  numStates: number,
  config: RenderConfig
): number | null {
  for (let i = 0; i < numStates; i++) {
    const bounds = getBoxBounds(i, config);
    if (
      mouseX >= bounds.x &&
      mouseX <= bounds.x + bounds.width &&
      mouseY >= bounds.y &&
      mouseY <= bounds.y + bounds.height
    ) {
      return i;
    }
  }
  return null;
}

/**
 * Draw a single state box on the canvas
 */
export function drawStateBox(
  ctx: CanvasRenderingContext2D,
  state: StateInfo,
  config: RenderConfig,
  isHovered: boolean = false
): void {
  const bounds = getBoxBounds(state.index, config);
  const { x, y, width, height } = bounds;

  // Draw box background
  ctx.fillStyle = state.symbol.color;
  ctx.fillRect(x, y, width, height);

  // Draw border
  ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, width, height);

  // Draw hover effect
  if (isHovered) {
    ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 1, y - 1, width + 2, height + 2);
  }

  // Draw text
  ctx.fillStyle = "white";
  ctx.font = `bold ${config.boxSize > 20 ? 12 : 10}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
  ctx.shadowBlur = 2;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 1;
  ctx.fillText(state.symbol.name, x + width / 2, y + height / 2);
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
}

/**
 * Draw an arrow head at the end of a line
 */
function drawArrowHead(
  ctx: CanvasRenderingContext2D,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  color: string
): void {
  const headLength = 10;
  const angle = Math.atan2(toY - fromY, toX - fromX);

  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(
    toX - headLength * Math.cos(angle - Math.PI / 6),
    toY - headLength * Math.sin(angle - Math.PI / 6)
  );
  ctx.lineTo(
    toX - headLength * Math.cos(angle + Math.PI / 6),
    toY - headLength * Math.sin(angle + Math.PI / 6)
  );
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/**
 * Draw an edge (line with arrow) between two states
 */
export function drawEdge(
  ctx: CanvasRenderingContext2D,
  fromState: number,
  toState: number,
  config: RenderConfig,
  color: string,
  strokeWidth: number = 3
): void {
  const fromPos = getBoxCenter(fromState, config);
  const toPos = getBoxCenter(toState, config);

  // Draw line
  ctx.strokeStyle = color;
  ctx.lineWidth = strokeWidth;
  ctx.beginPath();
  ctx.moveTo(fromPos.x, fromPos.y);
  ctx.lineTo(toPos.x, toPos.y);
  ctx.stroke();

  // Draw arrow head
  drawArrowHead(ctx, fromPos.x, fromPos.y, toPos.x, toPos.y, color);
}

/**
 * Clear the entire canvas
 */
export function clearCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  ctx.clearRect(0, 0, width, height);
}

/**
 * Calculate the total height needed for the canvas
 */
export function calculateCanvasHeight(
  numStates: number,
  config: RenderConfig
): number {
  if (config.boxesPerRow === 0) return 0;
  const numRows = Math.ceil(numStates / config.boxesPerRow);
  const boxHeight = Math.floor(config.boxSize * 0.6);
  return numRows * boxHeight;
}
