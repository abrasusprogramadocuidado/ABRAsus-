import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const sharp = require('C:/Users/annac/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');

const siteRoot = 'C:/Users/annac/Documents/Codex/2026-08-12/boa-tarde-chat-tudo-bem-codex/site-abrasus';
const postsRoot = 'C:/Users/annac/OneDrive/Desktop/POSTS iNSTAGRAN_CORRIGIDOS';
const brandingDir = path.join(siteRoot, 'assets', 'branding');
const heroDir = path.join(siteRoot, 'assets', 'hero');
await fs.mkdir(brandingDir, { recursive: true });
await fs.mkdir(heroDir, { recursive: true });

await sharp('C:/Users/annac/Downloads/LOGO.png')
  .trim({ background: '#ffffff', threshold: 8 })
  .resize(760, 760, { fit: 'inside', withoutEnlargement: true })
  .png({ compressionLevel: 9 })
  .toFile(path.join(brandingDir, 'abrasus-logo.png'));

const slides = [
  ['ASMA/feed.png', 'asma.webp'],
  ['DM/feed.png', 'diabetes.webp'],
  ['Sepse/feed.png', 'sepse.webp'],
  ['Acidente ofídico/AOfeed.png', 'acidente-ofidico.webp'],
];

for (const [relativeSource, targetName] of slides) {
  await sharp(path.join(postsRoot, relativeSource))
    .resize(1100, 1100, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 88, effort: 5 })
    .toFile(path.join(heroDir, targetName));
}

await sharp(path.join(postsRoot, 'DM/feed.png'))
  .resize(1200, 630, { fit: 'cover', position: 'attention' })
  .jpeg({ quality: 88, progressive: true })
  .toFile(path.join(siteRoot, 'assets', 'abrasus-og.jpg'));

console.log('Assets preparados em assets/branding, assets/hero e assets/abrasus-og.jpg');
