import React, { useState } from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, MessageCircle, Copy, Check } from 'lucide-react';
import { EditableProduct } from '../data/siteConfig';

export interface CartItem {
  product: EditableProduct;
  quantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQty: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  whatsappNumber: string;
  whatsappDisplay: string;
  brandName: string;
}

export const formatNaira = (amount: number): string => {
  return `₦${amount.toLocaleString('en-NG')}`;
};

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  whatsappNumber,
  whatsappDisplay,
  brandName,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [deliveryArea, setDeliveryArea] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const buildOrderMessage = () => {
    const lines = [
      `Hello ${brandName} (Owerri),`,
      '',
      'I would like to confirm availability and order:',
      ...items.map(
        (item, idx) =>
          `${idx + 1}. ${item.product.name} (${item.product.unit}) × ${item.quantity} — ${formatNaira(
            item.product.price * item.quantity
          )}`
      ),
      '',
      `Estimated Subtotal: ${formatNaira(subtotal)}`,
    ];
    if (customerName.trim()) {
      lines.push(`Name: ${customerName.trim()}`);
    }
    if (deliveryArea.trim()) {
      lines.push(`Pickup / Delivery Note: ${deliveryArea.trim()}`);
    }
    lines.push('', 'Please confirm current stock and final total.');
    return lines.join('\n');
  };

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(buildOrderMessage())}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(buildOrderMessage());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore clipboard failure
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[#071630]/55 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label="Your Shopping Cart"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative z-10 w-full max-w-md bg-white h-full shadow-2xl flex flex-col">
        {/* Drawer Header */}
        <div className="px-6 py-4 bg-[#071630] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="font-display font-bold text-base">Your Shopping Cart</h2>
              <p className="text-xs text-slate-300 tabular-nums">
                {totalCount} {totalCount === 1 ? 'item' : 'items'} · {whatsappDisplay}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <ShoppingBag className="w-7 h-7 text-slate-400" />
              </div>
              <p className="font-display font-bold text-slate-900 text-base">Your cart is empty</p>
              <p className="text-sm text-slate-500 mt-1 max-w-xs">
                Add medicines, personal care, baby essentials, or provisions from the store menu to
                send your list on WhatsApp.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-5 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-sm font-semibold px-5 py-2.5 rounded-lg cursor-pointer transition-colors"
              >
                Browse Products
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Selected Essentials
                </span>
                <button
                  type="button"
                  onClick={onClearCart}
                  className="text-xs font-medium text-rose-600 hover:text-rose-700 cursor-pointer"
                >
                  Clear all
                </button>
              </div>

              <ul className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {items.map(({ product, quantity }) => (
                  <li key={product.id} className="p-4 bg-white flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#DC2626]">
                        {product.category}
                      </p>
                      <h3 className="font-semibold text-sm text-[#0A1D3D] truncate">
                        {product.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
                        {formatNaira(product.price)} / {product.unit}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className="font-bold text-sm text-[#0A1D3D] tabular-nums">
                        {formatNaira(product.price * quantity)}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <div className="inline-flex items-center border border-slate-200 rounded-lg bg-slate-50">
                          <button
                            type="button"
                            onClick={() => onUpdateQty(product.id, -1)}
                            className="p-1.5 text-slate-700 hover:text-[#0A1D3D] cursor-pointer"
                            aria-label={`Decrease ${product.name} quantity`}
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2 text-xs font-bold text-[#0A1D3D] tabular-nums">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQty(product.id, 1)}
                            className="p-1.5 text-slate-700 hover:text-[#0A1D3D] cursor-pointer"
                            aria-label={`Increase ${product.name} quantity`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(product.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer"
                          aria-label={`Remove ${product.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="space-y-3 pt-2">
                <div>
                  <label htmlFor="cart-name" className="block text-xs font-semibold text-slate-700 mb-1">
                    Your Name (optional)
                  </label>
                  <input
                    id="cart-name"
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Chinedu Okafor"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A1D3D]/20 focus:border-[#0A1D3D]"
                  />
                </div>
                <div>
                  <label htmlFor="cart-note" className="block text-xs font-semibold text-slate-700 mb-1">
                    Pickup or Owerri Delivery Location (optional)
                  </label>
                  <input
                    id="cart-note"
                    type="text"
                    value={deliveryArea}
                    onChange={(e) => setDeliveryArea(e.target.value)}
                    placeholder="e.g. Store pickup or Orji Flyover area"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A1D3D]/20 focus:border-[#0A1D3D]"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Drawer Footer */}
        {items.length > 0 && (
          <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600">Estimated Subtotal</span>
              <span className="text-lg font-extrabold text-[#0A1D3D] tabular-nums">
                {formatNaira(subtotal)}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Confirm current stock and final price with our team on WhatsApp before payment.
            </p>
            <div className="grid grid-cols-1 gap-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold text-sm py-3 px-4 rounded-lg transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Send Order via WhatsApp</span>
              </a>
              <button
                type="button"
                onClick={handleCopy}
                className="w-full inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-medium text-xs py-2.5 px-4 rounded-lg transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Shopping list copied' : 'Copy Shopping List'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
