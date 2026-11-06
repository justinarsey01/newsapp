import {ago} from '../lib/time';
const Meta=({a})=><div className="meta">{a.categories&&<b>{a.categories.name}</b>}{a.published_at&&<span>{ago(a.published_at)}</span>}{a.is_breaking&&<em>BREAKING</em>}</div>;
export default function Card({a,big}){
 if(big)return <a href={`/article/${a.slug}`} className="story lead">{a.cover_image_url&&<img src={a.cover_image_url} alt="" loading="eager"/>}
  <div className="ov"><Meta a={a}/><h2>{a.title}</h2></div></a>;
 return <a href={`/article/${a.slug}`} className="story">{a.cover_image_url&&<img src={a.cover_image_url} alt="" loading="lazy"/>}<Meta a={a}/><h2>{a.title}</h2></a>}
export function Row({a}){return <a href={`/article/${a.slug}`} className="rowi">{a.cover_image_url&&<img src={a.cover_image_url} alt="" loading="lazy"/>}
 <div><Meta a={a}/><h3>{a.title}</h3></div></a>}
