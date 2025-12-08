import React, { useState, useEffect } from 'react';
import CodeEditor from '../components/CodeEditor';
import ControlBar from '../components/ControlBar';
import OutputViewer from '../components/OutputViewer';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import ConfirmationModal from '../components/ConfirmationModal';
import GuestLimitModal from '../components/GuestLimitModal';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Settings, History, Menu, X, LogOut, Shield } from 'lucide-react';
import API_URL from '../config';

import { motion } from 'framer-motion';

function Home() {
    const navigate = useNavigate();
    const [language, setLanguage] = useState('python');
    const [style, setStyle] = useState('Google');
    const [inputCode, setInputCode] = useState('');
    const [outputDocstring, setOutputDocstring] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');
    const [history, setHistory] = useState([]);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUserDataAndHistory = async () => {
            const token = localStorage.getItem('token');
            const config = token ? { headers: { 'x-auth-token': token } } : {};

            try {
                // Fetch User if token exists
                if (token) {
                    try {
                        const userRes = await axios.get(`${API_URL}/api/auth/me`, config);
                        setUser(userRes.data);
                    } catch (err) {
                        console.error("Failed to fetch user", err);
                        if (err.response && err.response.status === 401) {
                            // Token invalid, clear it
                            localStorage.removeItem('token');
                            navigate('/login');
                            return; // Stop here if auth failed
                        }
                    }
                }

                // Fetch History (always, works for guest too now)
                const historyRes = await axios.get(`${API_URL}/api/generate/history`, config);
                setHistory(historyRes.data);
            } catch (err) {
                console.error("Failed to fetch data", err);
            }
        };

        fetchUserDataAndHistory();
    }, [navigate]);

    const handleGenerate = async () => {
        if (!inputCode.trim()) {
            setError("Please enter some code to generate a docstring.");
            return;
        }

        setIsGenerating(true);
        setError(''); // Clear previous errors

        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            if (token) {
                config.headers['x-auth-token'] = token;
            }
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

            const response = await axios.post(`${API_URL}/api/generate`, {
                code: inputCode,
                language,
                style,
            }, config);

            const { docstring } = response.data;
            setOutputDocstring(docstring);

            // Optimistically update user's generation count if applicable
            if (user && user.plan === 'free') {
                setUser(prevUser => ({
                    ...prevUser,
                    generationsCount: (prevUser.generationsCount || 0) + 1
                }));
            }

            // Add to history
            const newHistoryItem = {
                id: Date.now(), // This will be replaced by _id from backend on actual fetch
                language,
                code: inputCode,
                docstring,
                timestamp: new Date().toISOString(),
            };
            setHistory([newHistoryItem, ...history]);

        } catch (error) {
            console.error("Generation failed", error);
            if (error.response) {
                if (error.response.status === 429) {
                    // Only show Guest Limit Modal if user is NOT logged in
                    if (!localStorage.getItem('token')) {
                        setShowLimitModal(true);
                    } else {
                        // User is logged in but hit a limit (Free tier daily limit or Rate Limit)
                        setError(error.response.data.error || "You have reached your limit. Please upgrade or try again later.");
                    }
                } else if (error.response.status === 401) {
                    // Token invalid/expired
                    localStorage.removeItem('token');
                    localStorage.removeItem('role');
                    navigate('/login');
                } else if (error.response.status === 403) {
                    setError(error.response.data.error || "Your current plan does not support this feature. Please upgrade.");
                } else {
                    setError(error.response.data.error || "Failed to generate docstring. Please try again.");
                }
            } else {
                setError("Failed to generate docstring. Please check your network connection.");
            }
        } finally {
            setIsGenerating(false);
        }
    };

    const verifyLoadSnippet = (item) => {
        setInputCode(item.code);
        setOutputDocstring(item.docstring);
        setLanguage(item.language);
    }

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showLimitModal, setShowLimitModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const handleDeleteClick = (id) => {
        setItemToDelete(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;

        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const config = { headers: { 'x-auth-token': token } };
            await axios.delete(`${API_URL}/api/generate/history/${itemToDelete}`, config);
            setHistory(history.filter(item => item._id !== itemToDelete));
            setShowDeleteModal(false);
            setItemToDelete(null);
        } catch (err) {
            console.error("Failed to delete history item", err);
            alert("Failed to delete item.");
        }
    };

    const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false);
    const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);

    // Determine if Pro features are enabled (e.g., for language selection)
    const isProUser = user?.plan === 'pro' || user?.plan === 'enterprise';

    return (
        <div className="flex flex-col h-screen bg-transparent text-slate-100 font-sans selection:bg-primary/30">
            {/* Global Header */}
            <div className="w-full py-6 flex justify-center items-center z-50 bg-transparent flex-shrink-0">
                <h1 className="text-2xl font-bold tracking-tight text-white hover:opacity-90 transition-opacity cursor-pointer" onClick={() => navigate('/')}>
                    Docstring<span className="text-accent">.io</span>
                </h1>
            </div>

            {/* Main App Container */}
            < div className="flex-1 flex overflow-hidden relative" >
                {/* Mobile Header */}
                < div className="md:hidden absolute top-0 left-0 right-0 h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 z-50 flex items-center justify-between px-4" >
                    <button onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)} className="p-2 text-slate-400 hover:text-white">
                        <History className="w-6 h-6" />
                    </button>
                    <span className="font-bold text-lg text-primary">Docstring.io</span>
                    <button onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)} className="p-2 text-slate-400 hover:text-white">
                        <Menu className="w-6 h-6" />
                    </button>
                </div >



                {/* Left Sidebar (Desktop: Block, Mobile: Slide-over) */}
                < div className={`fixed md:relative z-[60] inset-y-0 left-0 transform ${isLeftSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out md:block h-full shadow-2xl md:shadow-none`
                }>
                    <Sidebar history={history} onLoadSnippet={(item) => { verifyLoadSnippet(item); setIsLeftSidebarOpen(false); }} onDeleteHistory={handleDeleteClick} />
                    {/* Close button for mobile left sidebar */}
                    <button onClick={() => setIsLeftSidebarOpen(false)} className="md:hidden absolute top-4 right-4 p-2 text-slate-400">
                        <X className="w-6 h-6" />
                    </button>
                </div >

                {/* Right Sidebar (Mobile Only - Slide-over for Auth) */}
                < div className={`fixed z-[60] inset-y-0 right-0 w-64 bg-slate-900 border-l border-slate-800 transform ${isRightSidebarOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out md:hidden shadow-2xl flex flex-col p-6`}>
                    <div className="flex justify-end mb-8">
                        <button onClick={() => setIsRightSidebarOpen(false)} className="text-slate-400 hover:text-white">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {
                        !localStorage.getItem('token') ? (
                            <div className="flex flex-col gap-4">
                                <Link to="/login" className="w-full px-5 py-3 bg-primary hover:bg-blue-600 text-white text-center font-semibold rounded-lg shadow-lg transition-all">
                                    Login
                                </Link>
                                <Link to="/register" className="w-full px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white text-center font-semibold rounded-lg border border-slate-700 transition-all">
                                    Sign Up
                                </Link>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">

                                {localStorage.getItem('role') === 'admin' && (
                                    <Link to="/admin" className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-purple-900/20 hover:bg-purple-900/40 text-purple-300 border border-purple-900/30 font-medium rounded-lg transition-colors">
                                        <Shield className="w-4 h-4" />
                                        Admin Portal
                                    </Link>
                                )}
                                <button onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('role'); window.location.reload(); }} className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-red-600 hover:bg-red-700 text-white border border-transparent font-semibold rounded-lg shadow-lg shadow-red-600/20 transition-all">
                                    <LogOut className="w-4 h-4" />
                                    Logout
                                </button>
                            </div>
                        )
                    }
                </div >

                {/* Overlay for mobile sidebars */}
                {
                    (isLeftSidebarOpen || isRightSidebarOpen) && (
                        <div
                            className="fixed inset-0 bg-black/50 z-[55] md:hidden backdrop-blur-sm"
                            onClick={() => { setIsLeftSidebarOpen(false); setIsRightSidebarOpen(false); }}
                        />
                    )
                }

                <div className="flex-1 flex flex-col h-full bg-slate-950/50 backdrop-blur-sm pt-16 md:pt-0">
                    <ControlBar
                        language={language}
                        setLanguage={setLanguage}
                        style={style}
                        setStyle={setStyle}
                        onGenerate={handleGenerate}
                        isGenerating={isGenerating}
                        isProUser={isProUser} // Pass pro status to ControlBar
                        userGenerationsCount={user?.generationsCount}
                        userPlan={user?.plan}
                    />
                    {error && (
                        <div className="bg-red-900/30 text-red-300 border border-red-900 p-3 mx-4 mt-2 rounded-md text-sm">
                            {error}
                        </div>
                    )}

                    {/* Main Content Area - Stack on mobile, side-by-side on desktop */}
                    <div className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden p-2 md:p-4 gap-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="flex-1 flex flex-col min-h-[300px] md:min-h-0 min-w-0"
                        >
                            <div className="mb-2 text-sm font-medium text-slate-400 flex justify-between">
                                <span>Input Code</span>
                            </div>
                            <CodeEditor
                                language={language}
                                value={inputCode}
                                onChange={(val) => setInputCode(val)}
                            />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="flex-1 flex flex-col min-h-[300px] md:min-h-0 min-w-0"
                        >
                            <div className="mb-2 text-sm font-medium text-slate-400">Generated Docstring</div>
                            <OutputViewer docstring={outputDocstring} language="markdown" />
                        </motion.div>
                    </div>
                </div>


                <ConfirmationModal
                    isOpen={showDeleteModal}
                    onClose={() => setShowDeleteModal(false)}
                    onConfirm={confirmDelete}
                    title="Delete History Item"
                    message="Are you sure you want to permanently delete this generated docstring from your history? This action cannot be undone."
                />
                <GuestLimitModal
                    isOpen={showLimitModal}
                    onClose={() => setShowLimitModal(false)}
                />
            </div >
            {/* Footer */}
            < Footer />
        </div >
    );
}

export default Home;
