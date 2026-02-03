
import React, { useState } from 'react';
import { X, Mail, Lock } from 'lucide-react';
import { User } from '../types';
import * as authService from '../services/authService';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoginSuccess: (user: User) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
    const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
    const [authStep, setAuthStep] = useState<'form' | 'verify'>('form');
    const [verificationToken, setVerificationToken] = useState<string | null>(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const resetForm = () => {
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setError('');
        setSuccessMessage('');
        setAuthStep('form');
        setVerificationToken(null);
    }
    
    const handleCloseAndReset = () => {
        resetForm();
        setActiveTab('login');
        onClose();
    }

    const handleSignUp = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }

        const result = authService.signUp(email, password);

        if (result.success && result.token) {
            setVerificationToken(result.token);
            setAuthStep('verify');
        } else {
            setError(result.message);
        }
    };
    
    const handleVerification = () => {
        if (!verificationToken) return;
        const result = authService.verifyEmail(verificationToken);
        if (result.success) {
            setSuccessMessage(result.message);
            resetForm();
            setActiveTab('login');
        } else {
            setError(result.message);
            setAuthStep('form');
        }
    };


    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        const result = authService.login(email, password);
        
        if (result.success && result.user) {
            onLoginSuccess(result.user);
        } else {
            setError(result.message);
        }
    };

    if (!isOpen) return null;
    
    const renderContent = () => {
        if (authStep === 'verify') {
             return (
                <div className="text-center p-8 space-y-4">
                    <Mail className="w-16 h-16 text-green-500 mx-auto"/>
                    <h2 className="text-2xl font-bold text-dozo-charcoal">Verify Your Email</h2>
                    <p className="text-dozo-gray">A verification link has been sent to <strong>{email}</strong>. Please check your inbox to activate your account.</p>
                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded-md text-sm mt-4">
                        <strong>For Demonstration:</strong> Since no email is actually sent in this demo, click the button below to simulate verifying your email.
                    </div>
                    <button onClick={handleVerification} className="w-full bg-green-600 text-white font-bold py-3 rounded-md hover:bg-opacity-90 transition-colors text-lg mt-4">
                        Verify Email Now
                    </button>
                    <button onClick={() => { setAuthStep('form'); setError(''); }} className="text-sm text-dozo-gray hover:underline mt-2">
                        Entered the wrong email?
                    </button>
                </div>
            );
        }

        return (
            <>
                <div className="flex border-b mb-6">
                    <button 
                        onClick={() => { setActiveTab('login'); resetForm(); }} 
                        className={`flex-1 py-3 text-lg font-semibold transition-colors ${activeTab === 'login' ? 'text-dozo-teal border-b-2 border-dozo-teal' : 'text-dozo-gray'}`}
                    >
                        Log In
                    </button>
                    <button 
                        onClick={() => { setActiveTab('signup'); resetForm(); }}
                        className={`flex-1 py-3 text-lg font-semibold transition-colors ${activeTab === 'signup' ? 'text-dozo-teal border-b-2 border-dozo-teal' : 'text-dozo-gray'}`}
                    >
                        Sign Up
                    </button>
                </div>

                {error && <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm">{error}</div>}
                {successMessage && <div className="bg-green-100 text-green-700 p-3 rounded-md mb-4 text-sm">{successMessage}</div>}

                {activeTab === 'login' ? (
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-dozo-teal" />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-dozo-teal" />
                        </div>
                        <button type="submit" className="w-full bg-dozo-teal text-white font-bold py-3 rounded-md hover:bg-opacity-90 transition-colors text-lg">
                            Log In
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleSignUp} className="space-y-6">
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-dozo-teal" />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input type="password" placeholder="Password (min. 6 characters)" value={password} onChange={e => setPassword(e.target.value)} required className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-dozo-teal" />
                        </div>
                            <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-dozo-teal" />
                        </div>
                        <button type="submit" className="w-full bg-dozo-teal text-white font-bold py-3 rounded-md hover:bg-opacity-90 transition-colors text-lg">
                            Create Account
                        </button>
                    </form>
                )}
            </>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md relative animate-fade-in-up">
                <button onClick={handleCloseAndReset} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <X size={24} />
                </button>
                <div className="p-8">
                    {renderContent()}
                </div>
            </div>
            <style>{`
                @keyframes fade-in-up {
                    0% {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default AuthModal;