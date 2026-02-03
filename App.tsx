
import React, { useState, useEffect, useCallback } from 'react';
import { Product, Category, View, RentalType, SortOption, User } from './types';
import { categories, products as initialProducts } from './data/mockData';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './components/pages/HomePage';
import ListingPage from './components/pages/ListingPage';
import ProductDetailPage from './components/pages/ProductDetailPage';
import DocumentationPage from './components/pages/DocumentationPage';
import AdminLayout from './components/admin/AdminLayout';
import LenderLayout from './components/lender/LenderLayout';
import AuthModal from './components/AuthModal';
import KycVerificationModal from './components/KycVerificationModal';
import ListItemModal from './components/ListItemModal';
import AnnouncementBanner from './components/AnnouncementBanner';
import * as authService from './services/authService';
import * as geminiService from './services/geminiService';

interface Filters {
  rentalType: 'all' | RentalType.Daily | RentalType.Monthly;
  priceRange: string;
}

const getProductPrice = (product: Product): number => {
    return product.displayPricing.daily || product.displayPricing.monthly?.['12'] || 0;
};

const getProductAverageRating = (product: Product): number => {
    if (!product.reviews || product.reviews.length === 0) return 0;
    const total = product.reviews.reduce((acc, review) => acc + review.rating, 0);
    return total / product.reviews.length;
};

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [documentationSection, setDocumentationSection] = useState<string>('');
  
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);
  const [filters, setFilters] = useState<Filters>({ rentalType: 'all', priceRange: 'all' });
  const [sortOption, setSortOption] = useState<SortOption>('relevance');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [isKycModalOpen, setKycModalOpen] = useState(false);
  const [isItemModalOpen, setItemModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const [announcement, setAnnouncement] = useState<string | null>(null);
  const [isAnnouncementDismissed, setIsAnnouncementDismissed] = useState(false);
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  useEffect(() => {
    authService.seedInitialUsers();

    const user = authService.getCurrentUser();
    if (user) {
        setCurrentUser(user);
    }

    const storedAnnouncement = localStorage.getItem('dozoAnnouncement');
    if (storedAnnouncement) {
      setAnnouncement(storedAnnouncement);
      const dismissed = localStorage.getItem('dozoDismissedAnnouncement');
      if(dismissed === storedAnnouncement) {
        setIsAnnouncementDismissed(true);
      }
    }

  }, []);

  useEffect(() => {
    let newFilteredProducts = [...products];

    if (selectedCategory) {
      newFilteredProducts = newFilteredProducts.filter(p => p.categoryId === selectedCategory.id);
    }
    
    if (searchQuery.trim() !== '') {
        const lowercasedQuery = searchQuery.toLowerCase();
        newFilteredProducts = newFilteredProducts.filter(p =>
            p.name.toLowerCase().includes(lowercasedQuery) ||
            p.description.toLowerCase().includes(lowercasedQuery)
        );
    }

    if (filters.rentalType !== 'all') {
      newFilteredProducts = newFilteredProducts.filter(p => p.rentalType === filters.rentalType);
    }

    if (filters.priceRange !== 'all') {
      const [min, max] = filters.priceRange.split('-').map(Number);
      newFilteredProducts = newFilteredProducts.filter(p => {
        const price = getProductPrice(p);
        return price >= min && (max ? price <= max : true);
      });
    }

    switch (sortOption) {
        case 'price-asc':
            newFilteredProducts.sort((a, b) => getProductPrice(a) - getProductPrice(b));
            break;
        case 'price-desc':
            newFilteredProducts.sort((a, b) => getProductPrice(b) - getProductPrice(a));
            break;
        case 'rating-desc':
            newFilteredProducts.sort((a, b) => getProductAverageRating(b) - getProductAverageRating(a));
            break;
        case 'relevance':
        default:
            break;
    }

    setFilteredProducts(newFilteredProducts);
  }, [searchQuery, selectedCategory, filters, sortOption, products]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setSelectedCategory(null);
    setCurrentView('listing');
  };

  const handleSelectCategory = (category: Category) => {
    setSelectedCategory(category);
    setSearchQuery('');
    setCurrentView('listing');
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setCurrentView('detail');
  };

  const handleFilterChange = (newFilters: Partial<Filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleSortChange = (newSortOption: SortOption) => {
    setSortOption(newSortOption);
  };
  
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    // authService already saved the user on login
    setAuthModalOpen(false);
    if (pendingAction) {
        pendingAction();
        setPendingAction(null);
    }
  }

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    goHome();
  }

  const handleKycSuccess = () => {
    if (currentUser) {
        authService.updateUserKycStatus(currentUser.email, true);
        // Re-fetch user from service to ensure state is fresh
        const updatedUser = authService.getCurrentUser();
        setCurrentUser(updatedUser);
        
        setKycModalOpen(false);
        if (pendingAction) {
            pendingAction();
            setPendingAction(null);
        }
    }
  }

  const handleSaveProduct = async (productData: Omit<Product, 'id' | 'reviews' | 'lenderEmail' | 'commissionRate' | 'estimatedValue'>, productId?: string) => {
    if (!currentUser) return;
    setIsSavingProduct(true);

    try {
        const { lenderPricing, aiAssessedQuality, ...restOfData } = productData;
        
        // Calculate display pricing based on AI quality assessment
        const displayPricing = JSON.parse(JSON.stringify(lenderPricing)); // Deep copy
        if (aiAssessedQuality === 'Excellent') {
            const premiumFactor = 1.10; // 10% premium
            if (displayPricing.daily) {
                displayPricing.daily = Math.round(displayPricing.daily * premiumFactor);
            }
            if (displayPricing.monthly) {
                displayPricing.monthly['3'] = Math.round(displayPricing.monthly['3'] * premiumFactor);
                displayPricing.monthly['6'] = Math.round(displayPricing.monthly['6'] * premiumFactor);
                displayPricing.monthly['12'] = Math.round(displayPricing.monthly['12'] * premiumFactor);
            }
        }

        const estimatedValue = await geminiService.estimateProductValue(productData.name, productData.description);
        const categoryName = categories.find(c => c.id === productData.categoryId)?.name || 'General';
        const commissionRate = await geminiService.assessCommissionRate(productData.name, categoryName, estimatedValue);

        const fullProductData = {
            ...restOfData,
            lenderPricing,
            displayPricing,
            aiAssessedQuality,
            estimatedValue,
            commissionRate,
        };

        if (productId) { // Update
            setProducts(prev => prev.map(p => p.id === productId ? { ...p, ...fullProductData } : p));
        } else { // Create
            const newProduct: Product = {
                ...fullProductData,
                id: `p${Date.now()}`,
                reviews: [],
                lenderEmail: currentUser.email,
            };
            setProducts(prevProducts => [newProduct, ...prevProducts]);
        }
    } catch(error) {
        console.error("Error saving product with AI features:", error);
        alert("There was an error saving your product. Please try again.");
    } finally {
        setIsSavingProduct(false);
        setItemModalOpen(false);
    }
  };
  
  const handleRemoveProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  }

  const handleSetAnnouncement = (text: string | null) => {
    if(text) {
      localStorage.setItem('dozoAnnouncement', text);
      setAnnouncement(text);
      // Reset dismissal so everyone sees the new announcement
      localStorage.removeItem('dozoDismissedAnnouncement');
      setIsAnnouncementDismissed(false);
    } else {
      localStorage.removeItem('dozoAnnouncement');
      setAnnouncement(null);
    }
  }

  const handleDismissAnnouncement = () => {
    if(announcement) {
      localStorage.setItem('dozoDismissedAnnouncement', announcement);
      setIsAnnouncementDismissed(true);
    }
  }
  
  const handleOpenCreateItemModal = () => {
    setProductToEdit(null);
    setItemModalOpen(true);
  };
  
  const handleOpenEditItemModal = (product: Product) => {
    setProductToEdit(product);
    setItemModalOpen(true);
  };

  const goHome = () => {
    setCurrentView('home');
    setSelectedCategory(null);
    setSelectedProduct(null);
    setSearchQuery('');
    setFilters({ rentalType: 'all', priceRange: 'all' });
    setSortOption('relevance');
  };

  const goToListing = () => {
    setCurrentView('listing');
    setSelectedProduct(null);
  }

  const goToDocumentation = (section: string) => {
      setDocumentationSection(section);
      setCurrentView('documentation');
  }

  const goToAdminPanel = () => {
    if (currentUser?.isAdmin) {
      setCurrentView('admin');
    }
  }

  const goToLenderDashboard = () => {
    if (currentUser) {
      setCurrentView('lenderDashboard');
    }
  }
  
  const renderContent = () => {
    if (currentView === 'admin' && currentUser?.isAdmin) {
      return (
        <AdminLayout 
          allProducts={products}
          onRemoveProduct={handleRemoveProduct}
          onSetAnnouncement={handleSetAnnouncement}
          currentAnnouncement={announcement}
          onEditProduct={handleOpenEditItemModal}
          currentUser={currentUser}
          onLogout={handleLogout}
          goToHome={goHome}
        />
      );
    }
    
    if (currentView === 'lenderDashboard' && currentUser) {
      return (
        <LenderLayout
            allProducts={products}
            onEditProduct={handleOpenEditItemModal}
            onRemoveProduct={handleRemoveProduct}
            currentUser={currentUser}
            onLogout={handleLogout}
            goToHome={goHome}
        />
      );
    }

    return (
      <>
       {announcement && !isAnnouncementDismissed && 
          <AnnouncementBanner 
            announcementText={announcement} 
            onDismiss={handleDismissAnnouncement} 
          />
        }
        <Header 
          onSearch={handleSearch} 
          goHome={goHome}
          searchQuery={searchQuery}
          allProducts={products}
          currentUser={currentUser}
          onLoginClick={() => setAuthModalOpen(true)}
          onKycClick={() => setKycModalOpen(true)}
          onLogout={handleLogout}
          onListItemClick={handleOpenCreateItemModal}
          onAdminClick={goToAdminPanel}
          onLenderDashboardClick={goToLenderDashboard}
        />
        <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {
              (() => {
                  switch (currentView) {
                  case 'listing':
                    return (
                      <ListingPage
                        products={filteredProducts}
                        onSelectProduct={handleSelectProduct}
                        category={selectedCategory}
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        sortOption={sortOption}
                        onSortChange={handleSortChange}
                        onBackToHome={goHome}
                      />
                    );
                  case 'detail':
                    return selectedProduct ? (
                      <ProductDetailPage 
                        product={selectedProduct} 
                        onBack={goToListing}
                        currentUser={currentUser} 
                        onLoginClick={() => setAuthModalOpen(true)}
                        onKycClick={() => setKycModalOpen(true)}
                        setPendingAction={setPendingAction}
                      />
                    ) : null;
                  case 'documentation':
                    return (
                        <DocumentationPage
                            activeSection={documentationSection}
                            onBackToHome={goHome}
                        />
                    );
                  case 'home':
                  default:
                    return (
                      <HomePage
                        categories={categories}
                        products={products}
                        onSelectCategory={handleSelectCategory}
                        onSelectProduct={handleSelectProduct}
                      />
                    );
                }
              })()
            }
        </main>
        <Footer onNavigate={goToDocumentation} />
      </>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 text-dozo-charcoal font-sans">
      {renderContent()}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
      {currentUser && (
         <KycVerificationModal
            isOpen={isKycModalOpen}
            onClose={() => setKycModalOpen(false)}
            onVerificationSuccess={handleKycSuccess}
        />
      )}
      <ListItemModal 
        isOpen={isItemModalOpen}
        onClose={() => setItemModalOpen(false)}
        onSave={handleSaveProduct}
        categories={categories}
        productToEdit={productToEdit}
        isSaving={isSavingProduct}
      />
    </div>
  );
};

export default App;
