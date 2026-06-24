import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import ProductCard from '../components/ProductCard';
import './Catalog.css';

const SORT_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'name', label: 'Name A-Z' },
];

export default function Catalog() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const { products, categories } = useShop();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCats, setSelectedCats] = useState(slug ? [slug] : []);
  const [priceRange, setPriceRange] = useState([0, 15000]);
  const [sort, setSort] = useState('default');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);

  useEffect(() => {
    if (slug) setSelectedCats([slug]);
    else setSelectedCats([]);
  }, [slug]);

  const currentCategory = slug ? categories.find(c => c.slug === slug) : null;

  const filtered = useMemo(() => {
    let res = products.filter(p => p.status === 'published');
    if (search) res = res.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    if (selectedCats.length) res = res.filter(p => selectedCats.includes(p.category_slug));
    res = res.filter(p => {
      const price = p.sale_price || p.price;
      return price >= priceRange[0] && price <= priceRange[1];
    });
    if (inStockOnly) res = res.filter(p => p.stock_quantity > 0);
    switch (sort) {
      case 'price-asc': return [...res].sort((a, b) => (a.sale_price||a.price) - (b.sale_price||b.price));
      case 'price-desc': return [...res].sort((a, b) => (b.sale_price||b.price) - (a.sale_price||a.price));
      case 'rating': return [...res].sort((a, b) => (b.rating||0) - (a.rating||0));
      case 'name': return [...res].sort((a, b) => a.name.localeCompare(b.name));
      default: return res;
    }
  }, [products, search, selectedCats, priceRange, sort, inStockOnly]);

  const toggleCat = (catSlug) => {
    setSelectedCats(prev =>
      prev.includes(catSlug) ? prev.filter(c => c !== catSlug) : [...prev, catSlug]
    );
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCats(slug ? [slug] : []);
    setPriceRange([0, 15000]);
    setInStockOnly(false);
    setSort('default');
  };

  return (
    <div style={{ paddingTop: 'var(--space-8)' }}>
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          {currentCategory ? (
            <><Link to="/products">Products</Link><span>/</span><span className="breadcrumb-active">{currentCategory.name}</span></>
          ) : (
            <span className="breadcrumb-active">All Products</span>
          )}
        </div>

        {/* Page Header */}
        <div className="catalog-page-header">
          <div>
            <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 900, marginBottom: 'var(--space-2)' }}>
              {currentCategory ? currentCategory.name : 'All Products'}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
              {filtered.length} product{filtered.length !== 1 ? 's' : ''} found
            </p>
          </div>
          <div className="catalog-controls">
            <div className="sort-wrapper">
              <select
                className="form-select"
                value={sort}
                onChange={e => setSort(e.target.value)}
                style={{ minWidth: 180 }}
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <ChevronDown size={16} className="sort-icon" />
            </div>
            <button className="btn btn-ghost filter-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <SlidersHorizontal size={16} /> Filters
            </button>
          </div>
        </div>

        <div className="catalog-layout">
          {/* Sidebar */}
          <aside className={`catalog-sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
            <div className="sidebar-header">
              <span className="font-bold">Filters</span>
              <button className="btn btn-sm btn-ghost" onClick={clearFilters}>Clear All</button>
            </div>

            {/* Search */}
            <div className="filter-section">
              <h4 className="filter-title">Search</h4>
              <div className="search-wrap">
                <Search size={15} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                />
                {search && (
                  <button className="search-clear" onClick={() => setSearch('')}><X size={14} /></button>
                )}
              </div>
            </div>

            {/* Categories */}
            <div className="filter-section">
              <h4 className="filter-title">Categories</h4>
              <div className="filter-options">
                {categories.map(cat => (
                  <label key={cat.id} className="filter-option">
                    <input
                      type="checkbox"
                      checked={selectedCats.includes(cat.slug)}
                      onChange={() => toggleCat(cat.slug)}
                      className="filter-checkbox"
                    />
                    <span>{cat.icon} {cat.name}</span>
                    <span className="filter-count">
                      {products.filter(p => p.category_slug === cat.slug && p.status === 'published').length}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="filter-section">
              <h4 className="filter-title">Price Range</h4>
              <div style={{ padding: 'var(--space-2) 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-3)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                  <span>Rs. {priceRange[0].toLocaleString()}</span>
                  <span>Rs. {priceRange[1].toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={15000}
                  step={100}
                  value={priceRange[1]}
                  onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])}
                  className="price-slider"
                />
              </div>
            </div>

            {/* Stock */}
            <div className="filter-section">
              <h4 className="filter-title">Availability</h4>
              <label className="filter-option">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={e => setInStockOnly(e.target.checked)}
                  className="filter-checkbox"
                />
                <span>In Stock Only</span>
              </label>
            </div>
          </aside>

          {/* Products Grid */}
          <div>
            {filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon"><Search size={32} /></div>
                <h3>No products found</h3>
                <p>Try adjusting your filters or search query</p>
                <button className="btn btn-primary" style={{ marginTop: 'var(--space-4)' }} onClick={clearFilters}>Clear Filters</button>
              </div>
            ) : (
              <div className="products-grid">
                {filtered.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
