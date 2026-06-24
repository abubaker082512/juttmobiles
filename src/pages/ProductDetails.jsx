import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart, Star, Minus, Plus, MessageCircle,
  Shield, Truck, RotateCcw, ChevronRight, Package
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import ProductCard from '../components/ProductCard';
import './ProductDetails.css';

export default function ProductDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { products, addToCart, settings, getProductReviews, addReview } = useShop();

  const product = products.find(p => (p.slug === slug || p.id === slug) && p.status === 'published');

  const [activeTab, setActiveTab] = useState('description');
  const [quantity, setQuantity] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [review, setReview] = useState({ author: '', rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  const reviews = product ? getProductReviews(product.id) : [];
  const sym = settings.currency_symbol || 'Rs.';

  useEffect(() => {
    window.scrollTo({ top: 0 });
    setActiveImg(0);
    setQuantity(1);
    setActiveTab('description');
  }, [slug]);

  if (!product) {
    return (
      <div className="container" style={{ padding: 'var(--space-20) var(--space-6)', textAlign: 'center' }}>
        <Package size={64} color="var(--text-muted)" style={{ margin: '0 auto var(--space-6)' }} />
        <h2>Product not found</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-6)' }}>This product may have been removed or is unavailable.</p>
        <Link to="/products" className="btn btn-primary">Browse Products</Link>
      </div>
    );
  }

  const images = Array.isArray(product.images) ? product.images : [product.images];
  const price = product.sale_price || product.price;
  const hasDiscount = product.sale_price && product.sale_price < product.price;
  const discountPct = hasDiscount ? Math.round((1 - product.sale_price / product.price) * 100) : null;
  const related = products.filter(p => p.category_slug === product.category_slug && p.id !== product.id && p.status === 'published').slice(0, 4);
  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : product.rating;

  const handleAddToCart = () => addToCart(product, quantity);

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(`Hi Jutt Mobiles! I'm interested in: ${product.name} (${sym} ${price?.toLocaleString()}). Please share availability.`);
    window.open(`https://wa.me/${settings.whatsapp_number || '923001234567'}?text=${msg}`, '_blank');
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!review.author.trim() || !review.comment.trim()) return;
    setSubmittingReview(true);
    await addReview(product.id, review);
    setReview({ author: '', rating: 5, comment: '' });
    setSubmittingReview(false);
    setActiveTab('reviews');
  };

  const renderStars = (rating, size = 16, interactive = false) => (
    <div className="stars" style={{ gap: '3px' }}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={size}
          fill={i < Math.round(rating) ? '#f59e0b' : 'none'}
          color={i < Math.round(rating) ? '#f59e0b' : '#374151'}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
          onClick={() => interactive && setReview(r => ({ ...r, rating: i + 1 }))}
        />
      ))}
    </div>
  );

  return (
    <div className="product-details">
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb" style={{ marginBottom: 'var(--space-8)', marginTop: 'var(--space-6)' }}>
          <Link to="/">Home</Link><span>/</span>
          <Link to="/products">Products</Link><span>/</span>
          <Link to={`/category/${product.category_slug}`}>{product.category_slug?.replace(/-/g, ' ')}</Link>
          <span>/</span>
          <span className="breadcrumb-active">{product.name}</span>
        </div>

        {/* Main Layout */}
        <div className="pd-grid">
          {/* Image Column */}
          <div className="pd-images">
            <div className="pd-main-img">
              <img src={images[activeImg]} alt={product.name} />
              {hasDiscount && <div className="pd-discount-badge">-{discountPct}%</div>}
            </div>
            {images.length > 1 && (
              <div className="pd-thumbnails">
                {images.map((img, i) => (
                  <button
                    key={i}
                    className={`pd-thumb ${activeImg === i ? 'pd-thumb-active' : ''}`}
                    onClick={() => setActiveImg(i)}
                  >
                    <img src={img} alt={`${product.name} ${i+1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Column */}
          <div className="pd-info">
            {/* Category & Badge */}
            <div className="pd-meta">
              <Link to={`/category/${product.category_slug}`} className="pd-category">
                {product.category_slug?.replace(/-/g, ' ')}
              </Link>
              {product.badge && <span className={`badge badge-${product.badge.toLowerCase() === 'hot' ? 'hot' : 'new'}`}>{product.badge}</span>}
              {product.sku && <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginLeft: 'auto' }}>SKU: {product.sku}</span>}
            </div>

            <h1 className="pd-title">{product.name}</h1>

            {/* Rating */}
            <div className="pd-rating">
              {renderStars(avgRating)}
              <span className="pd-rating-num">{avgRating}</span>
              <span className="pd-review-count">{reviews.length || product.review_count || 0} reviews</span>
            </div>

            {/* Price */}
            <div className="pd-price-block">
              <span className="price-new" style={{ fontSize: 'var(--font-size-2xl)' }}>{sym} {price?.toLocaleString()}</span>
              {hasDiscount && (
                <>
                  <span className="price-old" style={{ fontSize: 'var(--font-size-base)' }}>{sym} {product.price?.toLocaleString()}</span>
                  <span className="pd-saving">Save {sym} {(product.price - product.sale_price)?.toLocaleString()}</span>
                </>
              )}
            </div>

            {/* Short Description */}
            {product.short_description && (
              <p className="pd-short-desc">{product.short_description}</p>
            )}

            {/* Stock */}
            <div className="pd-stock">
              <div className={`stock-dot ${product.stock_quantity > 0 ? 'stock-in' : 'stock-out'}`} />
              <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
                {product.stock_quantity > 10 ? 'In Stock' :
                 product.stock_quantity > 0 ? `Only ${product.stock_quantity} left!` :
                 'Out of Stock'}
              </span>
            </div>

            {/* Quantity & Add to Cart */}
            {product.stock_quantity > 0 && (
              <div className="pd-actions">
                <div className="pd-qty">
                  <button className="qty-btn" onClick={() => setQuantity(q => Math.max(1, q - 1))}><Minus size={14} /></button>
                  <span className="qty-display">{quantity}</span>
                  <button className="qty-btn" onClick={() => setQuantity(q => Math.min(product.stock_quantity, q + 1))}><Plus size={14} /></button>
                </div>
                <button className="btn btn-primary btn-lg pd-cart-btn" onClick={handleAddToCart}>
                  <ShoppingCart size={18} /> Add to Cart
                </button>
                <button className="pd-whatsapp-btn" onClick={handleWhatsApp}>
                  <MessageCircle size={18} /> WhatsApp
                </button>
              </div>
            )}

            {/* Guarantees */}
            <div className="pd-guarantees">
              <div className="guarantee-item"><Truck size={16} /><span>Free delivery above Rs. {settings.free_shipping_threshold?.toLocaleString()}</span></div>
              <div className="guarantee-item"><RotateCcw size={16} /><span>7-day easy return</span></div>
              <div className="guarantee-item"><Shield size={16} /><span>Authentic product, warranty included</span></div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="pd-tabs">
          <div className="pd-tab-list">
            {['description', 'specifications', 'reviews'].map(tab => (
              <button
                key={tab}
                className={`pd-tab-btn ${activeTab === tab ? 'pd-tab-active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {tab === 'reviews' && ` (${reviews.length})`}
              </button>
            ))}
          </div>

          <div className="pd-tab-content">
            {activeTab === 'description' && (
              <div className="pd-description">
                <p>{product.description}</p>
              </div>
            )}

            {activeTab === 'specifications' && product.specifications && (
              <div className="pd-specs-table">
                <table className="data-table">
                  <tbody>
                    {Object.entries(product.specifications).map(([key, val]) => (
                      <tr key={key}>
                        <td style={{ fontWeight: 700, color: 'var(--text-primary)', width: '40%' }}>{key}</td>
                        <td>{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="pd-reviews">
                {reviews.length > 0 ? (
                  <div className="reviews-list">
                    {reviews.map((r, i) => (
                      <div key={r.id || i} className="review-item">
                        <div className="review-header">
                          <div className="reviewer-avatar">{r.author?.[0]?.toUpperCase() || 'A'}</div>
                          <div>
                            <div className="reviewer-name">{r.author}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginTop: 2 }}>
                              {renderStars(r.rating, 13)}
                              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{r.created_at?.split('T')[0]}</span>
                            </div>
                          </div>
                        </div>
                        <p className="review-comment">{r.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-6)' }}>No reviews yet. Be the first!</p>
                )}

                {/* Write Review Form */}
                <div className="review-form">
                  <h3 className="review-form-title">Write a Review</h3>
                  <form onSubmit={handleSubmitReview}>
                    <div className="form-group">
                      <label className="form-label">Your Name</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Enter your name"
                        value={review.author}
                        onChange={e => setReview(r => ({ ...r, author: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Rating</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        {renderStars(review.rating, 28, true)}
                        <span style={{ color: 'var(--accent-orange)', fontWeight: 700 }}>{review.rating}/5</span>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Your Review</label>
                      <textarea
                        className="form-textarea"
                        placeholder="Share your experience with this product..."
                        value={review.comment}
                        onChange={e => setReview(r => ({ ...r, comment: e.target.value }))}
                        required
                        rows={4}
                      />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={submittingReview}>
                      {submittingReview ? <><span className="spinner" /> Submitting...</> : 'Submit Review'}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div style={{ padding: 'var(--space-12) 0' }}>
            <div className="section-header" style={{ marginBottom: 'var(--space-6)' }}>
              <h2 className="section-title">Related Products</h2>
              <Link to={`/category/${product.category_slug}`} className="btn btn-secondary">View All <ChevronRight size={16} /></Link>
            </div>
            <div className="products-grid">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
