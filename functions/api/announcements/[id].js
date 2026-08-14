import {
  json,
  readJson,
  requireAdminWrite
} from "../_lib.js";

export async function onRequestPut({ request, env, params }) {
  const authError = await requireAdminWrite(request, env);

  if (authError) {
    return authError;
  }

  const id = Number(params.id);

  if (!Number.isInteger(id)) {
    return json(
      { error: "Invalid announcement ID." },
      400
    );
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
    UPDATE announcements
    SET
      title = ?,
      body = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `)
    .bind(
      title,
      content,
      id
    )
    .run();

  if (!result.meta || result.meta.changes !== 1) {
    return json(
      { error: "Announcement not found." },
      404
    );
  }

  return json({
    success: true,
    message: "Announcement updated."
  });
}


export async function onRequestDelete({ request, env, params }) {
  const authError = await requireAdminWrite(request, env);

  if (authError) {
    return authError;
  }

  const id = Number(params.id);

  if (!Number.isInteger(id)) {
    return json(
      { error: "Invalid announcement ID." },
      400
    );
  }

  const result = await env.db.prepare(`
    DELETE FROM announcements
    WHERE id = ?
  `)
    .bind(id)
    .run();

  if (!result.meta || result.meta.changes !== 1) {
    return json(
      { error: "Announcement not found." },
      404
    );
  }

  return json({
    success: true,
    message: "Announcement deleted."
  });
      }
