import './globals.css';import ThemeToggle from './ThemeToggle';import AdSlot from './AdSlot';import {supabase} from '../lib/supabase';
export const metadata={title:{default:'The Daily',template:'%s | The Daily'},description:'Latest news'};
export const revalidate=300;
export default async function L({children}){
 const {data:cats}=await supabase.from('categories').select('name,slug').order('name').limit(8);
 return <html lang="en"><body>
 <header className="top"><a href="/" className="logo">The<span>Daily</span></a>
  <nav className="links"><a href="/">LATEST</a>{(cats||[]).map(c=><a key={c.slug} href={`/category/${c.slug}`}>{c.name.toUpperCase()}</a>)}</nav>
  <div className="tools"><ThemeToggle/><a className="circle" href="/search" aria-label="Search">⌕</a></div></header>
 <AdSlot name="ad_header"/>{children}
 <footer><a href="/admin">Admin</a> · The Daily</footer></body></html>}
