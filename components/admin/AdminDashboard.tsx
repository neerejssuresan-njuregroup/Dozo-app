
import React, { useState, useEffect, useMemo } from 'react';
import { Product, Order } from '../../types';
import { Users, Package, ShoppingCart, BarChart2, Zap, TrendingUp, UserPlus, Eye } from 'lucide-react';
import * as sheetService from '../../services/googleSheetsService';
import { categories } from '../../data/mockData';
import { AdminView } from './AdminLayout';

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
    type: 'newUser' | 'newOrder';
    user?: { name: string, email: string };
    order?: Order;
    productName?: string;
    timestamp: Date;
}

const RevenueChart: React.FC = () => {
    const data = [
        { name: 'Jan', revenue: 4000 }, { name: 'Feb', revenue: 3000 }, { name: 'Mar', revenue: 5000 },
        { name: 'Apr', revenue: 4500 }, { name: 'May', revenue: 6000 }, { name: 'Jun', revenue: 5500 }
    ];
    const maxRevenue = Math.max(...data.map(d => d.revenue), 0);

    return (
        <div className="h-full flex flex-col">
             <h3 className="font-bold text-dozo-charcoal mb-4">Revenue Over Time</h3>
             <div className="flex-grow flex items-end space-x-4 pl-8 pr-4 pb-4 bg-gray-50 rounded-md">
                {data.map(item => (
                    <div key={item.name} className="flex-1 flex flex-col items-center">
                        <div 
                            className="w-full bg-dozo-teal rounded-t-md hover:bg-dozo-charcoal-light transition-colors"
                            style={{ height: `${(item.revenue / maxRevenue) * 100}%` }}
                            title={`₹${item.revenue.toLocaleString()}`}
                        />
                        <span className="text-xs font-medium text-dozo-gray mt-2">{item.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

interface AdminDashboardProps {
    allProducts: Product[];
    onNavigate: (view: AdminView) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ allProducts, onNavigate }) => {
    const [totalUsers, setTotalUsers] = useState(0);
    const [activeRentals, setActiveRentals] = useState(0);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [orders, setOrders] = useState<Order[]>([]);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [isLive, setIsLive] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const fetchedUsers = await sheetService.getUsers();
            const fetchedOrders = await sheetService.getOrders();
            
            setTotalUsers(fetchedUsers.length);
            setOrders(fetchedOrders);
            
             // Seed with some initial realistic activity
            const initialOrder = fetchedOrders.find(o => o.productId === 'p1');
            if (initialOrder) {
                 setActivities([
                    { type: 'newOrder', order: initialOrder, productName: allProducts.find(p => p.id === initialOrder.productId)?.name, timestamp: new Date() },
                    { type: 'newUser', user: { name: 'Sunita Menon', email: 'sunita.m@example.com'}, timestamp: new Date(Date.now() - 50000) },
                ]);
            }
        };
        fetchData();
    }, [allProducts]);

    useEffect(() => {
        const active = orders.filter(o => o.status === 'active').length;
        const revenue = orders.reduce((acc, o) => acc + o.totalPrice, 0);
        setActiveRentals(active);
        setTotalRevenue(revenue);
    }, [orders]);
    
    useEffect(() => {
        if (!isLive) return;

        const intervalId = setInterval(() => {
            if (Math.random() > 0.6) { 
                const newUser = sheetService.simulateNewUser();
                setTotalUsers(prev => prev + 1);
                const newActivity: Activity = { type: 'newUser', user: newUser, timestamp: new Date() };
                setActivities(prev => [newActivity, ...prev].slice(0, 10));
            } else {
                const newOrder = sheetService.simulateNewOrder();
                if (newOrder) {
                    const product = allProducts.find(p => p.id === newOrder.productId);
                    setOrders(prev => [...prev, newOrder]);
                    const newActivity: Activity = { type: 'newOrder', order: newOrder, productName: product?.name, timestamp: new Date() };
                    setActivities(prev => [newActivity, ...prev].slice(0, 10));
                }
            }
        }, 5000);

        return () => clearInterval(intervalId);
    }, [isLive, allProducts]);

    const rentalsByCategory = useMemo(() => {
        const categoryCounts = categories.reduce((acc, cat) => ({...acc, [cat.id]: { name: cat.name, count: 0 }}), {} as Record<string, {name: string, count: number}>);
        
        orders.forEach(order => {
            const product = allProducts.find(p => p.id === order.productId);
            if (product && categoryCounts[product.categoryId]) {
                categoryCounts[product.categoryId].count++;
            }
        });
        return Object.values(categoryCounts);
    }, [orders, allProducts]);

    const maxCount = Math.max(...rentalsByCategory.map(c => c.count), 1);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-extrabold text-dozo-charcoal">Dashboard</h1>
                <div className="flex items-center">
                    <span className={`relative flex h-3 w-3 mr-2`}>
                        {isLive && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>}
                        <span className={`relative inline-flex rounded-full h-3 w-3 ${isLive ? 'bg-red-500' : 'bg-gray-400'}`}></span>
                    </span>
                    <span className="mr-3 text-sm font-medium">{isLive ? 'Live' : 'Paused'}</span>
                    <button onClick={() => setIsLive(!isLive)} className="text-xs bg-white border px-3 py-1 rounded-full font-semibold hover:bg-gray-50">
                        {isLive ? 'Pause' : 'Go Live'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard title="Total Users" value={totalUsers} icon={Users} color="bg-blue-500" onClick={() => onNavigate('users')}/>
                <StatCard title="Active Rentals" value={activeRentals} icon={ShoppingCart} color="bg-green-500" onClick={() => onNavigate('orders')} />
                <StatCard title="Total Products" value={allProducts.length} icon={Package} color="bg-yellow-500" onClick={() => onNavigate('inventory')} />
                <StatCard title="Total Revenue" value={`₹${totalRevenue.toLocaleString('en-IN')}`} icon={BarChart2} color="bg-purple-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-5 rounded-lg shadow-sm border">
                   <RevenueChart />
                </div>
                 <div className="bg-white p-5 rounded-lg shadow-sm border">
                    <h3 className="font-bold text-dozo-charcoal mb-4 flex items-center">
                        <Zap className="w-5 h-5 mr-2 text-yellow-500"/>
                        Live Activity
                    </h3>
                    <ul className="space-y-3 h-[300px] overflow-y-auto">
                        {activities.map((activity, index) => (
                             <li key={index} className="flex items-start text-sm">
                               <div className={`w-5 h-5 rounded-full mr-3 mt-0.5 flex-shrink-0 ${activity.type === 'newUser' ? 'bg-blue-100' : 'bg-green-100'}`}>
                                    {activity.type === 'newUser' ? 
                                        <UserPlus className="w-3 h-3 m-auto text-blue-600"/> :
                                        <ShoppingCart className="w-3 h-3 m-auto text-green-600"/>
                                    }
                               </div>
                               <div>
                                    {activity.type === 'newUser' ? (
                                        <p className="text-dozo-charcoal">
                                            New user <button onClick={() => onNavigate('users')} className="font-semibold hover:underline">{activity.user?.name}</button> signed up.
                                        </p>
                                    ) : (
                                        <p className="text-dozo-charcoal">
                                            <button onClick={() => onNavigate('orders')} className="font-semibold hover:underline">{activity.productName || 'An item'}</button> rented by {activity.order?.renterName}. <button onClick={() => onNavigate('orders')} className="text-xs text-dozo-gray hover:underline">({activity.order?.id})</button>
                                        </p>
                                    )}
                                    <p className="text-xs text-gray-400">{activity.timestamp.toLocaleTimeString()}</p>
                               </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
             <div className="bg-white p-5 rounded-lg shadow-sm border">
                    <h3 className="font-bold text-dozo-charcoal mb-4">Rentals by Category</h3>
                    <div className="space-y-3">
                        {rentalsByCategory.map((cat) => (
                             <div key={cat.name} className="flex items-center">
                                <span className="w-28 text-sm text-dozo-gray font-medium">{cat.name}</span>
                                <div className="flex-1 bg-gray-200 rounded-full h-5 mr-3">
                                    <div className="bg-dozo-teal h-5 rounded-full text-white text-xs flex items-center justify-end pr-2" style={{ width: `${(cat.count / maxCount) * 100}%` }}>
                                        {cat.count > 0 && cat.count}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
        </div>
    );
};

export default AdminDashboard;
