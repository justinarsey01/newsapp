'use client';
import {useEffect,useState} from 'react';
export default function ThemeToggle(){const [t,setT]=useState('light');
useEffect(()=>{const s=localStorage.theme||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');setT(s);document.documentElement.dataset.theme=s},[]);
return <button className="circle" aria-label="Toggle dark mode" onClick={()=>{const n=t==='dark'?'light':'dark';setT(n);localStorage.theme=n;document.documentElement.dataset.theme=n}}>{t==='dark'?'☀':'☾'}</button>}
