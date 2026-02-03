
import React from 'react';
import { Product } from '../../types';
import { Trash2, Pencil } from 'lucide-react';

interface AdminProductManagementProps {
    allProducts: Product[];
    onRemoveProduct: (productId: string) => void;
    onEditProduct: (product: Product) => void;
}

const AdminProductManagement: React.FC<AdminProductManagementProps> = ({ allProducts, onRemoveProduct, onEditProduct }) => {
     const handleProductRemove = (productId: string) => {
        if(window.confirm("Are you sure you want to permanently delete this listing? This action cannot be undone.")) {
            onRemoveProduct(productId);
        }
    }
    return (
        <section className="space-y-6">
            <h1 className="text-3xl font-extrabold text-dozo-charcoal">Inventory Management</h1>
            <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="overflow-x-auto max-h-[75vh]">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-100 text-dozo-charcoal sticky top-0">
                            <tr>
                                <th className="p-3 font-semibold">Product Name</th>
                                <th className="p-3 font-semibold">Lender</th>
                                <th className="p-3 font-semibold">Category</th>
                                <th className="p-3 font-semibold">Rental Type</th>
                                <th className="p-3 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allProducts.map(product => (
                                <tr key={product.id} className="border-b hover:bg-gray-50">
                                    <td className="p-3 font-medium">{product.name}</td>
                                    <td className="p-3 text-xs">{product.lenderEmail}</td>
                                    <td className="p-3 capitalize">{product.categoryId}</td>
                                    <td className="p-3 capitalize">{product.rentalType}</td>
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
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
};

export default AdminProductManagement;