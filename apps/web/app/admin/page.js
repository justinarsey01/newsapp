'use client';
import {useEffect,useRef,useState} from 'react';
import {sbBrowser} from '../../lib/auth';
import {ROLES,PERMS} from '@news/shared';
import Editor from './Editor';
import {clean} from '../../lib/clean';
import {shrink} from '../../lib/shrink';
const sb=sbBrowser();
const slugify=t=>String(t||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const esc=s=>String(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const when=d=>d?new Date(d).toLocaleString():'';
const sure=m=>window.confirm(m);
const STATUS={draft:'Draft',pending_review:'Waiting for review',published:'Published',rejected:'Sent back'};
const upload=async(file,prefix)=>{const f=await shrink(file);const p=prefix+'-'+Date.now()+'-'+f.name.replace(/[^a-zA-Z0-9.]/g,'_');
 const {error}=await sb.storage.from('media').upload(p,f,{cacheControl:'31536000'});if(error)throw error;return sb.storage.from('media').getPublicUrl(p).data.publicUrl};
const CSS=`.adm{display:grid;grid-template-columns:240px 1fr;max-width:1280px;margin:0 auto;min-height:70vh}
.adm-side{padding:14px;border-right:1px solid var(--bd);position:sticky;top:96px;align-self:start;max-height:calc(100vh - 110px);overflow:auto}
.adm-user{padding:10px 12px;margin-bottom:6px;background:var(--card);border:1px solid var(--bd);border-radius:12px;display:flex;flex-direction:column}.adm-user small{color:var(--mut)}
.adm-g{font-size:11px;letter-spacing:.8px;text-transform:uppercase;color:var(--mut);margin:14px 8px 4px}
.adm-i{display:flex;align-items:center;gap:10px;width:100%;text-align:left;border:0;background:transparent;color:var(--fg);padding:10px 12px;border-radius:10px;font-size:15px;margin:1px 0}
.adm-i:hover{background:rgba(10,122,61,.1)}.adm-i.on{background:var(--ac);color:#fff;font-weight:700}
.adm-i em{margin-left:auto;background:#c0392b;color:#fff;border-radius:12px;font-style:normal;font-size:12px;padding:1px 8px}
.adm-main{padding:16px 22px;min-width:0}.adm-bar{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px}.adm-burger{display:none}
.adm-h{margin:6px 0 4px}.adm-sub{color:var(--mut);margin:0 0 14px}
.adm-stats{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:12px;margin:10px 0 18px}
.adm-stat{background:var(--card);border:1px solid var(--bd);border-radius:14px;padding:14px;text-align:left;cursor:pointer;color:var(--fg)}.adm-stat b{display:block;font-size:28px;color:var(--ac)}
.adm-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.adm-row label{display:inline-flex;align-items:center;gap:6px;margin:0;font-weight:500}.adm-row input[type=checkbox]{width:auto}
.adm label{display:block;margin:8px 0;font-weight:600;font-size:14px}
.adm-badge{font-size:12px;padding:2px 10px;border-radius:12px;background:var(--bd);display:inline-block}.adm-badge.published{background:#d7f0df;color:#0a5c2e}.adm-badge.pending_review{background:#fdf0cf;color:#8a5a00}.adm-badge.rejected{background:#f8d9d6;color:#9b2c20}
.adm-badge.sev-clear{background:#d7f0df;color:#0a5c2e}.adm-badge.sev-moderate{background:#fdf0cf;color:#8a5a00}.adm-badge.sev-heavy{background:#fde0cf;color:#a34100}.adm-badge.sev-blocked{background:#f8d9d6;color:#9b2c20}
.adm-toast{position:fixed;bottom:22px;left:50%;transform:translateX(-50%);background:#111;color:#fff;padding:10px 20px;border-radius:24px;z-index:60;box-shadow:0 6px 20px rgba(0,0,0,.3)}
.adm button.danger{color:#c0392b;border-color:#c0392b}.adm-login{max-width:420px}.adm-perms{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:4px;margin-top:8px}
@media(max-width:860px){.adm{grid-template-columns:1fr}.adm-side{display:none;position:static;max-height:none;border-right:0;border-bottom:1px solid var(--bd)}.adm-side.open{display:block}.adm-burger{display:inline-block}.adm-main{padding:12px}}`;

export default function Admin(){
 const [me,setMe]=useState(null),[ready,setReady]=useState(false),[auth,setAuth]=useState({email:'',password:'',name:''}),[msg,setMsg]=useState('');
 const load=async()=>{const {data:{user}}=await sb.auth.getUser();if(!user){setMe(null);setReady(true);return}
  setMe((await sb.from('profiles').select('*').eq('id',user.id).maybeSingle()).data);setReady(true)};
 useEffect(()=>{load()},[]);
 const login=async up=>{const {error}=up?await sb.auth.signUp({email:auth.email,password:auth.password,options:{data:{full_name:auth.name}}}):await sb.auth.signInWithPassword({email:auth.email,password:auth.password});
  setMsg(error?error.message:up?'Check your email to confirm, then sign in.':'');load()};
 if(!ready)return <main><style>{CSS}</style><p className="mut">Loading…</p></main>;
 if(!me)return <main className="adm adm-login" style={{display:'block'}}><style>{CSS}</style><div className="card"><h2>Admin sign in</h2>
  <form onSubmit={e=>{e.preventDefault();login(false)}}><input placeholder="Your name (only for sign up)" onChange={e=>setAuth({...auth,name:e.target.value})}/>
  <input type="email" placeholder="Email" onChange={e=>setAuth({...auth,email:e.target.value})}/><input type="password" placeholder="Password" onChange={e=>setAuth({...auth,password:e.target.value})}/>
  <button className="p" type="submit">Sign in</button> <button type="button" onClick={()=>login(true)}>Create account</button></form><p className="mut">{msg}</p></div></main>;
 return <AdminShell me={me} reload={load}/>}

function AdminShell({me,reload}){
 const sup=me.role==='super_admin',can=p=>sup||(me.permissions||[]).includes(p);
 const [tab,setTab]=useState('home'),[edit,setEdit]=useState(null),[toast,setToast]=useState(''),[counts,setCounts]=useState({review:0,tips:0}),[menu,setMenu]=useState(false);
 const say=m=>{setToast(m);setTimeout(()=>setToast(''),2800)};
 const refresh=async()=>{const r=can('articles.approve')?await sb.from('articles').select('id',{count:'exact',head:true}).eq('status','pending_review'):{count:0};
  const t=can('tips.manage')?await sb.from('news_tips').select('id',{count:'exact',head:true}).eq('status','new'):{count:0};setCounts({review:r.count||0,tips:t.count||0})};
 useEffect(()=>{refresh()},[tab]);
 useEffect(()=>{const h=location.hash.replace('#','');if(['review','tips','traffic'].includes(h))setTab(h)},[]);
 const go=k=>{setTab(k);setEdit(null);setMenu(false)};
 const openEditor=row=>{setEdit(row);setTab('articles');setMenu(false)};
 const NAV=[['Start',[['home','🏠','Overview',true]]],
  ['Content',[['articles','📰','Articles',can('articles.write')||can('articles.approve')],['review','✅','Review queue',can('articles.approve')],['tips','💡','News tips',can('tips.manage')],['videos','🎬','Videos',can('videos.manage')],['categories','🗂️','Categories',can('categories.manage')]]],
  ['Community',[['comments','💬','Comments',can('comments.moderate')],['notify','📣','Notify readers',can('notifications.send')],['traffic','🚦','Traffic alerts',can('traffic.manage')]]],
  ['Manage',[['users','👥','Admins and roles',sup],['settings','⚙️','Settings',can('settings.manage')]]]];
 return <div className="adm"><style>{CSS}</style>
  <aside className={'adm-side'+(menu?' open':'')}>
   <div className="adm-user"><b>{me.full_name||'Admin'}</b><small>{me.role.replace('_',' ')}</small></div>
   {NAV.map(([g,items])=>{const v=items.filter(i=>i[3]);return v.length?<div key={g}><div className="adm-g">{g}</div>{v.map(([k,ic,l])=>
    <button key={k} className={'adm-i'+(tab===k?' on':'')} onClick={()=>go(k)}><span>{ic}</span>{l}{k==='review'&&counts.review>0&&<em>{counts.review}</em>}{k==='tips'&&counts.tips>0&&<em>{counts.tips}</em>}</button>)}</div>:null})}
   <div className="adm-g">Account</div><button className="adm-i" onClick={()=>sb.auth.signOut().then(reload)}><span>🚪</span>Sign out</button></aside>
  <section className="adm-main">
   <div className="adm-bar"><button className="adm-burger" onClick={()=>setMenu(!menu)}>☰ Menu</button><a href="/" target="_blank" rel="noopener">View website ↗</a></div>
   {me.role==='user'&&<div className="card"><b>Almost there.</b><p>Your account is created. A super admin needs to give you a role before you can use the admin area.</p></div>}
   {tab==='home'&&<Overview me={me} can={can} counts={counts} go={go} openEditor={openEditor} say={say}/>}
   {tab==='articles'&&<Articles can={can} edit={edit} setEdit={setEdit} say={say} refresh={refresh}/>}
   {tab==='review'&&<Review openEditor={openEditor} say={say} refresh={refresh}/>}
   {tab==='tips'&&<Tips openEditor={openEditor} say={say} refresh={refresh}/>}
   {tab==='videos'&&<Videos say={say}/>}{tab==='categories'&&<Categories say={say}/>}
   {tab==='comments'&&<CommentsAdmin say={say}/>}{tab==='notify'&&<><Notify say={say}/><Newsletter say={say}/></>}
   {tab==='traffic'&&<TrafficAdmin say={say}/>}{tab==='users'&&<Users say={say}/>}{tab==='settings'&&<Settings say={say}/>}</section>
  {toast&&<div className="adm-toast" role="status">{toast}</div>}</div>}

function Overview({me,can,counts,go,openEditor,say}){
 const [st,setSt]=useState({pub:0,draft:0});
 useEffect(()=>{(async()=>{const c=async s=>(await sb.from('articles').select('id',{count:'exact',head:true}).eq('status',s)).count||0;setSt({pub:await c('published'),draft:await c('draft')})})()},[]);
 const S=({n,l,k})=><button className="adm-stat" onClick={()=>go(k)}><b>{n}</b>{l}</button>;
 return <div><h2 className="adm-h">Welcome, {me.full_name||'Admin'}</h2><p className="adm-sub">Here is what needs your attention.</p>
  <div className="adm-stats">{can('articles.approve')&&<S n={counts.review} l="Stories waiting for review" k="review"/>}{can('tips.manage')&&<S n={counts.tips} l="New news tips" k="tips"/>}<S n={st.pub} l="Published stories" k="articles"/><S n={st.draft} l="Drafts" k="articles"/></div>
  <div className="adm-row">{can('articles.write')&&<button className="p" onClick={()=>openEditor({})}>＋ Write a new article</button>}{can('articles.approve')&&<button onClick={()=>go('review')}>Open review queue</button>}{can('tips.manage')&&<button onClick={()=>go('tips')}>Read news tips</button>}{can('traffic.manage')&&<button onClick={()=>go('traffic')}>🚦 Post a traffic alert</button>}</div>
  {(can('articles.approve')||can('tips.manage'))&&<div style={{marginTop:18}}><Alerts say={say}/></div>}</div>}

function Articles({can,edit,setEdit,say,refresh}){
 const [list,setList]=useState([]),[cats,setCats]=useState([]),[q,setQ]=useState(''),[fs,setFs]=useState('all');
 const load=async()=>{setList((await sb.from('articles').select('id,title,status,review_note,updated_at,profiles(full_name)').order('updated_at',{ascending:false}).limit(200)).data||[]);setCats((await sb.from('categories').select('*').order('name')).data||[])};
 useEffect(()=>{load()},[edit]);
 if(edit)return <ArticleForm key={edit.id||'new'} a0={edit} cats={cats} can={can} say={say} done={()=>{setEdit(null);refresh()}} cancel={()=>setEdit(null)}/>;
 const rows=list.filter(r=>(fs==='all'||r.status===fs)&&(!q||r.title.toLowerCase().includes(q.toLowerCase())));
 return <div><div className="adm-row" style={{justifyContent:'space-between'}}><div><h2 className="adm-h">Articles</h2><p className="adm-sub">Write, edit and manage your stories.</p></div>{can('articles.write')&&<button className="p" onClick={()=>setEdit({})}>＋ New article</button>}</div>
  <div className="adm-row"><input placeholder="Search by headline" value={q} onChange={e=>setQ(e.target.value)} style={{maxWidth:280}}/>
   <select value={fs} onChange={e=>setFs(e.target.value)}><option value="all">All stories</option>{Object.entries(STATUS).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></div>
  {!rows.length&&<p className="mut">No stories found.</p>}
  {rows.map(r=><div className="card" key={r.id}><div className="adm-row" style={{justifyContent:'space-between'}}><b>{r.title}</b><span className={'adm-badge '+r.status}>{STATUS[r.status]||r.status}</span></div>
   <p className="mut">By {r.profiles?.full_name||'unknown'} · updated {when(r.updated_at)}</p>{r.review_note&&<p className="adm-badge rejected">Reviewer note: {r.review_note}</p>}
   <div className="adm-row"><button onClick={async()=>setEdit((await sb.from('articles').select('*').eq('id',r.id).single()).data)}>✏️ Edit</button>
   {can('articles.delete')&&<button className="danger" onClick={async()=>{if(!sure('Delete "'+r.title+'" permanently? This cannot be undone.'))return;const {error}=await sb.from('articles').delete().eq('id',r.id);say(error?error.message:'Article deleted');load();refresh()}}>🗑 Delete</button>}</div></div>)}</div>}

function ArticleForm({a0,cats,can,say,done,cancel}){
 const [a,setA]=useState(a0),content=useRef(a0.content||''),[busy,setBusy]=useState(false),approver=can('articles.approve');
 const set=k=>e=>setA({...a,[k]:e.target.value}),tick=k=>e=>setA({...a,[k]:e.target.checked});
 const save=async status=>{if(!(a.title||'').trim())return say('Please add a headline first');setBusy(true);
  const html=content.current||'';const row={title:a.title.trim(),slug:(a.slug||slugify(a.title)).trim(),excerpt:a.excerpt||'',content:html,
   cover_image_url:a.cover_image_url||((html.match(/<img[^>]+src="([^"]+)"/)||[])[1])||null,category_id:a.category_id||null,is_breaking:!!a.is_breaking,is_sponsored:!!a.is_sponsored,allow_comments:a.allow_comments!==false,status};
  const {error}=a.id?await sb.from('articles').update(row).eq('id',a.id):await sb.from('articles').insert(row);setBusy(false);
  if(error)return say(/duplicate/i.test(error.message)?'That headline is already used. Change it slightly.':error.message);
  say(status==='draft'?'Draft saved':approver?'Published':'Submitted for review');done()};
 const del=async()=>{if(!sure('Delete "'+a.title+'" permanently? This cannot be undone.'))return;const {error}=await sb.from('articles').delete().eq('id',a.id);if(error)return say(error.message);say('Article deleted');done()};
 return <div className="card"><div className="adm-row" style={{justifyContent:'space-between'}}><h2 className="adm-h">{a.id?'Edit article':'New article'}</h2>{a.status&&<span className={'adm-badge '+a.status}>{STATUS[a.status]}</span>}</div>
  {a.review_note&&a.status==='rejected'&&<p className="adm-badge rejected">Reviewer note: {a.review_note}</p>}
  <label>Headline<input value={a.title||''} onChange={set('title')} placeholder="Write a clear headline"/></label>
  <label>Web address (optional)<input value={a.slug||''} onChange={set('slug')} placeholder="made automatically from the headline"/></label>
  <label>Short summary<textarea rows={2} value={a.excerpt||''} onChange={set('excerpt')} placeholder="One or two lines shown on the home page"/></label>
  <label>Category<select value={a.category_id||''} onChange={set('category_id')}><option value="">No category</option>{cats.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
  <label>Cover image<input value={a.cover_image_url||''} onChange={set('cover_image_url')} placeholder="Paste an image link, or upload one below"/></label>
  <label>Or upload a cover picture <input type="file" accept="image/*" onChange={async e=>{const f=e.target.files[0];if(!f)return;try{const url=await upload(f,'cover');setA({...a,cover_image_url:url});say('Cover uploaded')}catch(err){say('Upload failed: '+err.message)}}}/></label>
  {a.cover_image_url&&<img src={a.cover_image_url} alt="" style={{maxWidth:220,borderRadius:10,display:'block',marginBottom:8}}/>}
  <div className="adm-row" style={{margin:'10px 0'}}><label><input type="checkbox" checked={!!a.is_breaking} onChange={tick('is_breaking')}/> Breaking news</label>
   <label><input type="checkbox" checked={!!a.is_sponsored} onChange={tick('is_sponsored')}/> Promoted (sponsored)</label><label><input type="checkbox" checked={a.allow_comments!==false} onChange={tick('allow_comments')}/> Allow comments</label></div>
  <Editor value={a0.content||''} onChange={h=>{content.current=h}}/>
  <div className="adm-row" style={{marginTop:14}}><button disabled={busy} onClick={()=>save('draft')}>Save as draft</button>
   <button className="p" disabled={busy} onClick={()=>save('published')}>{approver?(a.status==='published'?'Update story':'Publish now'):'Submit for review'}</button>
   <button onClick={cancel}>Cancel</button>{a.id&&can('articles.delete')&&<button className="danger" style={{marginLeft:'auto'}} onClick={del}>🗑 Delete</button>}</div>
  {!approver&&<p className="mut">Your story goes to a reviewer before it appears on the site.</p>}</div>}

function Review({openEditor,say,refresh}){
 const [l,setL]=useState([]),[open,setOpen]=useState(null);
 const load=async()=>{setL((await sb.from('articles').select('*,profiles(full_name),categories(name)').eq('status','pending_review').order('updated_at')).data||[]);refresh()};
 useEffect(()=>{load()},[]);
 const approve=async r=>{if(!sure('Publish "'+r.title+'" now?'))return;const {error}=await sb.from('articles').update({status:'published',published_at:new Date().toISOString()}).eq('id',r.id);say(error?error.message:'Published');load()};
 const reject=async r=>{const note=prompt('Why are you sending it back? The writer will see this.');if(note===null)return;const {error}=await sb.from('articles').update({status:'rejected',review_note:note}).eq('id',r.id);say(error?error.message:'Sent back to the writer');load()};
 return <div><h2 className="adm-h">Review queue</h2><p className="adm-sub">Stories submitted by your team. You can edit them like normal before publishing.</p>
  {!l.length&&<div className="card"><b>All clear.</b><p className="mut">No stories are waiting for review.</p></div>}
  {l.map(r=><div className="card" key={r.id}><b style={{fontSize:18}}>{r.title}</b><p className="mut">By <b>{r.profiles?.full_name||'unknown'}</b>{r.categories?.name?' · '+r.categories.name:''} · submitted {when(r.updated_at)}</p>
   {open===r.id&&<div className="art" style={{borderTop:'1px solid var(--bd)',paddingTop:10}} dangerouslySetInnerHTML={{__html:clean(r.content)}}/>}
   <div className="adm-row"><button onClick={()=>setOpen(open===r.id?null:r.id)}>{open===r.id?'Hide preview':'👁 Preview'}</button><button onClick={()=>openEditor(r)}>✏️ Edit</button>
    <button className="p" onClick={()=>approve(r)}>✅ Approve and publish</button><button className="danger" onClick={()=>reject(r)}>↩ Send back</button></div></div>)}</div>}

function Tips({openEditor,say,refresh}){
 const [l,setL]=useState([]),[f,setF]=useState('new');
 const load=async()=>{let q=sb.from('news_tips').select('*').order('created_at',{ascending:false}).limit(100);if(f!=='all')q=q.eq('status',f);setL((await q).data||[]);refresh()};
 useEffect(()=>{load()},[f]);
 const st=async(id,status)=>{await sb.from('news_tips').update({status}).eq('id',id);load()};
 const make=async t=>{const html=(t.details||'').split(/\n+/).filter(Boolean).map(p=>'<p>'+esc(p)+'</p>').join('');
  const {data,error}=await sb.from('articles').insert({title:t.headline,slug:slugify(t.headline)+'-'+Date.now().toString(36),content:html,excerpt:(t.details||'').slice(0,160),status:'draft'}).select().single();
  if(error)return say(error.message);await sb.from('news_tips').update({status:'used'}).eq('id',t.id);say('Draft created from the tip');openEditor(data)};
 return <div><h2 className="adm-h">News tips</h2><p className="adm-sub">Stories sent in by readers. Turn a good one into an article and edit it as you like.</p>
  <div className="adm-row" style={{marginBottom:10}}>{[['new','New'],['used','Used'],['rejected','Rejected'],['all','All']].map(([k,v])=><button key={k} className={f===k?'p':''} onClick={()=>setF(k)}>{v}</button>)}</div>
  {!l.length&&<p className="mut">No tips here.</p>}
  {l.map(t=><div className="card" key={t.id}><div className="adm-row" style={{justifyContent:'space-between'}}><b>{t.headline}</b><span className="adm-badge">{t.status}</span></div>
   <p style={{whiteSpace:'pre-wrap'}}>{t.details}</p><p className="mut">From {t.author_name}{t.location?' · '+t.location:''}{t.contact?' · Contact: '+t.contact:''} · {when(t.created_at)}</p>
   <div className="adm-row"><button className="p" onClick={()=>make(t)}>✏️ Write article from this tip</button>{t.status!=='rejected'&&<button onClick={()=>st(t.id,'rejected')}>Reject</button>}
    <button className="danger" onClick={async()=>{if(!sure('Delete this tip permanently?'))return;await sb.from('news_tips').delete().eq('id',t.id);say('Tip deleted');load()}}>🗑 Delete</button></div></div>)}</div>}

function CommentsAdmin({say}){
 const [l,setL]=useState([]);const load=async()=>setL((await sb.from('comments').select('id,body,author_name,created_at,articles(title)').order('created_at',{ascending:false}).limit(100)).data||[]);useEffect(()=>{load()},[]);
 return <div><h2 className="adm-h">Comments</h2><p className="adm-sub">The latest 100 comments. Remove anything abusive or off-topic.</p>{!l.length&&<p className="mut">No comments yet.</p>}
  {l.map(c=><div className="card" key={c.id}><b>{c.author_name}</b> <span className="mut">on “{c.articles?.title}” · {when(c.created_at)}</span><p style={{whiteSpace:'pre-wrap'}}>{c.body}</p>
   <button className="danger" onClick={async()=>{if(!sure('Delete this comment? This cannot be undone.'))return;await sb.from('comments').delete().eq('id',c.id);say('Comment deleted');load()}}>🗑 Delete</button></div>)}</div>}

function Videos({say}){
 const [l,setL]=useState([]),[u,setU]=useState(''),[t,setT]=useState(''),[cs,setCs]=useState([]),[cid,setCid]=useState('');
 const load=async()=>setL((await sb.from('videos').select('*').order('created_at',{ascending:false})).data||[]);
 useEffect(()=>{load();sb.from('categories').select('id,name').order('name').then(r=>setCs(r.data||[]))},[]);
 const add=async()=>{const m=u.match(/(?:youtu\.be\/|v=|shorts\/|embed\/)([A-Za-z0-9_-]{11})/);if(!m)return say('Paste a valid YouTube link');if(!t.trim())return say('Add a title');
  const {error}=await sb.from('videos').insert({title:t.trim(),youtube_id:m[1],category_id:cid||null});if(error)return say(error.message);setU('');setT('');say('Video added');load()};
 return <div><h2 className="adm-h">Videos</h2><p className="adm-sub">Videos shown in the app. Paste a YouTube link.</p>
  <div className="card"><input placeholder="YouTube link" value={u} onChange={e=>setU(e.target.value)}/><input placeholder="Title" value={t} onChange={e=>setT(e.target.value)}/>
   <div className="adm-row"><select value={cid} onChange={e=>setCid(e.target.value)}><option value="">No category</option>{cs.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select><button className="p" onClick={add}>＋ Add video</button></div></div>
  {!l.length&&<p className="mut">No videos yet.</p>}
  {l.map(v=><div className="card adm-row" key={v.id}><img src={`https://i.ytimg.com/vi/${v.youtube_id}/mqdefault.jpg`} alt="" style={{width:110,borderRadius:8}}/><span style={{flex:1}}><b>{v.title}</b><br/><small className="mut">{cs.find(c=>c.id===v.category_id)?.name||'No category'}</small></span>
   <button className="danger" onClick={async()=>{if(!sure('Delete the video "'+v.title+'"?'))return;await sb.from('videos').delete().eq('id',v.id);say('Video deleted');load()}}>🗑 Delete</button></div>)}</div>}

function Categories({say}){
 const [l,setL]=useState([]),[n,setN]=useState('');const load=async()=>setL((await sb.from('categories').select('*').order('name')).data||[]);useEffect(()=>{load()},[]);
 return <div><h2 className="adm-h">Categories</h2><p className="adm-sub">Sections of your site and app.</p>
  <div className="card adm-row"><input placeholder="New category name, e.g. Politics" value={n} onChange={e=>setN(e.target.value)} style={{flex:1,minWidth:200}}/>
   <button className="p" onClick={async()=>{if(!n.trim())return say('Type a name first');const {error}=await sb.from('categories').insert({name:n.trim(),slug:slugify(n)});say(error?error.message:'Category added');setN('');load()}}>＋ Add</button></div>
  {!l.length&&<p className="mut">No categories yet.</p>}
  {l.map(c=><div className="card adm-row" key={c.id} style={{justifyContent:'space-between'}}><b>{c.name}</b>
   <button className="danger" onClick={async()=>{if(!sure('Delete the category "'+c.name+'"?'))return;const {error}=await sb.from('categories').delete().eq('id',c.id);say(error?'This category still has stories. Move or delete them first.':'Category deleted');load()}}>🗑 Delete</button></div>)}</div>}

function Notify({say}){
 const [t,setT]=useState(''),[b,setB]=useState(''),[u,setU]=useState(''),[im,setIm]=useState(''),[arts,setArts]=useState([]),[busy,setBusy]=useState(false);
 useEffect(()=>{sb.from('articles').select('title,slug,excerpt,cover_image_url').eq('status','published').order('published_at',{ascending:false}).limit(20).then(r=>setArts(r.data||[]))},[]);
 const send=async()=>{if(!t.trim())return say('Add a title first');if(!sure('Send this notification to every reader now?'))return;setBusy(true);
  const {data,error}=await sb.functions.invoke('send-push',{body:{title:t,body:b,url:u,image:im}});setBusy(false);
  say(error?error.message:`Sent to ${data.sent+data.web} devices`+((data.expoErrors?.length||data.webErrors?.length)?` (problems: ${[...(data.expoErrors||[]),...(data.webErrors||[])].join(', ')})`:''))};
 return <div className="card"><h2 className="adm-h">Push notification</h2><p className="adm-sub">Appears on phones and browsers of readers who turned notifications on.</p>
  <label>Start from a published story<select onChange={e=>{const a=arts.find(x=>x.slug===e.target.value);if(a){setT(a.title);setB(a.excerpt||'');setU('/article/'+a.slug);setIm(a.cover_image_url||'')}}}><option value="">Pick a story (fills the form)</option>{arts.map(a=><option key={a.slug} value={a.slug}>{a.title}</option>)}</select></label>
  <label>Title<input value={t} onChange={e=>setT(e.target.value)}/></label><label>Message<textarea rows={2} value={b} onChange={e=>setB(e.target.value)}/></label>
  <label>Story link (optional)<input value={u} onChange={e=>setU(e.target.value)} placeholder="/article/my-story"/></label><label>Picture link (optional)<input value={im} onChange={e=>setIm(e.target.value)}/></label>
  <label>Or upload a picture <input type="file" accept="image/*" onChange={async e=>{const f=e.target.files[0];if(!f)return;try{setIm(await upload(f,'push'))}catch(err){say(err.message)}}}/></label>
  {im&&<img src={im} alt="" style={{maxWidth:240,borderRadius:8,display:'block',marginBottom:8}}/>}<button className="p" disabled={busy} onClick={send}>{busy?'Sending…':'📣 Send notification'}</button></div>}

function Newsletter({say}){
 const [s,setS]=useState(''),[b,setB]=useState(''),[l,setL]=useState(''),[busy,setBusy]=useState(false);
 return <div className="card"><h2 className="adm-h">Email subscribers</h2><label>Subject<input value={s} onChange={e=>setS(e.target.value)}/></label><label>Message<textarea rows={3} value={b} onChange={e=>setB(e.target.value)}/></label>
  <label>Story link (optional)<input value={l} onChange={e=>setL(e.target.value)}/></label>
  <button className="p" disabled={busy} onClick={async()=>{if(!s.trim())return say('Add a subject first');if(!sure('Email all subscribers now?'))return;setBusy(true);const {data,error}=await sb.functions.invoke('send-newsletter',{body:{subject:s,body:b,link:l}});setBusy(false);say(error?error.message:`Emailed ${data.sent} subscribers`)}}>✉️ Send email</button></div>}

function Users({say}){
 const [l,setL]=useState([]),[q,setQ]=useState(''),[staff,setStaff]=useState(true);const load=async()=>setL((await sb.from('profiles').select('*').order('created_at',{ascending:false}).limit(300)).data||[]);useEffect(()=>{load()},[]);
 const upd=async(u,patch)=>{const {error}=await sb.from('profiles').update(patch).eq('id',u.id);say(error?error.message:'Saved');load()};
 const rows=l.filter(u=>(!staff||u.role!=='user')&&(!q||(u.full_name||'').toLowerCase().includes(q.toLowerCase())));
 return <div><h2 className="adm-h">Admins and roles</h2><p className="adm-sub">Choose a role, then tick exactly what each person may do. New accounts start as “user” until you give them a role.</p>
  <div className="adm-row" style={{marginBottom:10}}><input placeholder="Search by name" value={q} onChange={e=>setQ(e.target.value)} style={{maxWidth:260}}/><label><input type="checkbox" checked={staff} onChange={e=>setStaff(e.target.checked)}/> Show team only (hide readers)</label></div>
  {!rows.length&&<p className="mut">Nobody found.</p>}
  {rows.map(u=><div className="card" key={u.id}><div className="adm-row" style={{justifyContent:'space-between'}}><b>{u.full_name||u.id.slice(0,8)}</b>
   <select value={u.role} onChange={e=>upd(u,{role:e.target.value})}>{[...ROLES,'user'].map(r=><option key={r} value={r}>{r.replace('_',' ')}</option>)}</select></div>
   {u.role==='super_admin'?<p className="mut">Super admins can do everything.</p>:<div className="adm-perms">{Object.entries(PERMS).map(([k,v])=><label key={k} style={{fontWeight:500}}>
    <input type="checkbox" style={{width:'auto'}} checked={(u.permissions||[]).includes(k)} onChange={e=>upd(u,{permissions:e.target.checked?[...(u.permissions||[]),k]:(u.permissions||[]).filter(x=>x!==k)})}/> {v}</label>)}</div>}</div>)}</div>}

const ADS=[['ad_header','Header banner','Under the top bar on every page'],['ad_sidebar','Home sidebar ad','Next to the lead story on the home page'],['ad_inline','In-page ad','Between sections and on category pages'],['ad_article','Article ad','Below each story']];
const SOCIAL=['facebook','x','instagram','youtube','tiktok','whatsapp','telegram'];
function Settings({say}){
 const [m,setM]=useState(false),[ads,setAds]=useState({}),[so,setSo]=useState({});
 useEffect(()=>{sb.from('app_settings').select('*').in('key',['maintenance','ad_header','ad_sidebar','ad_inline','ad_article','social']).then(({data})=>{const a={};(data||[]).forEach(x=>{if(x.key==='maintenance')setM(!!x.value);else if(x.key==='social')setSo(x.value||{});else a[x.key]=x.value||{}});setAds(a)})},[]);
 const save=async(key,value)=>{const {error}=await sb.from('app_settings').upsert({key,value});say(error?error.message:'Saved')};
 return <div><h2 className="adm-h">Settings</h2><p className="adm-sub">Site-wide options.</p>
  <div className="card"><h3 className="adm-h">Maintenance mode</h3><p className="mut">Shows “We are updating the app” to everyone using the mobile app.</p>
   <label style={{display:'inline-flex',gap:8,alignItems:'center'}}><input type="checkbox" style={{width:'auto'}} checked={m} onChange={async e=>{const v=e.target.checked;if(v&&!sure('Turn on maintenance mode? Everyone using the app will see an updating message.'))return;setM(v);await save('maintenance',v)}}/> Maintenance mode is {m?'ON':'off'}</label></div>
  <div className="card"><h3 className="adm-h">Social links</h3><p className="mut">Shown in the website footer and in the app. Leave blank to hide one.</p>
   {SOCIAL.map(k=><label key={k} style={{textTransform:'capitalize'}}>{k}<input value={so[k]||''} onChange={e=>setSo({...so,[k]:e.target.value})} placeholder="https://..."/></label>)}<button className="p" onClick={()=>save('social',so)}>Save social links</button></div>
  <div className="card"><h3 className="adm-h">Advert spaces</h3><p className="mut">Paste a banner picture link and where it should lead. Leave empty to hide the space.</p>
   {ADS.map(([k,l,h])=><div key={k} style={{marginBottom:12}}><b>{l}</b> <span className="mut">· {h}</span>
    <input placeholder="Picture link" value={(ads[k]||{}).image||''} onChange={e=>setAds({...ads,[k]:{...(ads[k]||{}),image:e.target.value}})}/><input placeholder="Link when tapped" value={(ads[k]||{}).link||''} onChange={e=>setAds({...ads,[k]:{...(ads[k]||{}),link:e.target.value}})}/></div>)}
   <button className="p" onClick={async()=>{for(const [k] of ADS)await sb.from('app_settings').upsert({key:k,value:ads[k]||{}});say('Adverts saved')}}>Save adverts</button></div></div>}

const b64=s=>{const r=(s+'='.repeat((4-s.length%4)%4)).replace(/-/g,'+').replace(/_/g,'/');return Uint8Array.from([...atob(r)].map(c=>c.charCodeAt(0)))};
function Alerts({say}){
 const [st,setSt]=useState('checking');
 useEffect(()=>{(async()=>{if(!('serviceWorker' in navigator)||!('PushManager' in window)||!('Notification' in window))return setSt('unsupported');
  try{const r=await navigator.serviceWorker.ready;const sub=await r.pushManager.getSubscription();setSt(sub&&Notification.permission==='granted'&&localStorage.staffAlerts?'on':'off')}catch(e){setSt('off')}})()},[]);
 const on=async()=>{try{setSt('busy');
  if(await Notification.requestPermission()!=='granted'){setSt('off');return say('Notifications are blocked in this browser. Allow them in the site settings.')}
  const reg=await navigator.serviceWorker.ready;let sub=await reg.pushManager.getSubscription();
  if(!sub)sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:b64(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY)});
  const j=sub.toJSON();const {error}=await sb.rpc('save_staff_sub',{e:j.endpoint,k:j.keys.p256dh,a:j.keys.auth});
  if(error){setSt('off');return say(error.message)}
  localStorage.staffAlerts='1';setSt('on');say('Alerts are on for this device');
  reg.showNotification('Alerts are on',{body:'You will be notified here when a story or tip needs you.',icon:'/icon-192.png'})}catch(e){setSt('off');say('Could not turn on alerts: '+(e.message||e))}};
 const off=async()=>{try{const reg=await navigator.serviceWorker.ready;const sub=await reg.pushManager.getSubscription();if(sub)await sb.rpc('remove_staff_sub',{e:sub.endpoint});localStorage.removeItem('staffAlerts');setSt('off');say('Alerts turned off for this device')}catch(e){say(e.message)}};
 return <div className="card"><h3 className="adm-h">📲 Phone and computer alerts</h3>
  <p className="mut">Get a notification on this device when a story is waiting for review or a reader sends a tip. Open this page on your phone to turn it on there too.</p>
  {st==='unsupported'?<p className="mut">This browser does not support notifications. On iPhone, add the site to your Home Screen first.</p>
  :st==='on'?<button onClick={off}>🔕 Turn off alerts on this device</button>:<button className="p" disabled={st==='busy'||st==='checking'} onClick={on}>{st==='busy'?'Turning on…':'🔔 Turn on alerts on this device'}</button>}</div>}

const TCITIES=['Lagos','Abuja','Port Harcourt','Kano','Ibadan','Enugu','Abeokuta','Asaba','Onitsha','Benin City','Owerri','Other'];
const KINDS={traffic:'🚗 Heavy traffic',accident:'💥 Accident',flood:'🌊 Flooding',roadwork:'🚧 Road works',closure:'⛔ Road closed',police:'👮 Checkpoint'};
const SEV={clear:'Clear',moderate:'Moderate',heavy:'Heavy',blocked:'Blocked'};
const DUR=[[30,'30 minutes'],[60,'1 hour'],[180,'3 hours'],[360,'6 hours'],[720,'12 hours'],[1440,'24 hours']];
function TrafficAdmin({say}){
 const blank={city:'Lagos',road:'',kind:'traffic',severity:'heavy',details:'',mins:180,notify:false};
 const [f,setF]=useState(blank),[l,setL]=useState([]),[busy,setBusy]=useState(false);
 const load=async()=>setL((await sb.from('traffic_alerts').select('*').order('created_at',{ascending:false}).limit(60)).data||[]);useEffect(()=>{load()},[]);
 const set=k=>e=>setF({...f,[k]:e.target.type==='checkbox'?e.target.checked:e.target.value});
 const post=async()=>{if(!f.road.trim())return say('Say which road or area');
  if(f.notify&&!sure('Also send a push notification to all readers?'))return;setBusy(true);
  const row={city:f.city,road:f.road.trim(),kind:f.kind,severity:f.severity,details:f.details.trim()||null,expires_at:new Date(Date.now()+f.mins*60000).toISOString()};
  const {error}=await sb.from('traffic_alerts').insert(row);setBusy(false);if(error)return say(error.message);
  if(f.notify)await sb.functions.invoke('send-push',{body:{title:KINDS[f.kind].replace(/^\S+\s/,'')+': '+f.road.trim()+' ('+f.city+')',body:f.details.trim()||'Tap for the latest road alerts.',url:'/traffic'}});
  say('Alert posted');setF(blank);load()};
 const active=a=>new Date(a.expires_at)>new Date();
 return <div><h2 className="adm-h">Traffic alerts</h2><p className="adm-sub">Post road updates. They show on the website and in the app, then disappear by themselves when they expire.</p>
  <div className="card"><div className="adm-row"><label>City<select value={f.city} onChange={set('city')}>{TCITIES.map(c=><option key={c}>{c}</option>)}</select></label>
   <label>Type<select value={f.kind} onChange={set('kind')}>{Object.entries(KINDS).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></label>
   <label>How bad?<select value={f.severity} onChange={set('severity')}>{Object.entries(SEV).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></label>
   <label>Show for<select value={f.mins} onChange={e=>setF({...f,mins:Number(e.target.value)})}>{DUR.map(([m,lb])=><option key={m} value={m}>{lb}</option>)}</select></label></div>
   <label>Road or area<input value={f.road} onChange={set('road')} placeholder="e.g. Third Mainland Bridge, towards Ikoyi"/></label>
   <label>Details (optional)<textarea rows={2} value={f.details} onChange={set('details')} placeholder="What is happening and what should drivers do?"/></label>
   <div className="adm-row"><label><input type="checkbox" checked={f.notify} onChange={set('notify')}/> Also send a push notification to readers</label><button className="p" disabled={busy} onClick={post}>🚦 Post alert</button></div></div>
  {!l.length&&<p className="mut">No alerts yet.</p>}
  {l.map(a=>{const on=active(a);return <div className="card" key={a.id} style={{opacity:on?1:.6}}><div className="adm-row" style={{justifyContent:'space-between'}}><b>{KINDS[a.kind]||a.kind} · {a.city}</b><span className={'adm-badge sev-'+a.severity}>{SEV[a.severity]}</span></div>
   <p style={{margin:'4px 0'}}><b>{a.road}</b></p>{a.details&&<p className="mut" style={{whiteSpace:'pre-wrap'}}>{a.details}</p>}
   <p className="mut">{on?'Live until '+when(a.expires_at):'Ended '+when(a.expires_at)}</p>
   <div className="adm-row">{on&&<button onClick={async()=>{await sb.from('traffic_alerts').update({expires_at:new Date().toISOString()}).eq('id',a.id);say('Alert ended');load()}}>⏹ End now</button>}
   <button className="danger" onClick={async()=>{if(!sure('Delete this alert?'))return;await sb.from('traffic_alerts').delete().eq('id',a.id);say('Alert deleted');load()}}>🗑 Delete</button></div></div>})}</div>}
