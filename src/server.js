import { createApp } from "./app.js";

const port = Number(process.env.PORT) || 3000;
const host = process.env.HOST || "0.0.0.0";

const app = createApp();

app.listen(port, host, () => {
  console.log(`AI 小说创作助手 listening on http://${host}:${port}`);
});
