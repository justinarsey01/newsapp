import {ago} from '../lib/time';
export default function Card({a,big,row}){return <a href={`/article/${a.slug}`} className={'story'+(big?' lead':'')+(row?' row':'')}>
 {a.cover_image_url&&<img src={a.cover_image_url} alt="" loading={big?'eager':'lazy'}/>}
 <div className="meta">{a.categories&&<b>{a.categories.name}</b>}{a.published_at&&<span>{ago(a.published_at)}</span>}{a.is_breaking&&<em>BREAKING</em>}</div>
 <h2>{a.title}</h2>{big&&a.excerpt&&<p>{a.excerpt}</p>}</a>}
