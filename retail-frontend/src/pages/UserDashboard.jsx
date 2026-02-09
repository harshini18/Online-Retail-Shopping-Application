import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Home, ShoppingCart, Package, Bell, Search, LogOut, Tag,
    Filter, RefreshCw, X, ChevronRight, Star, Plus, Minus, Trash2,
    Sparkles, CreditCard, Heart, MapPin, CheckCircle, Clock,
    Truck, ShieldCheck, Zap, ArrowUpRight, Activity
} from 'lucide-react';
import { productAPI, cartAPI, orderAPI, paymentAPI, notificationAPI } from '../services/api';

const UserDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('home');
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [orders, setOrders] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showCheckout, setShowCheckout] = useState(false);
    const [shippingAddress, setShippingAddress] = useState('');
    const [pincode, setPincode] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('UPI');
    const [isProcessing, setIsProcessing] = useState(false);
    const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '', name: '' });
    const [upiId, setUpiId] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);

    // Filter states
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [sortBy, setSortBy] = useState('name-asc');
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        loadData();
        fetchCategories();
    }, [user]);

    const fetchCategories = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/categories');
            const data = await response.json();
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const loadData = async () => {
        if (!user?.userId) return;
        try {
            const [productsRes, cartRes, ordersRes, notificationsRes] = await Promise.all([
                productAPI.getAll().catch(() => ({ data: [] })),
                cartAPI.getCart(user.userId).catch(() => ({ data: [] })),
                orderAPI.getUserOrders(user.userId).catch(() => ({ data: [] })),
                notificationAPI.getUserNotifications(user.userId).catch(() => ({ data: [] }))
            ]);
            setProducts(productsRes.data || []);
            setCart(cartRes.data || []);
            setOrders(ordersRes.data || []);
            setNotifications(notificationsRes.data || []);
        } catch (error) {
            console.error('Error loading data:', error);
        }
    };

    const handleAddToCart = async (product) => {
        try {
            // Optimistic feedback could be added here
            await cartAPI.addToCart({
                userId: user.userId,
                productId: product.id,
                quantity: 1,
                price: product.price,
                name: product.name,
                imageUrl: product.imageUrl
            });
            // Show non-blocking success feedback or just update count
            console.log('Added to cart');
            loadData(); // Reload to get updated cart
            // Add a proper visual feedback
            alert('Added to cart successfully!');
        } catch (error) {
            console.error('Error adding to cart:', error);
            // Only alert on error
            alert('Failed to add to cart: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleUpdateQuantity = async (itemId, newQuantity) => {
        if (newQuantity < 1) return;
        try {
            await cartAPI.updateQuantity(user.userId, itemId, newQuantity);
            loadData();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleRemoveFromCart = async (itemId) => {
        try {
            await cartAPI.removeItem(user.userId, itemId);
            loadData();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleCheckout = async () => {
        setIsProcessing(true);
        try {
            // 1. Process Payment
            const paymentRes = await paymentAPI.processPayment({
                userId: user.userId,
                amount: cartTotal,
                paymentMethod: paymentMethod,
                status: 'SUCCESS'
            });

            // 2. Place Order
            // Strip cart item IDs to avoid conflict with OrderItem auto-generated IDs
            const orderItems = cart.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
                name: item.name,
                imageUrl: item.imageUrl
            }));

            const orderRes = await orderAPI.createOrder({
                userId: user.userId,
                items: orderItems,
                totalAmount: cartTotal,
                shippingAddress,
                paymentId: paymentRes.data.id,
                transactionId: paymentRes.data.transactionId
            });

            const orderId = orderRes.data.id;

            // 3. UI Updates
            setShowCheckout(false);
            try {
                await cartAPI.clearCart(user.userId);
            } catch (err) {
                console.error("Failed to clear backend cart", err);
            }
            setCart([]);
            await loadData();
            alert(`Order placed successfully! Order ID: ${orderId} `);

        } catch (error) {
            console.error('Error during checkout:', error);
            alert('Checkout failed: ' + (error.response?.data?.message || error.message));
        } finally {
            setIsProcessing(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // Enhanced filtering and sorting logic
    const filteredProducts = products
        .filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.description.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesCategory = selectedCategory === 'all' ||
                product.category?.name === selectedCategory;

            const matchesPrice = (
                (priceRange.min === '' || product.price >= parseFloat(priceRange.min)) &&
                (priceRange.max === '' || product.price <= parseFloat(priceRange.max))
            );

            return matchesSearch && matchesCategory && matchesPrice;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'price-asc': return a.price - b.price;
                case 'price-desc': return b.price - a.price;
                case 'name-desc': return b.name.localeCompare(a.name);
                default: return a.name.localeCompare(b.name);
            }
        });

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedCategory('all');
        setPriceRange({ min: '', max: '' });
        setSortBy('name-asc');
    };

    const hasActiveFilters = searchQuery || selectedCategory !== 'all' ||
        priceRange.min || priceRange.max || sortBy !== 'name-asc';

    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Category icons mapping
    const categoryIcons = {
        'Electronics': '📱',
        'Clothing': '👕',
        'Footwear': '👟',
        'Accessories': '👜',
        'Beauty Products': '💄',
        'Home Living': '🏠'
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
            {/* Modern Header */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg shadow-lg border-b border-purple-100">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-8">
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                ShopHub
                            </h1>
                            <nav className="hidden md:flex gap-6">
                                <button
                                    onClick={() => setActiveTab('home')}
                                    className={`flex items - center gap - 2 px - 4 py - 2 rounded - lg transition - all ${activeTab === 'home' ? 'bg-gradient-primary text-white' : 'hover:bg-purple-50'
                                        } `}
                                >
                                    <Home className="w-4 h-4" />
                                    <span className="font-semibold">Home</span>
                                </button>
                                <button
                                    onClick={() => { setActiveTab('products'); setSelectedCategory('all'); }}
                                    className={`flex items - center gap - 2 px - 4 py - 2 rounded - lg transition - all ${activeTab === 'products' ? 'bg-gradient-primary text-white' : 'hover:bg-purple-50'
                                        } `}
                                >
                                    <Tag className="w-4 h-4" />
                                    <span className="font-semibold">Shop</span>
                                </button>
                            </nav>
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setActiveTab('cart')}
                                className="relative p-2 hover:bg-purple-50 rounded-lg transition-all"
                            >
                                <ShoppingCart className="w-6 h-6 text-purple-600" />
                                {cart.length > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-sm">
                                        {cart.reduce((total, item) => total + item.quantity, 0)}
                                    </span>
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab('orders')}
                                className="p-2 hover:bg-purple-50 rounded-lg transition-all"
                            >
                                <Package className="w-6 h-6 text-purple-600" />
                            </button>
                            <button
                                onClick={() => setActiveTab('notifications')}
                                className="relative p-2 hover:bg-purple-50 rounded-lg transition-all"
                            >
                                <Bell className="w-6 h-6 text-purple-600" />
                                {notifications.length > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 w-2 h-2 rounded-full"></span>
                                )}
                            </button>
                            <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
                                <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold">
                                    {user?.email?.[0].toUpperCase()}
                                </div>
                                <span className="font-semibold text-gray-700 hidden md:block">{user?.email?.split('@')[0]}</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="p-2 hover:bg-red-50 rounded-lg transition-all text-red-600"
                            >
                                <LogOut className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Welcome Home Tab */}
                {activeTab === 'home' && (
                    <div className="space-y-12">
                        {/* Premium Hero Section */}
                        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 shadow-2xl">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

                            <div className="relative z-10 grid lg:grid-cols-2 gap-8 p-8 lg:p-16 items-center">
                                <div className="space-y-8">
                                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium">
                                        <Zap className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                                        <span>Flash Sale: Up to 70% Off!</span>
                                    </div>

                                    <h2 className="text-5xl lg:text-7xl font-extrabold text-white leading-tight">
                                        Elevate Your <span className="text-yellow-300">Style</span> & Life.
                                    </h2>

                                    <p className="text-xl text-white/80 max-w-lg leading-relaxed">
                                        Curated collections for the modern lifestyle. Quality meeting aesthetic in every single detail.
                                    </p>

                                    <div className="flex flex-wrap gap-4">
                                        <button
                                            onClick={() => { setActiveTab('products'); setSelectedCategory('all'); }}
                                            className="px-10 py-4 bg-white text-indigo-600 rounded-2xl font-bold hover:scale-105 transition-all shadow-xl flex items-center gap-2"
                                        >
                                            Shop Collection <ArrowUpRight className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('orders')}
                                            className="px-10 py-4 bg-white/10 backdrop-blur-lg border-2 border-white/30 text-white rounded-2xl font-bold hover:bg-white/20 transition-all"
                                        >
                                            Track Order
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-6 pt-4">
                                        <div className="flex -space-x-3">
                                            {[1, 2, 3, 4].map(i => (
                                                <div key={i} className="w-10 h-10 rounded-full border-2 border-indigo-600 bg-gray-200 overflow-hidden">
                                                    <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" />
                                                </div >
                                            ))}
                                            <div className="w-10 h-10 rounded-full border-2 border-indigo-600 bg-indigo-500 flex items-center justify-center text-white text-[10px] font-bold">
                                                10k+
                                            </div>
                                        </div >
                                        <p className="text-sm text-white/70 italic">Joined by thousands of happy shoppers</p>
                                    </div >
                                </div >

                                <div className="hidden lg:block relative">
                                    <div className="absolute top-0 right-0 w-72 h-72 bg-pink-400 rounded-full blur-[100px] opacity-20"></div>
                                    <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-400 rounded-full blur-[100px] opacity-20"></div>

                                    <div className="relative grid grid-cols-2 gap-4">
                                        <div className="space-y-4 pt-12">
                                            <div className="card p-4 bg-white/90 backdrop-blur-md rotate-[-6deg] hover:rotate-0 transition-transform">
                                                <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300" className="rounded-xl mb-3" alt="Featured" />
                                                <p className="font-bold text-gray-800 text-sm">Smart Watch</p>
                                                <p className="text-indigo-600 font-bold">₹14,999</p>
                                            </div>
                                            <div className="card p-4 bg-white/90 backdrop-blur-md rotate-3 hover:rotate-0 transition-transform">
                                                <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300" className="rounded-xl mb-3" alt="Featured" />
                                                <p className="font-bold text-gray-800 text-sm">Headphones</p>
                                                <p className="text-indigo-600 font-bold">₹8,499</p>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="card p-4 bg-white/90 backdrop-blur-md rotate-[4deg] hover:rotate-0 transition-transform">
                                                <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300" className="rounded-xl mb-3" alt="Featured" />
                                                <p className="font-bold text-gray-800 text-sm">Nike Sneakers</p>
                                                <p className="text-indigo-600 font-bold">₹12,499</p>
                                            </div>
                                            <div className="card p-4 bg-white/90 backdrop-blur-md rotate-[-2deg] hover:rotate-0 transition-transform">
                                                <img src="https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=300" className="rounded-xl mb-3" alt="Featured" />
                                                <p className="font-bold text-gray-800 text-sm">Sunglasses</p>
                                                <p className="text-indigo-600 font-bold">₹4,299</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div >
                        </div >

                        {/* Trust Badges */}
                        < div className="grid grid-cols-2 md:grid-cols-4 gap-4" >
                            {
                                [
                                    { icon: Truck, title: 'Free Shipping', desc: 'On orders over ₹1000', color: 'text-blue-500 bg-blue-50' },
                                    { icon: ShieldCheck, title: 'Secure Payment', desc: '100% safe transactions', color: 'text-green-500 bg-green-50' },
                                    { icon: Clock, title: '24/7 Support', desc: 'Here whenever you need', color: 'text-purple-500 bg-purple-50' },
                                    { icon: Zap, title: 'Fast Delivery', desc: 'Within 24-48 hours', color: 'text-orange-500 bg-orange-50' }
                                ].map((badge, idx) => (
                                    <div key={idx} className="flex items-center gap-4 p-6 bg-white rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                        <div className={`p-4 rounded-2xl ${badge.color}`}>
                                            <badge.icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-800">{badge.title}</h4>
                                            <p className="text-xs text-gray-500">{badge.desc}</p>
                                        </div>
                                    </div>
                                ))
                            }
                        </div >

                        {/* Shop by Category Redesigned */}
                        < div className="space-y-6" >
                            <div className="flex justify-between items-end">
                                <div>
                                    <h3 className="text-3xl font-bold text-gray-800">Shop by Category</h3>
                                    <p className="text-gray-500 mt-1">Explore our wide range of premium collections</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-6 gap-6">
                                {categories.map((category) => (
                                    <button
                                        key={category.id}
                                        onClick={() => { setActiveTab('products'); setSelectedCategory(category.name); }}
                                        className="group space-y-3"
                                    >
                                        <div className="aspect-square rounded-full bg-white shadow-lg flex items-center justify-center p-8 group-hover:scale-110 group-hover:shadow-2xl transition-all duration-300 relative overflow-hidden border-4 border-transparent group-hover:border-indigo-100">
                                            <div className="text-5xl relative z-10 drop-shadow-lg">{categoryIcons[category.name] || '📦'}</div>
                                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        </div>
                                        <div className="text-center">
                                            <h4 className="font-bold text-gray-800 group-hover:text-indigo-600 transition-colors uppercase tracking-wider text-xs">{category.name}</h4>
                                            <p className="text-[10px] text-gray-400 font-medium">
                                                {products.filter(p => p.category?.name === category.name).length} ITEMS
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div >

                        {/* Trending Products Section */}
                        < div className="space-y-8" >
                            <div className="flex justify-between items-end">
                                <div>
                                    <h3 className="text-3xl font-bold text-gray-800">Trending Now</h3>
                                    <p className="text-gray-500 mt-1">Most popular picks from our latest collections</p>
                                </div>
                                <button
                                    onClick={() => { setActiveTab('products'); setSelectedCategory('all'); }}
                                    className="px-6 py-2 text-indigo-600 font-bold hover:bg-indigo-50 rounded-xl transition-all flex items-center gap-2"
                                >
                                    View All Products <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                {products.slice(0, 4).map((product) => (
                                    <div key={product.id} className="group relative">
                                        <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden bg-gray-100 shadow-xl group-hover:-translate-y-2 transition-transform duration-500">
                                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" onError={(e) => { e.target.src = `https://via.placeholder.com/400x500/8B5CF6/ffffff?text=${product.name}`; }} />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                            <div className="absolute top-4 right-4">
                                                <button className="p-3 rounded-2xl bg-white/20 backdrop-blur-md text-white hover:bg-white hover:text-red-500 transition-all shadow-lg">
                                                    <Heart className="w-5 h-5" />
                                                </button>
                                            </div>

                                            <div className="absolute bottom-6 left-6 right-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                                <button
                                                    onClick={() => handleAddToCart(product)}
                                                    className="w-full py-4 bg-white text-gray-900 rounded-2xl font-bold shadow-2xl hover:scale-102 active:scale-95 transition-all flex items-center justify-center gap-2"
                                                >
                                                    <ShoppingCart className="w-5 h-5 text-indigo-600" />
                                                    Add to Cart
                                                </button>
                                            </div>
                                        </div>
                                        <div className="mt-6 px-2">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="font-bold text-gray-800 text-lg group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{product.name}</h4>
                                                <div className="flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded text-green-700 text-xs font-bold">
                                                    <Star className="w-3 h-3 fill-green-700" />
                                                    4.5
                                                </div>
                                            </div>
                                            <p className="text-2xl font-black text-indigo-600">₹{product.price}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div >

                        {/* Newsletter Banner */}
                        < div className="relative rounded-[2.5rem] bg-indigo-900 overflow-hidden p-8 lg:p-16" >
                            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500 rounded-full blur-[100px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>
                            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
                                <div className="text-center lg:text-left space-y-4">
                                    <h3 className="text-4xl font-extrabold text-white">Join the ShopHub Insiders</h3>
                                    <p className="text-indigo-200 text-lg">Get 15% off your first order and exclusive access to new arrivals.</p>
                                </div>
                                <div className="flex w-full lg:w-auto p-2 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20">
                                    <input
                                        type="email"
                                        placeholder="Your email address"
                                        className="bg-transparent text-white px-6 py-4 outline-none flex-1 lg:w-80 placeholder:text-indigo-300"
                                    />
                                    <button className="px-8 py-4 bg-white text-indigo-900 rounded-2xl font-bold hover:scale-105 transition-all">
                                        Subscribe
                                    </button>
                                </div>
                            </div>
                        </div >
                    </div >
                )}

                {/* Products Tab */}
                {
                    activeTab === 'products' && (
                        <div className="space-y-10">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div>
                                    <h2 className="text-4xl font-black text-gray-900 tracking-tight">Explore Collection</h2>
                                    <p className="text-gray-500 mt-2 font-medium">Find the perfect items curated just for you</p>
                                </div>

                                <div className="flex items-center gap-2 px-6 py-3 bg-indigo-50 text-indigo-700 rounded-2xl font-bold border border-indigo-100">
                                    <Activity className="w-5 h-5" />
                                    <span>{filteredProducts.length} Products Found</span>
                                </div>
                            </div>

                            {/* Search & Filter Smart Bar */}
                            <div className="space-y-6">
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-3xl blur opacity-20 group-focus-within:opacity-40 transition-opacity"></div>
                                    <div className="relative bg-white rounded-3xl p-2 flex items-center shadow-xl border border-gray-100">
                                        <div className="p-4">
                                            <Search className="w-6 h-6 text-indigo-500" />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Search by name, category, or brand..."
                                            className="flex-1 bg-transparent py-4 text-xl outline-none text-gray-800 placeholder:text-gray-400 font-medium"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                        <div className="hidden lg:flex items-center gap-2 pr-4 text-gray-400 text-sm font-bold border-l pl-6 border-gray-100">
                                            <kbd className="px-2 py-1 bg-gray-50 rounded border border-gray-200">⌘</kbd>
                                            <kbd className="px-2 py-1 bg-gray-50 rounded border border-gray-200">K</kbd>
                                        </div>
                                    </div>
                                </div>

                                {/* Refined Filters */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-white rounded-3xl shadow-sm border border-gray-100">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Category</label>
                                        <div className="relative">
                                            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500" />
                                            <select
                                                className="w-full pl-11 pr-4 py-3 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all font-bold text-gray-700 appearance-none outline-none"
                                                value={selectedCategory}
                                                onChange={(e) => setSelectedCategory(e.target.value)}
                                            >
                                                <option value="all">Every Category</option>
                                                {categories.map(cat => (
                                                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Price Range</label>
                                        <div className="flex gap-4">
                                            <div className="relative flex-1">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                                                <input
                                                    type="number"
                                                    placeholder="Min"
                                                    className="w-full pl-8 pr-4 py-3 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all font-bold text-gray-700 outline-none"
                                                    value={priceRange.min}
                                                    onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                                                />
                                            </div>
                                            <div className="relative flex-1">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                                                <input
                                                    type="number"
                                                    placeholder="Max"
                                                    className="w-full pl-8 pr-4 py-3 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all font-bold text-gray-700 outline-none"
                                                    value={priceRange.max}
                                                    onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Sort By</label>
                                        <div className="relative">
                                            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500" />
                                            <select
                                                className="w-full pl-11 pr-4 py-3 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all font-bold text-gray-700 appearance-none outline-none"
                                                value={sortBy}
                                                onChange={(e) => setSortBy(e.target.value)}
                                            >
                                                <option value="name-asc">Alphabetical (A-Z)</option>
                                                <option value="name-desc">Alphabetical (Z-A)</option>
                                                <option value="price-asc">Price: Low to High</option>
                                                <option value="price-desc">Price: High to Low</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {hasActiveFilters && (
                                    <div className="flex justify-start">
                                        <button
                                            onClick={clearFilters}
                                            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                            Reset All Filters
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Products Premium Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                                {filteredProducts.length === 0 ? (
                                    <div className="col-span-full py-24 text-center space-y-4">
                                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                                            <Package className="w-12 h-12 text-gray-300" />
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-2xl font-bold text-gray-800">No matching items</h3>
                                            <p className="text-gray-500 max-w-xs mx-auto text-sm">Try adjusting your filters or search query to find what you're looking for.</p>
                                        </div>
                                        <button onClick={clearFilters} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all">
                                            Clear All Filters
                                        </button>
                                    </div>
                                ) : (
                                    filteredProducts.map((product) => (
                                        <div key={product.id} className="group relative">
                                            <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-white shadow-xl group-hover:-translate-y-3 transition-all duration-500 border border-transparent group-hover:border-indigo-100">
                                                <img
                                                    src={product.imageUrl}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                    onError={(e) => { e.target.src = `https://via.placeholder.com/400x500/F3F4F6/6366F1?text=${product.name}`; }}
                                                />

                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                                <div className="absolute top-6 left-6 flex flex-col gap-2">
                                                    <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-lg text-[10px] font-black tracking-widest text-indigo-600 uppercase">
                                                        {product.category?.name || 'New Item'}
                                                    </span>
                                                    {product.quantity < 5 && (
                                                        <span className="px-3 py-1 bg-red-500/90 backdrop-blur-md rounded-lg text-[10px] font-black tracking-widest text-white uppercase animate-pulse">
                                                            Low Stock
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="absolute top-6 right-6">
                                                    <button className="p-4 rounded-2xl bg-white/80 backdrop-blur-lg text-gray-800 hover:text-red-500 hover:bg-white transition-all shadow-xl">
                                                        <Heart className="w-5 h-5" />
                                                    </button>
                                                </div>

                                                <div className="absolute bottom-8 left-8 right-8 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between text-white">
                                                            <span className="text-xs font-bold opacity-80">Quick Shop</span>
                                                            <div className="flex gap-1">
                                                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                                                <Star className="w-3 h-3 opacity-40 fill-white text-white" />
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleAddToCart(product)}
                                                            disabled={product.quantity <= 0}
                                                            className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl transition-all flex items-center justify-center gap-2 ${product.quantity > 0
                                                                ? 'bg-white text-indigo-600 hover:bg-indigo-50 active:scale-95'
                                                                : 'bg-gray-200 text-gray-500 cursor-not-allowed opacity-80'
                                                                }`}
                                                        >
                                                            <ShoppingCart className="w-5 h-5" />
                                                            {product.quantity > 0 ? 'Add to Bag' : 'Out of Stock'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-6 px-4 space-y-1">
                                                <h4 className="font-bold text-gray-800 text-xl group-hover:text-indigo-600 transition-colors line-clamp-1">{product.name}</h4>
                                                <div className="flex items-center justify-between">
                                                    <p className="text-2xl font-black text-indigo-600">₹{product.price.toLocaleString()}</p>
                                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">
                                                        {product.quantity > 0 ? 'In Stock' : 'Unavailable'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )
                }

                {/* Cart Tab */}
                {
                    activeTab === 'cart' && (
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800 mb-6">Shopping Cart ({cart.length})</h2>
                            {cart.length === 0 ? (
                                <div className="card text-center py-16">
                                    <ShoppingCart className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                                    <p className="text-xl text-gray-600 mb-4">Your cart is empty</p>
                                    <button
                                        onClick={() => { setActiveTab('products'); setSelectedCategory('all'); }}
                                        className="btn-primary px-8 py-3"
                                    >
                                        Start Shopping
                                    </button>
                                </div>
                            ) : (
                                <div className="grid lg:grid-cols-3 gap-6">
                                    <div className="lg:col-span-2 space-y-4">
                                        {cart.map((item) => (
                                            <div key={item.id} className="card flex gap-4">
                                                <img src={item.imageUrl} alt={item.name} className="w-24 h-24 object-cover rounded-lg" onError={(e) => { e.target.src = `https://via.placeholder.com/200/8B5CF6/ffffff?text=Product`; }} />
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-gray-800">{item.name}</h3>
                                                    <p className="text-gray-600 text-sm">₹{item.price} x {item.quantity}</p>
                                                    <div className="flex items-center gap-3 mt-2">
                                                        <button onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)} className="p-1 bg-gray-100 rounded hover:bg-gray-200">
                                                            <Minus className="w-4 h-4" />
                                                        </button>
                                                        <span className="font-semibold">{item.quantity}</span>
                                                        <button onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)} className="p-1 bg-gray-100 rounded hover:bg-gray-200">
                                                            <Plus className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => handleRemoveFromCart(item.productId)} className="ml-auto text-red-600 hover:text-red-700">
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xl font-bold text-purple-600">₹{Math.round(item.price * item.quantity)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="card h-fit sticky top-24">
                                        <h3 className="text-xl font-bold mb-4">Order Summary</h3>
                                        <div className="space-y-2 mb-4">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Subtotal</span>
                                                <span className="font-semibold">₹{Math.round(cartTotal)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Delivery</span>
                                                <span className="font-semibold text-green-600">FREE</span>
                                            </div>
                                            <div className="border-t pt-2 flex justify-between">
                                                <span className="font-bold text-lg">Total</span>
                                                <span className="font-bold text-2xl text-purple-600">₹{Math.round(cartTotal)}</span>
                                            </div>
                                        </div>
                                        <button onClick={() => setShowCheckout(true)} className="w-full btn-primary py-3 text-lg">
                                            Proceed to Checkout
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                }

                {/* Orders Tab */}
                {
                    activeTab === 'orders' && (
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800 mb-6">My Orders</h2>
                            {orders.length === 0 ? (
                                <div className="card text-center py-16">
                                    <Package className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                                    <p className="text-xl text-gray-600">No orders yet</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {orders.map((order) => (
                                        <div key={order.id} className="card cursor-pointer hover:shadow-lg transition-transform hover:-translate-y-1" onClick={() => setSelectedOrder(order)}>
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <p className="text-sm text-gray-600">Order #{order.id}</p>
                                                    <p className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</p>
                                                </div>
                                                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${order.status === 'CONFIRMED' || order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                                    order.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                                        order.status === 'DELIVERED' ? 'bg-blue-100 text-blue-700' :
                                                            order.status === 'DENIED' ? 'bg-red-100 text-red-700' :
                                                                'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {order.status === 'CONFIRMED' ? 'PENDING' : order.status}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <p className="text-2xl font-bold text-purple-600">₹{Math.round(order.totalAmount)}</p>
                                                <div className="text-right">
                                                    {order.status === 'APPROVED' && (
                                                        <span className="text-xs font-bold text-green-600 block">Action: APPROVED</span>
                                                    )}
                                                    {order.status === 'DELIVERED' && (
                                                        <span className="text-xs font-bold text-blue-600 block">Action: DELIVERED</span>
                                                    )}
                                                    {(order.status === 'CONFIRMED' || order.status === 'PENDING') && (
                                                        <span className="text-xs font-medium text-yellow-600 italic block">Awaiting Approval</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )
                }

                {/* Notifications Tab */}
                {
                    activeTab === 'notifications' && (
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800 mb-6">Notifications</h2>
                            {notifications.length === 0 ? (
                                <div className="card text-center py-16">
                                    <Bell className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                                    <p className="text-xl text-gray-600">No notifications</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {[...notifications].reverse().map((notif) => (
                                        <div key={notif.id} className="card hover:shadow-lg transition-shadow">
                                            {notif.subject && (
                                                <p className="text-sm font-bold text-purple-600 mb-1">{notif.subject}</p>
                                            )}
                                            <p className="font-semibold text-gray-800">{notif.message}</p>
                                            <p className="text-sm text-gray-500 mt-1">{new Date(notif.sentAt || notif.createdAt).toLocaleString()}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )
                }
            </div >

            {/* Order Detail Modal */}
            {
                selectedOrder && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold">Order Details #{selectedOrder.id}</h3>
                                <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-100 rounded-full">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                                    <div>
                                        <p className="text-sm text-gray-600">Status</p>
                                        <p className="font-bold text-lg">{selectedOrder.status === 'CONFIRMED' ? 'PENDING' : selectedOrder.status}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-600">Date</p>
                                        <p className="font-bold">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-bold mb-3">Shipping Address</h4>
                                    <div className="p-4 bg-gray-50 rounded-xl">
                                        <p className="text-gray-700">{selectedOrder.shippingAddress}</p>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-bold mb-3">Items</h4>
                                    <div className="space-y-4">
                                        {(selectedOrder.items || []).map((item) => {
                                            const productFallback = products.find(p => p.id === item.productId);
                                            const displayImage = item.imageUrl || productFallback?.imageUrl || 'https://via.placeholder.com/150';
                                            const displayName = item.name || productFallback?.name || 'Product Detail';

                                            return (
                                                <div key={item.id} className="flex gap-4 p-3 border rounded-xl hover:bg-gray-50">
                                                    <img
                                                        src={displayImage}
                                                        alt={displayName}
                                                        className="w-20 h-20 object-cover rounded-lg"
                                                    />
                                                    <div className="flex-1">
                                                        <h5 className="font-bold">{displayName}</h5>
                                                        <p className="text-sm text-gray-600">PID: {item.productId}</p>
                                                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold text-purple-600">₹{item.price}</p>
                                                        <p className="text-xs text-gray-500">Subtotal: ₹{item.price * item.quantity}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="border-t pt-4 my-4">
                                    <div className="flex justify-between text-xl font-bold">
                                        <span>Total Amount</span>
                                        <span className="text-purple-600">₹{Math.round(selectedOrder.totalAmount)}</span>
                                    </div>
                                </div>

                                {selectedOrder.transactionId && (
                                    <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                                        <p className="text-sm text-purple-600 font-semibold mb-1">Payment Info</p>
                                        <p className="text-xs font-mono text-purple-800">Txn ID: {selectedOrder.transactionId}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Checkout Modal */}
            {
                showCheckout && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="card max-w-md w-full max-h-[90vh] overflow-y-auto">
                            <h3 className="text-2xl font-bold mb-6">Checkout</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Shipping Address</label>
                                    <textarea
                                        className="input-field h-24"
                                        value={shippingAddress}
                                        onChange={(e) => setShippingAddress(e.target.value)}
                                        placeholder="Enter your complete address"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Pincode</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        value={pincode}
                                        onChange={(e) => setPincode(e.target.value)}
                                        placeholder="Enter pincode"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Payment Method</label>
                                    <select
                                        className="input-field"
                                        value={paymentMethod}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    >
                                        <option value="UPI">UPI / GPay / PhonePe</option>
                                        <option value="CARD">Credit / Debit Card</option>
                                        <option value="COD">Cash on Delivery</option>
                                    </select>
                                </div>

                                {/* Payment specific UI */}
                                {paymentMethod === 'UPI' && (
                                    <div className="text-center p-4 bg-gray-50 rounded-lg border-2 border-dashed border-purple-200">
                                        <div className="bg-white p-2 inline-block rounded-lg shadow-sm mb-2">
                                            <img
                                                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=retail@upi&pn=RetailShop&am=${Math.round(cartTotal)}&cu=INR`}
                                                alt="UPI QR Code"
                                                className="w-32 h-32"
                                            />
                                        </div>
                                        <p className="text-sm font-medium text-gray-600">Scan to pay ₹{Math.round(cartTotal)}</p>
                                        <p className="text-xs text-purple-500 mt-1">Accepts GPay, PhonePe, Paytm</p>
                                    </div>
                                )}

                                {paymentMethod === 'CARD' && (
                                    <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200 animate-in fade-in slide-in-from-top-2">
                                        <div className="relative">
                                            <CreditCard className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Card Number"
                                                className="input-field pl-10"
                                                value={cardDetails.number}
                                                onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value.replace(/\D/g, '').slice(0, 16) })}
                                            />
                                        </div>
                                        <div className="flex gap-3">
                                            <input
                                                type="text"
                                                placeholder="MM/YY"
                                                className="input-field"
                                                value={cardDetails.expiry}
                                                onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value.slice(0, 5) })}
                                            />
                                            <input
                                                type="password"
                                                placeholder="CVV"
                                                className="input-field"
                                                value={cardDetails.cvv}
                                                onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) })}
                                            />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Card Holder Name"
                                            className="input-field"
                                            value={cardDetails.name}
                                            onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                                        />
                                    </div>
                                )}
                                <div className="border-t pt-4">
                                    <div className="flex justify-between mb-4">
                                        <span className="font-bold text-lg">Total Amount</span>
                                        <span className="font-bold text-2xl text-purple-600">₹{Math.round(cartTotal)}</span>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={() => setShowCheckout(false)} className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50">
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleCheckout}
                                        disabled={isProcessing}
                                        className={`flex-1 btn-primary py-3 flex items-center justify-center gap-2 ${isProcessing ? 'opacity-75 cursor-not-allowed' : ''}`}
                                    >
                                        {isProcessing ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                Processing...
                                            </>
                                        ) : (
                                            'Place Order'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div>
    );
};

export default UserDashboard;
