from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from dependencies import get_current_user
from db import get_db
from models.models import FirewallRule
from pydantic import BaseModel, HttpUrl
import uuid

router = APIRouter(prefix="/firewall", tags=["firewall"])

class RuleIn(BaseModel):
    llm_name: str
    pattern: str
    policy: str
    limit: int | None = None
    redirect_url: HttpUrl | None = None

DEFAULT_RULES = [
    {"llm_name": "GPTBot", "pattern": "GPTBot", "policy": "block"},
    {"llm_name": "ClaudeAI", "pattern": "ClaudeAI", "policy": "restricted", "limit": 5},
    {"llm_name": "MaliciousLLM", "pattern": "MaliciousLLM", "policy": "restricted", "limit": 2},
    {"llm_name": "Perplexity", "pattern": "Perplexity", "policy": "block"},
    {"llm_name": "Googlebot", "pattern": "Googlebot", "policy": "block"},
    {"llm_name": "Bingbot", "pattern": "Bingbot", "policy": "block"},
    {"llm_name": "AnthropicAI", "pattern": "AnthropicAI", "policy": "block"},
]

@router.get("/")
def list_rules(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.query(FirewallRule).filter(FirewallRule.tenant_id == current_user.id).all()

    if not rows:
        now = datetime.utcnow()
        for rule in DEFAULT_RULES:
            db.add(FirewallRule(
                id=str(uuid.uuid4()),
                tenant_id=current_user.id,
                llm_name=rule["llm_name"],
                pattern=rule["pattern"],
                policy=rule["policy"],
                limit=rule.get("limit"),
                redirect_url=None,
                created_at=now
            ))
        db.commit()
        rows = db.query(FirewallRule).filter(FirewallRule.tenant_id == current_user.id).all()

    return rows

@router.put("/")
def update_rules(rules: list[RuleIn], current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    db.query(FirewallRule).filter(FirewallRule.tenant_id==current_user.id).delete()
    for r in rules:
        db.add(FirewallRule(
            id=str(uuid.uuid4()),
            tenant_id=current_user.id,
            llm_name=r.llm_name,
            pattern=r.pattern,
            policy=r.policy,
            limit=r.limit,
            redirect_url=str(r.redirect_url) if r.redirect_url else None
        ))
    db.commit()
    return {"ok": True}
