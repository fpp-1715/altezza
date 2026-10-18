import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-api-version',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function response(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (request: Request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (request.method !== 'POST') return response({ error: 'Método no permitido.' }, 405)

  const authorization = request.headers.get('Authorization')
  if (!authorization?.startsWith('Bearer ')) return response({ error: 'Se requiere una sesión autenticada.' }, 401)

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    console.error('Faltan secretos de Supabase para la función admin-users.')
    return response({ error: 'La función de usuarios no está configurada en Supabase.' }, 500)
  }

  const authClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data: { user: caller }, error: authError } = await authClient.auth.getUser(authorization.slice('Bearer '.length))
  if (authError || !caller) return response({ error: 'La sesión no es válida. Inicia sesión de nuevo.' }, 401)

  let body: { action?: string; email?: string; password?: string; userId?: string }
  try {
    body = await request.json()
  } catch {
    return response({ error: 'La solicitud no contiene JSON válido.' }, 400)
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  if (body.action === 'list') {
    const users: { id: string; email: string; created_at: string }[] = []
    for (let page = 1; ; page += 1) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 100 })
      if (error) {
        console.error('No se pudieron listar usuarios:', error.message)
        return response({ error: 'No se pudieron cargar las cuentas.' }, 500)
      }
      users.push(...data.users.map((user) => ({
        id: user.id,
        email: user.email ?? '',
        created_at: user.created_at,
      })))
      if (data.users.length < 100) break
    }
    return response({ data: users })
  }

  if (body.action === 'create') {
    if (!body.email?.trim() || !body.password || body.password.length < 6) {
      return response({ error: 'Indica un correo válido y una contraseña de al menos 6 caracteres.' }, 400)
    }
    const { data, error } = await admin.auth.admin.createUser({
      email: body.email.trim(),
      password: body.password,
      email_confirm: true,
    })
    if (error) return response({ error: error.message }, 400)
    return response({ data: { id: data.user.id, email: data.user.email ?? '', created_at: data.user.created_at } })
  }

  if (body.action === 'update_password') {
    if (!body.userId || !body.password || body.password.length < 6) {
      return response({ error: 'Indica una contraseña de al menos 6 caracteres.' }, 400)
    }
    const { data, error } = await admin.auth.admin.updateUserById(body.userId, { password: body.password })
    if (error) return response({ error: error.message }, 400)
    return response({ data: { id: data.user.id, email: data.user.email ?? '', created_at: data.user.created_at } })
  }

  if (body.action === 'update_email') {
    if (!body.userId || !body.email?.trim()) return response({ error: 'Indica un correo válido.' }, 400)
    const { data, error } = await admin.auth.admin.updateUserById(body.userId, { email: body.email.trim(), email_confirm: true })
    if (error) return response({ error: error.message }, 400)
    return response({ data: { id: data.user.id, email: data.user.email ?? '', created_at: data.user.created_at } })
  }

  if (body.action === 'delete') {
    if (!body.userId) return response({ error: 'Falta el identificador de la cuenta.' }, 400)
    if (body.userId === caller.id) return response({ error: 'No puedes eliminar la cuenta que estás usando.' }, 400)
    const { error } = await admin.auth.admin.deleteUser(body.userId)
    if (error) return response({ error: error.message }, 400)
    return response({ data: { id: body.userId } })
  }

  return response({ error: 'Acción de gestión de usuarios desconocida.' }, 400)
})
