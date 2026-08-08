import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { createApp } from "../src/app.js";

const app = createApp();

test("GET /api/config reports demo mode when no API key", async () => {
  const res = await request(app).get("/api/config");
  assert.equal(res.status, 200);
  assert.equal(res.body.aiConfigured, false);
  assert.equal(res.body.model, null);
});

test("POST /api/generate rejects empty input", async () => {
  const res = await request(app).post("/api/generate").send({});
  assert.equal(res.status, 400);
  assert.ok(res.body.error);
});

test("POST /api/generate returns demo text from inputs", async () => {
  const res = await request(app)
    .post("/api/generate")
    .send({ title: "雾都孤影", genre: "悬疑", characters: "林澈", instruction: "写开篇" });
  assert.equal(res.status, 200);
  assert.equal(res.body.mode, "demo");
  assert.ok(res.body.text.includes("林澈"));
  assert.ok(res.body.text.length > 20);
});

test("POST /api/generate continues from previous text", async () => {
  const res = await request(app)
    .post("/api/generate")
    .send({ previousText: "夜色如墨,街灯昏黄。" });
  assert.equal(res.status, 200);
  assert.equal(res.body.mode, "demo");
  assert.ok(res.body.text.length > 20);
});

test("GET /healthz reports ok", async () => {
  const res = await request(app).get("/healthz");
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { status: "ok" });
});

test("GET / serves the writing UI", async () => {
  const res = await request(app).get("/");
  assert.equal(res.status, 200);
  assert.match(res.headers["content-type"], /text\/html/);
  assert.match(res.text, /AI 小说创作助手/);
});
