# NetSage AI Unified Multi-Stage Dockerfile
# Stage 1: Build Frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend ./
ENV NEXT_PUBLIC_API_URL=/api
RUN npm run build

# Stage 2: Python Backend Runtime
FROM python:3.11-slim
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ ./backend/
COPY cases.csv ./cases.csv
COPY rule_checker.py ./rule_checker.py

ENV PORT=8000
EXPOSE 8000

CMD ["python", "-m", "uvicorn", "backend.run:app", "--host", "0.0.0.0", "--port", "8000"]
