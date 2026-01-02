import React, { useState } from 'react';
import {
  FiMousePointer,
  FiSquare,
  FiCircle,
  FiType,
  FiEdit3,
  FiMinus,
  FiArrowRight,
  FiRotateCcw,
  FiRotateCw,
  FiTrash2,
  FiMenu,
  FiX,
} from 'react-icons/fi';
import { BsSticky } from 'react-icons/bs';
import { useDrawingStore } from '../../store/drawingStore';
import { useCanvasStore } from '../../store/canvasStore';

const Toolbar: React.FC = () => {
  const { currentTool, setTool, strokeWidth, setStrokeWidth, undo, redo, canUndo, canRedo, history, historyIndex } = useDrawingStore();
  const { setElements } = useCanvasStore();
  const [hoveredTool, setHoveredTool] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleUndo = () => {
    const newIndex = Math.max(historyIndex - 1, 0);
    if (newIndex !== historyIndex) {
      undo();
      setElements([...history[newIndex]]);
    }
  };

  const handleRedo = () => {
    const newIndex = Math.min(historyIndex + 1, history.length - 1);
    if (newIndex !== historyIndex) {
      redo();
      setElements([...history[newIndex]]);
    }
  };

  const tools = [
    { id: 'select', icon: FiMousePointer, label: 'Pointer', shortcut: 'V' },
    { id: 'pencil', icon: FiEdit3, label: 'Pen', shortcut: 'P' },
    { id: 'rectangle', icon: FiSquare, label: 'Rectangle', shortcut: 'R' },
    { id: 'circle', icon: FiCircle, label: 'Circle', shortcut: 'C' },
    { id: 'line', icon: FiMinus, label: 'Line', shortcut: 'L' },
    { id: 'arrow', icon: FiArrowRight, label: 'Arrow', shortcut: 'A' },
    { id: 'text', icon: FiType, label: 'Text', shortcut: 'T' },
    { id: 'sticky_note', icon: BsSticky, label: 'Sticky Note', shortcut: 'S' },
    { id: 'eraser', icon: FiTrash2, label: 'Eraser', shortcut: 'E' },
  ];

  const ToolButton = ({ tool, size = 18 }: { tool: typeof tools[0]; size?: number }) => {
    const Icon = tool.icon;
    const isActive = currentTool === tool.id;
    return (
      <button
        onClick={() => {
          setTool(tool.id as any);
          setIsMobileMenuOpen(false);
        }}
        onMouseEnter={() => setHoveredTool(tool.id)}
        onMouseLeave={() => setHoveredTool(null)}
        className={`
          w-10 h-10 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg transition-all duration-200
          outline-none focus:outline-none
          ${isActive
            ? 'bg-blue-500 text-white shadow-lg'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900'
          }
        `}
        title={`${tool.label} (${tool.shortcut})`}
      >
        <Icon size={size} strokeWidth={isActive ? 2.5 : 2} />
      </button>
    );
  };

  return (
    <>
      {/* Desktop/Tablet Sidebar - Hidden on mobile */}
      <div className="hidden sm:flex flex-col items-center gap-3 bg-white border-r border-gray-200 py-4 px-3 h-screen overflow-y-auto w-24">
        {/* Logo */}
        <div className="mb-3 pb-3 border-b border-gray-200 w-full flex justify-center">
          <div
            className="w-10 h-10 rounded flex items-center justify-center font-bold text-white text-lg"
            style={{ background: 'linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)' }}
          >
            W
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-2 gap-3 w-full">
          {tools.map((tool) => (
            <div key={tool.id} className="relative group">
              <ToolButton tool={tool} />
              {/* Tooltip */}
              {hoveredTool === tool.id && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-white text-gray-700 text-xs rounded whitespace-nowrap z-50 border border-gray-200 shadow-sm">
                  {tool.label}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="my-3 w-8 h-px bg-gray-200" />

        {/* Undo/Redo */}
        <div className="w-full flex flex-col gap-2">
          <button
            onClick={handleUndo}
            disabled={!canUndo}
            className={`w-full h-10 flex items-center justify-center rounded-lg transition-all duration-200 outline-none focus:outline-none
              ${canUndo ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-gray-50 text-gray-400 cursor-not-allowed'}
            `}
            title="Undo (Ctrl+Z)"
          >
            <FiRotateCcw size={18} />
          </button>
          <button
            onClick={handleRedo}
            disabled={!canRedo}
            className={`w-full h-10 flex items-center justify-center rounded-lg transition-all duration-200 outline-none focus:outline-none
              ${canRedo ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-gray-50 text-gray-400 cursor-not-allowed'}
            `}
            title="Redo (Ctrl+Shift+Z)"
          >
            <FiRotateCw size={18} />
          </button>
        </div>

        <div className="my-2 w-8 h-px bg-gray-200" />

        {/* Stroke Width */}
        <div className="w-full">
          <label className="text-xs text-gray-500 font-semibold mb-2 block">Width</label>
          <input
            type="range"
            min="1"
            max="20"
            value={strokeWidth}
            onChange={(e) => setStrokeWidth(Number(e.target.value))}
            className="w-full h-2 bg-gray-100 rounded-lg cursor-pointer"
          />
          <span className="text-xs text-gray-500 mt-1 block text-center">{strokeWidth}px</span>
        </div>
      </div>

      {/* Mobile Bottom Toolbar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50">
        {/* Expanded Tools Menu */}
        {isMobileMenuOpen && (
          <div className="bg-white border-t border-gray-200 p-4 shadow-lg">
            <div className="grid grid-cols-5 gap-3 mb-4">
              {tools.map((tool) => (
                <ToolButton key={tool.id} tool={tool} size={20} />
              ))}
            </div>

            {/* Stroke Width */}
            <div className="flex items-center gap-3 px-2">
              <span className="text-xs text-gray-500 whitespace-nowrap">Width: {strokeWidth}px</span>
              <input
                type="range"
                min="1"
                max="20"
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(Number(e.target.value))}
                className="flex-1 h-2 bg-gray-100 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Main Bottom Bar */}
        <div className="flex items-center justify-between bg-white border-t border-gray-200 px-4 py-3 shadow-lg">
          {/* Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-blue-500 text-white"
          >
            {isMobileMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>

          {/* Quick Tools */}
          <div className="flex items-center gap-2">
            {tools.slice(0, 4).map((tool) => (
              <ToolButton key={tool.id} tool={tool} size={18} />
            ))}
          </div>

          {/* Undo/Redo */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleUndo}
              disabled={!canUndo}
              className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all
                ${canUndo ? 'bg-gray-100 text-gray-700' : 'bg-gray-50 text-gray-300'}
              `}
            >
              <FiRotateCcw size={18} />
            </button>
            <button
              onClick={handleRedo}
              disabled={!canRedo}
              className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all
                ${canRedo ? 'bg-gray-100 text-gray-700' : 'bg-gray-50 text-gray-300'}
              `}
            >
              <FiRotateCw size={18} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Toolbar;
