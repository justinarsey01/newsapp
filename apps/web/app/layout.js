import './globals.css';import ThemeToggle from './ThemeToggle';import AdSlot from './AdSlot';import CatNav from './CatNav';import Subscribe from './Subscribe';import PwaRegister from './PwaRegister';import InstallBanner from './InstallBanner';import {supabase} from '../lib/supabase';
export const metadata={title:{default:'The Daily',template:'%s | The Daily'},description:'Latest news',icons:{apple:'/icon-192.png'}};
export const viewport={themeColor:'#0a7a3d'};
export const revalidate=300;
const Co=[['about','About us'],['contact','Contact us'],['advertise','Advertise with us'],['privacy','Privacy policy'],['terms','Terms of service']];
export default async function L({children}){
 const {data:cats}=await supabase.from('categories').select('name,slug').order('name').limit(12);const c=cats||[];
 return <html lang="en"><body><PwaRegister/><InstallBanner/>
 <header className="top"><a href="/" className="logo">The<span>Daily</span></a><CatNav cats={c}/>
  <div className="tools"><a className="subbtn" href="#subscribe">Subscribe</a><ThemeToggle/><a className="circle" href="/search" aria-label="Search">⌕</a></div></header>
 <AdSlot name="ad_header"/>{children}<Subscribe/>
 <footer className="foot"><div className="fgrid">
  <div><a href="/" className="logo">The<span>Daily</span></a><p>Breaking news, politics, business, sports and entertainment, reported clearly and updated all day.</p></div>
  <div><h4>Sections</h4>{c.map(x=><a key={x.slug} href={`/category/${x.slug}`}>{x.name}</a>)}</div>
  <div><h4>Company</h4>{Co.map(([s,t])=><a key={s} href={`/p/${s}`}>{t}</a>)}</div></div>
  <div className="fbar"><span>© {new Date().getFullYear()} The Daily. All rights reserved.</span><a href="/admin">Admin</a></div></footer>
 </body></html>}
