import {notFound} from 'next/navigation';
const P={about:['About us','The Daily is an independent news service. Edit this text in app/p/[slug]/page.js.'],
 contact:['Contact us','Reach our newsroom at news@yourdomain.com. Replace this with your real contact details.'],
 advertise:['Advertise with us','To advertise on our website and app, email ads@yourdomain.com.'],
 privacy:['Privacy policy','Describe what data you collect, how you use it, and how readers can contact you. App stores require this page.'],
 terms:['Terms of service','Set out the rules for using your website and app.']};
export function generateMetadata({params}){return {title:P[params.slug]?.[0]||'Page'}}
export default function Page({params}){const p=P[params.slug];if(!p)notFound();return <main style={{maxWidth:760}}><h1>{p[0]}</h1><p className="art">{p[1]}</p></main>}
