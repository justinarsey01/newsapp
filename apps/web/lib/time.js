export function ago(d){const s=(Date.now()-new Date(d))/1000;if(s<3600)return Math.max(1,Math.floor(s/60))+' MINUTES AGO';
 if(s<86400)return Math.floor(s/3600)+' HOURS AGO';if(s<604800)return Math.floor(s/86400)+' DAYS AGO';return new Date(d).toLocaleDateString()}
