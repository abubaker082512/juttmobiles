import React, { useState, useEffect } from 'react';
import { Save, Store, Truck, CreditCard, MessageCircle } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export default function AdminSettings() {
  const { settings, updateSettings } = useShop();
  const [form, setForm] = useState({ ...settings });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { setForm({ ...settings }); }, [settings]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await updateSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    setLoading(false);
  };

  const SectionCard = ({ icon: Icon, title, children }) => (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', marginBottom: 'var(--space-5)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-4) var(--space-6)', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)' }}>
        <Icon size={18} color="var(--accent-cyan)" />
        <h3 style={{ fontWeight: 800, fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>{title}</h3>
      </div>
      <div style={{ padding: 'var(--space-6)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-5)' }}>
        {children}
      </div>
    </div>
  );

  const Field = ({ label, name, type = 'text', placeholder, fullWidth, hint }) => (
    <div className="form-group" style={{ gridColumn: fullWidth ? '1/-1' : undefined, marginBottom: 0 }}>
      <label className="form-label">{label}</label>
      <input
        type={type}
        name={name}
        className="form-input"
        placeholder={placeholder}
        value={form[name] ?? ''}
        onChange={handleChange}
      />
      {hint && <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: 4 }}>{hint}</div>}
    </div>
  );

  const Toggle = ({ label, name, desc }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', gridColumn: '1/-1', padding: 'var(--space-3) 0', borderBottom: '1px solid var(--border-subtle)' }}>
      <label style={{ position: 'relative', display: 'inline-block', width: 42, height: 24, flexShrink: 0 }}>
        <input type="checkbox" name={name} checked={!!form[name]} onChange={handleChange} style={{ opacity: 0, width: 0, height: 0 }} />
        <span style={{
          position: 'absolute', cursor: 'pointer', inset: 0, background: form[name] ? 'var(--accent-cyan)' : 'var(--bg-tertiary)',
          borderRadius: 24, transition: '0.3s', border: '1px solid var(--border-light)'
        }}>
          <span style={{
            position: 'absolute', content: '', height: 18, width: 18, left: form[name] ? 20 : 2, top: 2,
            background: 'white', borderRadius: '50%', transition: '0.3s'
          }} />
        </span>
      </label>
      <div>
        <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>{label}</div>
        {desc && <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{desc}</div>}
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 className="admin-page-title">Store Settings</h1>
          <p className="admin-page-sub">Configure your store details, shipping, and payment options</p>
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? <><span className="spinner" /> Saving...</> : saved ? '✓ Saved!' : <><Save size={16} /> Save Settings</>}
        </button>
      </div>

      <SectionCard icon={Store} title="Store Information">
        <Field label="Store Name" name="shop_name" placeholder="Jutt Mobiles" />
        <Field label="Currency Symbol" name="currency_symbol" placeholder="Rs." />
        <Field label="Store Email" name="support_email" placeholder="hello@juttmobiles.pk" />
        <Field label="Store Phone" name="support_phone" placeholder="+92 300 1234567" />
        <Field label="Store Address" name="address" fullWidth placeholder="123 Main Bazaar, Lahore, Punjab" />
        <Field label="Tagline" name="shop_tagline" fullWidth placeholder="Pakistan's Premier Mobile Accessories Store" />
        <Field label="Announcement Bar" name="announcement_bar" fullWidth placeholder="Free delivery on orders above Rs. 2,000..." />
      </SectionCard>

      <SectionCard icon={Truck} title="Shipping Settings">
        <Field label="Flat Shipping Rate (Rs.)" name="shipping_flat_rate" type="number" placeholder="200" />
        <Field label="Free Shipping Minimum (Rs.)" name="free_shipping_threshold" type="number" placeholder="2000" />
        <div style={{ gridColumn: '1/-1', display: 'flex', flexDirection: 'column' }}>
          <Toggle label="Enable Free Shipping" name="free_shipping_enabled" desc="Customers get free shipping when order exceeds the minimum amount above" />
        </div>
      </SectionCard>

      <SectionCard icon={CreditCard} title="Payment Settings">
        <div style={{ gridColumn: '1/-1', display: 'flex', flexDirection: 'column' }}>
          <Toggle label="Cash on Delivery (COD)" name="cod_enabled" desc="Allow customers to pay on delivery" />
          <Toggle label="Bank Transfer" name="bank_transfer_enabled" desc="Allow customers to pay via bank transfer" />
        </div>
        <Field label="Bank Name" name="bank_name" placeholder="HBL (Habib Bank)" />
        <Field label="Account Title" name="account_title" placeholder="Jutt Mobiles Pakistan" />
        <Field label="Account Number" name="account_number" placeholder="0001-1234567890" />
        <Field label="IBAN" name="iban" placeholder="PK36HABB0000000001234567" />
      </SectionCard>

      <SectionCard icon={MessageCircle} title="WhatsApp & Social">
        <Field label="WhatsApp Number" name="whatsapp_number" placeholder="923001234567" hint="Include country code without + sign" />
        <Field label="Facebook Page URL" name="facebook_url" placeholder="https://facebook.com/juttmobiles" />
        <Field label="Instagram URL" name="instagram_url" placeholder="https://instagram.com/juttmobiles" />
        <Field label="TikTok URL" name="tiktok_url" placeholder="https://tiktok.com/@juttmobiles" />
      </SectionCard>
    </form>
  );
}
