import './globals.css';import ThemeToggle from './ThemeToggle';
export const metadata={title:'The Daily',description:'Latest news',icons:{apple:'/icon-192.png'}};
export const viewport={themeColor:'#0a7a3d'};
export default function L({children}){return <html lang="en"><body><PwaRegister/>
<nav><a href="/"><b>The Daily</b></a><span><a href="/admin">Admin</a> <ThemeToggle/></span></nav>{children}</body></html>}
