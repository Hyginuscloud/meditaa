import React, { useState } from 'react';
import { Maximize2 } from 'lucide-react';
import { EditableProduct } from '../data/siteConfig';
import { Product } from '../data/products';

interface ProductBottleArtProps {
  product: EditableProduct;
  onImageClick?: (product: EditableProduct) => void;
}

export function ProductIcon({
  iconKey,
  className = 'w-7 h-7',
}: {
  iconKey: Product['iconKey'];
  className?: string;
}) {
  switch (iconKey) {
    case 'tablets':
      return (
        <svg viewBox="0 0 36 36" className={className} fill="none">
          <rect x="6" y="13" width="16" height="8" rx="4" transform="rotate(-30 14 17)" fill="#E11D48" stroke="#0F172A" strokeWidth="1.5" />
          <path d="M13.5 13.5L18.5 21.5" stroke="#FFF" strokeWidth="1.5" />
          <circle cx="25" cy="23" r="5" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.5" />
          <path d="M22 23H28" stroke="#94A3B8" strokeWidth="1.3" />
        </svg>
      );
    case 'citrus':
      return (
        <svg viewBox="0 0 36 36" className={className} fill="none">
          <circle cx="18" cy="19" r="9.5" fill="#F97316" stroke="#0F172A" strokeWidth="1.5" />
          <circle cx="18" cy="19" r="6.5" fill="#FDBA74" />
          <path d="M18 9.5C18 7 21 5.5 23 6.5C22.5 8.5 20.5 9.5 18 9.5Z" fill="#16A34A" stroke="#0F172A" strokeWidth="1.2" />
        </svg>
      );
    case 'droplet':
    case 'lubricant':
      return (
        <svg viewBox="0 0 36 36" className={className} fill="none">
          <path
            d="M18 6C18 6 10 15.5 10 21.5C10 26 13.6 29.5 18 29.5C22.4 29.5 26 26 26 21.5C26 15.5 18 6 18 6Z"
            fill="#0EA5E9"
            stroke="#0F172A"
            strokeWidth="1.5"
          />
          <path d="M14.5 21.5C14.5 23.5 15.8 25 17.5 25.5" stroke="#E0F2FE" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case 'antiseptic':
      return (
        <svg viewBox="0 0 36 36" className={className} fill="none">
          <rect x="13" y="6" width="10" height="4" rx="1" fill="#DC2626" stroke="#0F172A" strokeWidth="1.4" />
          <rect x="10" y="10" width="16" height="19" rx="3" fill="#B45309" stroke="#0F172A" strokeWidth="1.5" />
          <rect x="13" y="14" width="10" height="10" rx="1.5" fill="#FEF3C7" />
          <path d="M18 16.5V21.5M15.5 19H20.5" stroke="#DC2626" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case 'plaster':
      return (
        <svg viewBox="0 0 36 36" className={className} fill="none">
          <rect x="7" y="13" width="22" height="10" rx="5" transform="rotate(-35 18 18)" fill="#FDBA74" stroke="#0F172A" strokeWidth="1.5" />
          <rect x="14" y="14.5" width="8" height="7" rx="1" transform="rotate(-35 18 18)" fill="#FFF7ED" stroke="#9A3412" strokeWidth="1" />
        </svg>
      );
    case 'thermometer':
      return (
        <svg viewBox="0 0 36 36" className={className} fill="none">
          <path d="M15 8C15 6.3 16.3 5 18 5C19.7 5 21 6.3 21 8V20.5C22.8 21.6 24 23.6 24 25.8C24 29.2 21.3 32 18 32C14.7 32 12 29.2 12 25.8C12 23.6 13.2 21.6 15 20.5V8Z" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.5" />
          <circle cx="18" cy="25.8" r="3.2" fill="#EF4444" />
          <path d="M18 13V24" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'lotion':
    case 'babylotion':
      return (
        <svg viewBox="0 0 36 36" className={className} fill="none">
          <path d="M15 7H22M18 7V11" stroke="#0F172A" strokeWidth="1.6" strokeLinecap="round" />
          <rect x="12" y="11" width="12" height="18" rx="3" fill="#FDE68A" stroke="#0F172A" strokeWidth="1.5" />
          <rect x="14.5" y="16" width="7" height="7" rx="1.5" fill="#FFFFFF" />
        </svg>
      );
    case 'haircream':
    case 'jelly':
      return (
        <svg viewBox="0 0 36 36" className={className} fill="none">
          <rect x="9" y="10" width="18" height="5" rx="1.5" fill="#0F172A" />
          <rect x="10" y="15" width="16" height="13" rx="2.5" fill="#BAE6FD" stroke="#0F172A" strokeWidth="1.5" />
          <rect x="13" y="18" width="10" height="6" rx="1" fill="#FFFFFF" />
        </svg>
      );
    case 'soap':
      return (
        <svg viewBox="0 0 36 36" className={className} fill="none">
          <rect x="7" y="13" width="22" height="12" rx="6" fill="#5EEAD4" stroke="#0F172A" strokeWidth="1.5" />
          <circle cx="13" cy="10" r="2.2" fill="#E0F2FE" stroke="#0F172A" strokeWidth="1.1" />
          <circle cx="24" cy="9" r="1.7" fill="#E0F2FE" stroke="#0F172A" strokeWidth="1.1" />
        </svg>
      );
    case 'toothpaste':
      return (
        <svg viewBox="0 0 36 36" className={className} fill="none">
          <path d="M10 17L15 8H21L26 17V29H10V17Z" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.5" />
          <rect x="14" y="6" width="8" height="3" rx="1" fill="#DC2626" stroke="#0F172A" strokeWidth="1.2" />
          <path d="M13 20H23" stroke="#0EA5E9" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    case 'shampoo':
      return (
        <svg viewBox="0 0 36 36" className={className} fill="none">
          <rect x="14" y="6" width="8" height="4" rx="1" fill="#7C3AED" stroke="#0F172A" strokeWidth="1.4" />
          <path d="M12 11H24L25 29H11L12 11Z" fill="#C4B5FD" stroke="#0F172A" strokeWidth="1.5" />
          <rect x="14" y="16" width="8" height="7" rx="1" fill="#FFFFFF" />
        </svg>
      );
    case 'diapers':
      return (
        <svg viewBox="0 0 36 36" className={className} fill="none">
          <path d="M8 11H28V18C28 24 23 28 18 28C13 28 8 24 8 18V11Z" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.5" />
          <path d="M8 15H13M23 15H28" stroke="#38BDF8" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="18" cy="20" r="2.2" fill="#FBBF24" />
        </svg>
      );
    case 'wipes':
      return (
        <svg viewBox="0 0 36 36" className={className} fill="none">
          <rect x="7" y="13" width="22" height="14" rx="3" fill="#BAE6FD" stroke="#0F172A" strokeWidth="1.5" />
          <rect x="13" y="11" width="10" height="4" rx="1.5" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.2" />
          <path d="M14 21H22" stroke="#0284C7" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case 'powder':
      return (
        <svg viewBox="0 0 36 36" className={className} fill="none">
          <rect x="13" y="6" width="10" height="4" rx="1.5" fill="#38BDF8" stroke="#0F172A" strokeWidth="1.4" />
          <rect x="11" y="10" width="14" height="19" rx="3" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.5" />
          <circle cx="18" cy="19" r="3.5" fill="#E0F2FE" />
        </svg>
      );
    case 'bread':
      return (
        <svg viewBox="0 0 36 36" className={className} fill="none">
          <path d="M9 15C9 10.5 13 8 18 8C23 8 27 10.5 27 15V26C27 27.1 26.1 28 25 28H11C9.9 28 9 27.1 9 26V15Z" fill="#F59E0B" stroke="#0F172A" strokeWidth="1.5" />
          <path d="M12 16C12 13 14.5 11.5 18 11.5C21.5 11.5 24 13 24 16V25H12V16Z" fill="#FEF3C7" />
        </svg>
      );
    case 'honey':
      return (
        <svg viewBox="0 0 36 36" className={className} fill="none">
          <rect x="13" y="7" width="10" height="4" rx="1" fill="#78350F" stroke="#0F172A" strokeWidth="1.4" />
          <rect x="10" y="11" width="16" height="17" rx="4" fill="#F59E0B" stroke="#0F172A" strokeWidth="1.5" />
          <rect x="13" y="16" width="10" height="7" rx="1" fill="#FEF3C7" />
        </svg>
      );
    case 'biscuits':
      return (
        <svg viewBox="0 0 36 36" className={className} fill="none">
          <circle cx="18" cy="18" r="9.5" fill="#D97706" stroke="#0F172A" strokeWidth="1.5" />
          <circle cx="15" cy="15" r="1.2" fill="#451A03" />
          <circle cx="21" cy="16" r="1.2" fill="#451A03" />
          <circle cx="17" cy="21" r="1.2" fill="#451A03" />
          <circle cx="21" cy="21" r="1" fill="#451A03" />
        </svg>
      );
    case 'cereal':
      return (
        <svg viewBox="0 0 36 36" className={className} fill="none">
          <rect x="10" y="7" width="16" height="22" rx="2" fill="#EF4444" stroke="#0F172A" strokeWidth="1.5" />
          <circle cx="18" cy="18" r="5" fill="#FDE047" stroke="#0F172A" strokeWidth="1.2" />
        </svg>
      );
    case 'noodles':
      return (
        <svg viewBox="0 0 36 36" className={className} fill="none">
          <rect x="8" y="10" width="20" height="16" rx="2.5" fill="#FACC15" stroke="#0F172A" strokeWidth="1.5" />
          <path d="M12 16C14 14 16 18 18 16C20 14 22 18 24 16" stroke="#DC2626" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M12 20C14 18 16 22 18 20C20 18 22 22 24 20" stroke="#DC2626" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case 'sugar':
      return (
        <svg viewBox="0 0 36 36" className={className} fill="none">
          <rect x="9" y="10" width="18" height="18" rx="3" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.5" />
          <rect x="12" y="15" width="12" height="8" rx="1" fill="#DBEAFE" />
          <path d="M15 19H21" stroke="#1D4ED8" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case 'dishwash':
      return (
        <svg viewBox="0 0 36 36" className={className} fill="none">
          <rect x="15" y="6" width="6" height="4" rx="1" fill="#FACC15" stroke="#0F172A" strokeWidth="1.4" />
          <path d="M12 10H24L25 29H11L12 10Z" fill="#22C55E" stroke="#0F172A" strokeWidth="1.5" />
          <circle cx="18" cy="20" r="3.5" fill="#DCFCE7" />
        </svg>
      );
    case 'detergent':
      return (
        <svg viewBox="0 0 36 36" className={className} fill="none">
          <rect x="9" y="9" width="18" height="20" rx="2.5" fill="#3B82F6" stroke="#0F172A" strokeWidth="1.5" />
          <circle cx="18" cy="19" r="5" fill="#FFFFFF" />
          <circle cx="18" cy="19" r="2.2" fill="#FACC15" />
        </svg>
      );
    case 'tissue':
      return (
        <svg viewBox="0 0 36 36" className={className} fill="none">
          <ellipse cx="18" cy="12" rx="8" ry="3.5" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.5" />
          <path d="M10 12V25C10 26.9 13.6 28.5 18 28.5C22.4 28.5 26 26.9 26 25V12" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.5" />
          <ellipse cx="18" cy="12" rx="2.5" ry="1.2" fill="#94A3B8" />
        </svg>
      );
    case 'bleach':
      return (
        <svg viewBox="0 0 36 36" className={className} fill="none">
          <rect x="14" y="6" width="8" height="4" rx="1" fill="#DC2626" stroke="#0F172A" strokeWidth="1.4" />
          <path d="M11 10H25V29H11V10Z" fill="#E0F2FE" stroke="#0F172A" strokeWidth="1.5" />
          <rect x="14" y="15" width="8" height="8" rx="1" fill="#0284C7" />
        </svg>
      );
    case 'condoms':
      return (
        <svg viewBox="0 0 36 36" className={className} fill="none">
          <rect x="10" y="9" width="16" height="18" rx="2" fill="#FB7185" stroke="#0F172A" strokeWidth="1.5" />
          <circle cx="18" cy="18" r="4.5" fill="#FFFFFF" />
          <path d="M16 18L17.5 19.5L20.5 16.5" stroke="#E11D48" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
  }
}

export const ProductBottleArt: React.FC<ProductBottleArtProps> = ({
  product,
  onImageClick,
}) => {
  const [imgError, setImgError] = useState(false);

  if (product.imageUrl && !imgError) {
    return (
      <button
        type="button"
        onClick={() => onImageClick?.(product)}
        aria-label={`View full image of ${product.name}`}
        className={`relative bg-[#F1F5F9] rounded-xl h-44 w-full overflow-hidden border border-slate-100 block text-left ${
          onImageClick ? 'cursor-zoom-in group' : ''
        }`}
      >
        <img
          src={product.imageUrl}
          alt={product.name}
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
        />
        {onImageClick && (
          <span className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Maximize2 className="w-3.5 h-3.5" />
          </span>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onImageClick?.(product)}
      aria-label={`View full image of ${product.name}`}
      className={`relative flex flex-col items-center justify-center bg-[#F1F5F9] rounded-xl h-44 w-full px-4 py-3 overflow-hidden border border-slate-100 ${
        onImageClick ? 'cursor-zoom-in group' : ''
      }`}
    >
      {onImageClick && (
        <span className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-[#0A1D3D]/10 text-[#0A1D3D] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Maximize2 className="w-3.5 h-3.5" />
        </span>
      )}
      <div className="relative flex flex-col items-center transition-transform duration-200 group-hover:scale-105">
        <div className="w-12 h-3 bg-[#DC2626] rounded-t-md shadow-xs" />
        <div className="w-24 bg-white rounded-xl border border-slate-200/90 shadow-sm px-2 pt-2.5 pb-2 flex flex-col items-center">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center border border-slate-200/80 shadow-inner"
            style={{ backgroundColor: product.badgeColor }}
          >
            <ProductIcon iconKey={product.iconKey} />
          </div>
          <span className="mt-2 text-[9px] font-bold text-[#0A1D3D] text-center leading-tight line-clamp-1">
            {product.name}
          </span>
          <span className="mt-0.5 text-[6px] font-bold tracking-wider uppercase text-[#DC2626] text-center">
            CARE YOU CAN COUNT ON
          </span>
        </div>
      </div>
    </button>
  );
};
