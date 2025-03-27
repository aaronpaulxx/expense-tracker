import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const Footer = () => {
  const [clicks, setClicks] = useState(0);
  const [secretActive, setSecretActive] = useState(false);

  useEffect(() => {
    let resetTimer;
    if (secretActive) {
      resetTimer = setTimeout(() => setSecretActive(false), 3000); // Auto-reset after 3 sec
    }
    return () => clearTimeout(resetTimer);
  }, [secretActive]);

  useEffect(() => {
    if (clicks > 0) {
      const clickResetTimer = setTimeout(() => setClicks(0), 2000); // Reset clicks after 2s inactivity
      return () => clearTimeout(clickResetTimer);
    }
  }, [clicks]);

  const handleClick = () => {
    setClicks((prev) => prev + 1);
    if (clicks === 2) {
      setSecretActive(true);
      setClicks(0); // Reset clicks after activation
    }
  };

  return (
    <div className="w-full flex justify-center mt-3 relative">
      {secretActive && (
        <motion.img
          src="/middle-finger.png"
          alt="Middle Finger"
          className="absolute left-0 w-8 h-8"
          animate={{ opacity: [0, 1, 0.5, 1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        />
      )}
      <motion.span
        className="text-xs mb-4 cursor-pointer relative"
        animate={
          secretActive
            ? {
                color: ["#22c55e", "#ffffff", "#22c55e"], // Green & white flicker
                x: [0, -2, 2, -3, 3, 0], // Jitter effect
                scale: [1, 1.05, 0.95, 1], // Glitch pulsing
                textShadow: [
                  "2px 0px 4px rgba(34, 197, 94, 0.8)", // Green glow
                  "-2px -1px 4px rgba(255, 255, 255, 0.6)", // White ghost effect
                ],
              }
            : { color: "#a8a29e", textShadow: "none" } // Full reset
        }
        transition={{
          duration: 0.08,
          repeat: secretActive ? Infinity : 0,
          repeatType: "mirror",
        }}
        onClick={handleClick}
      >
        Created by{" "}
        <motion.span
          className="font-medium relative"
          animate={
            secretActive
              ? {
                  x: [-1, 1, -3, 2, 0], // More random jitter
                  scale: [1, 1.08, 0.92, 1], // Distorted scaling
                  opacity: [1, 0.8, 1, 0.6, 1], // Flickering effect
                }
              : { textShadow: "none" } // Full reset after 3 sec
          }
          transition={{
            duration: 0.1,
            repeat: secretActive ? Infinity : 0,
            repeatType: "mirror",
          }}
        >
          APZR
        </motion.span>{" "}
        © {new Date().getFullYear()}
      </motion.span>
      {secretActive && (
        <motion.img
          src="/middle-finger.png"
          alt="Middle Finger"
          className="absolute right-0 w-8 h-8"
          animate={{ opacity: [0, 1, 0.5, 1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        />
      )}
    </div>
  );
};

export default Footer;
