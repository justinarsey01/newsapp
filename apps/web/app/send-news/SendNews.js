'use client';
import {useEffect,useState} from 'react';import {sbBrowser} from '../../lib/auth';
export default function SendNews(){
 const sb=sbBrowser(),[user,setUser]=useState(undefined),[f,setF]=useState({headline:'',details:'',location:'',contact:''}),[msg,setMsg]=useState(''),[done,setDone]=useState(false),[busy,setBusy]=useState(false);
 useEffect(()=>{sb.auth.getUser().then(r=>setUser(r.data.user||null));const {data}=sb.auth.onAuthStateChange((_e,s)=>setUser(s?.user||null));return()=>data.subscription.unsubscribe()},[]);
 const set=k=>e=>setF({...f,[k]:e.target.value});
 const send=async()=>{setMsg('');if(f.headline.trim().length<5||f.details.trim().length<20)return setMsg('Please add a headline (5+ characters) and details (20+ characters).');
  setBusy(true);const {error}=await sb.from('news_tips').insert({headline:f.headline.trim(),details:f.details.trim(),location:f.location.trim()||null,contact:f.contact.trim()||null});setBusy(false);
  if(error)return setMsg(error.message);setDone(true);setF({headline:'',details:'',location:'',contact:''})};
 if(user===undefined)return <p className="mut">Loading…</p>;
 if(!user)return <div className="card"><p>Please sign in with Google to send us a news tip.</p><button className="gbtn" onClick={()=>sb.auth.signInWithOAuth({provider:'google',options:{redirectTo:location.href}})}>Sign in with Google</button></div>;
 if(done)return <div className="card"><h3>Thank you!</h3><p>Your tip was sent to our newsroom. We may contact you if we need more details.</p><button onClick={()=>setDone(false)}>Send another</button></div>;
 return <div className="card"><p className="mut">Signed in as {user.user_metadata?.full_name||user.email}. <button onClick={()=>sb.auth.signOut()}>Sign out</button></p>
  <input placeholder="Headline" maxLength={150} value={f.headline} onChange={set('headline')}/>
  <textarea rows={6} placeholder="What happened? Include who, what, where and when." maxLength={5000} value={f.details} onChange={set('details')}/>
  <input placeholder="Location (optional)" maxLength={120} value={f.location} onChange={set('location')}/>
  <input placeholder="Phone or email we can reach you on (optional)" maxLength={120} value={f.contact} onChange={set('contact')}/>
  <button className="p" disabled={busy} onClick={send}>{busy?'Sending…':'Send to newsroom'}</button> <span className="mut">{msg}</span>
  <p className="mut">By sending, you confirm the information is true to the best of your knowledge. Read our <a href="/p/privacy" style={{textDecoration:'underline'}}>privacy policy</a>.</p></div>}