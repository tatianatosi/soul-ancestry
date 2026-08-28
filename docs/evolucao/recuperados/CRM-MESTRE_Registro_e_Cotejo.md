# CRM Mestre — Arquitetura Conceitual (registro de recuperação e cotejo)

## Proveniência

- **Origem:** arquivo `.md` enviado pela Proprietária no chat, 24/08/2026.
- **Preservado em:** `CRM-MESTRE_Arquitetura_Conceitual_v1.0.md` (cópia
  integral, 810 linhas).
- **Aba de referência declarada no próprio documento:** "CA 04 — CRM
  Mestre, Discovery e Handoff".
- **Natureza:** especificação de conceito e regras — "não implementa,
  integra ou altera nenhum sistema" (declarado no próprio documento).
- **Relevância:** atende diretamente `REC-005` (fonte operacional de
  CRM/tarefas/calendário) do `MANIFESTO_AUSENCIAS_E_RECUPERACAO_v1.0.md`.

## Conteúdo — resumo estrutural

Documento extenso e bem organizado, com 13 seções (A a M) mais um checklist
de verificação final:

- **§A** Diagrama do ciclo de vida completo: Painel de Calls → Brief de
  Discovery → CRM Mestre (Oportunidade) → Diagnóstico → Proposta →
  Contrato → Pagamento → Cliente → Onboarding → Caso (Desk) → Entrega →
  App Cliente/One-page.
- **§B** Matriz de 10 fontes de verdade (Painel de Calls, Brief, CRM
  Mestre, Planilha Mestre, Asaas, Dossiê-mãe, Desk, App Cliente, Studio de
  Devolutivas, CRM legado/CA OPS) — o que cada uma pode e não pode
  registrar.
- **§C** Dicionário de **25 entidades** (Lead, Contato, Núcleo familiar,
  Requerente individual, Interação, Oportunidade, Discovery, Brief,
  Diagnóstico, Proposta, Contrato, Pagamento, Despesa de terceiro,
  Produto/SKU, Cliente, Onboarding, Caso, Tarefa, Dossiê, Evidência, Fonte,
  Documento, Consentimento, Entrega, Log de auditoria), cada uma com
  campos mínimos, sensibilidade, sistema proprietário e regras de
  visibilidade ao App/one-page.
- **§D** Duas máquinas de estado: eixo Comercial (Novo lead → ... →
  Nutrição/Perdido/Encerrado) e eixo Formalização/Operação (Não iniciado →
  ... → Caso ativo → Arquivado), com o campo **Resultado comercial** sempre
  **derivado**, nunca definido manualmente.
- **§E** Roteiro Mestre de Discovery v2 (16 passos, SPIN completo),
  generalizado do roteiro Ana Luiza sem copiar dado pessoal — regra fixa:
  nunca usar "elegibilidade confirmada", sempre "sinal de aderência
  preliminar".
- **§F** Template do Brief de Discovery (o que entra automático vs.
  preenchimento manual).
- **§G** Matriz de handoff entre as 6 camadas, com bloqueios explícitos
  (transcrição bruta nunca chega ao App, etc.).
- **§H** Matriz de privacidade/consentimento/visibilidade por tipo de
  dado — distingue "biblioteca histórica sanitizada" (pode ser pública) de
  "dossiê de cliente" (nunca é "Público histórico").
- **§I** Regras de marco jurídico (contexto, nunca conclusão individual) e
  modelo vazio de matriz por país, a homologar com apoio jurídico.
- **§J** Matriz de migração conceitual (categorias: migrar, manter como
  histórico, revalidar, arquivar, não migrar, duplicidade, dado
  fictício/teste, dado sensível, fora de escopo) — sem migrar dado real.
- **§K** Checklist de piloto privado, item a item, indicando o que já pode
  operar manualmente vs. o que depende de decisão humana ou implementação
  futura.
- **§L** **13 decisões humanas pendentes**, entre as mais relevantes:
  1. Qual estado do eixo Formalização/Operação marca "Convertido".
  2. Condição operacional exata para passar de Onboarding para Caso ativo.
  3. Quem é o responsável de catálogo da Planilha Mestre.
  4. Critério de "Onboarding completo".
  7. Regras de "Dispensa homologada" de revisão jurídica, por país/via.
  13. Quem aprova elevação de Fonte de M3-CANDIDATA para M3-APROVADA/M4.
- **§M** Backlog dividido em: operação manual agora / implementação
  futura / decisão humana / bloqueado / fora de escopo.

## Cotejo inicial com o código atual (busca direcionada, não exaustiva)

Busquei terminologia exata deste documento no repositório para checar se
ele é conceito puro ou se já virou implementação real:

| Termo do documento | Encontrado no código? | Onde |
|---|---|---|
| "sinal de aderência preliminar" | **Sim** | `src/lib/ca04-crm-mestre.ts`, `src/lib/crm-fluxo.functions.ts`, e como campo real no schema (`src/integrations/supabase/types.ts`) |
| "Resultado comercial" (derivado) | **Sim** | `ca04-crm-mestre.ts`, `dicionario-calls-crm.ts`, `crm-desk.ts`, renderizado em `/crm-mestre` e `/leads` |
| Núcleo familiar / Requerente | **Sim** | Presente em pelo menos 10 arquivos de `src/lib` (pesquisa, casos-ativacao, contrato-preparar, discovery-roteiro, etc.) |
| `conteudo_aprovado` | **Sim** | Campo real no schema (`supabase/types.ts`) e em `src/lib/blueprint.ts` |
| Classificação de fonte M1–M6 | **Não confirmado nesta busca** | Merece verificação dedicada — não encontrado com o nome exato usado aqui |

**Leitura honesta:** isto não é uma especificação teórica desconectada —
a terminologia exata (inclusive nomes de campo derivado, não só conceito)
aparece implementada em múltiplos arquivos reais e no próprio schema do
banco. Isso é evidência forte de que este documento (ou uma versão muito
próxima dele) foi de fato a base de construção do CRM Mestre atual, não
apenas um plano nunca executado.

**O que este cotejo NÃO fez** (por volume — 25 entidades × 2 máquinas de
estado × 13 decisões pendentes é maior que uma verificação rápida
comporta): não confirmei entidade por entidade se todos os 25 objetos
existem como tabela, se as duas máquinas de estado batem transição por
transição com `crm-fluxo.functions.ts`, nem se as 13 decisões humanas
pendentes (§L) já foram tomadas ou continuam em aberto. Isso é uma
auditoria maior, separada, se você quiser que eu faça.

## Avanço em REC-005

`CA-GOV-01` pedia "sistema canônico definido, eliminação de duplicidade
entre CRMs concorrentes" como bloqueador de go-live. Este documento é
evidência forte de que existe, sim, um sistema canônico desenhado (CRM
Mestre) e implementado — a lacuna que resta não é "falta de sistema", é
confirmar se as 13 decisões pendentes de governança (§L) já foram
resolvidas, e se o CRM legado/CA OPS realmente parou de escrever dado novo
(regra 10 da Matriz de fontes, §B) na prática.
