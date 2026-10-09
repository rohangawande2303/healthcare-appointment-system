import React from "react";
import { Stethoscope, SearchX, Calendar, WifiOff } from "lucide-react";
import { Button } from "./Button";

interface EmptyStateProps {
  variant?: "doctors" | "appointments" | "search" | "error";
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const configs = {
  doctors: {
    icon: Stethoscope,
    defaultTitle: "No Doctors Found",
    defaultDesc: "We couldn't find any specialists matching your search. Try adjusting your filters.",
    iconBg: "bg-[#EAF9F9]",
    iconColor: "text-[#27A7B5]",
  },
  appointments: {
    icon: Calendar,
    defaultTitle: "No Appointments",
    defaultDesc: "You don't have any upcoming appointments. Book one now.",
    iconBg: "bg-[#EAF9F9]",
    iconColor: "text-[#27A7B5]",
  },
  search: {
    icon: SearchX,
    defaultTitle: "No Results Found",
    defaultDesc: "Try a different search term or browse our specialties.",
    iconBg: "bg-[#EEF7F8]",
    iconColor: "text-[#61727A]",
  },
  error: {
    icon: WifiOff,
    defaultTitle: "Something Went Wrong",
    defaultDesc: "We couldn't load the data. Please check your connection and try again.",
    iconBg: "bg-[#FDEEEE]",
    iconColor: "text-[#D95757]",
  },
};

export function EmptyState({
  variant = "search",
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const config = configs[variant];
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-6 space-y-5">
      <div className={`w-20 h-20 rounded-3xl ${config.iconBg} flex items-center justify-center`}>
        <Icon className={`w-9 h-9 ${config.iconColor}`} strokeWidth={1.75} />
      </div>
      <div className="space-y-2 max-w-sm">
        <h3 className="text-card-heading font-semibold text-[#17313C]">
          {title || config.defaultTitle}
        </h3>
        <p className="text-body text-[#61727A]">
          {description || config.defaultDesc}
        </p>
      </div>
      {actionLabel && onAction && (
        <Button variant="outline" onClick={onAction} className="mt-2">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
