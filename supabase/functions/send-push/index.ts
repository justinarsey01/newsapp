import {createClient} from 'https://esm.sh/@supabase/supabase-js@2';
import webpush from 'npm:web-push@3.6.7';
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, content-type, x-client-info, apikey'};
const J=(o:unknown,s=200)=>new Response(JSON.stringify(o),{status:s,headers:{...cors,'Content-Type':'application/json'}});
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return new Response('ok',{headers:cors});
 const url=Deno.env.get('SUPABASE_URL')!;
 const user=createClient(url,Deno.env.get('SUPABASE_ANON_KEY')!,{global:{headers:{Authorization:req.headers.get('Authorization')!}}});
 const {data:ok}=await user.rpc('has_perm',{p:'notifications.send'});
 if(!ok)return J({error:'Not allowed'},403);
 const {title,body,url:link,image}=await req.json();
 let img=typeof image==='string'&&/^https:\/\//.test(image)&&image.length<600?image:undefined;
 const path=typeof link==='string'&&link.startsWith('/')&&!link.startsWith('//')?link:'/';
 const admin=createClient(url,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
 if(!img&&path.startsWith('/article/')){const {data:a}=await admin.from('articles').select('cover_image_url').eq('slug',decodeURIComponent(path.slice(9))).eq('status','published').maybeSingle();
  if(a?.cover_image_url?.startsWith('https://'))img=a.cover_image_url}
 const tokens=((await admin.from('device_tokens').select('token')).data||[]).map(r=>r.token);
 for(let i=0;i<tokens.length;i+=100)
  await fetch('https://exp.host/--/api/v2/push/send',{method:'POST',headers:{'Content-Type':'application/json'},
   body:JSON.stringify(tokens.slice(i,i+100).map(to=>({to,title,body,sound:'default',data:{url:path}})))});
 let web=0;const pub=Deno.env.get('VAPID_PUBLIC_KEY'),priv=Deno.env.get('VAPID_PRIVATE_KEY');
 if(pub&&priv){webpush.setVapidDetails(Deno.env.get('VAPID_SUBJECT')||'mailto:admin@example.com',pub,priv);
  const subs=(await admin.from('push_subscriptions').select('endpoint,p256dh,auth')).data||[];const payload=JSON.stringify({title,body,url:path,image:img});
  for(let i=0;i<subs.length;i+=50)await Promise.all(subs.slice(i,i+50).map(async s=>{
   try{await webpush.sendNotification({endpoint:s.endpoint,keys:{p256dh:s.p256dh,auth:s.auth}},payload);web++}
   catch(e){if(e?.statusCode===404||e?.statusCode===410)await admin.from('push_subscriptions').delete().eq('endpoint',s.endpoint)}}))}
 return J({sent:tokens.length,web});
});
