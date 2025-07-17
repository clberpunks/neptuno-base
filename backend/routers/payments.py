# backend/routers/payments.py
from datetime import datetime, timedelta
import json
from typing import List
from schemas.schemas import PaymentRecordOut
from fastapi import APIRouter, Depends, Request, HTTPException, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from db import get_db
from dependencies import get_current_user
from utils import create_stripe_session, verify_stripe_event
from utils import create_paypal_order, capture_paypal_order
from config import settings
from models.models import PaymentProvider, PaymentRecord, Subscription, User

router = APIRouter(tags=["payments"])


@router.post("/create-checkout-session")
def stripe_checkout(
        db: Session = Depends(get_db),
        current_jwt=Depends(get_current_user),
):
    user: User = db.query(User).filter_by(id=current_jwt.id).first()
    sub: Subscription = db.query(Subscription).filter_by(
        user_id=user.id).first()
    if not sub or sub.price <= 0:
        raise HTTPException(400, detail="Plan no requiere pago")

    success = f"{settings.FRONTEND_URL}/payments/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel = f"{settings.FRONTEND_URL}/payments/cancel"
    session = create_stripe_session(sub.price * 100, success, cancel,
                                    user.email)
    return {"url": session.url}


@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    payload = await request.body()
    sig = request.headers.get("stripe-signature", "")
    try:
        event = verify_stripe_event(payload, sig)
    except Exception as e:
        raise HTTPException(400, detail=f"Webhook error: {e}")

    # Solo actuamos si el checkout ha finalizado
    if event["type"] == "checkout.session.completed":
        sess = event["data"]["object"]
        customer_email = sess.get("customer_email")
        session_id = sess["id"]
        amount = sess["amount_total"]
        # buscamos usuario y subscripción
        user = db.query(User).filter_by(email=customer_email).first()
        sub = db.query(Subscription).filter_by(user_id=user.id).first()
        # 1) registramos pago
        record = PaymentRecord(user_id=user.id,
                               subscription_id=sub.id,
                               provider=PaymentProvider.stripe,
                               provider_charge_id=session_id,
                               amount=amount,
                               currency=sess.get("currency", "eur"),
                               status="completed")
        db.add(record)
        # 2) renovamos suscripción un año más
        sub.renews_at = (sub.renews_at
                         or datetime.utcnow()) + timedelta(days=365)
        db.commit()

    return JSONResponse({"status": "received"})


@router.post("/create-paypal-order")
def paypal_create(
        db: Session = Depends(get_db),
        current_jwt=Depends(get_current_user),
):
    user: User = db.query(User).filter_by(id=current_jwt.id).first()
    sub: Subscription = db.query(Subscription).filter_by(
        user_id=user.id).first()
    if not sub or sub.price <= 0:
        raise HTTPException(400, detail="Plan no requiere pago")

    return create_paypal_order(
        price=str(sub.price),
        return_url=f"{settings.FRONTEND_URL}/payments/success-paypal",
        cancel_url=f"{settings.FRONTEND_URL}/payments/cancel",
    )


@router.post("/capture-paypal-order")
def paypal_capture(
        data: dict,
        db: Session = Depends(get_db),
        current_jwt=Depends(get_current_user),
):
    order_id = data.get("orderID")
    if not order_id:
        raise HTTPException(400, detail="orderID requerido")

    result = capture_paypal_order(order_id)
    # si capture fue exitoso...
    if result.get("status") == "COMPLETED":
        # buscamos usuario y subscripción
        user: User = db.query(User).filter_by(id=current_jwt.id).first()
        sub: Subscription = db.query(Subscription).filter_by(
            user_id=user.id).first()
        # registramos pago
        record = PaymentRecord(user_id=user.id,
                               subscription_id=sub.id,
                               provider=PaymentProvider.paypal,
                               provider_charge_id=order_id,
                               amount=int(float(sub.price) * 100),
                               currency=result["purchase_units"][0]["payments"]
                               ["captures"][0]["amount"]["currency_code"],
                               status="completed")
        db.add(record)
        # renovamos subscripción
        sub.renews_at = (sub.renews_at
                         or datetime.utcnow()) + timedelta(days=365)
        db.commit()
    return result


@router.get("/records", response_model=List[PaymentRecordOut])
def list_payments(db: Session = Depends(get_db),
                  current=Depends(get_current_user)):

    records = (db.query(PaymentRecord).filter_by(user_id=current.id).order_by(
        PaymentRecord.created_at.desc()).all())
    # Devolvemos plano junto a cada registro
    return [
        {
            "id": r.id,
            "provider": r.provider,
            "provider_charge_id": r.provider_charge_id,
            "amount": r.amount,
            "currency": r.currency,
            "status": r.status,
            "created_at": r.created_at,
            "subscription_plan": r.subscription.plan  # directamente el plan
        } for r in records
    ]


@router.post("/dev/simulate")
def simulate_payment(
        data: dict,
        db: Session = Depends(get_db),
        current=Depends(get_current_user),
):
    """
    Solo en development: simula un webhook de Stripe o captura PayPal
    body: { provider: "stripe"|"paypal", charge_id: "...", amount: number }
    """
    if settings.NODE_ENV != "development":
        raise HTTPException(403, "Solo en development")
    provider = data.get("provider")
    charge_id = data.get("charge_id")
    amount = data.get("amount", 0)
    if provider not in ("stripe", "paypal"):
        raise HTTPException(400, "provider inválido")
    # crear registro ficticio
    sub = db.query(Subscription).filter_by(user_id=current.id).first()
    rec = PaymentRecord(user_id=current.id,
                        subscription_id=sub.id,
                        provider=PaymentProvider(provider),
                        provider_charge_id=charge_id,
                        amount=amount,
                        currency="EUR",
                        status="completed")
    db.add(rec)
    # renovar
    sub.renews_at = (sub.renews_at or datetime.utcnow()) + timedelta(days=365)
    db.commit()
    return {"ok": True}
