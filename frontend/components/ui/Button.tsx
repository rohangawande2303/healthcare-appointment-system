import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, ...props }, ref) => {
    const variants = {
      primary: [
        "bg-[#176B83] text-white",
        "hover:bg-[#145A70]",
        "shadow-[0_10px_30px_rgba(23,107,131,0.18)] hover:shadow-[0_14px_36px_rgba(23,107,131,0.25)]",
        "focus-visible:ring-2 focus-visible:ring-[#176B83]/40",
      ].join(" "),
      secondary: [
        "bg-white/65 text-[#17313C]",
        "border border-[rgba(20,70,80,0.10)]",
        "hover:bg-white/85 hover:border-[#9DE1E1]",
        "shadow-[0_4px_16px_rgba(16,50,60,0.05)]",
      ].join(" "),
      outline: [
        "border-2 border-[#176B83] text-[#176B83]",
        "hover:bg-[#EAF9F9]",
        "focus-visible:ring-2 focus-visible:ring-[#176B83]/30",
      ].join(" "),
      ghost: [
        "bg-transparent text-[#405762]",
        "hover:bg-[#EEF7F8] hover:text-[#17313C]",
      ].join(" "),
      danger: [
        "bg-[#D95757] text-white",
        "hover:bg-[#c44a4a]",
        "shadow-[0_10px_30px_rgba(217,87,87,0.18)]",
      ].join(" "),
      success: [
        "bg-[#15966A] text-white",
        "hover:bg-[#127a57]",
        "shadow-[0_10px_30px_rgba(21,150,106,0.18)]",
      ].join(" "),
    };

    const sizes = {
      sm:  "px-4 py-2 text-sm gap-1.5",
      md:  "px-5 py-2.5 text-[15px] gap-2",
      lg:  "px-7 py-3.5 text-base gap-2.5",
    };

    return (
      <motion.button
        whileHover={{ scale: 1.015 }}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={cn(
          "inline-flex items-center justify-center rounded-[14px] font-semibold",
          "transition-all duration-300 ease-out",
          "focus-visible:outline-none",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none",
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref as any}
        disabled={isLoading || props.disabled}
        {...(props as any)}
      >
        {isLoading && (
          <span className="mr-1.5 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {children}
      </motion.button>
    );
  }
);
Button.displayName = "Button";

export { Button };
