
import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import * as authService from '../../services/authService';
import { ShieldCheck, ShieldOff, UserPlus, X, Eye } from 'lucide-react';
import UserDetailsModal from './UserDetailsModal';

interface AdminUser {
    name: string;
    email: string;
    kycVerified: boolean;
    emailVerified: boolean;
    isAdmin: boolean;
}

interface AdminUserManagementProps {
    currentUser: User;
}

const AdminUserManagement: React.FC<AdminUserManagementProps> = ({ currentUser }) => {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
    const [isAddAdminModalOpen, setAddAdminModalOpen] = useState(false);

    const fetchUsers = () => {
        setUsers(authService.getDisplayUsers());
    }

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleKycToggle = (email: string, currentStatus: boolean) => {
        authService.updateUserKycStatus(email, !currentStatus);
        setUsers(users.map(u => u.email === email ? { ...u, kycVerified: !currentStatus } : u));
    };

    return (
        <section className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-extrabold text-dozo-charcoal">User Management</h1>
                <button onClick={() => setAddAdminModalOpen(true)} className="flex items-center bg-dozo-teal text-white font-semibold py-2 px-4 rounded-md hover:bg-opacity-90">
                    <UserPlus size={16} className="mr-2"/>
                    Add Admin
                </button>
            </div>
            
             <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="overflow-x-auto max-h-[75vh]">
                    <table className="w-full text-sm text-left">
                         <thead className="bg-gray-100 text-dozo-charcoal sticky top-0">
                            <tr>
                                <th className="p-3 font-semibold">Name</th>
                                <th className="p-3 font-semibold">Email</th>
                                <th className="p-3 font-semibold">Role</th>
                                <th className="p-3 font-semibold">Email Status</th>
                                <th className="p-3 font-semibold">KYC Status</th>
                                <th className="p-3 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.email} className="border-b hover:bg-gray-50">
                                    <td className="p-3 font-semibold">{user.name}</td>
                                    <td className="p-3">{user.email}</td>
                                    <td className="p-3">
                                        {user.isAdmin ?
                                            <span className="font-bold text-dozo-teal">Admin</span> :
                                            <span>User</span>
                                        }
                                    </td>
                                    <td className="p-3">
                                        {user.emailVerified ? 
                                            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">Verified</span> : 
                                            <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">Unverified</span>}
                                    </td>
                                    <td className="p-3">
                                        {user.kycVerified ? 
                                            <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">Verified</span> : 
                                            <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">Not Verified</span>}
                                    </td>
                                    <td className="p-3 text-right">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button onClick={() => setSelectedUser(user)} className="text-dozo-charcoal hover:text-dozo-teal p-1.5 rounded-md hover:bg-gray-100"><Eye size={16}/></button>
                                            {!user.isAdmin && (
                                                <button onClick={() => handleKycToggle(user.email, user.kycVerified)} className={`flex items-center text-xs font-semibold py-1 px-3 rounded-md transition-colors ${user.kycVerified ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}>
                                                    {user.kycVerified ? <><ShieldOff size={14} className="mr-1.5"/> Revoke KYC</> : <><ShieldCheck size={14} className="mr-1.5"/> Verify KYC</>}
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {isAddAdminModalOpen && 
                <AddAdminModal 
                    currentUser={currentUser}
                    onClose={() => setAddAdminModalOpen(false)} 
                    onAdminAdded={fetchUsers}
                />
            }
            {selectedUser && (
                <UserDetailsModal 
                    user={selectedUser}
                    onClose={() => setSelectedUser(null)}
                />
            )}
        </section>
    );
};


const AddAdminModal: React.FC<{onClose: () => void; onAdminAdded: () => void; currentUser: User;}> = ({ onClose, onAdminAdded, currentUser }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        const result = authService.createAdmin(email, password, currentUser);
        if (result.success) {
            setSuccess(result.message);
            onAdminAdded();
            setTimeout(() => {
                onClose();
            }, 2000);
        } else {
            setError(result.message);
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
             <div className="bg-white rounded-lg shadow-xl w-full max-w-md relative">
                 <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <X size={24} />
                </button>
                 <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <h2 className="text-2xl font-bold text-dozo-charcoal">Create New Admin</h2>
                    {error && <p className="text-red-600 bg-red-50 p-3 rounded-md text-sm">{error}</p>}
                    {success && <p className="text-green-600 bg-green-50 p-3 rounded-md text-sm">{success}</p>}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Admin Email</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-dozo-teal focus:ring-dozo-teal" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-dozo-teal focus:ring-dozo-teal" />
                    </div>
                    <div className="flex justify-end space-x-3">
                         <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                        <button type="submit" className="bg-dozo-teal text-white font-bold py-2 px-6 rounded-md hover:bg-opacity-90">Create Admin</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminUserManagement;
