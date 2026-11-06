import {createClient} from 'https://esm.sh/@supabase/supabase-js@2';
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, content-type, x-client-info, apikey'};
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return new Response('ok',{headers:cors});
 const url=Deno.env.get('SUPABASE_URL')!;
 const user=createClient(url,Deno.env.get('SUPABASE_ANON_KEY')!,{global:{headers:{Authorization:req.headers.get('Authorization')!}}});
 const {data:ok}=await user.rpc('has_perm',{p:'notifications.send'});
 if(!ok)return new Response(JSON.stringify({error:'Not allowed'}),{status:403,headers:cors});
 const {title,body}=await req.json();
 const admin=createClient(url,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
 const {data:t}=await admin.from('device_tokens').select('token');const tokens=(t||[]).map(r=>r.token);
 for(let i=0;i<tokens.length;i+=100)
  await fetch('https://exp.host/--/api/v2/push/send',{method:'POST',headers:{'Content-Type':'application/json'},
   body:JSON.stringify(tokens.slice(i,i+100).map(to=>({to,title,body,sound:'default'})))});
 return new Response(JSON.stringify({sent:tokens.length}),{headers:{...cors,'Content-Type':'application/json'}});
});
