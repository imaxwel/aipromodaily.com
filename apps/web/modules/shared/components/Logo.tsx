import { cn } from "@ui/lib";

export function Logo({
  withLabel = true,
  className,
}: {
  className?: string;
  withLabel?: boolean;
}) {
  return (
    <span
      className={cn(
        "text-primary flex items-center font-semibold leading-none",
        className,
      )}
    >
      <svg className="h-10 w-10" viewBox="0 0 512 512">
        <defs>
          <linearGradient id="hopeGradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF9500" />
            <stop offset="100%" stopColor="#FFD700" />
          </linearGradient>
        </defs>
        <circle cx="256" cy="256" r="256" fill="url(#hopeGradient)" />
        <circle cx="256" cy="128" r="48" fill="white" />
        <path d="M256 384 L128 256 L384 256 Z" fill="white" />
      </svg>
      {withLabel && <span className="ml-3 text-lg">HOPE.DO</span>}
    </span>
  );
}
