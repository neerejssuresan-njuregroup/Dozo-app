import React, { useState, useEffect } from 'react';
import { X, UploadCloud, RefreshCw, Plus, Trash2, Wand2 } from 'lucide-react';
import { Category, Product, RentalType } from '../types';
import * as geminiService from '../services/geminiService';

interface ListItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (productData: Omit<Product, 'id' | 'reviews' | 'lenderEmail' | 'commissionRate' | 'estimatedValue'>, productId?: string) => void;
    categories: Category[];
    productToEdit: Product | null;
    isSaving: boolean;
}

const ListItemModal: React.FC<ListItemModalProps> = ({ isOpen, onClose, onSave, categories, productToEdit, isSaving }) => {
    const isEditMode = !!productToEdit;

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageBase64, setImageBase64] = useState<string | null>(null);
    const [categoryId, setCategoryId] = useState('');
    const [rentalType, setRentalType] = useState<RentalType>(RentalType.Daily);
    const [dailyPrice, setDailyPrice] = useState('');
    const [monthly3, setMonthly3] = useState('');
    const [monthly6, setMonthly6] = useState('');
    const [monthly12, setMonthly12] = useState('');
    const [specs, setSpecs] = useState<{key: string, value: string}[]>([{ key: '', value: '' }]);
    
    const [analysisState, setAnalysisState] = useState<'idle' | 'analyzing' | 'done'>('idle');
    const [aiAssessedQuality, setAiAssessedQuality] = useState<'Standard' | 'Excellent'>('Standard');


    const resetForm = () => {
        setName('');
        setDescription('');
        setImagePreview(null);
        setImageBase64(null);
        setCategoryId('');
        setRentalType(RentalType.Daily);
        setDailyPrice('');
        setMonthly3('');
        setMonthly6('');
        setMonthly12('');
        setSpecs([{ key: '', value: '' }]);
        setAnalysisState('idle');
        setAiAssessedQuality('Standard');
    }

    useEffect(() => {
        if (isOpen) {
            if (productToEdit) {
                setName(productToEdit.name);
                setDescription(productToEdit.description);
                setImagePreview(productToEdit.imageUrl[0] || null);
                setCategoryId(productToEdit.categoryId);
                setRentalType(productToEdit.rentalType);
                setDailyPrice(productToEdit.lenderPricing.daily?.toString() || '');
                setMonthly3(productToEdit.lenderPricing.monthly?.['3']?.toString() || '');
                setMonthly6(productToEdit.lenderPricing.monthly?.['6']?.toString() || '');
                setMonthly12(productToEdit.lenderPricing.monthly?.['12']?.toString() || '');
                const currentSpecs = Object.entries(productToEdit.specs).map(([key, value]) => ({ key, value }));
                setSpecs(currentSpecs.length > 0 ? currentSpecs : [{ key: '', value: '' }]);
                setAiAssessedQuality(productToEdit.aiAssessedQuality);
                setAnalysisState('done');
            } else {
                resetForm();
            }
        }
    }, [productToEdit, isOpen]);

    const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const result = reader.result as string;
                setImagePreview(result);
                const b64 = result.split(',')[1];
                setImageBase64(b64);
                
                setAnalysisState('analyzing');
                const analysis = await geminiService.analyzeProductForListing(b64, categories);
                
                setName(analysis.name);
                setDescription(analysis.description);
                const specsArray = Object.entries(analysis.specs).map(([key, value]) => ({ key, value }));
                setSpecs(specsArray.length ? specsArray : [{ key: '', value: '' }]);
                setCategoryId(analysis.categoryId);
                setAiAssessedQuality(analysis.quality);
                setAnalysisState('done');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSpecChange = (index: number, field: 'key' | 'value', value: string) => {
        const newSpecs = [...specs];
        newSpecs[index][field] = value;
        setSpecs(newSpecs);
    };

    const addSpecField = () => {
        setSpecs([...specs, { key: '', value: '' }]);
    };
    
    const removeSpecField = (index: number) => {
        setSpecs(specs.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const lenderPricing = rentalType === RentalType.Daily 
            ? { daily: Number(dailyPrice) } 
            : { monthly: { '3': Number(monthly3), '6': Number(monthly6), '12': Number(monthly12) } };

        // FIX: Add displayPricing to match the expected type for onSave.
        // The parent component will recalculate this based on AI quality assessment.
        const displayPricing = JSON.parse(JSON.stringify(lenderPricing));

        const productData = {
            name,
            description,
            categoryId,
            imageUrl: imagePreview ? [imagePreview] : [],
            rentalType,
            specs: specs.reduce((acc, spec) => {
                if (spec.key && spec.value) acc[spec.key] = spec.value;
                return acc;
            }, {} as Record<string, string>),
            lenderPricing,
            displayPricing,
            aiAssessedQuality,
        };

        onSave(productData, productToEdit?.id);
    };
    
    const renderContent = () => {
        if (analysisState === 'idle' && !isEditMode) {
             return (
                <div className="p-8 text-center">
                     <label htmlFor="item-upload" className="relative cursor-pointer bg-gray-50 hover:bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-10 flex flex-col items-center justify-center text-center">
                        <Wand2 className="w-12 h-12 text-dozo-teal mb-3" />
                        <span className="text-xl font-bold text-dozo-charcoal">Upload a Photo to Start</span>
                        <span className="text-base text-dozo-gray mt-2">Our AI will analyze your item to auto-fill the details for you.</span>
                    </label>
                    <input id="item-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} required={!isEditMode} />
                </div>
            );
        }
        
        if(analysisState === 'analyzing') {
            return (
                <div className="p-8 text-center flex flex-col items-center justify-center min-h-[400px]">
                    <RefreshCw className="w-12 h-12 text-dozo-teal animate-spin mb-4" />
                    <span className="text-xl font-bold text-dozo-charcoal">AI is analyzing your item...</span>
                    <span className="text-base text-dozo-gray mt-2">Generating name, description, and assessing quality.</span>
                </div>
            );
        }

        return (
             <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Item Name</label>
                                <input type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-dozo-teal focus:ring-dozo-teal" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea rows={4} value={description} onChange={e => setDescription(e.target.value)} required className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-dozo-teal focus:ring-dozo-teal"></textarea>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Category</label>
                                <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-dozo-teal focus:ring-dozo-teal">
                                    <option value="" disabled>Select a category</option>
                                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                </select>
                            </div>
                        </div>
                        {/* Right Column */}
                        <div className="space-y-4">
                           <label className="block text-sm font-medium text-gray-700">Item Photo</label>
                           <img src={imagePreview!} alt="Item preview" className="rounded-md object-contain border max-h-48" />
                            <div>
                                <label className="block text-sm font-medium text-gray-700">AI Quality Assessment</label>
                                 <span className={`mt-1 inline-block text-sm font-semibold px-3 py-1 rounded-full ${aiAssessedQuality === 'Excellent' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                    {aiAssessedQuality}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="border-t pt-6 space-y-4">
                        <h3 className="text-lg font-semibold text-dozo-charcoal">Set Your Asking Price</h3>
                        <div className="flex space-x-4">
                            <label className="flex items-center">
                                <input type="radio" name="rentalType" value={RentalType.Daily} checked={rentalType === RentalType.Daily} onChange={() => setRentalType(RentalType.Daily)} className="h-4 w-4 text-dozo-teal focus:ring-dozo-teal"/>
                                <span className="ml-2">Daily</span>
                            </label>
                            <label className="flex items-center">
                                <input type="radio" name="rentalType" value={RentalType.Monthly} checked={rentalType === RentalType.Monthly} onChange={() => setRentalType(RentalType.Monthly)} className="h-4 w-4 text-dozo-teal focus:ring-dozo-teal"/>
                                <span className="ml-2">Monthly</span>
                            </label>
                        </div>
                        {rentalType === RentalType.Daily ? (
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Daily Rate (₹)</label>
                                <input type="number" value={dailyPrice} onChange={e => setDailyPrice(e.target.value)} required className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-dozo-teal focus:ring-dozo-teal" />
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">3 Months (₹/mo)</label>
                                    <input type="number" value={monthly3} onChange={e => setMonthly3(e.target.value)} required className="mt-1 w-full rounded-md border-gray-300 shadow-sm"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">6 Months (₹/mo)</label>
                                    <input type="number" value={monthly6} onChange={e => setMonthly6(e.target.value)} required className="mt-1 w-full rounded-md border-gray-300 shadow-sm"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">12 Months (₹/mo)</label>
                                    <input type="number" value={monthly12} onChange={e => setMonthly12(e.target.value)} required className="mt-1 w-full rounded-md border-gray-300 shadow-sm"/>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="border-t pt-6 space-y-4">
                        <h3 className="text-lg font-semibold text-dozo-charcoal">Specifications (AI-Generated)</h3>
                        {specs.map((spec, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <input type="text" placeholder="e.g., Color" value={spec.key} onChange={e => handleSpecChange(index, 'key', e.target.value)} className="w-full rounded-md border-gray-300 shadow-sm" />
                                <input type="text" placeholder="e.g., Charcoal Gray" value={spec.value} onChange={e => handleSpecChange(index, 'value', e.target.value)} className="w-full rounded-md border-gray-300 shadow-sm" />
                                <button type="button" onClick={() => removeSpecField(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-full">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                        <button type="button" onClick={addSpecField} className="flex items-center text-sm font-semibold text-dozo-teal hover:underline">
                            <Plus size={16} className="mr-1"/> Add Specification
                        </button>
                    </div>

                    <div className="pt-6 border-t flex justify-end">
                        <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 mr-3">Cancel</button>
                        <button type="submit" disabled={isSaving} className="bg-dozo-teal text-white font-bold py-2 px-6 rounded-md hover:bg-dozo-charcoal-light transition-colors text-base flex items-center justify-center min-w-[120px] disabled:bg-gray-400">
                           {isSaving ? <RefreshCw className="w-5 h-5 animate-spin" /> : (isEditMode ? 'Save Changes' : 'List Item')}
                        </button>
                    </div>
                </form>
        );
    }


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl relative animate-fade-in-up max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-2xl font-bold text-dozo-charcoal">{isEditMode ? 'Edit Your Item' : 'List a New Item'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>
                {renderContent()}
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

export default ListItemModal;