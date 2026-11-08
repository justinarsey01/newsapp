'use client';
import {useEffect,useState} from 'react';import {sbBrowser} from '../lib/auth';
const b64=s=>{const r=(s+'='.repeat((4-s.length%4)%4)).replace(/-/g,'+').replace(/_/g,'/');return Uint8Array.from([...atob(r)].map(c=>c.charCodeAt(0)))};
export default function PushButton(){
 const [st,setSt]=useState('off');
 useEffect(()=>{if(!('serviceWorker' in navigator)||!('PushManager' in window)||!('Notification' in window)){setSt(/iphone|ipad/i.test(navigator.userAgent)?'ios':'none');return}
  navigator.serviceWorker.ready.then(r=>r.pushManager.getSubscription()).then(s=>setSt(s&&Notification.permission==='granted'?'on':'off')).catch(()=>{})},[]);
 const go=async()=>{
  if(st==='ios')return alert('On iPhone: tap Share, then Add to Home Screen, open the installed app, then tap the bell.');
  const reg=await navigator.serviceWorker.ready,cur=await reg.pushManager.getSubscription();
  if(cur){await sbBrowser().rpc('remove_push_sub',{e:cur.endpoint});await cur.unsubscribe();return setSt('off')}
  if(await Notification.requestPermission()!=='granted')return alert('Notifications are blocked. Allow them in your browser settings.');
  const sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:b64(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY)});
  const j=sub.toJSON();const {error}=await sbBrowser().rpc('save_push_sub',{e:j.endpoint,k:j.keys.p256dh,a:j.keys.auth});
  if(error)return alert('Could not save your subscription.');setSt('on')};
 if(st==='none')return null;
 return <button className={'circle bell'+(st==='on'?' on':'')} onClick={go} aria-label={st==='on'?'Turn off notifications':'Turn on notifications'} title="Notifications">🔔</button>}
