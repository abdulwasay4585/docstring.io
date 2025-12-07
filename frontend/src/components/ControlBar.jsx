import { useNavigate, Link } from 'react-router-dom';
import { Play, Loader2, Lock, LogOut, Shield } from 'lucide-react';

const ControlBar = ({ language, setLanguage, style, setStyle, onGenerate, isGenerating, isProUser, userGenerationsCount, userPlan }) => {
    const navigate = useNavigate();

    return (
        <div className="h-auto py-4 md:py-0 md:h-16 bg-slate-950/70 backdrop-blur-md border-b border-slate-800/50 flex flex-col md:flex-row items-center justify-between px-4 z-30 gap-4 md:gap-0">
            <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                <div className="flex flex-col w-full md:w-auto">
                    <label className="text-xs text-slate-500 font-medium mb-1">Language</label>
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="bg-slate-800 text-slate-200 text-sm rounded-lg border border-slate-700 px-4 py-2 hover:border-slate-600 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary w-full md:min-w-[140px] appearance-none cursor-pointer transition-colors shadow-sm"
                    >
                        <option value="python">Python</option>
                        <option value="javascript" disabled={!isProUser}>
                            JavaScript {!isProUser ? '(Pro)' : ''}
                        </option>
                        <option value="go" disabled={!isProUser}>
                            Go {!isProUser ? '(Pro)' : ''}
                        </option>
                    </select>
                </div>

                <div className="flex flex-col w-full md:w-auto">
                    <label className="text-xs text-slate-500 font-medium mb-1">Style</label>
                    <select
                        value={style}
                        onChange={(e) => setStyle(e.target.value)}
                        className="bg-slate-800 text-slate-200 text-sm rounded-lg border border-slate-700 px-4 py-2 hover:border-slate-600 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary w-full md:min-w-[140px] appearance-none cursor-pointer transition-colors shadow-sm"
                    >
                        <option value="Google">Google</option>
                        <option value="NumPy">NumPy</option>
                        <option value="Sphinx">Sphinx</option>
                        <option value="JSDoc">JSDoc</option>
                    </select>
                </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                {/* Plan Usage Indicator - Only show for logged-in users on free plan */}
                {localStorage.getItem('token') && (!userPlan || userPlan === 'free') && (
                    <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto text-sm text-slate-300 font-medium">
                        <span className="text-center md:text-left">{userGenerationsCount !== undefined ? `${userGenerationsCount}/50 Daily Limit` : 'Daily Limit Active'}</span>
                        <button
                            onClick={() => navigate('/pricing')}
                            className="flex items-center justify-center gap-2 px-6 py-2 bg-primary hover:bg-blue-600 active:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-lg shadow-primary/25 transition-all text-xs w-full md:w-auto"
                        >
                            <Lock className="w-4 h-4" /> Upgrade
                        </button>
                    </div>
                )}

                <button
                    onClick={onGenerate}
                    disabled={isGenerating}
                    className="flex items-center justify-center gap-2 px-6 py-2 bg-primary hover:bg-blue-600 active:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-lg shadow-primary/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto"
                >
                    {isGenerating ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <Play className="w-4 h-4 fill-current" />
                            Generate
                        </>
                    )}
                </button>

                {/* Auth Buttons (Desktop) */}
                <div className="hidden md:flex items-center gap-3 border-l border-slate-700 pl-4 ml-2">
                    {!localStorage.getItem('token') ? (
                        <>
                            <Link to="/login" className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold rounded-lg border border-slate-700 transition-all">
                                Login
                            </Link>
                            <Link to="/register" className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold rounded-lg border border-slate-700 transition-all">
                                Sign Up
                            </Link>
                        </>
                    ) : (
                        <div className="flex items-center gap-3">
                            {localStorage.getItem('role') === 'admin' && (
                                <Link to="/admin" className="flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white border border-transparent text-sm font-semibold rounded-lg shadow-lg shadow-purple-600/20 transition-all">
                                    <Shield className="w-4 h-4" />
                                    Admin
                                </Link>
                            )}
                            <button onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('role'); window.location.reload(); }} className="flex items-center gap-2 px-6 py-2 bg-red-600 hover:bg-red-700 text-white border border-transparent text-sm font-semibold rounded-lg shadow-lg shadow-red-600/20 transition-all">
                                <LogOut className="w-4 h-4" />
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ControlBar;
