import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Zap, Shield, Truck, Star } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import ProductCard from '../components/ProductCard';
import './Home.css';

const HERO_SLIDES = [
  {
    id: 1,
    image: '/assets/banner-earbuds-9eqdCz9d.png',
    mobileImage: '/assets/mobile-banner-earbuds-D36Ofzyg.png',
    alt: 'Premium Earbuds Collection',
    link: '/category/earphones'
  },
  {
    id: 2,
    image: '/assets/banner-charger-Cdxd6ZJN.png',
    mobileImage: '/assets/mobile-banner-charger-B8hbUMLE.png',
    alt: 'Fast Charging Solutions',
    link: '/category/power-banks'
  },
  {
    id: 3,
    image: '/assets/banner-gadgets-D279Hmu8.png',
    mobileImage: '/assets/mobile-banner-gadgets-CWNqbCUm.png',
    alt: 'Latest Smart Gadgets',
    link: '/category/tech-gadgets'
  },
  {
    id: 4,
    image: '/assets/banner-watch-BNQAlqxX.png',
    mobileImage: '/assets/mobile-banner-watch-DySqjd1X.png',
    alt: 'Smart Watches & Bands',
    link: '/category/smart-watches'
  }
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
        <div className="hero-slider" style={{ transform: `translateX(-${slide * 100}%)`, display: 'flex', transition: 'transform 0.7s ease-out', width: '100%', height: '100%' }}>
          {HERO_SLIDES.map((s) => (
            <Link key={s.id} to={s.link} className="hero-slide-link" style={{ width: '100%', flexShrink: 0, display: 'block', position: 'relative', height: '100%' }}>
              <picture style={{ display: 'block', width: '100%', height: '100%' }}>
                <source media="(min-width: 768px)" srcSet={s.image} />
                <img src={s.mobileImage} alt={s.alt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </picture>
            </Link>
          ))}
        </div>

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
            {categories.map(cat => {
              const catProducts = products
                .filter(p => (p.category_id === cat.id || p.category_slug === cat.slug) && p.status === 'published')
                .slice(0, 3);
              const mainImg = catProducts[0] 
                ? (Array.isArray(catProducts[0].images) ? catProducts[0].images[0] : catProducts[0].images)
                : '/assets/favicon.svg';

              return (
                <div key={cat.id} className="category-card-wrapper">
                  <Link to={`/category/${cat.slug}`} className="category-card">
                    <div className="category-icon">
                      <img src={mainImg} alt={cat.name} className="category-main-img" />
                    </div>
                    <span className="category-name">{cat.name}</span>
                  </Link>
                  <div className="category-thumbnails">
                    {catProducts.map(p => (
                      <Link key={p.id} to={`/products/${p.slug}`} className="category-thumb-link" title={p.name}>
                        <img src={Array.isArray(p.images) ? p.images[0] : p.images} alt={p.name} className="category-thumb-img" />
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
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
