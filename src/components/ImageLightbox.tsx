import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { EditableProduct } from '../data/siteConfig';
import { ProductIcon } from './ProductBottleArt';
import { formatNaira } from './CartDrawer';

export type LightboxImage =
  | {
      kind?: 'image';
      url: string;
      title?: string;
      caption?: string;
    }
  | {
      kind: 'product';
      product: EditableProduct;
    };

interface ImageLightboxProps {
  image: LightboxImage | null;
  onClose: () => void;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({ image, onClose }) => {
  useEffect(() => {
    if (!image) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [image, onClose]);

  if (!image) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xs flex flex-col items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={image.kind === 'product' ? image.product.name : image.title || 'Full image view'}
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close full image view"
        className="fixed top-4 right-4 z-50 w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors cursor-pointer"
      >
        <X className="w-5 h-5" />
      </button>

      <div
        className="relative flex flex-col items-center max-w-[94vw] max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {image.kind === 'product' ? (
          <>
            {image.product.imageUrl ? (
              <img
                src={image.product.imageUrl}
                alt={image.product.name}
                referrerPolicy="no-referrer"
                className="max-w-full max-h-[75vh] w-auto h-auto object-contain rounded-2xl shadow-2xl bg-white"
              />
            ) : (
              <div className="bg-[#F1F5F9] rounded-3xl p-10 sm:p-14 shadow-2xl flex flex-col items-center justify-center border border-white/20">
                <div className="w-24 h-6 bg-[#DC2626] rounded-t-xl shadow-sm" />
                <div className="w-52 sm:w-64 bg-white rounded-3xl border border-slate-200 shadow-xl px-6 py-8 flex flex-col items-center">
                  <div
                    className="w-28 h-28 rounded-full flex items-center justify-center border border-slate-200 shadow-inner"
                    style={{ backgroundColor: image.product.badgeColor }}
                  >
                    <ProductIcon iconKey={image.product.iconKey} className="w-16 h-16" />
                  </div>
                  <span className="mt-5 text-base sm:text-lg font-extrabold text-[#0A1D3D] text-center leading-tight">
                    {image.product.name}
                  </span>
                  <span className="mt-1.5 text-[10px] font-bold tracking-[0.16em] uppercase text-[#DC2626] text-center">
                    CARE YOU CAN COUNT ON
                  </span>
                </div>
              </div>
            )}

            <div className="mt-4 text-center max-w-xl px-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400">
                {image.product.category}
              </span>
              <p className="font-bold text-white text-base sm:text-lg mt-0.5">
                {image.product.name} · {formatNaira(image.product.price)} / {image.product.unit}
              </p>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">{image.product.description}</p>
            </div>
          </>
        ) : (
          <>
            <img
              src={image.url}
              alt={image.title || 'Full size preview'}
              referrerPolicy="no-referrer"
              className="max-w-full max-h-[82vh] w-auto h-auto object-contain rounded-xl shadow-2xl"
            />
            {(image.title || image.caption) && (
              <div className="mt-3 text-center max-w-xl px-4">
                {image.title && (
                  <p className="font-bold text-white text-sm sm:text-base">{image.title}</p>
                )}
                {image.caption && (
                  <p className="text-xs sm:text-sm text-slate-300 mt-0.5">{image.caption}</p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
