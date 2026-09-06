import Link from "next/link";

function StarMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="navStarGradient" x1="6" y1="4" x2="94" y2="87" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#3B82F6" />
          <stop offset="0.55" stopColor="#2563EB" />
          <stop offset="1" stopColor="#1D4ED8" />
        </linearGradient>
      </defs>
      <path
        d="M 50,4 L 60.29,35.84 L 93.75,35.79 L 66.64,55.41 L 77.04,87.21 L 50,67.5 L 22.96,87.21 L 33.36,55.41 L 6.25,35.79 L 39.71,35.84 Z"
        fill="url(#navStarGradient)"
        stroke="#1E3A8A"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({
  className,
  wordmarkClassName,
}: {
  className?: string;
  wordmarkClassName?: string;
}) {
  return (
    <Link
      href="/"
      className={`group flex items-center gap-2.5 ${className ?? ""}`}
    >
      <StarMark className="h-8 w-8 shrink-0 transition-transform duration-200 group-hover:scale-105" />
      <span
        className={`text-lg font-bold tracking-tight ${wordmarkClassName ?? "text-white"}`}
      >
        Property Resource
      </span>
    </Link>
  );
}

export { StarMark };
