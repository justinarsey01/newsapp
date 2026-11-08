import {supabase} from '../../../lib/supabase';import Card from '../../Card';import Comments from './Comments';import Share from './Share';import AdSlot from '../../AdSlot';
export const revalidate=60;
const get=s=>supabase.from('articles').select('*,categories(name,slug)').eq('slug',s).eq('status','published').single().then(r=>r.data);
export async function generateMetadata({params}){const a=await get(params.slug);
 return a?{title:a.title,description:a.excerpt,openGraph:{title:a.title,description:a.excerpt,type:'article',images:a.cover_image_url?[a.cover_image_url]:[]},twitter:{card:'summary_large_image'}}:{}}
export default async function Article({params}){const a=await get(params.slug);
 if(!a)return <main>Story not found.</main>;
 const site=process.env.NEXT_PUBLIC_SITE_URL||'',url=encodeURIComponent(`${site}/article/${a.slug}`),t=encodeURIComponent(a.title);
 const {data:rel}=await supabase.from('articles').select('title,slug,excerpt,cover_image_url').eq('status','published').eq('category_id',a.category_id).neq('id',a.id).order('published_at',{ascending:false}).limit(3);
 const ld={'@context':'https://schema.org','@type':'NewsArticle',headline:a.title,datePublished:a.published_at,dateModified:a.updated_at,image:a.cover_image_url?[a.cover_image_url]:undefined};
 return <main><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(ld)}}/>
 {a.categories&&<a href={`/category/${a.categories.slug}`} className="mut">{a.categories.name}</a>}
 <h1>{a.title}</h1><p className="mut">{new Date(a.published_at).toLocaleString()}</p>
 {a.cover_image_url&&<img src={a.cover_image_url} style={{width:'100%'}} alt=""/>}
 <div className="art" dangerouslySetInnerHTML={{__html:a.content}}/><AdSlot name="ad_article"/>
 <Share url={`${site}/article/${a.slug}`} title={a.title}/>
 <Comments articleId={a.id}/>{rel?.length>0&&<><h3>More in {a.categories?.name}</h3><div className="grid">{rel.map(r=><Card key={r.slug} a={r}/>)}</div></>}</main>}
