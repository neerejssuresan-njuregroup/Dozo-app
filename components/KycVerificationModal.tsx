
import React, { useState, useRef, useEffect } from 'react';
import { X, UploadCloud, RefreshCw, CheckCircle, ShieldAlert, Camera, User, FileDigit } from 'lucide-react';
import { verifyIdDocument, verifyLiveIdPhoto } from '../services/geminiService';

interface KycModalProps {
    isOpen: boolean;
    onClose: () => void;
    onVerificationSuccess: () => void;
}

type KycStep = 'uploadId' | 'captureIdPhoto' | 'captureFacePhoto';

const KycVerificationModal: React.FC<KycModalProps> = ({ isOpen, onClose, onVerificationSuccess }) => {
    const [step, setStep] = useState<KycStep>('uploadId');
    
    // ID Upload state
    const [idImagePreview, setIdImagePreview] = useState<string | null>(null);
    const [idImageBase64, setIdImageBase64] = useState<string | null>(null);
    const [analysisMessage, setAnalysisMessage] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [verificationConfidence, setVerificationConfidence] = useState<'High' | 'Medium' | 'Low' | null>(null);
    
    // Live Photo state
    const [liveStream, setLiveStream] = useState<MediaStream | null>(null);
    const [livePhotoPreview, setLivePhotoPreview] = useState<string | null>(null);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);


    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setIdImagePreview(result);
                setIdImageBase64(result.split(',')[1]);
            };
            reader.readAsDataURL(file);
            resetAnalysisState();
        }
    };
    
    const resetAll = () => {
        stopCamera();
        setIdImagePreview(null);
        setLivePhotoPreview(null);
        setCameraError(null);
        setStep('uploadId');
        resetAnalysisState();
    }
    
    const handleClose = () => {
        resetAll();
        onClose();
    }

    const handleAnalyzeId = async () => {
        if (!idImageBase64) return;
        setIsLoading(true);
        setAnalysisMessage('Analyzing your ID...');
        setVerificationConfidence(null);

        const result = await verifyIdDocument(idImageBase64);
        setVerificationConfidence(result.confidence);

        if (result.confidence === 'High') {
            setAnalysisMessage('ID appears valid. Please proceed.');
        } else if (result.confidence === 'Medium') {
            setAnalysisMessage('We need a clearer picture. Please take a live photo of your ID document to continue.');
        } else {
            setAnalysisMessage('Could not verify. Please upload a high-quality image of a valid ID.');
        }
        setIsLoading(false);
    };
    
    const handleAnalyzeLiveIdPhoto = async (base64: string) => {
        setIsLoading(true);
        setAnalysisMessage('Analyzing live ID photo...');
        const isValid = await verifyLiveIdPhoto(base64);
        if(isValid) {
            setStep('captureFacePhoto');
        } else {
            setAnalysisMessage('Could not verify live ID photo. Please try again, or upload a different ID document.');
            setStep('uploadId');
            resetAnalysisState();
            setIdImagePreview(null);
        }
        setIsLoading(false);
        setLivePhotoPreview(null);
    };

    const resetAnalysisState = () => {
        setAnalysisMessage('');
        setVerificationConfidence(null);
    }

    const startCamera = async () => {
        stopCamera();
        setCameraError(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setLiveStream(stream);
        } catch (err) {
            console.error("Error accessing camera:", err);
            setCameraError("Could not access camera. Please enable camera permissions in your browser settings.");
        }
    };

    const stopCamera = () => {
        if (liveStream) {
            liveStream.getTracks().forEach(track => track.stop());
            setLiveStream(null);
        }
    };

    const takePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            const dataUrl = canvas.toDataURL('image/jpeg');
            setLivePhotoPreview(dataUrl);
            stopCamera();

            if(step === 'captureIdPhoto'){
                handleAnalyzeLiveIdPhoto(dataUrl.split(',')[1]);
            }
        }
    };
    
    const retakePhoto = () => {
        setLivePhotoPreview(null);
        // useEffect will trigger startCamera
    };

    useEffect(() => {
        if (isOpen && (step === 'captureFacePhoto' || step === 'captureIdPhoto') && !livePhotoPreview) {
            startCamera();
        } else {
            stopCamera();
        }
        return () => stopCamera();
    }, [isOpen, step, livePhotoPreview]);
    
    const renderUploadIdStep = () => (
        <>
            <h2 className="text-2xl font-bold text-dozo-charcoal mb-2">Step 1: Verify Your ID</h2>
            <p className="text-dozo-gray mb-6">Upload a government-issued ID (e.g., Aadhaar, Driving License).</p>
            <div className="flex flex-col items-center">
                 <label htmlFor="kyc-upload" className="relative cursor-pointer bg-gray-50 hover:bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center h-48 w-full max-w-sm text-center">
                    {idImagePreview ? (
                    <img src={idImagePreview} alt="ID preview" className="max-h-full max-w-full rounded-md object-contain" />
                    ) : (
                    <>
                        <UploadCloud className="w-10 h-10 text-gray-400 mb-2" />
                        <span className="font-semibold text-dozo-teal">Upload ID Photo</span>
                        <span className="text-xs text-gray-500">PNG or JPG</span>
                    </>
                    )}
                </label>
                <input id="kyc-upload" name="kyc-upload" type="file" className="sr-only" accept="image/png, image/jpeg" onChange={handleFileChange} />
                
                {idImagePreview && (
                    <button onClick={handleAnalyzeId} disabled={isLoading || verificationConfidence !== null} className="mt-4 w-full max-w-sm bg-dozo-teal text-white font-semibold py-2 px-4 rounded-md flex items-center justify-center transition-all disabled:bg-gray-400">
                    {isLoading ? <RefreshCw className="w-5 h-5 animate-spin mr-2" /> : 'Analyze & Verify'}
                    </button>
                )}
            </div>
           
            {analysisMessage && (
                <div className={`mt-6 text-center p-4 rounded-lg border ${
                    verificationConfidence === 'High' ? 'bg-green-50 border-green-200 text-green-800' :
                    verificationConfidence === 'Medium' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
                    verificationConfidence === 'Low' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-blue-50 border-blue-200 text-blue-800'
                }`}>
                    <h3 className="font-bold flex items-center justify-center">
                        {isLoading ? <RefreshCw className="w-5 h-5 mr-2 animate-spin"/> :
                         verificationConfidence === 'High' ? <CheckCircle className="w-5 h-5 mr-2"/> :
                         <ShieldAlert className="w-5 h-5 mr-2"/>}
                        {isLoading ? "Analyzing..." : "Analysis Complete"}
                    </h3>
                    <p className="text-sm mt-1">{analysisMessage}</p>

                    {verificationConfidence === 'High' && (
                         <button onClick={() => setStep('captureFacePhoto')} className="mt-3 bg-green-600 text-white font-bold py-2 px-6 rounded-md text-sm">
                            Proceed to Live Photo
                        </button>
                    )}
                     {verificationConfidence === 'Medium' && (
                         <button onClick={() => setStep('captureIdPhoto')} className="mt-3 bg-yellow-500 text-white font-bold py-2 px-6 rounded-md text-sm">
                            Take Live Photo of ID
                        </button>
                    )}
                </div>
            )}
        </>
    );

    const renderCaptureStep = (isFacePhoto: boolean) => (
         <>
            <h2 className="text-2xl font-bold text-dozo-charcoal mb-2">{isFacePhoto ? "Step 2: Live Photo" : "Step 1b: Live ID Photo"}</h2>
            <p className="text-dozo-gray mb-6">{isFacePhoto ? "Take a clear photo of your face. Make sure you are in a well-lit area." : "Please hold your ID card steady and centered in front of the camera."}</p>

            <div className="w-full max-w-sm mx-auto">
                <div className="relative aspect-square bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
                    {cameraError ? (
                        <div className="text-center text-red-600 p-4">
                            <ShieldAlert className="w-8 h-8 mx-auto mb-2"/>{cameraError}
                        </div>
                    ) : livePhotoPreview && !isLoading ? (
                        <img src={livePhotoPreview} alt="Live preview" className="w-full h-full object-cover" />
                    ) : (
                        <>
                            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover"></video>
                            <div className={`absolute inset-0 border-8 border-white/50 rounded-lg ${isFacePhoto ? 'face-mask' : ''}`}></div>
                            {isFacePhoto ? <User className="absolute w-16 h-16 text-white/40"/> : <FileDigit className="absolute w-16 h-16 text-white/40" />}
                            {isLoading && (
                                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white">
                                    <RefreshCw className="w-8 h-8 animate-spin" />
                                    <p className="mt-2 font-semibold">Analyzing...</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
                <canvas ref={canvasRef} className="hidden"></canvas>
                
                <div className="mt-4 flex justify-center space-x-4">
                    {livePhotoPreview && !isLoading ? (
                        <>
                            <button onClick={retakePhoto} className="flex-1 bg-gray-200 text-dozo-charcoal font-bold py-3 rounded-lg">Retake</button>
                            {isFacePhoto && <button onClick={onVerificationSuccess} className="flex-1 bg-green-600 text-white font-bold py-3 rounded-lg">Submit Verification</button>}
                        </>
                    ) : (
                        <button onClick={takePhoto} disabled={!!cameraError || isLoading} className="w-16 h-16 bg-dozo-teal rounded-full flex items-center justify-center text-white disabled:bg-gray-400">
                            <Camera size={32} />
                        </button>
                    )}
                </div>
            </div>
             <button onClick={() => setStep('uploadId')} className="text-sm text-dozo-gray hover:underline mt-6 mx-auto block">Back to ID Upload</button>
        </>
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl relative animate-fade-in-up">
                <button onClick={handleClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <X size={24} />
                </button>
                <div className="p-8">
                    {step === 'uploadId' && renderUploadIdStep()}
                    {step === 'captureIdPhoto' && renderCaptureStep(false)}
                    {step === 'captureFacePhoto' && renderCaptureStep(true)}
                </div>
            </div>
            <style>{`
                @keyframes fade-in-up {
                    0% { opacity: 0; transform: translateY(20px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
                .face-mask {
                    mask: radial-gradient(circle at center, transparent 65%, black 66%);
                    -webkit-mask: radial-gradient(circle at center, transparent 65%, black 66%);
                }
            `}</style>
        </div>
    );
};

export default KycVerificationModal;