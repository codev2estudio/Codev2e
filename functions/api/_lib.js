const SESSION_COOKIE = "codev2e_admin";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...extraHeaders
    }
  });
}

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

function getCookie(request, name) {
  const cookie = request.headers.get("Cookie") || "";

  const match = cookie.match(
    new RegExp(
      "(?:^|;\\s*)" +
      name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") +
      "=([^;]*)"
    )
  );

  return match ? decodeURIComponent(match[1]) : null;
}

function base64url(bytes) {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64urlDecode(value) {
  value = value
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  while (value.length % 4) {
    value += "=";
  }

  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;

  let result = 0;

  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

async function hmac(secret, message) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    {
      name: "HMAC",
      hash: "SHA-256"
    },
    false,
    ["sign", "verify"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(message)
  );

  return base64url(new Uint8Array(signature));
}

async function createSession(env) {
  const now = Math.floor(Date.now() / 1000);
  const expires = now + SESSION_MAX_AGE;

  const payload = `${now}.${expires}`;
  const signature = await hmac(
    env.SESSION_SECRET,
    payload
  );

  return `${payload}.${signature}`;
}

async function verifySession(env, token) {
  if (!token || !env.SESSION_SECRET) {
    return false;
  }

  const parts = token.split(".");

  if (parts.length !== 3) {
    return false;
  }

  const [issuedAt, expiresAt, signature] = parts;

  if (
    !/^\d+$/.test(issuedAt) ||
    !/^\d+$/.test(expiresAt) ||
    !signature
  ) {
    return false;
  }

  const now = Math.floor(Date.now() / 1000);
  const expires = Number(expiresAt);

  if (!Number.isSafeInteger(expires)) {
    return false;
  }

  if (now >= expires) {
    return false;
  }

  const payload = `${issuedAt}.${expiresAt}`;

  const expected = await hmac(
    env.SESSION_SECRET,
    payload
  );

  return timingSafeEqual(
    expected,
    signature
  );
}

async function isAdmin(request, env) {
  const token = getCookie(
    request,
    SESSION_COOKIE
  );

  return verifySession(
    env,
    token
  );
}

async function requireAdmin(request, env) {
  const allowed = await isAdmin(
    request,
    env
  );

  if (!allowed) {
    return json(
      { error: "Unauthorized" },
      401
    );
  }

  return null;
}

function sessionCookie(token) {
  return [
    `${SESSION_COOKIE}=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Strict",
    `Max-Age=${SESSION_MAX_AGE}`
  ].join("; ");
}

function clearSessionCookie() {
  return [
    `${SESSION_COOKIE}=`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Strict",
    "Max-Age=0"
  ].join("; ");
}

function sameOrigin(request) {
  const origin = request.headers.get("Origin");

  if (!origin) {
    return true;
  }

  const url = new URL(request.url);

  return origin === url.origin;
}

async function requireAdminWrite(request, env) {
  if (!sameOrigin(request)) {
    return json(
      { error: "Invalid origin" },
      403
    );
  }

  return requireAdmin(
    request,
    env
  );
}

export {
  SESSION_COOKIE,
  json,
  readJson,
  getCookie,
  createSession,
  verifySession,
  isAdmin,
  requireAdmin,
  requireAdminWrite,
  sessionCookie,
  clearSessionCookie,
  sameOrigin
};
