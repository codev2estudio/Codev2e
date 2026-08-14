import {json} from "./_lib.js";
export async function onRequestGet({env}) {
  const {results}=await env.db.prepare(`
    SELECT id,title,status,year,genre,description,image,page_url
    FROM projects
    WHERE published=1
    ORDER BY sort_order ASC, id DESC
  `).all();
  return json({projects:results||[]});
}