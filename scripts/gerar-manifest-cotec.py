#!/usr/bin/env python3
"""Gera cotec/manifest.json: a lista de tudo que existe dentro de cotec/,
com tamanho e as datas de publicacao tiradas do historico do git.

Uso:
    python3 scripts/gerar-manifest-cotec.py
    python3 scripts/gerar-manifest-cotec.py --conferir   # nao escreve, so avisa se esta desatualizado

A pagina cotec/index.html le esse arquivo. Rode depois de adicionar arquivos
(ou deixe o GitHub Actions rodar sozinho a cada push).
"""

import json
import os
import subprocess
import sys
from datetime import datetime, timezone

PASTA_RAIZ = "cotec"
ARQUIVO_SAIDA = os.path.join(PASTA_RAIZ, "manifest.json")
INFO_PASTA = "_info.json"

# ignorados em qualquer nivel
IGNORAR_SEMPRE = {INFO_PASTA, ".DS_Store", "Thumbs.db", "desktop.ini", ".gitkeep"}
# ignorados so na raiz de cotec/ (sao a propria pagina e as instrucoes)
IGNORAR_NA_RAIZ = {"index.html", "manifest.json", "README.md"}


def git(*args):
    r = subprocess.run(
        ["git", "-c", "core.quotepath=false", *args],
        cwd=REPO, capture_output=True, text=True, check=False,
    )
    return r.stdout


def repo_raiz():
    r = subprocess.run(
        ["git", "rev-parse", "--show-toplevel"],
        capture_output=True, text=True, check=False,
        cwd=os.path.dirname(os.path.abspath(__file__)),
    )
    if r.returncode != 0:
        print("erro: nao estou dentro de um repositorio git", file=sys.stderr)
        sys.exit(1)
    return r.stdout.strip()


REPO = repo_raiz()


def datas_do_historico():
    """Primeira e ultima aparicao de cada caminho no historico do git."""
    saida = git("log", "--reverse", "--format=%x00%cI", "--name-only", "--", PASTA_RAIZ)
    primeira, ultima = {}, {}
    data = None
    for linha in saida.splitlines():
        if linha.startswith("\x00"):
            data = linha[1:].strip()
        elif linha.strip() and data:
            caminho = linha.strip()
            primeira.setdefault(caminho, data)
            ultima[caminho] = data
    return primeira, ultima


def iso_do_disco(caminho_abs):
    ts = os.path.getmtime(caminho_abs)
    return datetime.fromtimestamp(ts, timezone.utc).astimezone().isoformat(timespec="seconds")


def ler_info(caminho_abs):
    alvo = os.path.join(caminho_abs, INFO_PASTA)
    if not os.path.isfile(alvo):
        return {}
    try:
        with open(alvo, encoding="utf-8") as fp:
            dados = json.load(fp)
        return dados if isinstance(dados, dict) else {}
    except (OSError, ValueError) as erro:
        print(f"aviso: {alvo} ignorado ({erro})", file=sys.stderr)
        return {}


def extensao(nome):
    return nome.rsplit(".", 1)[-1].lower() if "." in nome[1:] else ""


def varrer():
    base = os.path.join(REPO, PASTA_RAIZ)
    if not os.path.isdir(base):
        print(f"erro: pasta {PASTA_RAIZ}/ nao existe", file=sys.stderr)
        sys.exit(1)

    primeira, ultima = datas_do_historico()
    arquivos, pastas = [], []

    for dir_abs, subdirs, nomes in os.walk(base):
        subdirs[:] = sorted(d for d in subdirs if not d.startswith("."))
        rel_dir = os.path.relpath(dir_abs, base).replace(os.sep, "/")
        if rel_dir == ".":
            rel_dir = ""

        if rel_dir:
            info = ler_info(dir_abs)
            pastas.append({
                "caminho": rel_dir,
                "nome": os.path.basename(rel_dir),
                "pai": os.path.dirname(rel_dir),
                "titulo": info.get("titulo") or info.get("title") or None,
                "descricao": info.get("descricao") or info.get("description") or None,
                "data": info.get("data") or None,
                "ordem": info.get("ordem"),
                "destaque": bool(info.get("destaque")),
            })
            info_arquivos = info.get("arquivos") if isinstance(info.get("arquivos"), dict) else {}
        else:
            info_arquivos = ler_info(dir_abs).get("arquivos") or {}

        for nome in sorted(nomes):
            if nome.startswith(".") or nome in IGNORAR_SEMPRE:
                continue
            if not rel_dir and nome in IGNORAR_NA_RAIZ:
                continue

            rel = f"{rel_dir}/{nome}" if rel_dir else nome
            caminho_git = f"{PASTA_RAIZ}/{rel}"
            caminho_abs = os.path.join(dir_abs, nome)
            extra = info_arquivos.get(nome) if isinstance(info_arquivos.get(nome), dict) else {}

            arquivos.append({
                "caminho": rel,
                "nome": nome,
                "pasta": rel_dir,
                "ext": extensao(nome),
                "bytes": os.path.getsize(caminho_abs),
                "publicado_em": primeira.get(caminho_git) or iso_do_disco(caminho_abs),
                "atualizado_em": ultima.get(caminho_git) or iso_do_disco(caminho_abs),
                "versionado": caminho_git in ultima,
                "titulo": extra.get("titulo") or extra.get("title") or None,
                "descricao": extra.get("descricao") or extra.get("description") or None,
            })

    arquivos.sort(key=lambda a: (a["publicado_em"], a["caminho"]), reverse=True)
    pastas.sort(key=lambda p: p["caminho"])

    # a data de uma pasta e a do arquivo mais recente dentro dela
    for pasta in pastas:
        dentro = [a for a in arquivos if a["pasta"] == pasta["caminho"] or a["pasta"].startswith(pasta["caminho"] + "/")]
        pasta["qtd_arquivos"] = len(dentro)
        pasta["bytes"] = sum(a["bytes"] for a in dentro)
        pasta["publicado_em"] = min((a["publicado_em"] for a in dentro), default=None)
        pasta["atualizado_em"] = max((a["atualizado_em"] for a in dentro), default=None)

    commit = git("rev-parse", "--short", "HEAD").strip() or None

    return {
        "schema": 1,
        "gerado_em": datetime.now(timezone.utc).astimezone().isoformat(timespec="seconds"),
        "raiz": PASTA_RAIZ,
        "commit": commit,
        "total_arquivos": len(arquivos),
        "total_pastas": len(pastas),
        "pastas": pastas,
        "arquivos": arquivos,
    }


def sem_o_timestamp(dados):
    copia = dict(dados)
    copia.pop("gerado_em", None)
    copia.pop("commit", None)
    return copia


def main():
    conferir = "--conferir" in sys.argv or "--check" in sys.argv
    novo = varrer()
    destino = os.path.join(REPO, ARQUIVO_SAIDA)

    atual = None
    if os.path.isfile(destino):
        try:
            with open(destino, encoding="utf-8") as fp:
                atual = json.load(fp)
        except ValueError:
            atual = None

    igual = atual is not None and sem_o_timestamp(atual) == sem_o_timestamp(novo)

    if conferir:
        if igual:
            print("manifest em dia")
            return 0
        print("manifest desatualizado: rode python3 scripts/gerar-manifest-cotec.py", file=sys.stderr)
        return 1

    if igual:
        print(f"manifest em dia ({novo['total_arquivos']} arquivos, {novo['total_pastas']} pastas)")
        return 0

    with open(destino, "w", encoding="utf-8") as fp:
        json.dump(novo, fp, ensure_ascii=False, indent=2)
        fp.write("\n")
    print(f"{ARQUIVO_SAIDA} escrito: {novo['total_arquivos']} arquivos, {novo['total_pastas']} pastas")
    return 0


if __name__ == "__main__":
    sys.exit(main())
