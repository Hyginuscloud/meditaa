import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { DEFAULT_SITE_CONFIG } from './src/data/siteConfig.ts';
import type { SiteConfig } from './src/data/siteConfig.ts';

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;
const IS_SERVERLESS = Boolean(
  process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.LAMBDA_TASK_ROOT ||
    process.env.NETLIFY_FUNCTION_RUNTIME ||
    (process.env.NETLIFY && !process.env.NETLIFY_DEV)
);
const ROOT_DIR = process.cwd();
const WRITABLE_DIR = IS_SERVERLESS ? os.tmpdir() : ROOT_DIR;
const DATA_DIR = path.resolve(WRITABLE_DIR, IS_SERVERLESS ? 'meditrust-data' : 'data');
const STORE_PATH = path.resolve(DATA_DIR, 'store.json');
const UPLOADS_DIR = path.resolve(WRITABLE_DIR, IS_SERVERLESS ? 'meditrust-uploads' : 'uploads');

interface SessionRecord {
  token: string;
  role: 'admin' | 'manager';
  name: string;
  expiresAt: number;
}

interface AuthStore {
  adminPasswordHash: string;
  managerEnabled: boolean;
  managerName: string;
  managerPasswordHash: string | null;
  sessions: SessionRecord[];
}

interface PersistedStore {
  siteConfig: SiteConfig;
  auth: AuthStore;
}

function getSessionSecret(): string {
  return (
    process.env.SESSION_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    'meditrust-owerri-session-secret-v1'
  );
}

function createSignedToken(role: 'admin' | 'manager', name: string, expiresAt: number): string {
  const payload = Buffer.from(JSON.stringify({ role, name, exp: expiresAt })).toString('base64url');
  const sig = crypto
    .createHmac('sha256', getSessionSecret())
    .update(payload)
    .digest('base64url');
  return `${payload}.${sig}`;
}

function verifySignedToken(token: string | null): SessionRecord | null {
  if (!token || !token.includes('.')) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payload, sig] = parts;
  const expectedSig = crypto
    .createHmac('sha256', getSessionSecret())
    .update(payload)
    .digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      role?: string;
      name?: string;
      exp?: number;
    };
    if (!parsed.exp || parsed.exp <= Date.now()) return null;
    const role = parsed.role === 'manager' ? 'manager' : 'admin';
    return {
      token,
      role,
      name: parsed.name || (role === 'admin' ? 'Administrator' : 'Store Manager'),
      expiresAt: parsed.exp,
    };
  } catch {
    return null;
  }
}

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

function verifyPassword(password: string, storedHash: string | null): boolean {
  if (!storedHash || !storedHash.includes(':')) return false;
  const [salt, keyHex] = storedHash.split(':');
  if (!salt || !keyHex) return false;
  const keyBuf = Buffer.from(keyHex, 'hex');
  const derivedBuf = crypto.scryptSync(password, salt, 64);
  if (keyBuf.length !== derivedBuf.length) return false;
  return crypto.timingSafeEqual(keyBuf, derivedBuf);
}

function ensureDirectories(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
  } catch {
    // Ignore read-only filesystem errors in serverless environments
  }
}

function createInitialStore(): PersistedStore {
  return {
    siteConfig: structuredClone(DEFAULT_SITE_CONFIG),
    auth: {
      adminPasswordHash: hashPassword('Admin@1252'),
      managerEnabled: false,
      managerName: 'Store Manager',
      managerPasswordHash: null,
      sessions: [],
    },
  };
}

function mergeSiteConfig(incoming?: Partial<SiteConfig> | null): SiteConfig {
  const fallback = structuredClone(DEFAULT_SITE_CONFIG);
  if (!incoming) return fallback;
  return {
    ...fallback,
    ...incoming,
    brand: { ...fallback.brand, ...(incoming.brand ?? {}) },
    topBar: { ...fallback.topBar, ...(incoming.topBar ?? {}) },
    socials: { ...fallback.socials, ...(incoming.socials ?? {}) },
    hero: { ...fallback.hero, ...(incoming.hero ?? {}) },
    categoriesSection: {
      ...fallback.categoriesSection,
      ...(incoming.categoriesSection ?? {}),
    },
    productsSection: {
      ...fallback.productsSection,
      ...(incoming.productsSection ?? {}),
    },
    servicesSection: {
      ...fallback.servicesSection,
      ...(incoming.servicesSection ?? {}),
    },
    storySection: {
      ...fallback.storySection,
      ...(incoming.storySection ?? {}),
    },
    reviewsSection: {
      ...fallback.reviewsSection,
      ...(incoming.reviewsSection ?? {}),
    },
    faqSection: {
      ...fallback.faqSection,
      ...(incoming.faqSection ?? {}),
    },
    contactSection: {
      ...fallback.contactSection,
      ...(incoming.contactSection ?? {}),
    },
    footer: { ...fallback.footer, ...(incoming.footer ?? {}) },
    mediaSection: {
      ...fallback.mediaSection,
      ...(incoming.mediaSection ?? {}),
    },
    mediaGallery: incoming.mediaGallery ?? fallback.mediaGallery,
  };
}

interface SupabaseEnv {
  url: string;
  serviceKey: string;
}

function cleanEnvValue(raw: string | undefined): string {
  if (!raw) return '';
  return raw.trim().replace(/^(['"])(.*)\1$/, '$2').trim();
}

function getSupabaseEnv(): SupabaseEnv | null {
  let url = cleanEnvValue(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL)
    .replace(/\/rest\/v1\/?$/i, '')
    .replace(/\/+$/, '');
  if (url && !/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }
  const serviceKey = cleanEnvValue(
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SERVICE_KEY ||
      process.env.SUPABASE_SECRET_KEY ||
      process.env.SUPABASE_KEY
  );
  if (
    !url ||
    !serviceKey ||
    url.includes('YOUR_PROJECT_REF') ||
    serviceKey.includes('MY_SUPABASE_')
  ) {
    return null;
  }
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
  } catch {
    return null;
  }
  return { url, serviceKey };
}

async function loadSiteConfigFromSupabase(sb: SupabaseEnv): Promise<SiteConfig | null> {
  try {
    const res = await fetch(`${sb.url}/rest/v1/site_settings?id=eq.main&select=config`, {
      headers: {
        apikey: sb.serviceKey,
        Authorization: `Bearer ${sb.serviceKey}`,
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const rows = (await res.json()) as Array<{ config?: Partial<SiteConfig> }>;
    const rowConfig = rows[0]?.config;
    if (!rowConfig || typeof rowConfig !== 'object') return null;
    return mergeSiteConfig(rowConfig);
  } catch {
    return null;
  }
}

interface SyncResult {
  ok: boolean;
  error?: string;
}

function buildPostgrestInList(ids: string[]): string {
  return ids
    .map((id) => `"${id.replace(/[^a-zA-Z0-9_.-]/g, '')}"`)
    .join(',');
}

async function syncSiteConfigToSupabase(
  sb: SupabaseEnv,
  config: SiteConfig
): Promise<SyncResult> {
  try {
    const settingsRes = await fetch(`${sb.url}/rest/v1/site_settings?on_conflict=id`, {
      method: 'POST',
      headers: {
        apikey: sb.serviceKey,
        Authorization: `Bearer ${sb.serviceKey}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates',
      },
      body: JSON.stringify([{ id: 'main', config }]),
      signal: AbortSignal.timeout(10000),
    });
    if (!settingsRes.ok) {
      const detail = await settingsRes.text().catch(() => '');
      return {
        ok: false,
        error: `Supabase site_settings sync failed (${settingsRes.status}): ${detail.slice(0, 140)}`,
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
        sort_order: idx + 1,
      }));
      await fetch(`${sb.url}/rest/v1/categories?on_conflict=id`, {
        method: 'POST',
        headers: {
          apikey: sb.serviceKey,
          Authorization: `Bearer ${sb.serviceKey}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates',
        },
        body: JSON.stringify(catRows),
        signal: AbortSignal.timeout(10000),
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
        sort_order: idx + 1,
      }));
      const prodRes = await fetch(`${sb.url}/rest/v1/products?on_conflict=id`, {
        method: 'POST',
        headers: {
          apikey: sb.serviceKey,
          Authorization: `Bearer ${sb.serviceKey}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates',
        },
        body: JSON.stringify(productRows),
        signal: AbortSignal.timeout(10000),
      });
      if (prodRes.ok) {
        const keepIds = buildPostgrestInList(config.products.map((p) => p.id));
        await fetch(`${sb.url}/rest/v1/products?id=not.in.(${keepIds})`, {
          method: 'DELETE',
          headers: {
            apikey: sb.serviceKey,
            Authorization: `Bearer ${sb.serviceKey}`,
          },
          signal: AbortSignal.timeout(10000),
        });
      }
    } else {
      await fetch(`${sb.url}/rest/v1/products?id=neq.__none__`, {
        method: 'DELETE',
        headers: {
          apikey: sb.serviceKey,
          Authorization: `Bearer ${sb.serviceKey}`,
        },
        signal: AbortSignal.timeout(10000),
      });
    }

    if (config.mediaGallery.length > 0) {
      const mediaRows = config.mediaGallery.map((m) => ({
        id: m.id,
        type: m.type,
        url: m.url,
        title: m.title,
        caption: m.caption,
        placement: m.placement,
      }));
      const mediaRes = await fetch(`${sb.url}/rest/v1/media_gallery?on_conflict=id`, {
        method: 'POST',
        headers: {
          apikey: sb.serviceKey,
          Authorization: `Bearer ${sb.serviceKey}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates',
        },
        body: JSON.stringify(mediaRows),
        signal: AbortSignal.timeout(10000),
      });
      if (mediaRes.ok) {
        const keepMediaIds = buildPostgrestInList(config.mediaGallery.map((m) => m.id));
        await fetch(`${sb.url}/rest/v1/media_gallery?id=not.in.(${keepMediaIds})`, {
          method: 'DELETE',
          headers: {
            apikey: sb.serviceKey,
            Authorization: `Bearer ${sb.serviceKey}`,
          },
          signal: AbortSignal.timeout(10000),
        });
      }
    } else {
      await fetch(`${sb.url}/rest/v1/media_gallery?id=neq.__none__`, {
        method: 'DELETE',
        headers: {
          apikey: sb.serviceKey,
          Authorization: `Bearer ${sb.serviceKey}`,
        },
        signal: AbortSignal.timeout(10000),
      });
    }
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn('Supabase sync skipped:', msg);
    return { ok: false, error: msg };
  }
}

async function ensureSupabaseBucket(sb: SupabaseEnv): Promise<boolean> {
  try {
    const checkRes = await fetch(`${sb.url}/storage/v1/bucket/meditrust-media`, {
      headers: {
        apikey: sb.serviceKey,
        Authorization: `Bearer ${sb.serviceKey}`,
      },
      signal: AbortSignal.timeout(8000),
    });
    if (checkRes.ok) return true;
    const createRes = await fetch(`${sb.url}/storage/v1/bucket`, {
      method: 'POST',
      headers: {
        apikey: sb.serviceKey,
        Authorization: `Bearer ${sb.serviceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: 'meditrust-media',
        name: 'meditrust-media',
        public: true,
      }),
      signal: AbortSignal.timeout(8000),
    });
    return createRes.ok;
  } catch {
    return false;
  }
}

async function uploadToSupabaseStorage(
  sb: SupabaseEnv,
  fileName: string,
  contentType: string,
  buffer: Buffer
): Promise<string | null> {
  const cleanMime = (contentType || 'application/octet-stream').split(';')[0].trim();
  const encodedName = encodeURIComponent(fileName);
  const doUpload = async () =>
    fetch(`${sb.url}/storage/v1/object/meditrust-media/${encodedName}`, {
      method: 'POST',
      headers: {
        apikey: sb.serviceKey,
        Authorization: `Bearer ${sb.serviceKey}`,
        'Content-Type': cleanMime || 'application/octet-stream',
        'x-upsert': 'true',
      },
      body: new Uint8Array(buffer),
      signal: AbortSignal.timeout(30000),
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

async function loadAuthFromSupabase(sb: SupabaseEnv, auth: AuthStore): Promise<void> {
  try {
    const res = await fetch(
      `${sb.url}/rest/v1/admin_credentials?id=eq.default&select=admin_password_hash,manager_enabled,manager_name,manager_password_hash`,
      {
        headers: {
          apikey: sb.serviceKey,
          Authorization: `Bearer ${sb.serviceKey}`,
        },
        signal: AbortSignal.timeout(8000),
      }
    );
    if (!res.ok) return;
    const rows = (await res.json()) as Array<{
      admin_password_hash?: string;
      manager_enabled?: boolean;
      manager_name?: string;
      manager_password_hash?: string | null;
    }>;
    const row = rows[0];
    if (!row) return;
    if (row.admin_password_hash && row.admin_password_hash.includes(':')) {
      auth.adminPasswordHash = row.admin_password_hash;
    }
    if (typeof row.manager_enabled === 'boolean') {
      auth.managerEnabled = row.manager_enabled;
    }
    if (row.manager_name) {
      auth.managerName = row.manager_name;
    }
    if (row.manager_password_hash && row.manager_password_hash.includes(':')) {
      auth.managerPasswordHash = row.manager_password_hash;
    }
  } catch {
    // Fallback to local auth
  }
}

async function syncAuthToSupabase(sb: SupabaseEnv, auth: AuthStore): Promise<SyncResult> {
  try {
    const res = await fetch(`${sb.url}/rest/v1/admin_credentials?on_conflict=id`, {
      method: 'POST',
      headers: {
        apikey: sb.serviceKey,
        Authorization: `Bearer ${sb.serviceKey}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates',
      },
      body: JSON.stringify([
        {
          id: 'default',
          admin_password_hash: auth.adminPasswordHash,
          manager_enabled: auth.managerEnabled,
          manager_name: auth.managerName,
          manager_password_hash: auth.managerPasswordHash,
        },
      ]),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      return {
        ok: false,
        error: `Supabase auth sync failed (${res.status}): ${detail.slice(0, 140)}`,
      };
    }
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Supabase auth sync failed',
    };
  }
}

async function checkSupabaseHealth(sb: SupabaseEnv | null): Promise<{
  supabaseConnected: boolean;
  supabaseReachable: boolean;
  serviceRoleVerified: boolean;
  storageBucketReady: boolean;
  issue: string | null;
}> {
  if (!sb) {
    return {
      supabaseConnected: false,
      supabaseReachable: false,
      serviceRoleVerified: false,
      storageBucketReady: false,
      issue: 'SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not configured.',
    };
  }
  try {
    const headers = {
      apikey: sb.serviceKey,
      Authorization: `Bearer ${sb.serviceKey}`,
    };
    const [settingsRes, credsRes, bucketRes] = await Promise.all([
      fetch(`${sb.url}/rest/v1/site_settings?id=eq.main&select=id`, {
        headers,
        signal: AbortSignal.timeout(6000),
      }),
      fetch(`${sb.url}/rest/v1/admin_credentials?id=eq.default&select=id`, {
        headers,
        signal: AbortSignal.timeout(6000),
      }),
      fetch(`${sb.url}/storage/v1/bucket/meditrust-media`, {
        headers,
        signal: AbortSignal.timeout(6000),
      }),
    ]);

    const supabaseReachable = settingsRes.ok;
    const serviceRoleVerified = credsRes.ok;
    const storageBucketReady = bucketRes.ok || (serviceRoleVerified && (await ensureSupabaseBucket(sb)));

    let issue: string | null = null;
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
      issue,
    };
  } catch (err) {
    return {
      supabaseConnected: false,
      supabaseReachable: false,
      serviceRoleVerified: false,
      storageBucketReady: false,
      issue: err instanceof Error ? err.message : 'Unable to reach Supabase.',
    };
  }
}

function loadStore(): PersistedStore {
  ensureDirectories();
  const bundledStorePath = path.resolve(ROOT_DIR, 'data', 'store.json');
  const readPath = fs.existsSync(STORE_PATH)
    ? STORE_PATH
    : fs.existsSync(bundledStorePath)
    ? bundledStorePath
    : null;

  if (!readPath) {
    const initial = createInitialStore();
    saveStore(initial);
    return initial;
  }
  try {
    const raw = fs.readFileSync(readPath, 'utf8');
    const parsed = JSON.parse(raw) as Partial<PersistedStore>;
    const fallback = createInitialStore();
    const mergedConfig = mergeSiteConfig(parsed.siteConfig);

    return {
      siteConfig: mergedConfig,
      auth: {
        adminPasswordHash: parsed.auth?.adminPasswordHash || fallback.auth.adminPasswordHash,
        managerEnabled: Boolean(parsed.auth?.managerEnabled),
        managerName: parsed.auth?.managerName || 'Store Manager',
        managerPasswordHash: parsed.auth?.managerPasswordHash ?? null,
        sessions: Array.isArray(parsed.auth?.sessions)
          ? parsed.auth.sessions.filter((s) => s.expiresAt > Date.now())
          : [],
      },
    };
  } catch {
    const initial = createInitialStore();
    saveStore(initial);
    return initial;
  }
}

function saveStore(store: PersistedStore): void {
  ensureDirectories();
  try {
    const tmpPath = `${STORE_PATH}.tmp`;
    fs.writeFileSync(tmpPath, JSON.stringify(store, null, 2), 'utf8');
    fs.renameSync(tmpPath, STORE_PATH);
  } catch {
    // Ignore filesystem write errors on read-only serverless hosts
  }
}

interface AuthedRequest extends Request {
  session?: SessionRecord;
}

function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  return null;
}

export async function createApp(options?: { serverless?: boolean }): Promise<express.Express> {
  const isServerless = Boolean(options?.serverless || IS_SERVERLESS);
  const app = express();
  const store = loadStore();
  const supabaseEnv = getSupabaseEnv();
  if (supabaseEnv) {
    const [remoteConfig] = await Promise.all([
      loadSiteConfigFromSupabase(supabaseEnv),
      loadAuthFromSupabase(supabaseEnv, store.auth),
    ]);
    if (remoteConfig) {
      store.siteConfig = remoteConfig;
      saveStore(store);
    }
  }

  const findActiveSession = (token: string | null): SessionRecord | null => {
    if (!token) return null;
    const stored = store.auth.sessions.find((s) => s.token === token && s.expiresAt > Date.now());
    if (stored) return stored;
    return verifySignedToken(token);
  };

  // Serve uploaded images and videos
  app.use('/uploads', express.static(UPLOADS_DIR));
  if (isServerless) {
    const bundledUploadsDir = path.resolve(ROOT_DIR, 'uploads');
    if (fs.existsSync(bundledUploadsDir)) {
      app.use('/uploads', express.static(bundledUploadsDir));
    }
  }

  // Upload endpoint using raw body for fast binary images & videos
  app.post(
    '/api/upload',
    express.raw({ type: '*/*', limit: '100mb' }),
    async (req: AuthedRequest, res: Response) => {
      const token = extractToken(req);
      const session = findActiveSession(token);
      if (!session) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const rawName = String(req.query.filename || 'media');
      const extFromName = path.extname(rawName).toLowerCase();
      const contentType = String(req.headers['content-type'] || '').toLowerCase();
      const imageExts = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.avif', '.bmp']);
      const videoExts = new Set(['.mp4', '.webm', '.mov', '.m4v', '.ogg']);
      const isImage = contentType.startsWith('image/') || imageExts.has(extFromName);
      const isVideo = contentType.startsWith('video/') || videoExts.has(extFromName);
      if (!isImage && !isVideo) {
        res.status(400).json({ error: 'Only image and video files are allowed.' });
        return;
      }

      const bodyBuffer = req.body;
      if (!Buffer.isBuffer(bodyBuffer) || bodyBuffer.length === 0) {
        res.status(400).json({ error: 'Empty upload payload.' });
        return;
      }

      const fallbackExt = isVideo ? '.mp4' : '.png';
      const safeExt = /^[.][a-z0-9]{2,5}$/.test(extFromName) ? extFromName : fallbackExt;
      const baseName = path
        .basename(rawName, extFromName)
        .replace(/[^a-zA-Z0-9_-]/g, '-')
        .slice(0, 40) || 'upload';
      const finalFileName = `${Date.now()}-${baseName}${safeExt}`;

      if (supabaseEnv) {
        const mime = contentType && contentType !== 'application/octet-stream'
          ? contentType
          : isVideo
          ? 'video/mp4'
          : 'image/png';
        const publicUrl = await uploadToSupabaseStorage(
          supabaseEnv,
          finalFileName,
          mime,
          bodyBuffer
        );
        if (publicUrl) {
          res.json({
            url: publicUrl,
            type: isVideo ? 'video' : 'image',
            size: bodyBuffer.length,
          });
          return;
        }
      }

      const targetPath = path.resolve(UPLOADS_DIR, finalFileName);
      ensureDirectories();
      fs.writeFileSync(targetPath, bodyBuffer);

      res.json({
        url: `/uploads/${finalFileName}`,
        type: isVideo ? 'video' : 'image',
        size: bodyBuffer.length,
      });
    }
  );

  // JSON parser for remaining API routes
  app.use('/api', express.json({ limit: '10mb' }));

  const requireAuth = (req: AuthedRequest, res: Response, next: NextFunction) => {
    const token = extractToken(req);
    const session = findActiveSession(token);
    if (!session) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }
    req.session = session;
    next();
  };

  // Health & live Supabase verification
  app.get('/api/health', async (_req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    const status = await checkSupabaseHealth(supabaseEnv);
    res.json({
      ok: true,
      ...status,
      storageMode: status.supabaseConnected ? 'supabase' : 'local',
    });
  });

  // Public site configuration (always fresh, never cached)
  app.get('/api/site', async (_req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    if (supabaseEnv) {
      const remoteConfig = await loadSiteConfigFromSupabase(supabaseEnv);
      if (remoteConfig) {
        store.siteConfig = remoteConfig;
      }
    }
    res.json({ config: store.siteConfig });
  });

  // Login (supports Admin or Manager password)
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    if (isServerless && supabaseEnv) {
      await loadAuthFromSupabase(supabaseEnv, store.auth);
    }
    const rawPassword = typeof req.body?.password === 'string' ? req.body.password : '';
    const trimmedPassword = rawPassword.trim();
    if (!rawPassword) {
      res.status(400).json({ error: 'Password is required.' });
      return;
    }

    let role: 'admin' | 'manager' | null = null;
    let name = '';

    if (
      verifyPassword(rawPassword, store.auth.adminPasswordHash) ||
      (trimmedPassword && verifyPassword(trimmedPassword, store.auth.adminPasswordHash))
    ) {
      role = 'admin';
      name = 'Administrator';
    } else if (
      store.auth.managerEnabled &&
      (verifyPassword(rawPassword, store.auth.managerPasswordHash) ||
        (trimmedPassword && verifyPassword(trimmedPassword, store.auth.managerPasswordHash)))
    ) {
      role = 'manager';
      name = store.auth.managerName || 'Store Manager';
    }

    if (!role) {
      res.status(401).json({ error: 'Incorrect password.' });
      return;
    }

    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
    const token = createSignedToken(role, name, expiresAt);
    const session: SessionRecord = {
      token,
      role,
      name,
      expiresAt,
    };

    store.auth.sessions = [
      ...store.auth.sessions.filter((s) => s.expiresAt > Date.now()),
      session,
    ].slice(-20);
    saveStore(store);

    res.json({
      token,
      role,
      name,
      managerEnabled: store.auth.managerEnabled,
      managerName: store.auth.managerName,
    });
  });

  // Verify current session
  app.get('/api/auth/me', requireAuth, async (req: AuthedRequest, res: Response) => {
    if (isServerless && supabaseEnv) {
      await loadAuthFromSupabase(supabaseEnv, store.auth);
    }
    res.json({
      role: req.session?.role,
      name: req.session?.name,
      managerEnabled: store.auth.managerEnabled,
      managerName: store.auth.managerName,
    });
  });

  // Logout
  app.post('/api/auth/logout', requireAuth, (req: AuthedRequest, res: Response) => {
    const token = extractToken(req);
    store.auth.sessions = store.auth.sessions.filter((s) => s.token !== token);
    saveStore(store);
    res.json({ ok: true });
  });

  // Update entire site config (products, writeups, images, media gallery)
  app.put('/api/site', requireAuth, async (req: AuthedRequest, res: Response) => {
    const incoming = req.body?.config as SiteConfig | undefined;
    if (!incoming || !Array.isArray(incoming.products)) {
      res.status(400).json({ error: 'Invalid site configuration payload.' });
      return;
    }
    store.siteConfig = incoming;
    saveStore(store);
    if (supabaseEnv) {
      const sync = await syncSiteConfigToSupabase(supabaseEnv, store.siteConfig);
      if (!sync.ok) {
        res.status(502).json({ error: sync.error || 'Failed to sync changes to Supabase.' });
        return;
      }
    }
    res.json({ ok: true, config: store.siteConfig });
  });

  // Reset site config to factory defaults (Admin only)
  app.post('/api/site/reset', requireAuth, async (req: AuthedRequest, res: Response) => {
    if (req.session?.role !== 'admin') {
      res.status(403).json({ error: 'Only Admin can reset the site.' });
      return;
    }
    store.siteConfig = structuredClone(DEFAULT_SITE_CONFIG);
    saveStore(store);
    if (supabaseEnv) {
      const sync = await syncSiteConfigToSupabase(supabaseEnv, store.siteConfig);
      if (!sync.ok) {
        res.status(502).json({ error: sync.error || 'Failed to reset site in Supabase.' });
        return;
      }
    }
    res.json({ ok: true, config: store.siteConfig });
  });

  // Change Admin password (Admin only)
  app.post('/api/auth/change-password', requireAuth, async (req: AuthedRequest, res: Response) => {
    if (req.session?.role !== 'admin') {
      res.status(403).json({ error: 'Only Admin can change the Admin password.' });
      return;
    }
    if (isServerless && supabaseEnv) {
      await loadAuthFromSupabase(supabaseEnv, store.auth);
    }
    const currentPassword =
      typeof req.body?.currentPassword === 'string' ? req.body.currentPassword : '';
    const newPassword = typeof req.body?.newPassword === 'string' ? req.body.newPassword : '';

    if (!verifyPassword(currentPassword, store.auth.adminPasswordHash)) {
      res.status(401).json({ error: 'Current Admin password is incorrect.' });
      return;
    }
    if (newPassword.length < 6) {
      res.status(400).json({ error: 'New password must be at least 6 characters.' });
      return;
    }

    store.auth.adminPasswordHash = hashPassword(newPassword);
    saveStore(store);
    if (supabaseEnv) {
      const sync = await syncAuthToSupabase(supabaseEnv, store.auth);
      if (!sync.ok) {
        res.status(502).json({ error: sync.error || 'Failed to sync Admin password to Supabase.' });
        return;
      }
    }
    res.json({ ok: true });
  });

  // Assign or update Manager password (Admin only)
  app.post('/api/auth/manager', requireAuth, async (req: AuthedRequest, res: Response) => {
    if (req.session?.role !== 'admin') {
      res.status(403).json({ error: 'Only Admin can assign Manager credentials.' });
      return;
    }
    if (isServerless && supabaseEnv) {
      await loadAuthFromSupabase(supabaseEnv, store.auth);
    }

    const enabled = Boolean(req.body?.enabled);
    const managerName =
      typeof req.body?.managerName === 'string' && req.body.managerName.trim()
        ? req.body.managerName.trim()
        : 'Store Manager';
    const managerPassword =
      typeof req.body?.managerPassword === 'string' ? req.body.managerPassword : '';

    if (enabled && !store.auth.managerPasswordHash && managerPassword.length < 6) {
      res.status(400).json({ error: 'Manager password must be at least 6 characters.' });
      return;
    }
    if (managerPassword && managerPassword.length < 6) {
      res.status(400).json({ error: 'Manager password must be at least 6 characters.' });
      return;
    }

    store.auth.managerEnabled = enabled;
    store.auth.managerName = managerName;
    if (managerPassword) {
      store.auth.managerPasswordHash = hashPassword(managerPassword);
    }
    if (!enabled) {
      store.auth.sessions = store.auth.sessions.filter((s) => s.role !== 'manager');
    }

    saveStore(store);
    if (supabaseEnv) {
      const sync = await syncAuthToSupabase(supabaseEnv, store.auth);
      if (!sync.ok) {
        res.status(502).json({ error: sync.error || 'Failed to sync Manager credentials to Supabase.' });
        return;
      }
    }
    res.json({
      ok: true,
      managerEnabled: store.auth.managerEnabled,
      managerName: store.auth.managerName,
      hasPassword: Boolean(store.auth.managerPasswordHash),
    });
  });

  return app;
}

async function startServer(): Promise<void> {
  const app = await createApp();

  if (process.env.NODE_ENV !== 'production') {
    const viteModule = 'vite';
    const { createServer: createViteServer } = (await import(
      /* @vite-ignore */ viteModule
    )) as typeof import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(ROOT_DIR, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MediTrust server listening on http://0.0.0.0:${PORT}`);
  });
}

const currentFileUrl = typeof import.meta !== 'undefined' ? import.meta.url : undefined;
const isMainModule =
  Boolean(process.argv[1]) &&
  Boolean(currentFileUrl) &&
  path.resolve(process.argv[1]) ===
    (currentFileUrl ? path.resolve(fileURLToPath(currentFileUrl)) : '');

if (!IS_SERVERLESS && isMainModule) {
  startServer().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}
