const { test, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert");
const app = require("../server");

let server;
let base;

beforeEach(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  base = `http://localhost:${server.address().port}`;
});

afterEach(() => {
  server.close();
});

const post = (text) =>
  fetch(`${base}/api/notes`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text }),
  });

test("POST /api/notes creates a note", async () => {
  const res = await post("buy milk");
  assert.strictEqual(res.status, 201);
  const note = await res.json();
  assert.strictEqual(note.text, "buy milk");
  assert.ok(note.id);
});

test("POST /api/notes rejects an empty note", async () => {
  const res = await post("   ");
  assert.strictEqual(res.status, 400);
});

test("GET /api/notes lists created notes", async () => {
  const created = await (await post("list me")).json();
  const res = await fetch(`${base}/api/notes`);
  const notes = await res.json();
  assert.ok(notes.some((n) => n.id === created.id));
});

test("DELETE /api/notes/:id removes a note", async () => {
  const created = await (await post("delete me")).json();
  const res = await fetch(`${base}/api/notes/${created.id}`, { method: "DELETE" });
  assert.strictEqual(res.status, 204);
  const notes = await (await fetch(`${base}/api/notes`)).json();
  assert.ok(!notes.some((n) => n.id === created.id));
});

test("DELETE /api/notes/:id returns 404 for an unknown note", async () => {
  const res = await fetch(`${base}/api/notes/99999`, { method: "DELETE" });
  assert.strictEqual(res.status, 404);
});

test("GET /api/notes?q= filters notes, ignoring case", async () => {
  await post("Buy Oranges");
  await post("call the bank");
  const res = await fetch(`${base}/api/notes?q=oRANGE`);
  const notes = await res.json();
  assert.ok(notes.length >= 1);
  assert.ok(notes.every((n) => n.text.toLowerCase().includes("orange")));
});

test("GET /api/notes?q= returns an empty list when nothing matches", async () => {
  const res = await fetch(`${base}/api/notes?q=zzz-no-such-note`);
  assert.deepStrictEqual(await res.json(), []);
});
