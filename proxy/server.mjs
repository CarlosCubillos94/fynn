import { createServer } from "node:http";

const port = Number(process.env.PORT ?? 8787);

function send(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  });
  res.end(payload);
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString("utf8");
        resolve(raw ? JSON.parse(raw) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

async function complete(system, user) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    const error = new Error("OPENAI_API_KEY is not set on the proxy.");
    error.status = 503;
    throw error;
  }
  const base = (process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1").replace(/\/$/, "");
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  const response = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!response.ok) {
    throw new Error((await response.text()).slice(0, 300));
  }
  const json = await response.json();
  return json.choices?.[0]?.message?.content ?? "";
}

function parseJsonContent(content) {
  const trimmed = content.trim().replace(/^```json\s*/i, "").replace(/```$/, "");
  return JSON.parse(trimmed);
}

const server = createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    send(res, 204, {});
    return;
  }
  if (req.method === "GET" && req.url === "/health") {
    send(res, 200, { ok: true });
    return;
  }
  try {
    if (req.method === "POST" && req.url === "/categorize") {
      const body = await readJson(req);
      const content = await complete(
        "You categorize a personal finance phrase. Reply with JSON only: {\"categoryId\": string, \"description\": string}. Pick categoryId from the provided list. Do not invent an amount. Description is a short cleaned label, not a sentence.",
        JSON.stringify({ phrase: body.phrase, categories: body.categories }),
      );
      send(res, 200, parseJsonContent(content));
      return;
    }
    if (req.method === "POST" && req.url === "/insight") {
      const body = await readJson(req);
      const content = await complete(
        "Rewrite the given finance sentence in plain English. Keep every number exactly as provided, including the percent. Do not add facts. Reply with JSON only: {\"sentence\": string}.",
        JSON.stringify(body),
      );
      send(res, 200, parseJsonContent(content));
      return;
    }
    send(res, 404, { error: "Not found" });
  } catch (error) {
    const status = error.status ?? 500;
    send(res, status, { error: error instanceof Error ? error.message : "Proxy error" });
  }
});

server.listen(port, () => {
  console.log(`Fynn AI proxy listening on ${port}`);
});
