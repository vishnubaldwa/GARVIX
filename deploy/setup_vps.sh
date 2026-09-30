#!/bin/bash
# ==============================================================================
# GARVIX Hostinger VPS Automated Setup Script (Ubuntu 22.04 / 24.04 LTS)
# Installs: Node.js 20 LTS, PostgreSQL, Nginx, Certbot, PM2, UFW Firewall
# Sets up: Database, Cron Auto-Backups, and Production Directory
# ==============================================================================

set -e

echo "=========================================================="
echo "  GARVIX Platform - Hostinger VPS Auto-Setup Provisioner"
echo "=========================================================="

if [ "$EUID" -ne 0 ]; then
  echo "❌ Please run as root (or use: sudo bash deploy/setup_vps.sh)"
  exit 1
fi

echo "🔹 Step 1: Updating System Repositories..."
apt-get update -y && apt-get upgrade -y
apt-get install -y curl wget git ufw htop build-essential

echo "🔹 Step 2: Installing Node.js 20 LTS..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
npm install -g pm2

echo "Node.js version: $(node -v)"
echo "NPM version: $(npm -v)"
echo "PM2 version: $(pm2 -v)"

echo "🔹 Step 3: Installing PostgreSQL & Nginx..."
apt-get install -y postgresql postgresql-contrib nginx certbot python3-certbot-nginx
systemctl enable postgresql
systemctl start postgresql
systemctl enable nginx
systemctl start nginx

echo "🔹 Step 4: Configuring PostgreSQL Database & User..."
DB_NAME="garvix_db"
DB_USER="garvix_user"

# Prompt for database password or generate one
read -p "Enter secure password for database user '$DB_USER' [or press Enter to auto-generate]: " DB_PASS
if [ -z "$DB_PASS" ]; then
  DB_PASS=$(openssl rand -base64 16 | tr -dc 'a-zA-Z0-9' | head -c 16)
  echo "Generated Database Password: $DB_PASS"
fi

# Create DB and user if not already present
sudo -u postgres psql -c "DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '$DB_USER') THEN
    CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASS';
  ELSE
    ALTER USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASS';
  END IF;
END
\$\$;"

sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || \
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"

sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
sudo -u postgres psql -d $DB_NAME -c "GRANT ALL ON SCHEMA public TO $DB_USER;"

echo "✅ PostgreSQL database '$DB_NAME' created with owner '$DB_USER'."

echo "🔹 Step 5: Setting up Automated Nightly DB Backups..."
BACKUP_DIR="/var/backups/garvix_postgres"
mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"

if [ -f "deploy/backup_postgres.sh" ]; then
  cp deploy/backup_postgres.sh /usr/local/bin/garvix_backup.sh
  chmod +x /usr/local/bin/garvix_backup.sh

  # Add to root crontab (Run daily at 02:00 AM)
  (crontab -l 2>/dev/null | grep -v "garvix_backup.sh" ; echo "0 2 * * * /usr/local/bin/garvix_backup.sh >> /var/log/garvix_backup.log 2>&1") | crontab -
  echo "✅ Nightly auto-backup scheduled at 02:00 AM in crontab."
fi

echo "🔹 Step 6: Configuring Firewall (UFW)..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

echo "=========================================================="
echo "🎉 VPS Provisioning Completed Successfully!"
echo "=========================================================="
echo ""
echo "Save this PostgreSQL connection string for your .env:"
echo "----------------------------------------------------------"
echo "DATABASE_URL=\"postgresql://$DB_USER:$DB_PASS@localhost:5432/$DB_NAME?schema=public\""
echo "----------------------------------------------------------"
echo ""
echo "Next Steps to launch GARVIX:"
echo "1. Clone or navigate to your app directory: /var/www/garvix"
echo "2. Copy .env with above DATABASE_URL"
echo "3. Run: npm run db:postgres"
echo "4. Run: npx prisma db push && npm run seed"
echo "5. Run: npm run build"
echo "6. Run: pm2 start ecosystem.config.js && pm2 save && pm2 startup"
echo "7. Copy deploy/nginx-garvix.conf to /etc/nginx/sites-available/garvix.in"
echo "8. Run: sudo ln -s /etc/nginx/sites-available/garvix.in /etc/nginx/sites-enabled/"
echo "9. Run: sudo certbot --nginx -d garvix.in -d www.garvix.in"
echo "=========================================================="
