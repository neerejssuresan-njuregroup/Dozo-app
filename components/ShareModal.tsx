
import React, { useState } from 'react';
import { X, Share2, Copy, Check, MessageCircle, Twitter, Facebook } from 'lucide-react';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    productName: string;
    productUrl: string;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, productName, productUrl }) => {
    const [isCopied, setIsCopied] = useState(false);

    const shareText = `Check out this ${productName} on Dozo!`;

    const socialLinks = {
        whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + productUrl)}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`,
        twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(productUrl)}&text=${encodeURIComponent(shareText)}`,
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(productUrl).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm relative animate-fade-in-up">
                <div className="flex justify-between items-center p-5 border-b">
                    <h2 className="text-xl font-bold text-dozo-charcoal flex items-center">
                        <Share2 className="w-5 h-5 mr-2" />
                        Share this item
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>
                <div className="p-6 space-y-5">
                    <p className="text-sm text-dozo-gray">Share a link to this product with your friends or on social media.</p>
                    
                    <div className="flex justify-around items-center pt-2 pb-4">
                        <a href={socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center space-y-2 text-gray-600 hover:text-green-500 transition-colors">
                            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center"><MessageCircle size={28} /></div>
                            <span className="text-xs font-medium">WhatsApp</span>
                        </a>
                         <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center space-y-2 text-gray-600 hover:text-blue-600 transition-colors">
                            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center"><Facebook size={28} /></div>
                            <span className="text-xs font-medium">Facebook</span>
                        </a>
                         <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center space-y-2 text-gray-600 hover:text-sky-500 transition-colors">
                            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center"><Twitter size={28} /></div>
                            <span className="text-xs font-medium">Twitter</span>
                        </a>
                    </div>

                    <div className="flex items-center space-x-2 bg-gray-50 border rounded-md p-2">
                        <input 
                            type="text" 
                            value={productUrl} 
                            readOnly 
                            className="flex-1 bg-transparent text-sm text-dozo-gray outline-none"
                        />
                        <button 
                            onClick={handleCopy}
                            className={`flex-shrink-0 flex items-center justify-center w-24 px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${
                                isCopied 
                                ? 'bg-green-500 text-white' 
                                : 'bg-dozo-teal text-white hover:bg-opacity-90'
                            }`}
                        >
                            {isCopied ? <><Check size={16} className="mr-1.5" /> Copied!</> : <><Copy size={16} className="mr-1.5" /> Copy</>}
                        </button>
                    </div>
                </div>
            </div>
             <style>{`
                @keyframes fade-in-up {
                    0% { opacity: 0; transform: translateY(20px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default ShareModal;
