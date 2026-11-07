'use client';
import {useEffect,useState} from 'react';import {sbBrowser} from '../../../lib/auth';
export default function Comments({articleId}){
 const sb=sbBrowser(),[user,setUser]=useState(null),[list,setList]=useState([]),[text,setText]=useState(''),[msg,setMsg]=useState('');
 const load=async()=>setList((await sb.from('comments').select('id,body,created_at,user_id,author_name,author_avatar').eq('article_id',articleId).order('created_at',{ascending:false}).limit(100)).data||[]);
 useEffect(()=>{sb.auth.getUser().then(r=>setUser(r.data.user));const {data}=sb.auth.onAuthStateChange((_e,s)=>setUser(s?.user||null));load();return()=>data.subscription.unsubscribe()},[]);
 const post=async()=>{if(!text.trim())return;setMsg('');const {error}=await sb.from('comments').insert({article_id:articleId,body:text});
  if(error)return setMsg(error.message);setText('');load()};
 return <section className="cmts"><h3>Comments ({list.length})</h3>
  {user?<div><textarea maxLength={1000} placeholder="Write a comment…" value={text} onChange={e=>setText(e.target.value)}/>
   <button className="p" onClick={post}>Post comment</button><button onClick={()=>sb.auth.signOut()}>Sign out</button> <span className="mut">{msg}</span></div>
  :<button className="gbtn" onClick={()=>sb.auth.signInWithOAuth({provider:'google',options:{redirectTo:location.href}})}>Sign in with Google to comment</button>}
  {list.map(c=><div className="cm" key={c.id}>{c.author_avatar&&<img src={c.author_avatar} alt="" referrerPolicy="no-referrer"/>}
   <div><b>{c.author_name||'Reader'}</b> <span className="mut">{new Date(c.created_at).toLocaleString()}</span><p>{c.body}</p>
   {user?.id===c.user_id&&<button onClick={async()=>{await sb.from('comments').delete().eq('id',c.id);load()}}>Delete</button>}</div></div>)}</section>}
