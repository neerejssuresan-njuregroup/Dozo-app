
import React from 'react';
import { Product } from '../../types';
import { Trash2, Pencil, Percent } from 'lucide-react';

interface LenderProductManagementProps {
    myProducts: Product[];
    onRemoveProduct: (productId: string) => void;
    onEditProduct: (product: Product) => void;
}

const LenderProductManagement: React.FC<LenderProductManagementProps> = ({ myProducts, onRemoveProduct, onEditProduct }) => {
     const handleProductRemove = (productId: string) => {
        if(window.confirm("Are you sure you want to permanently delete this listing? This action cannot be undone.")) {
            onRemoveProduct(productId);
        }
    }
    
    const getPriceDisplay = (product: Product) => {
        if (product.lenderPricing.daily) {
          return `₹${product.lenderPricing.daily.toLocaleString('en-IN')} / day`;
        }
        if (product.lenderPricing.monthly) {
          return `₹${product.lenderPricing.monthly['12'].toLocaleString('en-IN')} / mo`;
        }
        return 'N/A';
    };

    return (
        <section className="space-y-6">
            <h1 className="text-3xl font-extrabold text-dozo-charcoal">My Listings</h1>
            <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="overflow-x-auto max-h-[75vh]">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-100 text-dozo-charcoal sticky top-0">
                            <tr>
                                <th className="p-3 font-semibold">Product Name</th>
                                <th className="p-3 font-semibold">Asking Price</th>
                                <th className="p-3 font-semibold">Quality</th>
                                <th className="p-3 font-semibold">Commission</th>
                                <th className="p-3 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {myProducts.length > 0 ? myProducts.map(product => (
                                <tr key={product.id} className="border-b hover:bg-gray-50">
                                    <td className="p-3 font-medium">{product.name}</td>
                                    <td className="p-3 font-semibold">{getPriceDisplay(product)}</td>
                                    <td className="p-3">
                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${product.aiAssessedQuality === 'Excellent' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {product.aiAssessedQuality}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        <span className="flex items-center text-xs font-semibold bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full w-fit">
                                            <Percent size={12} className="mr-1"/> {(product.commissionRate * 100).toFixed(0)}%
                                        </span>
                                    </td>
                                    <td className="p-3 text-right">
                                        <div className="flex justify-end items-center space-x-3">
                                            <button onClick={() => onEditProduct(product)} className="text-dozo-teal hover:text-dozo-charcoal transition-colors" title="Edit Listing">
                                                <Pencil size={16} />
                                            </button>
                                            <button onClick={() => handleProductRemove(product.id)} className="text-red-500 hover:text-red-700 transition-colors" title="Delete Listing">
                                               <Trash2 size={16}/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-12 text-gray-500 italic">
                                        You haven't listed any items yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
};

export default LenderProductManagement;