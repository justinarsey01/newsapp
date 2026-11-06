import {supabase} from '../../../lib/supabase';
export const revalidate=60;
const get=s=>supabase.from('articles').select('*').eq('slug',s).eq('status','published').single().then(r=>r.data);
export async function generateMetadata({params}){const a=await get(params.slug);
 return a?{title:a.title,description:a.excerpt,openGraph:{title:a.title,description:a.excerpt,images:a.cover_image_url?[a.cover_image_url]:[]}}:{}}
export default async function Article({params}){const a=await get(params.slug);
 if(!a)return <main>Story not found.</main>;
 return <main><h1>{a.title}</h1><p className="mut">{new Date(a.published_at).toLocaleString()}</p>
 {a.cover_image_url&&<img src={a.cover_image_url} style={{width:'100%'}} alt=""/>}
 <div className="art" dangerouslySetInnerHTML={{__html:a.content}}/></main>}
