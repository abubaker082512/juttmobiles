import React from 'react';
import { Link } from 'react-router-dom';
import { X, Minus, Plus, ShoppingBag, Trash2, ChevronRight } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import './CartDrawer.css';

export default function CartDrawer() {
  const {
    cartOpen, setCartOpen, cartItems,
    removeFromCart, updateCartQty,
    cartSubtotal, cartTotal, shippingFee,
    couponDiscount, settings
  } = useShop();

  const sym = settings.currency_symbol || 'Rs.';

  return (
    <>
      {/* Overlay */}
      {cartOpen && (
        <div className="overlay" onClick={() => setCartOpen(false)} />
      )}

      {/* Drawer */}
      <div className={`cart-drawer ${cartOpen ? 'cart-drawer-open' : ''}`}>
        {/* Header */}
        <div className="cart-drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <ShoppingBag size={20} color="var(--accent-cyan)" />
            <span>Shopping Cart</span>
            {cartItems.length > 0 && (
              <span className="badge badge-new">{cartItems.length}</span>
            )}
          </div>
          <button className="btn-icon" onClick={() => setCartOpen(false)} aria-label="Close cart">
            <X size={18} />
          </button>
        </div>

        {/* Items */}
        <div className="cart-drawer-items">
          {cartItems.length === 0 ? (
            <div className="cart-empty">
              <ShoppingBag size={48} color="var(--text-muted)" />
              <p>Your cart is empty</p>
              <Link
                to="/products"
                className="btn btn-primary"
                style={{ marginTop: 'var(--space-4)' }}
                onClick={() => setCartOpen(false)}
              >
                Browse Products
              </Link>
            </div>
          ) : (
            cartItems.map(item => {
              const price = item.sale_price || item.price;
              const img = Array.isArray(item.images) ? item.images[0] : item.images;
              return (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-img">
                    <img src={img} alt={item.name} />
                  </div>
                  <div className="cart-item-info">
                    <h4 className="cart-item-name">{item.name}</h4>
                    <div className="cart-item-price">{sym} {(price * item.quantity).toLocaleString()}</div>
                    <div className="cart-item-controls">
                      <button
                        className="qty-btn"
                        onClick={() => updateCartQty(item.id, item.quantity - 1)}
                        aria-label="Decrease"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="qty-display">{item.quantity}</span>
                      <button
                        className="qty-btn"
                        onClick={() => updateCartQty(item.id, item.quantity + 1)}
                        aria-label="Increase"
                      >
                        <Plus size={12} />
                      </button>
                      <button
                        className="qty-btn qty-remove"
                        onClick={() => removeFromCart(item.id)}
                        aria-label="Remove"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-totals">
              <div className="cart-total-row">
                <span>Subtotal</span>
                <span>{sym} {cartSubtotal.toLocaleString()}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="cart-total-row" style={{ color: 'var(--accent-green)' }}>
                  <span>Discount</span>
                  <span>-{sym} {couponDiscount.toLocaleString()}</span>
                </div>
              )}
              <div className="cart-total-row">
                <span>Shipping</span>
                <span>{shippingFee === 0 ? <span style={{ color: 'var(--accent-green)' }}>Free</span> : `${sym} ${shippingFee}`}</span>
              </div>
              <div className="cart-total-row cart-grand-total">
                <span>Total</span>
                <span>{sym} {cartTotal.toLocaleString()}</span>
              </div>
            </div>
            <div className="cart-footer-btns">
              <Link
                to="/checkout"
                className="btn btn-primary btn-lg"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => setCartOpen(false)}
              >
                Checkout Now <ChevronRight size={18} />
              </Link>
              <Link
                to="/cart"
                className="btn btn-secondary"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => setCartOpen(false)}
              >
                View Cart
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
