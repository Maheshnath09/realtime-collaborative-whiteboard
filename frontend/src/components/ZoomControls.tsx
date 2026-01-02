import React from 'react';
import { FiZoomIn, FiZoomOut, FiMaximize2 } from 'react-icons/fi';

interface ZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitToScreen: () => void;
}

const ZoomControls: React.FC<ZoomControlsProps> = ({
  zoom,
  onZoomIn,
  onZoomOut,
  onFitToScreen,
}) => {
  return (
    <div className="fixed bottom-6 right-6 flex items-center gap-2 bg-white border border-gray-200 rounded-lg shadow-md p-1 z-50">
      <button
        onClick={onFitToScreen}
        className="btn-icon btn-ghost"
        title="Fit to screen"
      >
        <FiMaximize2 size={16} />
      </button>

      <div className="h-6 w-px bg-gray-200" />

      <button
        onClick={onZoomOut}
        className="btn-icon btn-ghost"
        title="Zoom out"
        disabled={zoom <= 10}
      >
        <FiZoomOut size={16} />
      </button>

      <span className="text-sm font-medium text-gray-700 min-w-[50px] text-center">
        {Math.round(zoom)}%
      </span>

      <button
        onClick={onZoomIn}
        className="btn-icon btn-ghost"
        title="Zoom in"
        disabled={zoom >= 400}
      >
        <FiZoomIn size={16} />
      </button>
    </div>
  );
};

export default ZoomControls;
