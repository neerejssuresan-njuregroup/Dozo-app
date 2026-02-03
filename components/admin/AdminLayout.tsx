
import React, { useState } from 'react';
import { Product, User } from '../../types';
import AdminSidebar from './AdminSidebar';
import AdminDashboard from './AdminDashboard';
import AdminProductManagement from './AdminProductManagement';
import AdminOrderManagement from './AdminOrderManagement';
import AdminUserManagement from './AdminUserManagement';
import AdminSettings from './AdminSettings';


interface AdminLayoutProps {
    allProducts: Product[];
    onRemoveProduct: (productId: string) => void;
    onSetAnnouncement: (text: string | null) => void;
    currentAnnouncement: string | null;
    onEditProduct: (product: Product) => void;
    currentUser: User;
    onLogout: () => void;
    goToHome: () => void;
}

export type AdminView = 'dashboard' | 'orders' | 'inventory' | 'users' | 'settings';

const AdminLayout: React.FC<AdminLayoutProps> = (props) => {
    const [activeView, setActiveView] = useState<AdminView>('dashboard');

    const renderContent = () => {
        switch(activeView) {
            case 'dashboard':
                return <AdminDashboard allProducts={props.allProducts} onNavigate={setActiveView} />;
            case 'orders':
                return <AdminOrderManagement allProducts={props.allProducts} />;
            case 'inventory':
                return <AdminProductManagement 
                            allProducts={props.allProducts} 
                            onEditProduct={props.onEditProduct} 
                            onRemoveProduct={props.onRemoveProduct} 
                        />;
            case 'users':
                return <AdminUserManagement currentUser={props.currentUser} />;
            case 'settings':
                return <AdminSettings 
                            currentAnnouncement={props.currentAnnouncement} 
                            onSetAnnouncement={props.onSetAnnouncement} 
                        />;
            default:
                return <AdminDashboard allProducts={props.allProducts} onNavigate={setActiveView} />;
        }
    }

    return (
        <div className="flex h-screen bg-gray-100">
            <AdminSidebar 
                activeView={activeView} 
                setActiveView={setActiveView} 
                currentUser={props.currentUser}
                onLogout={props.onLogout}
                goToHome={props.goToHome}
            />
            <main className="flex-1 overflow-y-auto p-6 md:p-8">
                {renderContent()}
            </main>
        </div>
    );
};

export default AdminLayout;
