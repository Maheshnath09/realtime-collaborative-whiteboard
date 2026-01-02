import React from "react";
import { RemoteUser } from "../../store/userStore";

interface Props {
  user: RemoteUser;
  zoom?: number;
  panX?: number;
  panY?: number;
}

const Cursor: React.FC<Props> = ({ user, zoom = 100, panX = 0, panY = 0 }) => {
  const calculatedX = user.x * (zoom / 100) + panX;
  const calculatedY = user.y * (zoom / 100) + panY;

  return (
    <div
      className="pointer-events-none fixed flex flex-col items-start z-50"
      style={{ transform: `translate(${calculatedX}px, ${calculatedY}px)` }}
    >
      {/* Cursor pointer */}
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        style={{ filter: `drop-shadow(0 2px 4px rgba(0,0,0,0.3))` }}
      >
        <path
          d="M0 0 L0 16 L4 13 L8 20 L10 19 L6 12 L14 12 Z"
          fill={user.color}
          stroke="white"
          strokeWidth="0.5"
        />
      </svg>
      
      {/* User label */}
      <span className="mt-1 rounded-full bg-gray-900 px-2.5 py-1 text-xs font-semibold text-white shadow-lg border border-gray-700">
        {user.name}
      </span>
    </div>
  );
};

export default Cursor;

