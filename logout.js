import {json,sameOrigin,clearSessionCookie} from "../_lib.js";
export async function onRequestPost({request}) {
  if (!sameOrigin(request)) return json({error:"Invalid origin"},403);
  return json({ok:true},200,{"Set-Cookie":clearSessionCookie()});
}