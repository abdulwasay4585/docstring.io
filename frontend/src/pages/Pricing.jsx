import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Pricing = () => {
    const navigate = useNavigate();

    const [showBetaModal, setShowBetaModal] = React.useState(false);

    const handleUpgrade = (plan) => {
        setShowBetaModal(true);
    };

    return (
        <div className="min-h-screen bg-transparent text-white py-20 px-4">
            <div className="max-w-7xl mx-auto text-center relative">
                <button
                    onClick={() => navigate('/')}
                    className="absolute top-0 left-0 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="hidden sm:inline">Back</span>
                </button>
                <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
                <p className="text-gray-400 mb-12">Start for free, upgrade when you need more power.</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Free Tier */}
                    <div className="bg-slate-900/70 backdrop-blur-md rounded-2xl p-8 border border-slate-700/50 hover:border-slate-500/50 transition duration-300">
                        <h2 className="text-2xl font-semibold mb-2">Free</h2>
                        <div className="text-4xl font-bold mb-4">$0<span className="text-lg text-gray-400 font-normal">/mo</span></div>
                        <p className="text-gray-400 mb-6">Perfect for hobbyists.</p>
                        <ul className="text-left space-y-4 mb-8 text-gray-300">
                            <li className="flex items-center"><span className="text-green-400 mr-2">✓</span> 50 docs/day</li>
                            <li className="flex items-center"><span className="text-green-400 mr-2">✓</span> Basic Python support</li>
                            <li className="flex items-center"><span className="text-green-400 mr-2">✓</span> Community support</li>
                        </ul>
                        <button
                            className="w-full py-3 rounded-lg border border-gray-600 hover:bg-gray-700 transition font-semibold"
                            onClick={() => navigate('/')}
                        >
                            Get Started
                        </button>
                    </div>

                    {/* Pro Tier */}
                    <div className="bg-slate-900/70 backdrop-blur-md rounded-2xl p-8 border-2 border-indigo-500 transform scale-105 relative shadow-2xl">
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-indigo-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                            Most Popular
                        </div>
                        <h2 className="text-2xl font-semibold mb-2">Pro</h2>
                        <div className="text-4xl font-bold mb-4">$15<span className="text-lg text-gray-400 font-normal">/mo</span></div>
                        <p className="text-gray-400 mb-6">Best for individuals.</p>
                        <ul className="text-left space-y-4 mb-8 text-gray-300">
                            <li className="flex items-center"><span className="text-indigo-400 mr-2">✓</span> Unlimited docs</li>
                            <li className="flex items-center"><span className="text-indigo-400 mr-2">✓</span> All languages (Py, JS, Go)</li>
                            <li className="flex items-center"><span className="text-indigo-400 mr-2">✓</span> Priority email support</li>
                        </ul>
                        <button
                            className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition font-bold"
                            onClick={() => handleUpgrade('Pro')}
                        >
                            Upgrade Now
                        </button>
                    </div>

                    {/* Enterprise Tier */}
                    <div className="bg-slate-900/70 backdrop-blur-md rounded-2xl p-8 border border-slate-700/50 hover:border-slate-500/50 transition duration-300 relative">
                        <div className="absolute top-4 right-4 bg-green-900 text-green-300 text-xs px-2 py-1 rounded">Save 15% for Teams</div>
                        <h2 className="text-2xl font-semibold mb-2">Enterprise</h2>
                        <div className="text-4xl font-bold mb-4">Custom</div>
                        <p className="text-gray-400 mb-6">For scalable teams.</p>
                        <ul className="text-left space-y-4 mb-8 text-gray-300">
                            <li className="flex items-center"><span className="text-indigo-400 mr-2">✓</span> SSO & Security Audit</li>
                            <li className="flex items-center"><span className="text-indigo-400 mr-2">✓</span> Custom IDE plugins</li>
                            <li className="flex items-center"><span className="text-indigo-400 mr-2">✓</span> Dedicated Success Manager</li>
                        </ul>
                        <button
                            className="w-full py-3 rounded-lg border border-gray-600 hover:bg-gray-700 transition font-semibold"
                            onClick={() => { window.location.href = 'mailto:sales@docstring.io'; }}
                        >
                            Contact Sales
                        </button>
                    </div>
                </div>
            </div>
            {/* Beta Feature Modal */}
            {showBetaModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200">
                        <div className="text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-900/50 mb-4">
                                <span className="text-2xl">🚧</span>
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">Feature in Beta</h3>
                            <p className="text-slate-300 text-sm mb-6">
                                Our payment system is currently in beta. We are working hard to bring you a seamless upgrade experience.
                            </p>
                            <button
                                onClick={() => setShowBetaModal(false)}
                                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
                            >
                                Got it
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Pricing;
