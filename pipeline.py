import os
import re
import shutil
import subprocess
import sys

BRANCHES_PROIBIDAS = {"main", "master"}

USO = """Uso: python3 pipeline.py [--dry-run] [--help] ["mensagem de commit"]

Valida e publica a branch ATUAL (nunca main/master). O merge na main é
aprovado por humano no GitHub.

Passos: varre marcadores de entrega incompleta, roda build e typecheck, confere
branch/merge/.env, faz git add + commit e git push da branch atual.

  --dry-run   Roda só as conferências que não alteram nada (varredura, branch,
              merge em andamento, .env) e mostra o que seria commitado e
              enviado. Não roda build/typecheck, não faz add, commit nem push.
  -h, --help  Mostra esta ajuda e sai.

Sem mensagem, usa "auto: entrega na branch <branch>".
"""


def erro(texto=""):
    print(texto, file=sys.stderr)


def executar(comando, mensagem_erro):
    """Roda um comando SEM shell: `comando` é sempre uma lista de argumentos."""
    try:
        resultado = subprocess.run(
            comando,
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )
        return resultado.stdout.strip()
    except subprocess.CalledProcessError as e:
        erro(f"ERRO: {mensagem_erro}\n")
        detalhe = (e.stderr or e.stdout or "").strip()
        erro(f"Detalhes técnicos:\n{detalhe}")
        sys.exit(1)


def ferramenta():
    if shutil.which("bun") and (os.path.exists("bun.lock") or os.path.exists("bunfig.toml")):
        return "bun"
    return "npm"


SKIP_DIRS = {
    "node_modules", ".git", ".next", "dist", "build", "venv",
    "__pycache__", ".output", ".vercel", "archive", "output",
}
EXTENSOES = (".js", ".ts", ".tsx", ".py", ".html", ".css", ".vue", ".go", ".java")
# "TODO" em maiúsculas também é a palavra portuguesa ("TODO campo", "TODO o
# perfil"), que aparece em comentários e nomes de teste deste repositório. Só
# contam como marcador de entrega incompleta as formas de código: `TODO:`,
# `FIXME(...)` ou o marcador abrindo a própria linha de comentário.
PADROES = (
    re.compile(r"\b(?:TODO|FIXME)\s*[:(]"),
    re.compile(r"^(?://+|/\*+|\*|#)\s*(?:TODO|FIXME)\b"),
    re.compile(r"codigo restante", re.IGNORECASE),
    re.compile(r"código restante", re.IGNORECASE),
)


def linha_incompleta(linha):
    texto = linha.strip()
    if not texto:
        return False
    baixa = texto.lower()
    if "placeholder=" in baixa or "placeholder:" in baixa:
        return False
    return any(padrao.search(texto) for padrao in PADROES)


def sensivel(linha_status):
    caminho = linha_status[3:].strip().strip('"')
    nome = os.path.basename(caminho.split(" -> ")[-1])
    if nome == ".env.example":
        return False
    return nome == ".env" or nome.startswith(".env.")


def varrer_marcadores():
    achados = []
    for raiz, dirs, arquivos in os.walk("."):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        for arquivo in arquivos:
            # Os próprios varredores citam os marcadores como dado, não como pendência.
            if arquivo in ("pipeline.py", "auditar_projeto.py") or not arquivo.endswith(EXTENSOES):
                continue
            caminho = os.path.join(raiz, arquivo)
            try:
                with open(caminho, "r", encoding="utf-8") as f:
                    for numero, linha in enumerate(f, 1):
                        if linha_incompleta(linha):
                            achados.append(f"{caminho}:{numero}: {linha.strip()[:160]}")
            except OSError:
                pass
    return achados


def ler_argumentos(argv):
    """Devolve (dry_run, mensagem). `--help` imprime o uso e sai com 0."""
    dry_run = False
    mensagem = None
    for arg in argv:
        if arg in ("-h", "--help"):
            print(USO)
            sys.exit(0)
        if arg == "--dry-run":
            dry_run = True
        elif arg.startswith("-") and mensagem is None:
            erro(f"ERRO: opção desconhecida: {arg}\n")
            erro(USO)
            sys.exit(2)
        elif mensagem is None:
            mensagem = arg
        else:
            erro("ERRO: informe uma única mensagem de commit (use aspas).")
            sys.exit(2)
    return dry_run, mensagem


def main(argv):
    dry_run, mensagem = ler_argumentos(argv)

    if dry_run:
        print("INICIANDO PIPELINE EM MODO --dry-run (nada será alterado, commitado nem enviado)\n")
    else:
        print("INICIANDO PIPELINE (build + typecheck -> branch atual; o merge é aprovado por humano no GitHub)\n")

    print("1/5 Varrendo código por tarefas incompletas...")
    achados = varrer_marcadores()
    if achados:
        erro("ERRO: Existem marcadores de entrega incompleta:")
        for item in achados[:40]:
            erro(f"  - {item}")
        if len(achados) > 40:
            erro(f"  - ... e mais {len(achados) - 40}")
        erro("\nPipeline abortado. Finalize esses pontos antes de subir.")
        sys.exit(1)
    print("Nenhum marcador TODO/FIXME/código restante detectado.")

    print("\n2/5 Cartographer não é dependência deste repositório. Seguindo.")

    print("\n3/5 Validando build e tipos...")
    if not os.path.exists("package.json"):
        erro("ERRO: package.json não encontrado na raiz.")
        sys.exit(1)
    cmd = ferramenta()
    if dry_run:
        print(f"--dry-run: pulando `{cmd} run build` e `{cmd} run typecheck`.")
    else:
        print(f"App TanStack Start/Vite detectado. Comando: {cmd}")
        executar([cmd, "run", "build"], "O build FALHOU. Corrija sintaxe, imports ou erro do Vite antes do push.")
        print("Build concluído.")
        executar([cmd, "run", "typecheck"], "O typecheck FALHOU. Front e server TypeScript compartilham o mesmo tsc.")
        print("Typecheck concluído.")

    print("\n4/5 Preparando a branch atual...")
    branch_atual = executar(["git", "branch", "--show-current"], "Falha ao detectar a branch atual.")
    if not branch_atual or branch_atual in BRANCHES_PROIBIDAS:
        erro(
            "ERRO: rode o pipeline numa branch de trabalho (não em "
            f"{' ou '.join(sorted(BRANCHES_PROIBIDAS))} nem em HEAD solto). "
            "O merge na main é feito por aprovação humana no GitHub."
        )
        sys.exit(1)
    print(f"Branch atual: {branch_atual}. Sem troca de branch.")

    # Merge em andamento com conflito não resolvido: `git add .` marcaria o
    # arquivo como resolvido sem checar o conteúdo, e os marcadores de conflito
    # (<<<<<<<, =======, >>>>>>>) poderiam ser commitados literalmente.
    resultado_merge = subprocess.run(
        ["git", "rev-parse", "--verify", "MERGE_HEAD"],
        capture_output=True, text=True,
    )
    if resultado_merge.returncode == 0:
        saida_conflitos = executar(
            ["git", "diff", "--name-only", "--diff-filter=U"], "Falha ao checar conflitos de merge."
        )
        arquivos_em_conflito = [l for l in saida_conflitos.splitlines() if l.strip()]
        if arquivos_em_conflito:
            erro("ERRO: há conflitos de merge não resolvidos:")
            for item in arquivos_em_conflito:
                erro(f"  - {item}")
            erro("\nResolva os conflitos antes de rodar o pipeline. Ele não resolve, nem comita, nem aborta o merge.")
            sys.exit(1)
        print("Merge em andamento (MERGE_HEAD presente), sem arquivos não resolvidos. Seguindo.")

    status = executar(["git", "status", "--porcelain"], "Falha ao ler o status do Git.")
    if any(sensivel(l) for l in status.splitlines() if l.strip()):
        erro("ERRO: há arquivo .env no status. Commit abortado.")
        sys.exit(1)

    msg = mensagem if mensagem is not None else f"auto: entrega na branch {branch_atual}"

    if dry_run:
        print("\n--dry-run: o que o pipeline faria agora:")
        if status.strip():
            print("  git add . incluiria:")
            for linha in status.splitlines():
                print(f"    {linha}")
            print(f"  git commit -m {msg!r}")
        else:
            print("  Nenhuma alteração local pendente: não haveria commit.")
        print(f"  git push -u origin {branch_atual}")
        print("\n--dry-run concluído: nada foi alterado.")
        return

    if not status.strip():
        print("Nenhuma alteração local pendente.")
    else:
        executar(["git", "add", "."], "Falha ao adicionar arquivos ao staging.")
        executar(["git", "commit", "-m", msg], "Falha ao realizar o commit.")
        print(f"Commit em {branch_atual}: {msg}")

    print(f"\n5/5 Push para origin {branch_atual}...")
    executar(["git", "push", "-u", "origin", branch_atual], f"Falha ao enviar para origin {branch_atual}.")
    print(f"\nPublicado em {branch_atual}. Abra/atualize a PR no GitHub para aprovação e merge.")


if __name__ == "__main__":
    main(sys.argv[1:])
