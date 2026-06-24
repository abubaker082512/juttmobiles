import React, { useEffect, useState } from 'react';
import { Search, ChevronDown, Eye } from 'lucide-react';
import { useShop } from '../context/ShopContext';

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const STATUS_COLOR = {
  pending: 'status-pending', processing: 'status-processing',
  shipped: 'status-shipped', delivered: 'status-delivered', cancelled: 'status-cancelled'
};

export default function AdminOrders() {
  const { fetchAllOrders, updateOrderStatus } = useShop();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewOrder, setViewOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchAllOrders().then(o => { setOrders(o); setLoading(false); });
  }, []);

  const filtered = orders.filter(o => {
    const ms = o.order_number?.toLowerCase().includes(search.toLowerCase())
      || o.customer_name?.toLowerCase().includes(search.toLowerCase())
      || o.customer_phone?.includes(search);
    const mst = !statusFilter || o.status === statusFilter;
    return ms && mst;
  });

  const handleStatusChange = async (orderId, status) => {
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, status);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
      if (viewOrder?.id === orderId) setViewOrder(v => ({ ...v, status }));
    } catch (e) { console.error(e); }
    finally { setUpdatingId(null); }
  };

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 className="admin-page-title">Orders</h1>
        <p className="admin-page-sub">{orders.length} total orders</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-5)', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={15} style={{ position: 'absolute', left: 'var(--space-3)', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          <input className="form-input" style={{ paddingLeft: '2.5rem' }} placeholder="Search by order # or customer..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ position: 'relative' }}>
          <select className="form-select" style={{ minWidth: 160 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
          <ChevronDown size={14} style={{ position: 'absolute', right: 'var(--space-3)', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }} />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-16)', color: 'var(--text-muted)' }}>Loading orders...</div>
      ) : (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr><th>Order #</th><th>Customer</th><th>Phone</th><th>City</th><th>Total</th><th>Payment</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 'var(--space-12)' }}>No orders found</td></tr>
                ) : filtered.map(o => (
                  <tr key={o.id}>
                    <td style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>#{o.order_number}</td>
                    <td style={{ fontWeight: 600 }}>{o.customer_name}</td>
                    <td style={{ fontSize: 'var(--font-size-xs)' }}>{o.customer_phone}</td>
                    <td>{o.city}</td>
                    <td style={{ fontWeight: 700 }}>Rs. {o.total?.toLocaleString()}</td>
                    <td><span className={`badge ${o.payment_method === 'cod' ? 'badge-purple' : 'badge-new'}`}>{o.payment_method === 'cod' ? 'COD' : 'Bank'}</span></td>
                    <td>
                      <select
                        className="form-select"
                        style={{ padding: '4px 8px', fontSize: 'var(--font-size-xs)', minWidth: 120 }}
                        value={o.status || 'pending'}
                        onChange={e => handleStatusChange(o.id, e.target.value)}
                        disabled={updatingId === o.id}
                      >
                        {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                      </select>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-ghost" onClick={() => setViewOrder(o)}><Eye size={14} /> View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {viewOrder && (
        <div className="modal-overlay" onClick={() => setViewOrder(null)}>
          <div className="modal" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Order #{viewOrder.order_number}</h3>
              <span className={`status-chip ${STATUS_COLOR[viewOrder.status] || 'status-pending'}`}>{viewOrder.status || 'pending'}</span>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-5)', marginBottom: 'var(--space-5)' }}>
                <div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 'var(--space-2)' }}>Customer</div>
                  <div style={{ fontWeight: 700 }}>{viewOrder.customer_name}</div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>{viewOrder.customer_email}</div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>{viewOrder.customer_phone}</div>
                </div>
                <div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 'var(--space-2)' }}>Shipping</div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{viewOrder.shipping_address}</div>
                </div>
              </div>
              {viewOrder.items?.length > 0 && (
                <div style={{ marginBottom: 'var(--space-5)' }}>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 'var(--space-3)' }}>Items</div>
                  {viewOrder.items.map((item, i) => {
                    const price = item.sale_price || item.price;
                    const img = Array.isArray(item.images) ? item.images[0] : item.images;
                    return (
                      <div key={i} style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', padding: 'var(--space-3) 0', borderBottom: '1px solid var(--border-subtle)' }}>
                        <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: 'var(--bg-tertiary)', flexShrink: 0 }}>
                          {img && <img src={img} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>{item.name}</div>
                          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Qty: {item.quantity} × Rs. {price?.toLocaleString()}</div>
                        </div>
                        <div style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>Rs. {(price * item.quantity).toLocaleString()}</div>
                      </div>
                    );
                  })}
                </div>
              )}
              <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}><span>Subtotal</span><span>Rs. {viewOrder.subtotal?.toLocaleString()}</span></div>
                {viewOrder.discount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-sm)', color: 'var(--accent-green)' }}><span>Discount</span><span>-Rs. {viewOrder.discount?.toLocaleString()}</span></div>}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}><span>Shipping</span><span>{viewOrder.shipping_fee === 0 ? 'Free' : `Rs. ${viewOrder.shipping_fee}`}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: 'var(--font-size-base)', color: 'var(--text-primary)', paddingTop: 'var(--space-2)', borderTop: '1px solid var(--border-subtle)' }}><span>Total</span><span>Rs. {viewOrder.total?.toLocaleString()}</span></div>
              </div>
              {viewOrder.notes && <div style={{ marginTop: 'var(--space-4)', fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', background: 'var(--bg-secondary)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)' }}><strong>Notes:</strong> {viewOrder.notes}</div>}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setViewOrder(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
