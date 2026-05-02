import React, { useState, useEffect } from 'react';
import { getMe, signUp, signIn, signOut as apiSignOut, isAuthenticated, AuthUser } from '../lib/api';
import { X, Cloud, LogOut, Loader2, Lock } from 'lucide-react';
import { ToastType } from './Toast';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string, type: ToastType) => void;
}

const CloudSyncModal: React.FC<CloudSyncModalProps> = ({ isOpen, onClose, onShowToast }) => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  
  // Auth Form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    if (isOpen) {
        checkUser();
    }
  }, [isOpen]);

  const checkUser = async () => {
    if (!isAuthenticated()) {
      setUser(null);
      return;
    }
    const { data } = await getMe();
    setUser(data?.user ?? null);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
        if (isSignUp) {
            const { error } = await signUp(email, password);
            if (error) throw new Error(error);
            onShowToast("Account created! You can now log in.", 'success');
            setIsSignUp(false);
            // Reload to re-init auth state
            window.location.reload();
        } else {
            const { data, error } = await signIn(email, password);
            if (error) throw new Error(error);
            setUser(data?.user ?? null);
            onShowToast("Logged in successfully!", 'success');
            onClose();
            // Reload to re-init auth state  
            window.location.reload();
        }
    } catch (err: any) {
        onShowToast(err.message, 'error');
    } finally {
        setLoading(false);
    }
  };

  const handleLogout = async () => {
    apiSignOut();
    setUser(null);
    onShowToast("Logged out", 'info');
    window.location.reload();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-brand-900 text-white p-6 pb-8">
            <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white">
                <X size={20} />
            </button>
            <div className="flex items-center gap-3 mb-2">
                <div className="bg-white/20 p-2 rounded-full">
                    <Cloud size={24} className="text-white" />
                </div>
                <h2 className="text-xl font-bold">Cloud Sync</h2>
            </div>
            <p className="text-brand-100 text-sm">
                Sync your meals and weekly plan across all your devices.
            </p>
        </div>

        {/* Content */}
        <div className="p-6 -mt-4 bg-white rounded-t-2xl">
            
            {user ? (
                /* Logged In State */
                <div className="text-center py-4">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Cloud size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-1">Sync Active</h3>
                    <p className="text-sm text-gray-500 mb-6">Logged in as {user.email}</p>
                    
                    <div className="flex flex-col gap-3">
                        <button 
                            onClick={handleLogout}
                            className="w-full border border-gray-200 text-gray-700 py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 hover:bg-gray-50"
                        >
                            <LogOut size={16} /> Sign Out
                        </button>
                        
                        <div className="text-xs text-brand-600 bg-brand-50 py-1 px-2 rounded-md flex items-center justify-center gap-1">
                            <Lock size={10} /> Connected via Cloud
                        </div>
                    </div>
                </div>
            ) : (
                /* Login / Signup Form */
                <form onSubmit={handleAuth} className="space-y-4">
                    <div className="flex justify-between items-center mb-2">
                         <h3 className="font-bold text-gray-800">{isSignUp ? 'Create Account' : 'Welcome Back'}</h3>
                         <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                            <Lock size={8} /> Connected
                         </span>
                    </div>
                   
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                        <input 
                            type="email" 
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Password</label>
                        <input 
                            type="password" 
                            required
                            minLength={6}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-brand-600 text-white py-3 rounded-xl font-bold hover:bg-brand-700 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading && <Loader2 size={18} className="animate-spin" />}
                        {isSignUp ? 'Sign Up' : 'Log In'}
                    </button>

                    <div className="flex justify-between items-center pt-2">
                        <button 
                            type="button" 
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="text-sm text-gray-500 hover:text-brand-600 font-medium"
                        >
                            {isSignUp ? 'Already have an account? Log In' : 'Need an account? Sign Up'}
                        </button>
                    </div>
                </form>
            )}
        </div>
      </div>
    </div>
  );
};

export default CloudSyncModal;