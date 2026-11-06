import {supabase} from '../lib/supabase';
export default async function sitemap(){const u=process.env.NEXT_PUBLIC_SITE_URL||'http://localhost:3000';
 const {data}=await supabase.from('articles').select('slug,updated_at').eq('status','published').order('published_at',{ascending:false}).limit(1000);
 const {data:c}=await supabase.from('categories').select('slug');
 return [{url:u},...(c||[]).map(x=>({url:`${u}/category/${x.slug}`})),...(data||[]).map(a=>({url:`${u}/article/${a.slug}`,lastModified:a.updated_at}))]}
