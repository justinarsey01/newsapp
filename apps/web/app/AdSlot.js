import {supabase} from '../lib/supabase';
export default async function AdSlot({name,className=''}){
 const {data}=await supabase.from('app_settings').select('value').eq('key',name).maybeSingle();const v=data?.value;
 if(!v?.image)return null;
 return <div className={'ad '+className}><small>ADVERTISEMENT</small><a href={v.link||'#'} rel="sponsored noopener" target="_blank"><img src={v.image} alt="Advertisement"/></a></div>}
