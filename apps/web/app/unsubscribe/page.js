import Unsub from './Unsub';
export const metadata={title:'Unsubscribe',robots:{index:false}};
export default function P({searchParams}){const e=String(searchParams.e||'').slice(0,254);
 return <main style={{maxWidth:600}}><h1>Unsubscribe</h1>{e?<Unsub email={e}/>:<p className="mut">Missing email address.</p>}</main>}
