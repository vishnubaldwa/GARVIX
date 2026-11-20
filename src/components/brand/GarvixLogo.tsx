import { useId } from "react";

interface GarvixLogoMarkProps {
  className?: string;
}

/**
 * Official GARVIX signature brand emblem: stylized brushed-gold "G"
 * paired with three concentric UHF RFID signal arcs.
 */
export function GarvixLogoMark({ className = "h-5 w-5" }: GarvixLogoMarkProps) {
  const gradId = useId();

  return (
    <svg
      viewBox="0 0 152 136"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="12%" y1="8%" x2="88%" y2="92%">
          <stop offset="0%" stopColor="#f0d799" />
          <stop offset="38%" stopColor="#d8b56c" />
          <stop offset="72%" stopColor="#c3984c" />
          <stop offset="100%" stopColor="#a67c34" />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${gradId})`}
        d="M 58 30 L 96 30 L 74 51 L 37 51 C 25 57, 21 76, 25 94 C 31 112, 54 114, 76 108 L 76 90 L 40 90 L 60 70 L 103 70 L 103 88 L 74 118 C 60 130, 38 132, 22 121 C 5 109, 2 86, 11 67 C 19 52, 36 44, 58 30 Z"
      />
      <path
        stroke={`url(#${gradId})`}
        strokeWidth="6.8"
        strokeLinecap="round"
        d="M 108 27 A 14 14 0 0 1 122 41"
      />
      <path
        stroke={`url(#${gradId})`}
        strokeWidth="6.8"
        strokeLinecap="round"
        d="M 108 15 A 26 26 0 0 1 134 41"
      />
      <path
        stroke={`url(#${gradId})`}
        strokeWidth="6.8"
        strokeLinecap="round"
        d="M 108 3 A 38 38 0 0 1 146 41"
      />
    </svg>
  );
}
