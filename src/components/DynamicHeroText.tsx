"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const WORDS = ["PATH.", "DRIVE.", "ESCAPE.", "THRILL."];

export function DynamicHeroText() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % WORDS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="relative inline-block overflow-hidden h-[1.1em] align-top text-white">
      {/* Invisible placeholder to size the container for the longest word */}
      <span className="invisible pointer-events-none select-none">ESCAPE.</span>
      <AnimatePresence mode="popLayout">
        <motion.span
          key={WORDS[index]}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{
            type: "spring",
            stiffness: 250,
            damping: 30,
            opacity: { duration: 0.3 },
          }}
          className="absolute left-0 top-0 text-white drop-shadow-lg"
        >
          {WORDS[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
