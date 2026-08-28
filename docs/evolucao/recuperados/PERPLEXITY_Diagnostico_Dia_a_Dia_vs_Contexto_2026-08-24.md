# "Reveja se agora tudo se aplica no dia a dia ou ainda estamos em contexto" (Perplexity)

## Proveniência

- **Origem:** relatório gerado pelo Perplexity Space da Proprietária, enviado
  como upload (`.md`) em 24/08/2026. Cita como fontes `CA-EVO-04_Dados_Vivos_e_Integracoes.md`,
  `relatorio_advisor_top_skus.md`, `CA-06_Catalogo_Operacional_30` e um
  arquivo interno sem nome legível — todos documentos de 11–14/08, **não**
  deste repositório de código.
- **Natureza:** diagnóstico híbrido — o que já opera no dia a dia vs. o que
  ainda é só governança/documentação.

## Cotejo com o estado real do código (24/08/2026)

| Afirmação do Perplexity | Veredito | Evidência |
| --- | --- | --- |
| "`Opportunity_ID` ainda não está implementado como identificador reconciliado" | **Desatualizada.** Já implementado. | `opportunity_id` é campo real usado em `src/components/crm/fluxo-canonico.tsx`, `registrar-evento-funil.tsx`, `form-conversa.tsx` e existe na tabela (`src/integrations/supabase/types.ts:6039`). |
| "Há divergência entre IDs do Desk/Dossiê e da planilha go-live" — "eleger o Case_ID canônico" como item #1 do plano | **Já resolvido**, antes deste relatório. | `src/lib/varredura-completude.ts` (22/08/2026), `PEND-01`: "RESOLVIDO_POR_DECISAO_DA_PROPRIETARIA" — `CA-CID-AT-FAM-2026-001` é o identificador canônico único do caso Ana Luiza; `CA-AUT-ANALUIZA-FAM-2026-001` fica como referência legada. |
| CA-CURSO-001 bloqueado por status Arquivado até decisão humana | **Confirmado, correto.** | `src/lib/ca06-catalogo-operacional.ts:897`: "CA-CURSO-001 está classificado como candidato ao Catálogo 30 mas tem status oficial Arquivado — bloqueia inclusão até decisão humana." Mesmo achado da proposta Top SKUs (`PROPOSTA_Definicao_Top_SKUs_...md`, item 9 da fila de validação). |
| Financeiro/Asaas "configurado, pendente de teste/transação" | **Confirmado.** | `varredura-completude.ts`, `PEND-08`: status `AGUARDA_CONFIRMACAO`, "preparadas, nunca executadas". |
| Webhooks e logs "pendentes de teste ponta a ponta" | **Confirmado.** | `varredura-completude.ts`, `PEND-13`: status `SEM_IMPLEMENTACAO`, "Asaas, e-mail transacional e backup permanecem como intenção preparada." |
| Anexos I–V "materializar somente quando gates e dados estiverem atendidos" | **Confirmado, já é a regra vigente.** | `varredura-completude.ts`, `ANEXOS_VARREDURA` — Anexo I e III existem parcialmente (motor pronto, instância por caso pendente); Anexos II, IV e V têm texto jurídico revisado mas não materializado no repositório (`PEND-05`). |
| Planejador com "IDs duplicados e erro no resumo"; Tarefas/calendário com "sobreposição sem fonte única confirmada" | **Não verificável neste repositório.** | Refere-se ao Planejador/Google Sheets/Google Tasks/Calendar externos (fora do código). O módulo interno equivalente (`src/lib/planejador-parametros.ts`, `case_plans`) não apresenta os sintomas descritos; não há como confirmar ou negar o estado da planilha externa a partir daqui. |
| CRM/oportunidades "fontes concorrentes" | **Parcialmente desatualizada.** | O CRM Mestre (`ca04-crm-mestre.ts`, já cotejado em `CRM-MESTRE_Registro_e_Cotejo.md`) e o fluxo canônico de oportunidades (`fluxo-canonico.tsx`) já existem como fonte única dentro do Desk. A afirmação provavelmente se refere a fontes externas (planilhas paralelas), não ao código. |

## Leitura consolidada

O relatório do Perplexity é montado a partir de documentos de 11–14/08 e por
isso já está **defasado em pelo menos dois pontos concretos** (Opportunity_ID
e Case_ID canônico), ambos resolvidos por decisão da Proprietária em 22/08 e
já implementados no código antes mesmo desta sessão. Os pontos que seguem
válidos (Asaas/financeiro, webhooks, Anexos II/IV/V) **já estavam
rastreados** em `src/lib/varredura-completude.ts` — este documento não trouxe
lacuna nova de código, apenas confirmou, com atraso, o que a varredura interna
de 22/08 já registrava. Os itens sobre Planejador/Tarefas/Calendário são
sobre ferramentas externas ao repositório (Google Sheets/Tasks/Calendar) e
não puderam ser confirmados aqui.

**Conclusão para a pergunta "ainda é contexto?":** dentro deste repositório
(Desk), a resposta é a mesma auditoria aba a aba de hoje
(`AUDITORIA_ABA_A_ABA_PESQUISA_CLIENTE_2026-08-24.md`): a maior parte do que
resta "só contexto" é fora do código (planilhas, Asaas, Drive, webhooks) ou é
decisão humana pendente (Anexos II/IV/V, CA-CURSO-001), não lacuna de
implementação do Desk em si.
