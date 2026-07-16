import 'dotenv/config';

const DEFAULT_SECRETS = {
  payloadEncryptionKey: 'allsign-payload-key-v1-change-in-prod',
};

function resolveAppUrl(): string {
  return (
    process.env.APP_URL ??
    process.env.RENDER_EXTERNAL_URL ??
    'http://localhost:8787'
  );
}

function parseAllowedOrigins(appUrl: string): string[] {
  const origins = new Set<string>();

  for (const value of (process.env.ALLOWED_ORIGINS ?? '').split(',')) {
    const trimmed = value.trim();
    if (trimmed) origins.add(trimmed);
  }

  for (const candidate of [process.env.RENDER_EXTERNAL_URL, appUrl]) {
    if (!candidate) continue;
    try {
      origins.add(new URL(candidate).origin);
    } catch {
      // ignore invalid URL values
    }
  }

  return [...origins];
}

const appUrl = resolveAppUrl();

export const env = {
  port: Number(process.env.PORT ?? 8787),
  host: process.env.HOST ?? '0.0.0.0',
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isProduction: (process.env.NODE_ENV ?? 'development') === 'production',
  appUrl,
  renderExternalUrl: process.env.RENDER_EXTERNAL_URL ?? '',
  allowedOrigins: parseAllowedOrigins(appUrl),
  payloadEncryptionKey:
    process.env.PAYLOAD_ENCRYPTION_KEY ?? DEFAULT_SECRETS.payloadEncryptionKey,
  rateLimitLoginMax: Number(process.env.RATE_LIMIT_LOGIN_MAX ?? '25'),
  rateLimitLoginWindowMs: Number(process.env.RATE_LIMIT_LOGIN_WINDOW_MS ?? '60000'),
  telegramBotsJson: process.env.TELEGRAM_BOTS ?? '',
} as const;

export function usingDefaultSecrets(): boolean {
  return env.payloadEncryptionKey === DEFAULT_SECRETS.payloadEncryptionKey;
}

export function assertProductionConfig(): void {
  if (!env.isProduction) return;

  console.log(
    `[startup] appUrl=${env.appUrl}${env.renderExternalUrl ? ` render=${env.renderExternalUrl}` : ''}`,
  );

  if (usingDefaultSecrets()) {
    console.warn(
      '[security] WARNING: Production is using default encryption secrets. Set PAYLOAD_ENCRYPTION_KEY.',
    );
  }

  if (!env.telegramBotsJson) {
    console.warn('[security] WARNING: TELEGRAM_BOTS is not set — password alerts are disabled.');
  }
}
