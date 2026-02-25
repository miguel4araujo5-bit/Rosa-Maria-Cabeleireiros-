export interface Env {
  DB: D1Database
  ADMIN_PASSWORD: string
  ASSETS: Fetcher
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

async function readJson(request: Request) {
  try {
    return await request.json()
  } catch {
    return null
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    const { pathname } = url

    // ---------------- API ROUTES ----------------

    if (pathname.startsWith('/api')) {

      if (pathname === '/api/init') {
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
        ).bind(date, time).first()

        if (existing) {
          return json({ error: 'Horário já ocupado' }, 400)
        }

        await env.DB.prepare(
          `INSERT INTO appointments 
          (id, name, whatsapp, services, date, time, observation, status, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
          .bind(
            crypto.randomUUID(),
            name,
            whatsapp,
            services,
            date,
            time,
            observation ?? '',
            'por_confirmar',
            new Date().toISOString()
          )
          .run()

        return json({ success: true })
      }

      if (pathname === '/api/admin/login' && request.method === 'POST') {
        const body = await readJson(request)
        if (body?.password !== env.ADMIN_PASSWORD) {
          return json({ error: 'Invalid password' }, 401)
        }
        return json({ success: true })
      }

      if (pathname === '/api/admin/appointments' && request.method === 'GET') {
        const { results } = await env.DB.prepare(
          `SELECT * FROM appointments ORDER BY date ASC, time ASC`
        ).all()
        return json(results ?? [])
      }

      if (pathname.startsWith('/api/appointments/') && request.method === 'DELETE') {
        const id = pathname.split('/').pop()
        await env.DB.prepare(
          `DELETE FROM appointments WHERE id = ?`
        ).bind(id).run()
        return json({ success: true })
      }

      return json({ error: 'Not found' }, 404)
    }

    // ---------------- STATIC FILES ----------------

    // Serve Vite build from dist
    return env.ASSETS.fetch(request)
  },
}
