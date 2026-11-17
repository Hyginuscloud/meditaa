import React, { useEffect, useMemo, useState } from 'react';
import {
  Check,
  Search,
  ChevronDown,
  Pill,
  Sparkles,
  Baby,
  ShoppingBasket,
  SprayCan,
  ShieldCheck,
  Plus,
  MessageCircle,
  MapPin,
  Clock,
  ArrowUpRight,
  HeartHandshake,
  Store,
  Truck,
  Stethoscope,
  Phone,
  Mail,
  Maximize2,
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ProductBottleArt } from './components/ProductBottleArt';
import { CartDrawer, CartItem, formatNaira } from './components/CartDrawer';
import { AdminDashboard, AuthSessionInfo } from './components/AdminDashboard';
import { ImageLightbox, LightboxImage } from './components/ImageLightbox';
import { CategoryId, CATEGORIES } from './data/products';
import { DEFAULT_SITE_CONFIG, EditableProduct, formatSocialUrl, SiteConfig } from './data/siteConfig';

const TOKEN_STORAGE_KEY = 'meditrust_admin_token';

function readStoredToken(): string | null {
  try {
    return window.localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    try {
      return window.sessionStorage.getItem(TOKEN_STORAGE_KEY);
    } catch {
      return null;
    }
  }
}

function writeStoredToken(token: string | null): void {
  try {
    if (token) {
      window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    // Ignore storage restriction in sandboxed iframes
  }
  try {
    if (token) {
      window.sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      window.sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    // Ignore storage restriction
  }
}

function isAdminLocation(): boolean {
  if (typeof window === 'undefined') return false;
  const hash = window.location.hash.trim().toLowerCase();
  const pathname = window.location.pathname.trim().toLowerCase().replace(/\/+$/, '');
  return (
    hash === '#admin' ||
    hash === '#/admin' ||
    hash.startsWith('#admin/') ||
    pathname === '/admin'
  );
}

function CategoryIcon({
  iconType,
  className,
}: {
  iconType: (typeof CATEGORIES)[number]['iconType'];
  className?: string;
}) {
  switch (iconType) {
    case 'pill':
      return <Pill className={className} />;
    case 'lotion':
      return <Sparkles className={className} />;
    case 'baby':
      return <Baby className={className} />;
    case 'bread':
      return <ShoppingBasket className={className} />;
    case 'spray':
      return <SprayCan className={className} />;
    case 'shield':
      return <ShieldCheck className={className} />;
  }
}

export default function App() {
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(DEFAULT_SITE_CONFIG);
  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(() => isAdminLocation());
  const [adminSession, setAdminSession] = useState<AuthSessionInfo | null>(null);
  const [sessionExpiredNotice, setSessionExpiredNotice] = useState<string>('');

  const [selectedCategory, setSelectedCategory] = useState<'All' | CategoryId>('All');
  const [searchInput, setSearchInput] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [toastText, setToastText] = useState<string | null>(null);
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);
  const [enquiryName, setEnquiryName] = useState('');
  const [enquiryEmail, setEnquiryEmail] = useState('');
  const [enquiryPhone, setEnquiryPhone] = useState('');
  const [enquiryLocation, setEnquiryLocation] = useState('');
  const [enquiryMessage, setEnquiryMessage] = useState('');
  const [lightboxImage, setLightboxImage] = useState<LightboxImage | null>(null);

  // Watch hash and history changes for /#Admin or /admin
  useEffect(() => {
    const syncRoute = () => {
      const nextIsAdmin = isAdminLocation();
      setIsAdminRoute(nextIsAdmin);
      if (nextIsAdmin) {
        window.scrollTo({ top: 0, behavior: 'auto' });
      }
    };
    window.addEventListener('hashchange', syncRoute);
    window.addEventListener('popstate', syncRoute);
    return () => {
      window.removeEventListener('hashchange', syncRoute);
      window.removeEventListener('popstate', syncRoute);
    };
  }, []);

  // Load persisted site configuration and verify saved session
  useEffect(() => {
    let active = true;
    fetch('/api/site')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data?.config) {
          setSiteConfig(data.config as SiteConfig);
        }
      })
      .catch(() => {
        // Fallback to default config if offline
      });

    const savedToken = readStoredToken();
    if (savedToken) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${savedToken}` },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (active && data?.role) {
            setAdminSession({
              token: savedToken,
              role: data.role,
              name: data.name,
              managerEnabled: Boolean(data.managerEnabled),
              managerName: data.managerName || 'Store Manager',
            });
          } else if (active) {
            writeStoredToken(null);
          }
        })
        .catch(() => {
          // Ignore network error
        });
    }

    return () => {
      active = false;
    };
  }, []);

  const handleAdminLoginSuccess = (session: AuthSessionInfo) => {
    setSessionExpiredNotice('');
    writeStoredToken(session.token);
    setAdminSession(session);
  };

  const handleAdminLogout = async () => {
    if (adminSession) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${adminSession.token}` },
        });
      } catch {
        // Ignore error
      }
    }
    writeStoredToken(null);
    setAdminSession(null);
  };

  const handleSaveSiteConfig = async (nextConfig: SiteConfig): Promise<boolean> => {
    if (!adminSession) return false;
    try {
      const res = await fetch('/api/site', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminSession.token}`,
        },
        body: JSON.stringify({ config: nextConfig }),
      });
      if (res.status === 401) {
        writeStoredToken(null);
        setAdminSession(null);
        setSessionExpiredNotice('Your session expired. Please sign in again to save changes.');
        return false;
      }
      if (!res.ok) return false;
      const data = await res.json();
      setSiteConfig(data.config as SiteConfig);
      return true;
    } catch {
      return false;
    }
  };

  const handleResetDefaults = async (): Promise<boolean> => {
    if (!adminSession) return false;
    try {
      const res = await fetch('/api/site/reset', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminSession.token}` },
      });
      if (res.status === 401) {
        writeStoredToken(null);
        setAdminSession(null);
        setSessionExpiredNotice('Your session expired. Please sign in again.');
        return false;
      }
      if (!res.ok) return false;
      const data = await res.json();
      setSiteConfig(data.config as SiteConfig);
      return true;
    } catch {
      return false;
    }
  };

  const handleBackToSite = () => {
    if (window.location.pathname.toLowerCase().replace(/\/+$/, '') === '/admin') {
      window.history.replaceState(null, '', '/#home');
    } else {
      window.location.hash = '#home';
    }
    setIsAdminRoute(false);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const filteredProducts = useMemo(() => {
    const query = (searchInput || appliedSearch).trim().toLowerCase();
    return siteConfig.products.filter((product) => {
      const matchesCat =
        selectedCategory === 'All' || product.category === selectedCategory;
      const matchesQuery =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query);
      return matchesCat && matchesQuery;
    });
  }, [siteConfig.products, selectedCategory, searchInput, appliedSearch]);

  const galleryMedia = useMemo(
    () => siteConfig.mediaGallery.filter((item) => item.placement === 'gallery'),
    [siteConfig.mediaGallery]
  );

  const showToast = (msg: string) => {
    setToastText(msg);
    window.setTimeout(() => {
      setToastText((prev) => (prev === msg ? null : prev));
    }, 2200);
  };

  const addToCart = (product: EditableProduct, openDrawer = false) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });

    if (openDrawer) {
      setCartOpen(true);
    } else {
      showToast(`Added ${product.name} to cart`);
    }
  };

  const updateCartQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeCartItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleCategorySelect = (category: CategoryId) => {
    setSelectedCategory(category);
    const el = document.getElementById('products');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSearchInput('');
    setAppliedSearch('');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedSearch(searchInput);
  };

  const contactMessageText = useMemo(() => {
    const lines = [
      `Hello ${siteConfig.brand.name} (Owerri),`,
      enquiryName.trim() ? `Name: ${enquiryName.trim()}` : '',
      enquiryEmail.trim() ? `Email: ${enquiryEmail.trim()}` : '',
      enquiryPhone.trim() ? `Phone: ${enquiryPhone.trim()}` : '',
      enquiryLocation.trim() ? `Location: ${enquiryLocation.trim()}` : '',
      enquiryMessage.trim()
        ? `Message: ${enquiryMessage.trim()}`
        : 'Message: I would like to make an enquiry about product availability and delivery.',
    ].filter(Boolean);
    return lines.join('\n');
  }, [
    enquiryName,
    enquiryEmail,
    enquiryPhone,
    enquiryLocation,
    enquiryMessage,
    siteConfig.brand.name,
  ]);

  const contactWhatsappUrl = useMemo(() => {
    return `https://wa.me/${siteConfig.topBar.whatsappNumber}?text=${encodeURIComponent(
      contactMessageText
    )}`;
  }, [contactMessageText, siteConfig.topBar.whatsappNumber]);

  const contactMailtoUrl = useMemo(() => {
    const subject = `Store Enquiry — ${enquiryName.trim() || siteConfig.brand.name}`;
    return `mailto:${siteConfig.topBar.email}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(contactMessageText)}`;
  }, [contactMessageText, enquiryName, siteConfig.brand.name, siteConfig.topBar.email]);

  if (isAdminRoute) {
    return (
      <AdminDashboard
        config={siteConfig}
        session={adminSession}
        initialNotice={sessionExpiredNotice}
        onLoginSuccess={handleAdminLoginSuccess}
        onLogout={handleAdminLogout}
        onSaveConfig={handleSaveSiteConfig}
        onResetDefaults={handleResetDefaults}
        onBackToSite={handleBackToSite}
        onSessionUpdate={(partial) =>
          setAdminSession((prev) => (prev ? { ...prev, ...partial } : prev))
        }
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      <Navbar
        cartCount={cartCount}
        onOpenCart={() => setCartOpen(true)}
        config={siteConfig}
      />

      <main className="flex-1">
        {/* Hero Section */}
        <Hero
          onOpenCart={() => setCartOpen(true)}
          config={siteConfig}
          onImageClick={(url, title, caption) => setLightboxImage({ url, title, caption })}
        />

        {/* Trust Strip directly below Hero */}
        <div className="bg-white border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-center gap-x-10 gap-y-2 text-xs sm:text-sm font-semibold text-[#0A1D3D]">
            {siteConfig.hero.trustPoints.map((point) => (
              <span key={point} className="inline-flex items-center gap-1.5">
                <span>{point}</span>
                <Check className="w-4 h-4 text-emerald-600" />
              </span>
            ))}
          </div>
        </div>

        {/* Shop By Category Section */}
        <section id="categories" className="bg-[#F4F7FA] py-14 sm:py-16 border-b border-slate-200/70">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <p className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#DC2626]">
                {siteConfig.categoriesSection.eyebrow}
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0A1D3D] tracking-tight mt-1.5">
                {siteConfig.categoriesSection.heading}
              </h2>
              <p className="text-sm text-slate-600 mt-2">
                {siteConfig.categoriesSection.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {siteConfig.categories.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategorySelect(cat.id)}
                    className={`group text-left bg-white rounded-xl p-4 sm:p-5 border transition-all duration-150 flex items-center gap-4 cursor-pointer shadow-xs hover:shadow-md hover:-translate-y-0.5 ${
                      isSelected
                        ? 'border-[#DC2626] ring-2 ring-[#DC2626]/15'
                        : 'border-slate-200/80 hover:border-slate-300'
                    }`}
                  >
                    <div
                      className={`w-11 h-11 rounded-lg ${cat.accentBg} ${cat.accentColor} flex items-center justify-center shrink-0`}
                    >
                      <CategoryIcon iconType={cat.iconType} className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-display font-bold text-sm sm:text-base text-[#0A1D3D] group-hover:text-[#DC2626] transition-colors">
                        {cat.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">{cat.subtitle}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* The Store Menu / Products Section */}
        <section id="products" className="bg-[#F4F7FA] py-14 sm:py-16 border-b border-slate-200/70">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <p className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#DC2626]">
                {siteConfig.productsSection.eyebrow}
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0A1D3D] tracking-tight mt-1.5">
                {siteConfig.productsSection.heading}
              </h2>
              <p className="text-sm text-slate-600 mt-2">
                {siteConfig.productsSection.subtitle}
              </p>
            </div>

            {/* Search & Filter Toolbar */}
            <form
              onSubmit={handleSearchSubmit}
              className="bg-white border border-slate-200 rounded-xl p-2 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-6"
            >
              <div className="relative flex-1 flex items-center">
                <Search className="w-4 h-4 text-slate-400 ml-3 shrink-0" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search products, e.g. paracetamol, soap, diapers, honey..."
                  aria-label="Search products"
                  className="w-full px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="bg-[#0A1D3D] hover:bg-[#122D5C] text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-lg shadow-xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0"
                >
                  Search
                </button>

                <div className="relative flex-1 sm:flex-initial shrink-0">
                  <select
                    aria-label="Filter by category"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value as 'All' | CategoryId)}
                    className="w-full appearance-none bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 text-xs sm:text-sm font-medium pl-3.5 pr-8 py-2.5 rounded-lg focus:outline-none cursor-pointer"
                  >
                    <option value="All">Featured products</option>
                    {siteConfig.categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-500 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </form>

            {/* Count & Show All Products Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <p className="text-xs sm:text-sm font-semibold text-[#0A1D3D] tabular-nums">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} ·{' '}
                {selectedCategory === 'All' ? 'All categories' : selectedCategory}
              </p>

              <button
                type="button"
                onClick={handleResetFilters}
                className="bg-white hover:bg-slate-50 text-[#0A1D3D] border border-slate-200 text-xs font-semibold px-4 py-2 rounded-lg shadow-2xs hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 cursor-pointer whitespace-nowrap"
              >
                Show All Products
              </button>
            </div>

            {/* Responsive Product Grid */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
                <p className="font-bold text-[#0A1D3D] text-base">
                  No matching products found
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  Try clearing your search or selecting another category.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-4 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-semibold px-5 py-2.5 rounded-lg shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                >
                  Show All {siteConfig.products.length} Products
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                {filteredProducts.map((product) => (
                  <article
                    key={product.id}
                    className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col"
                  >
                    <ProductBottleArt
                      product={product}
                      onImageClick={(prod) => setLightboxImage({ kind: 'product', product: prod })}
                    />

                    <div className="pt-3.5 flex-1 flex flex-col">
                      <span className="text-[10px] font-bold tracking-wider uppercase text-[#DC2626]">
                        {product.category}
                      </span>

                      <h3 className="font-display font-bold text-base text-[#0A1D3D] mt-1 leading-snug">
                        {product.name}
                      </h3>

                      <p className="text-xs text-slate-500 mt-1 leading-relaxed flex-1">
                        {product.description}
                      </p>

                      <div className="flex items-baseline justify-between mt-4 pt-2 border-t border-slate-100">
                        <span className="font-display font-extrabold text-lg text-[#0A1D3D] tabular-nums">
                          {formatNaira(product.price)}
                        </span>
                        <span className="text-[11px] font-semibold text-teal-600">
                          {product.unit}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-3">
                        <button
                          type="button"
                          onClick={() => addToCart(product, false)}
                          className="inline-flex items-center justify-center gap-1 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-semibold py-2.5 px-2.5 rounded-lg shadow-xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer whitespace-nowrap"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add to Cart</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => addToCart(product, true)}
                          className="inline-flex items-center justify-center bg-[#0A1D3D] hover:bg-[#122D5C] text-white text-xs font-semibold py-2.5 px-2.5 rounded-lg shadow-xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer whitespace-nowrap"
                        >
                          Buy Now
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {/* Pricing Disclaimer */}
            <p className="text-center text-[11px] text-slate-500 mt-8 max-w-4xl mx-auto">
              {siteConfig.productsSection.disclaimer}
            </p>
          </div>
        </section>

        {/* Storefront Uploaded Media & Videos Showcase (appears directly when media is uploaded) */}
        {galleryMedia.length > 0 && (
          <section id="gallery" className="bg-white py-14 sm:py-16 border-b border-slate-200/70">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-2xl mx-auto mb-10">
                <p className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#DC2626]">
                  {siteConfig.mediaSection.eyebrow}
                </p>
                <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0A1D3D] tracking-tight mt-1.5">
                  {siteConfig.mediaSection.heading}
                </h2>
                <p className="text-sm text-slate-600 mt-2">{siteConfig.mediaSection.subtitle}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {galleryMedia.map((item) => (
                  <figure
                    key={item.id}
                    className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs flex flex-col"
                  >
                    <div className="h-60 bg-slate-900 overflow-hidden">
                      {item.type === 'video' ? (
                        <video
                          src={item.url}
                          controls
                          playsInline
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            setLightboxImage({
                              url: item.url,
                              title: item.title,
                              caption: item.caption,
                            })
                          }
                          aria-label={`View full image: ${item.title || 'Storefront gallery image'}`}
                          className="w-full h-full block cursor-zoom-in group"
                        >
                          <img
                            src={item.url}
                            alt={item.title || 'Storefront gallery image'}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                          />
                        </button>
                      )}
                    </div>
                    {(item.title || item.caption) && (
                      <figcaption className="p-4">
                        {item.title && (
                          <p className="font-display font-bold text-sm text-[#0A1D3D]">
                            {item.title}
                          </p>
                        )}
                        {item.caption && (
                          <p className="text-xs text-slate-600 mt-1">{item.caption}</p>
                        )}
                      </figcaption>
                    )}
                  </figure>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Our Services Section (White Band) */}
        <section id="services" className="bg-white py-16 border-b border-slate-200/70">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <p className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#DC2626]">
                {siteConfig.servicesSection.eyebrow}
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0A1D3D] tracking-tight mt-1.5">
                {siteConfig.servicesSection.heading}
              </h2>
              <p className="text-sm text-slate-600 mt-2">
                {siteConfig.servicesSection.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {siteConfig.servicesSection.items.map((service, index) => {
                const icons = [Stethoscope, HeartHandshake, Store, Truck];
                const IconComp = icons[index % icons.length];
                return (
                  <div
                    key={service.id}
                    className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-6 flex flex-col"
                  >
                    <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#DC2626] flex items-center justify-center mb-4">
                      <IconComp className="w-5 h-5" />
                    </div>
                    <h3 className="font-display font-bold text-base text-[#0A1D3D]">
                      {service.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Our Story Section (Deep Navy Band) */}
        <section id="story" className="bg-[#0A1D3D] text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              <div className="lg:col-span-7 space-y-5">
                <div className="space-y-4">
                  <p className="text-[11px] font-bold tracking-[0.18em] uppercase text-amber-400">
                    {siteConfig.storySection.eyebrow}
                  </p>
                  <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-balance">
                    {siteConfig.storySection.heading}
                  </h2>
                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                    {siteConfig.storySection.body}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
                  {siteConfig.storySection.pillars.map((pillar) => (
                    <div
                      key={pillar.id}
                      className="bg-white/5 border border-white/10 rounded-xl p-4"
                    >
                      <p className="font-display font-bold text-sm text-amber-300">
                        {pillar.title}
                      </p>
                      <p className="text-xs text-slate-300 mt-1">{pillar.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Side: CEO Portrait Photo & Title Underneath */}
              <div className="lg:col-span-5 flex justify-center lg:justify-end">
                <figure className="w-full max-w-sm bg-white/5 border border-white/15 rounded-2xl p-3.5 shadow-2xl">
                  {siteConfig.storySection.ceoImageUrl ? (
                    <button
                      type="button"
                      onClick={() =>
                        setLightboxImage({
                          url: siteConfig.storySection.ceoImageUrl,
                          title: siteConfig.storySection.ceoName || 'Chief Executive Officer',
                          caption: siteConfig.storySection.ceoTitle,
                        })
                      }
                      aria-label={`View full photo: ${siteConfig.storySection.ceoName || 'CEO Photo'}`}
                      className="relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-slate-900 block cursor-zoom-in group focus:outline-none focus:ring-2 focus:ring-amber-400"
                    >
                      <img
                        src={siteConfig.storySection.ceoImageUrl}
                        alt={siteConfig.storySection.ceoName || 'Chief Executive Officer'}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                      />
                      <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 bg-[#071630]/80 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border border-white/15 opacity-90 group-hover:opacity-100 transition-opacity">
                        <Maximize2 className="w-3.5 h-3.5 text-amber-300" />
                        <span>View Full</span>
                      </span>
                    </button>
                  ) : (
                    <div className="w-full aspect-[3/4] rounded-xl bg-white/5 border border-dashed border-white/20 flex flex-col items-center justify-center text-center p-6">
                      <span className="w-16 h-16 rounded-full bg-amber-400/15 text-amber-300 flex items-center justify-center font-display font-extrabold text-xl mb-3">
                        CEO
                      </span>
                      <p className="text-xs text-slate-300">
                        Upload CEO portrait in the Admin Dashboard
                      </p>
                    </div>
                  )}

                  {(siteConfig.storySection.ceoName || siteConfig.storySection.ceoTitle) && (
                    <figcaption className="pt-3.5 pb-1 px-1 text-center">
                      {siteConfig.storySection.ceoName && (
                        <p className="font-display font-bold text-base sm:text-lg text-amber-300 leading-snug">
                          {siteConfig.storySection.ceoName}
                        </p>
                      )}
                      {siteConfig.storySection.ceoTitle && (
                        <p className="text-xs sm:text-sm text-slate-300 mt-0.5 leading-snug">
                          {siteConfig.storySection.ceoTitle}
                        </p>
                      )}
                    </figcaption>
                  )}
                </figure>
              </div>
            </div>
          </div>
        </section>

        {/* Reviews / Service Commitments Section (Light Slate Band) */}
        <section id="reviews" className="bg-[#F4F7FA] py-16 border-b border-slate-200/70">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <p className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#DC2626]">
                {siteConfig.reviewsSection.eyebrow}
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0A1D3D] tracking-tight mt-1.5">
                {siteConfig.reviewsSection.heading}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {siteConfig.reviewsSection.items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs"
                >
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                    {item.label}
                  </span>
                  <h3 className="font-display font-bold text-base text-[#0A1D3D] mt-1.5">
                    {item.headline}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>

            <p className="text-center text-xs text-slate-500 mt-8 max-w-3xl mx-auto">
              {siteConfig.reviewsSection.disclaimer}
            </p>
          </div>
        </section>

        {/* FAQ Section (White Band) */}
        <section id="faq" className="bg-white py-16 border-b border-slate-200/70">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <p className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#DC2626]">
                {siteConfig.faqSection.eyebrow}
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0A1D3D] tracking-tight mt-1.5">
                {siteConfig.faqSection.heading}
              </h2>
            </div>

            <div className="divide-y divide-slate-200 border border-slate-200 rounded-2xl overflow-hidden">
              {siteConfig.faqSection.items.map((faq, idx) => {
                const isOpen = openFaqIdx === idx;
                return (
                  <div key={faq.id} className="bg-white">
                    <button
                      type="button"
                      onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                      aria-expanded={isOpen}
                      className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <span className="font-display font-bold text-sm sm:text-base text-[#0A1D3D]">
                        {faq.q}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-500 shrink-0 transition-transform duration-150 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Contact Section (Light Slate Band) */}
        <section id="contact" className="bg-[#F4F7FA] py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-5 space-y-5">
                <div>
                  <p className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#DC2626]">
                    {siteConfig.contactSection.eyebrow}
                  </p>
                  <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0A1D3D] tracking-tight mt-1.5">
                    {siteConfig.contactSection.heading}
                  </h2>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                    {siteConfig.contactSection.subtitle}
                  </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-[#DC2626] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Store Location
                      </p>
                      <p className="text-sm font-semibold text-[#0A1D3D] mt-0.5">
                        {siteConfig.topBar.address}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Opening Hours
                      </p>
                      <p className="text-sm font-semibold text-[#0A1D3D] mt-0.5">
                        {siteConfig.contactSection.hoursText}
                      </p>
                    </div>
                  </div>

                  {/* Attractive Hoverable Phone CTA */}
                  <a
                    href={`tel:${siteConfig.topBar.phone.replace(/\s+/g, '')}`}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 hover:bg-[#0A1D3D] border border-slate-200 hover:border-[#0A1D3D] group hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-9 h-9 rounded-lg bg-sky-100 text-sky-700 group-hover:bg-white/15 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                        <Phone className="w-4 h-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-slate-300">
                          Call Phone
                        </p>
                        <p className="text-sm font-bold text-[#0A1D3D] group-hover:text-white truncate">
                          {siteConfig.topBar.phone}
                        </p>
                      </div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-amber-300 shrink-0" />
                  </a>

                  {/* Attractive Hoverable Email CTA */}
                  <a
                    href={`mailto:${siteConfig.topBar.email}`}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 hover:bg-[#DC2626] border border-slate-200 hover:border-[#DC2626] group hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-9 h-9 rounded-lg bg-rose-100 text-[#DC2626] group-hover:bg-white/15 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                        <Mail className="w-4 h-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-rose-100">
                          Email Support
                        </p>
                        <p className="text-sm font-bold text-[#0A1D3D] group-hover:text-white truncate">
                          {siteConfig.topBar.email}
                        </p>
                      </div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-white shrink-0" />
                  </a>

                  {/* Attractive Hoverable WhatsApp CTA */}
                  <a
                    href={`https://wa.me/${siteConfig.topBar.whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-3 p-3 rounded-xl bg-emerald-50 hover:bg-[#16A34A] border border-emerald-200 hover:border-[#16A34A] group hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-9 h-9 rounded-lg bg-[#16A34A] text-white group-hover:bg-white/20 flex items-center justify-center shrink-0 transition-colors">
                        <MessageCircle className="w-4 h-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 group-hover:text-emerald-100">
                          WhatsApp Desk
                        </p>
                        <p className="text-sm font-bold text-[#0A1D3D] group-hover:text-white truncate">
                          {siteConfig.topBar.whatsappDisplay}
                        </p>
                      </div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-emerald-700 group-hover:text-white shrink-0" />
                  </a>
                </div>
              </div>

              <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
                <h3 className="font-bold text-lg text-[#0A1D3D]">
                  {siteConfig.contactSection.formTitle}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  {siteConfig.contactSection.formSubtitle}
                </p>

                <div className="mt-5 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="enquiry-name"
                        className="block text-xs font-semibold text-slate-700 mb-1"
                      >
                        Full Name
                      </label>
                      <input
                        id="enquiry-name"
                        type="text"
                        value={enquiryName}
                        onChange={(e) => setEnquiryName(e.target.value)}
                        placeholder="Enter your name"
                        className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A1D3D]/15 focus:border-[#0A1D3D]"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="enquiry-email"
                        className="block text-xs font-semibold text-slate-700 mb-1"
                      >
                        Email Address
                      </label>
                      <input
                        id="enquiry-email"
                        type="email"
                        value={enquiryEmail}
                        onChange={(e) => setEnquiryEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A1D3D]/15 focus:border-[#0A1D3D]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="enquiry-phone"
                        className="block text-xs font-semibold text-slate-700 mb-1"
                      >
                        Phone Number
                      </label>
                      <input
                        id="enquiry-phone"
                        type="tel"
                        value={enquiryPhone}
                        onChange={(e) => setEnquiryPhone(e.target.value)}
                        placeholder="+234 800 000 0000"
                        className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A1D3D]/15 focus:border-[#0A1D3D]"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="enquiry-location"
                        className="block text-xs font-semibold text-slate-700 mb-1"
                      >
                        Location
                      </label>
                      <input
                        id="enquiry-location"
                        type="text"
                        value={enquiryLocation}
                        onChange={(e) => setEnquiryLocation(e.target.value)}
                        placeholder="e.g. Orji Town, Owerri"
                        className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A1D3D]/15 focus:border-[#0A1D3D]"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="enquiry-msg"
                      className="block text-xs font-semibold text-slate-700 mb-1"
                    >
                      Message
                    </label>
                    <textarea
                      id="enquiry-msg"
                      rows={4}
                      value={enquiryMessage}
                      onChange={(e) => setEnquiryMessage(e.target.value)}
                      placeholder="Write your message, items needed, or delivery enquiry..."
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A1D3D]/15 focus:border-[#0A1D3D]"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                    <a
                      href={contactWhatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 bg-[#16A34A] hover:bg-[#15803D] text-white text-sm font-semibold px-6 py-3.5 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Message on WhatsApp</span>
                    </a>

                    <a
                      href={contactMailtoUrl}
                      className="inline-flex items-center justify-center gap-2 bg-[#0A1D3D] hover:bg-[#122D5C] text-white text-sm font-semibold px-6 py-3.5 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                    >
                      <Mail className="w-4 h-4" />
                      <span>Send via Email</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Dark Navy Footer */}
      <footer className="bg-[#071630] text-slate-300 pt-14 pb-24 sm:pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 pb-10 border-b border-white/10">
            {/* Brand Column */}
            <div className="lg:col-span-5 space-y-3.5">
              <div className="flex items-center gap-2.5">
                {siteConfig.brand.logoUrl ? (
                  <img
                    src={siteConfig.brand.logoUrl}
                    alt={siteConfig.brand.name}
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-lg object-cover shrink-0"
                  />
                ) : (
                  <span className="w-8 h-8 rounded-lg bg-[#DC2626] flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="currentColor">
                      <path d="M9.5 4h5v5.5H20v5h-5.5V20h-5v-5.5H4v-5h5.5V4z" />
                    </svg>
                  </span>
                )}
                <div className="flex flex-col leading-none">
                  <span className="font-bold text-white text-base">
                    {siteConfig.brand.name}
                  </span>
                  <span className="text-[9px] font-bold tracking-[0.14em] text-rose-400 uppercase mt-0.5">
                    {siteConfig.brand.tagline}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                {siteConfig.footer.description}
              </p>

              <div className="space-y-1.5 text-xs">
                <p className="font-semibold text-white">
                  WhatsApp:{' '}
                  <a
                    href={`https://wa.me/${siteConfig.topBar.whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-300 hover:text-amber-200 hover:underline transition-colors"
                  >
                    {siteConfig.topBar.whatsappDisplay}
                  </a>
                </p>
                {siteConfig.topBar.phone && (
                  <p className="font-semibold text-white">
                    Phone:{' '}
                    <a
                      href={`tel:${siteConfig.topBar.phone.replace(/\s+/g, '')}`}
                      className="text-emerald-300 hover:text-emerald-200 hover:underline transition-colors"
                    >
                      {siteConfig.topBar.phone}
                    </a>
                  </p>
                )}
                {siteConfig.topBar.email && (
                  <p className="font-semibold text-white">
                    Email:{' '}
                    <a
                      href={`mailto:${siteConfig.topBar.email}`}
                      className="text-sky-300 hover:text-sky-200 hover:underline transition-colors"
                    >
                      {siteConfig.topBar.email}
                    </a>
                  </p>
                )}
              </div>

              {/* Social Media Icons (Facebook, Instagram, TikTok) */}
              <div className="pt-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Follow Us
                </p>
                <div className="flex items-center gap-2.5">
                  <a
                    href={
                      formatSocialUrl('facebook', siteConfig.socials.facebook) ||
                      'https://www.facebook.com'
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    title="Visit our Facebook page"
                    className="w-9 h-9 rounded-lg bg-white/10 hover:bg-[#1877F2] text-white flex items-center justify-center hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                      <path d="M13.5 22v-8h2.7l.4-3h-3.1V9.1c0-.9.3-1.5 1.6-1.5h1.6V4.9c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4.1V11H7.6v3h2.7v8h3.2z" />
                    </svg>
                  </a>

                  <a
                    href={
                      formatSocialUrl('instagram', siteConfig.socials.instagram) ||
                      'https://www.instagram.com'
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    title="Visit our Instagram account"
                    className="w-9 h-9 rounded-lg bg-white/10 hover:bg-gradient-to-tr hover:from-amber-500 hover:via-rose-500 hover:to-purple-600 text-white flex items-center justify-center hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="5" />
                      <circle cx="12" cy="12" r="4" />
                      <circle cx="17.5" cy="6.5" r="1" className="fill-current stroke-none" />
                    </svg>
                  </a>

                  <a
                    href={
                      formatSocialUrl('tiktok', siteConfig.socials.tiktok) ||
                      'https://www.tiktok.com'
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="TikTok"
                    title="Visit our TikTok account"
                    className="w-9 h-9 rounded-lg bg-white/10 hover:bg-[#000000] hover:ring-1 hover:ring-cyan-400 text-white flex items-center justify-center hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.2 8.2 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* Explore Column */}
            <div className="lg:col-span-2 space-y-2.5">
              <h4 className="font-bold text-sm text-white">Explore</h4>
              <ul className="space-y-1.5 text-xs text-slate-400">
                <li>
                  <a href="#home" className="hover:text-white transition-colors">
                    Home
                  </a>
                </li>
                <li>
                  <a href="#categories" className="hover:text-white transition-colors">
                    Categories
                  </a>
                </li>
                <li>
                  <a href="#products" className="hover:text-white transition-colors">
                    Our Products
                  </a>
                </li>
                <li>
                  <a href="#services" className="hover:text-white transition-colors">
                    Our Services
                  </a>
                </li>
              </ul>
            </div>

            {/* About Column */}
            <div className="lg:col-span-2 space-y-2.5">
              <h4 className="font-bold text-sm text-white">About</h4>
              <ul className="space-y-1.5 text-xs text-slate-400">
                <li>
                  <a href="#story" className="hover:text-white transition-colors">
                    Our Story
                  </a>
                </li>
                <li>
                  <a href="#reviews" className="hover:text-white transition-colors">
                    Reviews
                  </a>
                </li>
                <li>
                  <a href="#faq" className="hover:text-white transition-colors">
                    Frequently Asked Questions
                  </a>
                </li>
                <li>
                  <a href="#contact" className="hover:text-white transition-colors">
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>

            {/* Visit Our Store Column */}
            <div className="lg:col-span-3 space-y-2.5">
              <h4 className="font-bold text-sm text-white">Visit Our Store</h4>
              <ul className="space-y-1.5 text-xs text-slate-400">
                <li>{siteConfig.topBar.address}</li>
                <li>Mon–Sat: 8 AM–10 PM</li>
                <li>Sunday: 12 AM–11 PM</li>
                <li>
                  <a
                    href={`https://wa.me/${siteConfig.topBar.whatsappNumber}?text=${encodeURIComponent(
                      `Hello ${siteConfig.brand.name}, I would like to make a delivery enquiry.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-300 hover:underline inline-flex items-center gap-1"
                  >
                    <span>Delivery enquiries</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 space-y-2">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-slate-400">
              <p>{siteConfig.footer.copyright}</p>
              <div className="flex items-center gap-4">
                <span>{siteConfig.footer.taglineRight}</span>
                <a
                  href="#Admin"
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.hash = '#Admin';
                    setIsAdminRoute(true);
                    window.scrollTo({ top: 0, behavior: 'auto' });
                  }}
                  className="text-slate-400 hover:text-white transition-colors font-medium"
                >
                  Admin
                </a>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              {siteConfig.footer.legalNote}
            </p>
          </div>
        </div>
      </footer>

      {/* Cart Slide-Over Drawer */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cart}
        onUpdateQty={updateCartQty}
        onRemoveItem={removeCartItem}
        onClearCart={() => setCart([])}
        whatsappNumber={siteConfig.topBar.whatsappNumber}
        whatsappDisplay={siteConfig.topBar.whatsappDisplay}
        brandName={siteConfig.brand.name}
      />

      {/* Floating Hovering WhatsApp Button */}
      <a
        href={`https://wa.me/${siteConfig.topBar.whatsappNumber}?text=${encodeURIComponent(
          `Hello ${siteConfig.brand.name} (Owerri), I would like to make an enquiry.`
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2.5 bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold text-xs sm:text-sm px-4 py-3 sm:px-5 sm:py-3.5 rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-1 hover:scale-105 active:translate-y-0 transition-all duration-200"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current shrink-0">
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zm5.8 14.12c-.24.68-1.41 1.3-1.95 1.38-.51.08-1.15.11-1.85-.11-.42-.13-.97-.32-1.68-.62-2.96-1.28-4.89-4.27-5.04-4.47-.15-.2-1.2-1.6-1.2-3.05 0-1.45.76-2.16 1.03-2.46.27-.3.59-.37.79-.37.2 0 .39.01.56.01.18 0 .42-.07.66.5.24.59.83 2.04.91 2.19.07.15.12.32.02.52-.1.2-.15.32-.3.5-.15.17-.31.38-.44.51-.15.15-.3.31-.13.61.17.3.76 1.26 1.64 2.04 1.13 1 2.08 1.31 2.38 1.46.3.15.47.12.64-.07.17-.2.74-.86.94-1.16.2-.3.4-.25.67-.15.27.1 1.74.82 2.04.97.3.15.5.22.57.34.07.13.07.72-.17 1.4z" />
        </svg>
        <span className="hidden sm:inline whitespace-nowrap">WhatsApp Us</span>
      </a>

      {/* Subtle Add-to-Cart Toast */}
      {toastText && (
        <div
          role="status"
          className="fixed bottom-20 right-5 z-50 bg-[#0A1D3D] text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-xl border border-white/10 flex items-center gap-2"
        >
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastText}</span>
        </div>
      )}

      {/* Full-Screen Image Lightbox */}
      <ImageLightbox image={lightboxImage} onClose={() => setLightboxImage(null)} />
    </div>
  );
}
