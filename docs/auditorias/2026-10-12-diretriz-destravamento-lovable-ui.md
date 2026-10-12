# Diretriz Prática de Desconflito: Restauração Segura do Lovable e Isolamento do Claude

```yaml
status: aprovado
versao: v1.0
data: 2026-10-12
hora: 17:15 BRT
responsavel_pela_decisao: Proprietária do Clube Ancestral
classificacao: protocolo de destravamento operacional, salvaguarda de UI e isolamento de Git
caminho_sugerido_no_repositorio: docs/auditorias/2026-10-12-diretriz-destravamento-lovable-ui.md
fontes:
  - Captura de tela IMG_3093.jpeg (Modal de Conflito do Lovable às 15:45 / 15:03)
  - Repositório tatianatosi/soul-ancestry (main no commit 89da18c)
  - Commits do bot do Lovable: 0befe79, 98cc3e9
  - AGENTS.md (Regras de Convivência e Não-Regressão)
escopo: >
  Instruções imediatas e simples para a Proprietária destravar o Lovable pelo celular/desktop,
  recuperar os 4 commits de frontend salvos no backup e congelar o Claude Code para evitar novas sobrescritas.
premissas:
  - O Lovable protegeu os 4 commits de tela em um backup automático.
  - O Claude Code foi colocado em STANDBY TOTAL (proibido de commitar na main).
  - O frontend tem prioridade absoluta para a conclusão das 7 abas do App e telas do Desk.
criterio_de_aceite: >
  Restauração bem-sucedida do backup do Lovable;
  eliminação do modal de alerta;
  estabilização do ambiente para avanço contínuo do Design System.
```

## 1. Passo a Passo Imediato no seu Aplicativo / Celular (Lovable)

Olhando para a tela do seu print (**IMG_3093.jpeg**), faça exatamente o seguinte para recuperar seu trabalho:

1. **FECHE O MODAL NO "X" (Canto Superior Direito)**:
   - **NÃO clique no botão vermelho inferior** (*"Só redefina se o push tiver sido um erro"*).
   - Feche no **X** no topo.
2. **RESTAURE O SEU TRABALHO SALVO NO BACKUP**:
   - No menu lateral do Lovable, clique no ícone de **Histórico / Versões** (ícone de relógio ou *Version History*).
   - Localize o backup automático criado às **15:03** (ou o mais recente com a tag *"novo backup"*).
   - Clique em **"Restore" / "Restaurar este backup"**.
   - Se o Lovable perguntar para onde enviar o trabalho, escolha: **"Enviar para branch de sincronização separada"** (ele criará uma branch segura sem conflitar com o GitHub).

---

## 2. Ordem de Standby para o Claude Code (Congelamento de Backend)

O motivo pelo qual o Lovable recebeu essa mensagem foi porque o Claude Code e as PRs de documentação enviaram commits para a branch `main` enquanto você editava a interface.

Para que isso **NUNCA MAIS ACONTEÇA**:
- **O Claude Code está expressamente CONGELADO em STANDBY**.
- Ele está proibido de enviar qualquer commit ou fazer merge na branch `main` até que você aprove as 7 abas no Lovable.
- O backend de permissões, os testes (5.384 verdes) e as tabelas já estão 100% prontos e não precisam de nenhum toque no código.

---

## 3. Mensagem Pronta de Congelamento para o Claude Code (Terminal)

```markdown
ORDEM NORMATIVA: CONGELAMENTO TOTAL DE COMMITS E STANDBY ABSOLUTO
Proprietária: Tatiana Tosi (tati@pluggedresearch.com)
Repositório: tatianatosi/soul-ancestry

Determinação da Proprietária:

1. [PROIBIDO QUALQUER PUSH OU MERGE NO MAIN]:
   - Pushes concorrentes estão disparando alertas de conflito no Lovable e travando o trabalho de design da Proprietária.
   - O Claude Code está em STANDBY TOTAL. Não crie branches, não dê push, não faça commit e não faça merge no main.

2. [STATUS DE ENGENHARIA]:
   - O backend já está 100% estabilizado (PRs #143, #144, #145 e #146 integradas com 5.384 testes verdes).
   - A prioridade agora é única e exclusiva da Proprietária no Lovable (finalização visual das 7 abas e Desk).

Apenas confirme o recebimento desta ordem e permaneça inativo no terminal.
```
