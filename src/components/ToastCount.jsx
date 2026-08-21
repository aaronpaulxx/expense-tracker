import PropTypes from "prop-types";

const COUNT_TONE_CLASS = {
  success: "text-green-400",
  error: "text-red-400",
  warning: "text-amber-400",
};

const ToastCount = ({ children, tone = "success" }) => (
  <span className={`font-semibold ${COUNT_TONE_CLASS[tone]}`}>
    {typeof children === "number" ? children.toLocaleString() : children}
  </span>
);

ToastCount.propTypes = {
  children: PropTypes.node.isRequired,
  tone: PropTypes.oneOf(["success", "error", "warning"]),
};

export default ToastCount;
