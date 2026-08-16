import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Check, X } from "lucide-react";

const Toast = ({ message, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Set a timer to start the closing animation after a certain duration
    const timer = setTimeout(() => setIsClosing(true), 4700);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsClosing(true);
  };

  const handleAnimationEnd = (e) => {
    if (e.animationName === "slideOut") {
      setIsVisible(false);
      onClose(); // Notify parent to unmount after animation
    }
  };
  return (
    // Only render if isVisible is true
    isVisible && (
      <div
        className={`fixed bottom-4 right-4 z-50 ${
          isClosing
            ? "animate-[slideOut_0.3s_ease-in_forwards]"
            : "animate-[slideIn_0.2s_ease-out]"
        }`}
        onAnimationEnd={handleAnimationEnd}
      >
        <div className="bg-stone-900 border border-stone-600 text-sm text-white p-2 rounded-lg shadow-lg flex items-center gap-2">
          <Check size={28} className="w-6 h-6 text-green-500" />
          <span>{message}</span>
          <button
            onClick={handleClose}
            className="cursor-pointer text-stone-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    )
  );
};

Toast.propTypes = {
  message: PropTypes.node,
  onClose: PropTypes.func.isRequired,
};

export default Toast;
