import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "success" | "warning" | "error" | "info" | "outline";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default:   "bg-[#EAF9F9] text-[#176B83] border-[#CDEFF0]",
    secondary: "bg-[#EEF7F8] text-[#405762] border-[#D4E8EC]",
    success:   "bg-[#EAF8F2] text-[#15966A] border-[#B8ECCA]",
    warning:   "bg-[#FFF6E6] text-[#D99024] border-[#F5D99A]",
    error:     "bg-[#FDEEEE] text-[#D95757] border-[#F5BBBB]",
    info:      "bg-[#EDF5FF] text-[#3677C8] border-[#C0D9F7]",
    outline:   "bg-transparent text-[#405762] border-[#DCE7E9]",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-meta font-medium",
        "transition-colors duration-200",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
