import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star, Eye } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const { addToCart, settings } = useShop();
  const price = product.sale_price || product.price;
  const hasDiscount = product.sale_price && product.sale_price < product.price;
  const discountPct = hasDiscount
    ? Math.round((1 - product.sale_price / product.price) * 100)
    : null;

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={12}
        fill={i < Math.floor(rating) ? '#f59e0b' : 'none'}
        color={i < Math.floor(rating) ? '#f59e0b' : '#374151'}
      />
    ));
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  return (
    <Link to={`/products/${product.slug || product.id}`} className="product-card">
      {/* Badges */}
      <div className="product-badges">
        {discountPct && <span className="badge badge-sale">-{discountPct}%</span>}
        {product.badge && !discountPct && (
          <span className={`badge badge-${product.badge.toLowerCase() === 'hot' ? 'hot' : product.badge.toLowerCase() === 'new' ? 'new' : 'purple'}`}>
            {product.badge}
          </span>
        )}
        {product.stock_quantity < 10 && product.stock_quantity > 0 && (
          <span className="badge badge-warning">Low Stock</span>
        )}
        {product.stock_quantity === 0 && (
          <span className="badge badge-error">Out of Stock</span>
        )}
      </div>

      {/* Image */}
      <div className="product-image-wrap">
        <img
          src={Array.isArray(product.images) ? product.images[0] : product.images}
          alt={product.name}
          className="product-image"
          loading="lazy"
        />
        {/* Quick actions overlay */}
        <div className="product-overlay">
          <button className="overlay-btn" onClick={handleAddToCart} disabled={product.stock_quantity === 0}>
            <ShoppingCart size={16} />
            {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
          <div className="overlay-btn overlay-view">
            <Eye size={16} /> Quick View
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="product-info">
        <div className="product-category">{product.category_slug?.replace(/-/g, ' ') || product.category}</div>
        <h3 className="product-name">{product.name}</h3>

        {/* Rating */}
        {product.rating && (
          <div className="product-rating">
            <div className="stars">{renderStars(product.rating)}</div>
            <span className="rating-text">{product.rating.toFixed(1)}</span>
            {product.review_count && (
              <span className="rating-count">({product.review_count})</span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="product-price">
          <span className="price-new">{settings.currency_symbol || 'Rs.'} {price?.toLocaleString()}</span>
          {hasDiscount && (
            <span className="price-old">{settings.currency_symbol || 'Rs.'} {product.price?.toLocaleString()}</span>
          )}
        </div>

        {/* Add to Cart Button */}
        <button
          className="product-cart-btn"
          onClick={handleAddToCart}
          disabled={product.stock_quantity === 0}
        >
          <ShoppingCart size={14} />
          {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </Link>
  );
}
