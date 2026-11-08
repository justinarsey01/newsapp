import sanitizeHtml from 'sanitize-html';
export const clean=h=>sanitizeHtml(h||'',{
 allowedTags:['p','h2','h3','h4','strong','b','em','i','u','s','ul','ol','li','blockquote','a','img','br','hr','div','span'],
 allowedAttributes:{a:['href','target','rel'],img:['src','alt'],div:['class'],span:['style'],p:['style'],h2:['style'],h3:['style']},
 allowedClasses:{div:['pair']},allowedSchemes:['http','https','mailto'],allowedSchemesByTag:{img:['https']},
 allowedStyles:{'*':{color:[/^#[0-9a-f]{3,8}$/i,/^rgb\([\d\s,]+\)$/i],'text-align':[/^(left|center|right)$/]}},
 transformTags:{a:sanitizeHtml.simpleTransform('a',{rel:'noopener noreferrer nofollow',target:'_blank'})}});
