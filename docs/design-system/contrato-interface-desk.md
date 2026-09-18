# Contrato de Interface — Desk Intelligence

**Status:** em revisão  
**Versão:** v1.0  
**Data:** 2026-09-18  
**Responsável pela decisão:** Proprietária do Clube Ancestral  
**Fonte:** mockup visual de 9 pranchas do Desk Intelligence, 11/09/2026; `Taxonomia_Canonica_Mockup_Aprovado_App_Cliente_e_Desk.md`; decisão da Proprietária.  
**Escopo:** navegação, conteúdo, CTAs, indicadores e estados das sete telas do Desk.  
**Premissas:** as sete telas são a face; os seis grupos internos são contexto, filtro e submenu; mockup não prova fonte/persistência.  
**Limites:** não cria segunda navegação, não cria KPI fictício, não autoriza automação externa.

## Navegação imutável

```text
Visão Geral → Casos 360 → Checklist → Validação Jurídica → Radar Interno → Alertas → Biblioteca Mestre

Contexto interno: Hoje · Comercial · Casos & Pessoas · Pesquisa · Formalização · Governança
```

Os seis grupos não podem voltar como outra barra lateral, outra taxonomia principal ou conjunto paralelo de abas.

## Telas e conteúdo obrigatório

| Tela | Papel aprovado | Conteúdo obrigatório | CTA | Não aparece na frente |
|---|---|---|---|---|
| Visão Geral | o que exige decisão hoje | no máximo quatro leituras essenciais; decisões prioritárias com pessoa/caso, causa/impacto e CTA | abrir fila, Mesa Discovery, jornada ou revisão contextual | gates, NO_GO, KPI sem destino, catálogo bruto, logs, dado técnico |
| Casos 360 | o que acontece com a família | pessoa/família; `case_id`; próxima ação; responsável; marco; impacto; subabas Visão, Jornada, Pessoas, Pesquisa, Documentos, Formalização, Financeiro, Histórico; Planejador e Formalização/Financeiro | abrir Planejador, atualizar marco, abrir formalização | SKU como início/gate; segunda ficha concorrente |
| Checklist | o que a equipe executa | fila única: tarefa, caso/pessoa, origem, responsável, prazo e ação; filtros internos | concluir, reprogramar, abrir | checklist semanal paralelo e tarefa sem case_id/responsável |
| Validação Jurídica | o que precisa de parecer | requisitos críticos; evidências; decisões humanas; matriz por caso | abrir prova, revisar conflito, registrar decisão | hipótese como resultado, score conclusivo, bloqueio global de rascunhos/tarefas/pesquisa |
| Radar Interno | onde existe risco ou oportunidade | seis sinais: Cadência, Documentos, Pesquisa, Formalização, Financeiro, Continuidade; causa, impacto e ação | abrir caso/ação | planilha sem causa/impacto/ação, número simulado |
| Alertas | o que tratar ou comunicar | alertas que exigem decisão; fluxo sinal→produção→revisão→aprovada→destino→histórico→próxima ação; regra de comunicação | reprogramar, liberar no App, preparar mensagem | disparo automático; comunicação sem destinatário/grupo/confirmação |
| Biblioteca Mestre | o que sustenta, produz e governa | Pesquisa e Evidências; Microentregas e Relatórios; Conteúdo e Mensagens; Catálogo e Condições; Contratos e Modelos; Governança e Referências CRM | abrir e filtrar por caso/estado | acervo sem destino; CRM Mestre como substituto da mesa de CRM Vivo |

## Regras transversais

- Cada leitura/indicador precisa abrir pessoa, caso ou ação.
- No máximo quatro leituras essenciais acima da dobra na Visão Geral.
- Toda tarefa relevante preserva `case_id`; concluir/reprogramar atualiza fonte, histórico e próxima ação quando aplicável.
- Planejador organiza a jornada; produto-pai/SKU apenas contextualiza.
- Financeiro só aparece com origem, condição e detalhe; não é KPI solto de topo.
- Pesquisa é centro operacional; Biblioteca Mestre é ponte de referência reutilizável, produção e governança.
- CRM Mestre/listas-base/dicionários permanecem referência até de-para aprovado; CRM Vivo e Painel de Calls ficam na operação.

## Aceite

Uma tela só é aceita quando preserva a face e hierarquia do mockup, usa fonte real, informa vazio/erro, possui CTA contextual, funciona em desktop/375 px e comprova persistência/F5 para toda ação de escrita.
