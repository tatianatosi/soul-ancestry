import argparse
import os
import subprocess
import sys

RAIZ = os.path.dirname(os.path.abspath(__file__))

BRANCH_PADRAO = "claude/modest-carson-28pij2"
BRANCHES_PROIBIDAS = {"main", "master"}


def git(args):
    resultado = subprocess.run(
        ["git", "-C", RAIZ, *args],
        capture_output=True,
        text=True,
    )
    return resultado.returncode, resultado.stdout.strip(), resultado.stderr.strip()


def ferramenta():
    if os.path.exists(os.path.join(RAIZ, "bun.lock")) or os.path.exists(
        os.path.join(RAIZ, "bunfig.toml")
    ):
        return "bun"
    return "npm"


def executar_script_npm(nome_script, mensagem_erro):
    cmd = ferramenta()
    print(f"\n> {cmd} run {nome_script}")
    resultado = subprocess.run(
        [cmd, "run", nome_script],
        cwd=RAIZ,
    )
    if resultado.returncode != 0:
        print(f"\nERRO: {mensagem_erro}")
        sys.exit(1)


def main():
    parser = argparse.ArgumentParser(
        description="Validador local (typecheck + testes) para a branch de trabalho atual. "
        "Não altera branch, não comita, não faz push, não conclui nem aborta merge."
    )
    parser.add_argument(
        "--branch",
        default=BRANCH_PADRAO,
        help=f"Branch de trabalho esperada (padrão: {BRANCH_PADRAO}).",
    )
    args = parser.parse_args()

    branch_esperada = args.branch

    print("VALIDADOR LOCAL (typecheck + testes) — nenhuma operação Git é feita.\n")

    print("1/3 Conferindo a branch atual...")
    codigo, branch_atual, erro = git(["branch", "--show-current"])
    if codigo != 0:
        print(f"ERRO: não foi possível ler a branch atual.\n{erro}")
        sys.exit(1)

    if not branch_atual:
        print(
            "ERRO: HEAD destacado (nenhuma branch associada). "
            "Este script não troca de branch; resolva isso manualmente antes de rodar de novo."
        )
        sys.exit(1)

    if branch_atual in BRANCHES_PROIBIDAS:
        print(
            f"ERRO: branch atual é '{branch_atual}'. Este validador se recusa a rodar em "
            f"{' ou '.join(sorted(BRANCHES_PROIBIDAS))}. Troque para a branch de trabalho você mesma, "
            "fora deste script, se for isso que pretende."
        )
        sys.exit(1)

    if branch_atual != branch_esperada:
        print(
            f"ERRO: branch atual é '{branch_atual}', esperada '{branch_esperada}'. "
            "Use --branch NOME se esta divergência for intencional. Nenhuma troca de branch foi feita."
        )
        sys.exit(1)

    print(f"Branch confirmada: {branch_atual}")

    print("\n2/3 Verificando merge em andamento (informativo apenas)...")
    codigo, _, _ = git(["rev-parse", "--verify", "MERGE_HEAD"])
    if codigo == 0:
        codigo_conflitos, saida_conflitos, _ = git(["diff", "--name-only", "--diff-filter=U"])
        arquivos_em_conflito = [l for l in saida_conflitos.splitlines() if l.strip()]
        if arquivos_em_conflito:
            print("ERRO: há conflitos de merge não resolvidos:")
            for item in arquivos_em_conflito:
                print(f"  - {item}")
            print("\nResolva os conflitos antes de validar. Este script não resolve, não comita e não aborta o merge.")
            sys.exit(1)
        print(
            "Merge em andamento (MERGE_HEAD presente), sem arquivos não resolvidos. "
            "Seguindo com as validações; o merge não será concluído nem abortado por este script."
        )
    else:
        print("Nenhum merge em andamento.")

    print("\n3/3 Rodando typecheck e testes (não-interativo)...")
    executar_script_npm("typecheck", "O typecheck FALHOU. Corrija os erros de tipo antes de prosseguir.")
    executar_script_npm("test", "A suíte de testes FALHOU. Corrija os testes antes de prosseguir.")

    print("\nValidação local concluída: typecheck e testes passaram.")
    print("Nada foi commitado, enviado (push) ou alterado em branch/merge por este script.")


if __name__ == "__main__":
    main()
