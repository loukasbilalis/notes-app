# Notes App

A small notes app with a REST API, a Postgres database and a plain HTML frontend. I built it to learn the full GitHub workflow a software team uses: issues, branches, pull requests, CI, protected branches and automatic deployment.

**Live demo:** https://notes-app-roan-zeta.vercel.app

## Features

- Add, list and delete notes
- Search notes as you type (case-insensitive)
- Notes are stored in Postgres, so they survive restarts and redeploys

## Tech stack

| Layer | Choice |
|---|---|
| Backend | Node.js 22, Express 5 |
| Database | Postgres (Neon), with an in-memory fallback for tests |
| Frontend | One HTML page with vanilla JavaScript, no build step |
| Tests | Node's built-in test runner |
| CI | GitHub Actions |
| Hosting | Vercel |

## API

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/notes` | List notes. Add `?q=term` to filter by text. |
| `POST` | `/api/notes` | Create a note from `{ "text": "..." }`. Returns `201`, or `400` if the text is empty. |
| `DELETE` | `/api/notes/:id` | Delete a note. Returns `204`, or `404` if it doesn't exist. |

## Run it locally

You need Node.js 22 or newer.

```bash
git clone https://github.com/loukasbilalis/notes-app.git
cd notes-app
npm install
npm start
```

Open http://localhost:3000.

With no configuration, notes are kept in memory and disappear when the server stops. To use a real database, create a file named `.env` containing:

```
DATABASE_URL=postgresql://user:password@host/dbname
```

The `notes` table is created automatically on first use. `.env` is listed in `.gitignore`, so it is never committed.

## Run the tests

```bash
npm test
```

The tests start the server and send real HTTP requests to each endpoint. They use the in-memory store, so no database is needed. The same command runs in CI on every pull request.

## Project structure

```
server.js            Express app and API routes
store.js             Storage layer: Postgres, or memory when DATABASE_URL is unset
public/index.html    The frontend page
test/notes.test.js   API tests
.github/             CI workflow, Dependabot, CODEOWNERS, PR template
```

## How changes get in

`main` is protected, so nothing is pushed to it directly:

1. Open an issue describing the work.
2. Create a branch and commit the change.
3. Open a pull request. CI runs the tests, and Vercel builds a preview deployment.
4. Once checks pass, squash and merge. The branch is deleted automatically.
5. Vercel deploys `main` to production.

Other safeguards: secret scanning with push protection, Dependabot updates for npm packages and GitHub Actions, and a code owners file.

## Known limitations

- There are no user accounts, so all visitors share the same notes and anyone can add or delete them.
- Database setup is one `CREATE TABLE IF NOT EXISTS`. A real project would use versioned migrations.
- Preview deployments share the production database.

## License

MIT
