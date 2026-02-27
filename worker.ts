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

async function requireAdmin(request: Request, env: Env): Promise<{ ok: true } | { ok: false; res: Response }> {
  const token = getBearerToken(request)
  if (!token) return { ok: false, res: json({ error: 'Unauthorized' }, 401) }

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

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    const pathname = url.pathname

    if (request.method === 'OPTIONS') return noContent()

    if (pathname.startsWith('/api')) {
      if (pathname === '/api/init' && request.method === 'GET') {
        await env.DB.exec(`
          CREATE TABLE IF NOT EXISTS appointments (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            whatsapp TEXT NOT NULL,
            services TEXT NOT NULL,
            date TEXT NOT NULL,
            time TEXT NOT NULL,
            observation TEXT,
            status TEXT NOT NULL,
            created_at TEXT NOT NULL
          );

          CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
          CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_slot ON appointments(date, time);

          CREATE TABLE IF NOT EXISTS admin_sessions (
            token TEXT PRIMARY KEY,
            created_at TEXT NOT NULL,
            expires_at TEXT NOT NULL
          );

          CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at);
        `)

        return json({ success: true })
      }

      if (pathname === '/api/availability' && request.method === 'GET') {
        const { results } = await env.DB.prepare(
          `SELECT date, time, status FROM appointments`
        ).all()

        return json(results ?? [])
      }

      if (pathname === '/api/appointments' && request.method === 'POST') {
        const body = await readJson(request)
        if (!body) return json({ error: 'Invalid JSON' }, 400)

        const { name, whatsapp, services, date, time, observation } = body
        if (!name || !whatsapp || !services || !date || !time) {
          return json({ error: 'Missing fields' }, 400)
        }

        const existing = await env.DB.prepare(
          `SELECT id FROM appointments WHERE date = ? AND time = ?`
        )
          .bind(date, time)
          .first()

        if (existing) return json({ error: 'Horário já ocupado' }, 400)

        await env.DB.prepare(
          `INSERT INTO appointments (id, name, whatsapp, services, date, time, observation, status, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
          .bind(
            crypto.randomUUID(),
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

        return json({ success: true })
      }

      if (pathname === '/api/admin/login' && request.method === 'POST') {
        const body = await readJson(request)
        const password = body?.password ? String(body.password) : ''
        if (!password) return json({ error: 'Password required' }, 400)
        if (password !== env.ADMIN_PASSWORD) return json({ error: 'Invalid password' }, 401)

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
        const body = await readJson(request)
        if (!id || !body) return json({ error: 'Invalid request' }, 400)

        const nextStatus = body.status ? String(body.status) : ''
        if (!nextStatus) return json({ error: 'Missing status' }, 400)

        await env.DB.prepare(
          `UPDATE appointments SET status = ? WHERE id = ?`
        )
          .bind(nextStatus, id)
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
  },
}
