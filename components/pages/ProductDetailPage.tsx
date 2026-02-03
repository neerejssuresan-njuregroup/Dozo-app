
import React, { useState } from 'react';
import { Product, RentalType, User } from '../../types';
import { ArrowLeft, Check, ShieldCheck, FileText, Share2 } from 'lucide-react';
import AiDamageGuard from '../AiDamageGuard';
import ReviewsSection from '../ReviewsSection';
import ShareModal from '../ShareModal';
import RentalAgreement from '../RentalAgreement';

interface ProductDetailPageProps {
  product: Product;
  onBack: () => void;
  currentUser: User | null;
  onLoginClick: () => void;
  onKycClick: () => void;
  setPendingAction: (action: (() => void) | null) => void;
}

const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ product, onBack, currentUser, onLoginClick, onKycClick, setPendingAction }) => {
  const [mainImage, setMainImage] = useState(product.imageUrl[0]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [checkoutStep, setCheckoutStep] = useState(0); // 0: Details, 1: AI Check, 2: Confirmation, 3: Success
  const [isShareModalOpen, setShareModalOpen] = useState(false);
  const [isAgreementAccepted, setIsAgreementAccepted] = useState(false);

  const handleMonthlyPlanSelect = (plan: '3' | '6' | '12') => {
    setSelectedPlan(plan);
  };
  
  const handleDailySelect = () => {
    setSelectedPlan('daily');
  };

  const handleRentNowClick = () => {
    // 1. Check if logged in
    if (!currentUser) {
      // Set a pending action to re-run this check after login
      setPendingAction(() => () => handleRentNowClick());
      onLoginClick();
      return;
    }

    // 2. Check if KYC verified
    if (!currentUser.kycVerified) {
      // Set a pending action to proceed to checkout after successful KYC
      setPendingAction(() => () => setCheckoutStep(1));
      onKycClick();
      return;
    }

    // 3. Proceed to checkout
    setCheckoutStep(1);
  };

  const renderConfirmationStep = () => (
      <div>
        <RentalAgreement 
          product={product}
          user={currentUser!}
          onAgreementChange={setIsAgreementAccepted}
        />
        <button 
          onClick={() => setCheckoutStep(3)}
          disabled={!isAgreementAccepted}
          className="mt-6 w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-all duration-300 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
            Agree & Complete Rental
        </button>
      </div>
  );
  
  const renderSuccess = () => (
      <div className="bg-white p-8 rounded-lg border text-center">
            <Check className="w-16 h-16 bg-green-100 text-green-600 rounded-full p-3 mx-auto mb-4"/>
            <h3 className="text-2xl font-bold text-dozo-charcoal mb-2">Rental Confirmed!</h3>
            <p className="text-dozo-gray mb-6">Your rental for the {product.name} is confirmed. Our team will be in touch shortly regarding delivery.</p>
            <button onClick={onBack} className="bg-dozo-teal text-white font-bold py-2 px-6 rounded-md">
                Back to Listings
            </button>
      </div>
  );

  const productUrl = `https://dozo.app/product/${product.id}`;

  return (
    <div className="space-y-8">
      <button onClick={onBack} className="flex items-center text-sm text-dozo-teal font-semibold hover:underline">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to results
      </button>
      
      <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Image Gallery */}
          <div className="lg:col-span-3">
            <div className="aspect-w-1 aspect-h-1">
                <img src={mainImage} alt={product.name} className="w-full h-full object-cover rounded-lg" />
            </div>
            <div className="flex space-x-2 mt-4">
              {product.imageUrl.map(url => (
                <img 
                  key={url} 
                  src={url} 
                  alt="thumbnail" 
                  onClick={() => setMainImage(url)}
                  className={`w-20 h-20 object-cover rounded-md cursor-pointer border-2 transition-all ${mainImage === url ? 'border-dozo-teal' : 'border-transparent hover:border-gray-300'}`} 
                />
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="lg:col-span-2">
            <span className="bg-dozo-teal/10 text-dozo-teal text-xs font-bold px-2.5 py-1 rounded-full">{product.rentalType === RentalType.Daily ? "Dozo Daily" : "Dozo Monthly"}</span>
            <div className="flex justify-between items-start mt-2">
                <h1 className="text-3xl font-bold text-dozo-charcoal flex-1 pr-4">{product.name}</h1>
                <button 
                    onClick={() => setShareModalOpen(true)}
                    className="p-2 text-dozo-gray hover:bg-gray-100 hover:text-dozo-teal rounded-full transition-colors flex-shrink-0"
                    title="Share this item"
                >
                    <Share2 className="w-5 h-5" />
                </button>
            </div>
            <p className="text-dozo-gray mt-4 text-sm leading-relaxed">{product.description}</p>
            
            {/* Pricing & CTA */}
            <div className="mt-6 bg-gray-50 p-6 rounded-lg border">
              <h3 className="font-semibold text-dozo-charcoal mb-4">Choose Your Plan</h3>
              {product.rentalType === RentalType.Daily ? (
                 <div onClick={handleDailySelect} className={`p-4 border-2 rounded-lg cursor-pointer ${selectedPlan === 'daily' ? 'border-dozo-teal bg-dozo-teal/5' : 'border-gray-200 bg-white'}`}>
                    <p className="font-bold text-2xl">₹{product.displayPricing.daily?.toLocaleString('en-IN')}<span className="text-base font-normal text-dozo-gray"> / day</span></p>
                 </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {Object.entries(product.displayPricing.monthly || {}).map(([duration, price]) => (
                    <div key={duration} onClick={() => handleMonthlyPlanSelect(duration as '3'|'6'|'12')} className={`text-center p-3 border-2 rounded-lg cursor-pointer ${selectedPlan === duration ? 'border-dozo-teal bg-dozo-teal/5' : 'border-gray-200 bg-white'}`}>
                      <p className="font-semibold text-sm">{duration} Mo</p>
                      <p className="font-bold text-lg">₹{price.toLocaleString('en-IN')}</p>
                      <p className="text-xs text-dozo-gray">/mo</p>
                    </div>
                  ))}
                </div>
              )}
               <button 
                  onClick={handleRentNowClick}
                  disabled={!selectedPlan}
                  className="mt-6 w-full bg-dozo-teal text-white font-bold py-3 rounded-lg text-base transition-all disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-dozo-charcoal-light">
                Rent Now
              </button>
            </div>
            
            <div className="mt-6">
              <h3 className="font-semibold text-dozo-charcoal text-base mb-3">Specifications</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                {Object.entries(product.specs).map(([key, value]) => (
                  <div key={key} className="border-b pb-1">
                    <span className="font-medium text-gray-500">{key}: </span>
                    <span className="font-semibold text-dozo-charcoal-light">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {checkoutStep > 0 && currentUser && (
        <div className="mt-8">
            {checkoutStep === 1 && <AiDamageGuard product={product} onCheckComplete={(_report) => setCheckoutStep(2)} />}
            {checkoutStep === 2 && renderConfirmationStep()}
            {checkoutStep === 3 && renderSuccess()}
        </div>
      )}

      <ReviewsSection product={product} currentUser={currentUser} onLoginClick={onLoginClick} />

      <ShareModal 
        isOpen={isShareModalOpen}
        onClose={() => setShareModalOpen(false)}
        productName={product.name}
        productUrl={productUrl}
      />
    </div>
  );
};

export default ProductDetailPage;