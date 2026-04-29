ABRASUS com painel administrativo

Arquivos para subir no GitHub Pages:
- index.html
- admin.html
- abrasus-assets
- .nojekyll

Antes de testar uploads:
1. No Supabase, confira se o SQL das tabelas ja foi executado.
2. No SQL Editor, execute tambem o arquivo supabase_storage_setup.sql.
3. Em Authentication > URL Configuration:
   - Site URL: https://abrasusprogramadocuidado.github.io/ABRAsus-/
   - Redirect URLs:
     https://abrasusprogramadocuidado.github.io/ABRAsus-/admin.html
     https://abrasusprogramadocuidado.github.io/ABRAsus-/**

Como acessar:
- Site publico: https://abrasusprogramadocuidado.github.io/ABRAsus-/
- Painel admin: https://abrasusprogramadocuidado.github.io/ABRAsus-/admin.html

Login:
- E-mail/senha: funciona se o usuario existir no Supabase Auth.
- Google: so funciona depois de ativar o provider Google no Supabase.

Observacao:
- Panfletos do Supabase aparecem no site publico automaticamente quando estiverem publicados e quando a data de publicacao ja tiver chegado.
- Panfletos com data futura ficam agendados.
- O panfleto local de acidente ofidico continua como fallback no index.html.
