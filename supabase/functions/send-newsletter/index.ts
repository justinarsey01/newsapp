import {createClient} from 'https://esm.sh/@supabase/supabase-js@2';
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, content-type, x-client-info, apikey'};
const esc=(s:string)=>String(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]!));
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return new Response('ok',{headers:cors});
 const url=Deno.env.get('SUPABASE_URL')!;
 const user=createClient(url,Deno.env.get('SUPABASE_ANON_KEY')!,{global:{headers:{Authorization:req.headers.get('Authorization')!}}});
 const {data:ok}=await user.rpc('has_perm',{p:'notifications.send'});
 if(!ok)return new Response(JSON.stringify({error:'Not allowed'}),{status:403,headers:cors});
 const {subject,body,link}=await req.json();const site=Deno.env.get('SITE_URL')||'';
 const admin=createClient(url,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
 const {data}=await admin.from('subscribers').select('email').eq('unsubscribed',false);const to=(data||[]).map(r=>r.email);
 for(let i=0;i<to.length;i+=100)
  await fetch('https://api.resend.com/emails/batch',{method:'POST',headers:{Authorization:`Bearer ${Deno.env.get('RESEND_API_KEY')}`,'Content-Type':'application/json'},
   body:JSON.stringify(to.slice(i,i+100).map(e=>({from:Deno.env.get('FROM_EMAIL'),to:[e],subject,
    html:`<div style="font-family:Arial,sans-serif;max-width:560px"><h2>${esc(subject)}</h2><p>${esc(body)}</p>${link?`<p><a href="${esc(link)}">Read the story</a></p>`:''}
     <hr><small><a href="${site}/unsubscribe?e=${encodeURIComponent(e)}">Unsubscribe</a></small></div>`})))});
 return new Response(JSON.stringify({sent:to.length}),{headers:{...cors,'Content-Type':'application/json'}});
});
