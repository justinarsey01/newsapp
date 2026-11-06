import './globals.css';import ThemeToggle from './ThemeToggle';import AdSlot from './AdSlot';import {supabase} from '../lib/supabase';
export const metadata={title:{default:'The Daily',template:'%s | The Daily'},description:'Latest news'};
export const revalidate=300;
const Co=[['about','About us'],['contact','Contact us'],['advertise','Advertise with us'],['privacy','Privacy policy'],['terms','Terms of service']];
export default async function L({children}){
 const {data:cats}=await supabase.from('categories').select('name,slug').order('name').limit(12);const c=cats||[];
 const items=<span className="grp"><a href="/">LATEST</a>{c.map(x=><a key={x.slug} href={`/category/${x.slug}`}>{x.name.toUpperCase()}</a>)}</span>;
 return <html lang="en"><body>
 <header className="top"><a href="/" className="logo">The<span>Daily</span></a>
  <nav className="links" aria-label="Categories"><div className="track">{[0,1,2,3].map(i=><span key={i} aria-hidden={i>0?'true':undefined}>{items}</span>)}</div></nav>
  <div className="tools"><ThemeToggle/><a className="circle" href="/search" aria-label="Search">⌕</a></div></header>
 <AdSlot name="ad_header"/>{children}
 <footer className="foot"><div className="fgrid">
  <div><a href="/" className="logo">The<span>Daily</span></a><p>Breaking news, politics, business, sports and entertainment, reported clearly and updated all day.</p></div>
  <div><h4>Sections</h4>{c.map(x=><a key={x.slug} href={`/category/${x.slug}`}>{x.name}</a>)}</div>
  <div><h4>Company</h4>{Co.map(([s,t])=><a key={s} href={`/p/${s}`}>{t}</a>)}</div></div>
  <div className="fbar"><span>© {new Date().getFullYear()} The Daily. All rights reserved.</span><a href="/admin">Admin</a></div></footer>
 </body></html>}
