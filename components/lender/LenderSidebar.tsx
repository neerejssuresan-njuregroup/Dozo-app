
import React from 'react';
import { LayoutDashboard, Package, ShoppingCart, LogOut, Home } from 'lucide-react';
import { User } from '../../types';
import { LenderView } from './LenderLayout';

interface LenderSidebarProps {
    activeView: LenderView;
    setActiveView: (view: LenderView) => void;
    currentUser: User;
    onLogout: () => void;
    goToHome: () => void;
}

const NavItem: React.FC<{
    icon: React.ElementType;
    label: string;
    view: LenderView;
    activeView: LenderView;
    onClick: (view: LenderView) => void;
}> = ({ icon: Icon, label, view, activeView, onClick }) => (
    <button
        onClick={() => onClick(view)}
        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
            activeView === view
                ? 'bg-dozo-teal text-white shadow'
                : 'text-gray-300 hover:bg-dozo-charcoal-light hover:text-white'
        }`}
    >
        <Icon className="h-5 w-5" />
        <span className="font-semibold text-sm">{label}</span>
    </button>
);

const LenderSidebar: React.FC<LenderSidebarProps> = ({ activeView, setActiveView, currentUser, onLogout, goToHome }) => {
    return (
        <aside className="w-64 bg-dozo-charcoal text-white flex flex-col p-4 space-y-2">
            <div className="px-4 pb-4 border-b border-gray-700">
                <h2 className="text-2xl font-extrabold text-dozo-teal">dozo</h2>
                <span className="text-xs text-gray-400">My Dashboard</span>
            </div>

            <nav className="flex-1 mt-4 space-y-2">
                <NavItem icon={LayoutDashboard} label="Dashboard" view="dashboard" activeView={activeView} onClick={setActiveView} />
                <NavItem icon={Package} label="My Listings" view="listings" activeView={activeView} onClick={setActiveView} />
                <NavItem icon={ShoppingCart} label="My Orders" view="orders" activeView={activeView} onClick={setActiveView} />
            </nav>
            
            <div className="space-y-2">
                 <button
                    onClick={goToHome}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-gray-300 hover:bg-dozo-charcoal-light hover:text-white"
                >
                    <Home className="h-5 w-5" />
                    <span className="font-semibold text-sm">View Site</span>
                </button>
                <div className="border-t border-gray-700 pt-3">
                     <div className="flex items-center space-x-3 p-2">
                         <div className="w-9 h-9 bg-dozo-teal rounded-full flex items-center justify-center font-bold text-sm">
                            {currentUser.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-semibold truncate">{currentUser.name}</p>
                            <p className="text-xs text-gray-400">Lender</p>
                        </div>
                         <button onClick={onLogout} className="text-gray-400 hover:text-white p-2" title="Log Out">
                            <LogOut className="h-5 w-5" />
                        </button>
                     </div>
                </div>
            </div>
        </aside>
    );
};

export default LenderSidebar;