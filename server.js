const path = require("path");
const express = require("express");
const store = require("./store");

const app = express();
app.use(express.json());
app.use(express.static("public"));

// Vercel ignores express.static, so serve the page explicitly.
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// GET /api/notes - list notes; ?q=term keeps only notes containing the term
app.get("/api/notes", async (req, res) => {
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
  res.json(await store.list(q));
});

// POST /api/notes - create a note from { "text": "..." }
app.post("/api/notes", async (req, res) => {
  const text = (req.body.text || "").trim();
  if (!text) {
    return res.status(400).json({ error: "text is required" });
  }
  res.status(201).json(await store.create(text));
});

// DELETE /api/notes/:id - delete one note
app.delete("/api/notes/:id", async (req, res) => {
  const removed = await store.remove(Number(req.params.id));
  if (!removed) {
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
