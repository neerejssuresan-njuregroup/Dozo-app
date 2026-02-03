
import React from 'react';
import { Category, Product } from '../../types';
import ProductCard from '../ProductCard';
import { ArrowRight } from 'lucide-react';

interface CategoryCardProps {
  category: Category;
  onSelect: (category: Category) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, onSelect }) => (
  <div 
    className="relative rounded-xl overflow-hidden cursor-pointer group shadow-sm hover:shadow-xl transition-all duration-300"
    onClick={() => onSelect(category)}
  >
    <img src={category.imageUrl} alt={category.name} className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105" />
    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
      <h3 className="text-white text-lg font-semibold">{category.name}</h3>
    </div>
  </div>
);

interface HomePageProps {
  categories: Category[];
  products: Product[];
  onSelectCategory: (category: Category) => void;
  onSelectProduct: (product: Product) => void;
}

const HomePage: React.FC<HomePageProps> = ({ categories, products, onSelectCategory, onSelectProduct }) => {
  const featuredProducts = products.slice(0, 4);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="relative text-center py-20 px-6 bg-dozo-charcoal-light rounded-xl overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://picsum.photos/seed/hero-bg/1200/400" className="w-full h-full object-cover opacity-20"/>
        </div>
        <div className="relative">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white">
            Your City, Your Catalog.
          </h1>
          <p className="mt-4 text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
            Rent Anything, Anywhere. From daily-use electronics to monthly-subscription furniture, Dozo makes it possible.
          </p>
          <button className="mt-8 bg-dozo-teal text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-opacity-90 transition-transform hover:scale-105">
            Explore Rentals
          </button>
        </div>
      </div>

      {/* Categories Section */}
      <div>
        <h2 className="text-2xl font-bold mb-5 text-dozo-charcoal">Browse by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map(cat => (
            <CategoryCard key={cat.id} category={cat} onSelect={onSelectCategory} />
          ))}
        </div>
      </div>
      
      {/* Featured Products Section */}
      <div>
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl font-bold text-dozo-charcoal">Featured Items</h2>
          <a href="#" className="flex items-center text-sm text-dozo-teal font-semibold hover:underline">
            View All <ArrowRight className="w-4 h-4 ml-1" />
          </a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map(product => (
            <ProductCard key={product.id} product={product} onSelect={onSelectProduct} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
