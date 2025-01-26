import React from "react";

export const PrioritySelector = ({ priority, onPriorityChange, onClick }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "text-red-600";
      case "medium":
        return "text-yellow-600";
      case "low":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <select
      value={priority}
      onChange={(e) => onPriorityChange(e.target.value)}
      onClick={onClick}
      className={`px-2 py-1 rounded-full text-sm font-medium ${
        getPriorityColor(priority)
      } border-0 cursor-pointer focus:ring-2 focus:ring-blue-500 min-w-[80px] appearance-none text-center uppercase`}
    >
      <option value="high">high</option>
      <option value="medium">medium</option>
      <option value="low">low</option>
    </select>
  );
}; 