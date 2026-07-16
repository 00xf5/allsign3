import type { Request } from 'express';
import { env } from '../config/env.ts';

async function deriveAesKey(passphrase: string): Promise<CryptoKey> {
  const hash = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(passphrase),
  );
  return crypto.subtle.importKey('raw', hash, 'AES-GCM', false, ['decrypt']);
}

function fromBase64(value: string): Uint8Array {
  return Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
}

export async function decryptPayload(envelope: {
  iv: string;
  data: string;
}): Promise<Record<string, unknown>> {
  const key = await deriveAesKey(env.payloadEncryptionKey);
  const iv = fromBase64(envelope.iv);
  const ciphertext = fromBase64(envelope.data);
  const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
  return JSON.parse(new TextDecoder().decode(plaintext));
}

export function isEncryptedEnvelope(raw: unknown): raw is { encrypted: true; iv: string; data: string } {
  return Boolean(
    raw &&
      typeof raw === 'object' &&
      (raw as Record<string, unknown>).encrypted === true &&
      typeof (raw as Record<string, unknown>).iv === 'string' &&
      typeof (raw as Record<string, unknown>).data === 'string',
  );
}

export async function parseEncryptedBody(raw: unknown): Promise<Record<string, unknown>> {
  if (!isEncryptedEnvelope(raw)) {
    throw new Error('ENCRYPTED_PAYLOAD_REQUIRED');
  }
  return decryptPayload({ iv: raw.iv, data: raw.data });
}

export async function parseSecureBody(raw: unknown): Promise<Record<string, unknown>> {
  if (isEncryptedEnvelope(raw)) {
    return decryptPayload({ iv: raw.iv, data: raw.data });
  }

  return (raw ?? {}) as Record<string, unknown>;
}

export function getClientIp(req: Request): string | null {
  const cfIp = req.headers['cf-connecting-ip'];
  if (typeof cfIp === 'string' && cfIp) return cfIp;

  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded) {
    return forwarded.split(',')[0]?.trim() ?? null;
  }

  const realIp = req.headers['x-real-ip'];
  if (typeof realIp === 'string' && realIp) return realIp;

  return req.ip ?? null;
}
