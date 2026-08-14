import {json,isAuthenticated} from "../_lib.js";
export async function onRequestGet({request,env}) {
  if(!await isAuthenticated(request,env)) return json({error:"Unauthorized"},401);
  return json({authenticated:true});
}