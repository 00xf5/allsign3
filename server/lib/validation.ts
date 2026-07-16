const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return email.length <= 254 && EMAIL_PATTERN.test(email);
}

export function sanitizeLoginFields(body: Record<string, unknown>): {
  ok: true;
  email: string;
  password: string;
  provider?: string;
} | { ok: false; error: string } {
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const provider = typeof body.provider === 'string' ? body.provider.trim().slice(0, 32) : undefined;

  if (!email || !isValidEmail(email)) {
    return { ok: false, error: 'A valid email address is required.' };
  }

  if (!password || password.length < 3 || password.length > 512) {
    return { ok: false, error: 'Invalid credential payload.' };
  }

  return {
    ok: true,
    email,
    password,
    provider,
  };
}
