"use client";

import React from "react";

interface VedLogoProps {
  className?: string;
  variant?: "dark" | "light" | "auto";
  showTagline?: boolean;
  size?: "sm" | "md" | "lg";
}

export function VedLogo({
  className = "",
  variant = "light",
  showTagline = false,
  size = "md",
}: VedLogoProps) {
  const isLight = variant === "light";

  const sizeClasses = {
    sm: "h-7",
    md: "h-9",
    lg: "h-12",
  };

  const iconSizes = {
    sm: 28,
    md: 36,
    lg: 44,
  };

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Modern Steering & Aerodynamic Speed Emblem */}
      <div className="relative shrink-0 flex items-center justify-center">
        <svg
          width={iconSizes[size]}
          height={iconSizes[size]}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-300 hover:scale-105"
        >
          {/* Outer Rounded Hexagonal Dynamic Frame */}
          <rect
            x="2"
            y="2"
            width="44"
            height="44"
            rx="12"
            fill="url(#ved-bg-gradient)"
            stroke="url(#ved-border-gradient)"
            strokeWidth="1.5"
          />

          {/* Precision Steering Ring Motif */}
          <circle
            cx="24"
            cy="24"
            r="14"
            stroke="url(#ved-accent-gradient)"
            strokeWidth="2.5"
            strokeDasharray="4 2"
          />

          {/* Aerodynamic "V" Speed Chevron at the Center */}
          <path
            d="M17 19L24 31L31 19"
            stroke="#FFFFFF"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Mobility Acceleration Beam Dot */}
          <circle cx="24" cy="20" r="2.5" fill="#FF6B00" />

          {/* Gradients */}
          <defs>
            <linearGradient id="ved-bg-gradient" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0F172A" />
              <stop offset="1" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="ved-border-gradient" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
              <stop stopColor="#10B981" stopOpacity="0.8" />
              <stop offset="1" stopColor="#FF6B00" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="ved-accent-gradient" x1="10" y1="10" x2="38" y2="38" gradientUnits="userSpaceOnUse">
              <stop stopColor="#10B981" />
              <stop offset="1" stopColor="#FF6B00" />
            </linearGradient>
          </defs>
        </svg>

        {/* Ambient live pulse glow */}
        <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#0F172A] animate-pulse" />
      </div>

      {/* Brand Typographic Wordmark */}
      <div className="flex flex-col justify-center leading-none">
        <div className="flex items-center gap-1 sm:gap-1.5">
          <span
            className={`font-black tracking-tight ${
              size === "sm"
                ? "text-sm sm:text-base"
                : size === "md"
                ? "text-base sm:text-lg md:text-xl"
                : "text-xl sm:text-2xl"
            } ${isLight ? "text-white" : "text-slate-900"}`}
          >
            VED
          </span>
          <span
            className={`font-black tracking-tight text-[#059669] ${
              size === "sm"
                ? "text-sm sm:text-base"
                : size === "md"
                ? "text-base sm:text-lg md:text-xl"
                : "text-xl sm:text-2xl"
            }`}
          >
            TRAVELS
          </span>
          <span className="text-[#FF6B00] font-black text-lg sm:text-xl leading-none">.</span>
        </div>

        {showTagline ? (
          <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-emerald-400/90 mt-0.5 hidden xs:inline-block sm:inline-block">
            Vadodara Self-Drive • GJ-06
          </span>
        ) : (
          <span
            className={`text-[8px] font-bold uppercase tracking-widest mt-0.5 hidden sm:inline-block ${
              isLight ? "text-white/50" : "text-slate-500"
            }`}
          >
            Vadodara Central Hub
          </span>
        )}
      </div>
    </div>
  );
}

export default VedLogo;
