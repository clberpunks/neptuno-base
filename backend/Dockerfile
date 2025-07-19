# Backend Dockerfile
FROM python:3.11-slim

# Instalar dependencias de seguridad
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    libpq-dev \
    gcc \
    libssl-dev \
    ca-certificates && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Capas separadas para mejor caching
COPY requirements.txt .
RUN pip install --no-cache-dir -U pip && \
    pip install --no-cache-dir -r requirements.txt && \
    pip install gunicorn uvloop httptools

COPY . .

# Usuario no root
RUN groupadd -r ciberpunk && useradd -r -g ciberpunk ciberpunk && \
    chown -R ciberpunk:ciberpunk /app
USER ciberpunk

EXPOSE 8001

# Gunicorn para producción
#CMD ["sh", "-c", "alembic -c /app/alembic.ini upgrade head && gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8001 --timeout 120"]

# ultra optimizado para producción
CMD ["sh", "-c", "alembic -c /app/alembic.ini upgrade head && gunicorn main:app --workers $((2 * $(nproc) + 1)) --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8001 --timeout 120 --keep-alive 10"]