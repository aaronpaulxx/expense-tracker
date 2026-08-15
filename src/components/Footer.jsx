import { useState, useEffect } from "react";
import surprise from "../assets/surprise.png";

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
        <img
          src={surprise}
          alt="surprise"
          className="absolute left-0 w-8 h-8 animate-surprise-flicker"
        />
      )}
      <span
        className={`text-xs mb-4 cursor-pointer relative ${
          secretActive ? "text-stone-400 animate-glitch-text" : "text-stone-400"
        }`}
        onClick={handleClick}
      >
        Created by{" "}
        <span
          className={`font-medium relative ${
            secretActive ? "animate-glitch-apzr" : ""
          }`}
        >
          APZR
        </span>{" "}
        © {new Date().getFullYear()}
      </span>
      {secretActive && (
        <img
          src={surprise}
          alt="surprise"
          className="absolute right-0 w-8 h-8 animate-surprise-flicker"
        />
      )}
    </div>
  );
};

export default Footer;