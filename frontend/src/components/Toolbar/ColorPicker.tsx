import React from 'react';
import { useDrawingStore } from '../../store/drawingStore';

const ColorPicker: React.FC = () => {
  const { color, setColor, strokeWidth, setStrokeWidth } = useDrawingStore();

  const colors = [
    '#111827', '#EF4444', '#F59E0B', '#10B981',
    '#4262FF', '#8B5CF6', '#EC4899', '#6366F1',
    '#14B8A6', '#F97316', '#84CC16', '#06B6D4',
  ];

  return (
    <div className="bg-white border-t border-gray-200 p-3 mt-auto" style={{ width: '56px' }}>
      {/* Color Swatches */}
      <div className="mb-3">
        <div className="flex flex-col gap-1.5">
          {colors.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`
                w-10 h-10 rounded-lg transition-all duration-200
                ${color === c
                  ? 'ring-2 ring-offset-2 ring-blue-500 scale-105'
                  : 'hover:scale-105'
                }
              `}
              style={{ backgroundColor: c }}
              title={c}
            />
          ))}
        </div>
      </div>

      {/* Stroke Width */}
      <div className="pt-3 border-t border-gray-200">
        <div className="flex flex-col items-center gap-2">
          <div className="text-xs font-medium text-gray-600">
            {strokeWidth}px
          </div>
          <input
            type="range"
            min="1"
            max="20"
            value={strokeWidth}
            onChange={(e) => setStrokeWidth(Number(e.target.value))}
            className="w-full"
            style={{
              writingMode: 'bt-lr',
              WebkitAppearance: 'slider-vertical',
              height: '80px'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ColorPicker;
