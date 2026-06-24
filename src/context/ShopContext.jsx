import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { PRODUCTS, CATEGORIES, STORE_SETTINGS, DISCOUNT_CODES, SAMPLE_REVIEWS } from '../utils/mockData';

const ShopContext = createContext(null);

export const useShop = () => {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error('useShop must be used within ShopProvider');
  return ctx;
};

export const ShopProvider = ({ children }) => {
  // ─── State ───────────────────────────────────────────────
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [settings, setSettings] = useState(STORE_SETTINGS);
  const [reviews, setReviews] = useState(SAMPLE_REVIEWS);
  const [dataLoading, setDataLoading] = useState(true);

  // Cart stored in localStorage for performance
  const [cartItems, setCartItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('jutt_cart') || '[]'); }
    catch { return []; }
  });
  const [cartOpen, setCartOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const [toasts, setToasts] = useState([]);

  // ─── Helpers ──────────────────────────────────────────────
  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  // ─── Auth Listeners ───────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (data) setProfile(data);
  };

  // ─── Data Loading ─────────────────────────────────────────
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setDataLoading(true);
    try {
      const [prodRes, catRes, settingsRes, reviewsRes] = await Promise.all([
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('name'),
        supabase.from('settings').select('*').single(),
        supabase.from('reviews').select('*').order('created_at', { ascending: false }),
      ]);

      // Fallback to mock data if Supabase not connected
      setProducts(prodRes.data?.length ? prodRes.data : PRODUCTS);
      setCategories(catRes.data?.length ? catRes.data : CATEGORIES);
      if (settingsRes.data) setSettings({ ...STORE_SETTINGS, ...settingsRes.data });
      setReviews(reviewsRes.data?.length ? reviewsRes.data : SAMPLE_REVIEWS);
    } catch {
      // Use mock data as fallback
      setProducts(PRODUCTS);
      setCategories(CATEGORIES);
    } finally {
      setDataLoading(false);
    }
  };

  // ─── Auth API ─────────────────────────────────────────────
  const signUp = async (email, password, fullName, phone) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, phone } },
    });
    if (error) throw error;

    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        email,
        full_name: fullName,
        phone,
        role: 'customer',
      });
    }
    return data;
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  const updateProfile = async (updates) => {
    if (!user) throw new Error('Not authenticated');
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);
    if (error) throw error;
    setProfile(prev => ({ ...prev, ...updates }));
    addToast('Profile updated successfully!', 'success');
  };

  const isAdmin = profile?.role === 'admin';

  // ─── Cart API ─────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem('jutt_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = useCallback((product, quantity = 1) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i => i.id === product.id
          ? { ...i, quantity: Math.min(i.quantity + quantity, product.stock_quantity || 99) }
          : i
        );
      }
      return [...prev, { ...product, quantity }];
    });
    setCartOpen(true);
    addToast(`${product.name} added to cart!`, 'success');
  }, [addToast]);

  const removeFromCart = useCallback((productId) => {
    setCartItems(prev => prev.filter(i => i.id !== productId));
  }, []);

  const updateCartQty = useCallback((productId, quantity) => {
    if (quantity < 1) { removeFromCart(productId); return; }
    setCartItems(prev => prev.map(i => i.id === productId ? { ...i, quantity } : i));
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCartItems([]);
    setAppliedCoupon(null);
  }, []);

  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);

  const cartSubtotal = cartItems.reduce((s, i) => {
    const price = i.sale_price || i.price;
    return s + price * i.quantity;
  }, 0);

  const shippingFee = settings.free_shipping_enabled && cartSubtotal >= settings.free_shipping_threshold
    ? 0
    : settings.shipping_flat_rate;

  const couponDiscount = appliedCoupon
    ? appliedCoupon.type === 'percentage'
      ? Math.round(cartSubtotal * appliedCoupon.value / 100)
      : appliedCoupon.value
    : 0;

  const cartTotal = cartSubtotal + shippingFee - couponDiscount;

  const applyCoupon = (code) => {
    const discount = DISCOUNT_CODES.find(
      d => d.code === code.toUpperCase() && d.active && cartSubtotal >= d.min_order
    );
    if (!discount) throw new Error('Invalid coupon or minimum order not met.');
    setAppliedCoupon(discount);
    addToast(`Coupon applied! You saved Rs. ${discount.type === 'percentage' ? Math.round(cartSubtotal * discount.value / 100) : discount.value}`, 'success');
  };

  // ─── Orders API ───────────────────────────────────────────
  const placeOrder = async (orderDetails) => {
    const orderNumber = `JM-${Date.now().toString().slice(-6)}`;
    const orderPayload = {
      order_number: orderNumber,
      customer_name: orderDetails.fullName,
      customer_email: orderDetails.email,
      customer_phone: orderDetails.phone,
      shipping_address: `${orderDetails.address}, ${orderDetails.city}, ${orderDetails.province}`,
      city: orderDetails.city,
      province: orderDetails.province,
      payment_method: orderDetails.paymentMethod,
      notes: orderDetails.notes,
      subtotal: cartSubtotal,
      shipping_fee: shippingFee,
      discount: couponDiscount,
      total: cartTotal,
      status: 'pending',
      items: cartItems,
      user_id: user?.id || null,
    };

    try {
      const { data, error } = await supabase.from('orders').insert([orderPayload]).select().single();
      if (error) throw error;

      // Decrement stock
      for (const item of cartItems) {
        await supabase.rpc('decrement_stock', { product_id: item.id, qty: item.quantity });
      }

      clearCart();
      addToast(`Order #${orderNumber} placed successfully!`, 'success');
      return data || { ...orderPayload, id: Date.now() };
    } catch {
      // Fallback: local order tracking
      const localOrder = { ...orderPayload, id: Date.now() };
      const localOrders = JSON.parse(localStorage.getItem('jutt_orders') || '[]');
      localOrders.push(localOrder);
      localStorage.setItem('jutt_orders', JSON.stringify(localOrders));
      clearCart();
      addToast(`Order #${orderNumber} placed successfully!`, 'success');
      return localOrder;
    }
  };

  const fetchUserOrders = async () => {
    try {
      if (!user) {
        const local = JSON.parse(localStorage.getItem('jutt_orders') || '[]');
        return local.filter(o => o.customer_email === profile?.email);
      }
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch {
      const local = JSON.parse(localStorage.getItem('jutt_orders') || '[]');
      return local.filter(o => o.customer_email === profile?.email || o.user_id === user?.id);
    }
  };

  const fetchAllOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch {
      return JSON.parse(localStorage.getItem('jutt_orders') || '[]');
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
      if (error) throw error;
      addToast(`Order status updated to ${status}`, 'success');
    } catch {
      const localOrders = JSON.parse(localStorage.getItem('jutt_orders') || '[]');
      const updated = localOrders.map(o => o.id.toString() === orderId.toString() ? { ...o, status } : o);
      localStorage.setItem('jutt_orders', JSON.stringify(updated));
      addToast(`Order status updated to ${status} (Local)`, 'success');
    }
  };

  // ─── Products Admin API ───────────────────────────────────
  const addProduct = async (productData) => {
    const slug = productData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const payload = { ...productData, slug, created_at: new Date().toISOString() };
    try {
      const { data, error } = await supabase.from('products').insert([payload]).select().single();
      if (error) throw error;
      setProducts(prev => [data, ...prev]);
      addToast('Product added successfully!', 'success');
      return data;
    } catch {
      const newProd = { ...payload, id: `local-${Date.now()}`, rating: 5.0, review_count: 0 };
      setProducts(prev => [newProd, ...prev]);
      addToast('Product added successfully! (Local)', 'success');
      return newProd;
    }
  };

  const updateProduct = async (productId, updates) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', productId)
        .select()
        .single();
      if (error) throw error;
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, ...data } : p));
      addToast('Product updated successfully!', 'success');
      return data;
    } catch {
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, ...updates } : p));
      addToast('Product updated successfully! (Local)', 'success');
      return { id: productId, ...updates };
    }
  };

  const deleteProduct = async (productId) => {
    try {
      const { error } = await supabase.from('products').delete().eq('id', productId);
      if (error) throw error;
      setProducts(prev => prev.filter(p => p.id !== productId));
      addToast('Product deleted.', 'info');
    } catch {
      setProducts(prev => prev.filter(p => p.id !== productId));
      addToast('Product deleted. (Local)', 'info');
    }
  };

  // ─── Categories Admin API ─────────────────────────────────
  const addCategory = async (catData) => {
    try {
      const { data, error } = await supabase.from('categories').insert([catData]).select().single();
      if (error) throw error;
      setCategories(prev => [...prev, data]);
      addToast('Category added!', 'success');
      return data;
    } catch {
      const newCat = { ...catData, id: `cat-local-${Date.now()}` };
      setCategories(prev => [...prev, newCat]);
      addToast('Category added! (Local)', 'success');
      return newCat;
    }
  };

  const updateCategory = async (catId, updates) => {
    try {
      const { data, error } = await supabase.from('categories').update(updates).eq('id', catId).select().single();
      if (error) throw error;
      setCategories(prev => prev.map(c => c.id === catId ? { ...c, ...data } : c));
      addToast('Category updated!', 'success');
    } catch {
      setCategories(prev => prev.map(c => c.id === catId ? { ...c, ...updates } : c));
      addToast('Category updated! (Local)', 'success');
    }
  };

  const deleteCategory = async (catId) => {
    try {
      const { error } = await supabase.from('categories').delete().eq('id', catId);
      if (error) throw error;
      setCategories(prev => prev.filter(c => c.id !== catId));
      addToast('Category deleted.', 'info');
    } catch {
      setCategories(prev => prev.filter(c => c.id !== catId));
      addToast('Category deleted. (Local)', 'info');
    }
  };

  // ─── Settings Admin API ───────────────────────────────────
  const updateSettings = async (newSettings) => {
    try {
      const { error } = await supabase.from('settings').upsert({ id: 1, ...newSettings });
      if (error) throw error;
      setSettings(prev => ({ ...prev, ...newSettings }));
      addToast('Settings saved!', 'success');
    } catch {
      setSettings(prev => ({ ...prev, ...newSettings }));
      addToast('Settings saved! (Local)', 'success');
    }
  };

  // ─── Reviews API ──────────────────────────────────────────
  const addReview = async (productId, reviewData) => {
    const review = {
      product_id: productId,
      author: reviewData.author,
      rating: reviewData.rating,
      comment: reviewData.comment,
      created_at: new Date().toISOString().split('T')[0],
    };
    try {
      const { data, error } = await supabase.from('reviews').insert([review]).select().single();
      if (error) throw error;
      setReviews(prev => [data, ...prev]);
      addToast('Review submitted! Thank you!', 'success');
    } catch {
      const newReview = { ...review, id: `r${Date.now()}` };
      setReviews(prev => [newReview, ...prev]);
      addToast('Review submitted! Thank you! (Local)', 'success');
    }
  };

  const getProductReviews = (productId) => reviews.filter(r => r.product_id === productId);

  // ─── Customers Admin API ─────────────────────────────────
  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch {
      // Return a set of mock customers based on orders for local testing
      const ordersLocal = JSON.parse(localStorage.getItem('jutt_orders') || '[]');
      const uniqueCustomers = [];
      const emails = new Set();
      for (const o of ordersLocal) {
        if (!emails.has(o.customer_email)) {
          emails.add(o.customer_email);
          uniqueCustomers.push({
            id: o.user_id || `cust-${Date.now()}-${uniqueCustomers.length}`,
            email: o.customer_email,
            full_name: o.customer_name,
            phone: o.customer_phone,
            role: 'customer',
            created_at: o.created_at || new Date().toISOString()
          });
        }
      }
      return uniqueCustomers;
    }
  };

  // ─── Provide ──────────────────────────────────────────────
  return (
    <ShopContext.Provider value={{
      // Auth
      user, profile, authLoading, isAdmin,
      signUp, signIn, signOut, updateProfile,

      // Data
      products, categories, settings, reviews,
      dataLoading, loadData,

      // Cart
      cartItems, cartOpen, setCartOpen,
      addToCart, removeFromCart, updateCartQty, clearCart,
      cartCount, cartSubtotal, shippingFee, cartTotal,
      appliedCoupon, applyCoupon, couponDiscount,

      // Orders
      placeOrder, fetchUserOrders, fetchAllOrders, updateOrderStatus,

      // Products Admin
      addProduct, updateProduct, deleteProduct,

      // Categories Admin
      addCategory, updateCategory, deleteCategory,

      // Settings Admin
      updateSettings,

      // Reviews
      addReview, getProductReviews,

      // Customers
      fetchCustomers,

      // Toasts
      toasts, addToast,
    }}>
      {children}
    </ShopContext.Provider>
  );
};
