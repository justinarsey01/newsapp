import {supabase} from '../../lib/supabase';import Card from '../Card';
export const metadata={title:'Search'};
export default async function Search({searchParams}){
 const q=(searchParams.q||'').replace(/[%,()]/g,' ').trim();let data=[];
 if(q)data=(await supabase.from('articles').select('title,slug,excerpt,cover_image_url,categories(name)').eq('status','published')
  .or(`title.ilike.%${q}%,excerpt.ilike.%${q}%`).order('published_at',{ascending:false}).limit(30)).data||[];
 return <main><form action="/search" className="sbox"><input name="q" defaultValue={q} placeholder="Search news" autoFocus/><button className="p">Search</button></form><h1>{q?`Results for “${q}”`:'Search'}</h1>{q&&!data.length&&<p className="mut">No stories match “{q}”. Try a different word.</p>}
  <div className="grid">{data.map(a=><Card key={a.slug} a={a}/>)}</div></main>}
