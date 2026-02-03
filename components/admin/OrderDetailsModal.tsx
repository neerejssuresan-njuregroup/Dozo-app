
import React from 'react';
import { X, Package, User, Calendar, IndianRupee, Percent } from 'lucide-react';
import { Order, Product } from '../../types';

interface OrderDetailsModalProps {
    order: Order | null;
    product: Product | undefined;
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

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ order, product, onClose }) => {
    if (!order || !product) return null;
    
    const platformFee = order.totalPrice - order.lenderEarnings;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg relative animate-fade-in-up">
                <div className="flex justify-between items-center p-5 border-b">
                    <div>
                        <h2 className="text-xl font-bold text-dozo-charcoal">Order Details</h2>
                        <p className="text-xs font-mono text-dozo-gray">{order.id}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>
                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                    {/* Product Section */}
                    <section>
                         <h3 className="text-lg font-semibold text-dozo-charcoal-light mb-4 border-b pb-2">Product Information</h3>
                         <div className="flex items-center">
                            <img src={product.imageUrl[0]} alt={product.name} className="w-24 h-24 object-cover rounded-md mr-4"/>
                            <div className="space-y-2">
                                <DetailRow label="Product Name" value={product.name} icon={Package} />
                                <DetailRow label="Lender Email" value={product.lenderEmail} icon={User} />
                            </div>
                         </div>
                    </section>
                    
                    {/* Renter & Dates Section */}
                    <section>
                        <h3 className="text-lg font-semibold text-dozo-charcoal-light mb-4 border-b pb-2">Rental Information</h3>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <DetailRow label="Renter Name" value={order.renterName} icon={User} />
                            <DetailRow label="Renter Email" value={order.userEmail} icon={User} />
                            <DetailRow label="Start Date" value={order.startDate} icon={Calendar} />
                            <DetailRow label="End Date" value={order.endDate} icon={Calendar} />
                         </div>
                    </section>
                    
                     {/* Financial Section */}
                    <section>
                        <h3 className="text-lg font-semibold text-dozo-charcoal-light mb-4 border-b pb-2">Financial Breakdown</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <DetailRow label="Total Rental Price" value={`₹${order.totalPrice.toLocaleString('en-IN')}`} icon={IndianRupee} />
                           <DetailRow label="Commission Rate" value={`${(product.commissionRate * 100).toFixed(0)}%`} icon={Percent} />
                           <DetailRow label="Lender Earnings" value={<span className="text-green-600 font-bold">₹{order.lenderEarnings.toLocaleString('en-IN')}</span>} icon={IndianRupee} />
                           <DetailRow label="Platform Fee" value={`₹${platformFee.toLocaleString('en-IN')}`} icon={IndianRupee} />
                        </div>
                    </section>
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

export default OrderDetailsModal;
