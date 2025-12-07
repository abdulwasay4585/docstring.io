import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { X, Eye, EyeOff } from 'lucide-react';
import API_URL from '../config';


const Register = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${API_URL}/api/auth/register`, formData);
            localStorage.setItem('token', res.data.token);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
        }
    };

    return (
        <div className="h-screen bg-transparent flex items-center justify-center text-slate-100 relative">
            <Link to="/" className="absolute top-8 left-8 text-slate-400 hover:text-white flex items-center gap-2 transition-colors">
                ← Go Back
            </Link>

            <div className="w-full max-w-md p-8 bg-slate-900/70 backdrop-blur-md rounded-lg shadow-xl border border-slate-800/50 relative">
                <Link to="/" className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
                    <X className="w-6 h-6" />
                </Link>

                <h2 className="text-2xl font-bold mb-6 text-center text-primary">Join Docstring.io</h2>
                {error && <div className="bg-red-500/10 text-red-400 p-3 rounded mb-4 text-sm">{error}</div>}
                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-400">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={onChange}
                            required
                            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 focus:outline-none focus:border-primary text-slate-100"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-400">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={onChange}
                                required
                                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 focus:outline-none focus:border-primary text-slate-100 pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-400 hover:text-white transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-primary hover:bg-blue-600 text-white font-medium py-2 rounded transition-colors"
                    >
                        Sign Up
                    </button>
                </form>
                <p className="mt-4 text-center text-sm text-slate-500">
                    Already have an account? <Link to="/login" className="text-primary hover:underline">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
