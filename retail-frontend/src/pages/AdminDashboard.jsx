import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard, Package, BarChart3, Settings, LogOut,
    Plus, Edit, Trash2, Check, X, Bell, Users,
    TrendingUp, IndianRupee, AlertCircle, ArrowRight, Activity
} from 'lucide-react';
import { productAPI, categoryAPI, inventoryAPI, orderAPI, notificationAPI } from '../services/api';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [categories, setCategories] = useState([]);
    const [showProductModal, setShowProductModal] = useState(false);
    const [newProduct, setNewProduct] = useState({ name: '', description: '', price: '', quantity: '', categoryId: 1, imageUrl: '' });

    useEffect(() => {
        if (user?.role !== 'ADMIN') {
            navigate('/dashboard');
        }
        loadData();
    }, [user]);

    const loadData = async () => {
        try {
            const [productsRes, ordersRes, categoriesRes] = await Promise.all([
                productAPI.getAll(),
                orderAPI.getAllOrders().catch((err) => {
                    console.error("Failed to load orders", err);
                    return { data: [] };
                }),
                categoryAPI.getAll().catch((err) => {
                    console.error("Failed to load categories", err);
                    return { data: [] };
                })
            ]);
            setProducts(productsRes.data || []);
            setOrders(ordersRes.data || []);
            setCategories(categoriesRes.data || []);
        } catch (error) {
            console.error('Error loading data:', error);
        }
    };

    const handleUpdateOrderStatus = async (orderId, status) => {
        try {
            await orderAPI.updateStatus(orderId, status);
            alert(`Order ${status.toLowerCase()} successfully!`);
            loadData();
        } catch (error) {
            console.error(`Error updating order status to ${status}:`, error);
            alert(`Failed to update order status`);
        }
    };

    const handleEditProduct = (product) => {
        setNewProduct({
            ...product,
            price: product.price.toString(),
            quantity: product.quantity ? product.quantity.toString() : '0',
            categoryId: product.category ? product.category.id : (product.categoryId || 1)
        });
        setShowProductModal(true);
    };

    const handleSaveProduct = async () => {
        try {
            const price = parseFloat(newProduct.price);
            const quantity = parseInt(newProduct.quantity);
            const categoryId = parseInt(newProduct.categoryId);

            if (isNaN(price) || price < 0) {
                alert('Please enter a valid price');
                return;
            }
            if (isNaN(quantity) || quantity < 0) {
                alert('Please enter a valid quantity');
                return;
            }
            if (!categoryId || isNaN(categoryId)) {
                alert('Please select a valid category');
                return;
            }

            const productData = {
                ...newProduct,
                price: price,
                quantity: quantity || 0,
                categoryId: categoryId
            };

            // Format for backend expectation
            const selectedCategory = categories.find(c => c.id === productData.categoryId) || { id: productData.categoryId };
            productData.category = selectedCategory;

            console.log("Sending product data:", productData);

            let productId;
            if (newProduct.id) {
                // Update existing
                const response = await productAPI.update(newProduct.id, productData);
                productId = newProduct.id;
                // Update Inventory
                try {
                    await inventoryAPI.updateStock(productId, quantity);
                } catch (invError) {
                    console.error("Failed to update inventory", invError);
                }
                alert('Product updated successfully!');
            } else {
                // Create new
                const response = await productAPI.create(productData);
                productId = response.data.id;

                // Initialize Inventory
                try {
                    await inventoryAPI.updateStock(productId, quantity);
                } catch (invError) {
                    console.error("Failed to initialize inventory", invError);
                }

                try {
                    await notificationAPI.sendNotification({
                        userId: 0,
                        type: 'EMAIL',
                        recipient: 'all@users.com',
                        subject: 'New Product Launched!',
                        message: `Check out our new product: ${newProduct.name}`
                    });
                } catch (notifError) {
                    console.error("Notification failed but product created", notifError);
                }
                alert('Product created successfully!');
            }

            setShowProductModal(false);
            setNewProduct({ name: '', description: '', price: '', quantity: '', categoryId: 1, imageUrl: '' });
            loadData();
        } catch (error) {
            console.error('Error saving product:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
            alert(`Failed to save product: ${errorMessage}`);
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await productAPI.delete(productId);
                alert('Product deleted successfully!');
                loadData();
            } catch (error) {
                console.error('Error deleting product:', error);
                alert('Failed to delete product');
            }
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="min-h-screen flex">
            {/* Sidebar */}
            <div className="w-64 bg-white shadow-xl p-6 flex flex-col h-screen sticky top-0">
                <div className="flex items-center gap-3 mb-8">
                    <div className="bg-gradient-primary p-2 rounded-xl">
                        <Package className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
                </div>

                <nav className="space-y-2">
                    <button
                        onClick={() => setActiveTab('dashboard')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-gradient-primary text-white' : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        <LayoutDashboard className="w-5 h-5" />
                        <span>Dashboard</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('products')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'products' ? 'bg-gradient-primary text-white' : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        <Package className="w-5 h-5" />
                        <span>Products</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'orders' ? 'bg-gradient-primary text-white' : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        <BarChart3 className="w-5 h-5" />
                        <span>Orders</span>
                    </button>
                </nav>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 mt-auto text-red-600 hover:bg-red-50 rounded-xl transition-all"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-8">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-800">
                        {activeTab === 'dashboard' && 'Dashboard'}
                        {activeTab === 'products' && 'Product Management'}
                        {activeTab === 'orders' && 'Order Management'}
                    </h2>
                    <div className="flex items-center gap-3">
                        <Bell className="w-6 h-6 text-gray-600" />
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold">
                                A
                            </div>
                            <span className="font-semibold">Admin</span>
                        </div>
                    </div>
                </div>

                {/* Dashboard Tab */}
                {activeTab === 'dashboard' && (
                    <div className="space-y-8">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="card bg-gradient-to-br from-indigo-500 to-indigo-700 text-white p-6 relative overflow-hidden group">
                                <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform">
                                    <IndianRupee className="w-24 h-24" />
                                </div>
                                <div className="relative z-10">
                                    <p className="text-indigo-100 text-sm font-medium mb-1">Total Revenue</p>
                                    <h3 className="text-3xl font-bold">₹{Math.round(orders.reduce((sum, o) => sum + o.totalAmount, 0))}</h3>
                                    <div className="mt-4 flex items-center text-xs text-indigo-100 bg-white/10 w-fit px-2 py-1 rounded">
                                        <TrendingUp className="w-3 h-3 mr-1" />
                                        <span>+12.5% vs last month</span>
                                    </div>
                                </div>
                            </div>

                            <div className="card bg-gradient-to-br from-purple-500 to-purple-700 text-white p-6 relative overflow-hidden group">
                                <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform">
                                    <Package className="w-24 h-24" />
                                </div>
                                <div className="relative z-10">
                                    <p className="text-purple-100 text-sm font-medium mb-1">Total Products</p>
                                    <h3 className="text-3xl font-bold">{products.length}</h3>
                                    <button onClick={() => setActiveTab('products')} className="mt-4 text-xs bg-white text-purple-700 font-bold px-3 py-1 rounded-lg flex items-center gap-1 hover:bg-purple-50">
                                        Manage <ArrowRight className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>

                            <div className="card bg-gradient-to-br from-pink-500 to-pink-700 text-white p-6 relative overflow-hidden group">
                                <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform">
                                    <BarChart3 className="w-24 h-24" />
                                </div>
                                <div className="relative z-10">
                                    <p className="text-pink-100 text-sm font-medium mb-1">Total Orders</p>
                                    <h3 className="text-3xl font-bold">{orders.length}</h3>
                                    <button onClick={() => setActiveTab('orders')} className="mt-4 text-xs bg-white text-pink-700 font-bold px-3 py-1 rounded-lg flex items-center gap-1 hover:bg-pink-50">
                                        View All <ArrowRight className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>

                            <div className="card bg-gradient-to-br from-amber-500 to-amber-700 text-white p-6 relative overflow-hidden group">
                                <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform">
                                    <AlertCircle className="w-24 h-24" />
                                </div>
                                <div className="relative z-10">
                                    <p className="text-amber-100 text-sm font-medium mb-1">Pending Approvals</p>
                                    <h3 className="text-3xl font-bold">{orders.filter(o => o.status === 'PENDING' || o.status === 'CONFIRMED').length}</h3>
                                    <div className="mt-4 flex items-center text-xs bg-white/20 px-2 py-1 rounded animate-pulse">
                                        <span>Action Required</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Recent Orders Section */}
                            <div className="lg:col-span-2 card bg-white shadow-sm border border-gray-100">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-bold flex items-center gap-2">
                                        <Activity className="w-5 h-5 text-indigo-600" />
                                        Recent Activity
                                    </h3>
                                    <button onClick={() => setActiveTab('orders')} className="text-sm text-indigo-600 font-semibold hover:underline">
                                        See all
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {orders.slice(0, 5).map(order => (
                                        <div key={order.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs">
                                                    #{order.id}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-800">Order from User {order.userId}</p>
                                                    <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-gray-900">₹{order.totalAmount}</p>
                                                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${order.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                                    order.status === 'DELIVERED' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                    {orders.length === 0 && (
                                        <div className="text-center py-8 text-gray-500">
                                            No recent orders found.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Quick Actions & Low Stock */}
                            <div className="space-y-6">
                                <div className="card bg-white shadow-sm border border-gray-100">
                                    <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
                                    <div className="grid grid-cols-1 gap-3">
                                        <button
                                            onClick={() => { setActiveTab('products'); setShowProductModal(true); }}
                                            className="flex items-center gap-3 p-3 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-all font-medium"
                                        >
                                            <Plus className="w-5 h-5" />
                                            Add New Product
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('orders')}
                                            className="flex items-center gap-3 p-3 rounded-xl bg-pink-50 text-pink-700 hover:bg-pink-100 transition-all font-medium"
                                        >
                                            <Check className="w-5 h-5" />
                                            Approve Orders
                                        </button>
                                        <button
                                            className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 text-gray-700 hover:bg-gray-100 transition-all font-medium"
                                        >
                                            <Settings className="w-5 h-5" />
                                            System Settings
                                        </button>
                                    </div>
                                </div>

                                <div className="card bg-white shadow-sm border border-gray-100">
                                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                        <AlertCircle className="w-5 h-5 text-amber-500" />
                                        Low Stock Alert
                                    </h3>
                                    <div className="space-y-3">
                                        {products.filter(p => p.quantity < 5).slice(0, 3).map(product => (
                                            <div key={product.id} className="flex justify-between items-center text-sm p-2 bg-amber-50 rounded-lg">
                                                <span className="font-medium text-gray-800 line-clamp-1">{product.name}</span>
                                                <span className="text-red-600 font-bold whitespace-nowrap">{product.quantity} left</span>
                                            </div>
                                        ))}
                                        {products.filter(p => p.quantity < 5).length === 0 && (
                                            <p className="text-sm text-gray-500 text-center py-2">Stock levels are healthy.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Products Tab */}
                {activeTab === 'products' && (
                    <div>
                        <button
                            onClick={() => {
                                setNewProduct({ name: '', description: '', price: '', quantity: '', categoryId: 1, imageUrl: '' });
                                setShowProductModal(true);
                            }}
                            className="btn-primary mb-6 flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Add New Product
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {products.map((product) => (
                                <div key={product.id} className="card">
                                    <div className="h-48 bg-white rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                                        <img src={product.imageUrl} alt={product.name} className="max-h-full object-contain" />
                                    </div>
                                    <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                                    <div className="flex justify-between items-center mb-4">
                                        <p className="text-2xl font-bold text-primary-600">₹{product.price}</p>
                                        <span className="text-sm bg-gray-100 px-2 py-1 rounded text-gray-600">Qty: {product.quantity}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEditProduct(product)}
                                            className="btn-secondary flex-1 flex items-center justify-center gap-1"
                                        >
                                            <Edit className="w-4 h-4" />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteProduct(product.id)}
                                            className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                                            title="Delete Product"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Orders Tab */}
                {activeTab === 'orders' && (
                    <div className="card">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-3 px-4">Order ID</th>
                                    <th className="text-left py-3 px-4">User ID</th>
                                    <th className="text-left py-3 px-4">Txn ID</th>
                                    <th className="text-left py-3 px-4">Amount</th>
                                    <th className="text-left py-3 px-4">Address</th>
                                    <th className="text-left py-3 px-4">Status</th>
                                    <th className="text-left py-3 px-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <tr key={order.id} className="border-b hover:bg-gray-50">
                                        <td className="py-3 px-4">#{order.id}</td>
                                        <td className="py-3 px-4">{order.userId}</td>
                                        <td className="py-3 px-4 font-mono text-xs">{order.transactionId || 'N/A'}</td>
                                        <td className="py-3 px-4">₹{order.totalAmount}</td>
                                        <td className="py-3 px-4">{order.shippingAddress}</td>
                                        <td className="py-3 px-4">
                                            <span className={`px-3 py-1 rounded-full text-sm ${order.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                                order.status === 'DELIVERED' ? 'bg-blue-100 text-blue-800' :
                                                    order.status === 'SHIPPED' ? 'bg-indigo-100 text-indigo-800' :
                                                        order.status === 'DENIED' ? 'bg-red-100 text-red-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {order.status === 'CONFIRMED' ? 'PENDING' : order.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            {order.status === 'PENDING' || order.status === 'CONFIRMED' ? (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleUpdateOrderStatus(order.id, 'APPROVED')}
                                                        className="btn-primary px-3 py-1 flex items-center gap-1 text-sm bg-green-600 hover:bg-green-700"
                                                    >
                                                        <Check className="w-3 h-3" />
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateOrderStatus(order.id, 'DENIED')}
                                                        className="px-3 py-1 flex items-center gap-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
                                                    >
                                                        <X className="w-3 h-3" />
                                                        Deny
                                                    </button>
                                                </div>
                                            ) : order.status === 'APPROVED' ? (
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-xs font-bold text-green-600">Action: APPROVED</span>
                                                    <button
                                                        onClick={() => handleUpdateOrderStatus(order.id, 'DELIVERED')}
                                                        className="px-3 py-1 flex items-center gap-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                                    >
                                                        <Check className="w-3 h-3" />
                                                        Mark as Delivered
                                                    </button>
                                                </div>
                                            ) : order.status === 'DELIVERED' ? (
                                                <span className="text-sm font-bold text-blue-600">Status: DELIVERED</span>
                                            ) : null}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Product Modal */}
            {showProductModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="card w-full max-w-md">
                        <h3 className="text-2xl font-bold mb-4">
                            {newProduct.id ? 'Edit Product' : 'Add New Product'}
                        </h3>
                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="Product Name"
                                className="input-field"
                                value={newProduct.name}
                                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                            />
                            <textarea
                                placeholder="Description"
                                className="input-field"
                                rows="3"
                                value={newProduct.description}
                                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="number"
                                    placeholder="Price"
                                    className="input-field"
                                    value={newProduct.price}
                                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                                />
                                <input
                                    type="number"
                                    placeholder="Quantity"
                                    className="input-field"
                                    value={newProduct.quantity}
                                    onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
                                />
                            </div>

                            <select
                                className="input-field"
                                value={newProduct.categoryId}
                                onChange={(e) => setNewProduct({ ...newProduct, categoryId: e.target.value })}
                            >
                                <option value="">Select Category</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                                {categories.length === 0 && <option value="1">Default Category</option>}
                            </select>

                            <input
                                type="text"
                                placeholder="Image URL"
                                className="input-field"
                                value={newProduct.imageUrl}
                                onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                            />
                            <div className="flex gap-3">
                                <button onClick={handleSaveProduct} className="btn-primary flex-1">
                                    {newProduct.id ? 'Update Product' : 'Create & Notify Users'}
                                </button>
                                <button onClick={() => setShowProductModal(false)} className="btn-secondary flex-1">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
