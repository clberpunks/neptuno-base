# Backend Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Instalar dependencias del sistema para psycopg2
RUN apt-get update && \
    apt-get install -y libpq-dev gcc && \
    rm -rf /var/lib/apt/lists/*

# Copiar dependencias
COPY requirements.txt .

# Instalar dependencias
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código fuente (excluyendo lo que ya está montado por volumen)
COPY . .

# Exponer puerto
EXPOSE 8001

# No necesitamos CMD aquí porque lo definimos en docker-compose
# Comando de arranque
# CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]


