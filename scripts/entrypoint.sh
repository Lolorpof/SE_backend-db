#!/bin/sh
set -e

echo "Setting up database user permissions..."
PGPASSWORD=${POSTGRES_SUPERPASSWORD} psql -h database -U ${POSTGRES_SUPERUSER} -d ${POSTGRES_DB} << EOF
REVOKE CONNECT ON DATABASE ${POSTGRES_DB} FROM public;
REVOKE ALL ON SCHEMA public FROM PUBLIC;
CREATE USER appuser WITH PASSWORD 'FHJK3PT_secret';
CREATE SCHEMA drizzle;
GRANT ALL ON DATABASE ${POSTGRES_DB} TO appuser;
GRANT ALL ON SCHEMA public TO appuser;
GRANT ALL ON SCHEMA drizzle TO appuser;
GRANT ALL ON ALL TABLES IN SCHEMA public TO appuser;
EOF

echo "Running DB migrations..."
pnpm run db:migrate

echo "Seeding database..."
pnpm run db:seed

echo "Starting application..."
exec "$@"