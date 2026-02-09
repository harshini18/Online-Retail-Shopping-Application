import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Shield, User } from 'lucide-react';

const HomePage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
            <div className="w-full max-w-6xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="flex justify-center mb-6">
                        <div className="bg-gradient-primary p-6 rounded-3xl shadow-xl">
                            <ShoppingBag className="w-16 h-16 text-white" />
                        </div>
                    </div>
                    <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                        Online Retail Shopping
                    </h1>
                </div>

                {/* Cards Container */}
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Customer Card */}
                    <div
                        onClick={() => navigate('/user/auth')}
                        className="card p-8 cursor-pointer transform hover:scale-105 transition-all duration-300 hover:shadow-2xl"
                    >
                        <div className="flex justify-center mb-6">
                            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-6 rounded-2xl">
                                <User className="w-12 h-12 text-white" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
                            Customer
                        </h2>
                        <button className="btn-primary w-full text-lg">
                            Continue
                        </button>
                    </div>

                    {/* Admin Card */}
                    <div
                        onClick={() => navigate('/admin/login')}
                        className="card p-8 cursor-pointer transform hover:scale-105 transition-all duration-300 hover:shadow-2xl"
                    >
                        <div className="flex justify-center mb-6">
                            <div className="bg-gradient-to-br from-orange-500 to-red-600 p-6 rounded-2xl">
                                <Shield className="w-12 h-12 text-white" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
                            Admin
                        </h2>
                        <button className="w-full py-3 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 transform hover:scale-105 transition-all shadow-lg text-lg">
                            Continue
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
