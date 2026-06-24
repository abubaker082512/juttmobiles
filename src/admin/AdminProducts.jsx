import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, X, Package } from 'lucide-react';
import { useShop } from '../context/ShopContext';

const BLANK = {
  name: '', category_id: '', category_slug: '', price: '', sale_price: '',
  sku: '', stock_quantity: '', status: 'published', description: '',
  short_description: '', badge: '', images: [''], specifications: {}
};

export default function AdminProducts() {
  const { products, categories, addProduct, updateProduct, deleteProduct } = useShop();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [specKey, setSpecKey] = useState('');
  const [specVal, setSpecVal] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const filtered = products.filter(p => {
    const ms = p.name.toLowerCase().includes(search.toLowerCase()) || (p.sku || '').toLowerCase().includes(search.toLowerCase());
    const mc = !catFilter || p.category_slug === catFilter;
    return ms && mc;
  });

  const openAdd = () => { setEditingProduct(null); setForm(BLANK); setModalOpen(true); };
  const openEdit = (p) => {
    setEditingProduct(p);
    setForm({
      name: p.name || '', category_id: p.category_id || '', category_slug: p.category_slug || '',
      price: p.price || '', sale_price: p.sale_price || '', sku: p.sku || '',
      stock_quantity: p.stock_quantity || '', status: p.status || 'published',
      description: p.description || '', short_description: p.short_description || '',
      badge: p.badge || '', images: p.images || [''], specifications: p.specifications || {}
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        sale_price: form.sale_price ? Number(form.sale_price) : null,
        stock_quantity: Number(form.stock_quantity),
        images: typeof form.images === 'string' ? [form.images] : form.images,
      };
      if (editingProduct) await updateProduct(editingProduct.id, payload);
      else await addProduct(payload);
      setModalOpen(false);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleCatChange = (e) => {
    const cat = categories.find(c => c.id === e.target.value);
    setForm(f => ({ ...f, category_id: cat?.id || '', category_slug: cat?.slug || '' }));
  };

  const addSpec = () => {
    if (specKey && specVal) {
      setForm(f => ({ ...f, specifications: { ...f.specifications, [specKey]: specVal } }));
      setSpecKey(''); setSpecVal('');
    }
  };
  const removeSpec = (key) => setForm(f => { const s = { ...f.specifications }; delete s[key]; return { ...f, specifications: s }; });

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 className="admin-page-title">Products</h1>
          <p className="admin-page-sub">{products.length} total products</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}><Plus size={16} /> Add Product</button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-5)', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={15} style={{ position: 'absolute', left: 'var(--space-3)', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          <input className="form-input" style={{ paddingLeft: '2.5rem' }} placeholder="Search by name or SKU..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-select" style={{ minWidth: 180 }} value={catFilter} onChange={e => setCatFilter(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr><th>Product</th><th>SKU</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 'var(--space-12)' }}>
                  <Package size={40} style={{ margin: '0 auto var(--space-4)', display: 'block' }} />
                  No products found
                </td></tr>
              ) : filtered.map(p => {
                const img = Array.isArray(p.images) ? p.images[0] : p.images;
                return (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--bg-tertiary)', flexShrink: 0 }}>
                          {img && <img src={img} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 'var(--font-size-sm)' }}>{p.name}</div>
                          {p.sale_price && <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--accent-green)' }}>Sale: Rs. {p.sale_price?.toLocaleString()}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{p.sku || '—'}</td>
                    <td><span className="badge badge-purple">{p.category_slug?.replace(/-/g, ' ')}</span></td>
                    <td style={{ fontWeight: 700 }}>Rs. {p.price?.toLocaleString()}</td>
                    <td>
                      <span className={`badge ${p.stock_quantity === 0 ? 'badge-error' : p.stock_quantity < 10 ? 'badge-warning' : 'badge-success'}`}>
                        {p.stock_quantity === 0 ? 'Out of Stock' : p.stock_quantity < 10 ? `Low: ${p.stock_quantity}` : `${p.stock_quantity} in stock`}
                      </span>
                    </td>
                    <td><span className={`badge ${p.status === 'published' ? 'badge-success' : 'badge-warning'}`}>{p.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        <button className="btn btn-sm btn-ghost" onClick={() => openEdit(p)}><Edit size={14} /></button>
                        <button className="btn btn-sm btn-danger" onClick={() => setDeleteConfirm(p.id)}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 400 }}>
            <div className="modal-header"><h3>Confirm Delete</h3></div>
            <div className="modal-body"><p>Are you sure? This action cannot be undone.</p></div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => { deleteProduct(deleteConfirm); setDeleteConfirm(null); }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 720 }}>
            <div className="modal-header">
              <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <button className="btn-icon" onClick={() => setModalOpen(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Product Name *</label>
                  <input className="form-input" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Jutt Premium Wireless Charger" />
                </div>
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select className="form-select" required value={form.category_id} onChange={handleCatChange}>
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">SKU</label>
                  <input className="form-input" value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} placeholder="JM-PR-001" />
                </div>
                <div className="form-group">
                  <label className="form-label">Regular Price (Rs.) *</label>
                  <input type="number" className="form-input" required min={0} value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Sale Price (Rs.)</label>
                  <input type="number" className="form-input" min={0} value={form.sale_price} onChange={e => setForm(f => ({ ...f, sale_price: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Stock Quantity *</label>
                  <input type="number" className="form-input" required min={0} value={form.stock_quantity} onChange={e => setForm(f => ({ ...f, stock_quantity: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-select" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Badge</label>
                  <input className="form-input" value={form.badge} onChange={e => setForm(f => ({ ...f, badge: e.target.value }))} placeholder="New, Hot, Sale..." />
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Image URL</label>
                  <input className="form-input" value={Array.isArray(form.images) ? form.images[0] : form.images} onChange={e => setForm(f => ({ ...f, images: [e.target.value] }))} placeholder="https://..." />
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Short Description</label>
                  <input className="form-input" value={form.short_description} onChange={e => setForm(f => ({ ...f, short_description: e.target.value }))} />
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Full Description</label>
                  <textarea className="form-textarea" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Specifications</label>
                  {Object.entries(form.specifications || {}).map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-2)', alignItems: 'center' }}>
                      <span style={{ flex: 1, fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}><strong>{k}:</strong> {v}</span>
                      <button type="button" className="btn-icon" onClick={() => removeSpec(k)}><X size={14} /></button>
                    </div>
                  ))}
                  <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
                    <input className="form-input" placeholder="Key (e.g. Battery)" value={specKey} onChange={e => setSpecKey(e.target.value)} style={{ flex: 1 }} />
                    <input className="form-input" placeholder="Value (e.g. 5000mAh)" value={specVal} onChange={e => setSpecVal(e.target.value)} style={{ flex: 1 }} />
                    <button type="button" className="btn btn-secondary" onClick={addSpec}><Plus size={14} /></button>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? <><span className="spinner" /> Saving...</> : editingProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
