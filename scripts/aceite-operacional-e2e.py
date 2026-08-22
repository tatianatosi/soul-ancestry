#!/usr/bin/env python3
"""
Harness E2E autenticado — passos 3 a 8 do Aceite Final Operacional.

Executa o roteiro definido em src/lib/aceite-e2e-passos.ts contra o app rodando
em http://localhost:8080, com a sessão da Proprietária restaurada a partir das
variáveis de ambiente injetadas pelo preview (LOVABLE_BROWSER_SUPABASE_*).

Gera em output/aceite-e2e/:
  - pN-*.png              capturas autenticadas de cada passo
  - auditoria.json        contagens e amostras das tabelas de auditoria (antes/depois)
  - relatorio.md          relatório de aceite consolidado

Nenhuma ação externa (comunicação, cobrança, publicação, pesquisa externa ou
integração) é executada: o roteiro é somente leitura/navegação.

Uso:  python3 scripts/aceite-operacional-e2e.py
"""

from __future__ import annotations

import asyncio
import json
import os
import re
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

BASE_URL = os.environ.get("ACEITE_BASE_URL", "http://localhost:8080")
ROOT = Path(__file__).resolve().parent.parent
SAIDA = ROOT / "output" / "aceite-e2e"
ROTEIRO_TS = ROOT / "src" / "lib" / "aceite-e2e-passos.ts"


def carregar_passos() -> list[dict]:
    """Lê o roteiro canônico direto do módulo TypeScript (fonte única)."""
    texto = ROTEIRO_TS.read_text(encoding="utf-8")
    canonico = re.search(r'CASO_CANONICO = "([^"]+)"', texto).group(1)
    legado = re.search(r'CASO_LEGADO = "([^"]+)"', texto).group(1)
    passos = []
    for bloco in re.findall(r"\{\s*id: \"(P\d)\".*?\},\n", texto, re.S):
        pass
    for m in re.finditer(
        r'id: "(?P<id>P\d)",\s*numero: (?P<numero>\d+),\s*titulo: "(?P<titulo>[^"]+)",\s*'
        r"rota: (?P<rota>[`\"][^`\"]+[`\"]),\s*"
        r"evidenciaTexto: (?P<ev>[A-Z_]+|\"[^\"]*\"),\s*"
        r'captura: "(?P<captura>[^"]+)",\s*'
        r"tabelasAuditoria: \[(?P<tabelas>[^\]]*)\]",
        texto,
        re.S,
    ):
        rota = m.group("rota").strip("`\"")
        rota = rota.replace("${CASO_LEGADO}", legado).replace(
            "${CASO_CANONICO}", canonico
        )
        ev = m.group("ev")
        if ev == "CASO_CANONICO":
            ev = canonico
        elif ev == "CASO_LEGADO":
            ev = legado
        else:
            ev = ev.strip('"')
        passos.append(
            {
                "id": m.group("id"),
                "numero": int(m.group("numero")),
                "titulo": m.group("titulo"),
                "rota": rota,
                "evidencia": ev,
                "captura": m.group("captura"),
                "tabelas": re.findall(r'"([^"]+)"', m.group("tabelas")),
            }
        )
    if len(passos) != 6:
        raise SystemExit(f"roteiro inválido: {len(passos)} passos lidos, esperados 6")
    return passos


def ler_env_local(nome: str) -> str | None:
    valor = os.environ.get(nome)
    if valor:
        return valor
    env = ROOT / ".env"
    if env.exists():
        for linha in env.read_text(encoding="utf-8").splitlines():
            if linha.startswith(f"{nome}="):
                return linha.split("=", 1)[1].strip().strip('"')
    return None


def snapshot_auditoria(tabelas: list[str]) -> dict:
    """Conta linhas e coleta a última ocorrência de cada tabela de auditoria."""
    url = ler_env_local("VITE_SUPABASE_URL")
    chave = ler_env_local("VITE_SUPABASE_PUBLISHABLE_KEY")
    token = os.environ.get("LOVABLE_BROWSER_SUPABASE_ACCESS_TOKEN")
    if not (url and chave and token):
        return {t: {"erro": "sessao_indisponivel"} for t in tabelas}

    resultado: dict = {}
    for tabela in tabelas:
        alvo = f"{url}/rest/v1/{urllib.parse.quote(tabela)}?select=*&limit=1&order=created_at.desc"
        req = urllib.request.Request(alvo)
        req.add_header("apikey", chave)
        req.add_header("Authorization", f"Bearer {token}")
        req.add_header("Prefer", "count=exact")
        try:
            with urllib.request.urlopen(req, timeout=20) as resp:
                corpo = json.loads(resp.read().decode() or "[]")
                faixa = resp.headers.get("content-range", "*/0")
                resultado[tabela] = {
                    "total": faixa.split("/")[-1],
                    "ultimo": corpo[0] if corpo else None,
                }
        except Exception as exc:  # noqa: BLE001 — diagnóstico do harness
            resultado[tabela] = {"erro": type(exc).__name__}
    return resultado


async def executar() -> int:
    from playwright.async_api import async_playwright

    passos = carregar_passos()
    tabelas = sorted({t for p in passos for t in p["tabelas"]})
    SAIDA.mkdir(parents=True, exist_ok=True)

    status_auth = os.environ.get("LOVABLE_BROWSER_AUTH_STATUS", "no_supabase")
    antes = snapshot_auditoria(tabelas)
    resultados: list[dict] = []

    async with async_playwright() as p:
        navegador = await p.chromium.launch(headless=True)
        contexto = await navegador.new_context(
            viewport={"width": 1280, "height": 1800}
        )
        if cj := os.environ.get("LOVABLE_BROWSER_SUPABASE_COOKIES_JSON"):
            await contexto.add_cookies(
                [{**c, "url": BASE_URL} for c in json.loads(cj)]
            )
        pagina = await contexto.new_page()
        erros_console: list[str] = []
        pagina.on(
            "console",
            lambda m: erros_console.append(m.text) if m.type == "error" else None,
        )

        await pagina.goto(BASE_URL, wait_until="domcontentloaded")
        chave_sessao = os.environ.get("LOVABLE_BROWSER_SUPABASE_STORAGE_KEY")
        sessao = os.environ.get("LOVABLE_BROWSER_SUPABASE_SESSION_JSON")
        if chave_sessao and sessao:
            await pagina.evaluate(
                f"localStorage.setItem({json.dumps(chave_sessao)}, {json.dumps(sessao)})"
            )

        for passo in passos:
            registro = {**passo, "console_erros": []}
            marca = len(erros_console)
            try:
                await pagina.goto(
                    f"{BASE_URL}{passo['rota']}", wait_until="domcontentloaded"
                )
                await pagina.wait_for_timeout(2500)
                url_final = pagina.url
                conteudo = await pagina.content()
                autenticado = "/equipe/entrar" not in url_final
                registro["url_final"] = url_final
                registro["autenticado"] = autenticado
                registro["evidencia_visivel"] = passo["evidencia"] in conteudo
                registro["status"] = (
                    "APROVADO"
                    if autenticado and registro["evidencia_visivel"]
                    else "NAO_VERIFICADO"
                    if not autenticado
                    else "REPROVADO"
                )
            except Exception as exc:  # noqa: BLE001
                registro["status"] = "ERRO"
                registro["detalhe"] = f"{type(exc).__name__}: {exc}"
            caminho = SAIDA / passo["captura"]
            try:
                await pagina.screenshot(path=str(caminho))
                registro["captura_path"] = str(caminho.relative_to(ROOT))
            except Exception:  # noqa: BLE001
                registro["captura_path"] = None
            registro["console_erros"] = erros_console[marca:]
            resultados.append(registro)
            print(f"{passo['id']} {registro['status']} -> {passo['rota']}")

        await navegador.close()

    depois = snapshot_auditoria(tabelas)
    (SAIDA / "auditoria.json").write_text(
        json.dumps(
            {"status_auth": status_auth, "antes": antes, "depois": depois},
            indent=2,
            ensure_ascii=False,
            default=str,
        ),
        encoding="utf-8",
    )

    linhas = [
        "# Aceite Operacional — Passos 3 a 8 (E2E autenticado)",
        "",
        f"Execução: {datetime.now(timezone.utc).isoformat()}",
        f"Sessão do preview: `{status_auth}`",
        "",
        "| Passo | Título | Rota | Autenticado | Evidência | Status | Captura |",
        "| --- | --- | --- | --- | --- | --- | --- |",
    ]
    for r in resultados:
        linhas.append(
            f"| {r['id']} | {r['titulo']} | `{r['rota']}` | "
            f"{'sim' if r.get('autenticado') else 'não'} | "
            f"{'sim' if r.get('evidencia_visivel') else 'não'} | {r['status']} | "
            f"{r.get('captura_path') or '—'} |"
        )
    linhas += ["", "## Eventos de auditoria", "", "| Tabela | Antes | Depois |", "| --- | --- | --- |"]
    for t in tabelas:
        linhas.append(
            f"| {t} | {antes.get(t, {}).get('total', antes.get(t, {}).get('erro'))} "
            f"| {depois.get(t, {}).get('total', depois.get(t, {}).get('erro'))} |"
        )
    linhas += [
        "",
        "> Roteiro somente leitura: nenhuma ação externa (comunicação, cobrança,",
        "> publicação, pesquisa externa ou integração) foi executada.",
        "",
    ]
    (SAIDA / "relatorio.md").write_text("\n".join(linhas), encoding="utf-8")

    aprovados = sum(1 for r in resultados if r["status"] == "APROVADO")
    print(f"\n{aprovados}/{len(resultados)} passos aprovados — {SAIDA}/relatorio.md")
    if status_auth != "injected":
        print(
            "AVISO: sem sessão injetada — entre como Proprietária no preview e reexecute."
        )
        return 2
    return 0 if aprovados == len(resultados) else 1


if __name__ == "__main__":
    raise SystemExit(asyncio.run(executar()))
