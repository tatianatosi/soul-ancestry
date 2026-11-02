# PROMPT EXECUTIVO PARA O CLAUDE CODE: RESGATE CIRÚRGICO DAS PRS ANTIGAS
Status: aprovado pela Proprietária para execução direta
Versão: v1.0
Data: 2026-10-30
Responsável pela decisão: Tatiana Melani Tosi (Proprietária do Clube Ancestral)
Repositório: tatianatosi/soul-ancestry (branch main)

---

## 1. OBJETIVO DA MISSÃO
Muitas das PRs antigas carregam requisitos de negócio, motores de persistência e saneamento que foram solicitados pela Proprietária e nunca foram concluídos. 
O erro anterior foi tratá-las como "lixo com conflito" e sugerir descarte. 
A missão do Claude Code agora é realizar o **transplante cirúrgico** do conteúdo dessas PRs para a main, sem quebrar o layout aprovado do App Cliente nem regredir o sistema.

---

## 2. ORDEM DE EXECUÇÃO CIRÚRGICA (5 ETAPAS)

### ETAPA 1: Automação de Sync e Proteção Anti-Bot (PR #200)
- **Origem:** Branch `claude/automacao-sync` (PR #200).
- **Ação:** Fazer o merge do PR #200 na `main`.
- **Por que é prioritário:** Esta PR não altera `src/`. Ela adiciona o `Sync Guard` no GitHub Actions, impedindo que commits cegos de "Changes" do bot do Lovable sobrescrevam trabalho aprovado ou adicionem arquivos `.env`.

### ETAPA 2: Histórico Contratual e Cadastros Civis da Família Ana Luiza (PR #173)
- **Origem:** Branch `fix/ana-luiza-historico-contrato-2026-10-20` (PR #173).
- **Arquivo Vital:** `supabase/migrations/20261020150000_ana_luiza_historico_contrato_banco_antigo.sql`.
- **Ação:** 
  1. Extrair e versionar a migration em `supabase/migrations/`;
  2. Aplicar o SQL no banco Supabase: cria a tabela imutável `contract_history_imports` com as 6 versões de contrato, 84 validações e 20 eventos de revisão do banco antigo;
  3. Atualizar telefone de Ana e complementar dados civis (RG/órgão/datas) de Adair e Alice onde estava vazio.

### ETAPA 3: Saneamento de Documentos Fictícios (PR #151)
- **Origem:** Branch `claude/saneamento-documentos-ficticios` (PR #151).
- **Arquivo Vital:** `src/routes/portal/documentos.tsx`.
- **Ação:** 
  1. Resolver o conflito pontual de 1 arquivo;
  2. Remover os nomes hardcoded da família da Ana ("Friedmann-Reimer") que apareciam para clientes com acervo vazio;
  3. Preservar o vazio honesto acolhedor aprovado no Mockup de 17 páginas.

### ETAPA 4: Persistência Real com Releitura Pós-Gravação no Desk (PR #32)
- **Origem:** Branch `feat/pessoa-salvar-tarefa-continuidade` (PR #32).
- **Arquivo Vital:** `src/lib/pessoas-linhagens.functions.ts`.
- **Ação:**
  1. Transplantar a função `salvarRegistroG02`: após o UPDATE, reler o registro diretamente do banco pelo mesmo ID e comparar campo a campo antes de confirmar sucesso na tela;
  2. Manter a opção de criar tarefa vinculada imediatamente no módulo de Ops/Hoje;
  3. Isso resolve a queixa central da Proprietária de que edições no Desk não persistiam.

### ETAPA 5: Fechamento Seguro das PRs Redundantes
- Fechar PR #199 (redundante após PR #198).
- Arquivar branches antigas que tiveram seu conteúdo resgatado pelas etapas acima.
