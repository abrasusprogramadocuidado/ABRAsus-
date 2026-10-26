import fs from "node:fs";
import path from "node:path";

const repo = path.resolve(import.meta.dirname, "..");
const sourceRoot = "C:/Users/annac/OneDrive/Desktop/POSTS iNSTAGRAN_CORRIGIDOS";
const editorialPath = "C:/Users/annac/Documents/Codex/2026-08-12/boa-tarde-chat-tudo-bem-codex/outputs/Legendas_Detalhadas_93_Panfletos/Base_Editorial_93_Panfletos.json";
const publicBase = "https://abrasusprogramadocuidado.github.io/ABRAsus-/";
const formUrl = "https://forms.gle/LjudWydykpJEpru88";

const plan = [
  ["Acidente ofídico: o que fazer após uma picada", "Acidente ofídico/A.OSITE.png", "2026-10-26T20:00:00-03:00"],
  ["Diabetes mellitus: conhecer para cuidar", "DM/site.png", "2026-10-28T10:00:00-03:00"],
  ["Acidente com arraia: primeiros cuidados", "Arraia/site.png", "2026-10-30T10:00:00-03:00"],
  ["Infecção do trato urinário: sintomas e cuidados", "ITU/SITE.png", "2026-11-02T10:00:00-03:00"],
  ["Febre: sinais de alarme, medicamentos e cuidados", "fEBRE/Febre_ Entenda, Cuide e Previna.png", "2026-11-04T10:00:00-03:00"],
  ["Erisipela e celulite: infecções da pele", "Erisipela e Celulite/erisipela_celulite_site.png", "2026-11-06T10:00:00-03:00"],
  ["Choque anafilático: reconhecer para agir rápido", "Choque anafilático/site.png", "2026-11-09T10:00:00-03:00"],
  ["Sepse: sinais de alerta e atendimento urgente", "Sepse/site.png", "2026-11-11T10:00:00-03:00"],
  ["Falta de ar: causas e quando procurar ajuda", "Falta de ar/site.png", "2026-11-13T10:00:00-03:00"],
  ["Asma: controle, crises e sinais de alerta", "ASMA/site.png", "2026-11-16T10:00:00-03:00"],
  ["Espirometria: o exame do sopro", "Espirometria/site.png", "2026-11-18T10:00:00-03:00"],
  ["Tosse: causas comuns e sinais de alerta", "TOSSE/TOSSE SITE.png", "2026-11-20T10:00:00-03:00"],
  ["EVALI: lesão pulmonar associada ao uso de vape", "evali/infográfico_evali_informação_que_protege.png", "2026-11-23T10:00:00-03:00"],
  ["Broncoscopia: preparo, exame e cuidados", "Broncoscopia/site.png", "2026-11-25T10:00:00-03:00"],
  ["Pneumonia x gripe x COVID-19: entenda as diferenças", "GRIPE,COVID,PNEUMONIA/pneumonia_gripe_covid_site.png", "2026-11-27T10:00:00-03:00"],
  ["Hipertensão arterial: diagnóstico, controle e cuidados", "HAS/site.png", "2026-11-30T10:00:00-03:00"],
  ["Cateterismo cardíaco: como é feito", "Cateterismo/cateterismosite.png", "2026-12-02T10:00:00-03:00"],
  ["Arritmias: do ritmo ao cuidado", "Arritmia/Arritmia site.png", "2026-12-04T10:00:00-03:00"],
  ["Insuficiência cardíaca: sinais, cuidados e acompanhamento", "IC/SITE.png", "2026-12-07T10:00:00-03:00"],
  ["Antiácidos x IBP: entenda a diferença", "Antiácidox IBP/SITE.png", "2026-12-09T10:00:00-03:00"],
  ["Tuberculose: transmissão, sintomas e tratamento", "tb/site.png", "2026-12-11T10:00:00-03:00"],
];

const slugify = (value) => value
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/(^-|-$)/g, "");

const hashtag = (value) => value
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/[^a-zA-Z0-9]/g, "");

function buildInstagramCaption(item) {
  const sections = item.descricao_longa.flatMap((section, index) => {
    const lines = [];
    const repeatsSummary = index === 0 && String(section.texto || "").trim() === String(item.descricao || "").trim();
    if (!repeatsSummary) {
      lines.push(`${String(section.titulo || "Saiba mais").toUpperCase()}:`);
      if (section.texto) lines.push(String(section.texto).trim());
    }
    for (const point of section.itens || []) lines.push(`• ${point}`);
    return lines.length ? [...lines, ""] : [];
  });
  const tags = ["AbraSUS", ...item.palavras_chave.map(hashtag).filter(Boolean)]
    .slice(0, 7)
    .map((tag) => `#${tag}`)
    .join(" ");
  return [
    item.titulo.toUpperCase(),
    "",
    item.descricao,
    "",
    ...sections,
    `Leia o material completo no site do AbraSUS: ${publicBase}`,
    "",
    `Sua opinião ajuda o projeto: responda ao formulário ${formUrl}`,
    "",
    "Conteúdo educativo. Não substitui consulta, diagnóstico ou tratamento individualizado.",
    "",
    tags,
  ].join("\n").trim();
}

const editorial = JSON.parse(fs.readFileSync(editorialPath, "utf8"));
const byTitle = new Map(editorial.map((item) => [item.titulo, item]));
const assetDir = path.join(repo, "assets", "panfletos");
const contentDir = path.join(repo, "content");
fs.mkdirSync(assetDir, { recursive: true });
fs.mkdirSync(contentDir, { recursive: true });

const records = plan.map(([title, relativeSource, publicationDate]) => {
  const item = byTitle.get(title);
  if (!item) throw new Error(`Conteúdo editorial não encontrado: ${title}`);
  const source = path.join(sourceRoot, ...relativeSource.split("/"));
  if (!fs.existsSync(source)) throw new Error(`Imagem não encontrada: ${source}`);

  const id = item.id || slugify(title);
  const assetRelative = `assets/panfletos/${id}.png`;
  fs.copyFileSync(source, path.join(repo, ...assetRelative.split("/")));

  return {
    id,
    titulo: item.titulo,
    categoria: item.categoria,
    descricao: item.descricao,
    descricaoLonga: item.descricao_longa,
    palavrasChave: item.palavras_chave,
    fonteEditorial: item.fonte_editorial,
    legendaInstagram: buildInstagramCaption(item),
    dataPublicacao: publicationDate,
    imagemSite: assetRelative,
    imagemUrl: new URL(assetRelative, publicBase).href,
  };
});

const indexPath = path.join(repo, "index.html");
const indexSource = fs.readFileSync(indexPath, "utf8");
const staticLibraryPattern = /const panfletos = \[[\s\S]*?\];\s*\/\/ =====================================================\s*\/\/ CONFIGURAÇÕES E ESTADO LOCAL/;
if (!staticLibraryPattern.test(indexSource)) {
  throw new Error("Não foi possível localizar o acervo estático do index.html");
}
const cleanIndex = indexSource.replace(
  staticLibraryPattern,
  "const panfletos = [];\n\n// =====================================================\n// CONFIGURAÇÕES E ESTADO LOCAL",
);
fs.writeFileSync(indexPath, cleanIndex, "utf8");

fs.writeFileSync(
  path.join(contentDir, "programacao-site-21-panfletos.json"),
  `${JSON.stringify(records, null, 2)}\n`,
  "utf8",
);

const q = (value) => `'${String(value).replaceAll("'", "''")}'`;
const sqlRows = records.map((record) => {
  const values = [
    record.id,
    record.titulo,
    record.categoria,
    record.descricao,
    JSON.stringify(record.descricaoLonga),
    `{${record.palavrasChave.map((word) => `"${word.replaceAll('"', '\\"')}"`).join(",")}}`,
    record.imagemUrl,
    record.imagemUrl,
    JSON.stringify([record.imagemUrl]),
    record.dataPublicacao,
  ].map(q);
  return `  (${values.join(", ")}, true)`;
});

const sql = `-- Programação exclusiva do site AbraSUS: 21 panfletos\n` +
  `insert into public.panfletos\n` +
  `  (id, titulo, categoria, descricao, descricao_longa, palavras_chave, pdf_url, imagem_url, paginas, data_publicacao, publicado)\n` +
  `values\n${sqlRows.join(",\n")}\n` +
  `on conflict (id) do update set\n` +
  `  titulo = excluded.titulo,\n` +
  `  categoria = excluded.categoria,\n` +
  `  descricao = excluded.descricao,\n` +
  `  descricao_longa = excluded.descricao_longa,\n` +
  `  palavras_chave = excluded.palavras_chave,\n` +
  `  pdf_url = excluded.pdf_url,\n` +
  `  imagem_url = excluded.imagem_url,\n` +
  `  paginas = excluded.paginas,\n` +
  `  data_publicacao = excluded.data_publicacao,\n` +
  `  publicado = excluded.publicado;\n`;
fs.writeFileSync(path.join(contentDir, "programacao-site-21-panfletos.sql"), sql, "utf8");

const markdown = [
  "# Programação do site — 21 panfletos",
  "",
  "Horários no fuso America/Sao_Paulo.",
  "",
  "| Nº | Data e hora | Tema | Categoria |",
  "|---:|---|---|---|",
  ...records.map((record, index) => `| ${index + 1} | ${record.dataPublicacao.replace("T", " ").replace(":00-03:00", "")} | ${record.titulo} | ${record.categoria} |`),
  "",
];
fs.writeFileSync(path.join(contentDir, "CALENDARIO_SITE_21_PANFLETOS.md"), `${markdown.join("\n")}\n`, "utf8");

const instagram = [
  "# Legendas para Instagram — 21 panfletos",
  "",
  "Textos preparados para uso manual no Instagram. Nenhuma publicação em rede social foi agendada.",
  "",
  ...records.flatMap((record, index) => [
    `## ${index + 1}. ${record.titulo}`,
    "",
    `Data prevista no site: ${record.dataPublicacao}`,
    "",
    record.legendaInstagram,
    "",
    "---",
    "",
  ]),
];
fs.writeFileSync(path.join(contentDir, "LEGENDAS_INSTAGRAM_21_PANFLETOS.md"), `${instagram.join("\n")}\n`, "utf8");

console.log(`Preparados ${records.length} panfletos.`);
console.log(`Primeiro: ${records[0].dataPublicacao}`);
console.log(`Último: ${records.at(-1).dataPublicacao}`);
