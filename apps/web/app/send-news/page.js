import SendNews from './SendNews';
export const metadata={title:'Send us news'};
export default function Page(){return <main style={{maxWidth:700}}><h1>Send us news</h1><p className="mut">Saw something newsworthy? Tell our newsroom. You need to sign in first so we can stop spam and reach you if needed.</p><SendNews/></main>}