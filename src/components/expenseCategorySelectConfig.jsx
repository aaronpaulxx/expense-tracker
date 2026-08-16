import PropTypes from "prop-types";
import { CATEGORIES } from "../constants/categories";

export const categoryOptions = Object.keys(CATEGORIES).map((category) => ({
  value: category,
  label: category,
  icon: CATEGORIES[category].icon,
}));

export const colourStyles = {
  control: (styles) => ({
    ...styles,
    backgroundColor: "#1c1917",
    borderColor: "#78716c",
    borderRadius: "9px",
    borderWidth: "1px",
    "&:hover": { backgroundColor: "#292524" },
    boxShadow: "none",
    transition: "all 200ms",
    minHeight: "30px",
    height: "33px",
  }),
  valueContainer: (styles) => ({ ...styles, padding: "0px 8px" }),
  input: (styles) => ({
    ...styles,
    color: "white",
    margin: "0",
    padding: "0",
  }),
  dropdownIndicator: (styles, { isFocused }) => ({
    ...styles,
    padding: "0 6px",
    color: isFocused ? "#14b8a680" : "#9ca3af",
    transition: "color 200ms",
    "&:hover": { color: "#22c55e" },
  }),
  menu: (styles) => ({
    ...styles,
    backgroundColor: "#292524",
    border: "1px solid #374151",
    borderRadius: "8px",
    boxShadow:
      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  }),
  option: (styles, { isDisabled, isFocused, isSelected }) => ({
    ...styles,
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: isDisabled
      ? undefined
      : isSelected
        ? "linear-gradient(to right, #166534, #115e59)"
        : isFocused
          ? "#57534e"
          : undefined,
    color: isDisabled ? "#6b7280" : "white",
    cursor: isDisabled ? "not-allowed" : "pointer",
    padding: "4px 8px",
  }),
  placeholder: (styles) => ({ ...styles, color: "#9ca3af", margin: "0" }),
};

export const CategorySingleValue = ({ data }) => (
  <div className="flex items-center gap-2 text-sm text-white -mt-6">
    {data.icon && (
      <data.icon size={16} className={CATEGORIES[data.value].color} />
    )}
    {data.label}
  </div>
);

CategorySingleValue.propTypes = {
  data: PropTypes.shape({
    icon: PropTypes.elementType,
    value: PropTypes.string,
    label: PropTypes.string,
  }).isRequired,
};
