# CODEV2E Cloudflare Admin Edition

This package keeps the existing CODEV2E frontend and adds:
- `/admin` private dashboard
- Cloudflare Pages Functions API
- Cloudflare D1 for projects + announcements
- server-side admin password secret
- signed, HttpOnly, Secure, SameSite=Strict admin session
- same-origin checks on write endpoints
- public API with no database credentials in the browser
- existing file-based project/announcement fallback if the API is unavailable

## Before deployment

1. Create your D1 database (you already did this).
2. Run `schema.sql` against that D1 database.
3. Bind the D1 database to your Pages project using binding name `DB`.
4. Add two Cloudflare Secrets:
   - `ADMIN_PASSWORD` = a long unique password
   - `SESSION_SECRET` = a long random secret, different from the password
5. Deploy with Wrangler so the `functions/` directory is included.

Do NOT put either secret in HTML, JavaScript, GitHub, ZIPs, or the browser.

## Wrangler

Use the Cloudflare Pages project you already own. A typical `wrangler.toml` is. Keep your existing Pages project name and replace only the D1 database ID:

name = "codev2e"
pages_build_output_dir = "."
compatibility_date = "2026-08-14"

[[d1_databases]]
binding = "DB"
database_name = "CODEV2E_DB"
database_id = "REPLACE_WITH_YOUR_D1_DATABASE_ID"

The exact Pages project/deployment command depends on your existing Cloudflare project. Keep the current project instead of creating a second public site.

## Admin

Open:
https://codev2e.pages.dev/admin/

The password is checked server-side. The browser never receives the configured password.

## Important

This is intentionally a small CMS. Images are stored as URLs/paths, not binary files in D1. Put static images in the website assets and enter their path, for example `/assets/poster.webp`.

For stronger account protection, you can additionally put `/admin/*` behind Cloudflare Access later. That is an optional second security layer.
