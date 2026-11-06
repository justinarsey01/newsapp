import {supabase} from '../lib/supabase';
export const revalidate=60;
export default async function Home(){
 const {data}=await supabase.from('articles').select('title,slug,excerpt,cover_image_url,is_breaking,published_at').eq('status','published').lte('published_at',new Date().toISOString()).order('published_at',{ascending:false}).limit(40);
 return <main>{(data||[]).map(a=><a key={a.slug} href={`/article/${a.slug}`}><div className="card">
  {a.is_breaking&&<b style={{color:'#c0392b'}}>Breaking </b>}<h2 style={{margin:'4px 0'}}>{a.title}</h2><p className="mut">{a.excerpt}</p></div></a>)}
  {!data?.length&&<p className="mut">No stories yet. Publish one from the admin.</p>}</main>}
