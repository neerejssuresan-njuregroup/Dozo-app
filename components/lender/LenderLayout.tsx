
import React, { useState } from 'react';
import { Product, User } from '../../types';
import LenderSidebar from './LenderSidebar';
import LenderDashboard from './LenderDashboard';
import LenderProductManagement from './LenderProductManagement';
import LenderOrderManagement from './LenderOrderManagement';

interface LenderLayoutProps {
    allProducts: Product[];
    onRemoveProduct: (productId: string) => void;
    onEditProduct: (product: Product) => void;
    currentUser: User;
    onLogout: () => void;
    goToHome: () => void;
}

export type LenderView = 'dashboard' | 'listings' | 'orders';

const LenderLayout: React.FC<LenderLayoutProps> = (props) => {
    const [activeView, setActiveView] = useState<LenderView>('dashboard');

    const myProducts = props.allProducts.filter(p => p.lenderEmail === props.currentUser.email);

    const renderContent = () => {
        switch(activeView) {
            case 'dashboard':
                return <LenderDashboard myProducts={myProducts} onNavigate={setActiveView} />;
            case 'listings':
                return <LenderProductManagement 
                            myProducts={myProducts} 
                            onEditProduct={props.onEditProduct} 
                            onRemoveProduct={props.onRemoveProduct} 
                        />;
            case 'orders':
                 return <LenderOrderManagement allProducts={props.allProducts} currentUser={props.currentUser} />;
            default:
                return <LenderDashboard myProducts={myProducts} onNavigate={setActiveView} />;
        }
    }

    return (
        <div className="flex h-screen bg-gray-100">
            <LenderSidebar 
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

export default LenderLayout;
