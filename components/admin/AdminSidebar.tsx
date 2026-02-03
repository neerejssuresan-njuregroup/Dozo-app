
import React from 'react';
import { LayoutDashboard, ShoppingCart, Package, Users, Settings, LogOut, Home } from 'lucide-react';
import { User } from '../../types';
import { AdminView } from './AdminLayout';

interface AdminSidebarProps {
    activeView: AdminView;
    setActiveView: (view: AdminView) => void;
    currentUser: User;
    onLogout: () => void;
    goToHome: () => void;
}

const NavItem: React.FC<{
    icon: React.ElementType;
    label: string;
    view: AdminView;
    activeView: AdminView;
    onClick: (view: AdminView) => void;
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

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeView, setActiveView, currentUser, onLogout, goToHome }) => {
    return (
        <aside className="w-64 bg-dozo-charcoal text-white flex flex-col p-4 space-y-2">
            <div className="px-4 pb-4 border-b border-gray-700">
                <h2 className="text-2xl font-extrabold text-dozo-teal">dozo</h2>
                <span className="text-xs text-gray-400">Admin Panel</span>
            </div>

            <nav className="flex-1 mt-4 space-y-2">
                <NavItem icon={LayoutDashboard} label="Dashboard" view="dashboard" activeView={activeView} onClick={setActiveView} />
                <NavItem icon={ShoppingCart} label="Orders" view="orders" activeView={activeView} onClick={setActiveView} />
                <NavItem icon={Package} label="Inventory" view="inventory" activeView={activeView} onClick={setActiveView} />
                <NavItem icon={Users} label="Users" view="users" activeView={activeView} onClick={setActiveView} />
                <NavItem icon={Settings} label="Settings" view="settings" activeView={activeView} onClick={setActiveView} />
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
                            <p className="text-xs text-gray-400">Super Admin</p>
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

export default AdminSidebar;