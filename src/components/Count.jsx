import PropTypes from "prop-types";

const COUNT_TONE_CLASS = {
  success: "text-green-400",
  error: "text-red-400",
  warning: "text-amber-400",
};

const Count = ({ children, tone = "success" }) => (
  <span className={`font-semibold ${COUNT_TONE_CLASS[tone]}`}>{children}</span>
);

Count.propTypes = {
  children: PropTypes.node.isRequired,
  tone: PropTypes.oneOf(["success", "error", "warning"]),
};

export default Count;