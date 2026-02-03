
import React from 'react';
import { Megaphone, X } from 'lucide-react';

interface AnnouncementBannerProps {
    announcementText: string;
    onDismiss: () => void;
}

const AnnouncementBanner: React.FC<AnnouncementBannerProps> = ({ announcementText, onDismiss }) => {
    return (
        <div className="bg-dozo-charcoal text-white w-full z-50">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Megaphone className="w-5 h-5 text-dozo-teal flex-shrink-0" />
                    <p className="text-sm font-medium">{announcementText}</p>
                </div>
                <button onClick={onDismiss} className="p-1 rounded-full hover:bg-white/10">
                    <X className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default AnnouncementBanner;
