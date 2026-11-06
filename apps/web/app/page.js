import {supabase} from '../lib/supabase';import Card,{Row} from './Card';import AdSlot from './AdSlot';
export const revalidate=60;
export default async function Home(){
 const {data}=await supabase.from('articles').select('title,slug,excerpt,cover_image_url,is_breaking,published_at,categories(name,slug)')
  .eq('status','published').lte('published_at',new Date().toISOString()).order('published_at',{ascending:false}).limit(150);
 const l=data||[];
 if(!l.length)return <main><p className="mut">No stories yet. Publish one from the admin.</p></main>;
 const head=[...l.filter(a=>a.is_breaking),...l.filter(a=>!a.is_breaking)].slice(0,3);
 const latest=l.filter(a=>!head.includes(a)).slice(0,6);
 const by={};l.forEach(a=>{const c=a.categories;if(c)(by[c.slug]=by[c.slug]||{...c,items:[]}).items.push(a)});
 const secs=Object.values(by);
 return <main><h3 className="sec"><span>HEADLINES</span></h3>
  <div className="hero"><div className="left">{head.slice(1).map(a=><Card key={a.slug} a={a}/>)}</div><Card a={head[0]} big/><aside><AdSlot name="ad_sidebar"/></aside></div>
  {latest.length>0&&<section className="csec"><div className="sech"><h2>Latest News</h2></div><div className="rows">{latest.map(a=><Row key={a.slug} a={a}/>)}</div></section>}
  {secs.map((c,i)=><div key={c.slug}><section className="csec"><div className="sech"><h2><a href={`/category/${c.slug}`}>{c.name}</a></h2>
   <a className="more" href={`/category/${c.slug}`}>More {c.name} →</a></div>
   <div className="csplit"><Card a={c.items[0]}/><div className="rows one">{c.items.slice(1,7).map(a=><Row key={a.slug} a={a}/>)}</div></div></section>
   {i%2===0&&<AdSlot name="ad_inline"/>}</div>)}</main>}
