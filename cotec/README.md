# cotec/ — material das aulas

A página <https://bielvitooor.github.io/cotec/> navega esta pasta. Ela lê
`manifest.json`, que é gerado a partir do histórico do git — daí saem as datas.

## Como subir uma aula

Crie uma pasta por aula e jogue os arquivos dentro:

```
cotec/
├─ aula-1/
│   ├─ index.html        → o slide (abre no navegador, em nova aba)
│   ├─ apostila.pdf      → documento (baixa ao clicar)
│   ├─ exercicios.docx   → documento (baixa ao clicar)
│   └─ _info.json        → opcional (título e descrição bonitos)
└─ aula-2/
    └─ slides.html
```

O que manda o comportamento do clique é a extensão:

| Extensão | Clique faz |
| --- | --- |
| `.html`, `.htm` | abre em nova aba (é o slide) |
| imagem, vídeo, áudio | abre em nova aba |
| `.pdf`, `.txt`, `.md`, código | **baixa** — com um botão de olho ao lado para ver no navegador |
| `.docx`, `.pptx`, `.xlsx`, `.zip`, resto | **baixa** |

O nome da pasta vira o título: `aula-1` → "Aula 1", `03-logica-de-programacao`
→ "03 logica de programacao". Para um título de verdade, use `_info.json`.

## `_info.json` (opcional)

```json
{
  "titulo": "Aula 1 — Lógica de programação",
  "descricao": "Variáveis, condicionais e os primeiros algoritmos.",
  "arquivos": {
    "index.html": { "titulo": "Slide da aula" },
    "apostila.pdf": { "titulo": "Apostila", "descricao": "28 páginas" }
  }
}
```

## Depois de subir

O GitHub Actions (`.github/workflows/cotec-manifest.yml`) regera o
`manifest.json` sozinho a cada push em `cotec/`. Nada a fazer.

Se preferir rodar na mão (ou testar local):

```bash
python3 scripts/gerar-manifest-cotec.py   # escreve cotec/manifest.json
python3 -m http.server 8080               # http://localhost:8080/cotec/
```

> Se o índice não existir, a página ainda funciona: ela lê a árvore do
> repositório pela API pública do GitHub — só sem as datas.
