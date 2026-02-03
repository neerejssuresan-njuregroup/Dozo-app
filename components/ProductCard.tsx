
import React, { useMemo } from 'react';
import { Product, RentalType } from '../types';
import StarRating from './pages/StarRating';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const getPriceDisplay = () => {
    if (product.rentalType === RentalType.Daily && product.displayPricing.daily) {
      return <>₹{product.displayPricing.daily.toLocaleString('en-IN')}<span className="text-sm font-normal text-dozo-gray">/day</span></>;
    }
    if (product.rentalType === RentalType.Monthly && product.displayPricing.monthly) {
      return <>₹{product.displayPricing.monthly['12'].toLocaleString('en-IN')}<span className="text-sm font-normal text-dozo-gray">/mo</span></>;
    }
    return 'Price unavailable';
  };
  
  const averageRating = useMemo(() => {
    if (!product.reviews || product.reviews.length === 0) return 0;
    const total = product.reviews.reduce((acc, review) => acc + review.rating, 0);
    return total / product.reviews.length;
  }, [product.reviews]);

  return (
    <div 
      className="bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer group transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-gray-200"
      onClick={() => onSelect(product)}
    >
      <div className="relative h-48">
        <img 
          src={product.imageUrl[0]} 
          alt={product.name} 
          className="w-full h-full object-cover"
        />
         <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm text-dozo-charcoal text-xs font-semibold px-2 py-1 rounded-full">
          {product.rentalType === RentalType.Daily ? 'Daily' : 'Monthly'}
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-base font-semibold text-dozo-charcoal truncate group-hover:text-dozo-teal">{product.name}</h3>
        
        {averageRating > 0 && (
            <div className="flex items-center mt-1">
                <StarRating rating={averageRating} />
                <span className="text-xs text-gray-500 ml-2">({product.reviews?.length})</span>
            </div>
        )}
        
        <div className="mt-3">
          <p className="text-lg font-bold text-dozo-charcoal flex items-baseline gap-1">
            {getPriceDisplay()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;