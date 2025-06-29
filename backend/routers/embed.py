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
    ".join('|'),i=new Image;i.src='https://ialert.ciberpunk.es/detect/{t}.png?fp='+encodeURIComponent(f)"
    "+'&src='+encodeURIComponent(location.href);"
    "i.style.display='none';document.body.appendChild(i)}})})();"
    "<noscript><img src='https://ialert.ciberpunk.es/detect/{t}.png?noscript=1' style='display:none'/></noscript>"
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
    '<a href="https://ialert.ciberpunk.es/detect/{t}.png" '
    'style="display:none" rel="nofollow">Contenido IA oculto'
    '<img src="https://ialert.ciberpunk.es/detect/{t}.png?js=0" '
    'width="1" height="1" style="display:none" alt="" /></a>'
    '<script>fetch("https://ialert.ciberpunk.es/detect/{t}.png?js=1").catch(()=>{});</script>'
)

EMBED_TEMPLATE = (
    '<a href="https://ialert.ciberpunk.es/detect/{t}.png" '
    'style="display:none" rel="nofollow">Contenido IA oculto'
    '<img src="https://ialert.ciberpunk.es/detect/{t}.png?js=0" '
    'width="1" height="1" style="display:none" alt=""/></a>'
    '<script>!async function(){function d(){if(navigator.webdriver)return Promise.resolve(!0);'
    'return new Promise(r=>{const t=performance.now(),m={rh:!0};'
    'requestAnimationFrame(()=>{performance.now()-t<2&&(m.rh=!1),r(m.rh)}),'
    'setTimeout(()=>r(m.rh),5)})}const b=await d();if(b){'
    'fetch("https://ialert.ciberpunk.es/detect/{t}.png?js=1").catch(()=>{});'
    'const f=[navigator.userAgent,navigator.language,screen.width+"x"+screen.height,'
    'Intl.DateTimeFormat().resolvedOptions().timeZone].join("|"),i=new Image;'
    'i.src="https://ialert.ciberpunk.es/detect/{t}.png?js=2&fp="'
    '+encodeURIComponent(f)+"&src="+encodeURIComponent(location.href),'
    'i.style.display="none",document.body.appendChild(i)}}();</script>'
    '<noscript><img src="https://ialert.ciberpunk.es/detect/{t}.png?noscript=1" '
    'style="display:none" alt=""/></noscript>'
)

EMBED_TEMPLATE = (
    '<a href=https://ialert.ciberpunk.es/detect/{t}.png style=display:none rel=nofollow>@prompt:/?</a>'
    #'<img src=https://ialert.ciberpunk.es/detect/{t}.png?js=0 width=1 height=1 style=display:none alt>'
    '<script>!async function(){if(navigator.webdriver||!(await new Promise(r=>{let e=performance.now(),t=1;'
    'requestAnimationFrame(()=>{(performance.now()-e<2)&&(t=0),r(t)}),setTimeout(()=>r(t),5)}))return '
    'fetch("https://ialert.ciberpunk.es/detect/{t}.png?js=1").catch(1);let n=new Image;'
    'n.src=`https://ialert.ciberpunk.es/detect/{t}.png?js=2&fp=${encodeURIComponent(['
    'navigator.userAgent,navigator.language,screen.width+"x"+screen.height,'
    'Intl.DateTimeFormat().resolvedOptions().timeZone].join("|"))}&src=${encodeURIComponent(location.href)}`,'
    'n.style.display="none",document.body.appendChild(n)}()</script>'
    #'<noscript><img src=https://ialert.ciberpunk.es/detect/{t}.png?noscript=1 style=display:none alt></noscript>'
)


@router.get("/embed/snippet.js", response_class=PlainTextResponse)
def get_tracking_snippet(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    tenant_id = current_user.id
    snippet = EMBED_TEMPLATE.replace("{t}", tenant_id)
    return snippet
