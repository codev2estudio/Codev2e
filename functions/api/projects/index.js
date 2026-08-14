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
    INSERT INTO projects (
      title,
      status,
      description,
      image,
      page_url,
      published
    )
    VALUES (?, ?, ?, ?, ?, 1)
  `)
    .bind(
      title,
      status,
      description,
      image,
      pageUrl
    )
    .run();

  return json(
    {
      success: true,
      id: result.meta?.last_row_id ?? null,
      message: "Project added."
    },
    201
  );
        }
