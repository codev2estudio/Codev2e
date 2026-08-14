import { json, isAdmin } from "./_lib.js";

export async function onRequestGet({ request, env }) {
  const authenticated = await isAdmin(request, env);

  if (!authenticated) {
    return json(
      { authenticated: false },
      401
    );
  }

  return json({
    authenticated: true
  });
}
