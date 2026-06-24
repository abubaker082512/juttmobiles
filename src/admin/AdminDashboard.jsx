import React, { useEffect, useState } from 'react';
import { TrendingUp, ShoppingBag, Users, Package, DollarSign, AlertTriangle, Activity } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const { products, fetchAllOrders, fetchCustomers } = useShop();
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchAllOrders(), fetchCustomers()]).then(([o, c]) => {
      setOrders(o); setCustomers(c); setLoading(false);
    });
  }, []);

  const totalRevenue = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + (o.total || 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const lowStockProducts = products.filter(p => p.stock_quantity > 0 && p.stock_quantity < 10);
  const outOfStock = products.filter(p => p.stock_quantity === 0);
  const recentOrders = orders.slice(0, 6);
  const avgOrderValue = orders.length ? Math.round(totalRevenue / orders.length) : 0;

  const STATUS_COLOR = {
    pending: 'status-pending', processing: 'status-processing',
    shipped: 'status-shipped', delivered: 'status-delivered', cancelled: 'status-cancelled'
  };

  const STATS = [
    { icon: DollarSign, label: 'Total Revenue', value: `Rs. ${totalRevenue.toLocaleString()}`, color: '#06b6d4', bg: 'rgba(6,182,212,0.1)' },
    { icon: ShoppingBag, label: 'Total Orders', value: orders.length, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
    { icon: TrendingUp, label: 'Avg Order Value', value: `Rs. ${avgOrderValue.toLocaleString()}`, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    { icon: Package, label: 'Active Products', value: products.filter(p => p.status === 'published').length, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
    { icon: Users, label: 'Total Customers', value: customers.length, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    { icon: AlertTriangle, label: 'Pending Orders', value: pendingOrders, color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  ];

  return (
    <div className="admin-dashboard">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Dashboard Overview</h1>
        <p className="admin-page-sub">Welcome to your Jutt Mobiles Admin Panel</p>
      </div>

      <div className="stats-grid">
        {STATS.map((stat, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: stat.bg, color: stat.color }}>
              <stat.icon size={22} />
            </div>
            <div>
              <div className="stat-label">{stat.label}</div>
              <div className="stat-value">{loading ? '—' : stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        {/* Recent Orders */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title"><Activity size={18} /> Recent Orders</h2>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr><th>Order #</th><th>Customer</th><th>Total</th><th>Payment</th><th>Status</th></tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 'var(--space-8)' }}>No orders yet</td></tr>
                ) : recentOrders.map(o => (
                  <tr key={o.id}>
                    <td style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>#{o.order_number}</td>
                    <td>{o.customer_name}</td>
                    <td style={{ fontWeight: 700 }}>Rs. {o.total?.toLocaleString()}</td>
                    <td>{o.payment_method === 'cod' ? 'COD' : 'Bank'}</td>
                    <td><span className={`status-chip ${STATUS_COLOR[o.status] || 'status-pending'}`}>{o.status || 'pending'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alerts */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title"><AlertTriangle size={18} /> Alerts</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', padding: 'var(--space-4)' }}>
            {pendingOrders > 0 && (
              <div className="alert-item alert-warning">
                <ShoppingBag size={16} />
                <span>{pendingOrders} pending order{pendingOrders > 1 ? 's' : ''} awaiting action</span>
              </div>
            )}
            {lowStockProducts.map(p => (
              <div key={p.id} className="alert-item alert-warning">
                <Package size={16} />
                <span>{p.name} — only {p.stock_quantity} left</span>
              </div>
            ))}
            {outOfStock.map(p => (
              <div key={p.id} className="alert-item alert-error">
                <AlertTriangle size={16} />
                <span>{p.name} is out of stock</span>
              </div>
            ))}
            {pendingOrders === 0 && !lowStockProducts.length && !outOfStock.length && (
              <div className="alert-item alert-success">
                <Activity size={16} />
                <span>Everything looks good! No alerts.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
