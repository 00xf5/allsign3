const PAYLOAD_ENCRYPTION_KEY =
  Deno.env.get('PAYLOAD_ENCRYPTION_KEY') ?? 'allsign-payload-key-v1-change-in-prod';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
    },
  });
}

export function handleOptions(): Response {
  return new Response(null, { status: 200, headers: CORS_HEADERS });
}

async function deriveAesKey(passphrase: string): Promise<CryptoKey> {
  const hash = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(passphrase),
  );
  return crypto.subtle.importKey('raw', hash, 'AES-GCM', false, ['decrypt']);
}

function fromBase64(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export async function decryptPayload(envelope: {
  iv: string;
  data: string;
}): Promise<Record<string, unknown>> {
  const key = await deriveAesKey(PAYLOAD_ENCRYPTION_KEY);
  const iv = fromBase64(envelope.iv);
  const ciphertext = fromBase64(envelope.data);
  const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
  return JSON.parse(new TextDecoder().decode(plaintext));
}

export async function parseSecureBody(req: Request): Promise<Record<string, unknown>> {
  const raw = await req.json();

  if (raw?.encrypted === true && raw?.iv && raw?.data) {
    return decryptPayload({ iv: raw.iv, data: raw.data });
  }

  return raw;
}
