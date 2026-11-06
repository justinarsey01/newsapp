import './globals.css';import ThemeToggle from './ThemeToggle';
export const metadata={title:'The Daily',description:'Latest news'};
export default function L({children}){return <html lang="en"><body>
<nav><a href="/"><b>The Daily</b></a><span><a href="/admin">Admin</a> <ThemeToggle/></span></nav>{children}</body></html>}
