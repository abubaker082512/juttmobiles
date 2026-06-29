import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart, Search, User, Menu, X, ChevronDown,
  LogOut, LayoutDashboard, Settings, Package, Truck
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import './Header.css';

export default function Header() {
  const { cartCount, categories, user, profile, signOut, settings, isAdmin, products } = useShop();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const searchRef = useRef(null);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setProfileOpen(false);
    navigate('/');
  };

  return (
    <>
      {/* Announcement Bar */}
      {settings.announcement_bar && (
        <div className="announcement-bar">
          <span>{settings.announcement_bar}</span>
        </div>
      )}
      <header className="header">
        <div className="container header-inner">
          {/* Logo */}
          {/* Logo */}
          <Link to="/" className="header-logo">
            <img src="/assets/logo-C1AVTE2X.png" alt={settings.shop_name || 'Jutt Mobiles'} className="header-logo-img" />
          </Link>

          {/* Desktop Nav */}
          <nav className="header-nav">
            <Link to="/" className="nav-link">Home</Link>
            {categories.slice(0, 5).map(cat => (
              <div
                key={cat.id}
                className="nav-dropdown-wrapper"
                onMouseEnter={() => setActiveDropdown(cat.id)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link to={`/category/${cat.slug}`} className="nav-link">
                  {cat.name} <ChevronDown size={14} />
                </Link>
                {activeDropdown === cat.id && (
                  <div className="nav-dropdown">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {(products || [])
                        .filter(p => (p.category_id === cat.id || p.category_slug === cat.slug) && p.status === 'published')
                        .slice(0, 3)
                        .map(p => (
                          <Link key={p.id} to={`/products/${p.slug}`} className="dropdown-item-product" onClick={() => setActiveDropdown(null)}>
                            <img src={Array.isArray(p.images) ? p.images[0] : p.images} alt={p.name} className="dropdown-product-img" />
                            <div className="dropdown-product-info">
                              <div className="dropdown-product-name">{p.name}</div>
                              <div className="dropdown-product-price">{settings.currency_symbol || 'Rs.'} {(p.sale_price || p.price)?.toLocaleString()}</div>
                            </div>
                          </Link>
                        ))}
                    </div>
                    <div className="dropdown-divider" />
                    <Link to={`/category/${cat.slug}`} className="dropdown-item dropdown-view-all" onClick={() => setActiveDropdown(null)}>
                      View All {cat.name}
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Actions */}
          <div className="header-actions">
            {/* Search */}
            {searchOpen ? (
              <form className="header-search" onSubmit={handleSearch}>
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                <button type="button" className="btn-icon" onClick={() => setSearchOpen(false)}>
                  <X size={16} />
                </button>
              </form>
            ) : (
              <button className="btn-icon" onClick={() => setSearchOpen(true)} aria-label="Search">
                <Search size={18} />
              </button>
            )}

            {/* Cart */}
            <Link to="/cart" className="cart-btn" aria-label="Cart">
              <ShoppingCart size={20} />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>

            {/* Profile */}
            <div className="profile-wrapper">
              <button
                className="btn-icon"
                onClick={() => setProfileOpen(!profileOpen)}
                aria-label="Profile"
              >
                <User size={18} />
              </button>
              {profileOpen && (
                <div className="profile-dropdown">
                  {user ? (
                    <>
                      <div className="profile-info">
                        <div className="profile-name">{profile?.full_name || 'User'}</div>
                        <div className="profile-email">{user.email}</div>
                      </div>
                      <div className="dropdown-divider" />
                      <Link to="/dashboard" className="dropdown-item" onClick={() => setProfileOpen(false)}>
                        <LayoutDashboard size={15} /> My Orders
                      </Link>
                      {isAdmin && (
                        <Link to="/admin" className="dropdown-item" onClick={() => setProfileOpen(false)}>
                          <Settings size={15} /> Admin Panel
                        </Link>
                      )}
                      <button className="dropdown-item dropdown-item-danger" onClick={handleSignOut}>
                        <LogOut size={15} /> Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" className="dropdown-item" onClick={() => setProfileOpen(false)}>
                        <User size={15} /> Login / Register
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="btn-icon mobile-menu-btn"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="mobile-menu">
            <Link to="/" className="mobile-link" onClick={() => setMobileOpen(false)}>Home</Link>
            {categories.map(cat => (
              <Link key={cat.id} to={`/category/${cat.slug}`} className="mobile-link" onClick={() => setMobileOpen(false)}>
                {cat.icon} {cat.name}
              </Link>
            ))}
            <Link to="/cart" className="mobile-link" onClick={() => setMobileOpen(false)}>
              <ShoppingCart size={16} /> Cart {cartCount > 0 && `(${cartCount})`}
            </Link>
            <Link to={user ? '/dashboard' : '/login'} className="mobile-link" onClick={() => setMobileOpen(false)}>
              <User size={16} /> {user ? 'My Dashboard' : 'Login'}
            </Link>
            {isAdmin && (
              <Link to="/admin" className="mobile-link" onClick={() => setMobileOpen(false)}>
                <Settings size={16} /> Admin Panel
              </Link>
            )}
          </div>
        )}
      </header>
    </>
  );
}
