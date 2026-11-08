'use client';
import {useEditor,EditorContent} from '@tiptap/react';import StarterKit from '@tiptap/starter-kit';import {Node} from '@tiptap/core';
import Underline from '@tiptap/extension-underline';import Link from '@tiptap/extension-link';import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';import {Color} from '@tiptap/extension-color';import TextStyle from '@tiptap/extension-text-style';
import {sbBrowser} from '../../lib/auth';import {shrink} from '../../lib/shrink';const supabase=sbBrowser();
const Pair=Node.create({name:'imagePair',group:'block',atom:true,
 addAttributes(){return {a:{default:null},b:{default:null}}},
 parseHTML(){return [{tag:'div.pair',getAttrs:el=>({a:el.querySelectorAll('img')[0]?.getAttribute('src'),b:el.querySelectorAll('img')[1]?.getAttribute('src')})}]},
 renderHTML({node}){return ['div',{class:'pair'},['img',{src:node.attrs.a,alt:''}],['img',{src:node.attrs.b,alt:''}]]}});
export default function Editor({value,onChange}){
 const ed=useEditor({immediatelyRender:false,content:value,onUpdate:({editor})=>onChange(editor.getHTML()),
  extensions:[StarterKit,Pair,Underline,Link.configure({openOnClick:false}),Image,TextStyle,Color,TextAlign.configure({types:['heading','paragraph']})]});
 if(!ed)return null;const c=()=>ed.chain().focus();
 const up=async e=>{const f0=e.target.files[0];if(!f0)return;const f=await shrink(f0);const p=Date.now()+'-'+f.name.replace(/[^a-zA-Z0-9.]/g,'_');
  const {error}=await supabase.storage.from('media').upload(p,f,{cacheControl:'31536000'});if(error)return alert(error.message);
  c().setImage({src:supabase.storage.from('media').getPublicUrl(p).data.publicUrl}).run()};
 const pair=async e=>{const fs=[...e.target.files];if(fs.length!==2)return alert('Please select exactly 2 images');const urls=[];
  for(const [i,f0] of fs.entries()){const f=await shrink(f0);const p=Date.now()+'-'+i+'-'+f.name.replace(/[^a-zA-Z0-9.]/g,'_');const {error}=await supabase.storage.from('media').upload(p,f,{cacheControl:'31536000'});
   if(error)return alert(error.message);urls.push(supabase.storage.from('media').getPublicUrl(p).data.publicUrl)}
  c().insertContent({type:'imagePair',attrs:{a:urls[0],b:urls[1]}}).run();e.target.value=''};
 const B=(l,f)=><button type="button" key={l} onClick={f}>{l}</button>;
 return <div><div className="tb">{[
  B('Bold',()=>c().toggleBold().run()),B('Italic',()=>c().toggleItalic().run()),B('Underline',()=>c().toggleUnderline().run()),B('Strike',()=>c().toggleStrike().run()),
  B('H2',()=>c().toggleHeading({level:2}).run()),B('H3',()=>c().toggleHeading({level:3}).run()),B('Bullets',()=>c().toggleBulletList().run()),
  B('Numbers',()=>c().toggleOrderedList().run()),B('Quote',()=>c().toggleBlockquote().run()),B('Left',()=>c().setTextAlign('left').run()),
  B('Center',()=>c().setTextAlign('center').run()),B('Right',()=>c().setTextAlign('right').run()),
  B('Link',()=>{const u=prompt('URL');u?c().setLink({href:u}).run():c().unsetLink().run()}),
  B('Embed link',()=>{const u=prompt('Video or embed URL');u&&c().insertContent(`<p><a href="${u}">${u}</a></p>`).run()}),
  B('Undo',()=>c().undo().run()),B('Redo',()=>c().redo().run()),
  <input key="col" type="color" style={{width:44}} onChange={e=>c().setColor(e.target.value).run()}/>,
  <input key="img" type="file" accept="image/*" onChange={up}/>,<label key="pair" className="mut">Two images side by side (pick 2): <input type="file" accept="image/*" multiple onChange={pair}/></label>]}</div><EditorContent editor={ed}/></div>}
