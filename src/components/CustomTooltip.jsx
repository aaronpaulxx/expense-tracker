import React from "react";

export const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    // Check if a dynamic color exists
    const hasDynamicColor = Boolean(payload[0]?.payload?.color);

    // Background: Dynamic color or default gradient
    const backgroundStyle = {
      background: hasDynamicColor
        ? payload[0]?.payload?.color
        : "linear-gradient(to bottom, #3b82f6, #9333ea)", // Default blue-to-purple
    };

    return (
      <div
        className={`p-3 rounded-lg shadow-lg border border-gray-700 ${
          hasDynamicColor ? "text-black" : "text-white"
        }`}
        style={backgroundStyle}
      >
        <p className="font-medium">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm">
            {entry.name}: ₱{entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};
