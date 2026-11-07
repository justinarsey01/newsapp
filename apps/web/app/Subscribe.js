'use client';
import {useState} from 'react';import {sbBrowser} from '../lib/auth';
export default function Subscribe(){const [e,setE]=useState(''),[m,setM]=useState('');
 const go=async ev=>{ev.preventDefault();setM('Subscribing…');const {error}=await sbBrowser().rpc('subscribe',{e});setM(error?'Please enter a valid email.':'You are subscribed. Thank you!');if(!error)setE('')};
 return <section id="subscribe" className="subbar"><div><h3>Get breaking news in your inbox</h3><p>Join our email list for the biggest stories.</p></div>
  <form onSubmit={go}><input type="email" required placeholder="Your email address" value={e} onChange={x=>setE(x.target.value)} aria-label="Email"/><button className="p">Subscribe</button></form><small role="status">{m}</small></section>}
