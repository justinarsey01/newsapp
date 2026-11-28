import {supabase} from '../../lib/supabase';
export const metadata={title:'Traffic and road alerts',description:'Latest traffic, accident, flood and road closure alerts across Nigerian cities.'};
const KIND={traffic:'🚗 Heavy traffic',accident:'💥 Accident',flood:'🌊 Flooding',roadwork:'🚧 Road works',closure:'⛔ Road closed',police:'👮 Checkpoint'};
const SEV={clear:'Clear',moderate:'Moderate',heavy:'Heavy',blocked:'Blocked'};
const ago=d=>{const m=Math.max(1,Math.round((Date.now()-new Date(d))/60000));return m<60?m+' min ago':Math.round(m/60)+' hr ago'};
export default async function Traffic({searchParams}){
 const {data}=await supabase.from('traffic_alerts').select('*').gt('expires_at',new Date().toISOString()).order('created_at',{ascending:false});
 const all=data||[],cities=[...new Set(all.map(a=>a.city))],city=searchParams.city,list=city?all.filter(a=>a.city===city):all;
 return <main style={{maxWidth:820}}><h1 style={{textAlign:'center'}}>Traffic and road alerts</h1>
  <p className="mut" style={{textAlign:'center'}}>Updates from our newsroom and reporters. Alerts disappear automatically when they expire. Always follow police and road officials on the ground.</p>
  {cities.length>1&&<div className="tchips"><a href="/traffic" className={!city?'on':''}>All cities</a>{cities.map(k=><a key={k} href={'/traffic?city='+encodeURIComponent(k)} className={city===k?'on':''}>{k}</a>)}</div>}
  {!list.length&&<p className="mut" style={{textAlign:'center'}}>No active alerts right now.</p>}
  {list.map(a=><div className={'card talert sev-'+a.severity} key={a.id}><div className="mut" style={{fontSize:13}}>{KIND[a.kind]||a.kind} · {a.city} · {ago(a.created_at)}</div>
   <h3 style={{margin:'4px 0'}}>{a.road}</h3><b>{SEV[a.severity]}</b>{a.details&&<p style={{margin:'6px 0 0',whiteSpace:'pre-wrap'}}>{a.details}</p>}</div>)}</main>}