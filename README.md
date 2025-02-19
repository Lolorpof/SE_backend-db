# Step to setup

- run `npm i` or `pnpm i`
- create your own `.env` file and set it up
- run `docker compose up --build` for first time setup
- for subsequent runs, just use `docker compose up`

To reset the database completely:

```bash
docker compose down -v  # This will remove all data
docker compose up --build  # This will recreate and reseed the database
```

# Database

The database setup is now automated through Docker. The entrypoint script will:

1. Create necessary users and permissions
2. Run migrations
3. Seed the database with initial data

# pgAdmin

- go to `http://localhost:5050/`
- login with `PGADMIN_DEFAULT_EMAIL` and `PGADMIN_DEFAULT_PASSWORD`
- add server
  - name: anything you want
  - host: `database`
  - port: `5432`
  - Maintenance database: `POSTGRES_DB`
  - Username: `POSTGRES_SUPERUSER`
  - Password: `POSTGRES_SUPERPASSWORD`

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

Gitflow https://www.borntodev.com/2024/10/22/git-flow/
