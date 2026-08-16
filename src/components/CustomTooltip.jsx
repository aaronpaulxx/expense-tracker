import PropTypes from "prop-types";

export const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <div
      className="p-3 rounded-lg shadow-lg border border-stone-600 text-white"
      style={{
        background: "linear-gradient(to bottom, #171717, #3f3f3f)", // Black-to-gray gradient
      }}
    >
      <p className="font-medium text-sm text-stone-300">{label}</p>
      {payload.map((entry, index) => {
        const categoryColor = entry.payload?.color;

        return (
          <div key={index} className="flex items-center gap-2 text-sm">
            {/* Only show the square if a valid color exists */}
            {categoryColor && categoryColor !== "#ffffff" && (
              <span
                className="w-3 h-3 rounded-xs"
                style={{ backgroundColor: categoryColor }}
              />
            )}
            <span className="text-white">
              {entry.name}: ₱{entry.value.toLocaleString()}
            </span>
          </div>
        );
      })}
    </div>
  );
};

CustomTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      value: PropTypes.number,
      payload: PropTypes.shape({
        color: PropTypes.string,
      }),
    })
  ),
  label: PropTypes.node,
};