import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, User, Lock, Mail, Phone, ArrowLeft, Sparkles, X } from 'lucide-react';

const UserAuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                const result = await login(formData.email, formData.password);
                if (result.success) {
                    if (result.role === 'ADMIN') {
                        setError('Admin accounts should use the admin login portal');
                        setLoading(false);
                        return;
                    }
                    navigate('/dashboard');
                } else {
                    setError(result.error);
                }
            } else {
                const result = await register({ ...formData, role: 'CUSTOMER' });
                if (result.success) {
                    navigate('/dashboard');
                } else {
                    setError(result.error);
                }
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid lg:grid-cols-2 bg-slate-50 selection:bg-indigo-100 overflow-hidden">
            {/* Left Side: Immersive Vibrant Visual */}
            <div className="hidden lg:flex relative overflow-hidden bg-indigo-900">
                {/* Animated Vibrant Background */}
                <div className="absolute top-0 -left-20 w-[600px] h-[600px] bg-purple-600 rounded-full blur-[150px] opacity-40 animate-pulse"></div>
                <div className="absolute -bottom-20 -right-20 w-[600px] h-[600px] bg-pink-500 rounded-full blur-[150px] opacity-40 animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500 rounded-full blur-[150px] opacity-30 animate-pulse delay-500"></div>

                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80')] bg-cover bg-center mix-blend-overlay opacity-50 transition-transform duration-[10000ms] hover:scale-110"></div>
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950 via-purple-900/40 to-blue-900/90"></div>

                <div className="relative z-10 w-full p-16 flex flex-col justify-between text-white">
                    <Link to="/" className="inline-flex items-center gap-3 group">
                        <div className="w-14 h-14 bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-2xl rounded-[1.2rem] flex items-center justify-center border border-white/20 group-hover:scale-110 transition-all duration-500 shadow-2xl">
                            <ShoppingBag className="w-7 h-7 text-white" />
                        </div>
                        <span className="text-3xl font-black tracking-tighter uppercase drop-shadow-lg">Shop<span className="text-pink-400">Hub</span></span>
                    </Link>

                    <div className="space-y-8 max-w-lg">
                        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 backdrop-blur-xl border border-white/10 text-white text-xs font-black uppercase tracking-[0.2em] shadow-xl animate-in fade-in slide-in-from-left-4 duration-1000">
                            <Sparkles className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            <span>Premium Access Only</span>
                        </div>

                        <h2 className="text-7xl font-black leading-tight animate-in fade-in slide-in-from-left-8 duration-[1200ms] delay-200">
                            Elevate Your <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">Shopping Quest</span>
                        </h2>

                        <p className="text-xl text-indigo-100/70 font-medium leading-relaxed animate-in fade-in slide-in-from-left-12 duration-[1400ms] delay-500">
                            Immerse yourself in a curated marketplace where every detail is designed for your ultimate convenience and style.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-10 border-t border-white/10 pt-10 animate-in fade-in slide-in-from-bottom-4 duration-[1000ms] delay-1000">
                        <div className="group cursor-default">
                            <p className="text-4xl font-black mb-1 group-hover:text-pink-400 transition-colors">99.9%</p>
                            <p className="text-[10px] text-indigo-200/60 font-black uppercase tracking-widest">Satisfaction rate</p>
                        </div>
                        <div className="group cursor-default">
                            <p className="text-4xl font-black mb-1 group-hover:text-blue-400 transition-colors">24h</p>
                            <p className="text-[10px] text-indigo-200/60 font-black uppercase tracking-widest">Flash delivery</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side: Vibrant Auth Form */}
            <div className="relative flex items-center justify-center p-8 lg:p-16 bg-white overflow-hidden">
                {/* Background Blobs for Form Side */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-pink-100 rounded-full blur-[100px] opacity-40"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-100 rounded-full blur-[100px] opacity-40"></div>

                <div className="relative z-10 w-full max-w-md space-y-12">
                    <div className="lg:hidden text-center">
                        <Link to="/" className="inline-flex items-center gap-2 mb-8">
                            <div className="w-12 h-12 bg-gradient-to-tr from-indigo-600 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                                <ShoppingBag className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-2xl font-black text-indigo-900 tracking-tighter uppercase">ShopHub</span>
                        </Link>
                    </div>

                    <div className="space-y-3 text-center lg:text-left">
                        <div className="inline-block lg:hidden h-1.5 w-12 bg-indigo-600 rounded-full mb-4 mx-auto lg:mx-0"></div>
                        <h1 className="text-5xl font-black text-slate-900 tracking-tight">
                            {isLogin ? 'Hello Again!' : 'Join the Club'}
                        </h1>
                        <p className="text-gray-500 font-bold text-lg">
                            {isLogin ? 'Welcome back to your curated space.' : 'Unleash a world of premium retail.'}
                        </p>
                    </div>

                    {error && (
                        <div className="flex items-center gap-4 p-5 bg-rose-50 text-rose-600 rounded-[1.5rem] border border-rose-100 shadow-xl shadow-rose-500/5 animate-in slide-in-from-top-4 duration-500">
                            <div className="w-10 h-10 rounded-full bg-rose-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-rose-500/20">
                                <X className="w-5 h-5 text-white" />
                            </div>
                            <p className="text-sm font-black">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {!isLogin && (
                            <div className="grid grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2">First Name</label>
                                    <div className="relative group">
                                        <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-pink-500 transition-all duration-300" />
                                        <input
                                            type="text"
                                            className="w-full pl-14 pr-4 py-5 bg-slate-50 border-2 border-transparent rounded-[1.4rem] focus:border-pink-500 focus:bg-white focus:shadow-2xl focus:shadow-pink-500/10 outline-none transition-all font-bold text-slate-800 placeholder-gray-400"
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2">Last Name</label>
                                    <div className="relative group">
                                        <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-all duration-300" />
                                        <input
                                            type="text"
                                            className="w-full pl-14 pr-4 py-5 bg-slate-50 border-2 border-transparent rounded-[1.4rem] focus:border-blue-500 focus:bg-white focus:shadow-2xl focus:shadow-blue-500/10 outline-none transition-all font-bold text-slate-800 placeholder-gray-400"
                                            value={formData.lastName}
                                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2">Email Identity</label>
                            <div className="relative group">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-600 transition-all duration-300" />
                                <input
                                    type="email"
                                    className="w-full pl-14 pr-4 py-5 bg-slate-50 border-2 border-transparent rounded-[1.4rem] focus:border-indigo-600 focus:bg-white focus:shadow-2xl focus:shadow-indigo-600/10 outline-none transition-all font-bold text-slate-800 placeholder-gray-400"
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        {!isLogin && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2">Secure Phone</label>
                                <div className="relative group">
                                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-600 transition-all duration-300" />
                                    <input
                                        type="tel"
                                        className="w-full pl-14 pr-4 py-5 bg-slate-50 border-2 border-transparent rounded-[1.4rem] focus:border-purple-600 focus:bg-white focus:shadow-2xl focus:shadow-purple-600/10 outline-none transition-all font-bold text-slate-800 placeholder-gray-400"
                                        placeholder="+1 (xxx) xxx-xxxx"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2">Access Key</label>
                            <div className="relative group">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-600 transition-all duration-300" />
                                <input
                                    type="password"
                                    className="w-full pl-14 pr-4 py-5 bg-slate-50 border-2 border-transparent rounded-[1.4rem] focus:border-indigo-600 focus:bg-white focus:shadow-2xl focus:shadow-indigo-600/10 outline-none transition-all font-bold text-slate-800 placeholder-gray-400"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-6 bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase tracking-[0.3em] text-sm shadow-2xl shadow-indigo-200 hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 disabled:opacity-50 disabled:pointer-events-none relative overflow-hidden group/btn"
                            disabled={loading}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000"></div>
                            {loading ? (
                                <div className="flex items-center justify-center gap-3">
                                    <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Syncing...</span>
                                </div>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    {isLogin ? 'Access Marketplace' : 'Initialize Profile'} <ArrowLeft className="rotate-180 w-5 h-5" />
                                </span>
                            )}
                        </button>
                    </form>

                    <div className="text-center">
                        <button
                            type="button"
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError('');
                            }}
                            className="text-gray-400 font-black uppercase tracking-[0.1em] text-xs hover:text-indigo-600 transition-all group"
                        >
                            {isLogin ? (
                                <>New Explorer? <span className="text-indigo-600 underline underline-offset-8 decoration-2 decoration-indigo-200 group-hover:decoration-indigo-600 transition-all">Join the Hub</span></>
                            ) : (
                                <>Returning member? <span className="text-indigo-600 underline underline-offset-8 decoration-2 decoration-indigo-200 group-hover:decoration-indigo-600 transition-all">Sign In</span></>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserAuthPage;
