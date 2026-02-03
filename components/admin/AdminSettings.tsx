
import React, { useState } from 'react';

interface AdminSettingsProps {
    onSetAnnouncement: (text: string | null) => void;
    currentAnnouncement: string | null;
}

const AdminSettings: React.FC<AdminSettingsProps> = ({ onSetAnnouncement, currentAnnouncement }) => {
    const [announcementText, setAnnouncementText] = useState(currentAnnouncement || '');

    const handlePublishAnnouncement = () => {
        onSetAnnouncement(announcementText);
        alert("Announcement published!");
    }

    const handleClearAnnouncement = () => {
        onSetAnnouncement(null);
        setAnnouncementText('');
        alert("Announcement cleared!");
    }

    return (
        <section className="space-y-6">
            <h1 className="text-3xl font-extrabold text-dozo-charcoal">Platform Settings</h1>
            <div className="bg-white p-6 rounded-lg shadow-sm border space-y-4 max-w-2xl">
                <div>
                    <h2 className="text-xl font-bold text-dozo-charcoal-light">Global Announcement Banner</h2>
                    <label htmlFor="announcement" className="block text-sm font-medium text-gray-700 mt-2">Banner Text</label>
                    <textarea 
                        id="announcement"
                        rows={3}
                        value={announcementText}
                        onChange={(e) => setAnnouncementText(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-dozo-teal focus:ring-dozo-teal"
                        placeholder="e.g., Scheduled maintenance on Sunday at 2 AM."
                    />
                </div>
                <div className="flex space-x-3">
                     <button onClick={handlePublishAnnouncement} className="bg-dozo-teal text-white font-bold py-2 px-5 rounded-md hover:bg-opacity-90">
                        Publish / Update
                    </button>
                    <button onClick={handleClearAnnouncement} className="bg-dozo-charcoal text-white font-bold py-2 px-5 rounded-md hover:bg-opacity-90">
                        Clear Announcement
                    </button>
                </div>
            </div>
        </section>
    );
};

export default AdminSettings;
