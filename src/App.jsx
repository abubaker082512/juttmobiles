import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useShop } from './context/ShopContext';

// Layout
import Header from './components/Header';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import ToastContainer from './components/ToastContainer';

// Storefront Pages
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Dashboard from './pages/Dashboard';

// Admin Pages
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/AdminDashboard';
import AdminProducts from './admin/AdminProducts';
import AdminCategories from './admin/AdminCategories';
import AdminOrders from './admin/AdminOrders';
import AdminCustomers from './admin/AdminCustomers';
import AdminSettings from './admin/AdminSettings';

const ProtectedAdmin = ({ children }) => {
  const { user, profile, authLoading } = useShop();
  if (authLoading) return <div style={{display:'flex',height:'100vh',alignItems:'center',justifyContent:'center'}}><div className="spinner" /></div>;
  if (!user || profile?.role !== 'admin') return <Navigate to="/login" replace />;
  return children;
};

const StorefrontLayout = ({ children }) => (
  <>
    <Header />
    <CartDrawer />
    <main className="page-wrapper">{children}</main>
    <Footer />
  </>
);

export default function App() {
  return (
    <>
      <ToastContainer />
      <Routes>
        {/* Storefront */}
        <Route path="/" element={<StorefrontLayout><Home /></StorefrontLayout>} />
        <Route path="/products" element={<StorefrontLayout><Catalog /></StorefrontLayout>} />
        <Route path="/category/:slug" element={<StorefrontLayout><Catalog /></StorefrontLayout>} />
        <Route path="/products/:slug" element={<StorefrontLayout><ProductDetails /></StorefrontLayout>} />
        <Route path="/cart" element={<StorefrontLayout><Cart /></StorefrontLayout>} />
        <Route path="/checkout" element={<StorefrontLayout><Checkout /></StorefrontLayout>} />
        <Route path="/order-success" element={<StorefrontLayout><OrderSuccess /></StorefrontLayout>} />
        <Route path="/login" element={<StorefrontLayout><Dashboard /></StorefrontLayout>} />
        <Route path="/dashboard" element={<StorefrontLayout><Dashboard /></StorefrontLayout>} />

        {/* Admin */}
        <Route path="/admin" element={<ProtectedAdmin><AdminLayout /></ProtectedAdmin>}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
