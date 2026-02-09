import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, Mail, ArrowLeft, ShieldCheck, X } from 'lucide-react';

const AdminAuthPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await login(formData.email, formData.password);
            if (result.success) {
                if (result.role !== 'ADMIN') {
                    setError('Access denied. Admin credentials required.');
                    setLoading(false);
                    return;
                }
                navigate('/admin');
            } else {
                setError(result.error);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative bg-slate-50 flex items-center justify-center p-6 overflow-hidden">
            {/* Immersive Sky Background */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-100 rounded-full blur-[160px] opacity-40 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-cyan-100 rounded-full blur-[160px] opacity-40 animate-pulse delay-700"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/clean-gray-paper.png')] opacity-20 pointer-events-none"></div>

            <div className="relative z-10 w-full max-w-5xl">
                <Link to="/" className="inline-flex items-center gap-3 text-slate-400 hover:text-slate-900 mb-10 group transition-all">
                    <div className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center group-hover:bg-slate-50 group-hover:scale-110 transition-all shadow-sm">
                        <ArrowLeft className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] group-hover:tracking-[0.4em] transition-all">Exit Management Zone</span>
                </Link>

                <div className="grid lg:grid-cols-2 gap-10 items-center">
                    {/* Left Side: System Information (New non-boring element) */}
                    <div className="hidden lg:block space-y-10">
                        <div className="space-y-4">
                            <h2 className="text-6xl font-black text-slate-900 leading-tight">
                                System <br />
                                <span className="text-indigo-600">Command</span>
                            </h2>
                            <p className="text-xl text-slate-500 font-medium max-w-sm">
                                Real-time oversight for the ShopHub inventory and retail ecosystem.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="p-8 bg-white/60 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-xl shadow-slate-200/50 space-y-4 hover:translate-y-[-5px] transition-all">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
                                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping"></div>
                                </div>
                                <div>
                                    <p className="text-2xl font-black text-slate-900">Active</p>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Network Status</p>
                                </div>
                            </div>

                            <div className="p-8 bg-white/60 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-xl shadow-slate-200/50 space-y-4 hover:translate-y-[-5px] transition-all">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
                                    <ShieldCheck className="w-6 h-6 text-indigo-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-black text-slate-900">v4.0.2</p>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Core Version</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-slate-900 rounded-[3rem] text-white shadow-2xl shadow-slate-900/20 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                            <div className="relative z-10 space-y-6">
                                <div className="flex justify-between items-center">
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Security Pulse</p>
                                    <X className="w-4 h-4 text-slate-600" />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-bold">
                                        <span>Authentication Uplink</span>
                                        <span className="text-emerald-400">Stable</span>
                                    </div>
                                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-400 w-3/4 animate-in slide-in-from-left duration-1000"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Login Form */}
                    <div className="max-w-md mx-auto lg:mx-0 w-full">
                        <div className="relative p-1 bg-gradient-to-br from-indigo-100 to-transparent rounded-[3rem] shadow-[0_30px_60px_-12px_rgba(30,41,59,0.15)]">
                            <div className="bg-white/80 backdrop-blur-3xl p-12 rounded-[2.9rem] border border-white space-y-12">
                                <div className="flex flex-col items-center text-center space-y-6">
                                    <div className="relative group">
                                        <div className="absolute -inset-6 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-[2rem] blur-xl opacity-10 group-hover:opacity-25 transition duration-1000"></div>
                                        <div className="relative w-24 h-24 bg-gradient-to-br from-slate-800 to-slate-950 rounded-[2rem] flex items-center justify-center shadow-2xl group-hover:rotate-6 transition-transform duration-500">
                                            <ShieldCheck className="w-12 h-12 text-white" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <h1 className="text-3xl font-black text-slate-900 tracking-widest uppercase">Admin Access</h1>
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="h-[2px] w-8 bg-indigo-100"></div>
                                            <p className="text-indigo-600 text-[10px] font-black tracking-[0.4em] uppercase">Identity Required</p>
                                            <div className="h-[2px] w-8 bg-indigo-100"></div>
                                        </div>
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-5 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl flex items-center gap-4 animate-in slide-in-from-top-4 duration-300">
                                        <div className="w-10 h-10 rounded-full bg-rose-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-rose-500/20">
                                            <X className="w-5 h-5 text-white" />
                                        </div>
                                        <p className="text-xs font-black tracking-widest leading-relaxed">{error}</p>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Official Email</label>
                                        <div className="relative group">
                                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-600 transition-all duration-300" />
                                            <input
                                                type="email"
                                                className="w-full pl-14 pr-4 py-5 bg-slate-50/50 border border-slate-200 rounded-[1.5rem] focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all font-bold text-slate-900 placeholder-slate-300"
                                                placeholder="admin@shophub.com"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Access Credential</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-600 transition-all duration-300" />
                                            <input
                                                type="password"
                                                className="w-full pl-14 pr-4 py-5 bg-slate-50/50 border border-slate-200 rounded-[1.5rem] focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all font-bold text-slate-900 placeholder-slate-300"
                                                placeholder="••••••••"
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full py-6 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-[0.3em] text-xs shadow-2xl shadow-slate-200 hover:bg-indigo-600 hover:shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 disabled:opacity-50 relative overflow-hidden group/btn"
                                        disabled={loading}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000"></div>
                                        {loading ? (
                                            <div className="flex items-center justify-center gap-3">
                                                <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                <span>Authenticating...</span>
                                            </div>
                                        ) : (
                                            'Initialize Session'
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-16 text-center">
                    <div className="inline-flex items-center gap-4 px-6 py-2 rounded-full border border-slate-200 bg-white shadow-sm">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                            Core Online | Stable Connection
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAuthPage;
