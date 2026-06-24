import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Zap, Shield, Truck, Star } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import ProductCard from '../components/ProductCard';
import './Home.css';

const HERO_SLIDES = [
  {
    id: 1,
    badge: 'New Arrival',
    title: 'WIWU 3-in-1 Wireless Charger Speaker',
    subtitle: 'Charge phone, earbuds & smartwatch simultaneously',
    cta: 'Shop Now',
    ctaLink: '/products/wiwu-3in1-wireless-charger',
    color: 'var(--gradient-primary)',
    image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&q=80',
  },
  {
    id: 2,
    badge: 'Hot Deal',
    title: 'Jutt 65W GaN Fast Wall Charger',
    subtitle: 'Charge your laptop, phone & tablet — all at once',
    cta: 'Shop Chargers',
    ctaLink: '/category/power-banks',
    color: 'var(--gradient-warm)',
    image: 'https://images.unsplash.com/photo-1616763355548-1b606f439f86?w=800&q=80',
  },
  {
    id: 3,
    badge: 'Best Seller',
    title: 'Jutt TWS Pro Wireless Earbuds',
    subtitle: 'ANC, 30hr battery, IPX5 waterproof — pure audio bliss',
    cta: 'Shop Earbuds',
    ctaLink: '/category/earphones',
    color: 'var(--gradient-secondary)',
    image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800&q=80',
  },
];

export default function Home() {
  const { products, categories, settings } = useShop();
  const [slide, setSlide] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => setSlide(s => (s + 1) % HERO_SLIDES.length), 5000);
    return () => clearInterval(timerRef.current);
  }, []);

  const go = (dir) => {
    clearInterval(timerRef.current);
    setSlide(s => (s + dir + HERO_SLIDES.length) % HERO_SLIDES.length);
    timerRef.current = setInterval(() => setSlide(s => (s + 1) % HERO_SLIDES.length), 5000);
  };

  const sym = settings.currency_symbol || 'Rs.';
  const topSelling = products.filter(p => p.status === 'published').slice(0, 8);
  const powerBanks = products.filter(p => p.category_slug === 'power-banks' && p.status === 'published').slice(0, 8);
  const earphones = products.filter(p => p.category_slug === 'earphones' && p.status === 'published').slice(0, 8);
  const smartWatches = products.filter(p => p.category_slug === 'smart-watches' && p.status === 'published').slice(0, 8);
  const gaming = products.filter(p => p.category_slug === 'gaming' && p.status === 'published').slice(0, 8);
  const featuredProduct = products.find(p => p.id === 'wiwu-3in1');

  return (
    <div className="home">
      {/* Hero Carousel */}
      <section className="hero">
        {HERO_SLIDES.map((s, i) => (
          <div key={s.id} className={`hero-slide ${i === slide ? 'hero-slide-active' : ''}`}>
            <div className="hero-bg" style={{ backgroundImage: `url(${s.image})` }} />
            <div className="hero-overlay" />
            <div className="container hero-content">
              <div className="hero-text animate-slide-up">
                <span className="hero-badge">{s.badge}</span>
                <h1 className="hero-title">{s.title}</h1>
                <p className="hero-sub">{s.subtitle}</p>
                <div className="hero-actions">
                  <Link to={s.ctaLink} className="btn btn-primary btn-lg">
                    {s.cta} <ArrowRight size={18} />
                  </Link>
                  <Link to="/products" className="btn btn-secondary btn-lg">Browse All</Link>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Controls */}
        <button className="hero-btn hero-btn-prev" onClick={() => go(-1)} aria-label="Previous">
          <ChevronLeft size={22} />
        </button>
        <button className="hero-btn hero-btn-next" onClick={() => go(1)} aria-label="Next">
          <ChevronRight size={22} />
        </button>
        <div className="hero-dots">
          {HERO_SLIDES.map((_, i) => (
            <button key={i} className={`hero-dot ${i === slide ? 'hero-dot-active' : ''}`} onClick={() => { clearInterval(timerRef.current); setSlide(i); }} />
          ))}
        </div>
      </section>

      {/* Category Collection Cards */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-8)' }}>
            <div>
              <h2 className="section-title">Shop Collections</h2>
              <p className="section-subtitle" style={{ marginBottom: 0 }}>Browse by category and discover top picks</p>
            </div>
          </div>
          <div className="category-grid">
            {categories.map(cat => (
              <Link key={cat.id} to={`/category/${cat.slug}`} className="category-card">
                <div className="category-icon" style={{ background: `${cat.color}22`, borderColor: `${cat.color}44` }}>
                  <span style={{ fontSize: '2rem' }}>{cat.icon}</span>
                </div>
                <div className="category-name">{cat.name}</div>
                <div className="category-count">
                  {products.filter(p => p.category_slug === cat.slug).length} products
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Top Selling */}
      {topSelling.length > 0 && (
        <section className="section section-alt">
          <div className="container">
            <div className="section-header">
              <div>
                <h2 className="section-title">Top Selling</h2>
                <p className="section-subtitle" style={{ marginBottom: 0 }}>Most loved products by our customers</p>
              </div>
              <Link to="/products" className="btn btn-secondary">View all <ArrowRight size={16} /></Link>
            </div>
            <div className="products-grid">
              {topSelling.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* Featured Product */}
      {featuredProduct && (
        <section className="section">
          <div className="container">
            <div className="featured-product">
              <div className="featured-img">
                <img
                  src={Array.isArray(featuredProduct.images) ? featuredProduct.images[0] : featuredProduct.images}
                  alt={featuredProduct.name}
                />
              </div>
              <div className="featured-info">
                <span className="badge badge-new" style={{ marginBottom: 'var(--space-4)', display: 'inline-flex' }}>Featured Product</span>
                <h2 className="featured-title">{featuredProduct.name}</h2>
                <p className="featured-desc">{featuredProduct.description}</p>
                <div className="featured-specs">
                  {Object.entries(featuredProduct.specifications || {}).slice(0, 4).map(([k, v]) => (
                    <div key={k} className="spec-item">
                      <Zap size={14} color="var(--accent-cyan)" />
                      <span><strong>{k}:</strong> {v}</span>
                    </div>
                  ))}
                </div>
                <div className="featured-price">
                  <span className="price-new">{sym} {(featuredProduct.sale_price || featuredProduct.price)?.toLocaleString()}</span>
                  {featuredProduct.sale_price && <span className="price-old">{sym} {featuredProduct.price?.toLocaleString()}</span>}
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                  <button className="btn btn-primary btn-lg" onClick={() => window.useShopCart?.(featuredProduct)}>Add to Cart</button>
                  <Link to={`/products/${featuredProduct.slug}`} className="btn btn-secondary btn-lg">View Details</Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Power Banks & Chargers */}
      {powerBanks.length > 0 && (
        <section className="section section-alt">
          <div className="container">
            <div className="section-header">
              <div>
                <h2 className="section-title">Power Banks & Chargers</h2>
                <p className="section-subtitle" style={{ marginBottom: 0 }}>Never run out of battery again</p>
              </div>
              <Link to="/category/power-banks" className="btn btn-secondary">View all <ArrowRight size={16} /></Link>
            </div>
            <div className="products-grid">
              {powerBanks.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* Earphones */}
      {earphones.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-header">
              <div>
                <h2 className="section-title">Earphones & Headsets</h2>
                <p className="section-subtitle" style={{ marginBottom: 0 }}>Premium audio experiences</p>
              </div>
              <Link to="/category/earphones" className="btn btn-secondary">View all <ArrowRight size={16} /></Link>
            </div>
            <div className="products-grid">
              {earphones.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* Smart Watches */}
      {smartWatches.length > 0 && (
        <section className="section section-alt">
          <div className="container">
            <div className="section-header">
              <div>
                <h2 className="section-title">Smart Watches & Bands</h2>
                <p className="section-subtitle" style={{ marginBottom: 0 }}>Track your health and stay connected</p>
              </div>
              <Link to="/category/smart-watches" className="btn btn-secondary">View all <ArrowRight size={16} /></Link>
            </div>
            <div className="products-grid">
              {smartWatches.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* Gaming */}
      {gaming.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-header">
              <div>
                <h2 className="section-title">Gaming Gear</h2>
                <p className="section-subtitle" style={{ marginBottom: 0 }}>Level up your mobile gaming setup</p>
              </div>
              <Link to="/category/gaming" className="btn btn-secondary">View all <ArrowRight size={16} /></Link>
            </div>
            <div className="products-grid">
              {gaming.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
