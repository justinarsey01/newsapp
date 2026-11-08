'use client';
import {useEffect} from 'react';import {sbBrowser} from '../lib/auth';
export default function OfflineSync(){useEffect(()=>{
 if(!('serviceWorker' in navigator)||!navigator.onLine||Date.now()-Number(localStorage.offlineSync||0)<1800000)return;
 (async()=>{const reg=await navigator.serviceWorker.ready;
  const {data}=await sbBrowser().from('articles').select('slug,cover_image_url,content').eq('status','published').order('published_at',{ascending:false}).limit(20);
  const urls=['/'];(data||[]).forEach(a=>{urls.push('/article/'+a.slug);if(a.cover_image_url)urls.push(a.cover_image_url);
   for(const m of (a.content||'').matchAll(/<img[^>]+src="([^"]+)"/g))urls.push(m[1])});
  reg.active?.postMessage({type:'precache',urls:[...new Set(urls)]});localStorage.offlineSync=Date.now()})().catch(()=>{})},[]);return null}
