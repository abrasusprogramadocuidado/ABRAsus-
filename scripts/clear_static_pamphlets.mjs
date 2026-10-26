import { readFile, writeFile } from 'node:fs/promises';

const file = new URL('../index.html', import.meta.url);
let html = await readFile(file, 'utf8');

const block = /const panfletos = \[[\s\S]*?const STORAGE_KEYS/;
if (!block.test(html)) {
  throw new Error('A lista estática de panfletos não foi encontrada.');
}

html = html.replace(block, 'const panfletos = [];\n\nconst STORAGE_KEYS');
html = html.replace(
  /([^\r\n]*Professora Carolina Galgane Lage Miranda[^\r\n]*)\r\n/g,
  '$1\n'
);

await writeFile(file, html, 'utf8');
console.log('Panfletos estáticos retirados da biblioteca pública.');
