"use client";

import React, { useState } from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  onRatingChange?: (rating: number) => void;
  interactive?: boolean;
  size?: number;
}

export const StarRating = ({ 
  rating, 
  maxRating = 5, 
  onRatingChange, 
  interactive = false,
  size = 20 
}: StarRatingProps) => {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {[...Array(maxRating)].map((_, i) => {
        const starValue = i + 1;
        const active = (hoverRating || rating) >= starValue;
        
        return (
          <Star
            key={i}
            size={size}
            className={`transition-all ${
              interactive ? "cursor-pointer active:scale-90" : ""
            } ${
              active 
                ? "fill-amber-400 text-amber-400" 
                : "text-slate-200 fill-slate-200"
            }`}
            onMouseEnter={() => interactive && setHoverRating(starValue)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            onClick={() => interactive && onRatingChange && onRatingChange(starValue)}
          />
        );
      })}
    </div>
  );
};
