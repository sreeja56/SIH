import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number; // e.g. 4.1, 3.0, 5
  maxStars?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showNumber?: boolean;
  interactive?: boolean;
  onRate?: (rating: number) => void;
  className?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxStars = 5,
  size = 'sm',
  showNumber = true,
  interactive = false,
  onRate,
  className = '',
}) => {
  const sizeMap = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  };

  const starSize = sizeMap[size] || 'w-3.5 h-3.5';

  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxStars }).map((_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= Math.round(rating);
          const isExactOrLess = starValue <= Math.floor(rating);
          const isPartial = !isExactOrLess && starValue === Math.ceil(rating) && rating % 1 !== 0;

          return (
            <button
              key={index}
              type={interactive ? 'button' : undefined}
              disabled={!interactive}
              onClick={() => interactive && onRate && onRate(starValue)}
              className={`${
                interactive ? 'cursor-pointer hover:scale-115 transition-transform p-0.5' : 'cursor-default pointer-events-none'
              }`}
              title={`${starValue} Stars`}
            >
              <Star
                className={`${starSize} ${
                  isFilled || isPartial
                    ? 'fill-amber-400 text-amber-500'
                    : 'fill-slate-100 text-slate-300'
                }`}
              />
            </button>
          );
        })}
      </div>
      {showNumber && (
        <span className="text-xs font-black text-slate-700 ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};
