# Clube Ancestral — Dicionário de Validações do Painel de Calls → CRM

**Versão:** 1.0 · **Finalidade:** transformar o Painel de Calls Discovery em base estruturada do CRM/Desk, sem substituir a Planilha Mestre de Produtos, o planejador financeiro ou os dossiês dos clientes.

## Proveniência

- **Origem:** colado diretamente no chat pela Proprietária, 24/08/2026.
- **Relação com outros documentos:** citado como fonte-base pelo
  `CRM-MESTRE_Arquitetura_Conceitual_v1.0.md` (já registrado), que referencia
  uma "v1.1" deste dicionário — esta é a v1.0, a versão anterior.

## Conteúdo (resumo estrutural — texto completo preservado nesta conversa)

1. **6 princípios de governança**: Painel de Calls é entrada/handoff, nunca
   fonte de preço/contrato/link Asaas/despesa; Planilha Mestre é fonte de
   produto/preço; despesas de terceiros nunca são desembolso do Clube;
   dropdowns rejeitam entrada livre; elegibilidade/via jurídica são sempre
   triagem preliminar, nunca decisão final; todo lead ativo tem próxima
   ação + responsável + data + origem.
2. **~40 campos do CRM** com tipo, etapa obrigatória e lista de valores —
   da entrada (ID Lead, nome, WhatsApp) até fechamento (Resultado
   comercial, Motivo de perda), passando por qualificação jurídica
   preliminar (Elegibilidade, Via jurídica, Marco jurídico de referência,
   Geração do ascendente, Risco de ruptura na linha) e SPIN em 4 checkboxes
   sequenciais.
3. **11 regras de dependência e bloqueio** — ex.: `Resultado comercial =
   Convertido` exige contrato assinado + pagamento inicial + link do
   dossiê; `Status da via = Encerrada para novos pedidos` bloqueia
   proposta de protocolo, permite só diagnóstico/pesquisa/nutrição.
4. Formatação condicional recomendada (verde/amarelo/vermelho por etapa e
   elegibilidade).
5. Critérios de aceite: nenhum SKU/preço/link Asaas digitado livre no
   Painel; nenhuma despesa de terceiro como caixa do Clube.

## Cotejo com o código atual — CONFIRMADO, implementação fiel

`src/lib/dicionario-calls-crm.ts` (448 linhas) implementa este dicionário
**verbatim**, confirmado por citação literal: as 4 regras de SPIN no
código ("Marcar somente após registrar dados familiares básicos.",
"Marcar somente após registrar dor/lacuna objetiva.", "Marcar somente
após explicar risco de não estruturar a via/documentação.", "Marcar
somente se o lead verbalizar benefício/próximo passo.") reproduzem este
documento palavra por palavra, assim como os campos "Elegibilidade
preliminar" e "Via jurídica preliminar" com a mesma regra ("Triagem
preliminar; nunca decisão jurídica final." / "Preliminar; depende de
validação documental e análise humana.").

Este dicionário é consumido em `governanca.dicionario-calls-crm.tsx`
(rota já mapeada em `navegacao-desk.ts`, grupo Comercial → "Dicionário de
validações (Calls → CRM)") — mesma conclusão do CA-06: não é um prompt
pendente de execução, é a especificação de origem de um módulo já
construído e em uso.

## Nota

O documento também pasteado nesta mesma mensagem, "CA-06 — Catálogo
Operacional 30 + Planejador + Ciclos de Vida", é idêntico ao já recebido e
registrado anteriormente em `CA-06_Catalogo_Operacional_30.md` — não
duplicado aqui.
