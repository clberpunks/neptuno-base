# Backend Dockerfile

FROM python:3.11-slim

WORKDIR /app

# Copiar dependencias
COPY requirements.txt .

# Instalar dependencias
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código fuente
COPY . .

# Exponer puerto
EXPOSE 8001

# Comando de arranque
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]


