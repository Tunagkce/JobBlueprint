# Firebase Hosting, Cloud Run, and Cloud SQL deployment

Firebase Hosting provides the public HTTPS domain. It forwards requests to the
Spring Boot container on Cloud Run, and Cloud Run connects to PostgreSQL on
Cloud SQL. Firebase Hosting itself does not run the Java server. This repository
has a `firebase.json` rewrite for a Cloud Run service named `jobblueprint` in
`europe-west1`.

## 1. Create the Google project

In Firebase Console, create or select a Firebase project. It is also a Google
Cloud project. Add a billing account and use the Blaze plan: Cloud Run and Cloud
SQL require billing to be enabled. Costs depend on usage and Cloud SQL instance
configuration, so review current Google Cloud pricing before creating the SQL
instance. Install the Firebase CLI and Google Cloud CLI, then from VS Code's
PowerShell terminal run:

```powershell
firebase login
firebase use --add
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
gcloud services enable run.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com sqladmin.googleapis.com secretmanager.googleapis.com
```

Choose the same Firebase project when `firebase use --add` prompts. The command
creates a local `.firebaserc` with the selected project alias.

## 2. Create Cloud SQL PostgreSQL

Create a PostgreSQL instance and database in `europe-west1` to match Cloud Run.
Enable automated backups and point-in-time recovery. Keep SQL network access
restricted; the Java Cloud SQL Connector uses the Cloud SQL API rather than a
public database endpoint. Create separate database users for the app and
migrations where practical. Give the Cloud Run service account the Cloud SQL
Client IAM role. Google's [Cloud SQL connection guide](https://cloud.google.com/sql/docs/postgres/connect-run)
describes region alignment and the Cloud SQL Client role.

The Java connector dependency is included in `pom.xml`. Use a JDBC URL in the
format shown in [`production.env.example`](production.env.example), replacing
`PROJECT_ID`, `INSTANCE_ID`, and the database name. The connector establishes
the encrypted Cloud SQL connection; the JDBC driver's `sslmode=disable` applies
inside that connector tunnel, as shown in the [Google connector examples](https://github.com/GoogleCloudPlatform/cloud-sql-jdbc-socket-factory/blob/main/docs/jdbc.md).

## 3. Set production secrets

In Cloud Run, configure `SPRING_PROFILES_ACTIVE=prod` and the environment keys
from `production.env.example`. Store passwords and OAuth client secrets in
Google Secret Manager and reference them as Cloud Run secrets; do not commit
real values or bake them into the Docker image. Set `DB_URL` and
`MIGRATION_DB_URL` to the connector JDBC URL. Set `DB_USERNAME` and
`DB_PASSWORD` to the application role, and `MIGRATION_DB_USERNAME` and
`MIGRATION_DB_PASSWORD` to the migration role. Ensure the migrator can run the
Flyway schema migrations and the app role can read/write app tables and
sequences.

The current app stores account passwords as BCrypt hashes. Profile columns are
plaintext in PostgreSQL, so also enable Cloud SQL encryption at rest and limit
database administrator access. Application-level field encryption is not
implemented.

## 4. Deploy Spring Boot to Cloud Run

From the project directory, create an Artifact Registry repository once and
build the container image:

```powershell
gcloud artifacts repositories create job-tracker --repository-format=docker --location=europe-west1
gcloud builds submit --tag europe-west1-docker.pkg.dev/YOUR_PROJECT_ID/job-tracker/app
```

Then in Google Cloud Console → Cloud Run → Create service, select the image,
service name `jobblueprint`, region `europe-west1`, and allow unauthenticated
invocations. Before creating the service, set `SPRING_PROFILES_ACTIVE=prod`, the
database URL and usernames, and Secret Manager references for database
passwords and OAuth secrets. Attach a dedicated runtime service account and give
it Cloud SQL Client and Secret Manager Secret Accessor roles for only the
required secrets. Set a maximum instance count (for example, 3) to limit
unexpected scaling; adjust it to your usage and database connection capacity.
Spring Security still requires users to authenticate to protected app routes.

When redeploying later, run `gcloud builds submit` again and deploy the new
image to the same Cloud Run service. Keep the Firebase Hosting rewrite's service
name and region aligned with that Cloud Run service.

The Cloud SQL Java Connector authenticates to Google Cloud using Application
Default Credentials. Ensure the Cloud Run runtime service account has
`roles/cloudsql.client`. Google's [Java Cloud SQL connector documentation](https://cloud.google.com/sql/docs/postgres/connect-connectors)
describes connector setup and authentication.

## 5. Deploy Firebase Hosting and add the domain

`firebase.json` routes all requests through the `jobblueprint` Cloud Run service.
Deploy the Hosting rewrite:

```powershell
firebase deploy --only hosting
```

Firebase then serves the project at `https://YOUR_PROJECT_ID.web.app`. To use a
custom domain, open Firebase Console → Hosting → Add custom domain and follow
the DNS verification instructions. Firebase provisions HTTPS for the connected
domain. See Google's [Hosting-to-Cloud-Run guide](https://firebase.google.com/docs/hosting/cloud-run).

Firebase Hosting rewrites to Cloud Run support a 60-second request timeout. Keep
long-running job search or resume-processing tasks asynchronous if they may
exceed that limit.

## 6. Configure production OAuth

After the Firebase domain is known, register these exact callback URLs in the
Google, GitHub, and LinkedIn developer consoles:

- `https://YOUR_PROJECT_ID.web.app/login/oauth2/code/google`
- `https://YOUR_PROJECT_ID.web.app/login/oauth2/code/github`
- `https://YOUR_PROJECT_ID.web.app/login/oauth2/code/linkedin`

If using a custom domain, register its corresponding URLs instead. Configure
the `*_CLIENT_ID` and `*_CLIENT_SECRET` values through Secret Manager and redeploy
Cloud Run. A Google client secret was previously pasted into chat; revoke and
rotate it before production use. Use separate OAuth clients for local and
production environments where possible.

## Existing database caution

For an empty database, Flyway applies migrations on startup. Before attaching any
existing database, inspect its schema and Flyway history, then take and verify a
restorable backup. The old project schema may require setting
`SPRING_FLYWAY_BASELINE_ON_MIGRATE=true` for a one-time startup only after
confirming it is that exact schema; remove the override afterward. Migration
version 2 copies the legacy profile only when exactly one local account exists.

## Before public registration

- Add email verification and account recovery for password accounts.
- Configure request rate limits, access logs that avoid personal data/secrets,
  and a tested database restore procedure.
- OAuth accounts from different providers remain separate identities; account
  linking is not implemented.
- Verify `/api/health` and confirm unauthenticated requests to `/api/profile` are
  rejected after deployment.
