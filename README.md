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

# GitFlow

- `main` is the production branch
- `develop` is the development branch
- `feature/` is the feature branch
- `hotfix/` is the hotfix branch

- First time branch push `git push -u origin develop`

```
# สร้าง feature branch
git checkout develop
git checkout -b feature/new-feature

# ทำการพัฒนาและ commit
git add .
git commit -m "Implement new feature"

# เมื่อพัฒนาเสร็จ merge กลับเข้า develop
git checkout develop
git merge feature/new-feature
git push origin develop

# ลบ feature branch (optional)
git branch -d feature/new-feature
```

# pgAdmin

- run `docker compose up -d`
- go to `http://localhost:5050/`
- login with `PGADMIN_DEFAULT_EMAIL` and `PGADMIN_DEFAULT_PASSWORD`
- add server
  - name: anything you want
  - host: `database`
  - port: `5432`
  - Maintenance database: `POSTGRES_DB`
  - Username: `POSTGRES_SUPERUSER`
  - Password: `POSTGRES_SUPERPASSWORD`
