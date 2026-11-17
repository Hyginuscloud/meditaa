import React, { useState } from 'react';
import { MapPin, Clock, ShoppingCart, Menu, X, Phone, Mail } from 'lucide-react';
import { SiteConfig } from '../data/siteConfig';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  config: SiteConfig;
}

const NAV_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'Categories', href: '#categories' },
  { label: 'Our Products', href: '#products' },
  { label: 'Our Services', href: '#services' },
  { label: 'Our Story', href: '#story' },
  { label: 'Reviews', href: '#reviews' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Contact', href: '#contact' },
];

export const Navbar: React.FC<NavbarProps> = ({ cartCount, onOpenCart, config }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full shadow-xs">
      {/* Top Utility Bar */}
      <div className="bg-[#071630] text-slate-200 text-[11px] sm:text-xs border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-9 py-1.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span className="truncate">{config.topBar.address}</span>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            {config.topBar.phone && (
              <a
                href={`tel:${config.topBar.phone.replace(/\s+/g, '')}`}
                className="hidden md:inline-flex items-center gap-1.5 text-slate-200 hover:text-amber-300 transition-colors whitespace-nowrap"
              >
                <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>{config.topBar.phone}</span>
              </a>
            )}
            {config.topBar.email && (
              <a
                href={`mailto:${config.topBar.email}`}
                className="hidden lg:inline-flex items-center gap-1.5 text-slate-200 hover:text-amber-300 transition-colors whitespace-nowrap"
              >
                <Mail className="w-3 h-3 text-sky-400 shrink-0" />
                <span>{config.topBar.email}</span>
              </a>
            )}
            <div className="hidden sm:flex items-center gap-1.5 whitespace-nowrap">
              <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{config.topBar.hours}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          {/* Brand Logo */}
          <a href="#home" className="flex items-center gap-2.5 shrink-0 min-w-0">
            {config.brand.logoUrl ? (
              <img
                src={config.brand.logoUrl}
                alt={config.brand.name}
                referrerPolicy="no-referrer"
                className="w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0"
              />
            ) : (
              <span className="w-9 h-9 rounded-lg bg-[#DC2626] flex items-center justify-center shadow-xs shrink-0">
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor">
                  <path d="M9.5 4h5v5.5H20v5h-5.5V20h-5v-5.5H4v-5h5.5V4z" />
                </svg>
              </span>
            )}
            <span className="flex flex-col leading-none min-w-0">
              <span className="font-bold text-[#0A1D3D] text-sm sm:text-base lg:text-lg tracking-tight whitespace-nowrap truncate">
                {config.brand.name}
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold tracking-[0.12em] text-[#DC2626] uppercase mt-0.5 whitespace-nowrap truncate">
                {config.brand.tagline}
              </span>
            </span>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-6" aria-label="Primary navigation">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-slate-700 hover:text-[#DC2626] transition-colors whitespace-nowrap shrink-0"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Compact Nav for lg screens */}
          <nav className="hidden lg:flex xl:hidden items-center gap-3.5" aria-label="Primary navigation">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-xs font-medium text-slate-700 hover:text-[#DC2626] transition-colors whitespace-nowrap shrink-0"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right Cart Action & Mobile Toggle */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onOpenCart}
              className="inline-flex items-center gap-2 bg-[#0A1D3D] hover:bg-[#122D5C] text-white text-xs sm:text-sm font-semibold px-3.5 sm:px-4 py-2 rounded-lg shadow-xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0"
              aria-label={`Open shopping cart with ${cartCount} items`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Cart</span>
              <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-[#DC2626] text-white text-xs font-bold tabular-nums">
                {cartCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="lg:hidden inline-flex items-center justify-center p-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile & Tablet Dropdown Navigation */}
        {mobileMenuOpen && (
          <nav
            className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 grid grid-cols-2 sm:grid-cols-4 gap-2"
            aria-label="Mobile navigation"
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-[#DC2626] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
};
