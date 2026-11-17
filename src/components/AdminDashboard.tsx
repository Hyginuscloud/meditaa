import React, { useMemo, useState } from 'react';
import {
  Lock,
  Eye,
  EyeOff,
  LogOut,
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Pencil,
  Upload,
  Image as ImageIcon,
  Video,
  Shield,
  Users,
  Check,
  RotateCcw,
  FileText,
  Package,
  Film,
  X,
  Share2,
  ExternalLink,
} from 'lucide-react';
import {
  DEFAULT_SITE_CONFIG,
  EditableProduct,
  formatSocialUrl,
  MediaGalleryItem,
  SiteConfig,
} from '../data/siteConfig';
import { CATEGORIES, CategoryId } from '../data/products';
import { ProductBottleArt } from './ProductBottleArt';
import { formatNaira } from './CartDrawer';
import { ImageLightbox, LightboxImage } from './ImageLightbox';

export interface AuthSessionInfo {
  token: string;
  role: 'admin' | 'manager';
  name: string;
  managerEnabled: boolean;
  managerName: string;
}

interface AdminDashboardProps {
  config: SiteConfig;
  session: AuthSessionInfo | null;
  initialNotice?: string;
  onLoginSuccess: (session: AuthSessionInfo) => void;
  onLogout: () => void;
  onSaveConfig: (nextConfig: SiteConfig, message?: string) => Promise<boolean>;
  onResetDefaults: () => Promise<boolean>;
  onBackToSite: () => void;
  onSessionUpdate: (partial: Partial<AuthSessionInfo>) => void;
}

type AdminTab = 'products' | 'content' | 'media' | 'socials' | 'security';

function cloneConfig(cfg: SiteConfig): SiteConfig {
  try {
    return structuredClone(cfg);
  } catch {
    return JSON.parse(JSON.stringify(cfg)) as SiteConfig;
  }
}

async function parseJsonSafe(res: Response): Promise<Record<string, unknown>> {
  try {
    const text = await res.text();
    return text ? (JSON.parse(text) as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  config,
  session,
  initialNotice,
  onLoginSuccess,
  onLogout,
  onSaveConfig,
  onResetDefaults,
  onBackToSite,
  onSessionUpdate,
}) => {
  // Login state
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPwd, setShowLoginPwd] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Dashboard UI state
  const [activeTab, setActiveTab] = useState<AdminTab>('products');
  const [draft, setDraft] = useState<SiteConfig>(() => cloneConfig(config));
  const [statusBanner, setStatusBanner] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<LightboxImage | null>(null);

  // Sync draft when config updates externally
  React.useEffect(() => {
    setDraft(cloneConfig(config));
  }, [config]);

  React.useEffect(() => {
    if (initialNotice) {
      setLoginError(initialNotice);
    }
  }, [initialNotice]);

  const showBanner = (type: 'success' | 'error', text: string) => {
    setStatusBanner({ type, text });
    window.setTimeout(() => {
      setStatusBanner((prev) => (prev?.text === text ? null : prev));
    }, 3500);
  };

  // Products state
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState<'All' | CategoryId>('All');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editProductForm, setEditProductForm] = useState<EditableProduct | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState<{
    name: string;
    category: CategoryId;
    description: string;
    price: string;
    unit: string;
    imageUrl: string;
  }>({
    name: '',
    category: 'Pharmacy',
    description: '',
    price: '',
    unit: 'Pack',
    imageUrl: '',
  });

  // Media upload state
  const [mediaTitle, setMediaTitle] = useState('');
  const [mediaCaption, setMediaCaption] = useState('');
  const [mediaPlacement, setMediaPlacement] = useState<'gallery' | 'hero'>('gallery');
  const [uploadingMedia, setUploadingMedia] = useState(false);

  // Security & Manager state
  const [currentAdminPwd, setCurrentAdminPwd] = useState('');
  const [newAdminPwd, setNewAdminPwd] = useState('');
  const [confirmAdminPwd, setConfirmAdminPwd] = useState('');
  const [pwdUpdating, setPwdUpdating] = useState(false);

  const [managerEnabled, setManagerEnabled] = useState(session?.managerEnabled ?? false);
  const [managerName, setManagerName] = useState(session?.managerName || 'Store Manager');
  const [managerPassword, setManagerPassword] = useState('');
  const [managerSaving, setManagerSaving] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  React.useEffect(() => {
    if (session) {
      setManagerEnabled(session.managerEnabled);
      setManagerName(session.managerName || 'Store Manager');
    }
  }, [session]);

  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    return draft.products.filter((p) => {
      const catOk = productCategoryFilter === 'All' || p.category === productCategoryFilter;
      const qOk =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);
      return catOk && qOk;
    });
  }, [draft.products, productSearch, productCategoryFilter]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: loginPassword }),
        signal: AbortSignal.timeout(15000),
      });
      const data = await parseJsonSafe(res);
      if (!res.ok) {
        setLoginError(
          typeof data.error === 'string' ? data.error : 'Incorrect password.'
        );
      } else {
        setLoginPassword('');
        onLoginSuccess({
          token: String(data.token || ''),
          role: (data.role === 'manager' ? 'manager' : 'admin') as 'admin' | 'manager',
          name: String(data.name || 'Administrator'),
          managerEnabled: Boolean(data.managerEnabled),
          managerName: String(data.managerName || 'Store Manager'),
        });
      }
    } catch {
      setLoginError('Unable to reach server. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  const uploadFile = async (file: File): Promise<{ url: string; type: 'image' | 'video' }> => {
    if (!session) throw new Error('Not authenticated');
    const res = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.token}`,
        'Content-Type': file.type || 'application/octet-stream',
      },
      body: file,
    });
    const data = await parseJsonSafe(res);
    if (res.status === 401) {
      onLogout();
      throw new Error('Your session expired. Please sign in again.');
    }
    if (!res.ok) {
      throw new Error(typeof data.error === 'string' ? data.error : 'Upload failed');
    }
    return {
      url: String(data.url || ''),
      type: data.type === 'video' ? 'video' : 'image',
    };
  };

  const persistDraft = async (nextConfig: SiteConfig, message: string) => {
    setSaving(true);
    setDraft(nextConfig);
    try {
      const ok = await onSaveConfig(nextConfig, message);
      if (ok) {
        showBanner('success', message);
      } else {
        showBanner('error', 'Failed to save changes. Please sign in again.');
      }
    } finally {
      setSaving(false);
    }
  };

  // Product actions
  const handleStartEditProduct = (p: EditableProduct) => {
    setEditingProductId(p.id);
    setEditProductForm({ ...p });
  };

  const handleSaveEditedProduct = async () => {
    if (!editProductForm) return;
    const nextProducts = draft.products.map((p) =>
      p.id === editProductForm.id ? editProductForm : p
    );
    const nextConfig = { ...draft, products: nextProducts };
    setEditingProductId(null);
    setEditProductForm(null);
    await persistDraft(nextConfig, `Updated "${editProductForm.name}"`);
  };

  const handleDeleteProduct = async (productId: string) => {
    const target = draft.products.find((p) => p.id === productId);
    const nextConfig = {
      ...draft,
      products: draft.products.filter((p) => p.id !== productId),
    };
    setConfirmDeleteId(null);
    await persistDraft(nextConfig, `Deleted "${target?.name || 'item'}"`);
  };

  const handleReplaceProductImage = async (productId: string, file: File) => {
    try {
      setSaving(true);
      const uploaded = await uploadFile(file);
      if (uploaded.type !== 'image') {
        showBanner('error', 'Please upload an image file for a product thumbnail.');
        setSaving(false);
        return;
      }
      const nextProducts = draft.products.map((p) =>
        p.id === productId ? { ...p, imageUrl: uploaded.url } : p
      );
      const nextConfig = { ...draft, products: nextProducts };
      await persistDraft(nextConfig, 'Product image replaced and published');
    } catch (err) {
      setSaving(false);
      showBanner('error', err instanceof Error ? err.message : 'Image upload failed');
    }
  };

  const handleClearProductImage = async (productId: string) => {
    const nextProducts = draft.products.map((p) => {
      if (p.id !== productId) return p;
      const copy = { ...p };
      delete copy.imageUrl;
      return copy;
    });
    await persistDraft({ ...draft, products: nextProducts }, 'Restored default bottle illustration');
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericPrice = Number(newProduct.price);
    if (!newProduct.name.trim() || Number.isNaN(numericPrice) || numericPrice <= 0) {
      showBanner('error', 'Please provide a valid product name and price.');
      return;
    }

    const id = `${newProduct.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')}-${Date.now().toString().slice(-4)}`;

    const created: EditableProduct = {
      id,
      name: newProduct.name.trim(),
      category: newProduct.category,
      description: newProduct.description.trim() || 'Storefront item.',
      price: numericPrice,
      unit: newProduct.unit.trim() || 'Pack',
      badgeColor: '#DBEAFE',
      iconKey: 'tablets',
      ...(newProduct.imageUrl ? { imageUrl: newProduct.imageUrl } : {}),
    };

    const nextConfig = { ...draft, products: [created, ...draft.products] };
    setNewProduct({
      name: '',
      category: 'Pharmacy',
      description: '',
      price: '',
      unit: 'Pack',
      imageUrl: '',
    });
    setShowAddProduct(false);
    await persistDraft(nextConfig, `Added "${created.name}" to the storefront`);
  };

  const handleNewProductImageUpload = async (file: File) => {
    try {
      const uploaded = await uploadFile(file);
      if (uploaded.type === 'image') {
        setNewProduct((prev) => ({ ...prev, imageUrl: uploaded.url }));
        showBanner('success', 'Image uploaded for new product');
      }
    } catch (err) {
      showBanner('error', err instanceof Error ? err.message : 'Upload failed');
    }
  };

  // Site images upload (logo, hero, or ceo)
  const handleReplaceSiteImage = async (target: 'logo' | 'hero' | 'ceo', file: File) => {
    try {
      setSaving(true);
      const uploaded = await uploadFile(file);
      if (uploaded.type !== 'image') {
        showBanner('error', 'Please choose an image file.');
        setSaving(false);
        return;
      }
      const nextConfig: SiteConfig =
        target === 'logo'
          ? { ...draft, brand: { ...draft.brand, logoUrl: uploaded.url } }
          : target === 'hero'
          ? { ...draft, hero: { ...draft.hero, heroImageUrl: uploaded.url } }
          : { ...draft, storySection: { ...draft.storySection, ceoImageUrl: uploaded.url } };
      const message =
        target === 'logo'
          ? 'Brand logo replaced'
          : target === 'hero'
          ? 'Hero image replaced'
          : 'CEO portrait photo updated and published';
      await persistDraft(nextConfig, message);
    } catch (err) {
      setSaving(false);
      showBanner('error', err instanceof Error ? err.message : 'Upload failed');
    }
  };

  // Media gallery upload (images & videos)
  const handleMediaFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadingMedia(true);
    try {
      const newItems: MediaGalleryItem[] = [];
      for (const file of Array.from(files)) {
        const uploaded = await uploadFile(file);
        newItems.push({
          id: `media-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          type: uploaded.type,
          url: uploaded.url,
          title: mediaTitle.trim() || file.name.replace(/\.[^.]+$/, ''),
          caption: mediaCaption.trim(),
          placement: mediaPlacement,
          createdAt: new Date().toISOString(),
        });
      }

      // If placement is 'hero', ensure only latest hero item occupies hero slot (move previous hero items to gallery)
      let existingGallery = draft.mediaGallery;
      if (mediaPlacement === 'hero') {
        existingGallery = existingGallery.map((m) =>
          m.placement === 'hero' ? { ...m, placement: 'gallery' as const } : m
        );
      }

      const nextConfig: SiteConfig = {
        ...draft,
        mediaGallery: [...newItems, ...existingGallery],
      };

      setMediaTitle('');
      setMediaCaption('');
      await persistDraft(
        nextConfig,
        `Uploaded ${newItems.length} ${newItems.length === 1 ? 'file' : 'files'} directly to the website`
      );
    } catch (err) {
      showBanner('error', err instanceof Error ? err.message : 'Media upload failed');
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleToggleMediaPlacement = async (id: string, placement: 'gallery' | 'hero') => {
    const nextGallery = draft.mediaGallery.map((m) => {
      if (m.id === id) return { ...m, placement };
      if (placement === 'hero' && m.placement === 'hero') return { ...m, placement: 'gallery' as const };
      return m;
    });
    await persistDraft({ ...draft, mediaGallery: nextGallery }, 'Updated media placement');
  };

  const handleDeleteMedia = async (id: string) => {
    const nextGallery = draft.mediaGallery.filter((m) => m.id !== id);
    await persistDraft({ ...draft, mediaGallery: nextGallery }, 'Removed media item');
  };

  // Security actions
  const handleChangeAdminPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    if (newAdminPwd.length < 6) {
      showBanner('error', 'New password must be at least 6 characters.');
      return;
    }
    if (newAdminPwd !== confirmAdminPwd) {
      showBanner('error', 'New passwords do not match.');
      return;
    }

    setPwdUpdating(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({ currentPassword: currentAdminPwd, newPassword: newAdminPwd }),
        signal: AbortSignal.timeout(15000),
      });
      if (res.status === 401) {
        const data = await parseJsonSafe(res);
        if (String(data.error || '').toLowerCase().includes('authentication')) {
          onLogout();
          return;
        }
        showBanner('error', typeof data.error === 'string' ? data.error : 'Current Admin password is incorrect.');
        return;
      }
      const data = await parseJsonSafe(res);
      if (!res.ok) {
        showBanner('error', typeof data.error === 'string' ? data.error : 'Could not update password.');
      } else {
        setCurrentAdminPwd('');
        setNewAdminPwd('');
        setConfirmAdminPwd('');
        showBanner('success', 'Admin password changed successfully.');
      }
    } catch {
      showBanner('error', 'Network error while changing password.');
    } finally {
      setPwdUpdating(false);
    }
  };

  const handleSaveManagerSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    setManagerSaving(true);
    try {
      const res = await fetch('/api/auth/manager', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({
          enabled: managerEnabled,
          managerName,
          managerPassword: managerPassword || undefined,
        }),
        signal: AbortSignal.timeout(15000),
      });
      if (res.status === 401) {
        onLogout();
        return;
      }
      const data = await parseJsonSafe(res);
      if (!res.ok) {
        showBanner('error', typeof data.error === 'string' ? data.error : 'Could not update Manager settings.');
      } else {
        setManagerPassword('');
        const nextEnabled = Boolean(data.managerEnabled);
        const nextManagerName = String(data.managerName || 'Store Manager');
        onSessionUpdate({
          managerEnabled: nextEnabled,
          managerName: nextManagerName,
        });
        showBanner(
          'success',
          nextEnabled
            ? `Manager password assigned for "${nextManagerName}".`
            : 'Manager access disabled.'
        );
      }
    } catch {
      showBanner('error', 'Network error while saving Manager settings.');
    } finally {
      setManagerSaving(false);
    }
  };

  // LOGIN GATE
  if (!session) {
    return (
      <div className="min-h-screen bg-[#071630] flex flex-col justify-center items-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
          <div className="bg-[#0A1D3D] px-6 py-6 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-[#DC2626] flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5 text-white" />
              </span>
              <div>
                <h1 className="font-display font-bold text-lg leading-tight">Admin Portal</h1>
                <p className="text-xs text-slate-300 mt-0.5">{config.brand.name}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onBackToSite}
              className="text-xs font-semibold text-amber-300 hover:text-amber-200 inline-flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Storefront</span>
            </button>
          </div>

          <form onSubmit={handleLogin} className="p-6 space-y-4">
            <p className="text-xs sm:text-sm text-slate-600">
              Enter your Administrator or assigned Manager password to manage products, write-ups,
              images, videos, and access settings.
            </p>

            <div>
              <label
                htmlFor="admin-password"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showLoginPwd ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter Admin or Manager password"
                  autoFocus
                  required
                  className="w-full pl-3.5 pr-10 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A1D3D]/20 focus:border-[#0A1D3D]"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPwd((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                  aria-label={showLoginPwd ? 'Hide password' : 'Show password'}
                >
                  {showLoginPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {loginError && (
              <p className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                {loginError}
              </p>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-[#DC2626] hover:bg-[#B91C1C] disabled:opacity-60 text-white font-semibold text-sm py-2.5 px-4 rounded-lg transition-colors cursor-pointer"
            >
              {loginLoading ? 'Verifying...' : 'Sign In to Dashboard'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7FA] text-slate-900 flex flex-col">
      {/* Top Admin Header */}
      <header className="sticky top-0 z-40 bg-[#071630] text-white border-b border-white/10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-9 h-9 rounded-lg bg-[#DC2626] flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4 text-white" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-display font-bold text-sm sm:text-base truncate">
                  Admin Dashboard
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-400 text-[#071630] whitespace-nowrap">
                  {session.role === 'admin' ? 'Admin' : `Manager · ${session.name}`}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 truncate">{draft.brand.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => persistDraft(draft, 'All website changes saved and published')}
              disabled={saving}
              className="inline-flex items-center gap-1.5 bg-[#16A34A] hover:bg-[#15803D] disabled:opacity-60 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <Save className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>

            <button
              type="button"
              onClick={onBackToSite}
              className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>View Website</span>
            </button>

            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-[#0A1D3D] border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 overflow-x-auto">
            {[
              { id: 'products' as const, label: `Products (${draft.products.length})`, icon: Package },
              { id: 'content' as const, label: 'Write-ups & Images', icon: FileText },
              { id: 'media' as const, label: `Upload Images & Videos (${draft.mediaGallery.length})`, icon: Film },
              { id: 'socials' as const, label: 'Social Media', icon: Share2 },
              { id: 'security' as const, label: 'Passwords & Manager', icon: Users },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    active
                      ? 'border-amber-400 text-amber-300'
                      : 'border-transparent text-slate-300 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Floating Status Toast (always visible regardless of scroll position) */}
      {statusBanner && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-50 max-w-md w-[calc(100vw-2.5rem)] sm:w-auto"
        >
          <div
            className={`px-4 py-3.5 rounded-xl border shadow-2xl text-xs sm:text-sm font-semibold flex items-center justify-between gap-3 ${
              statusBanner.type === 'success'
                ? 'bg-emerald-600 border-emerald-500 text-white'
                : 'bg-rose-600 border-rose-500 text-white'
            }`}
          >
            <span className="flex items-center gap-2">
              {statusBanner.type === 'success' && <Check className="w-4 h-4 shrink-0" />}
              <span>{statusBanner.text}</span>
            </span>
            <button
              type="button"
              onClick={() => setStatusBanner(null)}
              className="p-1 hover:bg-white/15 rounded cursor-pointer shrink-0"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* TAB 1: PRODUCTS MANAGEMENT */}
        {activeTab === 'products' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
              <div className="flex flex-1 flex-wrap items-center gap-2.5">
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search items to edit or delete..."
                  className="flex-1 min-w-52 px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#0A1D3D]"
                />
                <select
                  value={productCategoryFilter}
                  onChange={(e) =>
                    setProductCategoryFilter(e.target.value as 'All' | CategoryId)
                  }
                  className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50"
                >
                  <option value="All">All Categories</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => setShowAddProduct((v) => !v)}
                className="inline-flex items-center justify-center gap-1.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Item</span>
              </button>
            </div>

            {/* Add New Item Form */}
            {showAddProduct && (
              <form
                onSubmit={handleAddProduct}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h2 className="font-display font-bold text-base text-[#0A1D3D]">
                    Add New Store Item
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowAddProduct(false)}
                    className="text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Item Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      placeholder="e.g. Multivitamin Syrup"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Category
                    </label>
                    <select
                      value={newProduct.category}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, category: e.target.value as CategoryId })
                      }
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Price (₦) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      placeholder="1500"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Unit Label
                    </label>
                    <input
                      type="text"
                      value={newProduct.unit}
                      onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                      placeholder="Pack, Bottle, Jar..."
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={newProduct.description}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, description: e.target.value })
                      }
                      placeholder="Short description shown on product card"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Upload Item Image (optional)
                    </label>
                    <div className="flex items-center gap-2">
                      <label className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Choose Image</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) void handleNewProductImageUpload(f);
                          }}
                        />
                      </label>
                      {newProduct.imageUrl && (
                        <span className="text-xs text-emerald-700 font-semibold truncate">
                          Image ready
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddProduct(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-semibold bg-[#0A1D3D] hover:bg-[#122D5C] text-white rounded-lg cursor-pointer"
                  >
                    Publish Item
                  </button>
                </div>
              </form>
            )}

            {/* Products List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((product) => {
                const isEditing = editingProductId === product.id && editProductForm;
                const isConfirmingDelete = confirmDeleteId === product.id;

                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col gap-3 shadow-2xs"
                  >
                    <ProductBottleArt
                      product={product}
                      onImageClick={(prod) =>
                        setLightboxImage({ kind: 'product', product: prod })
                      }
                    />

                    {/* Image Replace / Reset row */}
                    <div className="flex items-center justify-between gap-2">
                      <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0A1D3D] bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg cursor-pointer">
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Replace Image</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) void handleReplaceProductImage(product.id, f);
                          }}
                        />
                      </label>
                      {product.imageUrl && (
                        <button
                          type="button"
                          onClick={() => void handleClearProductImage(product.id)}
                          className="text-[11px] font-medium text-slate-500 hover:text-rose-600 cursor-pointer"
                        >
                          Use default art
                        </button>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="space-y-2.5 pt-2 border-t border-slate-100">
                        <input
                          type="text"
                          value={editProductForm.name}
                          onChange={(e) =>
                            setEditProductForm({ ...editProductForm, name: e.target.value })
                          }
                          className="w-full px-2.5 py-1.5 text-sm font-semibold border border-slate-300 rounded-lg"
                          placeholder="Product name"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <select
                            value={editProductForm.category}
                            onChange={(e) =>
                              setEditProductForm({
                                ...editProductForm,
                                category: e.target.value as CategoryId,
                              })
                            }
                            className="px-2 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                          >
                            {CATEGORIES.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.title}
                              </option>
                            ))}
                          </select>
                          <input
                            type="text"
                            value={editProductForm.unit}
                            onChange={(e) =>
                              setEditProductForm({ ...editProductForm, unit: e.target.value })
                            }
                            className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg"
                            placeholder="Unit"
                          />
                        </div>
                        <input
                          type="number"
                          value={editProductForm.price}
                          onChange={(e) =>
                            setEditProductForm({
                              ...editProductForm,
                              price: Number(e.target.value) || 0,
                            })
                          }
                          className="w-full px-2.5 py-1.5 text-sm border border-slate-300 rounded-lg"
                          placeholder="Price in Naira"
                        />
                        <textarea
                          rows={2}
                          value={editProductForm.description}
                          onChange={(e) =>
                            setEditProductForm({
                              ...editProductForm,
                              description: e.target.value,
                            })
                          }
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg"
                        />
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => void handleSaveEditedProduct()}
                            className="flex-1 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold py-2 rounded-lg cursor-pointer"
                          >
                            Save Item
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingProductId(null);
                              setEditProductForm(null);
                            }}
                            className="px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#DC2626]">
                          {product.category}
                        </span>
                        <h3 className="font-display font-bold text-base text-[#0A1D3D] mt-0.5">
                          {product.name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 flex-1">{product.description}</p>
                        <div className="flex items-baseline justify-between mt-3 pt-2 border-t border-slate-100">
                          <span className="font-bold text-base text-[#0A1D3D] tabular-nums">
                            {formatNaira(product.price)}
                          </span>
                          <span className="text-xs font-semibold text-teal-600">
                            {product.unit}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mt-3">
                          <button
                            type="button"
                            onClick={() => handleStartEditProduct(product)}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#0A1D3D] hover:bg-[#122D5C] text-white text-xs font-semibold py-2 rounded-lg cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>

                          {isConfirmingDelete ? (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => void handleDeleteProduct(product.id)}
                                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-3 py-2 rounded-lg cursor-pointer"
                              >
                                Confirm
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(null)}
                                className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-2 rounded-lg cursor-pointer"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(product.id)}
                              className="inline-flex items-center justify-center gap-1 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold px-3 py-2 rounded-lg cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: SITE WRITE-UPS & IMAGES */}
        {activeTab === 'content' && (
          <div className="space-y-6">
            {/* Brand & Header */}
            <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-display font-bold text-lg text-[#0A1D3D]">
                  Header, Brand &amp; Store Contact Details
                </h2>
                <button
                  type="button"
                  onClick={() => persistDraft(draft, 'Saved all write-ups and images')}
                  className="inline-flex items-center gap-1.5 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Write-ups</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Brand Name
                  </label>
                  <input
                    type="text"
                    value={draft.brand.name}
                    onChange={(e) =>
                      setDraft({ ...draft, brand: { ...draft.brand, name: e.target.value } })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Brand Subtitle / Location Tagline
                  </label>
                  <input
                    type="text"
                    value={draft.brand.tagline}
                    onChange={(e) =>
                      setDraft({ ...draft, brand: { ...draft.brand, tagline: e.target.value } })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Store Address
                  </label>
                  <input
                    type="text"
                    value={draft.topBar.address}
                    onChange={(e) =>
                      setDraft({ ...draft, topBar: { ...draft.topBar, address: e.target.value } })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Top Bar Opening Hours
                  </label>
                  <input
                    type="text"
                    value={draft.topBar.hours}
                    onChange={(e) =>
                      setDraft({ ...draft, topBar: { ...draft.topBar, hours: e.target.value } })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    WhatsApp Number (digits only, e.g. 2348100051616)
                  </label>
                  <input
                    type="text"
                    value={draft.topBar.whatsappNumber}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        topBar: { ...draft.topBar, whatsappNumber: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    WhatsApp Display Text
                  </label>
                  <input
                    type="text"
                    value={draft.topBar.whatsappDisplay}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        topBar: { ...draft.topBar, whatsappDisplay: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Store Phone Number
                  </label>
                  <input
                    type="text"
                    value={draft.topBar.phone}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        topBar: { ...draft.topBar, phone: e.target.value },
                      })
                    }
                    placeholder="+234 810 005 1616"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Store Email Address
                  </label>
                  <input
                    type="email"
                    value={draft.topBar.email}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        topBar: { ...draft.topBar, email: e.target.value },
                      })
                    }
                    placeholder="Hyginustina46@gmail.com"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              {/* Quick Social Media Shortcut / Sync */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#DC2626]">
                    Footer Social Media Links (Facebook, Instagram, TikTok)
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('socials')}
                    className="text-xs font-semibold text-[#0A1D3D] hover:text-[#DC2626] underline cursor-pointer"
                  >
                    Open Social Media Manager
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Facebook Link or Username
                    </label>
                    <input
                      type="text"
                      value={draft.socials.facebook}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          socials: { ...draft.socials, facebook: e.target.value },
                        })
                      }
                      placeholder="https://facebook.com/yourpage or @yourpage"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Instagram Link or Handle
                    </label>
                    <input
                      type="text"
                      value={draft.socials.instagram}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          socials: { ...draft.socials, instagram: e.target.value },
                        })
                      }
                      placeholder="https://instagram.com/yourhandle or @yourhandle"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      TikTok Link or Handle
                    </label>
                    <input
                      type="text"
                      value={draft.socials.tiktok}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          socials: { ...draft.socials, tiktok: e.target.value },
                        })
                      }
                      placeholder="https://tiktok.com/@yourhandle or @yourhandle"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <label className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Replace Brand Logo Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) void handleReplaceSiteImage('logo', f);
                    }}
                  />
                </label>
                {draft.brand.logoUrl && (
                  <button
                    type="button"
                    onClick={() =>
                      persistDraft(
                        { ...draft, brand: { ...draft.brand, logoUrl: '' } },
                        'Restored default red cross logo'
                      )
                    }
                    className="text-xs font-semibold text-rose-600 hover:underline cursor-pointer"
                  >
                    Restore default cross logo
                  </button>
                )}
              </div>
            </section>

            {/* Hero Write-up & Image */}
            <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <h2 className="font-display font-bold text-lg text-[#0A1D3D]">
                Hero Banner Write-ups &amp; Image
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Hero Eyebrow
                  </label>
                  <input
                    type="text"
                    value={draft.hero.eyebrow}
                    onChange={(e) =>
                      setDraft({ ...draft, hero: { ...draft.hero, eyebrow: e.target.value } })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Hero Headline
                  </label>
                  <input
                    type="text"
                    value={draft.hero.headline}
                    onChange={(e) =>
                      setDraft({ ...draft, hero: { ...draft.hero, headline: e.target.value } })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Hero Subtitle
                  </label>
                  <textarea
                    rows={2}
                    value={draft.hero.subtitle}
                    onChange={(e) =>
                      setDraft({ ...draft, hero: { ...draft.hero, subtitle: e.target.value } })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Primary Button Label
                  </label>
                  <input
                    type="text"
                    value={draft.hero.primaryCta}
                    onChange={(e) =>
                      setDraft({ ...draft, hero: { ...draft.hero, primaryCta: e.target.value } })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Secondary Button Label
                  </label>
                  <input
                    type="text"
                    value={draft.hero.secondaryCta}
                    onChange={(e) =>
                      setDraft({ ...draft, hero: { ...draft.hero, secondaryCta: e.target.value } })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Emblem Title
                  </label>
                  <input
                    type="text"
                    value={draft.hero.emblemTitle}
                    onChange={(e) =>
                      setDraft({ ...draft, hero: { ...draft.hero, emblemTitle: e.target.value } })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Emblem Subtitle
                  </label>
                  <input
                    type="text"
                    value={draft.hero.emblemSubtitle}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        hero: { ...draft.hero, emblemSubtitle: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <label className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer">
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Replace Hero Emblem with Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) void handleReplaceSiteImage('hero', f);
                    }}
                  />
                </label>
                {draft.hero.heroImageUrl && (
                  <button
                    type="button"
                    onClick={() =>
                      persistDraft(
                        { ...draft, hero: { ...draft.hero, heroImageUrl: '' } },
                        'Restored default MediTrust Hero emblem'
                      )
                    }
                    className="text-xs font-semibold text-rose-600 hover:underline cursor-pointer"
                  >
                    Restore default Hero emblem
                  </button>
                )}
              </div>
            </section>

            {/* Categories & Store Menu Write-ups */}
            <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <h2 className="font-display font-bold text-lg text-[#0A1D3D]">
                Categories &amp; Store Menu Write-ups
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Categories Heading
                  </label>
                  <input
                    type="text"
                    value={draft.categoriesSection.heading}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        categoriesSection: { ...draft.categoriesSection, heading: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Categories Subtitle
                  </label>
                  <input
                    type="text"
                    value={draft.categoriesSection.subtitle}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        categoriesSection: { ...draft.categoriesSection, subtitle: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Store Menu Heading
                  </label>
                  <input
                    type="text"
                    value={draft.productsSection.heading}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        productsSection: { ...draft.productsSection, heading: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Store Menu Subtitle
                  </label>
                  <input
                    type="text"
                    value={draft.productsSection.subtitle}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        productsSection: { ...draft.productsSection, subtitle: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Pricing Disclaimer
                  </label>
                  <input
                    type="text"
                    value={draft.productsSection.disclaimer}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        productsSection: { ...draft.productsSection, disclaimer: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                {draft.categories.map((cat, idx) => (
                  <div key={cat.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <input
                      type="text"
                      value={cat.title}
                      onChange={(e) => {
                        const next = [...draft.categories];
                        next[idx] = { ...cat, title: e.target.value };
                        setDraft({ ...draft, categories: next });
                      }}
                      className="w-full px-2.5 py-1.5 text-xs font-bold border border-slate-200 rounded-lg bg-white"
                    />
                    <input
                      type="text"
                      value={cat.subtitle}
                      onChange={(e) => {
                        const next = [...draft.categories];
                        next[idx] = { ...cat, subtitle: e.target.value };
                        setDraft({ ...draft, categories: next });
                      }}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* Services, Story, Reviews, FAQ & Footer */}
            <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
              <h2 className="font-display font-bold text-lg text-[#0A1D3D]">
                Services, Story, Commitments, FAQ &amp; Footer Write-ups
              </h2>

              {/* Our Story & CEO Photo */}
              <div className="space-y-4 pb-5 border-b border-slate-100">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#DC2626]">
                    Our Story &amp; CEO Portrait Section
                  </h3>
                  <button
                    type="button"
                    onClick={() => persistDraft(draft, 'Saved Our Story & CEO photo settings')}
                    className="inline-flex items-center gap-1.5 bg-[#0A1D3D] hover:bg-[#122D5C] text-white text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Story &amp; CEO</span>
                  </button>
                </div>

                <input
                  type="text"
                  value={draft.storySection.heading}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      storySection: { ...draft.storySection, heading: e.target.value },
                    })
                  }
                  placeholder="Our Story heading"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                />
                <textarea
                  rows={3}
                  value={draft.storySection.body}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      storySection: { ...draft.storySection, body: e.target.value },
                    })
                  }
                  placeholder="Our Story body text"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                />

                {/* CEO Photo & Title Editor */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  <div className="md:col-span-3 flex flex-col items-center gap-2">
                    {draft.storySection.ceoImageUrl ? (
                      <button
                        type="button"
                        onClick={() =>
                          setLightboxImage({
                            url: draft.storySection.ceoImageUrl,
                            title: draft.storySection.ceoName || 'Chief Executive Officer',
                            caption: draft.storySection.ceoTitle,
                          })
                        }
                        className="w-28 h-36 rounded-xl overflow-hidden border border-slate-200 bg-white shadow-2xs cursor-zoom-in block group"
                        aria-label="Preview full CEO photo"
                      >
                        <img
                          src={draft.storySection.ceoImageUrl}
                          alt={draft.storySection.ceoName || 'CEO Portrait'}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover object-top transition-transform duration-200 group-hover:scale-105"
                        />
                      </button>
                    ) : (
                      <div className="w-28 h-36 rounded-xl border border-dashed border-slate-300 bg-white flex items-center justify-center text-xs text-slate-400 text-center p-2">
                        No CEO photo
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-9 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          CEO Name / Title (under photo)
                        </label>
                        <input
                          type="text"
                          value={draft.storySection.ceoName}
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              storySection: { ...draft.storySection, ceoName: e.target.value },
                            })
                          }
                          placeholder="e.g. Chief Executive Officer"
                          className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          CEO Subtitle / Role (under photo)
                        </label>
                        <input
                          type="text"
                          value={draft.storySection.ceoTitle}
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              storySection: { ...draft.storySection, ceoTitle: e.target.value },
                            })
                          }
                          placeholder="e.g. Founder & Managing Director"
                          className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <label className="inline-flex items-center gap-2 bg-white hover:bg-slate-100 border border-slate-200 text-[#0A1D3D] text-xs font-semibold px-3.5 py-2 rounded-lg cursor-pointer">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload / Replace CEO Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) void handleReplaceSiteImage('ceo', f);
                          }}
                        />
                      </label>

                      {draft.storySection.ceoImageUrl !==
                        DEFAULT_SITE_CONFIG.storySection.ceoImageUrl && (
                        <button
                          type="button"
                          onClick={() =>
                            persistDraft(
                              {
                                ...draft,
                                storySection: {
                                  ...draft.storySection,
                                  ceoImageUrl: DEFAULT_SITE_CONFIG.storySection.ceoImageUrl,
                                },
                              },
                              'Restored default Demo CEO photo'
                            )
                          }
                          className="text-xs font-semibold text-[#0A1D3D] hover:text-[#DC2626] underline cursor-pointer"
                        >
                          Use Demo CEO Photo
                        </button>
                      )}

                      {draft.storySection.ceoImageUrl && (
                        <button
                          type="button"
                          onClick={() =>
                            persistDraft(
                              {
                                ...draft,
                                storySection: { ...draft.storySection, ceoImageUrl: '' },
                              },
                              'Removed CEO photo'
                            )
                          }
                          className="text-xs font-semibold text-rose-600 hover:underline cursor-pointer"
                        >
                          Remove Photo
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Services */}
              <div className="space-y-3 pb-4 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#DC2626]">
                    Services Cards
                  </h3>
                  <button
                    type="button"
                    onClick={() =>
                      setDraft({
                        ...draft,
                        servicesSection: {
                          ...draft.servicesSection,
                          items: [
                            ...draft.servicesSection.items,
                            {
                              id: `service-${Date.now()}`,
                              title: 'New Service',
                              description: 'Describe this service.',
                            },
                          ],
                        },
                      })
                    }
                    className="text-xs font-semibold text-[#0A1D3D] hover:text-[#DC2626] inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Service</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {draft.servicesSection.items.map((svc, idx) => (
                    <div key={svc.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={svc.title}
                          onChange={(e) => {
                            const next = [...draft.servicesSection.items];
                            next[idx] = { ...svc, title: e.target.value };
                            setDraft({
                              ...draft,
                              servicesSection: { ...draft.servicesSection, items: next },
                            });
                          }}
                          className="flex-1 px-2.5 py-1.5 text-xs font-bold border border-slate-200 rounded-lg bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const next = draft.servicesSection.items.filter((s) => s.id !== svc.id);
                            setDraft({
                              ...draft,
                              servicesSection: { ...draft.servicesSection, items: next },
                            });
                          }}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                          aria-label="Delete service"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        value={svc.description}
                        onChange={(e) => {
                          const next = [...draft.servicesSection.items];
                          next[idx] = { ...svc, description: e.target.value };
                          setDraft({
                            ...draft,
                            servicesSection: { ...draft.servicesSection, items: next },
                          });
                        }}
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* FAQs */}
              <div className="space-y-3 pb-4 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#DC2626]">
                    FAQ Questions &amp; Answers
                  </h3>
                  <button
                    type="button"
                    onClick={() =>
                      setDraft({
                        ...draft,
                        faqSection: {
                          ...draft.faqSection,
                          items: [
                            ...draft.faqSection.items,
                            {
                              id: `faq-${Date.now()}`,
                              q: 'New question?',
                              a: 'Write the answer here.',
                            },
                          ],
                        },
                      })
                    }
                    className="text-xs font-semibold text-[#0A1D3D] hover:text-[#DC2626] inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add FAQ</span>
                  </button>
                </div>
                <div className="space-y-2.5">
                  {draft.faqSection.items.map((faq, idx) => (
                    <div key={faq.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={faq.q}
                          onChange={(e) => {
                            const next = [...draft.faqSection.items];
                            next[idx] = { ...faq, q: e.target.value };
                            setDraft({ ...draft, faqSection: { ...draft.faqSection, items: next } });
                          }}
                          className="flex-1 px-2.5 py-1.5 text-xs font-bold border border-slate-200 rounded-lg bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const next = draft.faqSection.items.filter((f) => f.id !== faq.id);
                            setDraft({ ...draft, faqSection: { ...draft.faqSection, items: next } });
                          }}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                          aria-label="Delete FAQ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        value={faq.a}
                        onChange={(e) => {
                          const next = [...draft.faqSection.items];
                          next[idx] = { ...faq, a: e.target.value };
                          setDraft({ ...draft, faqSection: { ...draft.faqSection, items: next } });
                        }}
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact & Footer */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact Section Heading
                  </label>
                  <input
                    type="text"
                    value={draft.contactSection.heading}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        contactSection: { ...draft.contactSection, heading: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Footer Copyright
                  </label>
                  <input
                    type="text"
                    value={draft.footer.copyright}
                    onChange={(e) =>
                      setDraft({ ...draft, footer: { ...draft.footer, copyright: e.target.value } })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Footer Store Description
                  </label>
                  <input
                    type="text"
                    value={draft.footer.description}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        footer: { ...draft.footer, description: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Footer Regulatory Legal Note
                  </label>
                  <textarea
                    rows={2}
                    value={draft.footer.legalNote}
                    onChange={(e) =>
                      setDraft({ ...draft, footer: { ...draft.footer, legalNote: e.target.value } })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-3 flex flex-wrap items-center justify-between gap-3">
                {session.role === 'admin' && (
                  <div>
                    {confirmReset ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-rose-700">
                          Reset all items &amp; text to original defaults?
                        </span>
                        <button
                          type="button"
                          onClick={async () => {
                            const ok = await onResetDefaults();
                            setConfirmReset(false);
                            if (ok) showBanner('success', 'Restored original website defaults');
                          }}
                          className="bg-rose-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer"
                        >
                          Yes, Reset
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmReset(false)}
                          className="bg-slate-100 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmReset(true)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-rose-600 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset Website to Original Defaults</span>
                      </button>
                    )}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => persistDraft(draft, 'Saved all write-ups and images')}
                  className="inline-flex items-center gap-1.5 bg-[#16A34A] hover:bg-[#15803D] text-white text-sm font-semibold px-5 py-2.5 rounded-lg cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save All Write-ups &amp; Images</span>
                </button>
              </div>
            </section>
          </div>
        )}

        {/* TAB 3: UPLOAD IMAGES & VIDEOS */}
        {activeTab === 'media' && (
          <div className="space-y-6">
            <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <div>
                <h2 className="font-display font-bold text-lg text-[#0A1D3D]">
                  Upload New Images &amp; Videos
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Any image or video you upload here is published directly onto the live website.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Title (optional)
                  </label>
                  <input
                    type="text"
                    value={mediaTitle}
                    onChange={(e) => setMediaTitle(e.target.value)}
                    placeholder="e.g. Store Interior or New Stock Arrival"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Caption (optional)
                  </label>
                  <input
                    type="text"
                    value={mediaCaption}
                    onChange={(e) => setMediaCaption(e.target.value)}
                    placeholder="Short caption shown below media"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Website Placement
                  </label>
                  <select
                    value={mediaPlacement}
                    onChange={(e) => setMediaPlacement(e.target.value as 'gallery' | 'hero')}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="gallery">Storefront Showcase Gallery</option>
                    <option value="hero">Hero Banner Featured Visual</option>
                  </select>
                </div>
              </div>

              <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-[#DC2626] rounded-2xl p-8 bg-slate-50/70 transition-colors cursor-pointer text-center">
                <div className="flex items-center gap-3 mb-2">
                  <ImageIcon className="w-6 h-6 text-[#DC2626]" />
                  <Video className="w-6 h-6 text-[#0A1D3D]" />
                </div>
                <span className="font-display font-bold text-sm text-[#0A1D3D]">
                  {uploadingMedia
                    ? 'Uploading to website...'
                    : 'Click to upload Images (PNG, JPG, WebP) or Videos (MP4, WebM)'}
                </span>
                <span className="text-xs text-slate-500 mt-1">
                  Uploaded files appear immediately on the storefront
                </span>
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  disabled={uploadingMedia}
                  className="hidden"
                  onChange={(e) => void handleMediaFileUpload(e.target.files)}
                />
              </label>
            </section>

            {/* Gallery Heading Editor + Uploaded Items */}
            <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-display font-bold text-base text-[#0A1D3D]">
                  Published Images &amp; Videos ({draft.mediaGallery.length})
                </h3>
                <button
                  type="button"
                  onClick={() => persistDraft(draft, 'Gallery settings saved')}
                  className="inline-flex items-center gap-1.5 bg-[#0A1D3D] text-white text-xs font-semibold px-3.5 py-2 rounded-lg cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Section Labels</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={draft.mediaSection.heading}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      mediaSection: { ...draft.mediaSection, heading: e.target.value },
                    })
                  }
                  placeholder="Showcase section heading"
                  className="px-3 py-2 text-sm border border-slate-200 rounded-lg"
                />
                <input
                  type="text"
                  value={draft.mediaSection.subtitle}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      mediaSection: { ...draft.mediaSection, subtitle: e.target.value },
                    })
                  }
                  placeholder="Showcase section subtitle"
                  className="px-3 py-2 text-sm border border-slate-200 rounded-lg"
                />
              </div>

              {draft.mediaGallery.length === 0 ? (
                <p className="text-sm text-slate-500 py-8 text-center bg-slate-50 rounded-xl border border-slate-100">
                  No images or videos uploaded yet. Upload your first photo or video above.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {draft.mediaGallery.map((item) => (
                    <div
                      key={item.id}
                      className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 flex flex-col"
                    >
                      <div className="h-44 bg-slate-900 flex items-center justify-center overflow-hidden">
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
                            aria-label={`View full image: ${item.title}`}
                            className="w-full h-full block cursor-zoom-in group"
                          >
                            <img
                              src={item.url}
                              alt={item.title}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                            />
                          </button>
                        )}
                      </div>
                      <div className="p-3.5 space-y-2 flex-1 flex flex-col">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#DC2626]">
                            {item.type} · {item.placement === 'hero' ? 'Hero Banner' : 'Gallery'}
                          </span>
                        </div>
                        <p className="font-bold text-sm text-[#0A1D3D] truncate">{item.title}</p>
                        {item.caption && (
                          <p className="text-xs text-slate-600 line-clamp-2">{item.caption}</p>
                        )}
                        <div className="pt-2 mt-auto flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              void handleToggleMediaPlacement(
                                item.id,
                                item.placement === 'hero' ? 'gallery' : 'hero'
                              )
                            }
                            className="text-xs font-semibold text-[#0A1D3D] bg-white border border-slate-200 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg cursor-pointer"
                          >
                            {item.placement === 'hero' ? 'Move to Gallery' : 'Set as Hero Media'}
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDeleteMedia(item.id)}
                            className="text-xs font-semibold text-rose-600 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* TAB 4: SOCIAL MEDIA MANAGER */}
        {activeTab === 'socials' && (
          <div className="space-y-6">
            <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="font-display font-bold text-lg text-[#0A1D3D]">
                    Manage Social Media Accounts
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Add your Facebook, Instagram, and TikTok account links or usernames. Clicking the
                    icons in the website footer will open these accounts directly.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const normalizedConfig: SiteConfig = {
                      ...draft,
                      socials: {
                        facebook: formatSocialUrl('facebook', draft.socials.facebook),
                        instagram: formatSocialUrl('instagram', draft.socials.instagram),
                        tiktok: formatSocialUrl('tiktok', draft.socials.tiktok),
                      },
                    };
                    void persistDraft(
                      normalizedConfig,
                      'Social media links saved and published to the website'
                    );
                  }}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 bg-[#16A34A] hover:bg-[#15803D] disabled:opacity-60 text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Social Media Links'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Facebook Card */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-9 h-9 rounded-lg bg-[#1877F2] text-white flex items-center justify-center shrink-0">
                        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                          <path d="M13.5 22v-8h2.7l.4-3h-3.1V9.1c0-.9.3-1.5 1.6-1.5h1.6V4.9c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4.1V11H7.6v3h2.7v8h3.2z" />
                        </svg>
                      </span>
                      <div>
                        <h3 className="font-bold text-sm text-[#0A1D3D]">Facebook</h3>
                        <p className="text-[11px] text-slate-500">Page URL or username</p>
                      </div>
                    </div>
                    {draft.socials.facebook && (
                      <button
                        type="button"
                        onClick={() =>
                          setDraft({
                            ...draft,
                            socials: { ...draft.socials, facebook: '' },
                          })
                        }
                        className="text-[11px] font-semibold text-rose-600 hover:underline cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    value={draft.socials.facebook}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        socials: { ...draft.socials, facebook: e.target.value },
                      })
                    }
                    placeholder="https://www.facebook.com/yourpage"
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A1D3D]/15 focus:border-[#0A1D3D]"
                  />

                  <div className="mt-auto pt-2 flex items-center justify-between gap-2 text-xs">
                    <span className="text-slate-500 truncate">
                      {formatSocialUrl('facebook', draft.socials.facebook) || 'Not set'}
                    </span>
                    {formatSocialUrl('facebook', draft.socials.facebook) && (
                      <a
                        href={formatSocialUrl('facebook', draft.socials.facebook)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-semibold text-[#1877F2] hover:underline shrink-0"
                      >
                        <span>Test Link</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Instagram Card */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-9 h-9 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shrink-0">
                        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" rx="5" />
                          <circle cx="12" cy="12" r="4" />
                          <circle cx="17.5" cy="6.5" r="1" className="fill-current stroke-none" />
                        </svg>
                      </span>
                      <div>
                        <h3 className="font-bold text-sm text-[#0A1D3D]">Instagram</h3>
                        <p className="text-[11px] text-slate-500">Profile URL or @handle</p>
                      </div>
                    </div>
                    {draft.socials.instagram && (
                      <button
                        type="button"
                        onClick={() =>
                          setDraft({
                            ...draft,
                            socials: { ...draft.socials, instagram: '' },
                          })
                        }
                        className="text-[11px] font-semibold text-rose-600 hover:underline cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    value={draft.socials.instagram}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        socials: { ...draft.socials, instagram: e.target.value },
                      })
                    }
                    placeholder="https://www.instagram.com/yourhandle"
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A1D3D]/15 focus:border-[#0A1D3D]"
                  />

                  <div className="mt-auto pt-2 flex items-center justify-between gap-2 text-xs">
                    <span className="text-slate-500 truncate">
                      {formatSocialUrl('instagram', draft.socials.instagram) || 'Not set'}
                    </span>
                    {formatSocialUrl('instagram', draft.socials.instagram) && (
                      <a
                        href={formatSocialUrl('instagram', draft.socials.instagram)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-semibold text-rose-600 hover:underline shrink-0"
                      >
                        <span>Test Link</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>

                {/* TikTok Card */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-9 h-9 rounded-lg bg-[#0A1D3D] text-white flex items-center justify-center shrink-0">
                        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.2 8.2 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
                        </svg>
                      </span>
                      <div>
                        <h3 className="font-bold text-sm text-[#0A1D3D]">TikTok</h3>
                        <p className="text-[11px] text-slate-500">Account URL or @handle</p>
                      </div>
                    </div>
                    {draft.socials.tiktok && (
                      <button
                        type="button"
                        onClick={() =>
                          setDraft({
                            ...draft,
                            socials: { ...draft.socials, tiktok: '' },
                          })
                        }
                        className="text-[11px] font-semibold text-rose-600 hover:underline cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    value={draft.socials.tiktok}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        socials: { ...draft.socials, tiktok: e.target.value },
                      })
                    }
                    placeholder="https://www.tiktok.com/@yourhandle"
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A1D3D]/15 focus:border-[#0A1D3D]"
                  />

                  <div className="mt-auto pt-2 flex items-center justify-between gap-2 text-xs">
                    <span className="text-slate-500 truncate">
                      {formatSocialUrl('tiktok', draft.socials.tiktok) || 'Not set'}
                    </span>
                    {formatSocialUrl('tiktok', draft.socials.tiktok) && (
                      <a
                        href={formatSocialUrl('tiktok', draft.socials.tiktok)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-semibold text-[#0A1D3D] hover:underline shrink-0"
                      >
                        <span>Test Link</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* TAB 5: PASSWORDS & MANAGER SETTINGS */}
        {activeTab === 'security' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Change Admin Password */}
            <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <div>
                <h2 className="font-display font-bold text-lg text-[#0A1D3D]">
                  Change Admin Password
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update the main Administrator password for /#Admin.
                </p>
              </div>

              {session.role !== 'admin' ? (
                <p className="text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-4">
                  You are signed in as a Manager. Only the primary Administrator can change the
                  Admin password.
                </p>
              ) : (
                <form onSubmit={handleChangeAdminPassword} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Current Admin Password
                    </label>
                    <input
                      type="password"
                      required
                      value={currentAdminPwd}
                      onChange={(e) => setCurrentAdminPwd(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      New Admin Password (min 6 characters)
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={newAdminPwd}
                      onChange={(e) => setNewAdminPwd(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Confirm New Admin Password
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={confirmAdminPwd}
                      onChange={(e) => setConfirmAdminPwd(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={pwdUpdating}
                    className="bg-[#0A1D3D] hover:bg-[#122D5C] disabled:opacity-60 text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-lg cursor-pointer"
                  >
                    {pwdUpdating ? 'Updating...' : 'Update Admin Password'}
                  </button>
                </form>
              )}
            </section>

            {/* Assign Manager Password */}
            <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <div>
                <h2 className="font-display font-bold text-lg text-[#0A1D3D]">
                  Assign Manager Password
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Grant a Store Manager login access to manage products, write-ups, and media
                  uploads without Admin password privileges.
                </p>
              </div>

              {session.role !== 'admin' ? (
                <p className="text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-4">
                  Only the Administrator can assign or revoke Manager credentials.
                </p>
              ) : (
                <form onSubmit={handleSaveManagerSettings} className="space-y-4">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={managerEnabled}
                      onChange={(e) => setManagerEnabled(e.target.checked)}
                      className="w-4 h-4 accent-[#DC2626]"
                    />
                    <span className="text-sm font-semibold text-[#0A1D3D]">
                      Enable Manager Login Access
                    </span>
                  </label>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Manager Label / Name
                    </label>
                    <input
                      type="text"
                      value={managerName}
                      onChange={(e) => setManagerName(e.target.value)}
                      placeholder="e.g. Store Manager"
                      className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Assign / Update Manager Password (min 6 characters)
                    </label>
                    <input
                      type="password"
                      value={managerPassword}
                      onChange={(e) => setManagerPassword(e.target.value)}
                      placeholder="Enter new Manager password"
                      className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Leave blank to keep the existing Manager password when updating the name or
                      toggle.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={managerSaving}
                    className="bg-[#DC2626] hover:bg-[#B91C1C] disabled:opacity-60 text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-lg cursor-pointer"
                  >
                    {managerSaving ? 'Saving...' : 'Save Manager Access'}
                  </button>
                </form>
              )}
            </section>
          </div>
        )}
      </main>
      <ImageLightbox image={lightboxImage} onClose={() => setLightboxImage(null)} />
    </div>
  );
};
