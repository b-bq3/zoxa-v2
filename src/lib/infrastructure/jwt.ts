// ===== Zoxa — JWT (HS256) =====
// y5r JWT bHS256 — mSUpabase JWT secret

const JWT_SECRET = process.env.SUPABASE_JWT_SECRET || '***'
const ISSUER = 'zoxa'
const AUDIENCE = 'zoxa-api'

export interface JwtPayload {
  sub: string; role: 'admin' | 'bot' | 'user'; tg_id?: number
  iat: number; exp: number; iss: string; aud: string
}

function b2a(b: Uint8Array): string {
  return btoa(String.fromCharCode(...b)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

function a2b(s: string): Uint8Array {
  s = s.replace(/-/g, '+').replace(/_/g, '/')
  while (s.length % 4) s += '='
  return Uint8Array.from(atob(s), c => c.charCodeAt(0))
}

async function hsign(k: string, d: string): Promise<string> {
  const ek = await crypto.subtle.importKey('raw', new TextEncoder().encode(k),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', ek, new TextEncoder().encode(d))
  return b2a(new Uint8Array(sig))
}

export async function signJwt(sub: string, role: string, tg_id?: number): Promise<string> {
  const h = b2a(new TextEncoder().encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' })))
  const iat = Math.floor(Date.now() / 1000)
  const exp = iat + 7 * 86400
  const p = b2a(new TextEncoder().encode(JSON.stringify({ sub, role, tg_id, iat, exp, iss: ISSUER, aud: AUDIENCE })))
  const s = await hsign(JWT_SECRET, `${h}.${p}`)
  return `${h}.${p}.${s}`
}

export async function verifyJwt(token: string): Promise<JwtPayload | null> {
  try {
    const [h, p, s] = token.split('.')
    if (!h || !p || !s) return null
    const es = await hsign(JWT_SECRET, `${h}.${p}`)
    if (es !== s) return null
    const payload: JwtPayload = JSON.parse(new TextDecoder().decode(a2b(p)))
    if (payload.exp < Math.floor(Date.now() / 1000)) return null
    if (payload.iss !== ISSUER || payload.aud !== AUDIENCE) return null
    return payload
  } catch { return null }
}

export async function issueBotJwt(): Promise<string> {
  return signJwt('devzoxabot', 'bot', 8730283546)
}

export async function issueAdminJwt(tgId: number): Promise<string> {
  return signJwt(`user:${tgId}`, 'admin', tgId)
}

export async function getJwtFromRequest(request: Request): Promise<JwtPayload | null> {
  const auth = request.headers.get('authorization') || request.headers.get('x-auth-token')
  if (!auth) return null
  return verifyJwt(auth.startsWith('Bearer ') ? auth.slice(7) : auth)
}

export function requireAuth(payload: JwtPayload | null, roles: string[] = ['admin', 'bot']): Response | null {
  if (!payload) return Response.json({ e: 'U' }, { status: 401 })
  if (!roles.includes(payload.role)) return Response.json({ e: 'F' }, { status: 403 })
  return null
}