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
    return json({ error: "Invalid project ID." }, 400);
  }

  const body = await readJson(request);

  const title =
    typeof body.title === "string"
      ? body.title.trim()
      : "";

  if (!title) {
    return json(
      { error: "Project title is required." },
      400
    );
  }

  const description =
    typeof body.description === "string"
      ? body.description.trim()
      : "";

  const image =
    typeof body.image_url === "string"
      ? body.image_url.trim()
      : "";

  const pageUrl =
    typeof body.link === "string"
      ? body.link.trim()
      : "";

  const status =
    body.status === "released"
      ? "released"
      : "upcoming";

  const result = await env.db.prepare(`
    UPDATE projects
    SET
      title = ?,
      description = ?,
      image = ?,
      page_url = ?,
      status = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `)
    .bind(
      title,
      description,
      image,
      pageUrl,
      status,
      id
    )
    .run();

  if (!result.meta || result.meta.changes !== 1) {
    return json(
      { error: "Project not found." },
      404
    );
  }

  return json({
    success: true,
    message: "Project updated."
  });
}


export async function onRequestDelete({ request, env, params }) {
  const authError = await requireAdminWrite(request, env);

  if (authError) {
    return authError;
  }

  const id = Number(params.id);

  if (!Number.isInteger(id)) {
    return json({ error: "Invalid project ID." }, 400);
  }

  const result = await env.db.prepare(`
    DELETE FROM projects
    WHERE id = ?
  `)
    .bind(id)
    .run();

  if (!result.meta || result.meta.changes !== 1) {
    return json(
      { error: "Project not found." },
      404
    );
  }

  return json({
    success: true,
    message: "Project deleted."
  });
    }
