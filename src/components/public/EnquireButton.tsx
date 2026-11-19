"use client";

import { ArrowRight } from "lucide-react";

interface EnquireButtonProps {
  solution: string;
  label?: string;
  variant?: "primary" | "dark" | "link";
  className?: string;
}

export function EnquireButton({
  solution,
  label = "Enquire Now",
  variant = "link",
  className = "",
}: EnquireButtonProps) {
  const handleClick = () => {
    window.dispatchEvent(
      new CustomEvent("garvix:select-solution", { detail: { solution } })
    );
    const el = document.getElementById("contact");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (variant === "primary") {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`inline-flex items-center justify-center gap-2 rounded-full bg-[#0071e3] hover:bg-[#0077ed] px-7 py-3 text-sm font-medium text-white shadow-sm transition ${className}`}
      >
        <span>{label}</span>
        <ArrowRight className="h-4 w-4" />
      </button>
    );
  }

  if (variant === "dark") {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`inline-flex items-center justify-center gap-2 rounded-full bg-[#1d1d1f] hover:bg-black px-6 py-2.5 text-xs font-medium text-white shadow-sm transition ${className}`}
      >
        <span>{label}</span>
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center gap-1.5 text-sm font-medium text-[#0071e3] hover:underline transition ${className}`}
    >
      <span>{label}</span>
      <ArrowRight className="h-3.5 w-3.5" />
    </button>
  );
}
