import {
  json,
  readJson,
  createSession,
  sessionCookie,
  sameOrigin
} from "./_lib.js";

export async function onRequestPost({ request, env }) {
  try {
    // Only allow requests coming from this website
    if (!sameOrigin(request)) {
      return json(
        { error: "Invalid origin" },
        403
      );
    }

    if (!env.ADMIN_PASSWORD) {
      return json(
        { error: "Admin authentication is not configured." },
        500
      );
    }

    if (!env.SESSION_SECRET) {
      return json(
        { error: "Session security is not configured." },
        500
      );
    }

    const body = await readJson(request);
    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    if (!password) {
      return json(
        { error: "Password is required." },
        400
      );
    }

    // Constant-time password comparison
    const a = new TextEncoder().encode(password);
    const b = new TextEncoder().encode(env.ADMIN_PASSWORD);

    if (a.length !== b.length) {
      return json(
        { error: "Invalid password." },
        401
      );
    }

    let difference = 0;

    for (let i = 0; i < a.length; i++) {
      difference |= a[i] ^ b[i];
    }

    if (difference !== 0) {
      return json(
        { error: "Invalid password." },
        401
      );
    }

    const token = await createSession(env);

    return json(
      {
        success: true,
        message: "Login successful."
      },
      200,
      {
        "Set-Cookie": sessionCookie(token)
      }
    );

  } catch (error) {
    return json(
      { error: "Login failed." },
      500
    );
  }
        }
