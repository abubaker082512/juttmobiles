import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, Tag, ShoppingBag, ArrowRight, X } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import './Cart.css';

export default function Cart() {
  const {
    cartItems, removeFromCart, updateCartQty,
    cartSubtotal, shippingFee, cartTotal, couponDiscount,
    applyCoupon, appliedCoupon, settings
  } = useShop();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const navigate = useNavigate();
  const sym = settings.currency_symbol || 'Rs.';

  const handleApplyCoupon = () => {
    setCouponError('');
    try {
      applyCoupon(couponInput);
      setCouponInput('');
    } catch (e) {
      setCouponError(e.message);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="container" style={{ paddingTop: 'var(--space-20)', paddingBottom: 'var(--space-20)', textAlign: 'center' }}>
        <div className="empty-state">
          <div className="empty-state-icon"><ShoppingBag size={36} /></div>
          <h2>Your cart is empty</h2>
          <p style={{ marginBottom: 'var(--space-6)' }}>Looks like you haven't added anything yet</p>
          <Link to="/products" className="btn btn-primary btn-lg">Start Shopping <ArrowRight size={18} /></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 900, marginBottom: 'var(--space-8)', marginTop: 'var(--space-8)' }}>
          Shopping Cart <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: 'var(--font-size-base)' }}>({cartItems.length} item{cartItems.length !== 1 ? 's' : ''})</span>
        </h1>

        <div className="cart-layout">
          {/* Cart Items */}
          <div className="cart-items-list">
            {cartItems.map(item => {
              const price = item.sale_price || item.price;
              const img = Array.isArray(item.images) ? item.images[0] : item.images;
              return (
                <div key={item.id} className="cart-row">
                  <div className="cart-row-img">
                    <img src={img} alt={item.name} />
                  </div>
                  <div className="cart-row-info">
                    <Link to={`/products/${item.slug || item.id}`} className="cart-row-name">{item.name}</Link>
                    {item.sale_price && <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', textDecoration: 'line-through' }}>{sym} {item.price?.toLocaleString()}</div>}
                    <div className="cart-row-price">{sym} {price?.toLocaleString()}</div>
                  </div>
                  <div className="cart-row-controls">
                    <div className="cart-qty-control">
                      <button className="qty-btn" onClick={() => updateCartQty(item.id, item.quantity - 1)}><Minus size={14} /></button>
                      <span className="qty-display">{item.quantity}</span>
                      <button className="qty-btn" onClick={() => updateCartQty(item.id, item.quantity + 1)}><Plus size={14} /></button>
                    </div>
                    <div className="cart-row-total">{sym} {(price * item.quantity).toLocaleString()}</div>
                    <button className="cart-remove-btn" onClick={() => removeFromCart(item.id)}><Trash2 size={16} /></button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="cart-summary">
            <h3 className="summary-title">Order Summary</h3>

            {/* Coupon */}
            <div className="coupon-section">
              {appliedCoupon ? (
                <div className="coupon-applied">
                  <Tag size={15} />
                  <span>{appliedCoupon.code} applied</span>
                  <span style={{ marginLeft: 'auto', color: 'var(--accent-green)', fontWeight: 700 }}>-{sym} {couponDiscount.toLocaleString()}</span>
                </div>
              ) : (
                <>
                  <div className="coupon-input-group">
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Promo code (e.g. JUTT10)"
                      value={couponInput}
                      onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponError(''); }}
                    />
                    <button className="btn btn-secondary" onClick={handleApplyCoupon}>Apply</button>
                  </div>
                  {couponError && <p style={{ color: 'var(--accent-red)', fontSize: 'var(--font-size-xs)', marginTop: 'var(--space-2)' }}>{couponError}</p>}
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-2)' }}>Try JUTT10 (10% off), JUTT20 (20% off), or SAVE500</p>
                </>
              )}
            </div>

            <div className="summary-rows">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>{sym} {cartSubtotal.toLocaleString()}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="summary-row" style={{ color: 'var(--accent-green)' }}>
                  <span>Discount</span>
                  <span>-{sym} {couponDiscount.toLocaleString()}</span>
                </div>
              )}
              <div className="summary-row">
                <span>Shipping</span>
                <span>
                  {shippingFee === 0
                    ? <span style={{ color: 'var(--accent-green)', fontWeight: 700 }}>FREE</span>
                    : `${sym} ${shippingFee}`
                  }
                </span>
              </div>
              {settings.free_shipping_enabled && cartSubtotal < settings.free_shipping_threshold && (
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--accent-cyan)', padding: 'var(--space-2) 0', lineHeight: 1.5 }}>
                  Add {sym} {(settings.free_shipping_threshold - cartSubtotal).toLocaleString()} more for FREE delivery!
                </div>
              )}
              <div className="summary-total">
                <span>Total</span>
                <span>{sym} {cartTotal.toLocaleString()}</span>
              </div>
            </div>

            <button
              className="btn btn-primary btn-lg"
              style={{ width: '100%', justifyContent: 'center', marginTop: 'var(--space-2)' }}
              onClick={() => navigate('/checkout')}
            >
              Proceed to Checkout <ArrowRight size={18} />
            </button>
            <Link
              to="/products"
              className="btn btn-ghost"
              style={{ width: '100%', justifyContent: 'center', marginTop: 'var(--space-3)' }}
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
