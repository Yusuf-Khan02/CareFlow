#!/usr/bin/env bash
# ==============================================================================
# CareFlow Automated Database & Storage Backup Script (Linux / macOS / Docker)
# ==============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="${SCRIPT_DIR}/.."
DB_PATH="${1:-${ROOT_DIR}/server/prisma/dev.db}"
STORAGE_PATH="${2:-${ROOT_DIR}/server/storage/private}"
BACKUP_DIR="${3:-${ROOT_DIR}/backups}"
RETENTION_DAYS=14
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

echo "=========================================================="
echo " CareFlow Automated Database & Storage Backup (${TIMESTAMP})"
echo "=========================================================="

# 1. Ensure backup directory exists
mkdir -p "${BACKUP_DIR}"

# 2. Database Backup
if [ -f "${DB_PATH}" ]; then
  TARGET_DB="${BACKUP_DIR}/careflow_db_${TIMESTAMP}.db"
  cp "${DB_PATH}" "${TARGET_DB}"

  # Generate SHA-256 Checksum
  if command -v sha256sum >/dev/null 2>&1; then
    sha256sum "${TARGET_DB}" > "${TARGET_DB}.sha256"
  elif command -v shasum >/dev/null 2>&1; then
    shasum -a 256 "${TARGET_DB}" > "${TARGET_DB}.sha256"
  fi

  echo "✓ [Database Backup]: ${TARGET_DB}"
  cat "${TARGET_DB}.sha256"
else
  echo "⚠️ [Warning]: Database file not found at ${DB_PATH}. Skipping."
fi

# 3. Private Storage Backup
if [ -d "${STORAGE_PATH}" ] && [ "$(ls -A "${STORAGE_PATH}")" ]; then
  TARGET_STORAGE="${BACKUP_DIR}/careflow_storage_${TIMESTAMP}.tar.gz"
  tar -czf "${TARGET_STORAGE}" -C "${STORAGE_PATH}" .

  if command -v sha256sum >/dev/null 2>&1; then
    sha256sum "${TARGET_STORAGE}" > "${TARGET_STORAGE}.sha256"
  elif command -v shasum >/dev/null 2>&1; then
    shasum -a 256 "${TARGET_STORAGE}" > "${TARGET_STORAGE}.sha256"
  fi

  echo "✓ [Storage Archive]: ${TARGET_STORAGE}"
fi

# 4. Retention Policy (Remove archives older than RETENTION_DAYS)
echo "Rotating backups older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -type f -name "careflow_*" -mtime "+${RETENTION_DAYS}" -exec rm -f {} + || true

echo "✓ Backup operation completed successfully."
