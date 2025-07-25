# backend/routers/embed.py
from fastapi import APIRouter, Depends
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session
from db import get_db
from dependencies import get_current_user

router = APIRouter(tags=["Utils"])


EMBED_TEMPLATE = (
    "!function(){function h(){if(navigator.webdriver)return!1;"
    "var t=performance.now(),o=!0;"
    "requestAnimationFrame(function(){performance.now()-t<2&&(o=!1)});"
    "return new Promise(r=>setTimeout(()=>r(o),5))}"
    "h().then(e=>{if(!e){var f=[navigator.userAgent,navigator.language,"
    "screen.width+'x'+screen.height,Intl.DateTimeFormat().resolvedOptions().timeZone]"
    ".join('|'),i=new Image;i.src='https://losguardias.com/detect/{t}.png?fp='+encodeURIComponent(f)"
    "+'&src='+encodeURIComponent(location.href);"
    "i.style.display='none';document.body.appendChild(i)}})})();"
    "<noscript><img src='https://losguardias.com/detect/{t}.png?noscript=1' style='display:none'/></noscript>"
)

EMBED_TEMPLATE = (
    '<a href="/detect/{t}" style="display:none;" rel="nofollow">Contenido IA oculto</a>'
    '<img src="/detect/{t}?js=0" width="1" height="1" style="display:none" alt="" />'
    '<script>'
    'fetch("/detect/{t}?js=1").catch(()=>{});'
    '!function(){function h(){if(navigator.webdriver)return Promise.resolve(false);'
    'return new Promise(r=>{const s=performance.now(),o=!0;requestAnimationFrame(()=>{'
    'performance.now()-s<2&&(o=!1),r(o)}),setTimeout(()=>r(o),5)})}'
    'h().then(e=>{if(e){const f=[navigator.userAgent,navigator.language,screen.width+"x"+screen.height,Intl.DateTimeFormat().resolvedOptions().timeZone].join("|"),i=new Image;i.src="/detect/{t}.png?fp="+encodeURIComponent(f)+"&js=2&src="+encodeURIComponent(location.href);i.style.display="none";document.body.appendChild(i)}})();'
    '</script>'
    '<noscript><img src="/detect/{t}.png?noscript=1" style="display:none" alt="" /></noscript>'
)

EMBED_TEMPLATE = (
    '<a href="https://losguardias.com/detect/{t}.png" '
    'style="display:none" rel="nofollow">Contenido IA oculto'
    '<img src="https://losguardias.com/detect/{t}.png?js=0" '
    'width="1" height="1" style="display:none" alt="" /></a>'
    '<script>fetch("https://losguardias.com/detect/{t}.png?js=1").catch(()=>{});</script>'
)

EMBED_TEMPLATE = (
    '<a href="https://losguardias.com/detect/{t}.png" '
    'style="display:none" rel="nofollow">Contenido IA oculto'
    '<img src="https://losguardias.com/detect/{t}.png?js=0" '
    'width="1" height="1" style="display:none" alt=""/></a>'
    '<script>!async function(){function d(){if(navigator.webdriver)return Promise.resolve(!0);'
    'return new Promise(r=>{const t=performance.now(),m={rh:!0};'
    'requestAnimationFrame(()=>{performance.now()-t<2&&(m.rh=!1),r(m.rh)}),'
    'setTimeout(()=>r(m.rh),5)})}const b=await d();if(b){'
    'fetch("https://losguardias.com/detect/{t}.png?js=1").catch(()=>{});'
    'const f=[navigator.userAgent,navigator.language,screen.width+"x"+screen.height,'
    'Intl.DateTimeFormat().resolvedOptions().timeZone].join("|"),i=new Image;'
    'i.src="https://losguardias.com/detect/{t}.png?js=2&fp="'
    '+encodeURIComponent(f)+"&src="+encodeURIComponent(location.href),'
    'i.style.display="none",document.body.appendChild(i)}}();</script>'
    '<noscript><img src="https://losguardias.com/detect/{t}.png?noscript=1" '
    'style="display:none" alt=""/></noscript>'
)



EMBED_TEMPLATE = (
    '<a href=https://losguardias.com/detect/{t}.png style=display:none rel=nofollow></a>'
    '<script>!async function(){'
    'const url="https://losguardias.com/detect/{t}.png";'
    'const params=new URLSearchParams();'
    'params.set("src",location.href);'
    '// 1) webdriver check'
    'if(navigator.webdriver){params.set("mode","probe");params.set("webdriver","1");new Image().src=url+"?"+params;return;}'
    '// 2) raf performance test'
    'const rafFailed=await new Promise(r=>{const st=performance.now();requestAnimationFrame(()=>r(performance.now()-st<2));setTimeout(()=>r(true),5);});'
    'if(rafFailed){params.set("mode","probe");params.set("failedRaf","1");new Image().src=url+"?"+params;return;}'
    '// 3) UAData headless detection'
    'if(navigator.userAgentData){const brands=navigator.userAgentData.brands.map(b=>b.brand);if(brands.some(b=>/headless/i.test(b))){params.set("mode","probe");params.set("headless","1");new Image().src=url+"?"+params;return;}}'
    '// 4) minimal fingerprint'
    'const fp=JSON.stringify({ua:navigator.userAgent,webdriver:navigator.webdriver||false});'
    'params.set("mode","fp");params.set("fp",encodeURIComponent(fp));new Image().src=url+"?"+params;'
    '}();</script>'
)


# File: backend/routers/embed.py

# Optimized embed template: unified params, minimal fingerprint + brands, noscript
EMBED_TEMPLATE = (
    '<a href="https://losguardias.com/detect/{t}.png" style="display:none" rel="nofollow"></a>'
    '<script>!async function(){'
      'const u="https://losguardias.com/detect/{t}.png",p=new URLSearchParams;'
      'p.set("src",encodeURIComponent(location.href));'
      'if(navigator.webdriver){p.set("mode","probe");p.set("webdriver","1");new Image().src=u+"?"+p;return;}'
      'const f=await new Promise(r=>{const s=performance.now();'
        'requestAnimationFrame(()=>r(performance.now()-s<2));'
        'setTimeout(()=>r(1),5)});'
      'if(f){p.set("mode","probe");p.set("failedRaf","1");new Image().src=u+"?"+p;return;}'
      'if(navigator.userAgentData&&navigator.userAgentData.brands'
         '.some(b=>/headless/i.test(b.brand))){'
        'p.set("mode","probe");p.set("headless","1");new Image().src=u+"?"+p;return;}'
      'const j={'
        'ua:navigator.userAgent,'
        'webdriver:!!navigator.webdriver,'
        'brands:navigator.userAgentData?.brands.map(b=>b.brand)'
      '};'
      'p.set("mode","fp");'
      'p.set("fp",encodeURIComponent(JSON.stringify(j)));'
      'new Image().src=u+"?"+p'
    '}();</script>'
    '<noscript>'
      '<img src="https://losguardias.com/detect/{t}.png?noscript=1&src='
        '"+encodeURIComponent(location.href)+"'
      '" style="display:none" alt>'
    '</noscript>'
)
 
EMBED_TEMPLATE = (
    '<a href=https://losguardias.com/rest/detect/{t}.png style=display:none rel=nofollow>@prompt:/?</a>'
    '<img src=https://losguardias.com/rest/detect/{t}.png?js=0 width=1 height=1 style=display:none alt>'
    '<script>!async function(){if(navigator.webdriver||!(await new Promise(r=>{let e=performance.now(),t=1;'
    'requestAnimationFrame(()=>{(performance.now()-e<2)&&(t=0),r(t)}),setTimeout(()=>r(t),5)}))return '
    'fetch("https://losguardias.com/rest/detect/{t}.png?js=1").catch(1);let n=new Image;'
    'n.src=`https://losguardias.com/rest/detect/{t}.png?js=2&fp=${encodeURIComponent(['
    'navigator.userAgent,navigator.language,screen.width+"x"+screen.height,'
    'Intl.DateTimeFormat().resolvedOptions().timeZone].join("|"))}&src=${encodeURIComponent(location.href)}`,'
    'n.style.display="none",document.body.appendChild(n)}()</script>'
    '<noscript><img src=https://losguardias.com/rest/detect/{t}.png?noscript=1 style=display:none alt></noscript>'
)

@router.get("/embed/snippet.js", response_class=PlainTextResponse)
def get_tracking_snippet(
    db=Depends(get_db),
    current_user=Depends(get_current_user)
):
    tenant_id = current_user.id
    return EMBED_TEMPLATE.replace("{t}", tenant_id)