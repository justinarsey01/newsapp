import {supabase} from '../../../lib/supabase';import {Row} from '../../Card';import AdSlot from '../../AdSlot';
export const revalidate=60;const PER=20;
export async function generateMetadata({params}){const {data}=await supabase.from('categories').select('name').eq('slug',params.slug).single();return {title:data?`Latest ${data.name} News`:'Category'}}
export default async function Cat({params,searchParams}){
 const page=Math.max(1,parseInt(searchParams.page)||1);
 const {data:c}=await supabase.from('categories').select('id,name').eq('slug',params.slug).single();
 if(!c)return <main>Category not found.</main>;
 const from=(page-1)*PER;
 const {data}=await supabase.from('articles').select('title,slug,cover_image_url,is_breaking,published_at,categories(name)').eq('category_id',c.id)
  .eq('status','published').lte('published_at',new Date().toISOString()).order('published_at',{ascending:false}).range(from,from+PER);
 const items=(data||[]).slice(0,PER),more=(data||[]).length>PER;
 return <main className="catpage"><h1>Latest {c.name} News and Updates</h1>
  <p className="mut intro">Get the latest {c.name.toLowerCase()} news, updates and stories from The Daily, updated throughout the day.</p>
  <AdSlot name="ad_inline"/>
  {!items.length&&<p className="mut" style={{textAlign:'center'}}>No stories in {c.name} yet.</p>}
  <div className="rows one">{items.map(a=><Row key={a.slug} a={a}/>)}</div>
  <div className="pager">{page>1&&<a className="morebtn" href={`?page=${page-1}`}>← Newer</a>}{more&&<a className="morebtn" href={`?page=${page+1}`}>Older →</a>}</div></main>}
