import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, Tags, ShoppingBag, Users, Settings,
  ExternalLink, LogOut, Menu, X, Bell, ChevronRight
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import './AdminLayout.css';

const NAV_ITEMS = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/admin/products', icon: Package, label: 'Products' },
  { to: '/admin/categories', icon: Tags, label: 'Categories' },
  { to: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
  { to: '/admin/customers', icon: Users, label: 'Customers' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
];

export default function AdminLayout() {
  const { signOut, profile, settings } = useShop();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const isActive = (to, exact) => exact ? location.pathname === to : location.pathname.startsWith(to);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="admin-wrapper">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
        <div className="admin-logo">
          <div className="logo-icon" style={{ width: 36, height: 36, fontSize: '1rem', borderRadius: 'var(--radius-md)', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: 'white', flexShrink: 0 }}>J</div>
          {sidebarOpen && (
            <div>
              <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 800, color: 'var(--text-primary)' }}>{settings.shop_name || 'Jutt Mobiles'}</div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--accent-cyan)' }}>Admin Panel</div>
            </div>
          )}
        </div>

        <nav className="admin-nav">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.to}
              to={item.to}
              className={`admin-nav-item ${isActive(item.to, item.exact) ? 'admin-nav-active' : ''}`}
              title={!sidebarOpen ? item.label : undefined}
            >
              <item.icon size={18} />
              {sidebarOpen && <span>{item.label}</span>}
              {sidebarOpen && isActive(item.to, item.exact) && <ChevronRight size={14} style={{ marginLeft: 'auto' }} />}
            </Link>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <Link to="/" className="admin-nav-item" target="_blank" title={!sidebarOpen ? 'View Store' : undefined}>
            <ExternalLink size={18} />
            {sidebarOpen && <span>View Store</span>}
          </Link>
          <button className="admin-nav-item admin-nav-danger" onClick={handleSignOut} title={!sidebarOpen ? 'Sign Out' : undefined}>
            <LogOut size={18} />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="admin-main">
        {/* Top Bar */}
        <header className="admin-topbar">
          <button className="btn-icon" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle Sidebar">
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <div className="admin-topbar-title">
            {NAV_ITEMS.find(i => isActive(i.to, i.exact))?.label || 'Admin'}
          </div>
          <div className="admin-topbar-actions">
            <button className="btn-icon"><Bell size={18} /></button>
            <div className="admin-user">
              <div className="admin-avatar">{(profile?.full_name || 'A')[0].toUpperCase()}</div>
              {sidebarOpen && <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>{profile?.full_name || 'Admin'}</span>}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
