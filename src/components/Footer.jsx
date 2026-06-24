import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, MessageCircle, Shield, Truck, RotateCcw, Star } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import './Footer.css';

export default function Footer() {
  const { categories, settings } = useShop();

  const whatsappUrl = `https://wa.me/${settings.whatsapp_number || '923001234567'}?text=Hi%20Jutt%20Mobiles%2C%20I%20need%20help%20with%20my%20order.`;

  return (
    <footer className="footer">
      {/* Trust Badges */}
      <div className="footer-trust">
        <div className="container">
          <div className="trust-grid">
            <div className="trust-item">
              <div className="trust-icon"><Truck size={22} /></div>
              <div>
                <div className="trust-title">Free Delivery</div>
                <div className="trust-sub">On orders above Rs. {settings.free_shipping_threshold?.toLocaleString() || '2,000'}</div>
              </div>
            </div>
            <div className="trust-item">
              <div className="trust-icon"><RotateCcw size={22} /></div>
              <div>
                <div className="trust-title">7-Day Returns</div>
                <div className="trust-sub">Easy return on all items</div>
              </div>
            </div>
            <div className="trust-item">
              <div className="trust-icon"><Shield size={22} /></div>
              <div>
                <div className="trust-title">100% Authentic</div>
                <div className="trust-sub">Warranty included</div>
              </div>
            </div>
            <div className="trust-item">
              <div className="trust-icon"><Star size={22} /></div>
              <div>
                <div className="trust-title">Top Rated</div>
                <div className="trust-sub">4.8★ by 10,000+ customers</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-main">
        <div className="container">
          <div className="footer-grid">
            {/* Brand */}
            <div className="footer-brand">
              <div className="footer-logo">
                <div className="logo-icon-sm">J</div>
                <span className="footer-logo-text">{settings.shop_name || 'Jutt Mobiles'}</span>
              </div>
              <p className="footer-desc">
                {settings.shop_tagline || 'Premium mobile accessories in Pakistan'}. Quality you can trust, prices you\'ll love.
              </p>
              <a href={whatsappUrl} className="whatsapp-btn" target="_blank" rel="noreferrer">
                <MessageCircle size={18} />
                Chat on WhatsApp
              </a>
            </div>

            {/* Quick Shop */}
            <div className="footer-col">
              <h4 className="footer-heading">Shop</h4>
              <ul className="footer-links">
                {categories.map(cat => (
                  <li key={cat.id}>
                    <Link to={`/category/${cat.slug}`} className="footer-link">
                      {cat.icon} {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Useful Links */}
            <div className="footer-col">
              <h4 className="footer-heading">Help</h4>
              <ul className="footer-links">
                <li><Link to="/dashboard" className="footer-link">My Orders</Link></li>
                <li><Link to="/login" className="footer-link">Login / Register</Link></li>
                <li><a href="#faq" className="footer-link">FAQs</a></li>
                <li><a href="#contact" className="footer-link">Contact Us</a></li>
                <li><a href="#privacy" className="footer-link">Privacy Policy</a></li>
                <li><a href="#refund" className="footer-link">Refund Policy</a></li>
                <li><a href="#terms" className="footer-link">Terms of Service</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div className="footer-col">
              <h4 className="footer-heading">Contact Us</h4>
              <ul className="footer-contact">
                <li>
                  <Phone size={15} />
                  <a href={`tel:${settings.support_phone}`}>{settings.support_phone || '+92 300 1234567'}</a>
                </li>
                <li>
                  <Mail size={15} />
                  <a href={`mailto:${settings.support_email}`}>{settings.support_email || 'support@juttmobile.pk'}</a>
                </li>
                <li>
                  <MapPin size={15} />
                  <span>{settings.address || 'Lahore, Punjab, Pakistan'}</span>
                </li>
                <li>
                  <Clock size={15} />
                  <span>Mon – Sat, 10am – 7pm</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>© {new Date().getFullYear()} {settings.shop_name || 'Jutt Mobiles'}. All rights reserved.</p>
          <div className="payment-badges">
            <span className="pay-badge">COD</span>
            <span className="pay-badge">Bank Transfer</span>
            <span className="pay-badge">Jazz Cash</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
