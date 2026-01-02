import React from "react";
import { useUserStore } from "../store/userStore";

const PeopleBar: React.FC = () => {
  const { users } = useUserStore();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-blue-500",
      "bg-purple-500",
      "bg-red-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-teal-500",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-white border-b border-gray-200">
      <span className="text-xs font-medium text-gray-500 mr-2">
        {Object.keys(users).length} {Object.keys(users).length === 1 ? "person" : "people"}
      </span>
      <div className="flex -space-x-2">
        {Object.values(users).map((user) => (
          <div
            key={user.id}
            className={`
              w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium
              border-2 border-white shadow-sm
              ${getAvatarColor(user.name)}
            `}
            title={user.name}
          >
            {getInitials(user.name)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PeopleBar;
