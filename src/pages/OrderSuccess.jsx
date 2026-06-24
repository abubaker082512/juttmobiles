import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, Package, Truck, Home, ArrowRight } from 'lucide-react';
import './OrderSuccess.css';

export default function OrderSuccess() {
  const { state } = useLocation();
  const order = state?.order;
  const sym = 'Rs.';

  return (
    <div className="success-page">
      <div className="container">
        <div className="success-card">
          <div className="success-icon-wrap">
            <div className="success-icon"><CheckCircle size={48} color="#10b981" /></div>
            <div className="success-ripple" />
          </div>
          <h1 className="success-title">Order Placed Successfully!</h1>
          <p className="success-subtitle">
            Thank you for shopping with Jutt Mobiles! Your order has been received and is being processed.
          </p>

          {order && (
            <>
              <div className="order-number-badge">
                <span>Order</span>
                <span className="order-number"># {order.order_number}</span>
              </div>

              <div className="order-timeline">
                {[
                  { icon: CheckCircle, label: 'Order Confirmed', done: true },
                  { icon: Package, label: 'Processing', done: false },
                  { icon: Truck, label: 'Shipped', done: false },
                  { icon: Home, label: 'Delivered', done: false },
                ].map((step, i) => (
                  <div key={i} className={`timeline-step ${step.done ? 'timeline-done' : ''}`}>
                    <div className="timeline-icon"><step.icon size={16} /></div>
                    <div className="timeline-label">{step.label}</div>
                    {i < 3 && <div className={`timeline-line ${step.done ? 'line-done' : ''}`} />}
                  </div>
                ))}
              </div>

              <div className="success-details">
                <div className="detail-col">
                  <h4>Shipping To</h4>
                  <p>{order.customer_name}</p>
                  <p>{order.shipping_address}</p>
                  <p>{order.customer_phone}</p>
                </div>
                <div className="detail-col">
                  <h4>Payment</h4>
                  <p>{order.payment_method === 'cod' ? 'Cash on Delivery' : 'Bank Transfer'}</p>
                  <p style={{ color: 'var(--accent-cyan)', fontWeight: 700, fontSize: 'var(--font-size-lg)' }}>
                    {sym} {order.total?.toLocaleString()}
                  </p>
                  {order.payment_method === 'bank' && (
                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--accent-orange)' }}>
                      Please send payment proof on WhatsApp to confirm your order.
                    </p>
                  )}
                </div>
              </div>

              {order.items && (
                <div className="success-items">
                  <h4 style={{ fontWeight: 700, marginBottom: 'var(--space-4)', color: 'var(--text-primary)' }}>
                    Ordered Items
                  </h4>
                  {order.items.map((item, i) => {
                    const price = item.sale_price || item.price;
                    const img = Array.isArray(item.images) ? item.images[0] : item.images;
                    return (
                      <div key={i} className="success-item">
                        <div className="success-item-img"><img src={img} alt={item.name} /></div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{item.name}</div>
                          <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)' }}>Qty: {item.quantity}</div>
                        </div>
                        <div style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>
                          {sym} {(price * item.quantity).toLocaleString()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          <div className="success-actions">
            <Link to="/dashboard" className="btn btn-secondary btn-lg">Track Order</Link>
            <Link to="/" className="btn btn-primary btn-lg">
              Continue Shopping <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
