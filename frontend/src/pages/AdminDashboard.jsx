import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Users, Activity, Server, AlertTriangle, Shield, Ban, CheckCircle, LogOut, Home, Eye, EyeOff } from 'lucide-react';
import Footer from '../components/Footer';
import API_URL from '../config';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [visiblePasswords, setVisiblePasswords] = useState({});
    const navigate = useNavigate();

    const togglePasswordVisibility = (userId) => {
        setVisiblePasswords(prev => ({
            ...prev,
            [userId]: !prev[userId]
        }));
    };

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const config = { headers: { 'x-auth-token': token } };

                const statsRes = await axios.get(`${API_URL}/api/admin/stats`, config);
                setStats(statsRes.data);

                const usersRes = await axios.get(`${API_URL}/api/admin/users`, config);
                setUsers(usersRes.data);

                setLoading(false);
            } catch (err) {
                console.error(err);
                if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                    navigate('/login');
                }
            }
        };

        fetchData();
    }, [navigate]);

    const toggleBlock = async (userId) => {
        try {
            const token = localStorage.getItem('token');
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const config = { headers: { 'x-auth-token': token } };
            await axios.put(`${API_URL}/api/admin/users/${userId}/block`, {}, config);

            setUsers(users.map(u => u._id === userId ? { ...u, isBlocked: !u.isBlocked } : u));
        } catch (err) {
            console.error("Failed to block user", err);
        }
    };

    const togglePlan = async (userId) => {
        try {
            const token = localStorage.getItem('token');
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const config = { headers: { 'x-auth-token': token } };
            await axios.put(`${API_URL}/api/admin/users/${userId}/plan`, {}, config);

            setUsers(users.map(u => u._id === userId ? { ...u, plan: u.plan === 'pro' ? 'free' : 'pro' } : u));
        } catch (err) {
            console.error("Failed to change plan", err);
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center bg-slate-950 text-slate-400">Loading Dashboard...</div>;

    return (
        <div className="min-h-screen bg-slate-950/50 backdrop-blur-sm text-slate-100 p-8 pt-0 flex flex-col">
            <div className="w-full py-6 flex justify-center items-center mb-4 flex-shrink-0">
                <h1 className="text-2xl font-bold tracking-tight text-white hover:opacity-90 transition-opacity cursor-pointer" onClick={() => navigate('/')}>
                    Docstring<span className="text-accent">.io</span>
                </h1>
            </div>
            <div className="flex-1">
                <header className="mb-8 flex flex-col md:flex-row items-center md:justify-between gap-4 md:gap-0">
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Shield className="text-primary w-8 h-8" />
                        Admin Dashboard
                    </h1>
                    <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                        <Link to="/" className="flex items-center justify-center gap-2 px-6 py-2 bg-primary hover:bg-blue-600 text-white text-sm font-semibold rounded-lg shadow-lg shadow-primary/25 transition-all w-full md:w-auto">
                            <Home className="w-4 h-4" />
                            App
                        </Link>
                        <button onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('role'); navigate('/login'); }} className="flex items-center justify-center gap-2 px-6 py-2 bg-red-600 hover:bg-red-700 text-white border border-transparent text-sm font-semibold rounded-lg shadow-lg shadow-red-600/20 transition-all w-full md:w-auto">
                            <LogOut className="w-4 h-4" />
                            Logout
                        </button>
                    </div>
                </header>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Growth - Total Users */}
                    <div className="bg-slate-900/70 backdrop-blur-md border border-slate-800/50 p-6 rounded-lg shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-slate-400 text-sm font-medium">All-Time Users</h3>
                            <Users className="text-blue-500 w-5 h-5" />
                        </div>
                        <p className="text-3xl font-bold">{stats.growth.totalUsers}</p>
                        <p className="text-xs text-slate-500 mt-2">Registered accounts</p>
                    </div>

                    {/* Growth - Active Users */}
                    <div className="bg-slate-900/70 backdrop-blur-md border border-slate-800/50 p-6 rounded-lg shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-slate-400 text-sm font-medium">Active Users (24h)</h3>
                            <Activity className="text-green-500 w-5 h-5" />
                        </div>
                        <p className="text-3xl font-bold">{stats.growth.activeUsers24h}</p>
                        <p className="text-xs text-slate-500 mt-2">Active IP addresses</p>
                    </div>

                    {/* Health - RPM */}
                    <div className="bg-slate-900/70 backdrop-blur-md border border-slate-800/50 p-6 rounded-lg shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-slate-400 text-sm font-medium">Current RPM</h3>
                            <Server className="text-purple-500 w-5 h-5" />
                        </div>
                        <p className="text-3xl font-bold">{stats.health.rpm} <span className="text-sm text-slate-500 font-normal">/ 30</span></p>
                        <p className="text-xs text-slate-500 mt-2">Requests per minute</p>
                    </div>

                    {/* Health - Errors */}
                    <div className="bg-slate-900/70 backdrop-blur-md border border-slate-800/50 p-6 rounded-lg shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-slate-400 text-sm font-medium">Errors Today</h3>
                            <AlertTriangle className="text-red-500 w-5 h-5" />
                        </div>
                        <p className="text-3xl font-bold">{stats.health.errors}</p>
                        <p className="text-xs text-slate-500 mt-2">Failed generations</p>
                    </div>
                </div>

                {/* User Management */}
                <div className="bg-slate-900/70 backdrop-blur-md border border-slate-800/50 rounded-lg shadow-lg overflow-hidden">
                    <div className="p-6 border-b border-slate-800/50">
                        <h2 className="text-xl font-semibold">User Management</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-400">
                            <thead className="bg-slate-950/50 text-slate-200 uppercase text-xs font-semibold">
                                <tr>
                                    <th className="px-6 py-3">Email</th>
                                    <th className="px-6 py-3">Joined</th>
                                    <th className="px-6 py-3">Role</th>
                                    <th className="px-6 py-3">Plan</th>
                                    <th className="px-6 py-3">Password</th>
                                    <th className="px-6 py-3">Generations</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {users.length === 0 ? (
                                    <tr><td colSpan="7" className="px-6 py-4 text-center">No users found</td></tr>
                                ) : users.map(user => (
                                    <tr key={user._id} className="hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-200">{user.email || 'N/A'}</td>
                                        <td className="px-6 py-4">{new Date(user.joinedAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs ${user.role === 'admin' ? 'bg-purple-900 text-purple-200' : 'bg-blue-900 text-blue-200'}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs capitalize ${user.plan === 'pro' ? 'bg-indigo-900 text-indigo-200' : user.plan === 'enterprise' ? 'bg-amber-900 text-amber-200' : 'bg-slate-700 text-slate-300'}`}>
                                                {user.plan || 'free'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.role === 'admin' ? (
                                                <span className="text-slate-500 italic">Hidden</span>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-xs text-slate-400">
                                                        {visiblePasswords[user._id] ? user.password : '••••••••'}
                                                    </span>
                                                    <button
                                                        onClick={() => togglePasswordVisibility(user._id)}
                                                        className="text-slate-500 hover:text-slate-300 transition-colors"
                                                    >
                                                        {visiblePasswords[user._id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">{user.generationsCount}</td>
                                        <td className="px-6 py-4 text-right">
                                            {user.role !== 'admin' && (
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => togglePlan(user._id)}
                                                        className={`px-3 py-1 rounded text-xs font-medium transition-colors ${user.plan === 'pro'
                                                            ? 'bg-amber-900 text-amber-200 hover:bg-amber-800'
                                                            : 'bg-indigo-900 text-indigo-200 hover:bg-indigo-800'
                                                            }`}
                                                    >
                                                        {user.plan === 'pro' ? 'Set Free' : 'Set Pro'}
                                                    </button>
                                                    <button
                                                        onClick={() => toggleBlock(user._id)}
                                                        className={`px-3 py-1 rounded text-xs font-medium transition-colors ${user.isBlocked
                                                            ? 'bg-green-900 text-green-200 hover:bg-green-800'
                                                            : 'bg-red-900 text-red-200 hover:bg-red-800'
                                                            }`}
                                                    >
                                                        {user.isBlocked ? 'Unblock' : 'Block'}
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default AdminDashboard;
