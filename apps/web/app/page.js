import {supabase} from '../lib/supabase';import Card from './Card';import AdSlot from './AdSlot';
export const revalidate=60;
export default async function Home(){
 const {data}=await supabase.from('articles').select('title,slug,excerpt,cover_image_url,is_breaking,published_at,categories(name)')
  .eq('status','published').lte('published_at',new Date().toISOString()).order('published_at',{ascending:false}).limit(40);
 const l=data||[];
 if(!l.length)return <main><p className="mut">No stories yet. Publish one from the admin.</p></main>;
 return <main><h3 className="sec"><span>HEADLINES</span></h3>
  <div className="hero"><div className="left">{l.slice(1,4).map(a=><Card key={a.slug} a={a}/>)}</div>
   <Card a={l[0]} big/><aside><AdSlot name="ad_sidebar"/></aside></div>
  {l.length>4&&<><h3 className="sec"><span>LATEST</span></h3><div className="grid">{l.slice(4).map(a=><Card key={a.slug} a={a}/>)}</div></>}</main>}
