const express = require("express");

const app = express();
app.use(express.json());

// Notes live in memory for now, so they reset when the server restarts.
let notes = [];
let nextId = 1;

// GET /api/notes - list all notes
app.get("/api/notes", (req, res) => {
  res.json(notes);
});

// POST /api/notes - create a note from { "text": "..." }
app.post("/api/notes", (req, res) => {
  const text = (req.body.text || "").trim();
  if (!text) {
    return res.status(400).json({ error: "text is required" });
  }
  const note = { id: nextId++, text };
  notes.push(note);
  res.status(201).json(note);
});

// DELETE /api/notes/:id - delete one note
app.delete("/api/notes/:id", (req, res) => {
  const id = Number(req.params.id);
  const before = notes.length;
  notes = notes.filter((n) => n.id !== id);
  if (notes.length === before) {
    return res.status(404).json({ error: "note not found" });
  }
  res.status(204).end();
});

// Run a local server only when started with `npm start`.
// Vercel imports `app` instead and runs it itself.
if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`Listening on http://localhost:${port}`));
}

module.exports = app;
