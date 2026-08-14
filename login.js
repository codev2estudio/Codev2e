import {json,readJson,sameOrigin,createSession,sessionCookie} from "../_lib.js";
export async function onRequestPost({request,env}) {
  if (!sameOrigin(request)) return json({error:"Invalid origin"},403);
  const body=await readJson(request);
  const password=String(body?.password??"");
  if(!env.ADMIN_PASSWORD || password.length<1 || password !== env.ADMIN_PASSWORD)
    return json({error:"Invalid credentials"},401);
  const token=await createSession(env.SESSION_SECRET);
  return json({ok:true},200,{"Set-Cookie":sessionCookie(token)});
}