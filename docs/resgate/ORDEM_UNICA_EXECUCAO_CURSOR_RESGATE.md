# ORDEM ÚNICA DE EXECUÇÃO — CURSOR
## Resgate do Clube Ancestral a partir do Mapa de Prompts

**Status:** instrução operacional única e vigente  
**Destinatário:** Cursor Agent trabalhando no repositório `tatianatosi/soul-ancestry`  
**Base de referência:** `Mapa_de_Resgate_Prompts_Clube_Ancestral_ate_2026-09-10.csv`  
**Objetivo:** estabilizar e recuperar o produto sem criar novos relatórios, novos modelos paralelos, migração ampla, limpeza destrutiva ou reexecução cega de prompts antigos.

---

## 0. Mandato

Você deve atuar como executor técnico de resgate do Clube Ancestral.

Não produza auditorias novas, diagnósticos extensos, planos genéricos, inventários repetidos, tela decorativa, mock permanente, novo dashboard isolado, reescrita total ou migrations destrutivas.

Use o mapa de resgate para classificar o que já existe e agir somente sobre o que é necessário para tornar a operação ativa funcional, verificável e coerente.

**Não pergunte por material que já está no repositório.** Procure silenciosamente em `docs/`, `AGENTS.md`, `.cursor/rules/`, `src/`, `supabase/`, histórico Git e arquivos do projeto.

---

## 1. Autoridade e premissas inegociáveis

1. O **Planejador** é a única fonte válida de planejamento e operação ativa.
2. As instruções explícitas mais recentes da proprietária do produto prevalecem sobre prompts antigos, documentos antigos, branches antigas, comentários de código e interpretações de agentes.
3. A matriz operacional legada, planilha mestre, DRE e reconciliação histórica do Asaas são **legado**. Não são fonte de verdade da operação presente.
4. Legado só pode ser preservado para histórico, auditoria ou migração controlada; jamais pode decidir prioridade atual, status atual, workflow, próxima ação, automação, dashboard operacional ou requisito ativo.
5. O núcleo do produto é o **motor unificado**, com o caso como unidade operacional central.
6. Não criar um segundo motor para resolver uma lacuna. Corrigir, completar ou conectar o motor canônico existente.
7. Documento, commit, branch, PR, mock ou teste isolado não equivalem a funcionalidade aceita.
8. Uma funcionalidade só pode ser considerada concluída quando seu caminho de usuário persiste, recarrega, respeita permissões e é demonstrável pela interface.

---

## 2. Proibições absolutas

Não executar:

- `git reset --hard`, `git clean`, `git restore .`, `git checkout HEAD -- .`, `rm -rf` ou qualquer descarte amplo;
- `DROP TABLE`, `TRUNCATE`, exclusão de bucket, exclusão de registros em massa ou migration destrutiva;
- push, merge, commit, deploy, force-push, exclusão de branch ou exclusão de arquivo sem autorização explícita da proprietária;
- importação da planilha mestre, DRE, matriz operacional legada ou reconciliação Asaas para preencher ou dirigir dados ativos;
- reexecução de prompts de “migração completa”, “remoção total de barreiras”, “zero travas” ou “reversão emergencial”;
- merge em bloco de PRs antigas;
- criação de novos módulos de marketing, financeiro, DRE, reconciliação, WhatsApp ou dashboards antes da estabilização do núcleo.

Não anunciar “feito” se houver apenas código, migration, tela, teste, commit ou documentação sem prova do fluxo completo.

---

## 3. Estados do mapa e ação correspondente

| Classificação no mapa | Ação obrigatória |
|---|---|
| EXECUTADO | Preservar. Testar somente o fluxo relacionado antes de alterar. Corrigir apenas falha comprovada. |
| EXECUTADO DOCUMENTAL | Arquivar como referência. Não tratar como implementação nem reexecutar. |
| EXECUTADO PARCIALMENTE | Completar apenas a lacuna concreta que impede o fluxo canônico. Não reescrever o módulo. |
| EXECUTADO NO GIT; NÃO COMPROVADO EM PRODUÇÃO | Colocar em quarentena: verificar se é front-end, migration, RPC ou integração. Não prometer produção até prova de deploy e banco. |
| PARCIAL | Converter o requisito em uma tarefa de implementação pequena e vertical, priorizada pelo núcleo. |
| IGNORADO OU NÃO COMPROVADO | Manter em backlog; não implementar nesta fase exceto se bloquear o motor unificado. |
| SUPERADO / CONFLITANTE | Preservar como histórico, retirar sua autoridade e não reintroduzir sua lógica. |
| PR ABERTA | Não fazer merge automático. Classificar como: já superada, reaproveitável em parte, conflitante ou futura. Só então pedir decisão. |

---

## 4. Ordem única de execução

### Fase 1 — Congelar a confusão sem parar o produto

Objetivo: impedir que prompts, branches, legacy e declarações substituam a realidade funcional.

Execute, sem criar relatório longo:

1. Leia `AGENTS.md`, `.cursor/rules/`, o mapa de resgate e as políticas em `docs/politicas/`.
2. Localize o arquivo canônico da regra de Planejador, próximo passo e fonte de verdade.
3. Localize as migrations presentes no repositório e compare seus nomes com o estado do banco somente para identificar migrations pendentes; não aplique nada nesta fase.
4. Crie ou atualize apenas o arquivo `docs/ESTADO_OPERACIONAL_ATUAL.md`, com no máximo uma tabela de 15 linhas contendo:
   - núcleo/capacidade;
   - fonte canônica atual;
   - arquivo/rota principal;
   - banco/RPC envolvido;
   - status: ativo, parcial, legado, pendente de validação;
   - próxima ação técnica.
5. Não listar todos os prompts de novo. O mapa já é o índice histórico.

Critério de saída: existe um único arquivo curto que aponta para as fontes canônicas, sem promover legado a operação.

### Fase 2 — Fechar o corte vertical do motor unificado

Objetivo: provar o núcleo operacional pela interface e com persistência.

O único fluxo que deve funcionar nesta fase é:

```text
Contato/cliente → Caso → Serviço/Jornada → Tarefas → Responsável/Prazo
→ Próxima ação → Pendência/Bloqueio → Timeline → Planejador
```

Use as entidades, RPCs, telas e migrations já existentes. Não crie nomenclatura concorrente.

Implementar ou corrigir somente o necessário para que seja possível:

1. Criar ou selecionar contato/cliente.
2. Abrir um caso associado a esse contato/cliente.
3. Associar o serviço e a jornada/planejamento válidos.
4. Criar tarefas persistidas e vinculadas ao caso.
5. Atribuir responsável, prazo, prioridade e estado.
6. Derivar ou registrar a próxima ação pelo mecanismo canônico já existente, sem criar segunda narrativa.
7. Registrar uma pendência ou bloqueio contextualizado.
8. Registrar evento em timeline/auditoria por alterações relevantes.
9. Mostrar no Planejador a próxima ação e as tarefas do caso.
10. Recarregar a aplicação sem perda de dado.
11. Impedir acesso externo a notas internas e a dados de outros clientes/casos.

Critério de saída: demonstrar o fluxo acima pela UI, usando dados de teste identificáveis, sem editar banco manualmente e sem depender de planilha ou mock.

### Fase 3 — Corrigir a cadeia Planejador → Proposta → Condição → OS

Objetivo: manter a cadeia comercial coerente sem ressuscitar SKU obrigatório, planilha mestre ou matriz legada.

Preservar:

- Planejador como origem do planejamento;
- proposta Canva aprovada como documento/escopo histórico válido e protegido;
- produto-pai como organização técnica quando existir;
- valor e condição com origem rastreável;
- ordem de serviço idempotente e vinculada ao caso.

Corrigir somente lacunas verificadas no fluxo real. Não gerar versão nova de proposta Canva aprovada, não sobrescrever escopo, valor ou origem existente e não tornar SKU condição obrigatória de operação.

Critério de saída: um caso consegue manter planejamento, proposta, condição e OS vinculados e rastreáveis sem duplicação, sem planilha mestre e sem alteração indevida de proposta aprovada.

### Fase 4 — Consolidar documentos, pessoas e portal seguro

Objetivo: garantir que a pessoa seja tratada corretamente e que o portal apresente somente o que é autorizado.

Preservar e testar:

- pessoa/cliente como referência canônica;
- vínculo entre pessoas, caso e grupo familiar;
- documento individual por titular;
- documentos sensíveis internos/restritos por padrão;
- compartilhamento de achados/projeções somente quando sanitizado e autorizado;
- RLS e autorização real no banco, não apenas ocultação visual;
- App Cliente mostrando status, pendências, documentos e projeções autorizadas, sem notas internas.

Não substituir estruturas atuais por novas tabelas sem provar que a estrutura vigente não comporta o requisito.

Critério de saída: teste com dois perfis de cliente prova que nenhum vê dados, notas, documentos ou casos do outro; perfil interno vê o contexto necessário.

### Fase 5 — Pesquisa e Biblioteca Mestre sem duplicidade ativa

Objetivo: consolidar o que o produto usa, sem apagar registros históricos.

Usar como princípio:

- fonte, evidência, achado, hipótese, pessoa/linhagem e caso precisam ser vinculáveis;
- hipótese não é fato;
- cada achado relevante aponta para fonte e grau de confiança;
- pesquisa deve aparecer no Caso 360 e alimentar apenas fluxos autorizados;
- a Biblioteca Mestre deve ser referência/curadoria, não tela decorativa.

Ações:

1. Identificar o caminho canônico atual que usa `research_cases`, evidências e achados.
2. Isolar telas e tabelas paralelas de pesquisa como legado, sem exclusão.
3. Remover apenas navegação ativa para caminhos comprovadamente mortos, de forma reversível.
4. Não migrar massa de dados nem excluir tabela nesta fase.

Critério de saída: um achado de pesquisa criado pelo caminho canônico aparece no caso correto, com fonte e status, sem criar duplicação em sistema paralelo.

### Fase 6 — Quarentena de PRs e legado

Objetivo: encerrar a fila tóxica sem apagar patrimônio.

Tratar PRs abertas individualmente e sem merge automático.

Classificação inicial obrigatória:

- **Fechar como superada:** PRs cujo conteúdo já esteja em `main` ou tenha sido substituído.
- **Fechar como documental:** PRs que só preservam relatório ou de-para e já tenham o arquivo em `main`.
- **Quarentena para reaproveitar trecho:** PRs com uma correção pequena ainda útil, após comparação contra `main`.
- **Manter como futura:** funcionalidades fora do núcleo, como WhatsApp completo, comunicação completa ou marketing.
- **Descartar logicamente:** prompts de zero travas, migração total, reversão emergencial, SKU obrigatório e quaisquer instruções que promovam legado a fonte ativa.

Não fechar nem excluir PRs/branches sem apresentar à proprietária uma lista curta: número, título, classificação e razão em uma linha.

Critério de saída: nenhuma PR aberta é candidata a merge por inércia.

---

## 5. Prioridade explícita

A ordem é fixa:

1. Fonte de verdade e motor unificado operacional.
2. Planejador e próxima ação canônica.
3. Caso, tarefa, pendência, bloqueio e timeline persistidos.
4. Planejador → proposta → condição → OS.
5. Pessoas, documentos, LGPD e portal seguro.
6. Pesquisa e Biblioteca Mestre.
7. Limpeza lógica de legado, branches e PRs.
8. Marketing, WhatsApp, analytics, dashboards e expansões futuras.

Se uma tarefa não melhora o item atual da lista, ela está fora de escopo.

---

## 6. Regra de migrations e deploy

### Migrations

- Toda mudança de schema, RLS, trigger, function ou dado estrutural deve existir em uma migration versionada no repositório.
- Não aplicar migration no Supabase sem antes mostrar o arquivo, o efeito, a reversibilidade e o dado potencialmente afetado.
- Nunca assumir que uma migration está aplicada porque há um commit dizendo que está.
- Depois de aplicada, registrar no estado operacional: nome, versão e ambiente.
- Não apagar migration aplicada. Corrigir por migration aditiva/reversível.

### Deploy

- Nenhuma entrega é “produção” sem identificação do deployment Vercel correspondente.
- Para cada lote, informar: commit, migrations aplicadas ou não aplicáveis, deployment/ambiente, testes e fluxo manual validado.
- Não fazer deploy nesta execução sem confirmação explícita.

---

## 7. Forma obrigatória de trabalhar

Para cada lote pequeno de alteração:

1. Diga em até cinco linhas o problema concreto e o fluxo que será corrigido.
2. Liste arquivos e migrations que pretende alterar.
3. Faça as alterações mínimas.
4. Rode typecheck, lint, testes e build disponíveis.
5. Informe resultado objetivo: passou, falhou ou não existe.
6. Diga qual cenário de UI permite validar.
7. Pare antes de commit, push, merge, deploy, exclusão ou alteração irreversível.

Se houver ambiguidade de produto, escolha a solução conservadora que:

- preserva o Planejador;
- preserva dados existentes;
- não usa legado como fonte ativa;
- não cria estrutura paralela;
- mantém RLS, auditoria e rastreabilidade.

Registre a premissa em uma linha no arquivo de estado operacional. Não interrompa o trabalho para produzir nova auditoria.

---

## 8. Definição de pronto

Uma capacidade só pode receber o status **PRONTO PARA ACEITE** se todos os itens forem verdadeiros:

- Está acessível pela rota/interface correta.
- Lê e grava dados reais persistidos.
- Sobrevive a recarregamento.
- Usa a fonte de verdade canônica.
- Não usa planilha mestre, DRE, matriz operacional legada ou reconciliação Asaas como base ativa.
- Não duplica regra já existente.
- Possui autorização/RLS adequada quando há dado sensível.
- Registra evento/auditoria quando a ação é material.
- Passa nas verificações técnicas disponíveis.
- Tem roteiro de validação manual curto e concreto.

Caso algum item não seja verdadeiro, usar um destes status: **PARCIAL**, **PENDENTE DE MIGRATION**, **PENDENTE DE DEPLOY**, **PENDENTE DE TESTE AUTENTICADO**, **LEGADO ISOLADO** ou **FORA DE ESCOPO**.

---

## 9. Resultado esperado do resgate

Ao final das fases prioritárias, o Clube Ancestral deve oferecer uma operação simples e coerente:

```text
Planejador vigente
  ↓
Cliente/Pessoa → Caso → Serviço/Jornada
  ↓
Tarefas + Responsável + Prazo + Próxima ação
  ↓
Pendências/Bloqueios + Timeline
  ↓
Documentos e Pesquisa vinculados
  ↓
Proposta/Condição/OS rastreáveis
  ↓
Portal seguro e informação autorizada ao cliente
```

Tudo que não fortalece esse circuito deve permanecer em backlog, documentação histórica ou legado isolado até nova decisão explícita.
