'use client';
import {useEffect,useRef} from 'react';import {usePathname} from 'next/navigation';
export default function CatNav({cats}){
 const ref=useRef(),path=usePathname();
 useEffect(()=>{const el=ref.current;if(!el||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  let paused=false,t,raf,pos=0;
  const pause=()=>{paused=true;clearTimeout(t)},resume=()=>{clearTimeout(t);t=setTimeout(()=>{pos=el.scrollLeft;paused=false},2500)};
  const step=()=>{if(!paused){pos+=0.35;if(pos>=el.scrollWidth/4)pos=0;el.scrollLeft=pos}raf=requestAnimationFrame(step)};
  ['pointerdown','touchstart','wheel','mouseenter','focusin'].forEach(e=>el.addEventListener(e,pause,{passive:true}));
  ['pointerup','touchend','mouseleave','focusout'].forEach(e=>el.addEventListener(e,resume,{passive:true}));
  raf=requestAnimationFrame(step);return()=>{cancelAnimationFrame(raf);clearTimeout(t)}},[]);
 const all=[{name:'LATEST',href:'/'},...cats.map(c=>({name:c.name.toUpperCase(),href:`/category/${c.slug}`}))];
 return <nav className="links" ref={ref} aria-label="Categories"><div className="track">{[0,1,2,3].map(i=><span className="grp" key={i} aria-hidden={i?'true':undefined}>
  {all.map(x=><a key={x.href} href={x.href} tabIndex={i?-1:undefined} className={'cl'+(path===x.href?' on':'')} aria-current={path===x.href?'page':undefined}>{x.name}</a>)}</span>)}</div></nav>}
