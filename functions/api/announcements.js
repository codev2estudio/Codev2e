import { json } from "./_lib.js";

export async function onRequestGet({ env }) {
  const { results } = await env.db.prepare(`
    SELECT
      id,
      title,
      body,
      published_at,
      created_at,
      updated_at
    FROM announcements
    ORDER BY published_at DESC, id DESC
  `).all();

  return json({
    announcements: results || []
  });
}
