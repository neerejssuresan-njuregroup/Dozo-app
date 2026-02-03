
import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  totalStars?: number;
  className?: string;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, totalStars = 5, className }) => {
  return (
    <div className={`flex items-center ${className}`}>
      {[...Array(totalStars)].map((_, index) => {
        const starValue = index + 1;
        return (
          <Star
            key={index}
            className={`w-5 h-5 ${
              starValue <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        );
      })}
    </div>
  );
};

export default StarRating;
