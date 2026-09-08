# bielvitooor.github.io

Portfólio e currículo de **Gabriel Vítor Silva Brito** — desenvolvedor full stack
focado em **IA & agentes**, **automação de processos** e **infraestrutura de redes**.

🔗 https://bielvitooor.github.io

## Estrutura

| Arquivo | O que é |
| --- | --- |
| `index.html` | Portfólio completo — self-contained (CSS + JS inline), uma única requisição de documento |
| `cv.html` | Currículo em página própria, otimizado para impressão / exportar PDF (A4) |
| `img/` | Retrato, avatar e variações da logo em SVG |
| `TOPFY/` | Projeto TOPFY (integração com a API do Spotify) |

## Stack do site

HTML, CSS e JavaScript puro — sem framework, sem build step. Publicado
estaticamente via **GitHub Pages** direto da branch `main`.

Dependências externas (via CDN, só fontes e ícones):
- [Google Fonts](https://fonts.google.com) — Bricolage Grotesque, Inter, JetBrains Mono
- [Remix Icon](https://remixicon.com) 4.2.0

## Marca

Logo em `img/logo-mark.svg`, `img/logo-badge.svg` e `img/logo-full.svg`.
O símbolo é um **"G" orbital**: o arco aberto do G com um nó satélite —
referência a redes, agentes e sistemas conectados.

Paleta: `#0A0B0D` (base) · `#F2F3F5` (texto) · `#CFFF5E` (acento) · `#8B7CFF` (secundário)

## Rodar localmente

```bash
python3 -m http.server 8080
# http://localhost:8080
```
