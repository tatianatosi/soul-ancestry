# Discovery, SPIN e Bloco 4 — registro de recuperação (3 documentos)

## Proveniência

Três arquivos `.docx` enviados pela Proprietária no chat, 24/08/2026,
todos da mesma série de auditoria de 10-11/08/2026 que alimentou a
Arquitetura Conceitual do CRM Mestre já registrada
(`CRM-MESTRE_Registro_e_Cotejo.md`) — são os documentos de trabalho mais
granulares por trás daquela síntese.

| Arquivo | Preservado em | Data | Natureza |
|---|---|---|---|
| Pente-Fino Final — Painel de Calls, Roteiro, SPIN, Pós-Call e Ciclo de Vida | `PENTE-FINO_Discovery_CRM_v1.0.docx` | 11/08/2026 | Leitura, auditoria e recomendação |
| Contrato de Dados, Fonte Única, Integrações e QA de Não Regressão — Bloco 4 | `BLOCO-4_Contrato_Dados_Fonte_Unica_QA.docx` | 10/08/2026 | Especificação auditável + checklist de go-live |
| Auditoria Final do SPIN e Esquema Completo de Campos do CRM | `AUDITORIA_SPIN_Esquema_CRM.docx` | 11/08/2026 | Auditoria + modelagem de dados |

## 1. Pente-Fino Discovery/CRM — o que traz de novo

- Inventário de 9+ materiais reais (Painel de Calls no Sheets — 21
  colunas, só 1 linha com dado real de 49 —, Roteiro Ana Luiza e 2 cópias
  duplicadas a arquivar, Manual SPIN de 174KB pendente de validação, 32
  mensagens de WhatsApp oficiais, planilhas de casos legados a arquivar).
- Decisões finais (§L): o Painel de Calls existente continua mestre (só
  adicionar 9 campos, não criar planilha paralela); roteiro mestre é o da
  Seção E deste documento; pós-call oficial obrigatório após toda call;
  regras de conteúdo permitido no App (nível 2: nome/escopo/próximo passo;
  nível 3: jornada/entregas/pendências; nunca transcrição, objeção, preço
  cru, SKU, hipótese jurídica).
- **Estado factual registrado:** "hoje, nenhuma métrica pode ser
  calculada — o CRM é 'DADOS TESTE' e o Painel Calls tem apenas 1 linha
  com dados reais" (11/08). Não confirmado se isso mudou desde então.

## 2. Bloco 4 — Contrato de Dados e Checklist de Go-live

O documento mais operacional dos três: dicionário de identificadores
únicos (SKU, Caso, Lead, Proposta, Contrato) e um **checklist de QA de
go-live extenso**, com dezenas de itens concretos encontrados em 10/08 —
entre os mais relevantes:

- Duplicações internas no catálogo (17 no Catalogo Produtos), preços
  divergentes entre planilhas para o mesmo SKU (`CA-CID-023`: R$4.500 vs
  R$4.800, **com caso real da Giovanna em curso**).
- IDs de caso duplicados e com typo (`CA-CID-AT-20026-001` em vez de
  `CA-CID-AT-2026-001`).
- Clientes cadastrados sem nome real ("Amigo do Danilo", "Amigo
  Francês"); responsável 100% concentrado em "Tatiana", sem distribuição
  de equipe.
- Nenhum dos 9 casos então existentes tinha link Asaas vinculado; caso
  Ana Luiza sem preço definido no Planejador.
- Log de auditoria (registro imutável de alteração de status/preço/link)
  **não existia** e é listado como pré-requisito antes de qualquer
  automação que altere dados.
- Critérios de aceite explícitos por área (Catálogo, CRM, Pagamentos,
  Desk, App Cliente, Proposta) — nenhum verificado nesta rodada contra o
  estado atual.

**Relevância direta:** isso é evidência primária adicional para
`REC-003` (go-live efetivamente executado) do Manifesto — em 10/08 nada
estava pronto para automação real; consistente com o NO-GO que
`CA-GOV-01` (23/08) e a devolutiva CA-EVO-02 (15/08) já registravam depois
disso.

## 3. Auditoria SPIN — achado de maior atenção: linguagem de venda a corrigir

Auditoria do "Manual SPIN Selling para Genealogia" (174KB) encontrou
linguagem de **pressão comercial que conflita com os princípios do
Clube Ancestral** (acolhedor, consultivo, sem promessa jurídica). Trechos
marcados para remoção, não apenas ajuste, por risco **alto**:

- "Lei italiana mudou em março/2025 restringindo netos" — usa legislação
  real como tática de pressão.
- "Quem adia 6 meses termina em 2029" — cria urgência artificial.
- "Filhos — quanto mais espera, mais difícil" — cria medo.
- "Efeito Uau" com promessa de elegibilidade — promessa jurídica direta.
- Terminologia "closer", "fechar", "mata a venda", "banco de objeções" —
  tom de venda agressiva.

Todos marcados como "Responsável validação: Tatiana" — **não confirmado
se essa adaptação do manual foi de fato feita** desde 11/08.

Também define o esquema completo de 8 entidades do CRM (compatível com o
que a Arquitetura Conceitual do CRM Mestre, registrada antes, já
implementa), a regra de fronteira CRM→Desk ("antes de existir `case_id`,
nenhuma tarefa vai para Go-live/Formalização/Documentos/Financeiro/Fase
1/Fase 2 — fica só como Interação/Tarefa no CRM"), pós-call em 3 níveis
(10/14/8 campos), e separa consentimento em 4 tipos distintos (contato,
armazenamento/LGPD, gravação, compartilhamento de documento) — com a
política final de LGPD marcada **PENDENTE DE VALIDAÇÃO HUMANA**.

## O que ainda não foi feito nesta rodada

Não cotejei os itens específicos do checklist de go-live do Bloco 4 (17
duplicações de catálogo, preços divergentes, IDs com typo, etc.) contra o
estado atual do banco — isso exigiria acesso de leitura ao Supabase ou às
planilhas mestres vivas, fora do que este repositório de código expõe.
Se você quiser, o próximo passo natural é verificar esses itens
diretamente no Supabase, já que agora está confirmado que você tem acesso
próprio (Owner) lá.
