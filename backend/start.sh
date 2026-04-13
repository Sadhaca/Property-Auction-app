#!/bin/bash
set -e

echo "Starting AuctionProp Backend..."

# Wait for postgres to be ready (extract host:port from DATABASE_URL)
DB_HOST=$(echo "$DATABASE_URL" | sed -n 's|.*@\([^:/]*\).*|\1|p')
DB_PORT=$(echo "$DATABASE_URL" | sed -n 's|.*:\([0-9]*\)/.*|\1|p')
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}

echo "Waiting for PostgreSQL at ${DB_HOST}:${DB_PORT}..."
while ! python -c "import socket; s=socket.create_connection(('${DB_HOST}', ${DB_PORT}), timeout=2); s.close()" 2>/dev/null; do
    sleep 1
done
echo "PostgreSQL is ready!"

exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
