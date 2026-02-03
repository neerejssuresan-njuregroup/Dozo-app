
import React from 'react';
import { X, User as UserIcon, Mail, ShieldCheck } from 'lucide-react';

interface AdminUser {
    name: string;
    email: string;
    kycVerified: boolean;
    emailVerified: boolean;
    isAdmin: boolean;
}

interface UserDetailsModalProps {
    user: AdminUser | null;
    onClose: () => void;
}

const DetailRow: React.FC<{ label: string, value: string | React.ReactNode, icon: React.ElementType }> = ({ label, value, icon: Icon }) => (
    <div className="flex items-start">
        <Icon className="w-5 h-5 text-dozo-gray mr-3 mt-1 flex-shrink-0" />
        <div>
            <p className="text-sm text-dozo-gray">{label}</p>
            <p className="font-semibold text-dozo-charcoal">{value}</p>
        </div>
    </div>
);


const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ user, onClose }) => {
    if (!user) return null;
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md relative animate-fade-in-up">
                <div className="flex justify-between items-center p-5 border-b">
                    <h2 className="text-xl font-bold text-dozo-charcoal">User Details</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>
                <div className="p-6 space-y-6">
                    <div className="flex items-center">
                         <div className="w-16 h-16 bg-dozo-teal rounded-full flex items-center justify-center font-bold text-2xl text-white mr-4">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-dozo-charcoal">{user.name}</p>
                            <p className="text-sm text-dozo-gray">{user.isAdmin ? 'Administrator' : 'User'}</p>
                        </div>
                    </div>
                    <div className="space-y-4 pt-4 border-t">
                        <DetailRow label="Email Address" value={user.email} icon={Mail} />
                        <DetailRow 
                            label="Email Verification" 
                            value={user.emailVerified 
                                ? <span className="text-green-600 font-bold">Verified</span> 
                                : <span className="text-yellow-600 font-bold">Pending</span>}
                            icon={ShieldCheck} 
                        />
                        <DetailRow 
                            label="KYC Status" 
                            value={user.kycVerified 
                                ? <span className="text-green-600 font-bold">Verified</span> 
                                : <span className="text-yellow-600 font-bold">Not Verified</span>}
                            icon={ShieldCheck} 
                        />
                    </div>
                </div>
                 <div className="p-4 bg-gray-50 border-t text-right">
                    <button onClick={onClose} className="bg-dozo-charcoal text-white font-bold py-2 px-6 rounded-md hover:bg-opacity-90">Close</button>
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

export default UserDetailsModal;
