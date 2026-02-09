import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Home, ShoppingCart, Package, Bell, LogOut, Search, Plus, Minus, Trash2, CreditCard,
    Sparkles, TrendingUp, Tag, Star, Heart, Filter, X
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
            // Removed blocking alert('Added to cart!'); 
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
            alert(`Order placed successfully! Order ID: ${orderId}`);

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
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${activeTab === 'home' ? 'bg-gradient-primary text-white' : 'hover:bg-purple-50'
                                        }`}
                                >
                                    <Home className="w-4 h-4" />
                                    <span className="font-semibold">Home</span>
                                </button>
                                <button
                                    onClick={() => { setActiveTab('products'); setSelectedCategory('all'); }}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${activeTab === 'products' ? 'bg-gradient-primary text-white' : 'hover:bg-purple-50'
                                        }`}
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
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                                        {cart.length}
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
                    <div className="space-y-8">
                        {/* Hero Section */}
                        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 p-12 text-white shadow-2xl">
                            <div className="absolute inset-0 bg-black/10"></div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <Sparkles className="w-8 h-8 animate-pulse" />
                                    <h2 className="text-4xl font-bold">Welcome back, {user?.email?.split('@')[0]}!</h2>
                                </div>
                                <p className="text-xl text-white/90 mb-6">Discover amazing products tailored just for you</p>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => { setActiveTab('products'); setSelectedCategory('all'); }}
                                        className="px-8 py-3 bg-white text-purple-600 rounded-xl font-bold hover:scale-105 transition-transform shadow-lg"
                                    >
                                        Start Shopping
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('orders')}
                                        className="px-8 py-3 bg-white/20 backdrop-blur-lg border-2 border-white rounded-xl font-bold hover:bg-white/30 transition-all"
                                    >
                                        Track Orders
                                    </button>
                                </div>
                            </div>
                            <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                            <div className="absolute left-0 bottom-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                        </div>

                        {/* Shop by Category */}
                        <div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                                <Tag className="w-7 h-7 text-purple-600" />
                                Shop by Category
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                {categories.map((category, index) => (
                                    <button
                                        key={category.id}
                                        onClick={() => { setActiveTab('products'); setSelectedCategory(category.name); }}
                                        className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-purple-50 p-6 shadow-lg hover:shadow-2xl transition-all hover:scale-105 border border-purple-100"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-pink-400/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        <div className="relative z-10 text-center">
                                            <div className="text-5xl mb-3">{categoryIcons[category.name] || '📦'}</div>
                                            <h4 className="font-bold text-gray-800 text-sm">{category.name}</h4>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {products.filter(p => p.category?.name === category.name).length} items
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>



                        {/* Quick Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6">
                                <ShoppingCart className="w-10 h-10 mb-3 opacity-80" />
                                <h4 className="text-3xl font-bold mb-1">{cart.length}</h4>
                                <p className="text-white/80">Items in Cart</p>
                            </div>
                            <div className="card bg-gradient-to-br from-pink-500 to-pink-600 text-white p-6">
                                <Package className="w-10 h-10 mb-3 opacity-80" />
                                <h4 className="text-3xl font-bold mb-1">{orders.length}</h4>
                                <p className="text-white/80">Total Orders</p>
                            </div>
                            <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6">
                                <Tag className="w-10 h-10 mb-3 opacity-80" />
                                <h4 className="text-3xl font-bold mb-1">{products.length}</h4>
                                <p className="text-white/80">Products Available</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Products Tab */}
                {activeTab === 'products' && (
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800 mb-6">Explore Products</h2>

                        {/* Search Bar */}
                        <div className="mb-6 relative">
                            <Search className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search for products..."
                                className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-purple-200 focus:border-purple-500 outline-none text-lg"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Filters */}
                        <div className="card mb-6">
                            <div className="flex flex-wrap gap-4 items-end">
                                <div className="flex-1 min-w-[200px]">
                                    <label className="block text-sm font-semibold mb-2 text-gray-700">Category</label>
                                    <select className="input-field" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                                        <option value="all">All Categories</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex-1 min-w-[200px]">
                                    <label className="block text-sm font-semibold mb-2 text-gray-700">Price Range (₹)</label>
                                    <div className="flex gap-2">
                                        <input type="number" placeholder="Min" className="input-field" value={priceRange.min} onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })} />
                                        <input type="number" placeholder="Max" className="input-field" value={priceRange.max} onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })} />
                                    </div>
                                </div>

                                <div className="flex-1 min-w-[200px]">
                                    <label className="block text-sm font-semibold mb-2 text-gray-700">Sort By</label>
                                    <select className="input-field" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                        <option value="name-asc">Name (A-Z)</option>
                                        <option value="name-desc">Name (Z-A)</option>
                                        <option value="price-asc">Price (Low to High)</option>
                                        <option value="price-desc">Price (High to Low)</option>
                                    </select>
                                </div>

                                {hasActiveFilters && (
                                    <button onClick={clearFilters} className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors h-fit flex items-center gap-2">
                                        <X className="w-4 h-4" />
                                        Clear
                                    </button>
                                )}
                            </div>

                            <div className="mt-4 flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-semibold text-gray-600">Results: {filteredProducts.length} products</span>
                                {selectedCategory !== 'all' && (
                                    <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
                                        {categoryIcons[selectedCategory]} {selectedCategory}
                                    </span>
                                )}
                                {(priceRange.min || priceRange.max) && (
                                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                                        ₹{priceRange.min || '0'} - ₹{priceRange.max || '∞'}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Products Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredProducts.length === 0 ? (
                                <div className="col-span-full card text-center py-12">
                                    <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600">No products found</p>
                                </div>
                            ) : (
                                filteredProducts.map((product) => (
                                    <div key={product.id} className="group card hover:shadow-2xl transition-all transform hover:scale-105">
                                        <div className="relative overflow-hidden rounded-t-xl h-56 bg-white flex items-center justify-center p-4">
                                            <img
                                                src={product.imageUrl}
                                                alt={product.name}
                                                className="max-w-full max-h-full object-contain"
                                            />
                                            <button className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-all opacity-0 group-hover:opacity-100">
                                                <Heart className="w-5 h-5 text-red-500" />
                                            </button>
                                        </div>
                                        <div className="p-4">
                                            <p className="text-xs text-purple-600 font-semibold mb-1">{product.category?.name}</p>
                                            <h3 className="font-bold text-gray-800 mb-2 line-clamp-2 text-lg">{product.name}</h3>
                                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                                            <div className="flex justify-between items-center mb-4">
                                                <p className="text-2xl font-bold text-primary-600">₹{product.price}</p>
                                                {product.quantity > 0 ? (
                                                    <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">In Stock: {product.quantity}</span>
                                                ) : (
                                                    <span className="text-sm bg-red-100 text-red-800 px-2 py-1 rounded">Out of Stock</span>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => handleAddToCart(product)}
                                                disabled={product.quantity <= 0}
                                                className={`w-full py-2 rounded-xl flex items-center justify-center gap-2 transition-all ${product.quantity > 0
                                                    ? 'bg-gradient-primary text-white hover:shadow-lg hover:scale-[1.02]'
                                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                    }`}
                                            >
                                                <ShoppingCart className="w-5 h-5" />
                                                {product.quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* Cart Tab */}
                {activeTab === 'cart' && (
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
                )}

                {/* Orders Tab */}
                {activeTab === 'orders' && (
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
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
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
                )}
            </div>

            {/* Order Detail Modal */}
            {selectedOrder && (
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
            )}

            {/* Checkout Modal */}
            {showCheckout && (
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
            )}
        </div>
    );
};

export default UserDashboard;
