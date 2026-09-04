---
status: ativo
versão: 1.0
data: 2026-09-04
projeto: Clube Ancestral — Desk Intelligence
responsável pela decisão: Proprietária (Tatiana Melani Tosi)
fontes:
  - Google Drive — 12 documentos listados no pedido da Proprietária (§0)
  - docs/auditorias/2026-09-04-fluxo-evidencia-achado-alerta-app-cliente.md
  - docs/auditorias/2026-09-04-nucleos-pessoa-360-contrato-acesso-app-cliente.md
  - docs/operacao/CA-OPS-01_Orquestracao_Jornada_CRM_Onboarding_Microentregas.md
  - docs/operacao/CA-OPS-02_Fiacao_Cadencia_Mensagens_Alertas.md
  - docs/politicas/PROMPT-EIXO-COMUNICACAO-IMPLANTACAO-FUTURA.md
  - docs/governanca/DE-PARA-MATERIAIS-EXTERNOS-2026-08-28.md
  - src/lib/cadencia-d0-d30.ts, src/lib/onboarding-jornada.ts, src/lib/onboarding-padrao.ts, src/lib/fiacao-cadencia-catalogo.ts
escopo: cruzar 12 documentos do Drive pedidos pela Proprietária contra todo o histórico de varreduras de onboarding/micro-entregas já feito nesta sessão, e reconstruir a régua de cadência D0→D365
premissas: nenhuma escrita em banco; nenhuma migration; nenhum código alterado por este documento
limites: sessão sem credencial ativa do Supabase — nenhuma consulta ao vivo
próximos passos: seção 6
critério de aceite: cada afirmação carrega documento+data (Drive) ou arquivo:linha (repositório) como evidência
---

## Causa

A Proprietária pediu para verificar 10 documentos específicos no Google Drive compartilhado (CRM
Journey, G-06, Catálogo de Exceções Operacionais, Inventário de Prompts Lovable pós-CRM, Respostas
Operacionais e Prompts pós-CRM, Jornada Completa Ana Luiza, Prompts Lovable App Cliente, Decisões
Canônicas CRM, Fluxo Jornada Clube Ancestral, Arquitetura Única de Oferta), cruzá-los com tudo que já
foi varrido nesta sessão sobre onboarding e micro-entregas, e fechar com "a regra geral de cadências de
D0 até D365".

## 1. Os 10 documentos pedidos — todos localizados, mais 2 achados no caminho

Busca no Drive por título/texto integral encontrou os 10 pedidos e mais 2 que se mostraram
indispensáveis para responder ao pedido (um índice mestre de 02/09 que já classifica dezenas de
decisões anteriores, e o registro de entrega técnica de 19/08 citado por vários dos outros documentos):

| # | Documento | Data | Encontrado como |
|---|---|---|---|
| 1 | CLUBE_ANCESTRAL_CRM_JOURNEY.docx | 18/08 | pedido |
| 2 | MAPA-EXCECOES-OPERACIONAIS ("Catálogo de exceções operacionais") | 23/08 | pedido |
| 3 | INVENTARIO_PROMPTS_LOVABLE_SEMANA_E_PRIORIZACAO_POS_CRM_v1.0 | 20/08 | pedido |
| 4 | respostas_operacionais_e_prompts_pos_crm_19_agosto_2026_v1_0 | 19/08 | pedido |
| 5 | ana_luiza_jornada_completa_e_prompts_v1_0 | 19/08 | pedido |
| 6 | prompts_lovable_app_cliente_jornada_documentos_v1_0 | 20/08 | pedido |
| 7 | CA-DECISOES-CANONICAS-CRM-CATALOGO-PLANEJADOR-JORNADA-v1.0 | 19/08 | pedido |
| 8 | fluxo-jornada-clube-ancestral.docx | s/d | pedido |
| 9 | "03 - Arquitetura Única de Oferta e Jornada" | 10/08, revisado 24/08 | pedido |
| 10 | G06_ACHADOS_E_ENCONTROS_v1.0.md | 20/08 | pedido — idêntico ao já existente em `docs/G06_ACHADOS_E_ENCONTROS_v1.0.md`, sem novidade |
| 11 | CA_ARTEFATO_MESTRE_RESGATE_PROMPTS_DECISOES_E_FILA | 02/09 | achado — índice mestre que classifica os demais |
| 12 | CA-IMPL-CRM-01_registro_entrega_19_agosto_2026_v1.0 | 19/08 | achado — citado por 3 dos 10 pedidos como "complementa" |

Resumo de uma frase por documento, status de implementação e evidência de código estão registrados no
arquivo de trabalho desta varredura (não versionado — conteúdo integral já refletido nas seções abaixo).

## 2. Achado principal: a régua D0→D365 não existe — é decisão nova, não resgate

Busquei `D365`, `D180`, `D+90`, `D60` nos 12 documentos, em todo `docs/` e em todo `src/lib/`: nenhuma
ocorrência de régua de ciclo de vida além de D30. Há, além disso, uma vedação escrita:

> "Nenhuma cadência deve ser uma sequência fixa universal de D+0, D+1 e D+15."
> — `docs/politicas/PROMPT-EIXO-COMUNICACAO-IMPLANTACAO-FUTURA.md:46`

O que existe hoje, em qualquer fonte (documento ou código), é: **régua fixa curta D0–D30 (onboarding) +
cadências por evento sem dia fixo para o resto do ciclo de vida**, incluindo pós-reconhecimento e
renovação. O território "D31 até D365" só tem dois gatilhos nunca implementados —
`recognition_confirmed` e `subscription_renewal_due` — nenhum dia associado a eles em nenhuma fonte.

### 2.1 — Decisão da Proprietária nesta rodada

A Proprietária declarou, durante esta mesma sessão: **"cadência deve ser obedecida como regra geral D0
até D365"**. Isso substitui a leitura acima como próximo passo — deixa de ser pergunta em aberto e vira
decisão a implementar —, mas não resolve, por si só, o conflito com a vedação escrita citada acima
(`PROMPT-EIXO-COMUNICACAO-IMPLANTACAO-FUTURA.md`, ainda vigente e nunca revogada por nenhum documento
lido nesta varredura). **Este documento registra a decisão; não decide, porque a Proprietária ainda não
especificou, o formato de aplicação** — ver perguntas na seção 5.

## 3. As cinco arquiteturas de cadência encontradas — nenhuma vai além de D30

### RÉGUA A — Onboarding WhatsApp automático D0–D30 (SUPERADA E PROIBIDA)
Fonte: doc 1, `CLUBE_ANCESTRAL_CRM_JOURNEY.docx`, 18/08, §3.1. Seis mensagens automáticas (D0 boas-vindas,
D1 tutorial, D3 alerta de achado, D7 relatório de progresso, D14 celebração, D30 NPS), todas com
responsável "Automático" e fallback WhatsApp em 24h se o app não for aberto. Revogada 24h depois pelo
doc 7 ("WhatsApp automático… fica fora do MVP") e nunca implementada — `whatsapp_automations` e
`micro_entregas` não existem em nenhuma migration.

### RÉGUA B — Cadência MVP D0–D30 (VIGENTE E IMPLEMENTADA)
Fonte: doc 7, `CA-DECISOES-CANONICAS-CRM-CATALOGO-PLANEJADOR-JORNADA-v1.0.md`, 19/08, §10:

> Cadência MVP: D0 checklist e responsável · D1–D3 revisão do plano inicial · até D7 primeiro valor
> verificável · D10 alerta de ausência de touchpoint · D14 alerta crítico · D30 check-in humano (NPS só
> se aprovado).

Transcrita literalmente em `src/lib/cadencia-d0-d30.ts` (`CADENCIA_D0_D30`, 6 momentos, com
`acaoInterna` × `entregaAoCliente`, `aprovacaoExtra: "NPS somente se aprovado"` em D30).

### RÉGUA C — Régua do caso-piloto Ana (D7/D10/D14) — a mesma decisão da Régua B, reafirmada
Fonte: doc 5, `ana_luiza_jornada_completa_e_prompts_v1_0.docx`, 19/08, Prompts Ana-05/Ana-07. Implementada
em `src/lib/onboarding-jornada.ts` (`regra: "D7" | "D10" | "D14"`) e `src/lib/onboarding-padrao.ts`.

### RÉGUA D — Catálogo `CAD-*` por evento (fora dos 12; nunca implementado)
Fonte: `docs/evolucao/recuperados/prompts-lovable-2026-08-31/PROMPT_MOTORES_UNIFICADOS_CRM_VIVO_ONBOARDING_CADENCIAS_INDICADORES.md`,
31/08 — já apontado na Seção 10 de `2026-09-04-fluxo-evidencia-achado-alerta-app-cliente.md`. Dez
cadências por evento, sem dia fixo; `CAD-POS-RECONHECIMENTO` (`recognition_confirmed`) e
`CAD-RENOVACAO-LEGADO` (`subscription_renewal_due`) são **a única cobertura conceitual do território
pós-D30 em todo o acervo**. `communication_cadences` não existe em nenhuma migration.

### RÉGUA E — Catálogo `CAD-*` do eixo de comunicação (fora dos 12; variante, também nunca implementada)
Fonte: `docs/politicas/PROMPT-EIXO-COMUNICACAO-IMPLANTACAO-FUTURA.md`. Dez cadências quase iguais à
Régua D, nomes divergentes (`CAD-RENOVACAO-ASSINATURA` em vez de `CAD-RENOVACAO-LEGADO`). Regra
anti-spam: "não enviar mais de um contato automático pelo mesmo canal em 48 horas".

### O que existe hoje no código, no lugar de uma régua longa
`CA-OPS-01`/`CA-OPS-02` (23/08) + `src/lib/fiacao-cadencia-catalogo.ts`: faixas de saúde (regular < 10
dias · atenção ≥ 10 · crítico ≥ 14) e 5 alertas derivados (`sem_touchpoint_10d`, `sem_atualizacao_14d`,
`sem_proxima_acao`, `sem_microentrega_planejada`, `caso_bloqueado`), sempre com
`ACAO_PERMITIDA = "abrir_preview_e_copiar_manual"` — nunca envio automático.

## 4. Contradições que ficam abertas (não fecham com este documento)

1. **Duas famílias de código de produto-pai na mesma data (19/08)**: doc 7 usa `CA-DIAG-*`/`CA-PESQ-*`/
   `CA-PROT-*`/`CA-POS-*`; doc 9 e o doc 4 (Prompt 06) usam `CA-CID-*`/`CA-HIST-*`/`CA-FAM-*`/`CA-WPP-*`.
   Não são sinônimos — `CA-MEM-002` significa coisas diferentes em cada família. Já registrada em
   `docs/governanca/DE-PARA-MATERIAIS-EXTERNOS-2026-08-28.md` como não reconciliada; **continua aberta**.
   Isto é o mesmo problema, com outra roupagem, da divergência PP-01–PP-09 × PP-01–PP-08 × PP-01–PP-14
   já registrada em `2026-09-04_RECONCILIACAO-PP01-14-vs-35-SKUS-ATIVOS.md` e
   `2026-09-04_MOTOR-PLANEJADOR-PRODUTOS-PAI-CANONICO-FINAL.md` — três desenhos de produto-pai
   concorrentes, nenhum ratificado como taxonomia única.
2. **Formato do `case_id` da Ana em produção nunca foi formalmente aprovado**: `DE-PARA-MATERIAIS-EXTERNOS-2026-08-28.md`
   registra que o dicionário de 91 SKUs marca `CA-CID-[PAÍS]-NNN` como "FORMATO AMBÍGUO… proposta
   pendente de aprovação", mas é exatamente o formato em uso (`CA-CID-AT-FAM-2026-001`).
3. **Um prompt executável (doc 4, Prompt 06) manda gravar no `product_catalog` códigos que vêm do doc 9**,
   que é "PROPOSTA — PENDENTE DE VALIDAÇÃO HUMANA" no próprio cabeçalho. Não deve ser executado sem
   resolver o item 1.
4. **O doc 3 (inventário de 20/08) declara "pendente" trabalho que o repositório já entregou** (G02, G03,
   G04, G06) — não serve como leitura de estado atual; usar apenas como registro histórico.
5. Nenhuma das cinco contradições acima aparece nas 5 decisões abertas nem nos 15 itens da fila P0/P1/P2
   do Artefato Mestre de Resgate (02/09) — ou seja, elas ficaram de fora da última consolidação de
   prioridades, não por terem sido resolvidas, mas por não terem sido citadas.

## 5. Perguntas de decisão que só a Proprietária pode responder

1. **Formato da régua D0→D365**: dias fixos (como D0–D30 hoje) estendidos até D365, ou cadência por
   evento (Réguas D/E, sem dia fixo) cobrindo o mesmo território? As duas coisas já existem como
   proposta — nenhuma foi implementada além de D30.
2. **A vedação escrita em `PROMPT-EIXO-COMUNICACAO-IMPLANTACAO-FUTURA.md:46`** ("nenhuma cadência deve
   ser uma sequência fixa universal") precisa ser formalmente revista/revogada antes de construir uma
   régua fixa D0→D365, ou a decisão de hoje já a substitui?
3. **Produtos-pai**: a Proprietária sinalizou nesta sessão acreditar que já existe "material consolidado
   para executar em todos os níveis junto com jornada" — mas a varredura desta rodada (e a reconciliação
   já registrada em `2026-09-04_RECONCILIACAO-PP01-14-vs-35-SKUS-ATIVOS.md`) encontrou três desenhos
   concorrentes, nenhum ratificado, com 15 códigos sem correspondência real no catálogo de 35 SKUs
   ativos. Qual documento especificamente ela considera pronto para execução? Sem essa resposta, nenhuma
   implementação de produto-pai foi iniciada nesta rodada — o risco de travar Planejador/proposta/App
   numa taxonomia que depois precisa ser desfeita é alto e a ação é difícil de reverter.

## 6. Próximos passos

1. Aguardar resposta às 3 perguntas da seção 5 antes de escrever qualquer código de cadência longa ou
   de produto-pai.
2. Se a resposta à pergunta 1 for "dias fixos": desenhar a extensão de `CADENCIA_D0_D30` para um período
   maior, decidindo os marcos intermediários (a régua de hoje não tem nenhum dado real para D60–D365,
   então os marcos precisam ser definidos do zero, não descobertos em documento).
3. Reconciliar a contradição C-01 da seção 4 (duas famílias de código de produto-pai) antes ou junto com
   a decisão de produto-pai — são a mesma categoria de problema.

## 7. O que este documento NÃO decide

- **Não decide** o formato final da régua D0→D365 (dias fixos vs. evento) — pergunta em aberto (seção 5).
- **Não decide** qual dos três desenhos de produto-pai é a taxonomia final.
- **Não revoga nem confirma** a vedação escrita contra cadência fixa universal.
- **Não altera nenhuma linha de banco, nenhum arquivo de código, nenhuma migration.**
