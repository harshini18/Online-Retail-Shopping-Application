import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Shield, User, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';

const HomePage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen relative bg-slate-50 flex items-center justify-center p-6 overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute top-0 -left-4 w-[500px] h-[500px] bg-indigo-400 rounded-full blur-[150px] opacity-20 animate-pulse"></div>
            <div className="absolute bottom-0 -right-4 w-[500px] h-[500px] bg-pink-400 rounded-full blur-[150px] opacity-20 animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/clean-gray-paper.png')] opacity-20 pointer-events-none"></div>

            <div className="relative z-10 w-full max-w-5xl">
                {/* Branding Section */}
                <div className="text-center mb-20 space-y-6">
                    <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white border border-indigo-100 shadow-sm backdrop-blur-xl mb-4">
                        <Sparkles className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-black text-indigo-600 uppercase tracking-widest">Premium Portal v2.0</span>
                    </div>

                    <h1 className="text-7xl lg:text-8xl font-black tracking-tighter text-slate-900">
                        Shop<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">Hub</span>
                    </h1>

                    <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
                        Welcome to the next generation of digital commerce. Select your access portal to begin your journey.
                    </p>
                </div>

                {/* Portal Selection Grid */}
                <div className="grid md:grid-cols-2 gap-10 max-w-4xl mx-auto">
                    {/* Customer Portal */}
                    <div
                        onClick={() => navigate('/user/auth')}
                        className="group relative cursor-pointer"
                    >
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-[2.5rem] blur opacity-10 group-hover:opacity-40 transition duration-500"></div>
                        <div className="relative h-full bg-white/70 backdrop-blur-3xl border border-white p-10 rounded-[2.5rem] hover:translate-y-[-8px] transition-all duration-500 overflow-hidden shadow-2xl shadow-indigo-100/50">
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                                <ShoppingBag className="w-48 h-48 text-indigo-900" />
                            </div>

                            <div className="relative z-10 space-y-8">
                                <div className="w-20 h-20 rounded-3xl bg-indigo-600 flex items-center justify-center shadow-2xl shadow-indigo-200">
                                    <User className="w-10 h-10 text-white" />
                                </div>

                                <div>
                                    <h2 className="text-4xl font-black text-slate-900 mb-3">Customer</h2>
                                    <p className="text-slate-500 font-medium">Browse premium collections, track orders, and experience personalized shopping.</p>
                                </div>

                                <div className="flex items-center gap-3 text-indigo-600 font-black uppercase tracking-widest text-sm group-hover:gap-5 transition-all">
                                    <span>Enter Marketplace</span>
                                    <ArrowRight className="w-5 h-5" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Admin Portal */}
                    <div
                        onClick={() => navigate('/admin/login')}
                        className="group relative cursor-pointer"
                    >
                        <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-rose-500 rounded-[2.5rem] blur opacity-10 group-hover:opacity-40 transition duration-500"></div>
                        <div className="relative h-full bg-white/70 backdrop-blur-3xl border border-white p-10 rounded-[2.5rem] hover:translate-y-[-8px] transition-all duration-500 overflow-hidden shadow-2xl shadow-pink-100/50">
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                                <ShieldCheck className="w-48 h-48 text-pink-900" />
                            </div>

                            <div className="relative z-10 space-y-8">
                                <div className="w-20 h-20 rounded-3xl bg-pink-600 flex items-center justify-center shadow-2xl shadow-pink-200">
                                    <Shield className="w-10 h-10 text-white" />
                                </div>

                                <div>
                                    <h2 className="text-4xl font-black text-slate-900 mb-3">Management</h2>
                                    <p className="text-slate-500 font-medium">Access powerful tools to manage inventory, oversee orders, and drive growth.</p>
                                </div>

                                <div className="flex items-center gap-3 text-pink-600 font-black uppercase tracking-widest text-sm group-hover:gap-5 transition-all">
                                    <span>Control Center</span>
                                    <ArrowRight className="w-5 h-5" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Insight */}
                <div className="mt-20 text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
                        Secured Power & Design by ShopHub
                    </p>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
