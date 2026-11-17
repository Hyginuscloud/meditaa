import React from 'react';
import { ArrowUpRight, ShoppingCart, Check, Heart, ShoppingBag } from 'lucide-react';
import { SiteConfig } from '../data/siteConfig';

interface HeroProps {
  onOpenCart: () => void;
  config: SiteConfig;
  onImageClick?: (url: string, title?: string, caption?: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenCart, config, onImageClick }) => {
  const { hero } = config;
  const heroMedia = config.mediaGallery.find((m) => m.placement === 'hero');

  return (
    <section
      id="home"
      className="relative overflow-hidden bg-gradient-to-br from-[#071630] via-[#0B2147] to-[#0E2B5C] text-white"
    >
      <div
        className="pointer-events-none absolute -top-24 -right-24 w-[540px] h-[540px] rounded-full bg-sky-400/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Content Column */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-6 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-3">
              <span className="w-7 h-0.5 bg-amber-400 inline-block" aria-hidden="true" />
              <span className="text-[11px] sm:text-xs font-bold tracking-[0.16em] uppercase text-amber-300">
                {hero.eyebrow}
              </span>
            </div>

            <h1 className="font-extrabold tracking-tight leading-[1.08] text-3xl sm:text-5xl lg:text-[3.5rem] max-w-xl mx-auto lg:mx-0 text-balance">
              <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-rose-400 bg-clip-text text-transparent">
                {hero.headline}
              </span>
            </h1>

            <p className="text-slate-200/90 text-sm sm:text-base lg:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">
              {hero.subtitle}
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3.5 pt-1">
              <a
                href="#products"
                className="inline-flex items-center justify-center gap-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-semibold text-sm px-6 py-3.5 rounded-xl shadow-md hover:shadow-xl hover:shadow-rose-950/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 whitespace-nowrap shrink-0"
              >
                <span>{hero.primaryCta}</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>

              <button
                type="button"
                onClick={onOpenCart}
                className="inline-flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-[#071630] font-bold text-sm px-6 py-3.5 rounded-xl shadow-md hover:shadow-xl hover:shadow-amber-950/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0"
              >
                <span>{hero.secondaryCta}</span>
                <ShoppingCart className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 pt-2 text-xs sm:text-sm font-medium text-slate-200">
              {hero.trustPoints.map((point) => (
                <span key={point} className="inline-flex items-center gap-1.5">
                  <span>{point}</span>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                </span>
              ))}
            </div>
          </div>

          {/* Right Concentric Visual Column */}
          <div className="lg:col-span-5 flex items-center justify-center">
            {heroMedia ? (
              <div className="relative w-full max-w-md rounded-2xl overflow-hidden border border-white/15 shadow-2xl bg-[#071630]">
                {heroMedia.type === 'video' ? (
                  <video
                    src={heroMedia.url}
                    controls
                    playsInline
                    className="w-full h-64 sm:h-80 object-cover"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      onImageClick?.(heroMedia.url, heroMedia.title || hero.headline, heroMedia.caption)
                    }
                    className="block w-full cursor-zoom-in group"
                    aria-label="View full hero image"
                  >
                    <img
                      src={heroMedia.url}
                      alt={heroMedia.title || hero.headline}
                      referrerPolicy="no-referrer"
                      className="w-full h-64 sm:h-80 object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                    />
                  </button>
                )}
                {(heroMedia.title || heroMedia.caption) && (
                  <div className="px-4 py-3 bg-[#071630]/90 border-t border-white/10">
                    {heroMedia.title && (
                      <p className="text-sm font-bold text-white">{heroMedia.title}</p>
                    )}
                    {heroMedia.caption && (
                      <p className="text-xs text-slate-300 mt-0.5">{heroMedia.caption}</p>
                    )}
                  </div>
                )}
              </div>
            ) : hero.heroImageUrl ? (
              <button
                type="button"
                onClick={() => onImageClick?.(hero.heroImageUrl, hero.headline, hero.subtitle)}
                className="relative w-full max-w-md rounded-2xl overflow-hidden border border-white/15 shadow-2xl bg-white/5 cursor-zoom-in group block"
                aria-label="View full hero image"
              >
                <img
                  src={hero.heroImageUrl}
                  alt={hero.headline}
                  referrerPolicy="no-referrer"
                  className="w-full h-64 sm:h-80 object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                />
              </button>
            ) : (
              <div className="relative w-64 h-64 sm:w-84 sm:h-84 flex items-center justify-center">
                <div
                  className="absolute inset-0 rounded-full border border-white/10"
                  aria-hidden="true"
                />
                <div
                  className="absolute inset-6 rounded-full border border-white/15 bg-white/[0.02]"
                  aria-hidden="true"
                />
                <div
                  className="absolute inset-14 rounded-full border border-white/15 bg-white/[0.03]"
                  aria-hidden="true"
                />

                <div className="absolute top-4 left-0 sm:-left-3 z-20 bg-white text-[#0A1D3D] px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl shadow-lg flex items-center gap-2 text-[11px] sm:text-xs font-bold whitespace-nowrap">
                  <Heart className="w-3.5 h-3.5 text-[#DC2626] fill-[#DC2626]" />
                  <span>{hero.badgeTop}</span>
                </div>

                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-14 sm:w-16 h-3.5 sm:h-4 bg-[#DC2626] rounded-t-lg shadow-sm" />
                  <div className="w-32 sm:w-40 bg-white text-[#0A1D3D] rounded-2xl shadow-2xl px-4 py-4 sm:py-5 flex flex-col items-center border border-slate-100">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center mb-2.5 sm:mb-3">
                      <svg viewBox="0 0 24 24" className="w-8 h-8 sm:w-9 sm:h-9 text-[#0A1D3D]" fill="currentColor">
                        <path d="M9.5 4h5v5.5H20v5h-5.5V20h-5v-5.5H4v-5h5.5V4z" />
                      </svg>
                    </div>
                    <span className="font-extrabold text-xs sm:text-sm tracking-wide text-[#0A1D3D]">
                      {hero.emblemTitle}
                    </span>
                    <span className="text-[7px] sm:text-[8px] font-bold tracking-[0.14em] uppercase text-[#DC2626] mt-0.5 text-center">
                      {hero.emblemSubtitle}
                    </span>
                  </div>
                </div>

                <div className="absolute bottom-5 right-0 sm:-right-2 z-20 bg-white text-[#0A1D3D] px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl shadow-lg flex items-center gap-2 text-[11px] sm:text-xs font-bold whitespace-nowrap">
                  <ShoppingBag className="w-3.5 h-3.5 text-amber-500" />
                  <span>{hero.badgeBottom}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
