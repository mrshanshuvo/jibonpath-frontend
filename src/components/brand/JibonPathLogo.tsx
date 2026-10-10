import React from "react";
import Link from "next/link";
import { ROUTES } from "@/config/routes";
import { cn } from "@/lib/utils";

interface JibonPathLogoProps {
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  tagline?: string;
  href?: string;
  className?: string;
  iconOnly?: boolean;
}

/**
 * High-definition vector emblem for JibonPath
 * Combines an emergency medical cross, an ECG rhythm pulse, and a dynamic forward highway path.
 */
export function JibonPathIcon({
  className,
  size = 36,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 select-none", className)}
      aria-label="JibonPath Emergency Emblem"
    >
      <defs>
        {/* Gradients */}
        <linearGradient
          id="jp-cross-red"
          x1="6"
          y1="6"
          x2="24"
          y2="42"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F43F5E" />
          <stop offset="1" stopColor="#E11D48" />
        </linearGradient>

        <linearGradient
          id="jp-cross-teal"
          x1="24"
          y1="6"
          x2="42"
          y2="42"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#06B6D4" />
          <stop offset="1" stopColor="#0284C7" />
        </linearGradient>

        <linearGradient
          id="jp-road"
          x1="10"
          y1="28"
          x2="44"
          y2="10"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#0F172A" />
          <stop offset="0.6" stopColor="#1E293B" />
          <stop offset="1" stopColor="#334155" />
        </linearGradient>

        <filter id="jp-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow
            dx="0"
            dy="2"
            stdDeviation="3"
            floodColor="#06B6D4"
            floodOpacity="0.35"
          />
        </filter>
      </defs>

      {/* Emblem Background Plate */}
      <rect
        x="2"
        y="2"
        width="44"
        height="44"
        rx="12"
        className="fill-card stroke-border/70"
        strokeWidth="1.5"
      />

      {/* Left Medical Cross Wing (Emergency Red) */}
      <path
        d="M22 8H16C14.8954 8 14 8.89543 14 10V16H10C8.89543 16 8 16.8954 8 18V26H14V38C14 39.1046 14.8954 40 16 40H22V8Z"
        fill="url(#jp-cross-red)"
        opacity="0.95"
      />

      {/* Right Medical Cross Wing (Clinical Cyan) */}
      <path
        d="M26 8H32C33.1046 8 34 8.89543 34 10V16H38C39.1046 16 40 16.8954 40 18V28C38.5 28 36.8 28.2 34 29V38C34 39.1046 33.1046 40 32 40H26V8Z"
        fill="url(#jp-cross-teal)"
        opacity="0.95"
      />

      {/* Curved Dynamic Highway (Path of Life) */}
      <path
        d="M6 31C14 30 20 28 24 23C28 17 33 13 44 11C40 16 35 22 28 27C21 32 14 34 6 31Z"
        fill="url(#jp-road)"
        stroke="#475569"
        strokeWidth="1"
      />

      {/* Road Lane Dashes */}
      <path
        d="M10 30.5L14 29.5M18 28L22 26M26 23.5L29 20M32 17.5L36 15"
        stroke="#F8FAFC"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="2 2"
      />

      {/* High-Precision ECG Pulse Rhythm Overlap */}
      <path
        d="M6 24H15L17.5 17L20.5 30L23.5 20L25.5 25L28 24"
        stroke="#FFFFFF"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#jp-glow)"
      />

      {/* Telemetry Beacon Point */}
      <circle cx="28" cy="24" r="2" fill="#38BDF8" className="animate-pulse" />
    </svg>
  );
}

export function JibonPathLogo({
  size = "md",
  showTagline = true,
  tagline = "Ambulance Dispatch & Telemetry",
  href = ROUTES.PUBLIC.HOME,
  className,
  iconOnly = false,
}: JibonPathLogoProps) {
  const iconSizes = {
    sm: 30,
    md: 38,
    lg: 46,
  };

  const titleSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl",
  };

  const taglineSizes = {
    sm: "text-3xs",
    md: "text-3xs sm:text-2xs",
    lg: "text-xs",
  };

  const content = (
    <div className={cn("flex items-center gap-2.5 group", className)}>
      <div className="group-hover:scale-105 transition-transform duration-200">
        <JibonPathIcon size={iconSizes[size]} />
      </div>

      {!iconOnly && (
        <div className="flex flex-col select-none">
          <div className="flex items-center gap-1 leading-tight">
            <span
              className={cn(
                "font-extrabold tracking-tight text-foreground transition-colors",
                titleSizes[size],
              )}
            >
              Jibon<span className="text-primary font-black">Path</span>
            </span>
          </div>

          {showTagline && (
            <span
              className={cn(
                "text-muted-foreground uppercase tracking-wider font-semibold -mt-0.5",
                taglineSizes[size],
              )}
            >
              {tagline}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (!href) {
    return content;
  }

  return (
    <Link
      href={href}
      className="inline-flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
    >
      {content}
    </Link>
  );
}
