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
    ".join('|'),i=new Image;i.src='http://localhost:8000/detect/{t}.png?fp='+encodeURIComponent(f)"
    "+'&src='+encodeURIComponent(location.href);"
    "i.style.display='none';document.body.appendChild(i)}})})();"
    "<noscript><img src='http://localhost:8000/detect/{t}.png?noscript=1' style='display:none'/></noscript>"
)

@router.get("/embed/snippet.js", response_class=PlainTextResponse)
def get_tracking_snippet(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    tenant_id = current_user.id
    snippet = EMBED_TEMPLATE.replace("{t}", tenant_id)
    return snippet
