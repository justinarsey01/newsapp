const prod=process.env.NODE_ENV==='production';
const csp=["default-src 'self'","img-src 'self' data: blob: https:","style-src 'self' 'unsafe-inline'",`script-src 'self' 'unsafe-inline'${prod?'':" 'unsafe-eval'"}`,
 "connect-src 'self' https://*.supabase.co wss://*.supabase.co","font-src 'self' data:","frame-ancestors 'none'","base-uri 'self'","form-action 'self' https://accounts.google.com","object-src 'none'"].join('; ');
module.exports={transpilePackages:['@news/shared'],poweredByHeader:false,
 async headers(){return [{source:'/(.*)',headers:[{key:'Content-Security-Policy',value:csp},{key:'Strict-Transport-Security',value:'max-age=63072000; includeSubDomains; preload'},
 {key:'X-Content-Type-Options',value:'nosniff'},{key:'Cross-Origin-Opener-Policy',value:'same-origin-allow-popups'},{key:'X-Frame-Options',value:'DENY'},{key:'Referrer-Policy',value:'strict-origin-when-cross-origin'},
 {key:'Permissions-Policy',value:'camera=(), microphone=(), geolocation=()'}]}]}}
