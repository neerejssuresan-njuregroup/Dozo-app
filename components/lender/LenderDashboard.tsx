
import React, { useState, useEffect, useMemo } from 'react';
import { Product, Order } from '../../types';
import { DollarSign, Package, ShoppingCart, BarChart2, Eye } from 'lucide-react';
import * as sheetService from '../../services/googleSheetsService';
import { LenderView } from './LenderLayout';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ElementType;
    color: string;
    onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, onClick }) => (
    <button onClick={onClick} disabled={!onClick} className={`bg-white p-5 rounded-lg shadow-sm border flex items-start text-left w-full ${onClick ? 'hover:shadow-md hover:-translate-y-1 transition-all' : ''}`}>
        <div className={`p-3 rounded-full mr-4 ${color}`}>
            <Icon className="h-6 w-6 text-white" />
        </div>
        <div>
            <p className="text-sm font-medium text-dozo-gray">{title}</p>
            <p className="text-3xl font-extrabold text-dozo-charcoal">{value}</p>
        </div>
    </button>
);

interface Activity {
    text: string;
    timestamp: Date;
}

interface LenderDashboardProps {
    myProducts: Product[];
    onNavigate: (view: LenderView) => void;
}

const LenderDashboard: React.FC<LenderDashboardProps> = ({ myProducts, onNavigate }) => {
    const [myOrders, setMyOrders] = useState<Order[]>([]);
    const [activities, setActivities] = useState<Activity[]>([]);

    const myProductIds = useMemo(() => myProducts.map(p => p.id), [myProducts]);

    useEffect(() => {
        const fetchOrders = async () => {
            const allOrders = await sheetService.getOrders();
            const filteredOrders = allOrders.filter(o => myProductIds.includes(o.productId));
            setMyOrders(filteredOrders);
        };
        fetchOrders();
    }, [myProductIds]);

    useEffect(() => {
        if (myProducts.length === 0) return;

        const intervalId = setInterval(() => {
            const randomProduct = myProducts[Math.floor(Math.random() * myProducts.length)];
            const newActivity: Activity = { text: `Someone is viewing your ${randomProduct.name}`, timestamp: new Date() };
            setActivities(prev => [newActivity, ...prev].slice(0, 10));
        }, 7000); // Slower simulation for more realism

        return () => clearInterval(intervalId);
    }, [myProducts]);

    const activeRentals = useMemo(() => myOrders.filter(o => o.status === 'active').length, [myOrders]);
    const totalEarnings = useMemo(() => myOrders.reduce((acc, o) => acc + o.lenderEarnings, 0), [myOrders]);
    
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-extrabold text-dozo-charcoal">My Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <StatCard title="Total Earnings" value={`₹${totalEarnings.toLocaleString('en-IN')}`} icon={DollarSign} color="bg-green-500" onClick={() => onNavigate('orders')} />
                <StatCard title="Active Rentals" value={activeRentals} icon={ShoppingCart} color="bg-blue-500" onClick={() => onNavigate('orders')} />
                <StatCard title="My Listings" value={myProducts.length} icon={Package} color="bg-yellow-500" onClick={() => onNavigate('listings')} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <div className="lg:col-span-2 bg-white p-5 rounded-lg shadow-sm border">
                    <h3 className="font-bold text-dozo-charcoal mb-4">Earnings Breakdown (Placeholder)</h3>
                    <div className="flex items-center justify-center h-64 bg-gray-50 rounded-md">
                        <BarChart2 className="w-16 h-16 text-gray-300"/>
                        <p className="text-gray-400 ml-4">A chart of your earnings over time will be shown here.</p>
                    </div>
                </div>
                 <div className="bg-white p-5 rounded-lg shadow-sm border">
                    <h3 className="font-bold text-dozo-charcoal mb-4 flex items-center">
                        <Eye className="w-5 h-5 mr-2 text-dozo-teal"/>
                        Live Activity
                    </h3>
                     <ul className="space-y-3 h-64 overflow-y-auto">
                        {activities.length > 0 ? activities.map((activity, index) => (
                             <li key={index} className="flex items-start text-sm">
                               <div className="w-5 h-5 bg-teal-100 rounded-full mr-3 mt-0.5 flex-shrink-0">
                                   <Eye className="w-3 h-3 m-auto text-dozo-teal"/>
                               </div>
                               <div>
                                    <p className="text-dozo-charcoal">{activity.text}</p>
                                    <p className="text-xs text-gray-400">{activity.timestamp.toLocaleTimeString()}</p>
                               </div>
                            </li>
                        )) : (
                            <div className="flex items-center justify-center h-full text-center text-gray-400 italic">
                                <p>No activity yet. Share your listings to get views!</p>
                            </div>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default LenderDashboard;
