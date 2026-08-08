import express from "express";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { generateStory, isAiConfigured, currentModel } from "./aiClient.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

export function createApp() {
  const app = express();

  app.use(express.json({ limit: "1mb" }));
  app.use(express.static(join(__dirname, "..", "public")));

  // Tells the UI whether a real AI backend is configured or it is in demo mode.
  app.get("/api/config", (_req, res) => {
    res.json({
      aiConfigured: isAiConfigured(),
      model: isAiConfigured() ? currentModel() : null,
    });
  });

  // Generate (or continue) a piece of the novel.
  app.post("/api/generate", async (req, res) => {
    const {
      title = "",
      genre = "",
      characters = "",
      outline = "",
      instruction = "",
      previousText = "",
    } = req.body ?? {};

    if (![title, genre, characters, outline, instruction, previousText].some((v) => String(v).trim())) {
      res.status(400).json({ error: "请至少填写标题、题材、人物、梗概或写作要求中的一项。" });
      return;
    }

    try {
      const result = await generateStory({ title, genre, characters, outline, instruction, previousText });
      res.json(result);
    } catch (err) {
      res.status(502).json({ error: `生成失败:${err.message}` });
    }
  });

  app.get("/healthz", (_req, res) => {
    res.json({ status: "ok" });
  });

  return app;
}
