import { execFileSync } from 'node:child_process';
import { writeFile } from 'node:fs/promises';

const eol = '\r\n';
const fromHead = file => execFileSync('git', ['show', `HEAD:${file}`], {
  encoding: 'utf8',
  maxBuffer: 8 * 1024 * 1024
});

function replaceOnce(source, search, replacement, label) {
  if (!source.includes(search)) throw new Error(`Trecho não encontrado: ${label}`);
  return source.replace(search, replacement);
}

let admin = fromHead('admin.html');

admin = replaceOnce(
  admin,
  `  .btn-danger { background: #fff1f1; border-color: #fecaca; color: var(--erro); }${eol}`,
  `  .btn-danger { background: #fff1f1; border-color: #fecaca; color: var(--erro); }${eol}  .btn-unpublish { background: #fff7ed; border-color: #fdba74; color: #9a3412; }\n`,
  'estilo do botão de retirada'
);

admin = replaceOnce(
  admin,
  `      <div class="list" id="panfletosList"></div>${eol}`,
  `      <div class="list" id="panfletosList"></div>${eol}      <div class="status" id="listStatus" role="status" aria-live="polite"></div>\n`,
  'status da lista'
);

admin = replaceOnce(
  admin,
  `      <p class="help">Campos marcados como texto/links são salvos no Supabase. Arquivos são enviados para o bucket <strong>panfletos</strong>.</p>${eol}`,
  '      <p class="help">Campos marcados como texto/links são salvos no Supabase. Arquivos são enviados para o bucket <strong>panfletos</strong>. Para corrigir um material sem perdê-lo, use <strong>Retirar do site</strong> e publique novamente após a revisão.</p>\n',
  'orientação administrativa'
);

admin = replaceOnce(
  admin,
  `        <button class="btn btn-danger hidden" type="button" id="deleteBtn">Excluir</button>${eol}`,
  '        <button class="btn btn-danger hidden" type="button" id="deleteBtn">Excluir definitivamente</button>\n',
  'rótulo de exclusão definitiva'
);

admin = replaceOnce(
  admin,
  [
    '        <div class="btn-row">',
    '          <button class="btn btn-secondary" type="button" data-edit="${escapeHtml(row.id)}">Editar</button>',
    '        </div>',
    ''
  ].join(eol),
  [
    '        <div class="btn-row">',
    '          <button class="btn btn-secondary" type="button" data-edit="${escapeHtml(row.id)}">Editar</button>',
    '          ${row.publicado',
    '            ? `<button class="btn btn-unpublish" type="button" data-unpublish="${escapeHtml(row.id)}">Retirar do site</button>`',
    '            : `<button class="btn btn-primary" type="button" data-publish="${escapeHtml(row.id)}">Publicar novamente</button>`}',
    '        </div>',
    ''
  ].join('\n'),
  'ações rápidas da lista'
);

admin = replaceOnce(
  admin,
  `  const ok = confirm("Tem certeza que deseja excluir este panfleto? Essa ação remove o registro do banco.");${eol}`,
  '  const ok = confirm("Excluir definitivamente este panfleto? Essa ação remove o registro do banco. Para apenas ocultar e corrigir depois, cancele e use ‘Retirar do site’.");\n',
  'confirmação de exclusão'
);

const publicationFunction = `async function setPublicationStatus(id, publicado) {
  const row = panfletos.find(item => item.id === id);
  if (!row) return;

  const action = publicado ? "publicar novamente" : "retirar do site";
  const detail = publicado
    ? "O material voltará a ficar visível conforme a data de publicação cadastrada."
    : "O material ficará oculto imediatamente, mas o cadastro e os arquivos serão preservados para correção.";
  const ok = confirm(\`Deseja \${action} “\${row.titulo}”?\\n\\n\${detail}\`);
  if (!ok) return;

  clearStatus("listStatus");
  setStatus("listStatus", publicado ? "Publicando material..." : "Retirando material do site...", "ok");

  const { error } = await client
    .from("panfletos")
    .update({ publicado })
    .eq("id", id);

  if (error) {
    setStatus("listStatus", \`Erro ao alterar a publicação: \${error.message}\`, "err");
    return;
  }

  await loadPanfletos();
  if (editingId === id) editRow(id);
  setStatus(
    "listStatus",
    publicado ? "Panfleto publicado novamente." : "Panfleto retirado do site. O cadastro foi preservado.",
    "ok"
  );
}

`;

admin = replaceOnce(
  admin,
  `$("loginForm").addEventListener("submit", loginWithEmail);${eol}`,
  `${publicationFunction}$("loginForm").addEventListener("submit", loginWithEmail);${eol}`,
  'função de publicação'
);

admin = replaceOnce(
  admin,
  [
    '$("panfletosList").addEventListener("click", event => {',
    '  const button = event.target.closest("[data-edit]");',
    '  if (button) editRow(button.dataset.edit);',
    '});',
    ''
  ].join(eol),
  [
    '$("panfletosList").addEventListener("click", event => {',
    '  const editButton = event.target.closest("[data-edit]");',
    '  if (editButton) {',
    '    editRow(editButton.dataset.edit);',
    '    return;',
    '  }',
    '',
    '  const unpublishButton = event.target.closest("[data-unpublish]");',
    '  if (unpublishButton) {',
    '    setPublicationStatus(unpublishButton.dataset.unpublish, false);',
    '    return;',
    '  }',
    '',
    '  const publishButton = event.target.closest("[data-publish]");',
    '  if (publishButton) setPublicationStatus(publishButton.dataset.publish, true);',
    '});',
    ''
  ].join('\n'),
  'eventos dos botões de publicação'
);

let index = fromHead('index.html');
const indexEol = '\n';

index = replaceOnce(
  index,
  `function estaPublicado(panfleto) {${indexEol}`,
  `function estaPublicado(panfleto) {${indexEol}  if (panfleto.publicado === false) return false;\n`,
  'filtro de publicação'
);

index = replaceOnce(
  index,
  `    acessos: row.acessos${indexEol}`,
  `    acessos: row.acessos,${indexEol}    publicado: row.publicado !== false\n`,
  'mapeamento do status remoto'
);

index = replaceOnce(
  index,
  `    acessos: Number(panfleto.acessos || 0),${eol}    local: Boolean(panfleto.local)${eol}`,
  `    acessos: Number(panfleto.acessos || 0),${eol}    publicado: panfleto.publicado !== false,\n    local: Boolean(panfleto.local)${eol}`,
  'normalização do status'
);

index = replaceOnce(
  index,
  [
    '  const lista = [...porId.values()];',
    '  if (opcoes.incluirAgendados || previewAgendados) return lista;',
    '  return lista.filter(estaPublicado);',
    ''
  ].join(indexEol),
  [
    '  const lista = [...porId.values()].filter(panfleto => panfleto.publicado !== false);',
    '  if (opcoes.incluirAgendados || previewAgendados) return lista;',
    '  return lista.filter(estaPublicado);',
    ''
  ].join('\n'),
  'lista pública de panfletos'
);

await Promise.all([
  writeFile(new URL('../admin.html', import.meta.url), admin, 'utf8'),
  writeFile(new URL('../index.html', import.meta.url), index, 'utf8')
]);

console.log('Função de retirar e republicar panfletos aplicada.');
