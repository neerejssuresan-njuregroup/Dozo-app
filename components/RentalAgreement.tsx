
import React, { useState, useEffect, useRef } from 'react';
import { Product, User } from '../types';
import { FileText, Upload, Camera, CheckCircle, X, User as UserIcon, Check } from 'lucide-react';

interface RentalAgreementProps {
    product: Product;
    user: User;
    onAgreementChange: (isAgreed: boolean) => void;
}

interface CameraModalProps {
    onClose: () => void;
    onCapture: (imageDataUrl: string) => void;
}

const CameraModal: React.FC<CameraModalProps> = ({ onClose, onCapture }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);

    useEffect(() => {
        const startCamera = async () => {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }
                setStream(mediaStream);
            } catch (err) {
                console.error("Camera error:", err);
                alert("Could not access camera. Please check permissions.");
                onClose();
            }
        };

        startCamera();

        return () => {
            stream?.getTracks().forEach(track => track.stop());
        };
    }, []);

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const canvas = canvasRef.current;
            const video = videoRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d')?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            onCapture(canvas.toDataURL('image/jpeg'));
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg relative">
                <div className="p-4 border-b">
                    <h3 className="text-lg font-semibold">Live Photo Capture</h3>
                </div>
                <div className="p-4">
                    <video ref={videoRef} autoPlay muted playsInline className="w-full h-auto rounded-md bg-gray-200"></video>
                    <canvas ref={canvasRef} className="hidden"></canvas>
                </div>
                <div className="p-4 border-t flex justify-between">
                     <button onClick={onClose} className="bg-gray-200 text-dozo-charcoal font-semibold py-2 px-4 rounded-md">Cancel</button>
                    <button onClick={handleCapture} className="bg-dozo-teal text-white font-bold py-2 px-6 rounded-md flex items-center">
                        <Camera size={18} className="mr-2"/>
                        Capture
                    </button>
                </div>
            </div>
        </div>
    );
};


const RentalAgreement: React.FC<RentalAgreementProps> = ({ product, user, onAgreementChange }) => {
    const [isChecked, setIsChecked] = useState(false);
    const [idImage, setIdImage] = useState<string | null>(null);
    const [livePhoto, setLivePhoto] = useState<string | null>(null);
    const [typedSignature, setTypedSignature] = useState('');
    const [isCameraOpen, setIsCameraOpen] = useState(false);

    useEffect(() => {
        if (isChecked && idImage && livePhoto && typedSignature.trim() !== '') {
            onAgreementChange(true);
        } else {
            onAgreementChange(false);
        }
    }, [isChecked, idImage, livePhoto, typedSignature, onAgreementChange]);

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setIsChecked(e.target.checked);
    };

    const handleIdImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setIdImage(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="bg-white p-6 md:p-8 rounded-lg border">
            <h3 className="text-2xl font-bold text-dozo-charcoal mb-4 flex items-center">
                <FileText className="w-7 h-7 mr-3 text-dozo-teal"/>
                Digital Rental Agreement
            </h3>
            <div className="prose prose-sm max-w-none bg-gray-50 p-4 rounded-md border h-48 overflow-y-auto text-dozo-gray">
                <h4>1. Parties Involved</h4>
                <p>This Digital Rental Agreement ("Agreement") is made between <strong>Dozo (Njure Group)</strong> ("the Owner") and <strong>{user.name} ({user.email})</strong> ("the Renter").</p>
                <h4>2. The Rented Item</h4>
                <p>The Owner agrees to rent the following item to the Renter: <strong>{product.name}</strong>.</p>
                <h4>3. Condition of Item</h4>
                <p>The Renter acknowledges that the initial condition of the item has been documented by the AI Damage Guard system. The Renter agrees to maintain the item in the same condition as received, allowing for reasonable wear and tear.</p>
                <h4>4. Responsibility and Liability</h4>
                <p>The Renter assumes full responsibility for the item during the rental period. In the event of significant damage, loss, or theft, the Renter will be liable for repair or replacement costs up to the item's estimated value of <strong>₹{product.estimatedValue?.toLocaleString('en-IN') || 'N/A'}</strong>.</p>
                <h4>5. Return of Item</h4>
                <p>The Renter must return the item on or before the agreed-upon end date. A final condition check will be performed upon return.</p>
            </div>
            
            <div className="mt-6">
                <label className="flex items-start cursor-pointer p-2 rounded-md hover:bg-gray-50">
                    <input type="checkbox" checked={isChecked} onChange={handleCheckboxChange} className="h-5 w-5 rounded border-gray-300 text-dozo-teal focus:ring-dozo-teal mt-0.5"/>
                    <span className="ml-3 text-dozo-charcoal font-medium">I have read, understood, and agree to the terms of this rental agreement.</span>
                </label>
            </div>

            <div className={`mt-6 border-t pt-6 space-y-6 transition-opacity ${isChecked ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                 <h4 className="text-xl font-bold text-dozo-charcoal">Digital Signature & Acceptance</h4>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                    {/* ID Upload */}
                    <div className="space-y-2">
                        <label className="font-semibold flex items-center">1. Upload ID Document {idImage && <CheckCircle className="w-5 h-5 text-green-500 ml-2"/>}</label>
                        <input type="file" id="id-upload" onChange={handleIdImageChange} className="hidden"/>
                        <label htmlFor="id-upload" className="cursor-pointer bg-gray-50 border-2 border-dashed rounded-lg p-4 flex items-center justify-center text-center h-24">
                            {idImage ? <img src={idImage} className="max-h-full" alt="ID Preview"/> : <span className="text-sm text-dozo-gray flex items-center"><Upload className="w-4 h-4 mr-2"/> Click to upload ID</span>}
                        </label>
                    </div>
                    {/* Live Photo */}
                    <div className="space-y-2">
                         <label className="font-semibold flex items-center">2. Capture Live Photo {livePhoto && <CheckCircle className="w-5 h-5 text-green-500 ml-2"/>}</label>
                        <div className="bg-gray-50 border-2 border-dashed rounded-lg p-4 flex items-center justify-center text-center h-24">
                           {livePhoto ? <img src={livePhoto} className="max-h-full rounded-full" alt="Live photo"/> : 
                            <button type="button" onClick={() => setIsCameraOpen(true)} className="text-sm text-dozo-gray flex items-center"><Camera className="w-4 h-4 mr-2"/> Click to open camera</button>}
                        </div>
                    </div>
                    {/* Typed Signature */}
                     <div className="space-y-2">
                        <label htmlFor="signature" className="font-semibold flex items-center">3. Type Full Name {typedSignature && <CheckCircle className="w-5 h-5 text-green-500 ml-2"/>}</label>
                        <input id="signature" type="text" value={typedSignature} onChange={e => setTypedSignature(e.target.value)} placeholder="Your full legal name" className="w-full h-24 rounded-md border-gray-300 shadow-sm text-center text-xl font-serif italic"/>
                    </div>
                 </div>
            </div>
            {isCameraOpen && <CameraModal onClose={() => setIsCameraOpen(false)} onCapture={(img) => { setLivePhoto(img); setIsCameraOpen(false); }}/>}
        </div>
    );
};

export default RentalAgreement;