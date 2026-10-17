#!/bin/sh
set -e

echo "🚀 [CareFlow] Initializing Backend Container..."

# Ensure storage directories exist
mkdir -p /app/storage/private
mkdir -p /app/prisma

# Sync database schema with Prisma
echo "📦 [CareFlow] Applying database migrations/schema..."
npx prisma db push --skip-generate

# Seed initial synthetic clinical dataset if flag or non-existent
if [ "$AUTO_SEED" != "false" ]; then
  echo "🌱 [CareFlow] Checking and seeding synthetic clinical dataset..."
  npx tsx prisma/seed.ts || echo "⚠️ [CareFlow] Seed completed or already initialized."
fi

echo "🏥 [CareFlow] Starting CareFlow Express API Server..."
exec "$@"
