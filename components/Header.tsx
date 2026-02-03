
import React, { useState, useEffect, useRef } from 'react';
import { Search, LogOut, Camera, RefreshCw, ShieldCheck, PlusCircle, UserCog, LayoutDashboard } from 'lucide-react';
import { Product, User } from '../types';
import { generateSearchQueryFromImage } from '../services/geminiService';

interface HeaderProps {
  onSearch: (query: string) => void;
  goHome: () => void;
  searchQuery: string;
  allProducts: Product[];
  currentUser: User | null;
  onLoginClick: () => void;
  onKycClick: () => void;
  onLogout: () => void;
  onListItemClick: () => void;
  onAdminClick: () => void;
  onLenderDashboardClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  onSearch, 
  goHome, 
  searchQuery,
  allProducts, 
  currentUser, 
  onLoginClick, 
  onKycClick, 
  onLogout,
  onListItemClick,
  onAdminClick,
  onLenderDashboardClick
}) => {
  const [query, setQuery] = useState(searchQuery);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isVisualSearching, setIsVisualSearching] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const visualSearchInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    setQuery(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    if (value.length > 1) {
      const filteredSuggestions = allProducts
        .filter(p => p.name.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 5);
      setSuggestions(filteredSuggestions);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: Product) => {
    setQuery(suggestion.name);
    setShowSuggestions(false);
    onSearch(suggestion.name);
  };
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    onSearch(query);
  };

  const handleVisualSearchClick = () => {
    visualSearchInputRef.current?.click();
  }

  const handleVisualSearchFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
          setIsVisualSearching(true);
          const reader = new FileReader();
          reader.onloadend = async () => {
              const base64String = (reader.result as string).split(',')[1];
              const newSearchQuery = await generateSearchQueryFromImage(base64String);
              if (newSearchQuery && !newSearchQuery.toLowerCase().includes("error")) {
                  setQuery(newSearchQuery);
                  onSearch(newSearchQuery);
              } else {
                  setQuery("Could not identify the object.");
              }
              setIsVisualSearching(false);
          };
          reader.readAsDataURL(file);
      }
  }

  const searchFormComponent = (
      <form onSubmit={handleSearchSubmit} className="relative w-full">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => query.length > 1 && setShowSuggestions(true)}
          placeholder="Search for anything or use an image..."
          className="block w-full bg-gray-100 border-transparent rounded-full py-2 pl-10 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-dozo-teal focus:border-transparent"
          autoComplete="off"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <button type="button" onClick={handleVisualSearchClick} className="text-gray-500 hover:text-dozo-teal">
                {isVisualSearching ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
            </button>
        </div>
        <input type="file" ref={visualSearchInputRef} onChange={handleVisualSearchFileChange} className="sr-only" accept="image/*" capture="environment" />

        {showSuggestions && suggestions.length > 0 && (
          <ul className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
            {suggestions.map(suggestion => (
              <li 
                key={suggestion.id}
                className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion.name}
              </li>
            ))}
          </ul>
        )}
      </form>
  );

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-y-3 py-3">
            
            <div className="flex items-center">
              <button onClick={goHome} className="text-3xl font-extrabold text-dozo-teal cursor-pointer">
                dozo
              </button>
            </div>
            
            <div className="w-full md:flex-1 md:max-w-2xl md:mx-8 order-3 md:order-2" ref={searchContainerRef}>
              {searchFormComponent}
            </div>

            <div className="flex items-center space-x-4 order-2 md:order-3">
                {currentUser ? (
                  <>
                    {currentUser.kycVerified && !currentUser.isAdmin && (
                       <button onClick={onListItemClick} className="hidden sm:flex items-center bg-dozo-teal/10 text-dozo-teal px-3 py-2 rounded-md hover:bg-dozo-teal/20 transition-colors text-sm font-semibold">
                         <PlusCircle className="w-4 h-4 mr-2"/>
                         List an Item
                       </button>
                    )}
                    <div className="relative" ref={userMenuRef}>
                        <button onClick={() => setShowUserMenu(!showUserMenu)} className="w-9 h-9 bg-dozo-teal text-white rounded-full flex items-center justify-center font-bold text-sm">
                            {currentUser.name.charAt(0).toUpperCase()}
                        </button>
                        {showUserMenu && (
                            <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                                <div className="py-1">
                                <div className="px-4 py-2 border-b">
                                  <p className="text-sm font-semibold text-dozo-charcoal truncate">{currentUser.name}</p>
                                  <p className="text-xs text-dozo-gray truncate">{currentUser.email}</p>
                                </div>
                                {currentUser.isAdmin ? (
                                     <button onClick={() => {onAdminClick(); setShowUserMenu(false);}} className="w-full text-left px-4 py-2 text-sm text-dozo-teal font-bold hover:bg-gray-100 flex items-center">
                                        <UserCog className="w-4 h-4 mr-2" />
                                        Admin Panel
                                    </button>
                                ) : (
                                     <button onClick={() => {onLenderDashboardClick(); setShowUserMenu(false);}} className="w-full text-left px-4 py-2 text-sm text-dozo-charcoal hover:bg-gray-100 flex items-center">
                                        <LayoutDashboard className="w-4 h-4 mr-2" />
                                        My Dashboard
                                    </button>
                                )}
                                
                                {!currentUser.isAdmin && (
                                  !currentUser.kycVerified ? (
                                      <button onClick={() => {onKycClick(); setShowUserMenu(false);}} className="w-full text-left px-4 py-2 text-sm text-dozo-charcoal hover:bg-gray-100 flex items-center">
                                          <ShieldCheck className="w-4 h-4 mr-2 text-yellow-500" />
                                          Verify KYC
                                      </button>
                                  ) : (
                                      <div className="px-4 py-2 text-sm text-green-600 flex items-center">
                                        <ShieldCheck className="w-4 h-4 mr-2 text-green-500" />
                                        KYC Verified
                                      </div>
                                  )
                                )}
                                <button onClick={onLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center">
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Log Out
                                </button>
                                </div>
                            </div>
                        )}
                    </div>
                  </>
                ) : (
                    <>
                        <button onClick={onLoginClick} className="text-sm font-medium text-dozo-charcoal hover:text-dozo-teal transition-colors">Log In</button>
                        <button onClick={onLoginClick} className="bg-dozo-teal text-white px-4 py-2 rounded-md hover:bg-dozo-charcoal-light transition-colors text-sm font-semibold">
                            Sign Up
                        </button>
                    </>
                )}
            </div>
        </div>
       </div>
    </header>
  );
};

export default Header;
