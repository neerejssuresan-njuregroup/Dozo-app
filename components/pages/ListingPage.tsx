
import React, { useState } from 'react';
import { Product, Category, RentalType, SortOption } from '../../types';
import ProductCard from '../ProductCard';
import { Filter, X, ChevronDown, ArrowLeft } from 'lucide-react';

interface ListingPageProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  category: Category | null;
  filters: { rentalType: string; priceRange: string; };
  onFilterChange: (newFilters: any) => void;
  sortOption: SortOption;
  onSortChange: (sortOption: SortOption) => void;
  onBackToHome: () => void;
}

const priceRanges = [
  { label: 'All', value: 'all' },
  { label: 'Under ₹1000', value: '0-1000' },
  { label: '₹1000 - ₹2000', value: '1000-2000' },
  { label: 'Over ₹2000', value: '2000-Infinity' },
];

const FilterPanel: React.FC<Pick<ListingPageProps, 'filters' | 'onFilterChange'>> = ({ filters, onFilterChange }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
                <h3 className="font-semibold mb-3 text-dozo-charcoal">Rental Type</h3>
                <div className="flex flex-wrap gap-2">
                    <button onClick={() => onFilterChange({ rentalType: 'all' })} className={`px-4 py-2 rounded-full text-sm font-medium ${filters.rentalType === 'all' ? 'bg-dozo-teal text-white' : 'bg-gray-100 text-dozo-charcoal-light'}`}>All</button>
                    <button onClick={() => onFilterChange({ rentalType: RentalType.Daily })} className={`px-4 py-2 rounded-full text-sm font-medium ${filters.rentalType === RentalType.Daily ? 'bg-dozo-teal text-white' : 'bg-gray-100 text-dozo-charcoal-light'}`}>Daily</button>
                    <button onClick={() => onFilterChange({ rentalType: RentalType.Monthly })} className={`px-4 py-2 rounded-full text-sm font-medium ${filters.rentalType === RentalType.Monthly ? 'bg-dozo-teal text-white' : 'bg-gray-100 text-dozo-charcoal-light'}`}>Monthly</button>
                </div>
            </div>
             <div>
                <h3 className="font-semibold mb-3 text-dozo-charcoal">Price Range (per day/month)</h3>
                <div className="flex flex-wrap gap-2">
                    {priceRanges.map(range => (
                        <button key={range.value} onClick={() => onFilterChange({ priceRange: range.value })} className={`px-4 py-2 rounded-full text-sm font-medium ${filters.priceRange === range.value ? 'bg-dozo-teal text-white' : 'bg-gray-100 text-dozo-charcoal-light'}`}>{range.label}</button>
                    ))}
                </div>
            </div>
        </div>
    </div>
  )
}


const ListingPage: React.FC<ListingPageProps> = ({ products, onSelectProduct, category, filters, onFilterChange, sortOption, onSortChange, onBackToHome }) => {
  const [showFilters, setShowFilters] = useState(true);

  return (
    <div className="space-y-6">
      <button onClick={onBackToHome} className="flex items-center text-sm text-dozo-teal font-semibold hover:underline">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Home
      </button>

      <div>
        <div className="flex flex-col md:flex-row justify-between md:items-center">
            <div>
                <h1 className="text-3xl font-bold text-dozo-charcoal">
                {category ? category.name : 'Search Results'}
                </h1>
                <p className="text-dozo-gray mt-1">{products.length} items found</p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
                <button onClick={() => setShowFilters(!showFilters)} className="flex items-center text-sm font-medium bg-white px-4 py-2 rounded-md shadow-sm border border-gray-200">
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                </button>
                <div className="relative">
                    <select
                        value={sortOption}
                        onChange={(e) => onSortChange(e.target.value as SortOption)}
                        className="appearance-none bg-white pl-4 pr-8 py-2 rounded-md text-sm font-medium border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-dozo-teal"
                    >
                        <option value="relevance">Relevance</option>
                        <option value="price-asc">Price: Low to High</option>
                        <option value="price-desc">Price: High to Low</option>
                        <option value="rating-desc">Rating: High to Low</option>
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"/>
                </div>
            </div>
        </div>
      </div>

      {showFilters && <FilterPanel filters={filters} onFilterChange={onFilterChange} />}

      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <ProductCard key={product.id} product={product} onSelect={onSelectProduct} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-lg shadow-sm">
          <h2 className="text-2xl font-bold text-dozo-charcoal">No Items Found</h2>
          <p className="text-dozo-gray mt-2">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
};

export default ListingPage;