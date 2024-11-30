# Step to setup

- run `pnpm i`
- create your own `.env` file and set it up

# Database

- run `npm db:migrate`
- run `docker exec -it t10-database bash`
- run `psql -U postgres -d t10_db`

- run these commands in db

```
REVOKE CONNECT ON DATABASE t10_db FROM public;
REVOKE ALL ON SCHEMA public FROM PUBLIC;
CREATE USER appuser WITH PASSWORD 'FHJK3PT_secret';
CREATE SCHEMA drizzle;
GRANT ALL ON DATABASE t10_db TO appuser;
GRANT ALL ON SCHEMA public TO appuser;
GRANT ALL ON SCHEMA drizzle TO appuser;
GRANT ALL ON ALL TABLES IN SCHEMA public TO appuser;
```
