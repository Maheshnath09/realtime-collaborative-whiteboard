import { create } from "zustand";
import { ElementType, Element } from "./canvasStore";

interface DrawingState {
  currentTool: ElementType | "select" | "eraser";
  color: string;
  strokeWidth: number;
  fill: boolean;
  opacity: number;
  history: Element[][];
  historyIndex: number;
  canUndo: boolean;
  canRedo: boolean;
  setTool: (tool: ElementType | "select" | "eraser") => void;
  setColor: (color: string) => void;
  setStrokeWidth: (width: number) => void;
  setFill: (fill: boolean) => void;
  setOpacity: (opacity: number) => void;
  pushHistory: (elements: Element[]) => void;
  undo: () => void;
  redo: () => void;
}

export const useDrawingStore = create<DrawingState>((set, get) => ({
  currentTool: "pencil",
  color: "#111827",
  strokeWidth: 2,
  fill: false,
  opacity: 1.0,
  history: [[]],
  historyIndex: 0,
  canUndo: false,
  canRedo: false,
  setTool: (tool) => set({ currentTool: tool }),
  setColor: (color) => set({ color }),
  setStrokeWidth: (width) => set({ strokeWidth: width }),
  setFill: (fill) => set({ fill }),
  setOpacity: (opacity) => set({ opacity }),
  pushHistory: (elements: Element[]) => {
    set((state) => {
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push([...elements]);
      const newIndex = newHistory.length - 1;
      return {
        history: newHistory,
        historyIndex: newIndex,
        canUndo: newIndex > 0,
        canRedo: false,
      };
    });
  },
  undo: () => {
    set((state) => {
      if (state.historyIndex <= 0) return state;
      const newIndex = state.historyIndex - 1;
      return {
        historyIndex: newIndex,
        canUndo: newIndex > 0,
        canRedo: true,
      };
    });
  },
  redo: () => {
    set((state) => {
      if (state.historyIndex >= state.history.length - 1) return state;
      const newIndex = state.historyIndex + 1;
      return {
        historyIndex: newIndex,
        canUndo: true,
        canRedo: newIndex < state.history.length - 1,
      };
    });
  },
}));
