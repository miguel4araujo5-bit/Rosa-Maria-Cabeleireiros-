export interface Env {
  DB: D1Database
  ADMIN_PASSWORD: string
  ASSETS: Fetcher
}

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
    },
  })
}

function noContent(status = 204) {
  return new Response(null, { status, headers: { ...CORS_HEADERS } })
}

async function readJson(request: Request) {
  try {
    return await request.json()
  } catch {
    return null
  }
}

function getBearerToken(request: Request): string | null {
  const h = request.headers.get('Authorization') || ''
  const m = h.match(/^Bearer\s+(.+)$/i)
  return m?.[1]?.trim() || null
}

function timingSafeEqual(a: string, b: string) {
  const enc = new TextEncoder()
  const aBytes = enc.encode(a)
  const bBytes = enc.encode(b)
  if (aBytes.length !== bBytes.length) return false
  let diff = 0
  for (let i = 0; i < aBytes.length; i++) diff |= aBytes[i] ^ bBytes[i]
  return diff === 0
}

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function stringToBase64Url(value: string) {
  return bytesToBase64Url(new TextEncoder().encode(value))
}

function ecdsaSignatureToJose(signature: Uint8Array) {
  if (signature.length === 64) return signature

  if (signature[0] !== 0x30) {
    throw new Error('Invalid ECDSA signature')
  }

  let offset = 2

  if (signature[1] & 0x80) {
    offset = 2 + (signature[1] & 0x7f)
  }

  if (signature[offset] !== 0x02) {
    throw new Error('Invalid ECDSA signature')
  }

  const rLength = signature[offset + 1]
  const rStart = offset + 2
  const r = signature.slice(rStart, rStart + rLength)

  const sOffset = rStart + rLength

  if (signature[sOffset] !== 0x02) {
    throw new Error('Invalid ECDSA signature')
  }

  const sLength = signature[sOffset + 1]
  const sStart = sOffset + 2
  const s = signature.slice(sStart, sStart + sLength)

  const out = new Uint8Array(64)

  const rTrimmed = r.length > 32 ? r.slice(r.length - 32) : r
  const sTrimmed = s.length > 32 ? s.slice(s.length - 32) : s

  out.set(rTrimmed, 32 - rTrimmed.length)
  out.set(sTrimmed, 64 - sTrimmed.length)

  return out
}

async function cleanupExpiredSessions(db: D1Database) {
  const now = new Date().toISOString()
  await db.prepare(`DELETE FROM admin_sessions WHERE expires_at <= ?`).bind(now).run()
}

async function requireAdmin(
  request: Request,
  env: Env
): Promise<{ ok: true } | { ok: false; res: Response }> {
  const token = getBearerToken(request)
  if (!token) return { ok: false, res: json({ error: 'Unauthorized' }, 401) }

  await cleanupExpiredSessions(env.DB)

  const session = await env.DB.prepare(
    `SELECT token, expires_at FROM admin_sessions WHERE token = ?`
  )
    .bind(token)
    .first<{ token: string; expires_at: string }>()

  if (!session?.token) return { ok: false, res: json({ error: 'Unauthorized' }, 401) }

  const expires = Date.parse(session.expires_at)
  if (!Number.isFinite(expires) || expires <= Date.now()) {
    await env.DB.prepare(`DELETE FROM admin_sessions WHERE token = ?`).bind(token).run()
    return { ok: false, res: json({ error: 'Unauthorized' }, 401) }
  }

  return { ok: true }
}

async function spaFallback(request: Request, env: Env): Promise<Response> {
  const res = await env.ASSETS.fetch(request)
  if (res.status !== 404) return res

  const accept = request.headers.get('Accept') || ''
  if (!accept.includes('text/html')) return res

  const url = new URL(request.url)
  const indexUrl = new URL('/index.html', url.origin)
  const indexReq = new Request(indexUrl.toString(), request)
  return env.ASSETS.fetch(indexReq)
}

async function initSchema(db: D1Database) {
  const stmts = [
    `CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      whatsapp TEXT NOT NULL,
      services TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      observation TEXT,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL
    )`,
    `CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date)`,
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_slot ON appointments(date, time)`,
    `CREATE TABLE IF NOT EXISTS admin_sessions (
      token TEXT PRIMARY KEY,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL
    )`,
    `CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at)`,
    `CREATE TABLE IF NOT EXISTS push_settings (
      name TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS push_subscriptions (
      endpoint TEXT PRIMARY KEY,
      p256dh TEXT,
      auth TEXT,
      user_agent TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`,
  ]

  for (const sql of stmts) {
    await db.prepare(sql).run()
  }
}

let schemaReady: Promise<void> | null = null

function ensureSchema(db: D1Database) {
  if (!schemaReady) schemaReady = initSchema(db)
  return schemaReady
}

async function getVapidKeys(db: D1Database) {
  const { results } = await db.prepare(
    `SELECT name, value FROM push_settings WHERE name IN ('vapid_public_key', 'vapid_private_jwk')`
  ).all<{ name: string; value: string }>()

  const map = new Map<string, string>()
  for (const row of results ?? []) map.set(row.name, row.value)

  const publicKey = map.get('vapid_public_key')
  const privateJwkRaw = map.get('vapid_private_jwk')

  if (publicKey && privateJwkRaw) {
    return {
      publicKey,
      privateJwk: JSON.parse(privateJwkRaw) as JsonWebKey,
    }
  }

  const keyPair = await crypto.subtle.generateKey(
    { name: 'ECDSA', namedCurve: 'P-256' },
    true,
    ['sign', 'verify']
  ) as CryptoKeyPair

  const publicRaw = new Uint8Array(await crypto.subtle.exportKey('raw', keyPair.publicKey))
  const privateJwk = await crypto.subtle.exportKey('jwk', keyPair.privateKey)
  const nextPublicKey = bytesToBase64Url(publicRaw)

  await db.prepare(`INSERT OR REPLACE INTO push_settings (name, value) VALUES (?, ?)`)
    .bind('vapid_public_key', nextPublicKey)
    .run()

  await db.prepare(`INSERT OR REPLACE INTO push_settings (name, value) VALUES (?, ?)`)
    .bind('vapid_private_jwk', JSON.stringify(privateJwk))
    .run()

  return {
    publicKey: nextPublicKey,
    privateJwk,
  }
}

async function createVapidJwt(db: D1Database, endpoint: string, requestUrl: string) {
  const keys = await getVapidKeys(db)

  const privateKey = await crypto.subtle.importKey(
    'jwk',
    keys.privateJwk,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  )

  const header = {
    typ: 'JWT',
    alg: 'ES256',
  }

  const payload = {
    aud: new URL(endpoint).origin,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 12,
    sub: new URL(requestUrl).origin,
  }

  const unsigned = `${stringToBase64Url(JSON.stringify(header))}.${stringToBase64Url(JSON.stringify(payload))}`
  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    privateKey,
    new TextEncoder().encode(unsigned)
  )

  const joseSignature = ecdsaSignatureToJose(new Uint8Array(signature))

  return `${unsigned}.${bytesToBase64Url(joseSignature)}`
}

async function sendAdminBookingPush(db: D1Database, requestUrl: string) {
  const keys = await getVapidKeys(db)

  const { results } = await db.prepare(
    `SELECT endpoint FROM push_subscriptions`
  ).all<{ endpoint: string }>()

  const subscriptions = results ?? []
  if (subscriptions.length === 0) return

  await Promise.all(subscriptions.map(async sub => {
    try {
      const token = await createVapidJwt(db, sub.endpoint, requestUrl)

      const res = await fetch(sub.endpoint, {
        method: 'POST',
        headers: {
          TTL: '86400',
          Urgency: 'high',
          Authorization: `vapid t=${token}, k=${keys.publicKey}`,
        },
      })

      if (res.status === 404 || res.status === 410) {
        await db.prepare(`DELETE FROM push_subscriptions WHERE endpoint = ?`).bind(sub.endpoint).run()
      }
    } catch {}
  }))
}

async function savePushSubscription(request: Request, db: D1Database) {
  const body = await readJson(request) as any
  const endpoint = body?.endpoint ? String(body.endpoint) : ''
  const p256dh = body?.keys?.p256dh ? String(body.keys.p256dh) : ''
  const auth = body?.keys?.auth ? String(body.keys.auth) : ''

  if (!endpoint || !endpoint.startsWith('https://')) {
    return json({ error: 'Invalid push subscription' }, 400)
  }

  const now = new Date().toISOString()
  const userAgent = request.headers.get('User-Agent') || ''

  await db.prepare(
    `INSERT INTO push_subscriptions (endpoint, p256dh, auth, user_agent, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(endpoint) DO UPDATE SET
       p256dh = excluded.p256dh,
       auth = excluded.auth,
       user_agent = excluded.user_agent,
       updated_at = excluded.updated_at`
  )
    .bind(endpoint, p256dh, auth, userAgent, now, now)
    .run()

  return json({ success: true })
}

async function deletePushSubscription(request: Request, db: D1Database) {
  const body = await readJson(request) as any
  const endpoint = body?.endpoint ? String(body.endpoint) : ''

  if (!endpoint) return json({ success: true })

  await db.prepare(`DELETE FROM push_subscriptions WHERE endpoint = ?`).bind(endpoint).run()
  return json({ success: true })
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      const url = new URL(request.url)
      const pathname = url.pathname

      if (request.method === 'OPTIONS') return noContent()

      if (!env || !env.ASSETS) {
        return json({ error: 'Missing ASSETS binding' }, 500)
      }

      if (pathname.startsWith('/api')) {
        if (!env.DB) {
          return json({ error: 'Missing DB binding' }, 500)
        }

        await ensureSchema(env.DB)

        if (pathname === '/api/init' && request.method === 'GET') {
          const auth = await requireAdmin(request, env)
          if (!auth.ok) return auth.res
          await initSchema(env.DB)
          return json({ success: true })
        }

        if (pathname === '/api/availability' && request.method === 'GET') {
          const { results } = await env.DB.prepare(
            `SELECT date, time, status FROM appointments`
          ).all()

          return json(results ?? [])
        }

        if (pathname === '/api/appointments' && request.method === 'POST') {
          const body = await readJson(request) as any
          if (!body) return json({ error: 'Invalid JSON' }, 400)

          const { name, whatsapp, services, date, time, observation, notifyAdmin } = body
          if (!name || !whatsapp || !services || !date || !time) {
            return json({ error: 'Missing fields' }, 400)
          }

          const existing = await env.DB.prepare(
            `SELECT id FROM appointments WHERE date = ? AND time = ?`
          )
            .bind(date, time)
            .first()

          if (existing) return json({ error: 'Horário já ocupado' }, 400)

          const id = crypto.randomUUID()

          try {
            await env.DB.prepare(
              `INSERT INTO appointments (id, name, whatsapp, services, date, time, observation, status, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
            )
              .bind(
                id,
                String(name).trim(),
                String(whatsapp).trim(),
                String(services),
                String(date),
                String(time),
                observation ? String(observation) : '',
                'por_confirmar',
                new Date().toISOString()
              )
              .run()
          } catch (err: any) {
            if (String(err.message || '').includes('UNIQUE')) {
              return json({ error: 'Horário já ocupado' }, 400)
            }
            throw err
          }

          if (notifyAdmin !== false) {
            ctx.waitUntil(sendAdminBookingPush(env.DB, request.url).catch(() => null))
          }

          return json({ success: true, id })
        }

        if (pathname === '/api/admin/login' && request.method === 'POST') {
          const body = await readJson(request) as any
          const password = body?.password ? String(body.password) : ''
          if (!password) return json({ error: 'Password required' }, 400)
          if (!env.ADMIN_PASSWORD) return json({ error: 'Missing ADMIN_PASSWORD secret' }, 500)

          if (!timingSafeEqual(password, env.ADMIN_PASSWORD)) {
            return json({ error: 'Invalid password' }, 401)
          }

          await cleanupExpiredSessions(env.DB)

          const token = crypto.randomUUID()
          const now = new Date()
          const expires = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 14)

          await env.DB.prepare(
            `INSERT INTO admin_sessions (token, created_at, expires_at) VALUES (?, ?, ?)`
          )
            .bind(token, now.toISOString(), expires.toISOString())
            .run()

          return json({ success: true, token })
        }

        if (pathname === '/api/admin/logout' && request.method === 'POST') {
          const token = getBearerToken(request)
          if (token) {
            await env.DB.prepare(`DELETE FROM admin_sessions WHERE token = ?`).bind(token).run()
          }
          return json({ success: true })
        }

        if (pathname === '/api/admin/push-public-key' && request.method === 'GET') {
          const auth = await requireAdmin(request, env)
          if (!auth.ok) return auth.res

          const keys = await getVapidKeys(env.DB)
          return json({ publicKey: keys.publicKey })
        }

        if (pathname === '/api/admin/push-subscriptions' && request.method === 'POST') {
          const auth = await requireAdmin(request, env)
          if (!auth.ok) return auth.res

          return savePushSubscription(request, env.DB)
        }

        if (pathname === '/api/admin/push-subscriptions' && request.method === 'DELETE') {
          const auth = await requireAdmin(request, env)
          if (!auth.ok) return auth.res

          return deletePushSubscription(request, env.DB)
        }

        if (pathname === '/api/admin/appointments' && request.method === 'GET') {
          const auth = await requireAdmin(request, env)
          if (!auth.ok) return auth.res

          const { results } = await env.DB.prepare(
            `SELECT * FROM appointments ORDER BY date ASC, time ASC`
          ).all()

          return json(results ?? [])
        }

        if (pathname.startsWith('/api/appointments/') && request.method === 'PUT') {
          const auth = await requireAdmin(request, env)
          if (!auth.ok) return auth.res

          const id = pathname.split('/').pop() || ''
          const body = await readJson(request) as any
          if (!id || !body) return json({ error: 'Invalid request' }, 400)

          const current = await env.DB.prepare(
            `SELECT * FROM appointments WHERE id = ?`
          )
            .bind(id)
            .first<{
              id: string
              name: string
              whatsapp: string
              services: string
              date: string
              time: string
              observation: string
              status: string
              created_at: string
            }>()

          if (!current) {
            return json({ error: 'Appointment not found' }, 404)
          }

          const nextDate = body.date !== undefined ? String(body.date) : current.date
          const nextTime = body.time !== undefined ? String(body.time) : current.time

          const conflict = await env.DB.prepare(
            `SELECT id FROM appointments WHERE date = ? AND time = ? AND id != ?`
          )
            .bind(nextDate, nextTime, id)
            .first()

          if (conflict) {
            return json({ error: 'Horário já ocupado' }, 400)
          }

          const fields: string[] = []
          const values: any[] = []

          if (body.name !== undefined) {
            fields.push('name = ?')
            values.push(String(body.name).trim())
          }

          if (body.whatsapp !== undefined) {
            fields.push('whatsapp = ?')
            values.push(String(body.whatsapp).trim())
          }

          if (body.services !== undefined) {
            fields.push('services = ?')
            values.push(String(body.services))
          }

          if (body.date !== undefined) {
            fields.push('date = ?')
            values.push(String(body.date))
          }

          if (body.time !== undefined) {
            fields.push('time = ?')
            values.push(String(body.time))
          }

          if (body.observation !== undefined) {
            fields.push('observation = ?')
            values.push(String(body.observation))
          }

          if (body.status !== undefined) {
            fields.push('status = ?')
            values.push(String(body.status))
          }

          if (fields.length === 0) {
            return json({ error: 'No fields to update' }, 400)
          }

          values.push(id)

          await env.DB.prepare(
            `UPDATE appointments SET ${fields.join(', ')} WHERE id = ?`
          )
            .bind(...values)
            .run()

          return json({ success: true })
        }

        if (pathname.startsWith('/api/appointments/') && request.method === 'DELETE') {
          const auth = await requireAdmin(request, env)
          if (!auth.ok) return auth.res

          const id = pathname.split('/').pop() || ''
          if (!id) return json({ error: 'Invalid id' }, 400)

          await env.DB.prepare(`DELETE FROM appointments WHERE id = ?`).bind(id).run()
          return json({ success: true })
        }

        return json({ error: 'Not found' }, 404)
      }

      return spaFallback(request, env)
    } catch (e: any) {
      const msg = e?.message ? String(e.message) : 'Worker exception'
      return json({ error: msg }, 500)
    }
  },
}
