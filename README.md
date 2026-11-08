# JobTracker

A Spring Boot API (`src/`) with a React frontend (`frontend/`). In production both ship as a
single Cloud Run service: the Docker build compiles the React app into the Spring jar. See
[DEPLOYMENT.md](DEPLOYMENT.md) for Google Cloud setup.

## Running locally

Prerequisites: JDK 17, Node 22+, PostgreSQL with a `jobtracker` database, and a `.env` file in
the project root (`DB_PASSWORD`, OAuth client ids/secrets — see `production.env.example`).

**Everyday development** (two terminals, React reloads instantly on save):

```powershell
.\mvnw.cmd spring-boot:run          # terminal 1: API on http://localhost:8080
cd frontend; npm install; npm run dev   # terminal 2: app on http://localhost:5173/app/
```

Vite forwards API and sign-in requests to Spring, so sign in at `http://localhost:5173/auth.html`
with email and password. OAuth providers redirect back to port 8080: sign in there, then open
5173 (the session cookie is shared across ports on localhost).

**Spring only** (no hot reload): build the frontend once, then open http://localhost:8080.

```powershell
cd frontend; npm run build; cd ..
.\mvnw.cmd spring-boot:run
```

## Tests

```powershell
.\mvnw.cmd test          # backend (H2, no PostgreSQL needed)
cd frontend; npm test    # frontend unit tests
```

## Layout

| Path | What |
|---|---|
| `frontend/src/sections/` | Profile sections: contact, experience, education, skills, languages, application answers |
| `frontend/src/api.ts` | API client: CSRF token, 401 → sign-in redirect, field errors |
| `src/main/java/.../career/` | Career profile API (`/api/career/*`), all rows scoped to the signed-in user |
| `src/main/java/.../auth/` | Sign-in (email, Google, GitHub, LinkedIn) and `OwnerKeys`, the data-isolation rule |
| `src/main/resources/db/migration/` | Flyway migrations — never edit an applied one; add a new version |
