
import React, { useState, useEffect, useMemo } from 'react';
import { Order, Product, User } from '../../types';
import * as sheetService from '../../services/googleSheetsService';
import { CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import OrderDetailsModal from '../admin/OrderDetailsModal'; // Reusing the admin modal

interface LenderOrderManagementProps {
    allProducts: Product[];
    currentUser: User;
}

const getStatusBadge = (status: Order['status']) => {
    switch (status) {
        case 'pending':
            return <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center"><Clock size={12} className="mr-1"/>Pending Approval</span>;
        case 'active':
            return <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center"><CheckCircle size={12} className="mr-1"/>Active</span>;
        case 'completed':
            return <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">Completed</span>;
        case 'rejected':
            return <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center"><XCircle size={12} className="mr-1"/>Rejected</span>;
    }
}

const LenderOrderManagement: React.FC<LenderOrderManagementProps> = ({ allProducts, currentUser }) => {
    const [myOrders, setMyOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    const myProductIds = useMemo(() => allProducts.filter(p => p.lenderEmail === currentUser.email).map(p => p.id), [allProducts, currentUser.email]);

    useEffect(() => {
        const fetchOrders = async () => {
            setIsLoading(true);
            const allOrders = await sheetService.getOrders();
            const filteredOrders = allOrders.filter(o => myProductIds.includes(o.productId));
            setMyOrders(filteredOrders.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()));
            setIsLoading(false);
        }
        fetchOrders();
    }, [myProductIds]);
    
    const getProduct = (productId: string) => {
        return allProducts.find(p => p.id === productId);
    }
    
    return (
         <section className="space-y-6">
            <h1 className="text-3xl font-extrabold text-dozo-charcoal">My Rental Orders</h1>
             <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="overflow-x-auto max-h-[75vh]">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-100 text-dozo-charcoal sticky top-0">
                            <tr>
                                <th className="p-3 font-semibold">Product</th>
                                <th className="p-3 font-semibold">Renter</th>
                                <th className="p-3 font-semibold">Dates</th>
                                <th className="p-3 font-semibold">Total Price</th>
                                <th className="p-3 font-semibold">My Earnings</th>
                                <th className="p-3 font-semibold">Status</th>
                                <th className="p-3 font-semibold text-right">Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {myOrders.length > 0 ? myOrders.map(order => (
                                <tr key={order.id} className="border-b hover:bg-gray-50">
                                    <td className="p-3 font-medium">{getProduct(order.productId)?.name || 'Unknown'}</td>
                                    <td className="p-3">{order.renterName}</td>
                                    <td className="p-3 text-xs">{order.startDate} to {order.endDate}</td>
                                    <td className="p-3 font-medium">₹{order.totalPrice.toLocaleString('en-IN')}</td>
                                    <td className="p-3 font-bold text-green-600">₹{order.lenderEarnings.toLocaleString('en-IN')}</td>
                                    <td className="p-3">{getStatusBadge(order.status)}</td>
                                    <td className="p-3 text-right">
                                        <button onClick={() => setSelectedOrder(order)} className="text-dozo-charcoal hover:text-dozo-teal p-1.5 rounded-md hover:bg-gray-100"><Eye size={16}/></button>
                                    </td>
                                </tr>
                            )) : (
                                 <tr>
                                    <td colSpan={7} className="text-center py-12 text-gray-500 italic">
                                        You have no orders for your items yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {selectedOrder && (
                <OrderDetailsModal 
                    order={selectedOrder}
                    product={getProduct(selectedOrder.productId)}
                    onClose={() => setSelectedOrder(null)}
                />
            )}
        </section>
    );
};

export default LenderOrderManagement;
