import { create } from "zustand";

export type ElementType =
  | "pencil"
  | "rectangle"
  | "circle"
  | "text"
  | "sticky_note"
  | "line"
  | "arrow";

export interface Point {
  x: number;
  y: number;
}

export interface Element {
  id: string;
  type: ElementType;
  points?: Point[];
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  text?: string;
  color: string;
  strokeWidth: number;
  fill?: boolean;
  opacity: number;
  userId: string;
  locked?: boolean;
  zIndex: number;
}

interface CanvasState {
  elements: Element[];
  setElements: (elements: Element[]) => void;
  addElement: (el: Element) => void;
  updateElement: (el: Element) => void;
  deleteElement: (id: string) => void;
}

export const useCanvasStore = create<CanvasState>((set) => ({
  elements: [],
  setElements: (elements) => set({ elements }),
  addElement: (el) =>
    set((state) => ({
      elements: [...state.elements, el],
    })),
  updateElement: (el) =>
    set((state) => ({
      elements: state.elements.map((e) => (e.id === el.id ? el : e)),
    })),
  deleteElement: (id) =>
    set((state) => ({
      elements: state.elements.filter((e) => e.id !== id),
    })),
}));

