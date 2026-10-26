import { readFile, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';

const file = new URL('../index.html', import.meta.url);
const rebuildFromHead = process.argv.includes('--from-head');
let html = rebuildFromHead
  ? execFileSync('git', ['show', 'HEAD:index.html'], { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 })
  : await readFile(file, 'utf8');

if (!rebuildFromHead && html.includes('data-refresh="abrasus-vibrante-2026"')) {
  console.log('A atualização visual já foi aplicada.');
  process.exit(0);
}

const seo = `<title>AbraSUS | Informação e educação em saúde — PIT HDT-UFT</title>
<meta name="description" content="Conheça o AbraSUS, projeto de iniciação tecnológica do HDT-UFT, e acesse panfletos gratuitos com informação em saúde baseada no Ministério da Saúde e nos PCDTs.">
<meta name="keywords" content="AbraSUS, PIT, HDT-UFT, panfletos educativos, saúde, Ministério da Saúde, PCDT, prevenção, autocuidado, Araguaína, Tocantins">
<meta name="author" content="AbraSUS — PIT HDT-UFT">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="google-site-verification" content="a7SPSUnmpS5xKXXU5toE-p13Plepyb4bm_mk2k1yYSA">
<meta name="theme-color" content="#0757a7">
<link rel="canonical" href="https://abrasusprogramadocuidado.github.io/ABRAsus-/">
<link rel="sitemap" type="application/xml" href="https://abrasusprogramadocuidado.github.io/ABRAsus-/sitemap.xml">
<link rel="icon" type="image/png" href="assets/branding/abrasus-logo.png">
<meta property="og:type" content="website">
<meta property="og:locale" content="pt_BR">
<meta property="og:site_name" content="AbraSUS">
<meta property="og:title" content="AbraSUS | Informação que aproxima, educação que cuida">
<meta property="og:description" content="Projeto de iniciação tecnológica do HDT-UFT com materiais gratuitos de educação em saúde para toda a comunidade.">
<meta property="og:url" content="https://abrasusprogramadocuidado.github.io/ABRAsus-/">
<meta property="og:image" content="https://abrasusprogramadocuidado.github.io/ABRAsus-/assets/abrasus-og.jpg">
<meta property="og:image:alt" content="AbraSUS — informação, educação e saúde">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="AbraSUS | Informação e educação em saúde">
<meta name="twitter:description" content="Panfletos educativos gratuitos produzidos pelo projeto PIT do HDT-UFT.">
<meta name="twitter:image" content="https://abrasusprogramadocuidado.github.io/ABRAsus-/assets/abrasus-og.jpg">
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://abrasusprogramadocuidado.github.io/ABRAsus-/#website",
      "url": "https://abrasusprogramadocuidado.github.io/ABRAsus-/",
      "name": "AbraSUS",
      "description": "Projeto de iniciação tecnológica do HDT-UFT com materiais gratuitos de educação em saúde.",
      "inLanguage": "pt-BR",
      "publisher": { "@id": "https://abrasusprogramadocuidado.github.io/ABRAsus-/#organization" }
    },
    {
      "@type": "Organization",
      "@id": "https://abrasusprogramadocuidado.github.io/ABRAsus-/#organization",
      "name": "AbraSUS — PIT HDT-UFT",
      "url": "https://abrasusprogramadocuidado.github.io/ABRAsus-/",
      "logo": "https://abrasusprogramadocuidado.github.io/ABRAsus-/assets/branding/abrasus-logo.png",
      "description": "Iniciativa de educação em saúde vinculada ao Programa de Iniciação Tecnológica do HDT-UFT."
    }
  ]
}
</script>`;

html = html.replace(
  /<title>[\s\S]*?<meta name="twitter:image"[^>]*>/,
  seo
);

html = html.replace(
  '</style>',
  '</style>\n<link rel="stylesheet" href="assets/site-refresh.css?v=20261026b" data-refresh="abrasus-vibrante-2026">'
);

html = html.replace(
  '<li><a href="#sobre">Sobre</a></li>',
  '<li><a href="#sobre">Sobre</a></li>\n      <li><a href="#projeto">Projeto</a></li>'
);

const hero = `<!-- HERO -->
<section id="inicio" class="home-hero" aria-labelledby="hero-titulo">
  <div class="hero-inner">
    <div class="hero-conteudo">
      <div class="hero-badge">Projeto PIT · HDT-UFT · 2026–2027/1</div>
      <h1 id="hero-titulo">Informação que aproxima. <span class="hero-destaque">Educação que cuida.</span></h1>
      <p class="hero-sub">O AbraSUS transforma orientações oficiais de saúde em materiais claros, bonitos e gratuitos para ajudar a comunidade a reconhecer sinais de alerta, prevenir doenças e buscar cuidado no momento certo.</p>
      <div class="hero-acoes">
        <a href="#panfletos" class="btn-primario">Explorar os panfletos</a>
        <a href="#projeto" class="btn-secundario">Conhecer o projeto</a>
      </div>
      <div class="hero-trust" aria-label="Diferenciais do projeto">
        <span>Linguagem acessível</span>
        <span>Fontes oficiais</span>
        <span>Acesso gratuito</span>
      </div>
    </div>

    <div class="hero-visual" aria-label="Identidade visual do AbraSUS">
      <div class="hero-showcase hero-brand-card">
        <div class="hero-slides" aria-live="polite">
          <figure class="hero-slide ativo"><img src="assets/branding/abrasus-logo.png" alt="Logo do projeto AbraSUS"></figure>
        </div>
        <div class="hero-carousel-bar">
          <strong class="hero-empty-label">Novos materiais em breve</strong>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- SOBRE -->`;

html = html.replace(/<!-- HERO -->[\s\S]*?<!-- SOBRE -->/, hero);

const project = `<!-- PROJETO PIT -->
<section id="projeto" class="projeto-vibrante" aria-labelledby="projeto-titulo">
  <div class="projeto-container">
    <span class="projeto-eyebrow">Quem faz o AbraSUS</span>
    <h2 id="projeto-titulo">Ciência, cuidado e tecnologia a serviço da comunidade</h2>
    <p class="projeto-intro">O AbraSUS integra o Programa de Iniciação Tecnológica (PIT) do Hospital de Doenças Tropicais de Araguaína — HDT-UFT, no ciclo 2026–2027/1. O projeto aproxima o conhecimento em saúde do dia a dia das pessoas por meio de conteúdo visual, direto e responsável.</p>

    <div class="projeto-grid">
      <article class="projeto-card">
        <span class="projeto-card-numero" aria-hidden="true">01</span>
        <h3>Orientação científica</h3>
        <p><strong>Professora Carolina Galgane Lage Miranda</strong><br>Orientação acadêmica e acompanhamento científico do projeto.</p>
      </article>
      <article class="projeto-card">
        <span class="projeto-card-numero" aria-hidden="true">02</span>
        <h3>Bolsista e autor principal</h3>
        <p><strong>João Gabriel Jacinto</strong><br>Pesquisa, produção e adaptação dos materiais educativos para a comunidade.</p>
      </article>
      <article class="projeto-card">
        <span class="projeto-card-numero" aria-hidden="true">03</span>
        <h3>Compromisso público</h3>
        <p>Informação gratuita, acessível e pensada para apoiar — nunca substituir — a avaliação de profissionais de saúde.</p>
      </article>
    </div>

    <div class="projeto-fontes">
      <span class="projeto-fontes-selo" aria-hidden="true">✓</span>
      <div>
        <strong>Conteúdo construído com fontes confiáveis</strong>
        <span>Ministério da Saúde, Protocolos Clínicos e Diretrizes Terapêuticas (PCDTs) e outras referências oficiais pertinentes a cada tema.</span>
      </div>
    </div>
  </div>
</section>

`;

html = html.replace('<!-- PANFLETOS -->', `${project}<!-- PANFLETOS -->`);
html = html.replace('© 2025 ABRASUS', '© 2026 AbraSUS');
html = html.replace('</body>', '<script src="assets/site-refresh.js?v=20261026b" defer></script>\n</body>');

// Evita finais de linha mistos nos pontos de inserção de um arquivo legado em CRLF.
for (const insertedLine of [
  '</script>',
  '<link rel="stylesheet" href="assets/site-refresh.css?v=20261026b" data-refresh="abrasus-vibrante-2026">',
  '      <li><a href="#projeto">Projeto</a></li>',
  '    <span>© 2026 AbraSUS · Programa do Cuidado Contínuo · HDT-UFT · Araguaína – TO</span>',
  '<script src="assets/site-refresh.js?v=20261026b" defer></script>'
]) {
  html = html.replace(`${insertedLine}\r\n`, `${insertedLine}\n`);
}

await writeFile(file, html, 'utf8');
console.log('Atualização visual e de indexação aplicada ao index.html.');
