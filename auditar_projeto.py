import os
import subprocess
import json

def rodar_comando(comando):
    try:
        resultado = subprocess.run(comando, shell=True, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        return resultado.stdout.strip()
    except subprocess.CalledProcessError as e:
        return f"Erro ao rodar comando: {e.stderr.strip()}"

def auditoria_completa():
    print("INICIANDO AUDITORIA CRUZADA (Cartographer + Git + Lovable)...\n")
    relatorio = []

    status_git = rodar_comando("git status --short")
    relatorio.append("### 1. Alterações Locais Não Comitadas (Presas no PC/Claude)")
    if status_git:
        relatorio.append("Arquivos modificados localmente que NÃO foram para o repositório/Lovable:")
        relatorio.append(f"```\n{status_git}\n```")
    else:
        relatorio.append("Tudo limpo. Nenhum código solto localmente.")

    commits_pendentes = rodar_comando("git log @{u}..HEAD --oneline")
    relatorio.append("\n### 2. Commits Locais Não Sincronizados com o Remote (Lovable)")
    if "Erro" not in commits_pendentes and commits_pendentes:
        relatorio.append("Os seguintes commits foram feitos localmente mas NÃO subiram para o Lovable ainda:")
        relatorio.append(f"```\n{commits_pendentes}\n```")
    else:
        relatorio.append("Todos os commits locais já foram enviados (Push efetuado).")

    relatorio.append("\n### 3. Análise do Cartographer / Arquitetura")
    arquivos_mapa = [f for f in os.listdir('.') if 'cartographer' in f.lower() or 'mapa' in f.lower()]
    if arquivos_mapa:
        relatorio.append(f"Arquivos de mapeamento encontrados: {', '.join(arquivos_mapa)}")
    else:
        relatorio.append("Nenhum arquivo estático do Cartographer achado na raiz. O Claude usará mapeamento de árvore em tempo de execução.")

    print("Varrendo arquivos em busca de codigos incompletos...")
    placeholders = []
    for raiz, dirs, arquivos in os.walk('.'):
        if 'node_modules' in raiz or '.git' in raiz:
            continue
        for arquivo in arquivos:
            if arquivo.endswith(('.js', '.ts', '.tsx', '.py', '.html', '.css', '.vue')):
                caminho_completo = os.path.join(raiz, arquivo)
                try:
                    with open(caminho_completo, 'r', encoding='utf-8') as f:
                        conteudo = f.read()
                        if "TODO" in conteudo or "TODO:" in conteudo or "placeholder" in conteudo.lower() or "codigo restante" in conteudo.lower():
                            placeholders.append(caminho_completo)
                except Exception:
                    pass

    relatorio.append("\n### 4. Códigos Parciais ou Abandonados (Placeholders/TODOs)")
    if placeholders:
        relatorio.append("Arquivos que possuem código incompleto ou marcas de 'fazer depois':")
        for p in placeholders:
            relatorio.append(f"- `{p}`")
    else:
        relatorio.append("Nenhum placeholder ou código incompleto detectado nos arquivos analisados.")

    with open("auditoria_prompts.md", "w", encoding="utf-8") as f:
        f.write("\n".join(relatorio))

    print("\nAuditoria Concluida! Relatorio salvo em 'auditoria_prompts.md'.")

if __name__ == "__main__":
    auditoria_completa()
