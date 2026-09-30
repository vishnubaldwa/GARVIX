# GARVIX - Hostinger VPS Deployment Guide (Option A: PostgreSQL)

This guide walks you through deploying the complete **GARVIX** platform on a **Hostinger VPS** running **Ubuntu 22.04 or 24.04 LTS** with **Native PostgreSQL**, **PM2 Process Manager**, **Nginx Reverse Proxy**, and **Free Let's Encrypt SSL**.

---

## Architecture Overview

```
Client / Web (https://garvix.in)
           │
           ▼
     [ Nginx Proxy ] ── (Port 80/443 SSL via Certbot)
           │
           ▼
   [ PM2 Cluster Mode ] ── (Runs Next.js on Port 3000)
           │
           ▼
 [ PostgreSQL Database ] ── (localhost:5432 - garvix_db)
```

---

## Step 1: Connect to your Hostinger VPS via SSH

Open your Terminal / Command Prompt and run:
```bash
ssh root@YOUR_HOSTINGER_VPS_IP
```
*(Enter your VPS root password set in Hostinger hPanel)*

---

## Step 2: Run the Automated VPS Provisioner

Clone the repository or download the setup script:
```bash
# Clone the repository to /var/www/garvix
mkdir -p /var/www
cd /var/www
git clone https://github.com/vishnubaldwa/GARVIX.git garvix
cd /var/www/garvix

# Run the automated setup script
chmod +x deploy/setup_vps.sh deploy/backup_postgres.sh
sudo bash deploy/setup_vps.sh
```

**What this automated script does for you:**
1. Installs Node.js 20 LTS, NPM, and PM2 globally.
2. Installs and starts PostgreSQL and Nginx.
3. Creates the PostgreSQL database `garvix_db` and user `garvix_user` with a secure password.
4. Schedules daily automatic PostgreSQL database backups every night at 02:00 AM (keeps 14-day history in `/var/backups/garvix_postgres`).
5. Configures the UFW firewall to allow SSH (port 22), HTTP (port 80), and HTTPS (port 443).

---

## Step 3: Configure Environment Variables

Create your production `.env` file:
```bash
cp .env.production.example .env
nano .env
```

Ensure `DATABASE_URL` matches the password set during Step 2:
```env
DATABASE_URL="postgresql://garvix_user:YOUR_PASSWORD@localhost:5432/garvix_db?schema=public"
JWT_SECRET="generate-a-random-secure-string"
TELEGRAM_BOT_TOKEN="your_bot_token"
TELEGRAM_CHAT_ID="your_telegram_chat_id"
```
*(Press `Ctrl + O` then `Enter` to save, and `Ctrl + X` to exit nano)*

---

## Step 4: Initialize PostgreSQL Database & Seed Data

Switch Prisma to PostgreSQL and seed initial staff accounts, products, and dummy invoices:
```bash
# 1. Switch Prisma schema to PostgreSQL
npm run db:postgres

# 2. Push schema to PostgreSQL database
npx prisma db push

# 3. Seed initial users (admin@garvix.in), inventory & demo transactions
npm run seed
```

---

## Step 5: Build Next.js & Start with PM2

```bash
# 1. Build optimized Next.js production bundle
npm run build

# 2. Start using PM2 (runs in background with cluster mode)
pm2 start ecosystem.config.js

# 3. Save PM2 list & enable auto-start on server reboot
pm2 save
pm2 startup
```

---

## Step 6: Configure Nginx & Domain (`garvix.in`)

1. Ensure your domain's **DNS A-record** points to your Hostinger VPS IP:
   - `@` -> `YOUR_VPS_IP`
   - `www` -> `YOUR_VPS_IP`

2. Copy the Nginx configuration:
```bash
sudo cp deploy/nginx-garvix.conf /etc/nginx/sites-available/garvix.in
sudo ln -s /etc/nginx/sites-available/garvix.in /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

3. Issue Free Let's Encrypt SSL Certificate:
```bash
sudo certbot --nginx -d garvix.in -d www.garvix.in
```
Certbot will auto-renew SSL certificates every 90 days.

---

## Useful Maintenance Commands

| Task | Command |
| :--- | :--- |
| **Check App Status** | `pm2 status` |
| **View Live App Logs** | `pm2 logs garvix-web` |
| **Restart Application** | `pm2 restart garvix-web` |
| **Trigger Instant DB Backup** | `sudo /usr/local/bin/garvix_backup.sh` |
| **View Database Backups** | `ls -lh /var/backups/garvix_postgres` |
| **Pull Updates from GitHub** | `git pull origin main && npm run build && pm2 reload garvix-web` |
| **PostgreSQL Shell Access** | `sudo -u postgres psql -d garvix_db` |

---

Your GARVIX website and Admin ERP will now run 24/7 on `https://garvix.in`!
