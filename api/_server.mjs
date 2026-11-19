// server.ts
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import express from "express";

// src/data/products.ts
var WHATSAPP_NUMBER = "2348100051616";
var WHATSAPP_DISPLAY = "+234 810 005 1616";
var STORE_ADDRESS = "Orji Town, Owerri, Imo State, Nigeria";
var STORE_HOURS_TOP = "Mon\u2013Sat: 8 AM\u201310 PM \xB7 Sun: 12 AM\u201311 PM";
var CATEGORIES = [
  {
    id: "Pharmacy",
    title: "Pharmacy",
    subtitle: "Medicines & health essentials",
    accentBg: "bg-rose-50",
    accentColor: "text-rose-600",
    iconType: "pill"
  },
  {
    id: "Personal Care",
    title: "Personal Care",
    subtitle: "Skin, hair & body care",
    accentBg: "bg-sky-50",
    accentColor: "text-sky-600",
    iconType: "lotion"
  },
  {
    id: "Baby Care",
    title: "Baby Care",
    subtitle: "Baby hygiene & comfort",
    accentBg: "bg-amber-50",
    accentColor: "text-amber-600",
    iconType: "baby"
  },
  {
    id: "Provisions",
    title: "Provisions",
    subtitle: "Snacks, honey & groceries",
    accentBg: "bg-orange-50",
    accentColor: "text-orange-600",
    iconType: "bread"
  },
  {
    id: "Household",
    title: "Household",
    subtitle: "Home cleaning essentials",
    accentBg: "bg-emerald-50",
    accentColor: "text-emerald-600",
    iconType: "spray"
  },
  {
    id: "Contraceptives",
    title: "Contraceptives",
    subtitle: "Family planning essentials",
    accentBg: "bg-indigo-50",
    accentColor: "text-indigo-600",
    iconType: "shield"
  }
];
var PRODUCTS = [
  // Row 1
  {
    id: "paracetamol-tablets",
    name: "Paracetamol Tablets",
    category: "Pharmacy",
    description: "Common pain and fever relief. Use as directed.",
    price: 500,
    unit: "Pack",
    badgeColor: "#DBEAFE",
    iconKey: "tablets"
  },
  {
    id: "vitamin-c",
    name: "Vitamin C",
    category: "Pharmacy",
    description: "Vitamin supplement. Check suitability with a professional.",
    price: 1800,
    unit: "Pack",
    badgeColor: "#FFEDD5",
    iconKey: "citrus"
  },
  {
    id: "oral-rehydration-salts",
    name: "Oral Rehydration Salts",
    category: "Pharmacy",
    description: "Rehydration salts for preparation as directed.",
    price: 350,
    unit: "Sachet",
    badgeColor: "#E0F2FE",
    iconKey: "droplet"
  },
  {
    id: "antiseptic-solution",
    name: "Antiseptic Solution",
    category: "Pharmacy",
    description: "For appropriate external use as labelled.",
    price: 1500,
    unit: "Bottle",
    badgeColor: "#FEF3C7",
    iconKey: "antiseptic"
  },
  // Row 2
  {
    id: "first-aid-plasters",
    name: "First Aid Plasters",
    category: "Pharmacy",
    description: "Basic first aid dressing essentials.",
    price: 800,
    unit: "Pack",
    badgeColor: "#FFE4E6",
    iconKey: "plaster"
  },
  {
    id: "digital-thermometer",
    name: "Digital Thermometer",
    category: "Pharmacy",
    description: "For checking body temperature; follow instructions.",
    price: 4500,
    unit: "Piece",
    badgeColor: "#F1F5F9",
    iconKey: "thermometer"
  },
  {
    id: "body-lotion",
    name: "Body Lotion",
    category: "Personal Care",
    description: "Daily moisturising body care.",
    price: 2500,
    unit: "Bottle",
    badgeColor: "#FEF9C3",
    iconKey: "lotion"
  },
  {
    id: "hair-cream",
    name: "Hair Cream",
    category: "Personal Care",
    description: "Hair grooming and conditioning essential.",
    price: 1800,
    unit: "Jar",
    badgeColor: "#E0F2FE",
    iconKey: "haircream"
  },
  // Row 3
  {
    id: "petroleum-jelly",
    name: "Petroleum Jelly",
    category: "Personal Care",
    description: "A versatile skin moisturising product.",
    price: 1200,
    unit: "Jar",
    badgeColor: "#ECFCCB",
    iconKey: "jelly"
  },
  {
    id: "bathing-soap",
    name: "Bathing Soap",
    category: "Personal Care",
    description: "For everyday bathing and cleansing.",
    price: 700,
    unit: "Bar",
    badgeColor: "#CCFBF1",
    iconKey: "soap"
  },
  {
    id: "toothpaste",
    name: "Toothpaste",
    category: "Personal Care",
    description: "Daily oral hygiene essential.",
    price: 1500,
    unit: "Tube",
    badgeColor: "#F1F5F9",
    iconKey: "toothpaste"
  },
  {
    id: "shampoo",
    name: "Shampoo",
    category: "Personal Care",
    description: "Hair cleansing and care.",
    price: 2200,
    unit: "Bottle",
    badgeColor: "#EDE9FE",
    iconKey: "shampoo"
  },
  // Row 4
  {
    id: "baby-diapers",
    name: "Baby Diapers",
    category: "Baby Care",
    description: "Baby diaper pack. Confirm size and quantity.",
    price: 6500,
    unit: "Pack",
    badgeColor: "#FEF3C7",
    iconKey: "diapers"
  },
  {
    id: "baby-wipes",
    name: "Baby Wipes",
    category: "Baby Care",
    description: "Convenient baby cleaning wipes.",
    price: 1800,
    unit: "Pack",
    badgeColor: "#E0F2FE",
    iconKey: "wipes"
  },
  {
    id: "baby-lotion",
    name: "Baby Lotion",
    category: "Baby Care",
    description: "Gentle baby skin care; check the label.",
    price: 2400,
    unit: "Bottle",
    badgeColor: "#FCE7F3",
    iconKey: "babylotion"
  },
  {
    id: "baby-powder",
    name: "Baby Powder",
    category: "Baby Care",
    description: "Baby care product. Keep powder away from the baby's face.",
    price: 1700,
    unit: "Bottle",
    badgeColor: "#F3E8FF",
    iconKey: "powder"
  },
  // Row 5
  {
    id: "sliced-bread",
    name: "Sliced Bread",
    category: "Provisions",
    description: "Everyday bread. Confirm current availability.",
    price: 1800,
    unit: "Loaf",
    badgeColor: "#FEF3C7",
    iconKey: "bread"
  },
  {
    id: "pure-honey",
    name: "Pure Honey",
    category: "Provisions",
    description: "Honey for household use.",
    price: 3500,
    unit: "Bottle",
    badgeColor: "#FFEDD5",
    iconKey: "honey"
  },
  {
    id: "biscuits",
    name: "Biscuits",
    category: "Provisions",
    description: "A convenient snack for home or work.",
    price: 500,
    unit: "Pack",
    badgeColor: "#FEF3C7",
    iconKey: "biscuits"
  },
  {
    id: "breakfast-cereal",
    name: "Breakfast Cereal",
    category: "Provisions",
    description: "A convenient breakfast cupboard staple.",
    price: 3200,
    unit: "Pack",
    badgeColor: "#FFE4E6",
    iconKey: "cereal"
  },
  // Row 6
  {
    id: "instant-noodles",
    name: "Instant Noodles",
    category: "Provisions",
    description: "Quick-cooking pantry staple.",
    price: 600,
    unit: "Pack",
    badgeColor: "#FEF9C3",
    iconKey: "noodles"
  },
  {
    id: "sugar",
    name: "Sugar",
    category: "Provisions",
    description: "Everyday kitchen ingredient.",
    price: 1500,
    unit: "Pack",
    badgeColor: "#F1F5F9",
    iconKey: "sugar"
  },
  {
    id: "dishwashing-liquid",
    name: "Dishwashing Liquid",
    category: "Household",
    description: "For routine dishwashing as directed.",
    price: 1800,
    unit: "Bottle",
    badgeColor: "#DCFCE7",
    iconKey: "dishwash"
  },
  {
    id: "laundry-detergent",
    name: "Laundry Detergent",
    category: "Household",
    description: "Laundry cleaning essential.",
    price: 2800,
    unit: "Pack",
    badgeColor: "#DBEAFE",
    iconKey: "detergent"
  },
  // Row 7
  {
    id: "toilet-tissue",
    name: "Toilet Tissue",
    category: "Household",
    description: "Everyday bathroom essential.",
    price: 1500,
    unit: "Pack",
    badgeColor: "#F1F5F9",
    iconKey: "tissue"
  },
  {
    id: "household-bleach",
    name: "Household Bleach",
    category: "Household",
    description: "Use as directed. Never mix bleach with other cleaners.",
    price: 1300,
    unit: "Bottle",
    badgeColor: "#E0F2FE",
    iconKey: "bleach"
  },
  {
    id: "condoms",
    name: "Condoms",
    category: "Contraceptives",
    description: "Check the expiry date and package integrity.",
    price: 1200,
    unit: "Pack",
    badgeColor: "#FFE4E6",
    iconKey: "condoms"
  },
  {
    id: "lubricant",
    name: "Lubricant",
    category: "Contraceptives",
    description: "Check compatibility with the condom material.",
    price: 2500,
    unit: "Pack",
    badgeColor: "#E0F2FE",
    iconKey: "lubricant"
  }
];
var SERVICES = [
  {
    title: "Pharmacy & OTC Guidance",
    description: "Speak directly with our store team for everyday medicines, first-aid supplies, and product suitability questions."
  },
  {
    title: "Personal & Baby Care",
    description: "Stock up on trusted skin care, hair grooming, diapers, baby wipes, and gentle lotions in one neighbourhood stop."
  },
  {
    title: "Provisions & Home Varieties",
    description: "Pick up breakfast staples, pure honey, snacks, laundry detergent, and household cleaning supplies alongside your pharmacy visit."
  },
  {
    title: "WhatsApp Ordering & Enquiries",
    description: "Build your shopping list right here, send it directly to our WhatsApp desk, and confirm stock, total pricing, and delivery options."
  }
];
var COMMITMENTS = [
  {
    label: "Friendly Service",
    headline: "Respectful, clear assistance",
    detail: "Every enquiry receives calm, attentive support so you can confirm stock, pack sizes, and usage directions before purchasing."
  },
  {
    label: "Convenient Ordering",
    headline: "Quick WhatsApp shopping list",
    detail: "Select your daily essentials across all six categories and share an itemised list with our counter team in seconds."
  },
  {
    label: "Delivery Enquiries",
    headline: "Flexible local coordination",
    detail: "Coordinate store pickup in Orji Town or ask our team about local delivery availability and dispatch arrangements around Owerri."
  }
];
var FAQS = [
  {
    q: "How do I place an order on this website?",
    a: "Add the items you need to your cart or click Buy Now on any product, then open your cart and click Send Order via WhatsApp. Our team will confirm availability, final prices, and pickup or delivery options."
  },
  {
    q: "Are the prices shown final?",
    a: "Prices are displayed in Nigerian naira (\u20A6) as a helpful guide. Please confirm current stock, pack size, and final total with our team on WhatsApp before making any payment."
  },
  {
    q: "Do you offer delivery around Owerri?",
    a: "Yes, you can make delivery enquiries when sending your cart via WhatsApp or by messaging +234 810 005 1616. Store pickup is also available at Orji Town, Owerri."
  },
  {
    q: "What are your opening hours?",
    a: "We are open Monday to Saturday from 8 AM to 10 PM, and on Sunday from 12 AM to 11 PM."
  },
  {
    q: "Can I ask questions about medicine usage?",
    a: "Product listings on this site are for shopping enquiry and are not medical advice. Always read product labels and consult an appropriately qualified healthcare professional before using medicines."
  }
];

// src/data/siteConfig.ts
var DEFAULT_SITE_CONFIG = {
  brand: {
    name: "MediTrust Pharmacy",
    tagline: "& VARIETIES \xB7 OWERRI",
    logoUrl: ""
  },
  topBar: {
    address: STORE_ADDRESS,
    hours: STORE_HOURS_TOP,
    whatsappNumber: WHATSAPP_NUMBER,
    whatsappDisplay: WHATSAPP_DISPLAY,
    phone: "+234 810 005 1616",
    email: "Hyginustina46@gmail.com"
  },
  socials: {
    facebook: "https://www.facebook.com",
    instagram: "https://www.instagram.com",
    tiktok: "https://www.tiktok.com"
  },
  hero: {
    eyebrow: "YOUR DAILY ESSENTIALS \xB7 CARE FIRST",
    headline: "Care you can count on.",
    subtitle: "Your neighbourhood destination for pharmacy essentials, personal care, baby products and everyday provisions. Shop conveniently and contact our team to confirm availability and delivery.",
    primaryCta: "Explore Our Products",
    secondaryCta: "View Your Cart",
    trustPoints: ["Friendly service", "Convenient ordering", "Delivery enquiries"],
    badgeTop: "Care comes first",
    badgeBottom: "Daily essentials",
    emblemTitle: "MEDITRUST",
    emblemSubtitle: "CARE YOU CAN COUNT ON",
    heroImageUrl: ""
  },
  categoriesSection: {
    eyebrow: "SHOP BY CATEGORY",
    heading: "MEDICINE ESSENTIALS",
    subtitle: "Explore six convenient shopping categories for your household. Select a category to see matching products."
  },
  categories: CATEGORIES.map((c) => ({ ...c })),
  productsSection: {
    eyebrow: "THE STORE MENU",
    heading: "Shop your everyday favourites.",
    subtitle: "Choose your essentials, add them to your cart and send your shopping list to us on WhatsApp.",
    disclaimer: "Prices are displayed in Nigerian naira (\u20A6). Confirm current stock and final price with our team before payment. Medicines are supplied subject to applicable Nigerian regulations and professional guidance."
  },
  products: PRODUCTS.map((p) => ({ ...p })),
  servicesSection: {
    eyebrow: "OUR SERVICES",
    heading: "Everyday care under one roof.",
    subtitle: "From over-the-counter essentials to family groceries, we help Orji Town and wider Owerri households shop with confidence.",
    items: SERVICES.map((s, idx) => ({
      id: `service-${idx + 1}`,
      title: s.title,
      description: s.description
    }))
  },
  storySection: {
    eyebrow: "OUR STORY",
    heading: "Built for Orji Town, Owerri \u2014 putting care first every day.",
    body: "MediTrust Pharmacy & Varieties brings together reliable pharmacy essentials and daily household varieties in one accessible neighbourhood store. Whether you are stopping by for first-aid items, baby care, or pantry staples, our counter team focuses on clear communication, honest pricing, and attentive service.",
    ceoImageUrl: "/src/assets/images/meditrust_ceo_demo_1794918002197.jpg",
    ceoName: "Chief Executive Officer",
    ceoTitle: "Founder & Managing Director \xB7 MediTrust Pharmacy & Varieties",
    pillars: [
      {
        id: "pillar-1",
        title: "Care First",
        description: "Thoughtful guidance and careful attention to product labelling and suitability."
      },
      {
        id: "pillar-2",
        title: "One Neighbourhood Stop",
        description: "Six practical categories covering health, baby care, personal care, and home provisions."
      },
      {
        id: "pillar-3",
        title: "Direct WhatsApp Desk",
        description: "Confirm stock and arrange pickup or Owerri delivery enquiries in minutes."
      }
    ]
  },
  reviewsSection: {
    eyebrow: "SERVICE COMMITMENTS",
    heading: "What you can expect from our team.",
    disclaimer: "These are service commitments, not customer testimonials. Add verified customer reviews through your own review platform as they become available.",
    items: COMMITMENTS.map((c, idx) => ({
      id: `commitment-${idx + 1}`,
      label: c.label,
      headline: c.headline,
      detail: c.detail
    }))
  },
  faqSection: {
    eyebrow: "FREQUENTLY ASKED QUESTIONS",
    heading: "Quick answers before you order.",
    items: FAQS.map((f, idx) => ({
      id: `faq-${idx + 1}`,
      q: f.q,
      a: f.a
    }))
  },
  contactSection: {
    eyebrow: "VISIT OR MESSAGE US",
    heading: "Contact MediTrust Pharmacy & Varieties",
    subtitle: "Visit our store in Orji Town, Owerri or message us on WhatsApp to confirm product availability and delivery options.",
    hoursText: "Mon\u2013Sat: 8 AM\u201310 PM \xB7 Sunday: 12 AM\u201311 PM",
    formTitle: "Send a Quick WhatsApp Enquiry",
    formSubtitle: "Ask about stock, pack sizes, or Owerri delivery before visiting."
  },
  footer: {
    description: "Your neighbourhood destination for pharmacy essentials, personal care, baby care and everyday provisions.",
    copyright: "\xA9 2026 MediTrust Pharmacy & Varieties. All rights reserved.",
    taglineRight: "Care first. Convenience always.",
    legalNote: "Medicines availability is subject to applicable regulations. Product listings are for shopping enquiry and are not medical advice. Use medicines strictly as directed by an appropriately qualified professional."
  },
  mediaSection: {
    eyebrow: "STORE SHOWCASE",
    heading: "Inside our store & latest updates.",
    subtitle: "Photos and videos uploaded from our store team."
  },
  mediaGallery: []
};

// server.ts
dotenv.config();
function readCliArg(flag) {
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === flag && args[i + 1] && !args[i + 1].startsWith("--")) {
      return args[i + 1];
    }
    if (arg.startsWith(`${flag}=`)) {
      return arg.slice(flag.length + 1);
    }
  }
  return void 0;
}
var CLI_PORT = Number(readCliArg("--port"));
var ENV_PORT = Number(process.env.PORT);
var PORT = Number.isFinite(CLI_PORT) && CLI_PORT > 0 ? CLI_PORT : process.env.NODE_ENV !== "production" && ENV_PORT === 8080 ? 3e3 : Number.isFinite(ENV_PORT) && ENV_PORT > 0 ? ENV_PORT : 3e3;
var HOST = readCliArg("--host") || "0.0.0.0";
var IS_SERVERLESS = Boolean(
  process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.LAMBDA_TASK_ROOT || process.env.NETLIFY_FUNCTION_RUNTIME || process.env.NETLIFY && !process.env.NETLIFY_DEV
);
var ROOT_DIR = process.cwd();
var WRITABLE_DIR = IS_SERVERLESS ? os.tmpdir() : ROOT_DIR;
var DATA_DIR = path.resolve(WRITABLE_DIR, IS_SERVERLESS ? "meditrust-data" : "data");
var STORE_PATH = path.resolve(DATA_DIR, "store.json");
var UPLOADS_DIR = path.resolve(WRITABLE_DIR, IS_SERVERLESS ? "meditrust-uploads" : "uploads");
function getSessionSecret() {
  return process.env.SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "meditrust-owerri-session-secret-v1";
}
function createSignedToken(role, name, expiresAt) {
  const payload = Buffer.from(JSON.stringify({ role, name, exp: expiresAt })).toString("base64url");
  const sig = crypto.createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}
function verifySignedToken(token) {
  if (!token || !token.includes(".")) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payload, sig] = parts;
  const expectedSig = crypto.createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!parsed.exp || parsed.exp <= Date.now()) return null;
    const role = parsed.role === "manager" ? "manager" : "admin";
    return {
      token,
      role,
      name: parsed.name || (role === "admin" ? "Administrator" : "Store Manager"),
      expiresAt: parsed.exp
    };
  } catch {
    return null;
  }
}
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}
function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.includes(":")) return false;
  const [salt, keyHex] = storedHash.split(":");
  if (!salt || !keyHex) return false;
  const keyBuf = Buffer.from(keyHex, "hex");
  const derivedBuf = crypto.scryptSync(password, salt, 64);
  if (keyBuf.length !== derivedBuf.length) return false;
  return crypto.timingSafeEqual(keyBuf, derivedBuf);
}
function ensureDirectories() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
  } catch {
  }
}
function createInitialStore() {
  return {
    siteConfig: structuredClone(DEFAULT_SITE_CONFIG),
    auth: {
      adminPasswordHash: hashPassword("Admin@1252"),
      managerEnabled: false,
      managerName: "Store Manager",
      managerPasswordHash: null,
      sessions: []
    }
  };
}
function mergeSiteConfig(incoming) {
  const fallback = structuredClone(DEFAULT_SITE_CONFIG);
  if (!incoming) return fallback;
  return {
    ...fallback,
    ...incoming,
    brand: { ...fallback.brand, ...incoming.brand ?? {} },
    topBar: { ...fallback.topBar, ...incoming.topBar ?? {} },
    socials: { ...fallback.socials, ...incoming.socials ?? {} },
    hero: { ...fallback.hero, ...incoming.hero ?? {} },
    categoriesSection: {
      ...fallback.categoriesSection,
      ...incoming.categoriesSection ?? {}
    },
    productsSection: {
      ...fallback.productsSection,
      ...incoming.productsSection ?? {}
    },
    servicesSection: {
      ...fallback.servicesSection,
      ...incoming.servicesSection ?? {}
    },
    storySection: {
      ...fallback.storySection,
      ...incoming.storySection ?? {}
    },
    reviewsSection: {
      ...fallback.reviewsSection,
      ...incoming.reviewsSection ?? {}
    },
    faqSection: {
      ...fallback.faqSection,
      ...incoming.faqSection ?? {}
    },
    contactSection: {
      ...fallback.contactSection,
      ...incoming.contactSection ?? {}
    },
    footer: { ...fallback.footer, ...incoming.footer ?? {} },
    mediaSection: {
      ...fallback.mediaSection,
      ...incoming.mediaSection ?? {}
    },
    mediaGallery: incoming.mediaGallery ?? fallback.mediaGallery
  };
}
function cleanEnvValue(raw) {
  if (!raw) return "";
  return raw.trim().replace(/^(['"])(.*)\1$/, "$2").trim();
}
function getSupabaseEnv() {
  let url = cleanEnvValue(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL).replace(/\/rest\/v1\/?$/i, "").replace(/\/+$/, "");
  if (url && !/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }
  const serviceKey = cleanEnvValue(
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_KEY
  );
  if (!url || !serviceKey || url.includes("YOUR_PROJECT_REF") || serviceKey.includes("MY_SUPABASE_")) {
    return null;
  }
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
  } catch {
    return null;
  }
  return { url, serviceKey };
}
async function loadSiteConfigFromSupabase(sb) {
  try {
    const res = await fetch(`${sb.url}/rest/v1/site_settings?id=eq.main&select=config`, {
      headers: {
        apikey: sb.serviceKey,
        Authorization: `Bearer ${sb.serviceKey}`
      },
      signal: AbortSignal.timeout(8e3)
    });
    if (!res.ok) return null;
    const rows = await res.json();
    const rowConfig = rows[0]?.config;
    if (!rowConfig || typeof rowConfig !== "object") return null;
    return mergeSiteConfig(rowConfig);
  } catch {
    return null;
  }
}
function buildPostgrestInList(ids) {
  return ids.map((id) => `"${id.replace(/[^a-zA-Z0-9_.-]/g, "")}"`).join(",");
}
async function syncSiteConfigToSupabase(sb, config) {
  try {
    const settingsRes = await fetch(`${sb.url}/rest/v1/site_settings?on_conflict=id`, {
      method: "POST",
      headers: {
        apikey: sb.serviceKey,
        Authorization: `Bearer ${sb.serviceKey}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates"
      },
      body: JSON.stringify([{ id: "main", config }]),
      signal: AbortSignal.timeout(1e4)
    });
    if (!settingsRes.ok) {
      const detail = await settingsRes.text().catch(() => "");
      return {
        ok: false,
        error: `Supabase site_settings sync failed (${settingsRes.status}): ${detail.slice(0, 140)}`
      };
    }
    if (config.categories.length > 0) {
      const catRows = config.categories.map((c, idx) => ({
        id: c.id,
        title: c.title,
        subtitle: c.subtitle,
        accent_bg: c.accentBg,
        accent_color: c.accentColor,
        icon_type: c.iconType,
        sort_order: idx + 1
      }));
      await fetch(`${sb.url}/rest/v1/categories?on_conflict=id`, {
        method: "POST",
        headers: {
          apikey: sb.serviceKey,
          Authorization: `Bearer ${sb.serviceKey}`,
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates"
        },
        body: JSON.stringify(catRows),
        signal: AbortSignal.timeout(1e4)
      });
    }
    if (config.products.length > 0) {
      const productRows = config.products.map((p, idx) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        description: p.description,
        price: p.price,
        unit: p.unit,
        badge_color: p.badgeColor,
        icon_key: p.iconKey,
        image_url: p.imageUrl ?? null,
        sort_order: idx + 1
      }));
      const prodRes = await fetch(`${sb.url}/rest/v1/products?on_conflict=id`, {
        method: "POST",
        headers: {
          apikey: sb.serviceKey,
          Authorization: `Bearer ${sb.serviceKey}`,
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates"
        },
        body: JSON.stringify(productRows),
        signal: AbortSignal.timeout(1e4)
      });
      if (prodRes.ok) {
        const keepIds = buildPostgrestInList(config.products.map((p) => p.id));
        await fetch(`${sb.url}/rest/v1/products?id=not.in.(${keepIds})`, {
          method: "DELETE",
          headers: {
            apikey: sb.serviceKey,
            Authorization: `Bearer ${sb.serviceKey}`
          },
          signal: AbortSignal.timeout(1e4)
        });
      }
    } else {
      await fetch(`${sb.url}/rest/v1/products?id=neq.__none__`, {
        method: "DELETE",
        headers: {
          apikey: sb.serviceKey,
          Authorization: `Bearer ${sb.serviceKey}`
        },
        signal: AbortSignal.timeout(1e4)
      });
    }
    if (config.mediaGallery.length > 0) {
      const mediaRows = config.mediaGallery.map((m) => ({
        id: m.id,
        type: m.type,
        url: m.url,
        title: m.title,
        caption: m.caption,
        placement: m.placement
      }));
      const mediaRes = await fetch(`${sb.url}/rest/v1/media_gallery?on_conflict=id`, {
        method: "POST",
        headers: {
          apikey: sb.serviceKey,
          Authorization: `Bearer ${sb.serviceKey}`,
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates"
        },
        body: JSON.stringify(mediaRows),
        signal: AbortSignal.timeout(1e4)
      });
      if (mediaRes.ok) {
        const keepMediaIds = buildPostgrestInList(config.mediaGallery.map((m) => m.id));
        await fetch(`${sb.url}/rest/v1/media_gallery?id=not.in.(${keepMediaIds})`, {
          method: "DELETE",
          headers: {
            apikey: sb.serviceKey,
            Authorization: `Bearer ${sb.serviceKey}`
          },
          signal: AbortSignal.timeout(1e4)
        });
      }
    } else {
      await fetch(`${sb.url}/rest/v1/media_gallery?id=neq.__none__`, {
        method: "DELETE",
        headers: {
          apikey: sb.serviceKey,
          Authorization: `Bearer ${sb.serviceKey}`
        },
        signal: AbortSignal.timeout(1e4)
      });
    }
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn("Supabase sync skipped:", msg);
    return { ok: false, error: msg };
  }
}
async function ensureSupabaseBucket(sb) {
  try {
    const checkRes = await fetch(`${sb.url}/storage/v1/bucket/meditrust-media`, {
      headers: {
        apikey: sb.serviceKey,
        Authorization: `Bearer ${sb.serviceKey}`
      },
      signal: AbortSignal.timeout(8e3)
    });
    if (checkRes.ok) return true;
    const createRes = await fetch(`${sb.url}/storage/v1/bucket`, {
      method: "POST",
      headers: {
        apikey: sb.serviceKey,
        Authorization: `Bearer ${sb.serviceKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id: "meditrust-media",
        name: "meditrust-media",
        public: true
      }),
      signal: AbortSignal.timeout(8e3)
    });
    return createRes.ok;
  } catch {
    return false;
  }
}
async function uploadToSupabaseStorage(sb, fileName, contentType, buffer) {
  const cleanMime = (contentType || "application/octet-stream").split(";")[0].trim();
  const encodedName = encodeURIComponent(fileName);
  const doUpload = async () => fetch(`${sb.url}/storage/v1/object/meditrust-media/${encodedName}`, {
    method: "POST",
    headers: {
      apikey: sb.serviceKey,
      Authorization: `Bearer ${sb.serviceKey}`,
      "Content-Type": cleanMime || "application/octet-stream",
      "x-upsert": "true"
    },
    body: new Uint8Array(buffer),
    signal: AbortSignal.timeout(3e4)
  });
  try {
    let res = await doUpload();
    if (!res.ok && (res.status === 400 || res.status === 404)) {
      const created = await ensureSupabaseBucket(sb);
      if (created) {
        res = await doUpload();
      }
    }
    if (!res.ok) return null;
    return `${sb.url}/storage/v1/object/public/meditrust-media/${encodedName}`;
  } catch {
    return null;
  }
}
async function loadAuthFromSupabase(sb, auth) {
  try {
    const res = await fetch(
      `${sb.url}/rest/v1/admin_credentials?id=eq.default&select=admin_password_hash,manager_enabled,manager_name,manager_password_hash`,
      {
        headers: {
          apikey: sb.serviceKey,
          Authorization: `Bearer ${sb.serviceKey}`
        },
        signal: AbortSignal.timeout(8e3)
      }
    );
    if (!res.ok) return;
    const rows = await res.json();
    const row = rows[0];
    if (!row) return;
    if (row.admin_password_hash && row.admin_password_hash.includes(":")) {
      auth.adminPasswordHash = row.admin_password_hash;
    }
    if (typeof row.manager_enabled === "boolean") {
      auth.managerEnabled = row.manager_enabled;
    }
    if (row.manager_name) {
      auth.managerName = row.manager_name;
    }
    if (row.manager_password_hash && row.manager_password_hash.includes(":")) {
      auth.managerPasswordHash = row.manager_password_hash;
    }
  } catch {
  }
}
async function syncAuthToSupabase(sb, auth) {
  try {
    const res = await fetch(`${sb.url}/rest/v1/admin_credentials?on_conflict=id`, {
      method: "POST",
      headers: {
        apikey: sb.serviceKey,
        Authorization: `Bearer ${sb.serviceKey}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates"
      },
      body: JSON.stringify([
        {
          id: "default",
          admin_password_hash: auth.adminPasswordHash,
          manager_enabled: auth.managerEnabled,
          manager_name: auth.managerName,
          manager_password_hash: auth.managerPasswordHash
        }
      ]),
      signal: AbortSignal.timeout(8e3)
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return {
        ok: false,
        error: `Supabase auth sync failed (${res.status}): ${detail.slice(0, 140)}`
      };
    }
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Supabase auth sync failed"
    };
  }
}
async function checkSupabaseHealth(sb) {
  if (!sb) {
    return {
      supabaseConnected: false,
      supabaseReachable: false,
      serviceRoleVerified: false,
      storageBucketReady: false,
      issue: "SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not configured."
    };
  }
  try {
    const headers = {
      apikey: sb.serviceKey,
      Authorization: `Bearer ${sb.serviceKey}`
    };
    const [settingsRes, credsRes, bucketRes] = await Promise.all([
      fetch(`${sb.url}/rest/v1/site_settings?id=eq.main&select=id`, {
        headers,
        signal: AbortSignal.timeout(6e3)
      }),
      fetch(`${sb.url}/rest/v1/admin_credentials?id=eq.default&select=id`, {
        headers,
        signal: AbortSignal.timeout(6e3)
      }),
      fetch(`${sb.url}/storage/v1/bucket/meditrust-media`, {
        headers,
        signal: AbortSignal.timeout(6e3)
      })
    ]);
    const supabaseReachable = settingsRes.ok;
    const serviceRoleVerified = credsRes.ok;
    const storageBucketReady = bucketRes.ok || serviceRoleVerified && await ensureSupabaseBucket(sb);
    let issue = null;
    if (!supabaseReachable) {
      issue = `Supabase REST API returned HTTP ${settingsRes.status}. Verify SUPABASE_URL and run supabase/schema.sql.`;
    } else if (!serviceRoleVerified) {
      issue = `Supabase rejected admin_credentials access (HTTP ${credsRes.status}). Make sure SUPABASE_SERVICE_ROLE_KEY is the service_role key (not the anon key).`;
    } else if (!storageBucketReady) {
      issue = 'Supabase Storage bucket "meditrust-media" could not be accessed.';
    }
    return {
      supabaseConnected: supabaseReachable && serviceRoleVerified,
      supabaseReachable,
      serviceRoleVerified,
      storageBucketReady,
      issue
    };
  } catch (err) {
    return {
      supabaseConnected: false,
      supabaseReachable: false,
      serviceRoleVerified: false,
      storageBucketReady: false,
      issue: err instanceof Error ? err.message : "Unable to reach Supabase."
    };
  }
}
function loadStore() {
  ensureDirectories();
  const currentUrl = typeof import.meta !== "undefined" ? import.meta.url : void 0;
  const currentDir = currentUrl ? path.dirname(fileURLToPath(currentUrl)) : null;
  const candidateStorePaths = [
    STORE_PATH,
    path.resolve(ROOT_DIR, "data", "store.json"),
    ...currentDir ? [
      path.resolve(currentDir, "data", "store.json"),
      path.resolve(currentDir, "../data/store.json"),
      path.resolve(currentDir, "../../data/store.json")
    ] : []
  ];
  const readPath = candidateStorePaths.find((p) => fs.existsSync(p)) ?? null;
  if (!readPath) {
    const initial = createInitialStore();
    saveStore(initial);
    return initial;
  }
  try {
    const raw = fs.readFileSync(readPath, "utf8");
    const parsed = JSON.parse(raw);
    const fallback = createInitialStore();
    const mergedConfig = mergeSiteConfig(parsed.siteConfig);
    return {
      siteConfig: mergedConfig,
      auth: {
        adminPasswordHash: parsed.auth?.adminPasswordHash || fallback.auth.adminPasswordHash,
        managerEnabled: Boolean(parsed.auth?.managerEnabled),
        managerName: parsed.auth?.managerName || "Store Manager",
        managerPasswordHash: parsed.auth?.managerPasswordHash ?? null,
        sessions: Array.isArray(parsed.auth?.sessions) ? parsed.auth.sessions.filter((s) => s.expiresAt > Date.now()) : []
      }
    };
  } catch {
    const initial = createInitialStore();
    saveStore(initial);
    return initial;
  }
}
function saveStore(store) {
  ensureDirectories();
  try {
    const tmpPath = `${STORE_PATH}.tmp`;
    fs.writeFileSync(tmpPath, JSON.stringify(store, null, 2), "utf8");
    fs.renameSync(tmpPath, STORE_PATH);
  } catch {
  }
}
function extractToken(req) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7).trim();
  }
  return null;
}
async function createApp(options) {
  const isServerless = Boolean(options?.serverless || IS_SERVERLESS);
  const app = express();
  const store = loadStore();
  const supabaseEnv = getSupabaseEnv();
  const syncInitialFromSupabase = async () => {
    if (!supabaseEnv) return;
    const [remoteConfig] = await Promise.all([
      loadSiteConfigFromSupabase(supabaseEnv),
      loadAuthFromSupabase(supabaseEnv, store.auth)
    ]);
    if (remoteConfig) {
      store.siteConfig = remoteConfig;
      saveStore(store);
    }
  };
  let initialSyncPromise = Promise.resolve();
  if (supabaseEnv) {
    initialSyncPromise = syncInitialFromSupabase();
    if (isServerless) {
      await initialSyncPromise;
    }
  }
  const findActiveSession = (token) => {
    if (!token) return null;
    const stored = store.auth.sessions.find((s) => s.token === token && s.expiresAt > Date.now());
    if (stored) return stored;
    return verifySignedToken(token);
  };
  app.use("/uploads", express.static(UPLOADS_DIR));
  if (isServerless) {
    const bundledUploadsDir = path.resolve(ROOT_DIR, "uploads");
    if (fs.existsSync(bundledUploadsDir)) {
      app.use("/uploads", express.static(bundledUploadsDir));
    }
  }
  app.post(
    "/api/upload",
    express.raw({ type: "*/*", limit: "100mb" }),
    async (req, res) => {
      const token = extractToken(req);
      const session = findActiveSession(token);
      if (!session) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      const rawName = String(req.query.filename || "media");
      const extFromName = path.extname(rawName).toLowerCase();
      const contentType = String(req.headers["content-type"] || "").toLowerCase();
      const imageExts = /* @__PURE__ */ new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".avif", ".bmp"]);
      const videoExts = /* @__PURE__ */ new Set([".mp4", ".webm", ".mov", ".m4v", ".ogg"]);
      const isImage = contentType.startsWith("image/") || imageExts.has(extFromName);
      const isVideo = contentType.startsWith("video/") || videoExts.has(extFromName);
      if (!isImage && !isVideo) {
        res.status(400).json({ error: "Only image and video files are allowed." });
        return;
      }
      const bodyBuffer = req.body;
      if (!Buffer.isBuffer(bodyBuffer) || bodyBuffer.length === 0) {
        res.status(400).json({ error: "Empty upload payload." });
        return;
      }
      const fallbackExt = isVideo ? ".mp4" : ".png";
      const safeExt = /^[.][a-z0-9]{2,5}$/.test(extFromName) ? extFromName : fallbackExt;
      const baseName = path.basename(rawName, extFromName).replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 40) || "upload";
      const finalFileName = `${Date.now()}-${baseName}${safeExt}`;
      if (supabaseEnv) {
        const mime = contentType && contentType !== "application/octet-stream" ? contentType : isVideo ? "video/mp4" : "image/png";
        const publicUrl = await uploadToSupabaseStorage(
          supabaseEnv,
          finalFileName,
          mime,
          bodyBuffer
        );
        if (publicUrl) {
          res.json({
            url: publicUrl,
            type: isVideo ? "video" : "image",
            size: bodyBuffer.length
          });
          return;
        }
      }
      const targetPath = path.resolve(UPLOADS_DIR, finalFileName);
      ensureDirectories();
      fs.writeFileSync(targetPath, bodyBuffer);
      res.json({
        url: `/uploads/${finalFileName}`,
        type: isVideo ? "video" : "image",
        size: bodyBuffer.length
      });
    }
  );
  app.use("/api", express.json({ limit: "10mb" }));
  const requireAuth = (req, res, next) => {
    const token = extractToken(req);
    const session = findActiveSession(token);
    if (!session) {
      res.status(401).json({ error: "Authentication required." });
      return;
    }
    req.session = session;
    next();
  };
  app.get("/api/health", async (_req, res) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    const status = await checkSupabaseHealth(supabaseEnv);
    res.json({
      ok: true,
      ...status,
      storageMode: status.supabaseConnected ? "supabase" : "local"
    });
  });
  app.get("/api/site", async (_req, res) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    if (supabaseEnv) {
      const remoteConfig = await loadSiteConfigFromSupabase(supabaseEnv);
      if (remoteConfig) {
        store.siteConfig = remoteConfig;
      }
    }
    res.json({ config: store.siteConfig });
  });
  app.post("/api/auth/login", async (req, res) => {
    await initialSyncPromise;
    if (isServerless && supabaseEnv) {
      await loadAuthFromSupabase(supabaseEnv, store.auth);
    }
    const rawPassword = typeof req.body?.password === "string" ? req.body.password : "";
    const trimmedPassword = rawPassword.trim();
    if (!rawPassword) {
      res.status(400).json({ error: "Password is required." });
      return;
    }
    let role = null;
    let name = "";
    if (verifyPassword(rawPassword, store.auth.adminPasswordHash) || trimmedPassword && verifyPassword(trimmedPassword, store.auth.adminPasswordHash)) {
      role = "admin";
      name = "Administrator";
    } else if (store.auth.managerEnabled && (verifyPassword(rawPassword, store.auth.managerPasswordHash) || trimmedPassword && verifyPassword(trimmedPassword, store.auth.managerPasswordHash))) {
      role = "manager";
      name = store.auth.managerName || "Store Manager";
    }
    if (!role) {
      res.status(401).json({ error: "Incorrect password." });
      return;
    }
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1e3;
    const token = createSignedToken(role, name, expiresAt);
    const session = {
      token,
      role,
      name,
      expiresAt
    };
    store.auth.sessions = [
      ...store.auth.sessions.filter((s) => s.expiresAt > Date.now()),
      session
    ].slice(-20);
    saveStore(store);
    res.json({
      token,
      role,
      name,
      managerEnabled: store.auth.managerEnabled,
      managerName: store.auth.managerName
    });
  });
  app.get("/api/auth/me", requireAuth, async (req, res) => {
    if (isServerless && supabaseEnv) {
      await loadAuthFromSupabase(supabaseEnv, store.auth);
    }
    res.json({
      role: req.session?.role,
      name: req.session?.name,
      managerEnabled: store.auth.managerEnabled,
      managerName: store.auth.managerName
    });
  });
  app.post("/api/auth/logout", requireAuth, (req, res) => {
    const token = extractToken(req);
    store.auth.sessions = store.auth.sessions.filter((s) => s.token !== token);
    saveStore(store);
    res.json({ ok: true });
  });
  app.put("/api/site", requireAuth, async (req, res) => {
    const incoming = req.body?.config;
    if (!incoming || !Array.isArray(incoming.products)) {
      res.status(400).json({ error: "Invalid site configuration payload." });
      return;
    }
    store.siteConfig = incoming;
    saveStore(store);
    if (supabaseEnv) {
      const sync = await syncSiteConfigToSupabase(supabaseEnv, store.siteConfig);
      if (!sync.ok) {
        res.status(502).json({ error: sync.error || "Failed to sync changes to Supabase." });
        return;
      }
    }
    res.json({ ok: true, config: store.siteConfig });
  });
  app.post("/api/site/reset", requireAuth, async (req, res) => {
    if (req.session?.role !== "admin") {
      res.status(403).json({ error: "Only Admin can reset the site." });
      return;
    }
    store.siteConfig = structuredClone(DEFAULT_SITE_CONFIG);
    saveStore(store);
    if (supabaseEnv) {
      const sync = await syncSiteConfigToSupabase(supabaseEnv, store.siteConfig);
      if (!sync.ok) {
        res.status(502).json({ error: sync.error || "Failed to reset site in Supabase." });
        return;
      }
    }
    res.json({ ok: true, config: store.siteConfig });
  });
  app.post("/api/auth/change-password", requireAuth, async (req, res) => {
    if (req.session?.role !== "admin") {
      res.status(403).json({ error: "Only Admin can change the Admin password." });
      return;
    }
    if (isServerless && supabaseEnv) {
      await loadAuthFromSupabase(supabaseEnv, store.auth);
    }
    const currentPassword = typeof req.body?.currentPassword === "string" ? req.body.currentPassword : "";
    const newPassword = typeof req.body?.newPassword === "string" ? req.body.newPassword : "";
    if (!verifyPassword(currentPassword, store.auth.adminPasswordHash)) {
      res.status(401).json({ error: "Current Admin password is incorrect." });
      return;
    }
    if (newPassword.length < 6) {
      res.status(400).json({ error: "New password must be at least 6 characters." });
      return;
    }
    store.auth.adminPasswordHash = hashPassword(newPassword);
    saveStore(store);
    if (supabaseEnv) {
      const sync = await syncAuthToSupabase(supabaseEnv, store.auth);
      if (!sync.ok) {
        res.status(502).json({ error: sync.error || "Failed to sync Admin password to Supabase." });
        return;
      }
    }
    res.json({ ok: true });
  });
  app.post("/api/auth/manager", requireAuth, async (req, res) => {
    if (req.session?.role !== "admin") {
      res.status(403).json({ error: "Only Admin can assign Manager credentials." });
      return;
    }
    if (isServerless && supabaseEnv) {
      await loadAuthFromSupabase(supabaseEnv, store.auth);
    }
    const enabled = Boolean(req.body?.enabled);
    const managerName = typeof req.body?.managerName === "string" && req.body.managerName.trim() ? req.body.managerName.trim() : "Store Manager";
    const managerPassword = typeof req.body?.managerPassword === "string" ? req.body.managerPassword : "";
    if (enabled && !store.auth.managerPasswordHash && managerPassword.length < 6) {
      res.status(400).json({ error: "Manager password must be at least 6 characters." });
      return;
    }
    if (managerPassword && managerPassword.length < 6) {
      res.status(400).json({ error: "Manager password must be at least 6 characters." });
      return;
    }
    store.auth.managerEnabled = enabled;
    store.auth.managerName = managerName;
    if (managerPassword) {
      store.auth.managerPasswordHash = hashPassword(managerPassword);
    }
    if (!enabled) {
      store.auth.sessions = store.auth.sessions.filter((s) => s.role !== "manager");
    }
    saveStore(store);
    if (supabaseEnv) {
      const sync = await syncAuthToSupabase(supabaseEnv, store.auth);
      if (!sync.ok) {
        res.status(502).json({ error: sync.error || "Failed to sync Manager credentials to Supabase." });
        return;
      }
    }
    res.json({
      ok: true,
      managerEnabled: store.auth.managerEnabled,
      managerName: store.auth.managerName,
      hasPassword: Boolean(store.auth.managerPasswordHash)
    });
  });
  app.use((err, req, res, next) => {
    if (res.headersSent) {
      next(err);
      return;
    }
    const status = typeof err?.status === "number" ? err.status : 500;
    const message = err instanceof Error ? err.message : "Unexpected server error.";
    if (req.path.startsWith("/api")) {
      res.status(status).json({ error: message });
      return;
    }
    res.status(status).send(message);
  });
  return app;
}
async function startServer() {
  const app = await createApp();
  if (process.env.NODE_ENV !== "production") {
    const viteModule = "vite";
    const { createServer: createViteServer } = await import(
      /* @vite-ignore */
      viteModule
    );
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(ROOT_DIR, "dist");
    app.use(express.static(distDir));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(distDir, "index.html"));
    });
  }
  app.listen(PORT, HOST, () => {
    console.log(`MediTrust server listening on http://${HOST}:${PORT}`);
  });
}
var currentFileUrl = typeof import.meta !== "undefined" ? import.meta.url : void 0;
var isMainModule = Boolean(process.argv[1]) && Boolean(currentFileUrl) && path.resolve(process.argv[1]) === (currentFileUrl ? path.resolve(fileURLToPath(currentFileUrl)) : "");
if (!IS_SERVERLESS && isMainModule) {
  startServer().catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });
}
export {
  createApp
};
