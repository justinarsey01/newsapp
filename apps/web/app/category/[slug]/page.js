import {supabase} from '../../../lib/supabase';import Card from '../../Card';
export const revalidate=60;
export async function generateMetadata({params}){const {data}=await supabase.from('categories').select('name').eq('slug',params.slug).single();return {title:data?.name||'Category'}}
export default async function Cat({params}){
 const {data:c}=await supabase.from('categories').select('id,name').eq('slug',params.slug).single();
 if(!c)return <main>Category not found.</main>;
 const {data}=await supabase.from('articles').select('title,slug,excerpt,cover_image_url,is_breaking,categories(name)').eq('category_id',c.id)
  .eq('status','published').lte('published_at',new Date().toISOString()).order('published_at',{ascending:false}).limit(40);
 return <main><h1>{c.name}</h1>{!data?.length&&<p className="mut">No stories in {c.name} yet.</p>}<div className="grid">{(data||[]).map(a=><Card key={a.slug} a={a}/>)}</div></main>}
