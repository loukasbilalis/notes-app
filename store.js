// Two ways to store notes behind one interface:
// - Postgres when DATABASE_URL is set (production and local dev with .env)
// - in memory otherwise (tests and CI, so they need no database)

function memoryStore() {
  let notes = [];
  let nextId = 1;
  return {
    async list() {
      return notes;
    },
    async create(text) {
      const note = { id: nextId++, text };
      notes.push(note);
      return note;
    },
    async remove(id) {
      const before = notes.length;
      notes = notes.filter((n) => n.id !== id);
      return notes.length < before;
    },
  };
}

function postgresStore(connectionString) {
  const { Pool } = require("pg");
  const pool = new Pool({ connectionString });
  const ready = pool.query(`
    CREATE TABLE IF NOT EXISTS notes (
      id SERIAL PRIMARY KEY,
      text TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`);
  return {
    async list() {
      await ready;
      const { rows } = await pool.query("SELECT id, text FROM notes ORDER BY id");
      return rows;
    },
    async create(text) {
      await ready;
      // $1 is a placeholder: the driver sends the value separately from the SQL,
      // which prevents SQL injection.
      const { rows } = await pool.query(
        "INSERT INTO notes (text) VALUES ($1) RETURNING id, text",
        [text]
      );
      return rows[0];
    },
    async remove(id) {
      await ready;
      const { rowCount } = await pool.query("DELETE FROM notes WHERE id = $1", [id]);
      return rowCount > 0;
    },
  };
}

module.exports = process.env.DATABASE_URL
  ? postgresStore(process.env.DATABASE_URL)
  : memoryStore();
