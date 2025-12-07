import React from 'react';
import { AlertTriangle, X, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

const GuestLimitModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl max-w-sm w-full animate-in fade-in zoom-in duration-200">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                            <Lock className="w-5 h-5 text-primary" />
                            Daily Limit Reached
                        </h3>
                        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <p className="text-slate-300 mb-6 text-sm leading-relaxed">
                        You have reached your daily limit of 5 free generations. To continue generating unlimited documentation, please create an account.
                    </p>

                    <div className="flex flex-col gap-3">
                        <Link
                            to="/register"
                            className="w-full px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-md text-sm font-medium transition-colors shadow-lg shadow-blue-900/20 text-center"
                        >
                            Sign Up for Free
                        </Link>
                        <button
                            onClick={onClose}
                            className="w-full px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md text-sm font-medium transition-colors border border-slate-700"
                        >
                            Maybe Later
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GuestLimitModal;
