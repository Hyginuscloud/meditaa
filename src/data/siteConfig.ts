import {
  CATEGORIES,
  CategoryInfo,
  COMMITMENTS,
  FAQS,
  PRODUCTS,
  Product,
  SERVICES,
  STORE_ADDRESS,
  STORE_HOURS_TOP,
  WHATSAPP_DISPLAY,
  WHATSAPP_NUMBER,
} from './products.ts';

export interface EditableProduct extends Product {
  imageUrl?: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
}

export interface StoryPillar {
  id: string;
  title: string;
  description: string;
}

export interface CommitmentItem {
  id: string;
  label: string;
  headline: string;
  detail: string;
}

export interface FaqItem {
  id: string;
  q: string;
  a: string;
}

export interface MediaGalleryItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  title: string;
  caption: string;
  placement: 'gallery' | 'hero';
  createdAt: string;
}

export interface SiteConfig {
  brand: {
    name: string;
    tagline: string;
    logoUrl: string;
  };
  topBar: {
    address: string;
    hours: string;
    whatsappNumber: string;
    whatsappDisplay: string;
    phone: string;
    email: string;
  };
  socials: {
    facebook: string;
    instagram: string;
    tiktok: string;
  };
  hero: {
    eyebrow: string;
    headline: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
    trustPoints: [string, string, string];
    badgeTop: string;
    badgeBottom: string;
    emblemTitle: string;
    emblemSubtitle: string;
    heroImageUrl: string;
  };
  categoriesSection: {
    eyebrow: string;
    heading: string;
    subtitle: string;
  };
  categories: CategoryInfo[];
  productsSection: {
    eyebrow: string;
    heading: string;
    subtitle: string;
    disclaimer: string;
  };
  products: EditableProduct[];
  servicesSection: {
    eyebrow: string;
    heading: string;
    subtitle: string;
    items: ServiceItem[];
  };
  storySection: {
    eyebrow: string;
    heading: string;
    body: string;
    ceoImageUrl: string;
    ceoName: string;
    ceoTitle: string;
    pillars: StoryPillar[];
  };
  reviewsSection: {
    eyebrow: string;
    heading: string;
    disclaimer: string;
    items: CommitmentItem[];
  };
  faqSection: {
    eyebrow: string;
    heading: string;
    items: FaqItem[];
  };
  contactSection: {
    eyebrow: string;
    heading: string;
    subtitle: string;
    hoursText: string;
    formTitle: string;
    formSubtitle: string;
  };
  footer: {
    description: string;
    copyright: string;
    taglineRight: string;
    legalNote: string;
  };
  mediaSection: {
    eyebrow: string;
    heading: string;
    subtitle: string;
  };
  mediaGallery: MediaGalleryItem[];
}

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  brand: {
    name: 'MediTrust Pharmacy',
    tagline: '& VARIETIES · OWERRI',
    logoUrl: '',
  },
  topBar: {
    address: STORE_ADDRESS,
    hours: STORE_HOURS_TOP,
    whatsappNumber: WHATSAPP_NUMBER,
    whatsappDisplay: WHATSAPP_DISPLAY,
    phone: '+234 810 005 1616',
    email: 'Hyginustina46@gmail.com',
  },
  socials: {
    facebook: 'https://www.facebook.com',
    instagram: 'https://www.instagram.com',
    tiktok: 'https://www.tiktok.com',
  },
  hero: {
    eyebrow: 'YOUR DAILY ESSENTIALS · CARE FIRST',
    headline: 'Care you can count on.',
    subtitle:
      'Your neighbourhood destination for pharmacy essentials, personal care, baby products and everyday provisions. Shop conveniently and contact our team to confirm availability and delivery.',
    primaryCta: 'Explore Our Products',
    secondaryCta: 'View Your Cart',
    trustPoints: ['Friendly service', 'Convenient ordering', 'Delivery enquiries'],
    badgeTop: 'Care comes first',
    badgeBottom: 'Daily essentials',
    emblemTitle: 'MEDITRUST',
    emblemSubtitle: 'CARE YOU CAN COUNT ON',
    heroImageUrl: '',
  },
  categoriesSection: {
    eyebrow: 'SHOP BY CATEGORY',
    heading: 'MEDICINE ESSENTIALS',
    subtitle:
      'Explore six convenient shopping categories for your household. Select a category to see matching products.',
  },
  categories: CATEGORIES.map((c) => ({ ...c })),
  productsSection: {
    eyebrow: 'THE STORE MENU',
    heading: 'Shop your everyday favourites.',
    subtitle:
      'Choose your essentials, add them to your cart and send your shopping list to us on WhatsApp.',
    disclaimer:
      'Prices are displayed in Nigerian naira (₦). Confirm current stock and final price with our team before payment. Medicines are supplied subject to applicable Nigerian regulations and professional guidance.',
  },
  products: PRODUCTS.map((p) => ({ ...p })),
  servicesSection: {
    eyebrow: 'OUR SERVICES',
    heading: 'Everyday care under one roof.',
    subtitle:
      'From over-the-counter essentials to family groceries, we help Orji Town and wider Owerri households shop with confidence.',
    items: SERVICES.map((s, idx) => ({
      id: `service-${idx + 1}`,
      title: s.title,
      description: s.description,
    })),
  },
  storySection: {
    eyebrow: 'OUR STORY',
    heading: 'Built for Orji Town, Owerri — putting care first every day.',
    body: 'MediTrust Pharmacy & Varieties brings together reliable pharmacy essentials and daily household varieties in one accessible neighbourhood store. Whether you are stopping by for first-aid items, baby care, or pantry staples, our counter team focuses on clear communication, honest pricing, and attentive service.',
    ceoImageUrl: '/src/assets/images/meditrust_ceo_demo_1794918002197.jpg',
    ceoName: 'Chief Executive Officer',
    ceoTitle: 'Founder & Managing Director · MediTrust Pharmacy & Varieties',
    pillars: [
      {
        id: 'pillar-1',
        title: 'Care First',
        description:
          'Thoughtful guidance and careful attention to product labelling and suitability.',
      },
      {
        id: 'pillar-2',
        title: 'One Neighbourhood Stop',
        description:
          'Six practical categories covering health, baby care, personal care, and home provisions.',
      },
      {
        id: 'pillar-3',
        title: 'Direct WhatsApp Desk',
        description:
          'Confirm stock and arrange pickup or Owerri delivery enquiries in minutes.',
      },
    ],
  },
  reviewsSection: {
    eyebrow: 'SERVICE COMMITMENTS',
    heading: 'What you can expect from our team.',
    disclaimer:
      'These are service commitments, not customer testimonials. Add verified customer reviews through your own review platform as they become available.',
    items: COMMITMENTS.map((c, idx) => ({
      id: `commitment-${idx + 1}`,
      label: c.label,
      headline: c.headline,
      detail: c.detail,
    })),
  },
  faqSection: {
    eyebrow: 'FREQUENTLY ASKED QUESTIONS',
    heading: 'Quick answers before you order.',
    items: FAQS.map((f, idx) => ({
      id: `faq-${idx + 1}`,
      q: f.q,
      a: f.a,
    })),
  },
  contactSection: {
    eyebrow: 'VISIT OR MESSAGE US',
    heading: 'Contact MediTrust Pharmacy & Varieties',
    subtitle:
      'Visit our store in Orji Town, Owerri or message us on WhatsApp to confirm product availability and delivery options.',
    hoursText: 'Mon–Sat: 8 AM–10 PM · Sunday: 12 AM–11 PM',
    formTitle: 'Send a Quick WhatsApp Enquiry',
    formSubtitle: 'Ask about stock, pack sizes, or Owerri delivery before visiting.',
  },
  footer: {
    description:
      'Your neighbourhood destination for pharmacy essentials, personal care, baby care and everyday provisions.',
    copyright: '© 2026 MediTrust Pharmacy & Varieties. All rights reserved.',
    taglineRight: 'Care first. Convenience always.',
    legalNote:
      'Medicines availability is subject to applicable regulations. Product listings are for shopping enquiry and are not medical advice. Use medicines strictly as directed by an appropriately qualified professional.',
  },
  mediaSection: {
    eyebrow: 'STORE SHOWCASE',
    heading: 'Inside our store & latest updates.',
    subtitle: 'Photos and videos uploaded from our store team.',
  },
  mediaGallery: [],
};

export function formatSocialUrl(
  platform: 'facebook' | 'instagram' | 'tiktok',
  rawValue: string
): string {
  const trimmed = (rawValue || '').trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  if (trimmed.startsWith('@')) {
    const handle = trimmed.slice(1).replace(/^\/+/, '');
    if (!handle) return '';
    if (platform === 'tiktok') return `https://www.tiktok.com/@${handle}`;
    if (platform === 'instagram') return `https://www.instagram.com/${handle}`;
    return `https://www.facebook.com/${handle}`;
  }
  if (trimmed.includes('.')) {
    return `https://${trimmed.replace(/^\/+/, '')}`;
  }
  const cleanHandle = trimmed.replace(/^\/+/, '');
  if (platform === 'tiktok') return `https://www.tiktok.com/@${cleanHandle}`;
  if (platform === 'instagram') return `https://www.instagram.com/${cleanHandle}`;
  return `https://www.facebook.com/${cleanHandle}`;
}

