import React from "react";

interface VeyaLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const VeyaLogo: React.FC<VeyaLogoProps> = ({
  className = "",
  size = "md",
}) => {
  const heightClass = size === "sm" ? "h-7" : size === "lg" ? "h-11" : "h-9";

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <img
        src="/veya-logo.png"
        alt="VEYA"
        className={`${heightClass} w-auto object-contain shrink-0`}
        loading="eager"
      />
    </div>
  );
};


