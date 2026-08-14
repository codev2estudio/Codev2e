import {
  json,
  readJson,
  requireAdminWrite
} from "../_lib.js";

export async function onRequestPost({ request, env }) {
  const authError = await requireAdminWrite(request, env);

  if (authError) {
    return authError;
  }

  const body = await readJson(request);

  const title =
    typeof body.title === "string"
      ? body.title.trim()
      : "";

  const content =
    typeof body.content === "string"
      ? body.content.trim()
      : "";

  if (!title || !content) {
    return json(
      { error: "Title and content are required." },
      400
    );
  }

  const result = await env.db.prepare(`
    INSERT INTO announcements (
      title,
      body,
      published_at
    )
    VALUES (?, ?, CURRENT_TIMESTAMP)
  `)
    .bind(title, content)
    .run();

  return json(
    {
      success: true,
      id: result.meta?.last_row_id ?? null,
      message: "Announcement added."
    },
    201
  );
      }
