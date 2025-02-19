#!/bin/sh
set -e

INIT_FLAG_FILE="/usr/src/app/backend/.init/initialized"

# Check if the .init directory exists, create if it doesn't
mkdir -p /usr/src/app/backend/.init

if [ ! -f "$INIT_FLAG_FILE" ]; then
    echo "First time initialization..."
    
    # Set database host for Docker environment
    export POSTGRES_HOST=database
    export POSTGRES_PORT=5432

    echo "Waiting for database to be ready..."
    until PGPASSWORD=${POSTGRES_SUPERPASSWORD} psql -h database -U ${POSTGRES_SUPERUSER} -d ${POSTGRES_DB} -c '\q'; do
      echo "Postgres is unavailable - sleeping"
      sleep 1
    done

    echo "Setting up database user permissions..."
    PGPASSWORD=${POSTGRES_SUPERPASSWORD} psql -h database -U ${POSTGRES_SUPERUSER} -d ${POSTGRES_DB} << EOF
    DO \$\$
    BEGIN
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'appuser') THEN
            REVOKE CONNECT ON DATABASE ${POSTGRES_DB} FROM public;
            REVOKE ALL ON SCHEMA public FROM PUBLIC;
            CREATE USER appuser WITH PASSWORD '${POSTGRES_PASSWORD}';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.schemata WHERE schema_name = 'drizzle') THEN
            CREATE SCHEMA drizzle;
        END IF;
        
        GRANT ALL ON DATABASE ${POSTGRES_DB} TO appuser;
        GRANT ALL ON SCHEMA public TO appuser;
        GRANT ALL ON SCHEMA drizzle TO appuser;
        GRANT ALL ON ALL TABLES IN SCHEMA public TO appuser;
        GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO appuser;
        GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO appuser;
    END
    \$\$;
EOF

    echo "Running DB migrations..."
    pnpm run db:gen
    PGHOST=database PGPORT=5432 pnpm run db:migrate

    echo "Seeding database..."
    pnpm run db:seed

    # Create flag file to indicate initialization is done
    touch "$INIT_FLAG_FILE"
    echo "Initialization complete."
else
    echo "System already initialized, skipping setup..."
    # Still need to set these for the application
    export POSTGRES_HOST=database
    export POSTGRES_PORT=5432
fi

echo "Starting application..."
exec "$@"