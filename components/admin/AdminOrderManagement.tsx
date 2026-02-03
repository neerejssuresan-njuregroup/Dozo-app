import React, { useState, useEffect } from 'react';
import { Order, Product } from '../../types';
import * as sheetService from '../../services/googleSheetsService';
import { CheckCircle, XCircle, RefreshCw, Clock, Eye } from 'lucide-react';
import OrderDetailsModal from './OrderDetailsModal';

interface AdminOrderManagementProps {
    allProducts: Product[];
}

const getStatusBadge = (status: Order['status']) => {
    switch (status) {
        case 'pending':
            return <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center w-fit"><Clock size={12} className="mr-1"/>Pending</span>;
        case 'active':
            return <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center w-fit"><CheckCircle size={12} className="mr-1"/>Active</span>;
        case 'completed':
            return <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full w-fit">Completed</span>;
        case 'rejected':
            return <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center w-fit"><XCircle size={12} className="mr-1"/>Rejected</span>;
    }
}

const AdminOrderManagement: React.FC<AdminOrderManagementProps> = ({ allProducts }) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    const fetchOrders = async () => {
        setIsLoading(true);
        const fetchedOrders = await sheetService.getOrders();
        setOrders(fetchedOrders.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()));
        setIsLoading(false);
    }

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
        const success = await sheetService.updateOrderStatus(orderId, newStatus);
        if (success) {
            setOrders(prevOrders => prevOrders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        } else {
            alert("Failed to update order status.");
        }
    };

    const getProduct = (productId: string) => {
        return allProducts.find(p => p.id === productId);
    }

    if (isLoading) {
        return <div className="flex justify-center items-center h-full"><RefreshCw className="w-8 h-8 animate-spin text-dozo-teal" /></div>
    }

    return (
         <section className="space-y-6">
            <h1 className="text-3xl font-extrabold text-dozo-charcoal">Order Management</h1>
             <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="overflow-x-auto max-h-[75vh]">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-100 text-dozo-charcoal sticky top-0">
                            <tr>
                                <th className="p-3 font-semibold">Order ID</th>
                                <th className="p-3 font-semibold">Product</th>
                                <th className="p-3 font-semibold">User</th>
                                <th className="p-3 font-semibold">Dates</th>
                                <th className="p-3 font-semibold">Status</th>
                                <th className="p-3 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order.id} className="border-b hover:bg-gray-50">
                                    <td className="p-3 font-mono text-xs">{order.id}</td>
                                    {/* FIX: Changed getProductName to getProduct to correctly display the product name. */}
                                    <td className="p-3 font-medium">{getProduct(order.productId)?.name || 'Unknown'}</td>
                                    <td className="p-3">{order.renterName}<br/><span className="text-xs text-dozo-gray">{order.userEmail}</span></td>
                                    <td className="p-3 text-xs">{order.startDate} to {order.endDate}</td>
                                    <td className="p-3">{getStatusBadge(order.status)}</td>
                                    <td className="p-3 text-right">
                                        <div className="flex justify-end items-center space-x-2">
                                            <button onClick={() => setSelectedOrder(order)} className="text-dozo-charcoal hover:text-dozo-teal p-1.5 rounded-md hover:bg-gray-100"><Eye size={16}/></button>
                                            {order.status === 'pending' && (
                                                <>
                                                    <button onClick={() => handleStatusUpdate(order.id, 'active')} className="bg-green-100 text-green-700 hover:bg-green-200 text-xs font-bold py-1 px-2 rounded-md">Accept</button>
                                                    <button onClick={() => handleStatusUpdate(order.id, 'rejected')} className="bg-red-100 text-red-700 hover:bg-red-200 text-xs font-bold py-1 px-2 rounded-md">Reject</button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
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

export default AdminOrderManagement;