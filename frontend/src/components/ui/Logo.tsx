import React from "react";

type LogoProps = {
  size?: number;
  className?: string;
};

export default function Logo({ size = 36, className = "" }: LogoProps) {
  return (
    <img
      src="/logo-transparent.png"
      alt="Upwise Logo"
      width={size}
      height={size}
      className={`upwise-system-logo ${className}`}
      style={{
        objectFit: "contain",
        display: "block",
        filter: "drop-shadow(0px 3px 10px rgba(14, 165, 233, 0.2))",
      }}
    />
  );
}
