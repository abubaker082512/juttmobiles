import React, { useEffect, useState } from 'react';
import { Search, Users, Mail, Phone } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export default function AdminCustomers() {
  const { fetchCustomers } = useShop();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCustomers().then(c => { setCustomers(c); setLoading(false); });
  }, []);

  const filtered = customers.filter(c =>
    c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  );

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 className="admin-page-title">Customers</h1>
        <p className="admin-page-sub">{customers.length} registered customers</p>
      </div>

      <div style={{ position: 'relative', maxWidth: 400, marginBottom: 'var(--space-5)' }}>
        <Search size={15} style={{ position: 'absolute', left: 'var(--space-3)', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
        <input className="form-input" style={{ paddingLeft: '2.5rem' }} placeholder="Search by name, email or phone..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-16)', color: 'var(--text-muted)' }}>Loading customers...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><Users size={36} /></div>
          <h3>No customers found</h3>
          <p>Registered customers will appear here</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
          {filtered.map(c => (
            <div key={c.id} className="admin-card" style={{ padding: 'var(--space-5)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: 'white', flexShrink: 0, fontSize: 'var(--font-size-base)' }}>
                  {(c.full_name || c.email || 'A')[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>{c.full_name || 'Unknown'}</div>
                  <span className={`badge ${c.role === 'admin' ? 'badge-hot' : 'badge-purple'}`}>{c.role || 'customer'}</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                  <Mail size={13} /> {c.email}
                </div>
                {c.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                    <Phone size={13} /> {c.phone}
                  </div>
                )}
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-1)' }}>
                  Joined: {c.created_at ? new Date(c.created_at).toLocaleDateString('en-PK') : 'N/A'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
