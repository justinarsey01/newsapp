'use client';
import {useEffect,useState} from 'react';
export default function InstallBanner(){
 const [ev,setEv]=useState(null),[ios,setIos]=useState(false),[hide,setHide]=useState(true);
 useEffect(()=>{if(localStorage.installDismissed||matchMedia('(display-mode: standalone)').matches||navigator.standalone)return;
  if(/iphone|ipad|ipod/i.test(navigator.userAgent)){setIos(true);setHide(false)}
  const h=e=>{e.preventDefault();setEv(e);setHide(false)},d=()=>setHide(true);
  window.addEventListener('beforeinstallprompt',h);window.addEventListener('appinstalled',d);
  return()=>{window.removeEventListener('beforeinstallprompt',h);window.removeEventListener('appinstalled',d)}},[]);
 if(hide)return null;
 return <div className="install" role="dialog" aria-label="Install app"><div><b>Install The Daily</b><span>{ios?'Tap Share, then Add to Home Screen.':'Read faster, even offline.'}</span></div>
  {ev&&<button className="p" onClick={async()=>{ev.prompt();await ev.userChoice;setHide(true)}}>Install</button>}
  <button onClick={()=>{localStorage.installDismissed='1';setHide(true)}} aria-label="Dismiss">✕</button></div>}
