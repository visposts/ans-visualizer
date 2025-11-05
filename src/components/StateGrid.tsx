import { Box, Paper, Typography, TextField } from "@mui/material";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import type { Symbol } from "../types";
import {
  generateStatePattern,
  calculateL,
  calculateEdgeChain,
  calculateForwardEdges,
} from "../utils/ansLogic";
import {
  clearCanvas,
  drawStateBox,
  drawEdge,
  getBoxAtPosition,
  type RenderConfig,
} from "../utils/canvasRenderer";

interface StateGridProps {
  symbols: Symbol[];
}

export default function StateGrid({ symbols }: StateGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [containerElement, setContainerElement] =
    useState<HTMLDivElement | null>(null);
  const [boxSize, setBoxSize] = useState(60);
  const [boxesPerRow, setBoxesPerRow] = useState(0);
  const [hoveredState, setHoveredState] = useState<number | null>(null);
  const [numLeadingAs, setNumLeadingAs] = useState(0);

  const L = useMemo(() => calculateL(symbols), [symbols]);
  const maxStates = 5000; // Show first 5000 states
  const states = useMemo(
    () => generateStatePattern(symbols, maxStates),
    [symbols, maxStates]
  );


  // Calculate edge chain on demand for hovered state
  const edgeChain = useMemo(() => {
    if (hoveredState === null) return [];
    console.log("Calculating edge chain for state:", hoveredState);
    return calculateEdgeChain(hoveredState, symbols, numLeadingAs);
  }, [hoveredState, symbols, numLeadingAs]);

  // Calculate forward edges on demand for hovered state
  const forwardEdges = useMemo(() => {
    if (hoveredState === null) return [];
    console.log("Calculating forward edges for state:", hoveredState);
    return calculateForwardEdges(hoveredState, symbols, maxStates);
  }, [hoveredState, symbols, maxStates]);

  // Calculate canvas dimensions
  const canvasWidth = useMemo(() => {
    if (!containerElement || boxesPerRow === 0) return 0;
    return containerElement.clientWidth;
  }, [containerElement, boxesPerRow]);

  const canvasHeight = useMemo(() => {
    if (boxesPerRow === 0) return 0;
    const numRows = Math.ceil(states.length / boxesPerRow);
    const boxHeight = Math.floor(boxSize * 0.6);
    return numRows * boxHeight;
  }, [states.length, boxesPerRow, boxSize]);

  // Update layout based on container size
  useEffect(() => {
    const updateLayout = () => {
      if (!containerElement) return;

      const containerWidth = containerElement.clientWidth;
      if (containerWidth === 0) return; // Container not ready yet

      const desiredBoxSize = 24;
      const gapSize = 6; // Space between groups

      // Calculate how many complete groups can fit
      // Each group has L boxes, and each group (except the last on a row) has a gap after it
      let numGroups = 1;
      while (true) {
        const totalWidth =
          numGroups * L * desiredBoxSize + (numGroups - 1) * gapSize;
        if (totalWidth > containerWidth) break;
        numGroups++;
      }
      numGroups = Math.max(1, numGroups - 1);

      const adjustedBoxesPerRow = numGroups * L;

      // Calculate actual box size to fill the width perfectly
      const totalGapWidth = (numGroups - 1) * gapSize;
      const availableWidthForBoxes = containerWidth - totalGapWidth;
      const actualBoxSize = Math.floor(
        availableWidthForBoxes / adjustedBoxesPerRow
      );

      setBoxesPerRow(adjustedBoxesPerRow);
      setBoxSize(actualBoxSize);
    };

    updateLayout();

    window.addEventListener("resize", updateLayout);
    return () => {
      window.removeEventListener("resize", updateLayout);
    };
  }, [L, containerElement]);

  // Render canvas whenever state changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || boxesPerRow === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas resolution
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvasWidth * dpr;
    canvas.height = canvasHeight * dpr;
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;
    ctx.scale(dpr, dpr);

    // Clear canvas
    clearCanvas(ctx, canvasWidth, canvasHeight);

    // Create render config
    const config: RenderConfig = {
      boxSize,
      boxesPerRow,
      L,
      canvasWidth,
      canvasHeight,
    };

    // Draw all state boxes
    states.forEach((state) => {
      const isHovered = state.index === hoveredState;
      drawStateBox(ctx, state, config, isHovered);
    });

    // Draw backward edges (incoming) - black with arrow pointing to hovered state
    if (edgeChain.length > 1) {
      edgeChain.slice(0, -1).forEach((fromState, idx) => {
        const toState = edgeChain[idx + 1];
        // Draw from toState to fromState so arrow points to hovered
        drawEdge(ctx, toState, fromState, config, "rgba(0, 0, 0, 0.85)", 3);
      });
    }

    // Draw forward edges (outgoing) - blue with arrow pointing away from hovered state
    if (forwardEdges.length > 0 && hoveredState !== null) {
      forwardEdges.forEach((edge) => {
        drawEdge(
          ctx,
          hoveredState,
          edge.toState,
          config,
          "rgba(33, 150, 243, 0.85)",
          3
        );
      });
    }
  }, [
    states,
    boxSize,
    boxesPerRow,
    L,
    canvasWidth,
    canvasHeight,
    hoveredState,
    edgeChain,
    forwardEdges,
  ]);

  // Handle mouse move on canvas
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas || boxesPerRow === 0) return;

      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const config: RenderConfig = {
        boxSize,
        boxesPerRow,
        L,
        canvasWidth,
        canvasHeight,
      };

      const boxIndex = getBoxAtPosition(
        mouseX,
        mouseY,
        states.length,
        config
      );
      setHoveredState(boxIndex);
    },
    [boxSize, boxesPerRow, L, canvasWidth, canvasHeight, states.length]
  );

  // Handle mouse leave
  const handleMouseLeave = useCallback(() => {
    setHoveredState(null);
  }, []);

  if (symbols.length === 0) {
    return (
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography color="text.secondary">
          Add at least one symbol to see the state visualization.
        </Typography>
      </Paper>
    );
  }

  if (boxesPerRow === 0) {
    return (
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          State Visualization
        </Typography>
        <Box
          ref={(elmt: HTMLDivElement | null) => setContainerElement(elmt)}
          sx={{
            border: "1px solid",
            borderColor: "divider",
            backgroundColor: "grey.50",
            minHeight: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography color="text.secondary" sx={{ p: 2 }}>
            Loading state visualization...
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
        State Visualization
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        Each box represents a state (integer).
      </Typography>

      <Box sx={{ mb: 1.5 }}>
        <TextField
          label="Number of Leading A's"
          type="number"
          value={numLeadingAs}
          onChange={(e) => {
            const value = parseInt(e.target.value, 10);
            if (!isNaN(value) && value >= 0) {
              setNumLeadingAs(value);
            }
          }}
          size="small"
          inputProps={{ min: 0, step: 1 }}
          sx={{ width: 200 }}
        />
      </Box>

      <Box sx={{ mb: 1.5, p: 1.5, backgroundColor: "grey.100", borderRadius: 1, height: 45, overflow: "hidden" }}>
        {hoveredState !== null ? (
          <Typography variant="body2">
            <Box component="span">
              <span style={{ fontWeight: "bold" }}>State:</span> {hoveredState}
            </Box>{" | "}
            <Box
              component="span"
              sx={{ fontWeight: "medium", fontFamily: "monospace" }}
            >
              <span style={{ fontWeight: "bold" }}>Encoded sequence:</span> {edgeChain
                .slice()
                .reverse()
                .map((stateIdx) => states[stateIdx]?.symbol.name || "?")
                .join(" → ")}
            </Box>
          </Typography>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
            Hover over a state to see its details
          </Typography>
        )}
      </Box>

      <Box
        ref={(elmt: HTMLDivElement | null) => setContainerElement(elmt)}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          backgroundColor: "grey.50",
          position: "relative",
        }}
      >
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            display: "block",
            cursor: "pointer",
          }}
        />
      </Box>
    </Paper>
  );
}
