import {json,readJson,sameOrigin,clean,requireAdmin} from "../_lib.js";
const validStatus = s => ["RELEASED","UPCOMING"].includes(String(s).toUpperCase());

export async function onRequest({request,env,params}) {
  if (!sameOrigin(request)) return json({error:"Invalid origin"},403);
  const denied=await requireAdmin(request,env); if(denied)return denied;
  const id=params?.id ? Number(params.id) : null;
  if (request.method==="GET") {
    const {results}=await env.db.prepare("SELECT id,title,status,year,genre,description,image,page_url,published,sort_order,created_at,updated_at FROM projects ORDER BY sort_order ASC,id DESC").all();
    return json({projects:results||[]});
  }
  if (request.method==="POST" || request.method==="PUT") {
    const b=await readJson(request);
    const title=clean(b?.title,120);
    if(!title)return json({error:"Title is required"},400);
    const status=String(b?.status||"UPCOMING").toUpperCase();
    if(!validStatus(status))return json({error:"Invalid status"},400);
    const year=clean(b?.year,20), genre=clean(b?.genre,80), description=clean(b?.description,3000);
    const image=clean(b?.image,500), page_url=clean(b?.page_url,500);
    if(request.method==="POST"){
      await env.db.prepare(`INSERT INTO projects(title,status,year,genre,description,image,page_url,published,sort_order,created_at,updated_at)
        VALUES(?,?,?,?,?,?,?,1,0,datetime('now'),datetime('now'))`).bind(title,status,year,genre,description,image,page_url).run();
      return json({ok:true});
    }
    if(!id)return json({error:"Project id required"},400);
    await env.db.prepare(`UPDATE projects SET title=?,status=?,year=?,genre=?,description=?,image=?,page_url=?,updated_at=datetime('now') WHERE id=?`)
      .bind(title,status,year,genre,description,image,page_url,id).run();
    return json({ok:true});
  }
  if(request.method==="DELETE"){
    if(!id)return json({error:"Project id required"},400);
    await env.db.prepare("DELETE FROM projects WHERE id=?").bind(id).run();
    return json({ok:true});
  }
  return json({error:"Method not allowed"},405);
}