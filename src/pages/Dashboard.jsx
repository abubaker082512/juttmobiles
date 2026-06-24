import React, { useState, useEffect } from 'react';
import { User, Package, LogOut, Eye, EyeOff, Edit, Save, X } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import './Dashboard.css';

export default function Dashboard() {
  const { user, profile, signIn, signUp, signOut, updateProfile, fetchUserOrders, addToast } = useShop();
  const [tab, setTab] = useState('login');
  const [dashTab, setDashTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [error, setError] = useState('');

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    fullName: '', email: '', phone: '', password: '', confirmPassword: ''
  });
  const [profileForm, setProfileForm] = useState({ full_name: '', phone: '', address: '' });

  useEffect(() => {
    if (user) {
      fetchUserOrders().then(setOrders);
      setProfileForm({
        full_name: profile?.full_name || '',
        phone: profile?.phone || '',
        address: profile?.address || ''
      });
    }
  }, [user, profile]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await signIn(loginForm.email, loginForm.password);
      addToast('Welcome back!', 'success');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (registerForm.password !== registerForm.confirmPassword) { setError('Passwords do not match'); return; }
    if (registerForm.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true); setError('');
    try {
      await signUp(registerForm.email, registerForm.password, registerForm.fullName, registerForm.phone);
      addToast('Account created! Check your email to verify.', 'success');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally { setLoading(false); }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(profileForm);
      setEditingProfile(false);
    } catch { addToast('Failed to update profile', 'error'); }
  };

  const STATUS_COLORS = {
    pending: 'status-pending', processing: 'status-processing',
    shipped: 'status-shipped', delivered: 'status-delivered', cancelled: 'status-cancelled'
  };

  /* ──────────── AUTH VIEW ──────────── */
  if (!user) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-logo">
            <div style={{ width: 52, height: 52, background: 'var(--gradient-primary)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: 'white', fontSize: '1.5rem' }}>J</div>
            <span>Jutt Mobiles</span>
          </div>

          <div className="auth-tabs">
            <button className={`auth-tab ${tab === 'login' ? 'auth-tab-active' : ''}`} onClick={() => { setTab('login'); setError(''); }}>Login</button>
            <button className={`auth-tab ${tab === 'register' ? 'auth-tab-active' : ''}`} onClick={() => { setTab('register'); setError(''); }}>Register</button>
          </div>

          {error && <div className="auth-error">{error}</div>}

          {tab === 'login' ? (
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" className="form-input" placeholder="your@email.com" value={loginForm.email}
                  onChange={e => setLoginForm(p => ({ ...p, email: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPass ? 'text' : 'password'} className="form-input" placeholder="Your password"
                    value={loginForm.password} onChange={e => setLoginForm(p => ({ ...p, password: e.target.value }))} required />
                  <button type="button" style={{ position: 'absolute', right: 'var(--space-3)', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }} onClick={() => setShowPass(p => !p)}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 'var(--space-2)' }} disabled={loading}>
                {loading ? <><span className="spinner" /> Logging in...</> : 'Login'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input type="text" className="form-input" placeholder="Muhammad Ali" value={registerForm.fullName}
                  onChange={e => setRegisterForm(p => ({ ...p, fullName: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" className="form-input" placeholder="your@email.com" value={registerForm.email}
                  onChange={e => setRegisterForm(p => ({ ...p, email: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone / WhatsApp</label>
                <input type="tel" className="form-input" placeholder="0300 1234567" value={registerForm.phone}
                  onChange={e => setRegisterForm(p => ({ ...p, phone: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input type={showPass ? 'text' : 'password'} className="form-input" placeholder="Minimum 6 characters"
                  value={registerForm.password} onChange={e => setRegisterForm(p => ({ ...p, password: e.target.value }))} required minLength={6} />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input type={showPass ? 'text' : 'password'} className="form-input" placeholder="Re-enter password"
                  value={registerForm.confirmPassword} onChange={e => setRegisterForm(p => ({ ...p, confirmPassword: e.target.value }))} required />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 'var(--space-2)' }} disabled={loading}>
                {loading ? <><span className="spinner" /> Creating Account...</> : 'Create Account'}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  /* ──────────── DASHBOARD VIEW ──────────── */
  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 900 }}>My Account</h1>
            <p style={{ color: 'var(--text-muted)' }}>Welcome back, {profile?.full_name || user.email}!</p>
          </div>
          <button className="btn btn-ghost" onClick={signOut}><LogOut size={16} /> Sign Out</button>
        </div>

        <div className="dashboard-layout">
          <aside className="dashboard-sidebar">
            <div className="dashboard-user">
              <div className="user-avatar">{(profile?.full_name || user.email)[0].toUpperCase()}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>{profile?.full_name}</div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{user.email}</div>
              </div>
            </div>
            <nav className="dashboard-nav">
              <button className={`dash-nav-item ${dashTab === 'orders' ? 'dash-nav-active' : ''}`} onClick={() => setDashTab('orders')}>
                <Package size={16} /> My Orders
              </button>
              <button className={`dash-nav-item ${dashTab === 'profile' ? 'dash-nav-active' : ''}`} onClick={() => setDashTab('profile')}>
                <User size={16} /> Profile
              </button>
            </nav>
          </aside>

          <div className="dashboard-content">
            {dashTab === 'orders' && (
              <div>
                <h2 className="dash-section-title">Order History</h2>
                {orders.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon"><Package size={36} /></div>
                    <h3>No orders yet</h3>
                    <p>Your order history will appear here</p>
                  </div>
                ) : (
                  <div className="orders-table-wrap">
                    <table className="data-table">
                      <thead>
                        <tr><th>Order #</th><th>Date</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th></tr>
                      </thead>
                      <tbody>
                        {orders.map(order => (
                          <tr key={order.id}>
                            <td style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>#{order.order_number}</td>
                            <td>{order.created_at ? new Date(order.created_at).toLocaleDateString('en-PK') : 'N/A'}</td>
                            <td>{order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}</td>
                            <td style={{ fontWeight: 700 }}>Rs. {order.total?.toLocaleString()}</td>
                            <td>{order.payment_method === 'cod' ? 'COD' : 'Bank Transfer'}</td>
                            <td><span className={`status-chip ${STATUS_COLORS[order.status] || 'status-pending'}`}>{order.status || 'Pending'}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {dashTab === 'profile' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)' }}>
                  <h2 className="dash-section-title" style={{ margin: 0 }}>Profile Details</h2>
                  {!editingProfile
                    ? <button className="btn btn-secondary btn-sm" onClick={() => setEditingProfile(true)}><Edit size={14} /> Edit</button>
                    : <button className="btn btn-ghost btn-sm" onClick={() => setEditingProfile(false)}><X size={14} /> Cancel</button>
                  }
                </div>
                {editingProfile ? (
                  <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input type="text" className="form-input" value={profileForm.full_name} onChange={e => setProfileForm(p => ({ ...p, full_name: e.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone</label>
                      <input type="tel" className="form-input" value={profileForm.phone} onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Default Address</label>
                      <textarea className="form-textarea" rows={3} value={profileForm.address} onChange={e => setProfileForm(p => ({ ...p, address: e.target.value }))} />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}><Save size={16} /> Save Changes</button>
                  </form>
                ) : (
                  <div className="profile-display">
                    {[
                      { label: 'Full Name', val: profile?.full_name },
                      { label: 'Email', val: user.email },
                      { label: 'Phone', val: profile?.phone },
                      { label: 'Address', val: profile?.address },
                    ].map(item => (
                      <div key={item.label} className="profile-row">
                        <span className="profile-label">{item.label}</span>
                        <span className="profile-val">{item.val || <span style={{ color: 'var(--text-muted)' }}>Not set</span>}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
