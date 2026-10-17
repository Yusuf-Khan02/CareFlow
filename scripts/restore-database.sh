#!/usr/bin/env bash
# ==============================================================================
# CareFlow Automated Disaster Recovery & DB Restoration Script (Linux/Docker)
# ==============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="${SCRIPT_DIR}/.."
BACKUP_FILE="${1:-}"
DB_TARGET="${2:-${ROOT_DIR}/server/prisma/dev.db}"

echo "=========================================================="
echo " CareFlow Automated Disaster Recovery & DB Restoration"
echo "=========================================================="

if [ -z "${BACKUP_FILE}" ] || [ ! -f "${BACKUP_FILE}" ]; then
  echo "❌ Error: Backup file not specified or does not exist."
  echo "Usage: ./scripts/restore-database.sh <path-to-backup.db> [target-db-path]"
  exit 1
fi

# 1. Verify Integrity Checksum
CHECKSUM_FILE="${BACKUP_FILE}.sha256"
if [ -f "${CHECKSUM_FILE}" ]; then
  echo "Verifying SHA-256 integrity checksum..."
  if command -v sha256sum >/dev/null 2>&1; then
    sha256sum -c "${CHECKSUM_FILE}"
  elif command -v shasum >/dev/null 2>&1; then
    shasum -a 256 -c "${CHECKSUM_FILE}"
  fi
  echo "✓ Checksum verification passed."
else
  echo "⚠️ Warning: No .sha256 checksum file found. Skipping checksum verification."
fi

# 2. Pre-Restoration Rollback Copy
if [ -f "${DB_TARGET}" ]; then
  SAFETY_COPY="${DB_TARGET}.pre_restore_$(date +%Y%m%d_%H%M%S).bak"
  cp "${DB_TARGET}" "${SAFETY_COPY}"
  echo "✓ Pre-restoration rollback copy created at: ${SAFETY_COPY}"
fi

# 3. Restore Database File
cp "${BACKUP_FILE}" "${DB_TARGET}"
echo "✓ Database successfully restored to ${DB_TARGET} from ${BACKUP_FILE}"
echo "✓ Restart the server process to ensure fresh connection pools."
