const DEFAULT_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const DEFAULT_BASE_URL = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";

export function isAiConfigured() {
  return Boolean(process.env.OPENAI_API_KEY);
}

export function currentModel() {
  return DEFAULT_MODEL;
}

function buildSystemPrompt() {
  return [
    "你是一位专业的中文小说创作助手。",
    "根据用户提供的标题、题材、人物设定、故事梗概和写作要求,续写连贯、生动、有画面感的小说正文。",
    "只输出小说正文本身,不要输出解释、标题或markdown标记。",
    "保持人物性格与前文一致,推进情节,注意节奏与细节描写。",
  ].join("");
}

function buildUserPrompt({ title, genre, characters, outline, instruction, previousText }) {
  const parts = [];
  if (title) parts.push(`【标题】${title}`);
  if (genre) parts.push(`【题材】${genre}`);
  if (characters) parts.push(`【主要人物】${characters}`);
  if (outline) parts.push(`【故事梗概/设定】${outline}`);
  if (instruction) parts.push(`【本次写作要求】${instruction}`);
  if (previousText && previousText.trim()) {
    parts.push(`【已有正文,请在此基础上自然续写】\n${previousText.trim()}`);
  } else {
    parts.push("【请从开头写起】");
  }
  parts.push("请续写约 300-500 字。");
  return parts.join("\n\n");
}

async function generateWithOpenAI(input) {
  const res = await fetch(`${DEFAULT_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: buildSystemPrompt() },
        { role: "user", content: buildUserPrompt(input) },
      ],
      temperature: 0.9,
      max_tokens: 800,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`OpenAI API error ${res.status}: ${detail.slice(0, 500)}`);
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content?.trim();
  if (!text) {
    throw new Error("OpenAI API returned an empty completion");
  }
  return text;
}

// Deterministic-ish local generator used when no API key is configured, so the
// environment can be demonstrated end to end without a secret.
function generateDemo({ title, genre, characters, outline, instruction, previousText }) {
  const hero = (characters || "主角").split(/[,，、\s]+/).filter(Boolean)[0] || "主角";
  const theme = genre || "故事";
  const seed = (outline || instruction || title || "命运").trim();

  const opening = previousText && previousText.trim()
    ? `${hero}合上了手中的书页,窗外的风还在继续。`
    : `${title ? `《${title}》——` : ""}这是一个关于${theme}的开端。`;

  const body = [
    opening,
    `${hero}站在原地,心里反复念着那句话:「${seed || "总会有答案的"}」。`,
    `${theme === "故事" ? "命运" : theme}像一张无形的网,悄悄收拢。远处传来脚步声,由远及近,一步一步敲在寂静里。`,
    instruction
      ? `按照设定,${hero}决定${instruction}——尽管前路未卜,但退无可退。`
      : `${hero}深吸一口气,做出了那个改变一切的决定。`,
    "夜色渐深,一切才刚刚开始。",
  ].join("\n\n");

  return `${body}\n\n（演示模式:未检测到 OPENAI_API_KEY,以上为本地占位文本。配置密钥后即可获得真实 AI 续写。）`;
}

export async function generateStory(input) {
  if (isAiConfigured()) {
    const text = await generateWithOpenAI(input);
    return { text, mode: "ai", model: DEFAULT_MODEL };
  }
  return { text: generateDemo(input), mode: "demo", model: null };
}
