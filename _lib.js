
export function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...extra
    }
  });
}
export function noStore(headers = {}) {
  return {"Cache-Control":"no-store", ...headers};
}
export async function readJson(request) {
  try { return await request.json(); } catch { return null; }
}
export function clean(value, max = 5000) {
  return String(value ?? "").trim().slice(0, max);
}
export function sameOrigin(request) {
  const origin = request.headers.get("Origin");
  if (!origin) return true;
  try {
    const u = new URL(request.url);
    return origin === u.origin;
  } catch { return false; }
}
export async function sign(value, secret) {
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret),
    {name:"HMAC",hash:"SHA-256"}, false, ["sign","verify"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
}
export async function verify(value, signature, secret) {
  const expected = await sign(value, secret);
  return signature === expected;
}
export async function createSession(secret) {
  const payload = btoa(JSON.stringify({exp: Date.now()+8*60*60*1000}))
    .replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
  return payload + "." + await sign(payload, secret);
}
export async function isAuthenticated(request, env) {
  const raw = request.headers.get("Cookie") || "";
  const match = raw.match(/(?:^|;\s*)c2e_admin=([^;]+)/);
  if (!match) return false;
  const parts = decodeURIComponent(match[1]).split(".");
  if (parts.length !== 2) return false;
  if (!await verify(parts[0], parts[1], env.SESSION_SECRET)) return false;
  try {
    const data = JSON.parse(atob(parts[0].replace(/-/g,"+").replace(/_/g,"/")));
    return Number(data.exp) > Date.now();
  } catch { return false; }
}
export function sessionCookie(token) {
  return `c2e_admin=${encodeURIComponent(token)}; Path=/; Max-Age=28800; HttpOnly; Secure; SameSite=Strict`;
}
export function clearSessionCookie() {
  return "c2e_admin=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict";
}
export async function requireAdmin(request, env) {
  if (!await isAuthenticated(request, env)) return json({error:"Unauthorized"},401);
  return null;
}
