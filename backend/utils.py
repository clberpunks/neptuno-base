# backend/utils.py
from passlib.context import CryptContext
import jwt
import json
from fastapi.responses import RedirectResponse, JSONResponse
from config import settings
from datetime import datetime, timedelta

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def set_auth_cookies(response, user):
    access_token = create_access_token(user)
    refresh_token = create_refresh_token(user)

    response.set_cookie(
        "jwt_token",
        access_token,
        httponly=True,
        samesite="none",
        secure=True,  # solo para dev
        max_age=60  # duración igual al token
    )
    response.set_cookie(
        "refresh_token",
        refresh_token,
        httponly=True,
        samesite="none",
        secure=True,  # solo para dev
        max_age=60 * 60 * 24 * 7  # refresh válido 7 días
    )


# UTILIDADES DE TOKENS


def create_access_token(user):
    payload = {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "picture": user.picture or
        f"https://ui-avatars.com/api/?name={'+'.join(user.name.split())}&size=96&background=random&format=png",
        "role": user.role.value,
        "created_at": user.created_at.isoformat(),
        "last_login": user.last_login.isoformat(),
        "exp": datetime.utcnow() + timedelta(minutes=30),
    }
    return jwt.encode(payload, settings.CLIENT_SECRET, algorithm="HS256")


def create_refresh_token(user):
    payload = {
        "sub": user.id,
        "exp": datetime.utcnow() + timedelta(days=7),
        "iat": datetime.utcnow(),
    }
    return jwt.encode(payload, settings.REFRESH_SECRET, algorithm="HS256")


def generate_tokens(user):
    access_token = create_access_token(user)
    refresh_token = create_refresh_token(user)
    return access_token, refresh_token


# stripe
# backend/utils/stripe.py
import stripe
from config import settings

stripe.api_key = settings.STRIPE_SECRET_KEY  # añade esta variable en tu .env


def create_stripe_session(price_cents: int,
                          success_url: str,
                          cancel_url: str,
                          customer_email: str = None):
    """
    Crea una sesión de Stripe Checkout. 
    El nombre del producto debe ser ASCII puro para evitar errores de encabezado.
    """
    product_name = "Suscripcion"  # ASCII puro
    return stripe.checkout.Session.create(
        payment_method_types=["card"],
        line_items=[{
            "price_data": {
                "currency": "eur",
                "product_data": {
                    "name": product_name
                },
                "unit_amount": price_cents,
            },
            "quantity": 1,
        }],
        mode="payment",
        success_url=success_url,
        cancel_url=cancel_url,
        customer_email=customer_email,
    )


def verify_stripe_event(payload: bytes, sig_header: str):
    """
    Verifica la firma del webhook de Stripe.
    Añade tu STRIPE_WEBHOOK_SECRET en el .env.
    """
    return stripe.Webhook.construct_event(payload, sig_header,
                                          settings.STRIPE_WEBHOOK_SECRET)


# PayPal
import os, requests
from config import settings

API_BASE = "https://api-m.sandbox.paypal.com" if settings.NODE_ENV == "development" else "https://api-m.paypal.com"


def get_paypal_token():
    r = requests.post(f"{API_BASE}/v1/oauth2/token",
                      auth=(settings.PAYPAL_CLIENT_ID, settings.PAYPAL_SECRET),
                      data={"grant_type": "client_credentials"})
    r.raise_for_status()
    return r.json()["access_token"]


def create_paypal_order(price: str, return_url: str, cancel_url: str):
    token = get_paypal_token()
    r = requests.post(f"{API_BASE}/v2/checkout/orders",
                      json={
                          "intent":
                          "CAPTURE",
                          "purchase_units": [{
                              "amount": {
                                  "currency_code": "EUR",
                                  "value": price
                              }
                          }],
                          "application_context": {
                              "return_url": return_url,
                              "cancel_url": cancel_url
                          }
                      },
                      headers={"Authorization": f"Bearer {token}"})
    r.raise_for_status()
    return r.json()


def capture_paypal_order(order_id: str):
    token = get_paypal_token()
    r = requests.post(f"{API_BASE}/v2/checkout/orders/{order_id}/capture",
                      headers={"Authorization": f"Bearer {token}"})
    r.raise_for_status()
    return r.json()


# backend/utils/email.py
import smtplib
from email.mime.text import MIMEText
from config import settings


def send_email(to: str, subject: str, html: str):
    msg = MIMEText(html, "html")
    msg["Subject"] = subject
    msg["From"] = settings.MAIL_FROM
    msg["To"] = to

    with smtplib.SMTP(settings.MAIL_SERVER, settings.MAIL_PORT) as server:
        server.ehlo()
        server.starttls()
        server.login(settings.MAIL_USERNAME, settings.MAIL_PASSWORD)
        server.send_message(msg)
