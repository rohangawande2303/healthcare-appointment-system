import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-3xl bg-[#EEF7F8]",
        className
      )}
    />
  );
}

export { Skeleton };
