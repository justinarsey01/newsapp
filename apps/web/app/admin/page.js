'use client';
import {useEffect,useState} from 'react';import {supabase as sb} from '../../lib/supabase';
import {ROLES,PERMS} from '@news/shared';import Editor from './Editor';
const slugify=t=>t.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
export default function Admin(){
 const [me,setMe]=useState(null),[tab,setTab]=useState('articles'),[auth,setAuth]=useState({email:'',password:'',name:''}),[msg,setMsg]=useState('');
 const load=async()=>{const {data:{user}}=await sb.auth.getUser();if(!user)return setMe(null);
  setMe((await sb.from('profiles').select('*').eq('id',user.id).single()).data)};
 useEffect(()=>{load()},[]);
 const login=async up=>{const {error}=up?await sb.auth.signUp({email:auth.email,password:auth.password,options:{data:{full_name:auth.name}}}):await sb.auth.signInWithPassword({email:auth.email,password:auth.password});
  setMsg(error?error.message:up?'Check your email to confirm, then sign in.':'');load()};
 if(!me)return <main className="card"><h2>Admin sign in</h2>
  <input placeholder="Name (sign up)" onChange={e=>setAuth({...auth,name:e.target.value})}/>
  <input placeholder="Email" onChange={e=>setAuth({...auth,email:e.target.value})}/>
  <input type="password" placeholder="Password" onChange={e=>setAuth({...auth,password:e.target.value})}/>
  <button className="p" onClick={()=>login(false)}>Sign in</button><button onClick={()=>login(true)}>Sign up</button><p className="mut">{msg}</p></main>;
 const sup=me.role==='super_admin',can=p=>sup||me.permissions.includes(p);
 const tabs=['articles',...(sup?['review','users','settings']:[]),...(can('categories.manage')?['categories']:[]),...(can('notifications.send')?['notify']:[])];
 return <main><p>Signed in as <b>{me.full_name||'user'}</b> ({me.role}) <button onClick={()=>sb.auth.signOut().then(load)}>Sign out</button></p>
  {me.role==='user'&&<p className="card">Waiting for a super admin to give you a role.</p>}
  <div className="tabs">{tabs.map(t=><button key={t} className={tab===t?'on':''} onClick={()=>setTab(t)}>{t}</button>)}</div>
  {tab==='articles'&&<Articles can={can} sup={sup}/>}{tab==='review'&&<Review/>}{tab==='users'&&<Users/>}{tab==='settings'&&<Settings/>}{tab==='categories'&&<Categories/>}{tab==='notify'&&<Notify/>}</main>}

function Articles({can,sup}){
 const [list,setList]=useState([]),[cats,setCats]=useState([]),[a,setA]=useState(null);
 const load=async()=>{setList((await sb.from('articles').select('id,title,status,review_note,updated_at').order('updated_at',{ascending:false})).data||[]);
  setCats((await sb.from('categories').select('*')).data||[])};
 useEffect(()=>{load()},[]);
 const save=async status=>{const row={title:a.title,slug:a.slug||slugify(a.title),excerpt:a.excerpt,content:a.content||'',cover_image_url:a.cover_image_url,
  category_id:a.category_id||null,is_breaking:!!a.is_breaking,status};
  const {error}=a.id?await sb.from('articles').update(row).eq('id',a.id):await sb.from('articles').insert(row);
  if(error)return alert(error.message);setA(null);load()};
 if(a)return <div className="card"><input placeholder="Headline" value={a.title||''} onChange={e=>setA({...a,title:e.target.value})}/>
  <input placeholder="Slug (auto)" value={a.slug||''} onChange={e=>setA({...a,slug:e.target.value})}/>
  <textarea placeholder="Short summary" value={a.excerpt||''} onChange={e=>setA({...a,excerpt:e.target.value})}/>
  <input placeholder="Cover image URL" value={a.cover_image_url||''} onChange={e=>setA({...a,cover_image_url:e.target.value})}/>
  <select value={a.category_id||''} onChange={e=>setA({...a,category_id:e.target.value})}><option value="">No category</option>{cats.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select>
  <label><input type="checkbox" style={{width:'auto'}} checked={!!a.is_breaking} onChange={e=>setA({...a,is_breaking:e.target.checked})}/> Breaking news</label>
  <Editor value={a.content} onChange={h=>a.content=h}/>
  <button onClick={()=>save('draft')}>Save draft</button>
  <button className="p" onClick={()=>save('published')}>{sup?'Publish':'Submit for review'}</button><button onClick={()=>setA(null)}>Cancel</button></div>;
 return <div>{can('articles.write')&&<button className="p" onClick={()=>setA({})}>New article</button>}
  {list.length===0&&<p className="mut">No articles yet.</p>}
  {list.map(r=><div className="card" key={r.id}><b>{r.title}</b> <span className="mut">{r.status}</span>
   {r.review_note&&<p className="mut">Reviewer note: {r.review_note}</p>}
   {can('articles.write')&&<button onClick={async()=>setA((await sb.from('articles').select('*').eq('id',r.id).single()).data)}>Edit</button>}
   {can('articles.delete')&&<button onClick={async()=>{await sb.from('articles').delete().eq('id',r.id);load()}}>Delete</button>}</div>)}</div>}

function Review(){
 const [l,setL]=useState([]);const load=async()=>setL((await sb.from('articles').select('*').eq('status','pending_review')).data||[]);
 useEffect(()=>{load()},[]);
 const act=async(r,ok)=>{const note=ok?null:prompt('Reason for rejecting?');if(!ok&&note===null)return;
  await sb.from('articles').update(ok?{status:'published',published_at:new Date().toISOString()}:{status:'rejected',review_note:note}).eq('id',r.id);load()};
 return <div>{!l.length&&<p className="mut">Nothing waiting for review.</p>}{l.map(r=><div className="card" key={r.id}><h3>{r.title}</h3>
  <div className="art" dangerouslySetInnerHTML={{__html:r.content}}/><button className="p" onClick={()=>act(r,true)}>Approve and publish</button><button onClick={()=>act(r,false)}>Reject</button></div>)}</div>}

function Users(){
 const [l,setL]=useState([]);const load=async()=>setL((await sb.from('profiles').select('*')).data||[]);useEffect(()=>{load()},[]);
 const upd=async(u,patch)=>{await sb.from('profiles').update(patch).eq('id',u.id);load()};
 return <div>{l.map(u=><div className="card" key={u.id}><b>{u.full_name||u.id.slice(0,8)}</b>
  <select value={u.role} onChange={e=>upd(u,{role:e.target.value})}>{[...ROLES,'user'].map(r=><option key={r}>{r}</option>)}</select>
  {u.role!=='super_admin'&&<div>{Object.entries(PERMS).map(([k,v])=><label key={k} style={{display:'block'}}>
   <input type="checkbox" style={{width:'auto'}} checked={u.permissions.includes(k)} onChange={e=>upd(u,{permissions:e.target.checked?[...u.permissions,k]:u.permissions.filter(x=>x!==k)})}/> {v}</label>)}</div>}</div>)}</div>}

function Settings(){
 const [m,setM]=useState(false),[ads,setAds]=useState({ad_header:{},ad_sidebar:{}}),[r,setR]=useState('');
 useEffect(()=>{sb.from('app_settings').select('*').in('key',['maintenance','ad_header','ad_sidebar']).then(({data})=>{const n={ad_header:{},ad_sidebar:{}};
  (data||[]).forEach(x=>{if(x.key==='maintenance')setM(!!x.value);else n[x.key]=x.value});setAds(n)})},[]);
 const set=(k,f,v)=>setAds({...ads,[k]:{...ads[k],[f]:v}});
 const save=async()=>{for(const k of ['ad_header','ad_sidebar'])await sb.from('app_settings').upsert({key:k,value:ads[k]});setR('Saved')};
 return <div><div className="card"><label><input type="checkbox" style={{width:'auto'}} checked={m} onChange={async e=>{setM(e.target.checked);
  await sb.from('app_settings').upsert({key:'maintenance',value:e.target.checked})}}/> Maintenance mode (shown in the app)</label></div>
  {[['ad_header','Header ad (wide banner)'],['ad_sidebar','Sidebar ad (home page)']].map(([k,t])=><div className="card" key={k}><b>{t}</b>
   <input placeholder="Image URL" value={ads[k].image||''} onChange={e=>set(k,'image',e.target.value)}/>
   <input placeholder="Link URL" value={ads[k].link||''} onChange={e=>set(k,'link',e.target.value)}/></div>)}
  <button className="p" onClick={save}>Save ads</button> <span className="mut">{r}</span></div>}

function Categories(){
 const [l,setL]=useState([]),[n,setN]=useState('');const load=async()=>setL((await sb.from('categories').select('*').order('name')).data||[]);useEffect(()=>{load()},[]);
 return <div className="card"><input placeholder="New category name" value={n} onChange={e=>setN(e.target.value)}/>
  <button className="p" onClick={async()=>{if(!n)return;const {error}=await sb.from('categories').insert({name:n,slug:slugify(n)});if(error)alert(error.message);setN('');load()}}>Add category</button>
  {!l.length&&<p className="mut">No categories yet.</p>}{l.map(c=><p key={c.id}>{c.name} <button onClick={async()=>{await sb.from('categories').delete().eq('id',c.id);load()}}>Delete</button></p>)}</div>}

function Notify(){
 const [t,setT]=useState(''),[b,setB]=useState(''),[r,setR]=useState('');
 return <div className="card"><input placeholder="Title" value={t} onChange={e=>setT(e.target.value)}/><textarea placeholder="Message" value={b} onChange={e=>setB(e.target.value)}/>
  <button className="p" onClick={async()=>{setR('Sending…');const {data,error}=await sb.functions.invoke('send-push',{body:{title:t,body:b}});setR(error?error.message:`Sent to ${data.sent} devices`)}}>Send notification</button><p className="mut">{r}</p></div>}
