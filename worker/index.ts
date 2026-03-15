export interface Env {
  RESEND_API_KEY: string
}

function corsHeaders(origin: string | null) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get('Origin')

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(origin)
      })
    }

    const url = new URL(request.url)

    if (url.pathname !== '/api/ma-code-contact') {
      return new Response('Not found', {
        status: 404
      })
    }

    if (request.method !== 'POST') {
      return Response.json(
        { error: 'Method not allowed' },
        {
          status: 405,
          headers: corsHeaders(origin)
        }
      )
    }

    try {
      const { name, email, message } = await request.json<{
        name: string
        email: string
        message: string
      }>()

      if (!name || !email || !message) {
        return Response.json(
          { error: 'Missing required fields' },
          {
            status: 400,
            headers: corsHeaders(origin)
          }
        )
      }

      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'MA-Code <noreply@YOUR_DOMAIN_HERE>',
          to: ['www.miguel.araujo@gmail.com'],
          reply_to: email,
          subject: 'Pedido de orçamento - MA-Code',
          text: `Nome: ${name}\n\nEmail: ${email}\n\nMensagem:\n${message}`,
          html: `<div><h2>Novo pedido de orçamento - MA-Code</h2><p><strong>Nome:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Mensagem:</strong></p><p>${String(message).replace(/\n/g, '<br>')}</p></div>`
        })
      })

      if (!resendResponse.ok) {
        const resendError = await resendResponse.text()
        return Response.json(
          { error: resendError || 'Failed to send email' },
          {
            status: 500,
            headers: corsHeaders(origin)
          }
        )
      }

      return Response.json(
        { success: true },
        {
          status: 200,
          headers: corsHeaders(origin)
        }
      )
    } catch (error) {
      return Response.json(
        { error: 'Invalid request' },
        {
          status: 400,
          headers: corsHeaders(origin)
        }
      )
    }
  }
}
