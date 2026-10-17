# CareFlow — Production Deployment & Operations Guide

This guide provides end-to-end instructions for deploying, orchestrating, and maintaining the **CareFlow Smart Hospital Operations Platform** in local, containerized, and production cloud environments.

---

## 🏗️ 1. Architecture Overview

CareFlow uses a containerized multi-tier service architecture designed for zero-bleed multi-tenancy, real-time WebSocket communication, and background job reliability.

```
                          Internet / Clients
                                  │
                                  ▼
                  ┌───────────────────────────────┐
                  │      Reverse Proxy / SSL       │
                  │  (Nginx / Cloudflare / HTTPS)  │
                  └───────────────┬───────────────┘
                                  │
                  ┌───────────────┴───────────────┐
                  │                               │
                  ▼                               ▼
       ┌──────────────────────┐        ┌──────────────────────┐
       │   Frontend Client    │        │     Backend API      │
       │   (Nginx / Port 80)  │        │ (Node.js / Port 5000)│
       │   React 19 + Vite    │        │ Express + Socket.IO  │
       └──────────────────────┘        └──────────┬───────────┘
                                                  │
                                  ┌───────────────┴───────────────┐
                                  │                               │
                                  ▼                               ▼
                       ┌──────────────────────┐        ┌──────────────────────┐
                       │   Prisma ORM (SQL)   │        │     Redis Server     │
                       │ SQLite / PostgreSQL  │        │ BullMQ Job Queue/DLQ │
                       └──────────────────────┘        └──────────────────────┘
```

| Service | Technology | Port | Container Name | Purpose |
|---------|-----------|------|----------------|---------|
| **Frontend** | React 19, TypeScript, Nginx Alpine | `80` (mapped `5173`) | `careflow-frontend` | Static SPA assets, Gzip, reverse proxy to API |
| **Backend** | Node 20, Express, Socket.IO, Prisma | `5000` | `careflow-server` | REST API, WebSocket broadcasts, auth, business logic |
| **Redis** | Redis 7 Alpine | `6379` | `careflow-redis` | Background job queues (BullMQ), DLQ, cache |
| **Database** | SQLite (dev/standalone) or PostgreSQL 16 | `5432` | `careflow-postgres` | Relational SQL schema, multi-tenant records |

---

## 🐳 2. Quickstart with Docker Compose

### Prerequisites
- Docker Engine 24.0+
- Docker Compose v2.20+

### Step-by-Step Launch
1. **Clone the repository:**
   ```bash
   git clone https://github.com/Yusuf-Khan02/CareFlow.git
   cd CareFlow
   ```

2. **Launch all services:**
   ```bash
   docker compose up --build -d
   ```

3. **Verify running containers:**
   ```bash
   docker compose ps
   ```

4. **Access the application:**
   - **Frontend UI:** [http://localhost](http://localhost) (or [http://localhost:5173](http://localhost:5173))
   - **Backend API & Health:** [http://localhost:5000/api/v1/health](http://localhost:5000/api/v1/health)
   - **API Documentation:** [http://localhost:5000/api-docs](http://localhost:5000/api-docs)

5. **Run the Automated Smoke Test:**
   ```bash
   npm run test:smoke
   ```

6. **Stop services:**
   ```bash
   docker compose down
   # To stop and remove persistent volumes:
   docker compose down -v
   ```

---

## 🔐 3. Environment Variables Reference

Configure environment secrets in `server/.env` or in your hosting provider's secret manager:

| Variable | Description | Default | Production Requirement |
|----------|-------------|---------|------------------------|
| `PORT` | API server listen port | `5000` | Typically set automatically by PaaS (e.g., `10000`) |
| `NODE_ENV` | Application runtime environment | `development` | Set to `production` |
| `DATABASE_URL` | Relational database connection string | `file:/app/prisma/dev.db` | PostgreSQL URI in enterprise deployments |
| `CORS_ORIGIN` | Allowed web origins (comma-separated) | `http://localhost:5173` | Set to your live production domain |
| `JWT_SECRET` | Secret key for signing access tokens | *demo_secret* | **Must be 64+ random characters** |
| `JWT_EXPIRES_IN` | Access token lifespan | `24h` | e.g., `15m` to `24h` |
| `JWT_REFRESH_SECRET` | Secret key for refresh tokens | *demo_refresh* | **Must be 64+ random characters** |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token lifespan | `7d` | `7d` |
| `REDIS_URL` | Redis connection URI | `redis://redis:6379` | `rediss://...` with TLS in cloud |
| `AUTO_SEED` | Seed synthetic clinical data on boot | `true` | Set to `false` after initial deployment |

---

## ☁️ 4. Cloud Deployment Options

### Option A: Render.com (Automated Blueprint)
The repository includes a ready-to-deploy [`render.yaml`](../render.yaml) blueprint:
1. Fork or push this repository to GitHub.
2. Sign in to [Render.com](https://render.com) and click **New > Blueprint**.
3. Select your CareFlow repository. Render will automatically configure:
   - `careflow-api`: Web service running Node.js with healthcheck `/api/v1/health`.
   - `careflow-web`: Static site with SPA routing rewrite to `/index.html`.
4. Click **Apply**. Deployment will complete in ~3 minutes.

### Option B: Railway.app
The repository includes [`railway.json`](../railway.json):
1. Sign in to [Railway.app](https://railway.app) and create a **New Project**.
2. Select **Deploy from GitHub repo** and select `CareFlow`.
3. Add a **Redis** service from Railway's template marketplace.
4. Set `REDIS_URL` and `JWT_SECRET` in service variables.
5. Railway deploys the service with automatic health checks.

### Option C: Linux VPS (Ubuntu / Debian / AWS EC2)
For dedicated deployment on AWS EC2, DigitalOcean Droplet, or Linode:

```bash
# 1. Update OS and install Docker
sudo apt update && sudo apt install -y docker.io docker-compose-v2 git

# 2. Clone repository
git clone https://github.com/Yusuf-Khan02/CareFlow.git /opt/careflow
cd /opt/careflow

# 3. Create production environment secrets
cat <<EOF > server/.env
NODE_ENV=production
PORT=5000
DATABASE_URL=file:/app/prisma/dev.db
REDIS_URL=redis://redis:6379
CORS_ORIGIN=https://careflow.yourhospital.org
JWT_SECRET=$(openssl rand -hex 32)
JWT_REFRESH_SECRET=$(openssl rand -hex 32)
AUTO_SEED=true
EOF

# 4. Launch with Docker Compose
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

---

## 🔒 5. HTTPS & SSL Configuration

To secure the deployment with free Let's Encrypt certificates using Certbot:

```bash
# Install Certbot and Nginx plugin
sudo apt install -y certbot python3-certbot-nginx

# Request certificate
sudo certbot --nginx -d careflow.yourhospital.org

# Set up automated renewal cron
echo "0 3 * * * root certbot renew --quiet" | sudo tee -a /etc/crontab
```

---

## 💾 6. Automated Backup & Disaster Recovery

CareFlow includes automated backup and verification scripts supporting **SHA-256 cryptographic checksum verification** for compliance audit trails.

### Creating a Timestamped Backup
* **Linux / Docker:**
  ```bash
  chmod +x scripts/backup-database.sh
  ./scripts/backup-database.sh
  ```
* **Windows (PowerShell):**
  ```powershell
  npm run db:backup
  # Or directly:
  powershell -ExecutionPolicy Bypass -File scripts\backup-database.ps1
  ```

Backups are saved to `backups/careflow_db_YYYYMMDD_HHMMSS.db` alongside an immutable `*.sha256` hash file.

### Restoring from Backup
* **Linux / Docker:**
  ```bash
  chmod +x scripts/restore-database.sh
  ./scripts/restore-database.sh backups/careflow_db_20261018_050005.db
  ```
* **Windows (PowerShell):**
  ```powershell
  powershell -ExecutionPolicy Bypass -File scripts\restore-database.ps1 -BackupFile "backups\careflow_db_20261018_050005.db"
  ```
The restoration script automatically validates the SHA-256 integrity hash before applying changes and creates a rollback safety copy of the current active database.

---

## 🩺 7. Health Checks & Monitoring

CareFlow exposes a comprehensive health endpoint at `/api/v1/health` providing:
- Uptime duration in seconds
- Active database connection status & SQL ping latency in milliseconds
- Real-time Redis / BullMQ connection status
- System platform, memory usage, and Node.js version

### Monitoring Probe Example
```bash
curl -s http://localhost:5000/api/v1/health | jq .
```
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "uptimeSeconds": 3600,
    "database": {
      "status": "connected",
      "provider": "SQL (Prisma ORM)",
      "latencyMs": 2
    }
  }
}
```
