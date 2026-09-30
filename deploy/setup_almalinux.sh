#!/bin/bash
# ==============================================================================
# GARVIX AlmaLinux / RHEL / CentOS 9 & 10 Automated Setup Script
# Installs: Node.js 20 LTS, PostgreSQL, Nginx, Certbot, PM2, Firewalld
# Configures: SELinux, PostgreSQL Database, Nightly Backup Cron
# ==============================================================================

set -e

echo "=========================================================="
echo "  GARVIX Platform - AlmaLinux 10 VPS Auto-Provisioner"
echo "=========================================================="

if [ "$EUID" -ne 0 ]; then
  echo "❌ Please run as root"
  exit 1
fi

echo "🔹 Step 1: Updating System Packages & Installing Prerequisites..."
dnf update -y
dnf install -y git curl wget tar bzip2 policycoreutils-python-utils firewalld

echo "🔹 Step 2: Installing Node.js 20 LTS..."
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
dnf install -y nodejs
npm install -g pm2

echo "Node.js version: $(node -v)"
echo "NPM version: $(npm -v)"
echo "PM2 version: $(pm2 -v)"

echo "🔹 Step 3: Installing PostgreSQL & Nginx..."
dnf install -y postgresql-server postgresql-contrib nginx certbot python3-certbot-nginx

# Initialize PostgreSQL database if not already initialized
if [ ! -f /var/lib/pgsql/data/PG_VERSION ]; then
  echo "Initializing PostgreSQL Database..."
  postgresql-setup --initdb
fi

# Enable md5 / scram-sha-256 authentication in pg_hba.conf for local connections
if [ -f /var/lib/pgsql/data/pg_hba.conf ]; then
  sed -i 's/host    all             all             127.0.0.1\/32            ident/host    all             all             127.0.0.1\/32            scram-sha-256/' /var/lib/pgsql/data/pg_hba.conf
  sed -i 's/host    all             all             ::1\/128                 ident/host    all             all             ::1\/128                 scram-sha-256/' /var/lib/pgsql/data/pg_hba.conf
fi

systemctl enable postgresql
systemctl restart postgresql
systemctl enable nginx
systemctl start nginx

echo "🔹 Step 4: Configuring PostgreSQL Database & User..."
DB_NAME="garvix_db"
DB_USER="garvix_user"

read -p "Enter secure password for database user '$DB_USER' [or press Enter to auto-generate]: " DB_PASS
if [ -z "$DB_PASS" ]; then
  DB_PASS=$(openssl rand -base64 16 | tr -dc 'a-zA-Z0-9' | head -c 16)
  echo "Generated Database Password: $DB_PASS"
fi

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

echo "🔹 Step 5: Configuring SELinux for Reverse Proxy..."
# Allow Nginx to proxy traffic to internal port 3000
setsebool -P httpd_can_network_connect 1

echo "🔹 Step 6: Configuring Firewalld (HTTP & HTTPS)..."
systemctl enable firewalld
systemctl start firewalld
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --reload

echo "🔹 Step 7: Setting up Automated Nightly DB Backups..."
BACKUP_DIR="/var/backups/garvix_postgres"
mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"

if [ -f "deploy/backup_postgres.sh" ]; then
  cp deploy/backup_postgres.sh /usr/local/bin/garvix_backup.sh
  chmod +x /usr/local/bin/garvix_backup.sh

  (crontab -l 2>/dev/null | grep -v "garvix_backup.sh" ; echo "0 2 * * * /usr/local/bin/garvix_backup.sh >> /var/log/garvix_backup.log 2>&1") | crontab -
  echo "✅ Nightly auto-backup scheduled at 02:00 AM."
fi

echo "=========================================================="
echo "🎉 AlmaLinux VPS Provisioning Completed Successfully!"
echo "=========================================================="
echo ""
echo "Save this PostgreSQL connection string for your .env:"
echo "----------------------------------------------------------"
echo "DATABASE_URL=\"postgresql://$DB_USER:$DB_PASS@127.0.0.1:5432/$DB_NAME?schema=public\""
echo "----------------------------------------------------------"
echo ""
