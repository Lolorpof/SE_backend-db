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

# Development & Testing

The backend runs in a Docker container with hot-reload enabled. You can:

1. View logs in real-time:

```bash
docker compose logs -f backend  # Follow backend logs
```

2. Execute commands inside the container:

```bash
docker compose exec backend pnpm test  # Run tests
docker compose exec backend sh  # Get a shell inside the container
```

3. Restart the backend service after major changes:

```bash
docker compose restart backend
```

4. View all running services:

```bash
docker compose ps
```

# Accessing the Backend API

The backend container exposes its port to your local machine, so you can access it just like a locally running service:

1. **From Frontend**:

   - The backend API is available at `http://localhost:6977` (or whatever port you set in .env)
   - Your frontend code can make API calls to this URL
   - Example: `fetch('http://localhost:6977/api/v1/users')`

2. **From Postman**:
   - Use `http://localhost:6977` as your base URL
   - All API endpoints will be accessible just like before
   - You can import the Swagger documentation from `http://localhost:6977/api-docs`

The containerization is transparent to API clients - they don't need to know the backend is running in Docker.

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
