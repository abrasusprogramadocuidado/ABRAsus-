import fs from "node:fs/promises";
import path from "node:path";

const GRAPH_VERSION = "v26.0";
const GRAPH_ROOT = `https://graph.facebook.com/${GRAPH_VERSION}`;
const SCHEDULE_PATH = path.resolve("content/programacao-site-21-panfletos.json");
const STATE_PATH = path.resolve("content/redes-sociais-publicadas.json");

const pageAccessToken = process.env.META_PAGE_ACCESS_TOKEN?.trim();
const pageId = process.env.META_PAGE_ID?.trim();
const instagramUserId = process.env.META_IG_USER_ID?.trim();
const dryRun = String(process.env.DRY_RUN ?? "false").toLowerCase() === "true";
const maxPostsPerRun = Math.max(1, Number.parseInt(process.env.MAX_POSTS_PER_RUN ?? "1", 10) || 1);

if (!pageAccessToken || !pageId || !instagramUserId) {
  throw new Error("META_PAGE_ACCESS_TOKEN, META_PAGE_ID e META_IG_USER_ID são obrigatórios.");
}

async function graphRequest(endpoint, { method = "GET", params = {} } = {}) {
  const url = new URL(`${GRAPH_ROOT}/${endpoint.replace(/^\//, "")}`);
  const body = new URLSearchParams({ ...params, access_token: pageAccessToken });

  if (method === "GET") {
    for (const [key, value] of body) url.searchParams.set(key, value);
  }

  const response = await fetch(url, {
    method,
    headers: method === "POST" ? { "content-type": "application/x-www-form-urlencoded" } : undefined,
    body: method === "POST" ? body : undefined,
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok || payload.error) {
    const message = payload?.error?.message || `HTTP ${response.status}`;
    const code = payload?.error?.code ? ` (código ${payload.error.code})` : "";
    throw new Error(`Meta API: ${message}${code}`);
  }
  return payload;
}

async function readJson(filePath, fallback) {
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT") return fallback;
    throw error;
  }
}

async function saveState(state) {
  await fs.writeFile(STATE_PATH, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}

function compact(value) {
  return String(value ?? "").replace(/\r\n/g, "\n").trim();
}

async function findFacebookDuplicate(caption) {
  const result = await graphRequest(`${pageId}/published_posts`, {
    params: { fields: "id,message,created_time", limit: "50" },
  });
  return result.data?.find((post) => compact(post.message) === compact(caption));
}

async function findInstagramDuplicate(caption) {
  const result = await graphRequest(`${instagramUserId}/media`, {
    params: { fields: "id,caption,timestamp,permalink", limit: "50" },
  });
  return result.data?.find((post) => compact(post.caption) === compact(caption));
}

async function publishFacebook(item) {
  const existing = await findFacebookDuplicate(item.legendaInstagram);
  if (existing) return { id: existing.id, existing: true, publishedAt: existing.created_time };

  const result = await graphRequest(`${pageId}/photos`, {
    method: "POST",
    params: {
      url: item.imagemUrl,
      caption: item.legendaInstagram,
      published: "true",
    },
  });
  return { id: result.post_id || result.id, existing: false, publishedAt: new Date().toISOString() };
}

async function publishInstagram(item) {
  const existing = await findInstagramDuplicate(item.legendaInstagram);
  if (existing) {
    return {
      id: existing.id,
      permalink: existing.permalink,
      existing: true,
      publishedAt: existing.timestamp,
    };
  }

  const container = await graphRequest(`${instagramUserId}/media`, {
    method: "POST",
    params: { image_url: item.imagemUrl, caption: item.legendaInstagram },
  });
  const result = await graphRequest(`${instagramUserId}/media_publish`, {
    method: "POST",
    params: { creation_id: container.id },
  });
  return { id: result.id, existing: false, publishedAt: new Date().toISOString() };
}

const schedule = await readJson(SCHEDULE_PATH, []);
const state = await readJson(STATE_PATH, { version: 1, published: {} });
state.version = 1;
state.published ||= {};

const now = new Date();
const due = schedule
  .filter((item) => new Date(item.dataPublicacao).getTime() <= now.getTime())
  .filter((item) => !(state.published[item.id]?.facebook && state.published[item.id]?.instagram))
  .sort((a, b) => new Date(a.dataPublicacao) - new Date(b.dataPublicacao))
  .slice(0, maxPostsPerRun);

if (due.length === 0) {
  console.log("Nenhum panfleto pendente está programado para este horário.");
  process.exit(0);
}

let failures = 0;
for (const item of due) {
  console.log(`Processando: ${item.titulo}`);
  if (dryRun) {
    console.log(`Simulação: ${item.dataPublicacao} | ${item.imagemUrl}`);
    continue;
  }

  const record = (state.published[item.id] ||= {
    title: item.titulo,
    scheduledAt: item.dataPublicacao,
  });

  if (!record.facebook) {
    try {
    record.facebook = await publishFacebook(item);
    await saveState(state);
    console.log(`Facebook concluído: ${record.facebook.id}`);
    } catch (error) {
      failures++;
      console.error(`Facebook: ${error.message}`);
    }
  }

  if (!record.instagram) {
    try {
    record.instagram = await publishInstagram(item);
    await saveState(state);
    console.log(`Instagram concluído: ${record.instagram.id}`);
    } catch (error) {
      failures++;
      console.error(`Instagram: ${error.message}`);
    }
  }

  if (record.facebook && record.instagram) record.completedAt = new Date().toISOString();
  await saveState(state);
  console.log(`Processamento concluído: ${item.id}`);
}
if (failures) process.exitCode = 1;
