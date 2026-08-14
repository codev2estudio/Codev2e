import {
  json,
  clearSessionCookie,
  sameOrigin
} from "./_lib.js";

export async function onRequestPost({ request }) {
  if (!sameOrigin(request)) {
    return json(
      { error: "Invalid origin" },
      403
    );
  }

  return json(
    {
      success: true,
      message: "Logged out."
    },
    200,
    {
      "Set-Cookie": clearSessionCookie()
    }
  );
}
