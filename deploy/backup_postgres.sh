#!/bin/bash
# ==============================================================================
# GARVIX Daily PostgreSQL Database Backup Script
# Automatically dumps database, compresses with gzip, and deletes old backups
# ==============================================================================

set -e

BACKUP_DIR="/var/backups/garvix_postgres"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DB_NAME="garvix_db"
DB_USER="garvix_user"
BACKUP_FILE="${BACKUP_DIR}/garvix_${TIMESTAMP}.sql.gz"
RETENTION_DAYS=14

# Ensure backup directory exists
mkdir -p "${BACKUP_DIR}"

echo "[$(date)] Starting GARVIX PostgreSQL backup..."

# Execute pg_dump and pipe through gzip
sudo -u postgres pg_dump -d "${DB_NAME}" | gzip > "${BACKUP_FILE}"

# Set permissions
chmod 600 "${BACKUP_FILE}"

echo "[$(date)] Backup completed: ${BACKUP_FILE} ($(du -h "${BACKUP_FILE}" | cut -f1))"

# Purge backups older than 14 days
echo "[$(date)] Purging backups older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -name "garvix_*.sql.gz" -type f -mtime +${RETENTION_DAYS} -delete

echo "[$(date)] Backup job finished successfully."
