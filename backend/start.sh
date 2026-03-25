#!/bin/bash
set -e

echo "Starting AuctionProp Backend..."

# Wait for postgres to be ready
echo "Waiting for PostgreSQL..."
while ! python -c "
import asyncio, asyncpg
async def check():
    try:
        conn = await asyncpg.connect('${DATABASE_URL}'.replace('+asyncpg', '').replace('postgresql', 'postgresql'))
        await conn.close()
        return True
    except:
        return False
print(asyncio.run(check()))
" 2>/dev/null | grep -q "True"; do
    sleep 1
done
echo "PostgreSQL is ready!"

# Start the application (tables are created and seeded in the lifespan handler)
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
