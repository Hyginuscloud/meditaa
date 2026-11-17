export type CategoryId =
  | 'Pharmacy'
  | 'Personal Care'
  | 'Baby Care'
  | 'Provisions'
  | 'Household'
  | 'Contraceptives';

export interface CategoryInfo {
  id: CategoryId;
  title: string;
  subtitle: string;
  accentBg: string;
  accentColor: string;
  iconType: 'pill' | 'lotion' | 'baby' | 'bread' | 'spray' | 'shield';
}

export interface Product {
  id: string;
  name: string;
  category: CategoryId;
  description: string;
  price: number;
  unit: string;
  badgeColor: string;
  iconKey:
    | 'tablets'
    | 'citrus'
    | 'droplet'
    | 'antiseptic'
    | 'plaster'
    | 'thermometer'
    | 'lotion'
    | 'haircream'
    | 'jelly'
    | 'soap'
    | 'toothpaste'
    | 'shampoo'
    | 'diapers'
    | 'wipes'
    | 'babylotion'
    | 'powder'
    | 'bread'
    | 'honey'
    | 'biscuits'
    | 'cereal'
    | 'noodles'
    | 'sugar'
    | 'dishwash'
    | 'detergent'
    | 'tissue'
    | 'bleach'
    | 'condoms'
    | 'lubricant';
}

export const WHATSAPP_NUMBER = '2348100051616';
export const WHATSAPP_DISPLAY = '+234 810 005 1616';
export const STORE_ADDRESS = 'Orji Town, Owerri, Imo State, Nigeria';
export const STORE_HOURS_TOP = 'Mon–Sat: 8 AM–10 PM · Sun: 12 AM–11 PM';

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'Pharmacy',
    title: 'Pharmacy',
    subtitle: 'Medicines & health essentials',
    accentBg: 'bg-rose-50',
    accentColor: 'text-rose-600',
    iconType: 'pill',
  },
  {
    id: 'Personal Care',
    title: 'Personal Care',
    subtitle: 'Skin, hair & body care',
    accentBg: 'bg-sky-50',
    accentColor: 'text-sky-600',
    iconType: 'lotion',
  },
  {
    id: 'Baby Care',
    title: 'Baby Care',
    subtitle: 'Baby hygiene & comfort',
    accentBg: 'bg-amber-50',
    accentColor: 'text-amber-600',
    iconType: 'baby',
  },
  {
    id: 'Provisions',
    title: 'Provisions',
    subtitle: 'Snacks, honey & groceries',
    accentBg: 'bg-orange-50',
    accentColor: 'text-orange-600',
    iconType: 'bread',
  },
  {
    id: 'Household',
    title: 'Household',
    subtitle: 'Home cleaning essentials',
    accentBg: 'bg-emerald-50',
    accentColor: 'text-emerald-600',
    iconType: 'spray',
  },
  {
    id: 'Contraceptives',
    title: 'Contraceptives',
    subtitle: 'Family planning essentials',
    accentBg: 'bg-indigo-50',
    accentColor: 'text-indigo-600',
    iconType: 'shield',
  },
];

export const PRODUCTS: Product[] = [
  // Row 1
  {
    id: 'paracetamol-tablets',
    name: 'Paracetamol Tablets',
    category: 'Pharmacy',
    description: 'Common pain and fever relief. Use as directed.',
    price: 500,
    unit: 'Pack',
    badgeColor: '#DBEAFE',
    iconKey: 'tablets',
  },
  {
    id: 'vitamin-c',
    name: 'Vitamin C',
    category: 'Pharmacy',
    description: 'Vitamin supplement. Check suitability with a professional.',
    price: 1800,
    unit: 'Pack',
    badgeColor: '#FFEDD5',
    iconKey: 'citrus',
  },
  {
    id: 'oral-rehydration-salts',
    name: 'Oral Rehydration Salts',
    category: 'Pharmacy',
    description: 'Rehydration salts for preparation as directed.',
    price: 350,
    unit: 'Sachet',
    badgeColor: '#E0F2FE',
    iconKey: 'droplet',
  },
  {
    id: 'antiseptic-solution',
    name: 'Antiseptic Solution',
    category: 'Pharmacy',
    description: 'For appropriate external use as labelled.',
    price: 1500,
    unit: 'Bottle',
    badgeColor: '#FEF3C7',
    iconKey: 'antiseptic',
  },
  // Row 2
  {
    id: 'first-aid-plasters',
    name: 'First Aid Plasters',
    category: 'Pharmacy',
    description: 'Basic first aid dressing essentials.',
    price: 800,
    unit: 'Pack',
    badgeColor: '#FFE4E6',
    iconKey: 'plaster',
  },
  {
    id: 'digital-thermometer',
    name: 'Digital Thermometer',
    category: 'Pharmacy',
    description: 'For checking body temperature; follow instructions.',
    price: 4500,
    unit: 'Piece',
    badgeColor: '#F1F5F9',
    iconKey: 'thermometer',
  },
  {
    id: 'body-lotion',
    name: 'Body Lotion',
    category: 'Personal Care',
    description: 'Daily moisturising body care.',
    price: 2500,
    unit: 'Bottle',
    badgeColor: '#FEF9C3',
    iconKey: 'lotion',
  },
  {
    id: 'hair-cream',
    name: 'Hair Cream',
    category: 'Personal Care',
    description: 'Hair grooming and conditioning essential.',
    price: 1800,
    unit: 'Jar',
    badgeColor: '#E0F2FE',
    iconKey: 'haircream',
  },
  // Row 3
  {
    id: 'petroleum-jelly',
    name: 'Petroleum Jelly',
    category: 'Personal Care',
    description: 'A versatile skin moisturising product.',
    price: 1200,
    unit: 'Jar',
    badgeColor: '#ECFCCB',
    iconKey: 'jelly',
  },
  {
    id: 'bathing-soap',
    name: 'Bathing Soap',
    category: 'Personal Care',
    description: 'For everyday bathing and cleansing.',
    price: 700,
    unit: 'Bar',
    badgeColor: '#CCFBF1',
    iconKey: 'soap',
  },
  {
    id: 'toothpaste',
    name: 'Toothpaste',
    category: 'Personal Care',
    description: 'Daily oral hygiene essential.',
    price: 1500,
    unit: 'Tube',
    badgeColor: '#F1F5F9',
    iconKey: 'toothpaste',
  },
  {
    id: 'shampoo',
    name: 'Shampoo',
    category: 'Personal Care',
    description: 'Hair cleansing and care.',
    price: 2200,
    unit: 'Bottle',
    badgeColor: '#EDE9FE',
    iconKey: 'shampoo',
  },
  // Row 4
  {
    id: 'baby-diapers',
    name: 'Baby Diapers',
    category: 'Baby Care',
    description: 'Baby diaper pack. Confirm size and quantity.',
    price: 6500,
    unit: 'Pack',
    badgeColor: '#FEF3C7',
    iconKey: 'diapers',
  },
  {
    id: 'baby-wipes',
    name: 'Baby Wipes',
    category: 'Baby Care',
    description: 'Convenient baby cleaning wipes.',
    price: 1800,
    unit: 'Pack',
    badgeColor: '#E0F2FE',
    iconKey: 'wipes',
  },
  {
    id: 'baby-lotion',
    name: 'Baby Lotion',
    category: 'Baby Care',
    description: 'Gentle baby skin care; check the label.',
    price: 2400,
    unit: 'Bottle',
    badgeColor: '#FCE7F3',
    iconKey: 'babylotion',
  },
  {
    id: 'baby-powder',
    name: 'Baby Powder',
    category: 'Baby Care',
    description: "Baby care product. Keep powder away from the baby's face.",
    price: 1700,
    unit: 'Bottle',
    badgeColor: '#F3E8FF',
    iconKey: 'powder',
  },
  // Row 5
  {
    id: 'sliced-bread',
    name: 'Sliced Bread',
    category: 'Provisions',
    description: 'Everyday bread. Confirm current availability.',
    price: 1800,
    unit: 'Loaf',
    badgeColor: '#FEF3C7',
    iconKey: 'bread',
  },
  {
    id: 'pure-honey',
    name: 'Pure Honey',
    category: 'Provisions',
    description: 'Honey for household use.',
    price: 3500,
    unit: 'Bottle',
    badgeColor: '#FFEDD5',
    iconKey: 'honey',
  },
  {
    id: 'biscuits',
    name: 'Biscuits',
    category: 'Provisions',
    description: 'A convenient snack for home or work.',
    price: 500,
    unit: 'Pack',
    badgeColor: '#FEF3C7',
    iconKey: 'biscuits',
  },
  {
    id: 'breakfast-cereal',
    name: 'Breakfast Cereal',
    category: 'Provisions',
    description: 'A convenient breakfast cupboard staple.',
    price: 3200,
    unit: 'Pack',
    badgeColor: '#FFE4E6',
    iconKey: 'cereal',
  },
  // Row 6
  {
    id: 'instant-noodles',
    name: 'Instant Noodles',
    category: 'Provisions',
    description: 'Quick-cooking pantry staple.',
    price: 600,
    unit: 'Pack',
    badgeColor: '#FEF9C3',
    iconKey: 'noodles',
  },
  {
    id: 'sugar',
    name: 'Sugar',
    category: 'Provisions',
    description: 'Everyday kitchen ingredient.',
    price: 1500,
    unit: 'Pack',
    badgeColor: '#F1F5F9',
    iconKey: 'sugar',
  },
  {
    id: 'dishwashing-liquid',
    name: 'Dishwashing Liquid',
    category: 'Household',
    description: 'For routine dishwashing as directed.',
    price: 1800,
    unit: 'Bottle',
    badgeColor: '#DCFCE7',
    iconKey: 'dishwash',
  },
  {
    id: 'laundry-detergent',
    name: 'Laundry Detergent',
    category: 'Household',
    description: 'Laundry cleaning essential.',
    price: 2800,
    unit: 'Pack',
    badgeColor: '#DBEAFE',
    iconKey: 'detergent',
  },
  // Row 7
  {
    id: 'toilet-tissue',
    name: 'Toilet Tissue',
    category: 'Household',
    description: 'Everyday bathroom essential.',
    price: 1500,
    unit: 'Pack',
    badgeColor: '#F1F5F9',
    iconKey: 'tissue',
  },
  {
    id: 'household-bleach',
    name: 'Household Bleach',
    category: 'Household',
    description: 'Use as directed. Never mix bleach with other cleaners.',
    price: 1300,
    unit: 'Bottle',
    badgeColor: '#E0F2FE',
    iconKey: 'bleach',
  },
  {
    id: 'condoms',
    name: 'Condoms',
    category: 'Contraceptives',
    description: 'Check the expiry date and package integrity.',
    price: 1200,
    unit: 'Pack',
    badgeColor: '#FFE4E6',
    iconKey: 'condoms',
  },
  {
    id: 'lubricant',
    name: 'Lubricant',
    category: 'Contraceptives',
    description: 'Check compatibility with the condom material.',
    price: 2500,
    unit: 'Pack',
    badgeColor: '#E0F2FE',
    iconKey: 'lubricant',
  },
];

export const SERVICES = [
  {
    title: 'Pharmacy & OTC Guidance',
    description:
      'Speak directly with our store team for everyday medicines, first-aid supplies, and product suitability questions.',
  },
  {
    title: 'Personal & Baby Care',
    description:
      'Stock up on trusted skin care, hair grooming, diapers, baby wipes, and gentle lotions in one neighbourhood stop.',
  },
  {
    title: 'Provisions & Home Varieties',
    description:
      'Pick up breakfast staples, pure honey, snacks, laundry detergent, and household cleaning supplies alongside your pharmacy visit.',
  },
  {
    title: 'WhatsApp Ordering & Enquiries',
    description:
      'Build your shopping list right here, send it directly to our WhatsApp desk, and confirm stock, total pricing, and delivery options.',
  },
];

export const COMMITMENTS = [
  {
    label: 'Friendly Service',
    headline: 'Respectful, clear assistance',
    detail:
      'Every enquiry receives calm, attentive support so you can confirm stock, pack sizes, and usage directions before purchasing.',
  },
  {
    label: 'Convenient Ordering',
    headline: 'Quick WhatsApp shopping list',
    detail:
      'Select your daily essentials across all six categories and share an itemised list with our counter team in seconds.',
  },
  {
    label: 'Delivery Enquiries',
    headline: 'Flexible local coordination',
    detail:
      'Coordinate store pickup in Orji Town or ask our team about local delivery availability and dispatch arrangements around Owerri.',
  },
];

export const FAQS = [
  {
    q: 'How do I place an order on this website?',
    a: 'Add the items you need to your cart or click Buy Now on any product, then open your cart and click Send Order via WhatsApp. Our team will confirm availability, final prices, and pickup or delivery options.',
  },
  {
    q: 'Are the prices shown final?',
    a: 'Prices are displayed in Nigerian naira (₦) as a helpful guide. Please confirm current stock, pack size, and final total with our team on WhatsApp before making any payment.',
  },
  {
    q: 'Do you offer delivery around Owerri?',
    a: 'Yes, you can make delivery enquiries when sending your cart via WhatsApp or by messaging +234 810 005 1616. Store pickup is also available at Orji Town, Owerri.',
  },
  {
    q: 'What are your opening hours?',
    a: 'We are open Monday to Saturday from 8 AM to 10 PM, and on Sunday from 12 AM to 11 PM.',
  },
  {
    q: 'Can I ask questions about medicine usage?',
    a: 'Product listings on this site are for shopping enquiry and are not medical advice. Always read product labels and consult an appropriately qualified healthcare professional before using medicines.',
  },
];
