import {json} from "./_lib.js";
export async function onRequestGet({env}) {
  const now=new Date().toISOString();
  const {results}=await env.db.prepare(`
    SELECT id,title,category,body,published_at
    FROM announcements
    WHERE published_at <= ? AND datetime(published_at,'+30 days') > datetime(?)
    ORDER BY published_at DESC
  `).bind(now,now).all();
  return json({announcements:results||[]});
}