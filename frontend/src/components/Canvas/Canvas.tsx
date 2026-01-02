import React, { useRef, useEffect, useState, useCallback } from "react";
import { useWebSocket } from "../../hooks/useWebSocket";
import { useCanvasStore, Element, Point } from "../../store/canvasStore";
import { useUserStore } from "../../store/userStore";
import { useAuthStore } from "../../store/authStore";
import { useDrawingStore } from "../../store/drawingStore";
import Cursor from "./Cursor";
import TextElement from "./TextElement";

interface CanvasProps {
  boardId: string;
  zoom: number;
}

type ElementType = "pencil" | "rectangle" | "circle" | "text" | "sticky_note" | "line" | "arrow";

const Canvas: React.FC<CanvasProps> = ({ boardId, zoom }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { token, userId: authUserId } = useAuthStore();
  const userId = authUserId || `user_${Date.now()}`;
  const { sendMessage } = useWebSocket(boardId, token);
  const { elements, addElement, updateElement, setElements, deleteElement } = useCanvasStore();
  const { users } = useUserStore();
  const { currentTool, color, strokeWidth, fill, opacity, pushHistory, history, historyIndex, undo, redo } = useDrawingStore();

  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const [currentElementId, setCurrentElementId] = useState<string | null>(null);
  const [startPos, setStartPos] = useState<Point | null>(null);
  const [textElements, setTextElements] = useState<Element[]>([]);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);

  // Selection and element dragging state
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [isMovingElement, setIsMovingElement] = useState(false);
  const [elementDragStart, setElementDragStart] = useState<{ x: number; y: number; elX: number; elY: number } | null>(null);

  const GRID_SIZE = 20;
  const CANVAS_WIDTH = 8000;
  const CANVAS_HEIGHT = 8000;

  const getRelativePos = useCallback((e: React.MouseEvent<HTMLCanvasElement> | MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();

    // Account for any CSS scaling of the canvas
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    // Get mouse position relative to canvas
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    // Apply inverse of pan and zoom transforms
    const zoomScale = zoom / 100;
    const x = (mouseX - panX) / zoomScale;
    const y = (mouseY - panY) / zoomScale;

    return { x: Math.max(0, x), y: Math.max(0, y) };
  }, [panX, panY, zoom]);

  // Helper to find element at a given position
  const findElementAtPosition = useCallback((x: number, y: number): Element | null => {
    // Check elements in reverse order (top elements first)
    const sortedElements = [...elements].sort((a, b) => b.zIndex - a.zIndex);

    for (const el of sortedElements) {
      const padding = 10; // Click tolerance

      if (el.type === "pencil" && el.points && el.points.length > 0) {
        // Check if click is near any point on the path
        for (const point of el.points) {
          const dist = Math.sqrt((point.x - x) ** 2 + (point.y - y) ** 2);
          if (dist <= padding + el.strokeWidth) return el;
        }
      } else if (el.type === "rectangle" || el.type === "sticky_note") {
        const w = el.width || 0;
        const h = el.height || 0;
        if (x >= el.x - padding && x <= el.x + w + padding &&
          y >= el.y - padding && y <= el.y + h + padding) {
          return el;
        }
      } else if (el.type === "circle") {
        const centerX = el.x + (el.width || 0) / 2;
        const centerY = el.y + (el.height || 0) / 2;
        const radius = Math.sqrt((el.width || 0) ** 2 + (el.height || 0) ** 2) / 2;
        const dist = Math.sqrt((centerX - x) ** 2 + (centerY - y) ** 2);
        if (dist <= radius + padding) return el;
      } else if (el.type === "line" || el.type === "arrow") {
        // Check distance from line segment
        const x1 = el.x, y1 = el.y;
        const x2 = el.x + (el.width || 0), y2 = el.y + (el.height || 0);
        const lineLen = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        if (lineLen === 0) continue;
        const t = Math.max(0, Math.min(1, ((x - x1) * (x2 - x1) + (y - y1) * (y2 - y1)) / (lineLen * lineLen)));
        const projX = x1 + t * (x2 - x1);
        const projY = y1 + t * (y2 - y1);
        const dist = Math.sqrt((projX - x) ** 2 + (projY - y) ** 2);
        if (dist <= padding + el.strokeWidth) return el;
      } else if (el.type === "text") {
        const textWidth = (el.text?.length || 5) * (el.strokeWidth || 16) * 0.6;
        const textHeight = (el.strokeWidth || 16) * 1.2;
        if (x >= el.x - padding && x <= el.x + textWidth + padding &&
          y >= el.y - padding && y <= el.y + textHeight + padding) {
          return el;
        }
      }
    }
    return null;
  }, [elements]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getRelativePos(e);

    sendMessage({
      type: "cursor_move",
      x,
      y,
    });

    // Handle panning
    if (isDragging && dragStart) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      setPanX((prev) => prev + deltaX);
      setPanY((prev) => prev + deltaY);
      setDragStart({ x: e.clientX, y: e.clientY });
      return;
    }

    // Handle element moving (select tool)
    if (isMovingElement && selectedElementId && elementDragStart) {
      const deltaX = x - elementDragStart.x;
      const deltaY = y - elementDragStart.y;
      const el = elements.find(e => e.id === selectedElementId);
      if (el) {
        const newX = elementDragStart.elX + deltaX;
        const newY = elementDragStart.elY + deltaY;
        const updatedElement: Element = {
          ...el,
          x: newX,
          y: newY,
          // For pencil, also update all points
          ...(el.type === "pencil" && el.points ? {
            points: el.points.map(p => ({
              x: p.x + (newX - el.x),
              y: p.y + (newY - el.y)
            }))
          } : {})
        };
        updateElement(updatedElement);
        sendMessage({
          type: "update_element",
          element: updatedElement,
        });
      }
      return;
    }

    if (!isDrawing || !userId) return;

    if (currentTool === "pencil") {
      const newPath = [...currentPath, { x, y }];
      setCurrentPath(newPath);

      if (currentElementId) {
        const updatedElement: Element = {
          id: currentElementId,
          type: "pencil",
          points: newPath,
          x: newPath[0]?.x || 0,
          y: newPath[0]?.y || 0,
          color,
          strokeWidth,
          opacity,
          userId,
          zIndex: elements.length,
        };
        updateElement(updatedElement);
        sendMessage({
          type: "update_element",
          element: updatedElement,
        });
      }
    } else if (["rectangle", "circle"].includes(currentTool)) {
      // Rectangles and circles use absolute dimensions with adjusted start position
      if (startPos && currentElementId) {
        const width = x - startPos.x;
        const height = y - startPos.y;
        const updatedElement: Element = {
          id: currentElementId,
          type: currentTool as ElementType,
          x: width < 0 ? x : startPos.x,
          y: height < 0 ? y : startPos.y,
          width: Math.abs(width),
          height: Math.abs(height),
          color,
          strokeWidth,
          fill,
          opacity,
          userId,
          zIndex: elements.length,
        };
        updateElement(updatedElement);
        sendMessage({
          type: "update_element",
          element: updatedElement,
        });
      }
    } else if (["line", "arrow"].includes(currentTool)) {
      // Lines and arrows can go in any direction - keep signed width/height
      if (startPos && currentElementId) {
        const width = x - startPos.x;
        const height = y - startPos.y;
        const updatedElement: Element = {
          id: currentElementId,
          type: currentTool as ElementType,
          x: startPos.x,
          y: startPos.y,
          width,  // Keep signed for direction
          height, // Keep signed for direction
          color,
          strokeWidth,
          fill,
          opacity,
          userId,
          zIndex: elements.length,
        };
        updateElement(updatedElement);
        sendMessage({
          type: "update_element",
          element: updatedElement,
        });
      }
    }
  }, [isDrawing, currentTool, currentPath, currentElementId, startPos, color, strokeWidth, fill, opacity, userId, elements, getRelativePos, sendMessage, updateElement, isDragging, dragStart, isMovingElement, selectedElementId, elementDragStart]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    // Middle mouse button or Ctrl+Left for panning
    if (e.button === 1 || (e.button === 0 && e.ctrlKey)) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      return;
    }

    if (!userId) return;

    const { x, y } = getRelativePos(e);

    // Eraser tool - erase elements on click
    if (currentTool === "eraser") {
      const clickRadius = 20;
      // find elements within radius and delete them
      const removed = elements.filter((el) => {
        const dist = Math.sqrt((el.x - x) ** 2 + (el.y - y) ** 2);
        return dist <= clickRadius;
      });
      if (removed.length > 0) {
        removed.forEach((r) => {
          deleteElement(r.id);
          sendMessage({ type: 'delete_element', elementId: r.id });
        });
        // Push history after deletions
        setTimeout(() => pushHistory(elements), 0);
      }
      return;
    }
    // Select tool - select and move elements
    if (currentTool === "select") {
      const clickedElement = findElementAtPosition(x, y);
      if (clickedElement) {
        setSelectedElementId(clickedElement.id);
        setIsMovingElement(true);
        setElementDragStart({ x, y, elX: clickedElement.x, elY: clickedElement.y });
      } else {
        setSelectedElementId(null);
      }
      return;
    }

    // Text tool
    if (currentTool === "text") {
      e.preventDefault();
      e.stopPropagation();
      const elementId = `${userId}_${Date.now()}`;
      const newElement: Element = {
        id: elementId,
        type: "text",
        x,
        y,
        text: "",
        color,
        strokeWidth: 16,
        opacity,
        userId,
        zIndex: elements.length,
      };
      addElement(newElement);
      setTextElements((prev) => [...prev, newElement]);
      sendMessage({
        type: "add_element",
        element: newElement,
      });
      setTimeout(() => pushHistory([...elements, newElement]), 0);
      return;
    }

    // Sticky note
    if (currentTool === "sticky_note") {
      const elementId = `${userId}_${Date.now()}`;
      const newElement: Element = {
        id: elementId,
        type: "sticky_note",
        x,
        y,
        width: 200,
        height: 200,
        text: "",
        color: "#FEF3C7",
        strokeWidth: 1,
        opacity,
        userId,
        zIndex: elements.length,
      };
      addElement(newElement);
      setTextElements([...textElements, newElement]);
      sendMessage({
        type: "add_element",
        element: newElement,
      });
      setTimeout(() => pushHistory([...elements, newElement]), 0);
      return;
    }

    setIsDrawing(true);
    setStartPos({ x, y });

    const elementId = `${userId}_${Date.now()}`;
    setCurrentElementId(elementId);

    if (currentTool === "pencil") {
      const newPath = [{ x, y }];
      setCurrentPath(newPath);
      const newElement: Element = {
        id: elementId,
        type: "pencil",
        points: newPath,
        x,
        y,
        color,
        strokeWidth,
        opacity,
        userId,
        zIndex: elements.length,
      };
      addElement(newElement);
      sendMessage({
        type: "add_element",
        element: newElement,
      });
      setTimeout(() => pushHistory([...elements, newElement]), 0);
    } else if (["rectangle", "circle", "line", "arrow"].includes(currentTool)) {
      const newElement: Element = {
        id: elementId,
        type: currentTool as ElementType,
        x,
        y,
        width: 0,
        height: 0,
        color,
        strokeWidth,
        fill,
        opacity,
        userId,
        zIndex: elements.length,
      };
      addElement(newElement);
      sendMessage({
        type: "add_element",
        element: newElement,
      });
      setTimeout(() => pushHistory([...elements, newElement]), 0);
    }
  }, [currentTool, userId, color, strokeWidth, fill, opacity, elements, textElements, getRelativePos, addElement, sendMessage, findElementAtPosition, pushHistory]);

  const handleMouseUp = useCallback(() => {
    // If we were moving an element, push to history
    if (isMovingElement && selectedElementId) {
      setTimeout(() => pushHistory(elements), 0);
    }

    setIsDrawing(false);
    setIsDragging(false);
    setIsMovingElement(false);
    setElementDragStart(null);
    setCurrentPath([]);
    setCurrentElementId(null);
    setStartPos(null);
    setDragStart(null);
  }, [isMovingElement, selectedElementId, elements, pushHistory]);

  const handleTextUpdate = useCallback((id: string, text: string) => {
    const element = elements.find(el => el.id === id);
    if (element) {
      const updatedElement = { ...element, text };
      updateElement(updatedElement);
      sendMessage({
        type: "update_element",
        element: updatedElement,
      });
      // Push history after text update
      const newElements = elements.map(el => el.id === id ? updatedElement : el);
      setTimeout(() => pushHistory(newElements), 0);
    }
  }, [elements, updateElement, sendMessage, pushHistory]);

  const handleTextComplete = useCallback((id: string) => {
    setTextElements(textElements.filter(el => el.id !== id));
  }, [textElements]);

  // Track element changes in history
  useEffect(() => {
    pushHistory(elements);
  }, [elements.length]); // Track when elements array length changes

  // Handle keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          const newIndex = Math.min(historyIndex + 1, history.length - 1);
          if (newIndex !== historyIndex) {
            redo();
            setElements([...history[newIndex]]);
          }
        } else {
          const newIndex = Math.max(historyIndex - 1, 0);
          if (newIndex !== historyIndex) {
            undo();
            setElements([...history[newIndex]]);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [history, historyIndex, undo, redo, setElements]);

  // Handle canvas resize
  const [canvasSize, setCanvasSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => {
      setCanvasSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Render canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas (light)
    ctx.fillStyle = "#F7F8F9";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Save context
    ctx.save();

    // Apply transforms
    ctx.translate(panX, panY);
    ctx.scale(zoom / 100, zoom / 100);

    // Draw grid (light subtle lines)
    ctx.strokeStyle = "#ECEFF1";
    ctx.lineWidth = 1;
    for (let x = 0; x < CANVAS_WIDTH; x += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y < CANVAS_HEIGHT; y += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
    }

    // Draw elements
    const sortedElements = [...elements].sort((a, b) => a.zIndex - b.zIndex);

    sortedElements.forEach((el) => {
      ctx.save();
      ctx.globalAlpha = el.opacity;
      ctx.strokeStyle = el.color;
      ctx.lineWidth = el.strokeWidth;
      ctx.fillStyle = el.color;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (el.type === "pencil" && el.points && el.points.length >= 1) {
        ctx.beginPath();
        if (el.points.length === 1) {
          // Single point - draw a dot
          ctx.arc(el.points[0].x, el.points[0].y, el.strokeWidth / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Multiple points - draw a smooth line
          ctx.moveTo(el.points[0].x, el.points[0].y);
          for (let i = 1; i < el.points.length; i++) {
            const cp = el.points[i - 1];
            const p = el.points[i];
            // Use quadratic curve for smoother lines
            const midX = (cp.x + p.x) / 2;
            const midY = (cp.y + p.y) / 2;
            ctx.quadraticCurveTo(cp.x, cp.y, midX, midY);
          }
          // Draw the last segment
          const lastPoint = el.points[el.points.length - 1];
          ctx.lineTo(lastPoint.x, lastPoint.y);
          ctx.stroke();
        }
      } else if (el.type === "rectangle") {
        if (el.fill) {
          ctx.fillRect(el.x, el.y, el.width || 0, el.height || 0);
        } else {
          ctx.strokeRect(el.x, el.y, el.width || 0, el.height || 0);
        }
      } else if (el.type === "circle") {
        const radius = Math.sqrt((el.width || 0) ** 2 + (el.height || 0) ** 2) / 2;
        ctx.beginPath();
        ctx.arc(el.x + (el.width || 0) / 2, el.y + (el.height || 0) / 2, radius, 0, Math.PI * 2);
        if (el.fill) {
          ctx.fill();
        } else {
          ctx.stroke();
        }
      } else if (el.type === "line") {
        ctx.beginPath();
        ctx.moveTo(el.x, el.y);
        ctx.lineTo(el.x + (el.width || 0), el.y + (el.height || 0));
        ctx.stroke();
      } else if (el.type === "arrow") {
        const endX = el.x + (el.width || 0);
        const endY = el.y + (el.height || 0);

        ctx.beginPath();
        ctx.moveTo(el.x, el.y);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Arrowhead
        const angle = Math.atan2(endY - el.y, endX - el.x);
        const arrowSize = 15;
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(
          endX - arrowSize * Math.cos(angle - Math.PI / 6),
          endY - arrowSize * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(endX, endY);
        ctx.lineTo(
          endX - arrowSize * Math.cos(angle + Math.PI / 6),
          endY - arrowSize * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();
      } else if (el.type === "text" && el.text) {
        ctx.font = `${el.strokeWidth || 16}px 'Inter', sans-serif`;
        ctx.fillStyle = el.color;
        ctx.fillText(el.text, el.x, el.y + (el.strokeWidth || 16));
      } else if (el.type === "sticky_note") {
        ctx.fillStyle = el.color || "#FEF3C7";
        ctx.fillRect(el.x, el.y, el.width || 200, el.height || 200);

        ctx.strokeStyle = "#D97706";
        ctx.lineWidth = 2;
        ctx.strokeRect(el.x, el.y, el.width || 200, el.height || 200);

        if (el.text) {
          ctx.fillStyle = "#000";
          ctx.font = "14px 'Inter', sans-serif";
          const padding = 10;
          const lines = el.text.split('\n');
          lines.forEach((line, i) => {
            ctx.fillText(line, el.x + padding, el.y + 25 + i * 20, (el.width || 200) - padding * 2);
          });
        }
      }
      ctx.restore();
    });

    // Draw selection highlight
    if (selectedElementId) {
      const selectedEl = elements.find(el => el.id === selectedElementId);
      if (selectedEl) {
        ctx.save();
        ctx.strokeStyle = '#2563EB';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);

        const padding = 8;
        let bounds = { x: 0, y: 0, w: 0, h: 0 };

        if (selectedEl.type === "pencil" && selectedEl.points && selectedEl.points.length > 0) {
          const xs = selectedEl.points.map(p => p.x);
          const ys = selectedEl.points.map(p => p.y);
          bounds = {
            x: Math.min(...xs) - padding,
            y: Math.min(...ys) - padding,
            w: Math.max(...xs) - Math.min(...xs) + padding * 2,
            h: Math.max(...ys) - Math.min(...ys) + padding * 2
          };
        } else if (selectedEl.type === "circle") {
          const radius = Math.sqrt((selectedEl.width || 0) ** 2 + (selectedEl.height || 0) ** 2) / 2;
          const centerX = selectedEl.x + (selectedEl.width || 0) / 2;
          const centerY = selectedEl.y + (selectedEl.height || 0) / 2;
          bounds = {
            x: centerX - radius - padding,
            y: centerY - radius - padding,
            w: radius * 2 + padding * 2,
            h: radius * 2 + padding * 2
          };
        } else if (selectedEl.type === "line" || selectedEl.type === "arrow") {
          const x1 = selectedEl.x, y1 = selectedEl.y;
          const x2 = selectedEl.x + (selectedEl.width || 0);
          const y2 = selectedEl.y + (selectedEl.height || 0);
          bounds = {
            x: Math.min(x1, x2) - padding,
            y: Math.min(y1, y2) - padding,
            w: Math.abs(selectedEl.width || 0) + padding * 2,
            h: Math.abs(selectedEl.height || 0) + padding * 2
          };
        } else {
          bounds = {
            x: selectedEl.x - padding,
            y: selectedEl.y - padding,
            w: (selectedEl.width || 100) + padding * 2,
            h: (selectedEl.height || 30) + padding * 2
          };
        }

        ctx.strokeRect(bounds.x, bounds.y, bounds.w, bounds.h);

        // Draw corner handles
        const handleSize = 8;
        ctx.fillStyle = '#2563EB';
        ctx.setLineDash([]);
        ctx.fillRect(bounds.x - handleSize / 2, bounds.y - handleSize / 2, handleSize, handleSize);
        ctx.fillRect(bounds.x + bounds.w - handleSize / 2, bounds.y - handleSize / 2, handleSize, handleSize);
        ctx.fillRect(bounds.x - handleSize / 2, bounds.y + bounds.h - handleSize / 2, handleSize, handleSize);
        ctx.fillRect(bounds.x + bounds.w - handleSize / 2, bounds.y + bounds.h - handleSize / 2, handleSize, handleSize);

        ctx.restore();
      }
    }

    ctx.restore();
  }, [elements, panX, panY, zoom, canvasSize, selectedElementId]);

  const getCursorStyle = () => {
    if (isDragging) return "grabbing";
    if (isMovingElement) return "move";
    if (currentTool === "pencil") return "url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2224%22 height=%2224%22 viewBox=%220 0 24 24%22><circle cx=%2212%22 cy=%2212%22 r=%224%22 fill=%22%232563EB%22 stroke=%22white%22 stroke-width=%222%22/></svg>') 12 12, crosshair";
    if (currentTool === "select") return selectedElementId ? "move" : "default";
    if (currentTool === "text") return "text";
    if (currentTool === "eraser") return "url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2224%22 height=%2224%22 viewBox=%220 0 24 24%22><circle cx=%2212%22 cy=%2212%22 r=%228%22 fill=%22%23FF6B6B%22 stroke=%22white%22 stroke-width=%222%22 opacity=%220.7%22/></svg>') 12 12, crosshair";
    return "crosshair";
  };

  const colors = ['#000000', '#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#6C5CE7', '#A29BFE', '#FFFFFF'];
  const { setColor } = useDrawingStore();

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden grid-background">
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        className="h-full w-full"
        style={{ cursor: getCursorStyle() }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />

      {/* Text Elements Container - positioned absolutely for zoom/pan */}
      <div className="absolute inset-0" style={{ pointerEvents: 'none' }}>
        {textElements.map((el) => (
          <div key={el.id} style={{ pointerEvents: 'auto' }}>
            <TextElement
              id={el.id}
              x={el.x}
              y={el.y}
              text={el.text || ""}
              color={el.color}
              fontSize={el.strokeWidth || 16}
              onUpdate={handleTextUpdate}
              onComplete={() => handleTextComplete(el.id)}
              zoom={zoom}
              panX={panX}
              panY={panY}
              containerRef={containerRef}
            />
          </div>
        ))}
      </div>

      {Object.values(users).map((user) => (
        <Cursor key={user.id} user={user} zoom={zoom} panX={panX} panY={panY} />
      ))}

      {/* Color Palette - Top Left */}
      <div className="absolute top-6 left-6 flex flex-col gap-2 z-20 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
        <div className="grid grid-cols-4 gap-2">
          {colors.map((col) => (
            <button
              key={col}
              onClick={() => setColor(col)}
              className={`
                w-6 h-6 rounded transition-all duration-200 border-2
                ${color === col ? 'border-gray-800 scale-110 shadow-md' : 'border-gray-300 hover:border-gray-400'}
              `}
              style={{ backgroundColor: col }}
              title={col}
            />
          ))}
        </div>
        {/* Custom color input */}
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-full h-7 rounded cursor-pointer border border-gray-200"
          title="Custom color"
        />
      </div>
    </div>
  );
};

export default Canvas;
