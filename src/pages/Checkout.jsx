import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Banknote, CreditCard, Copy, CheckCircle, AlertCircle } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import './Checkout.css';

export default function Checkout() {
  const { cartItems, cartSubtotal, shippingFee, cartTotal, couponDiscount, placeOrder, settings, user, profile } = useShop();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: profile?.full_name || '',
    email: user?.email || '',
    phone: profile?.phone || '',
    province: '',
    city: '',
    address: '',
    notes: '',
    paymentMethod: 'cod',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [copiedField, setCopiedField] = useState('');
  const sym = settings.currency_symbol || 'Rs.';

  const PROVINCES = ['Punjab','Sindh','Khyber Pakhtunkhwa','Balochistan','Gilgit-Baltistan','Azad Kashmir','Islamabad Capital Territory'];

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = 'Full name is required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email is required';
    if (!form.phone.trim()) e.phone = 'Phone number is required';
    if (!form.province) e.province = 'Province is required';
    if (!form.city.trim()) e.city = 'City is required';
    if (!form.address.trim()) e.address = 'Address is required';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => { const n = { ...p }; delete n[name]; return n; });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const order = await placeOrder(form);
      navigate('/order-success', { state: { order } });
    } catch (err) {
      setErrors({ submit: err.message || 'Failed to place order.' });
    } finally {
      setLoading(false);
    }
  };

  const copy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(''), 2000);
  };

  if (!cartItems.length) return (
    <div className="container" style={{paddingTop:'var(--space-20)',textAlign:'center'}}>
      <h2>Your cart is empty</h2>
      <Link to="/products" className="btn btn-primary" style={{marginTop:'var(--space-6)'}}>Browse Products</Link>
    </div>
  );

  return (
    <div className="checkout-page">
      <div className="container">
        <h1 className="checkout-title">Checkout</h1>
        <form onSubmit={handleSubmit}>
          <div className="checkout-layout">
            <div className="checkout-form">
              <div className="checkout-section">
                <h2 className="checkout-section-title">Shipping Information</h2>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input type="text" name="fullName" className={`form-input ${errors.fullName?'input-error':''}`} placeholder="Muhammad Ali" value={form.fullName} onChange={handleChange} />
                    {errors.fullName && <span className="field-error">{errors.fullName}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address *</label>
                    <input type="email" name="email" className={`form-input ${errors.email?'input-error':''}`} placeholder="ali@example.com" value={form.email} onChange={handleChange} />
                    {errors.email && <span className="field-error">{errors.email}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">WhatsApp / Phone *</label>
                    <input type="tel" name="phone" className={`form-input ${errors.phone?'input-error':''}`} placeholder="0300 1234567" value={form.phone} onChange={handleChange} />
                    {errors.phone && <span className="field-error">{errors.phone}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Province *</label>
                    <select name="province" className={`form-select ${errors.province?'input-error':''}`} value={form.province} onChange={handleChange}>
                      <option value="">Select Province</option>
                      {PROVINCES.map(p=><option key={p} value={p}>{p}</option>)}
                    </select>
                    {errors.province && <span className="field-error">{errors.province}</span>}
                  </div>
                  <div className="form-group form-group-full">
                    <label className="form-label">City *</label>
                    <input type="text" name="city" className={`form-input ${errors.city?'input-error':''}`} placeholder="Lahore" value={form.city} onChange={handleChange} />
                    {errors.city && <span className="field-error">{errors.city}</span>}
                  </div>
                  <div className="form-group form-group-full">
                    <label className="form-label">Full Address *</label>
                    <textarea name="address" className={`form-textarea ${errors.address?'input-error':''}`} placeholder="House #, Street, Area, Landmark" value={form.address} onChange={handleChange} rows={3} />
                    {errors.address && <span className="field-error">{errors.address}</span>}
                  </div>
                  <div className="form-group form-group-full">
                    <label className="form-label">Order Notes (Optional)</label>
                    <textarea name="notes" className="form-textarea" placeholder="Special instructions..." value={form.notes} onChange={handleChange} rows={2} />
                  </div>
                </div>
              </div>

              <div className="checkout-section">
                <h2 className="checkout-section-title">Payment Method</h2>
                <div className="payment-options">
                  <label className={`payment-option ${form.paymentMethod==='cod'?'payment-option-active':''}`}>
                    <input type="radio" name="paymentMethod" value="cod" checked={form.paymentMethod==='cod'} onChange={handleChange} hidden />
                    <div className="payment-icon"><Banknote size={24} color="var(--accent-green)" /></div>
                    <div>
                      <div className="payment-name">Cash on Delivery (COD)</div>
                      <div className="payment-desc">Pay when your order arrives</div>
                    </div>
                    {form.paymentMethod==='cod' && <CheckCircle size={20} color="var(--accent-green)" style={{marginLeft:'auto',flexShrink:0}} />}
                  </label>
                  <label className={`payment-option ${form.paymentMethod==='bank'?'payment-option-active':''}`}>
                    <input type="radio" name="paymentMethod" value="bank" checked={form.paymentMethod==='bank'} onChange={handleChange} hidden />
                    <div className="payment-icon"><CreditCard size={24} color="var(--accent-blue)" /></div>
                    <div>
                      <div className="payment-name">Bank Transfer</div>
                      <div className="payment-desc">Transfer before shipping</div>
                    </div>
                    {form.paymentMethod==='bank' && <CheckCircle size={20} color="var(--accent-blue)" style={{marginLeft:'auto',flexShrink:0}} />}
                  </label>
                </div>
                {form.paymentMethod==='bank' && (
                  <div className="bank-details">
                    <h4 style={{fontWeight:700,marginBottom:'var(--space-4)',color:'var(--text-primary)'}}>Bank Account Details</h4>
                    {[
                      {label:'Bank',value:settings.bank_name||'HBL (Habib Bank)'},
                      {label:'Account Title',value:settings.account_title||'Jutt Mobiles Pakistan'},
                      {label:'Account Number',value:settings.account_number||'0001-1234567890',copyable:true},
                      {label:'IBAN',value:settings.iban||'PK36HABB0000000001234567',copyable:true},
                    ].map(row=>(
                      <div key={row.label} className="bank-row">
                        <span className="bank-label">{row.label}</span>
                        <div style={{display:'flex',alignItems:'center',gap:'var(--space-2)'}}>
                          <span className="bank-value">{row.value}</span>
                          {row.copyable && (
                            <button type="button" className="copy-btn" onClick={()=>copy(row.value,row.label)}>
                              {copiedField===row.label?<CheckCircle size={14} color="var(--accent-green)" />:<Copy size={14} />}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    <div className="bank-note"><AlertCircle size={15} /> Send payment screenshot on WhatsApp after transfer.</div>
                  </div>
                )}
              </div>
              {errors.submit && <div style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:'var(--radius-md)',padding:'var(--space-4)',color:'var(--accent-red)',fontSize:'var(--font-size-sm)'}}>{errors.submit}</div>}
            </div>

            <div className="checkout-summary">
              <h3 className="summary-title">Your Order</h3>
              <div className="order-items">
                {cartItems.map(item=>{
                  const price=item.sale_price||item.price;
                  const img=Array.isArray(item.images)?item.images[0]:item.images;
                  return (
                    <div key={item.id} className="order-item">
                      <div className="order-item-img"><img src={img} alt={item.name} /><span className="order-item-qty">{item.quantity}</span></div>
                      <div className="order-item-info"><div className="order-item-name">{item.name}</div><div className="order-item-price">{sym} {(price*item.quantity).toLocaleString()}</div></div>
                    </div>
                  );
                })}
              </div>
              <div className="checkout-totals">
                <div className="checkout-row"><span>Subtotal</span><span>{sym} {cartSubtotal.toLocaleString()}</span></div>
                {couponDiscount>0 && <div className="checkout-row" style={{color:'var(--accent-green)'}}><span>Discount</span><span>-{sym} {couponDiscount.toLocaleString()}</span></div>}
                <div className="checkout-row"><span>Shipping</span><span>{shippingFee===0?'FREE':`${sym} ${shippingFee}`}</span></div>
                <div className="checkout-total"><span>Total</span><span>{sym} {cartTotal.toLocaleString()}</span></div>
              </div>
              <button type="submit" className="btn btn-primary btn-lg" style={{width:'100%',justifyContent:'center'}} disabled={loading}>
                {loading?<><span className="spinner" /> Placing Order...</>:`Place Order — ${sym} ${cartTotal.toLocaleString()}`}
              </button>
              <p style={{fontSize:'var(--font-size-xs)',color:'var(--text-muted)',textAlign:'center',marginTop:'var(--space-3)'}}>By placing this order you agree to our Terms of Service.</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
