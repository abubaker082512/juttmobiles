import React, { useState } from 'react';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { useShop } from '../context/ShopContext';

const BLANK = { name: '', slug: '', description: '', icon: '', color: '#06b6d4' };

export default function AdminCategories() {
  const { categories, products, addCategory, updateCategory, deleteCategory } = useShop();
  const [form, setForm] = useState(BLANK);
  const [editing, setEditing] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [delConfirm, setDelConfirm] = useState(null);
  const [loading, setLoading] = useState(false);

  const openEdit = (c) => {
    setEditing(c);
    setForm({ name: c.name || '', slug: c.slug || '', description: c.description || '', icon: c.icon || '', color: c.color || '#06b6d4' });
    setModalOpen(true);
  };
  const openAdd = () => { setEditing(null); setForm(BLANK); setModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const slug = form.slug || form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const payload = { ...form, slug };
      if (editing) await updateCategory(editing.id, payload);
      else await addCategory(payload);
      setModalOpen(false);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 className="admin-page-title">Categories</h1>
          <p className="admin-page-sub">{categories.length} categories</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}><Plus size={16} /> Add Category</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 'var(--space-4)' }}>
        {categories.map(cat => {
          const count = products.filter(p => p.category_slug === cat.slug).length;
          return (
            <div key={cat.id} className="admin-card" style={{ padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <div style={{ width: 52, height: 52, borderRadius: 'var(--radius-md)', background: `${cat.color}22`, border: `1px solid ${cat.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>
                  {cat.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>{cat.name}</div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{count} products</div>
                </div>
              </div>
              {cat.description && <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>{cat.description}</p>}
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', fontFamily: 'monospace' }}>/{cat.slug}</div>
              <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'auto' }}>
                <button className="btn btn-sm btn-ghost" style={{ flex: 1 }} onClick={() => openEdit(cat)}><Edit size={14} /> Edit</button>
                <button className="btn btn-sm btn-danger" onClick={() => setDelConfirm(cat.id)}><Trash2 size={14} /></button>
              </div>
            </div>
          );
        })}
      </div>

      {delConfirm && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 400 }}>
            <div className="modal-header"><h3>Delete Category</h3></div>
            <div className="modal-body"><p>Delete this category? Products will remain but become uncategorized.</p></div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setDelConfirm(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => { deleteCategory(delConfirm); setDelConfirm(null); }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h3>{editing ? 'Edit Category' : 'Add Category'}</h3>
              <button className="btn-icon" onClick={() => setModalOpen(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div className="form-group">
                  <label className="form-label">Name *</label>
                  <input className="form-input" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Smart Watches" />
                </div>
                <div className="form-group">
                  <label className="form-label">Slug (leave empty to auto-generate)</label>
                  <input className="form-input" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="e.g. smart-watches" />
                </div>
                <div className="form-group">
                  <label className="form-label">Icon (Emoji)</label>
                  <input className="form-input" value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} placeholder="⌚" />
                </div>
                <div className="form-group">
                  <label className="form-label">Accent Color</label>
                  <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                    <input type="color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} style={{ width: 48, height: 40, border: 'none', background: 'none', cursor: 'pointer', borderRadius: 'var(--radius-sm)' }} />
                    <input className="form-input" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} style={{ flex: 1 }} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-textarea" rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? <><span className="spinner" /> Saving...</> : editing ? 'Update' : 'Add Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
