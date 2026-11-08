export async function shrink(f,max=1600){
 if(!f.type.startsWith('image/')||f.type==='image/gif'||f.type==='image/svg+xml')return f;
 try{const b=await createImageBitmap(f),s=Math.min(1,max/Math.max(b.width,b.height)),c=document.createElement('canvas');
  c.width=Math.round(b.width*s);c.height=Math.round(b.height*s);c.getContext('2d').drawImage(b,0,0,c.width,c.height);
  const blob=await new Promise(r=>c.toBlob(r,'image/webp',0.82));
  return blob&&blob.size<f.size?new File([blob],f.name.replace(/\.[^.]+$/,'')+'.webp',{type:'image/webp'}):f}catch(_){return f}}
