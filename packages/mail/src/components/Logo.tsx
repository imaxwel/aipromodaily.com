import React from "react";

export function Logo({
  withLabel = true,
  className,
}: {
  className?: string;
  withLabel?: boolean;
}) {
  return (
    <span
      className={`text-primary flex items-center font-semibold leading-none ${className || ''}`}
    >
      {withLabel && <span className="text-lg">HOPE.DO</span>}
    </span>
  );
}
