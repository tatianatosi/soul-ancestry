# Pente-fino — Pendências e Entregas (dias anteriores + 01/09/2026)

```yaml
status: rascunho — aguardando confirmação explícita antes de publicar no GitHub
versão: 1.0
data: 2026-09-01
projeto: Clube Ancestral
classificação: auditoria + inventário de pendências
responsável pela decisão: Proprietária do Clube Ancestral
fontes: histórico real desta sessão (commits, PRs, testes reais da proprietária em
  preview), GitHub tatianatosi/soul-ancestry, arquivo anexado
  "Auditoria de Prompts, Fichas Canônicas, CA-UX-04 e Política Unificada" (v1.0,
  01/09/2026, enviado pela proprietária)
documento relacionado (não substituído): docs/politicas/PENTE-FINO-IMPLANTACAO-PENDENCIAS-2026-08-30.md
  — este documento é a continuação datada de 01/09, não uma revisão do de 30/08.
```

## 1. Objetivo e escopo

Responder ao pedido da proprietária: "Faça um pente fino de todas as pendências e do
que já foi entregue dos dias anteriores e do dia de hoje" — e, em relação aos dados
pessoais, confirmar a inclusão dos campos da procuração, incluindo profissão.

Cobre dois blocos:

1. Verificação real, arquivo por arquivo, das afirmações do documento "Auditoria de
   Prompts, Fichas Canônicas, CA-UX-04 e Política Unificada" que a proprietária
   enviou junto com este pedido.
2. Inventário consolidado do que foi entregue (código validado, especificação,
   arquivamento) e do que segue pendente de decisão da proprietária, cobrindo os
   dias anteriores e o dia de hoje.

## 2. Contexto, premissas e evidências

Sessão de trabalho contínua no repositório `tatianatosi/soul-ancestry`, branch
`docs/mapa-autoridade-admin-desk-app` (PR #34), com validação real feita pela
proprietária em preview (não apenas `tsc`/testes/build verdes).

## 3. Verificação da "Auditoria de Prompts, Fichas Canônicas, CA-UX-04 e Política Unificada"

Cada arquivo citado na tabela "Achados no GitHub" do documento enviado foi conferido
diretamente no repositório (não presumido):

| Documento citado | Existe de verdade? | Nota |
|---|---|---|
| `docs/arquitetura/CA-UX-03_Navegacao_Desk_8_Grupos.md` | Sim | Já em `main`, não é exclusivo da PR #34 |
| `docs/arquitetura/CA-UX-04_Marketing_e_Administracao.md` | Sim | Idem |
| `docs/arquitetura/CA-UX-04_Separacao_Prototipo_Produto.md` | Sim | Idem |
| `docs/arquitetura/CA-UX-04_Matriz_Marketing_Comercial.csv` | Sim | Idem |
| `docs/arquitetura/CA-UX-03_Matriz_Rotas_e_Modulos.csv` | Sim | Idem |
| `docs/arquitetura/CA-UX-03_Metricas_Canonicas.md` | Sim | Idem |
| `docs/politicas/TAXONOMIA-CANONICA-MOCKUP-APROVADO.md` | Sim | Idem |
| `docs/arquitetura/PESSOA-CANONICA-MODELO-DE-CAMPOS-2026-08-31.md` | Sim | Criado nesta sessão, 31/08 |
| `docs/arquitetura/MOTOR-CONTRATUAL-INVENTARIO-E-DE-PARA-2026-08-31.md` | Sim | Criado nesta sessão, 31/08 |
| `docs/politicas/PROMPT-POLITICA-UNIFICADA-CASOS-FAMILIARES.md` | Sim | — |
| `docs/politicas/PROMPT-MOTORES-UNIFICADOS-CRM-VIVO.md` | Sim | — |
| `docs/politicas/ADENDO-PAINEL-CALLS-DISCOVERY-2026-08-31.md` | Sim | Arquivado nesta sessão, 31/08 |
| `docs/politicas/PROMPT-REVISAO-MOTORES-E-CASO-360.md` | Sim | — |
| `docs/politicas/PROMPT-CORRECAO-ADMIN-VISAO-CLIENTE.md` | Sim | — |
| `docs/politicas/PROMPT-VISAO-PRODUTO-ARQUITETURA-MOCKUPS-LANDINGS.md` | Sim | — |
| `docs/prompts/*` (série de 8 fichas propostas) | **Não existe nada em `docs/prompts/`** | Confirma a lacuna real apontada pelo documento — nenhum dos 8 prompts de ficha foi criado ainda |

**Uma correção de detalhe, sem impacto na conclusão:** o documento enviado descreve
G02/G03/G04/G06 (Pessoas e Linhagens, Biblioteca de Evidências, Pesquisa/Documentos,
Achados e Encontros) como estando em "documentos recuperados de Pessoas/Linhagens...".
Na prática, esses quatro arquivos vivem na raiz de `docs/` (`docs/G02_...`,
`docs/G03_...`, `docs/G04_...`, `docs/G06_...`), não dentro de
`docs/evolucao/recuperados/`. Conteúdo e existência confirmados; só o caminho estava
impreciso.

**Conclusão da verificação:** o documento enviado é factualmente confiável. A lacuna
central que ele aponta — nenhuma "Ficha 360" indexada e canônica por entidade (Pessoa,
Núcleo, Genealogia, Lead, Contrato) — é real e confirmada: `docs/prompts/` não existe.
A correção conceitual "8 grupos vivos, não 6 blocos" também bate com o que esta sessão
já havia estabelecido de forma independente, em auditoria anterior.

## 4. Dados pessoais — confirmação sobre a procuração e profissão

A proprietária pediu para confirmar que os dados da procuração foram incluídos,
citando especificamente que havia esquecido "profissão".

**Profissão já está no modelo.** Foi incluída na revisão de 31/08 contra o texto real
da procuração (commit `32e6926`), seção 3.1 — Identificação, do documento
`docs/arquitetura/PESSOA-CANONICA-MODELO-DE-CAMPOS-2026-08-31.md`:

> "Profissão — texto, opcional — Novo (revisão da procuração). Aparece na
> qualificação de partes em instrumentos legais (ex.: 'pesquisadora e consultora em
> CIDADANIA'); ausente do modelo anterior."

Junto com profissão, os outros quatro campos revelados pela mesma procuração já estão
no modelo: sexo/gênero, nacionalidade, RG separado em número + órgão expedidor/UF, e
"procurador(a)" como tipo de relação entre duas Pessoas Canônicas. Nenhuma ação nova é
necessária neste ponto — está confirmado, não pendente.

## 5. Decisões e regras aplicadas neste documento

- Nenhum código, schema, RLS, sessão ou permissão foi alterado para produzir este
  pente-fino — é levantamento e verificação.
- Este documento segue o formato exigido pelo "Prompt de Uso Diário — Artefato
  Primeiro" (PR #38, mesclada hoje): documento primeiro, resumo no chat depois,
  confirmação explícita antes de publicar no GitHub.
- Por isso este arquivo **ainda não foi commitado nem enviado ao GitHub** — está
  escrito localmente no caminho que será usado, aguardando sua confirmação (ver §8).

## 6. Inventário consolidado — o que foi entregue

### 6.1 Dias anteriores (até 31/08/2026)

- Mapa de Autoridade Admin fechado: 10/10 áreas com evidência real de código.
- PR #39 (Comercial/Financeiro — gravação verificada em 11 funções): **testada e
  confirmada por você** em preview real (proposta e fatura, salvar, F5, persistiu).
- PR #40 (Contrato — remove 3 botões redundantes): testada por você; revelou o
  problema real do objeto do contrato não vindo dos Parâmetros.
- PRs #31, #32, #33, #35, #36 abertas, aguardando seu teste manual.
- Especificação Motor Contratual (causa raiz do bug do objeto do contrato,
  3 decisões abertas).
- Especificação Pessoa Canônica (modelo de campos, revisado contra a procuração
  real, 4 decisões abertas).
- 4 bugs de gravação reais encontrados no seu teste, com causa em código
  confirmada (UUID em `review_owner_user_id`, status de `consent_records`,
  `requested_document_type` obrigatório, falta de feedback em "Abrir tarefa
  operacional").
- PRs #10 e #28 fechadas, a seu pedido. PR #30 mantida aberta, ligada à política
  unificada.

### 6.2 Hoje (01/09/2026)

- PR #37 (política de entrega de artefatos) e PR #38 (prompt diário artefato
  primeiro) **mescladas**, como você autorizou.
- Artefato "Relatório do dia" atualizado para v9, com os 4 bugs e as 2
  especificações novas.
- Documento consolidado CA-04 (CRM Mestre, Discovery e Handoff, v1.0.1) arquivado
  em `docs/arquitetura/`, com nota apontando a tensão real com o código: o
  documento assume Painel de Calls e CRM Mestre como camadas já separadas, mas o
  Mapa já confirmou que hoje `/calls` e Leads compartilham a mesma tabela/função —
  não existe CRM Mestre separado em código ainda.
- Versão v1.0 (supersedida) do mesmo documento arquivada como histórico.
- Confirmação de que o modelo da Pessoa Canônica já reflete o texto real da
  procuração (sexo/gênero, nacionalidade, profissão, RG em dois subcampos,
  procurador como relação).
- Este pente-fino, verificando a nova auditoria enviada e consolidando pendências.

## 7. Pendências — o que precisa da sua decisão agora

Nenhum item novo de código nem de arquitetura foi decidido nesta seção — é o
inventário do que já estava pendente, mais o que a nova auditoria revelou.

| # | Pendência | Origem | Precisa de você |
|---|---|---|---|
| 1 | Corrigir os 4 bugs de gravação agora ou esperar as especificações | Teste real de hoje | Fix agora / esperar |
| 2 | 3 decisões do Motor Contratual (resync automático/manual; campo livre da Jornada; `proposals` alimenta parâmetros ou não) | Especificação 31/08 | Escolher opção em cada uma |
| 3 | 4 decisões da Pessoa Canônica (tabela nova vs. expandir `clientes`; dependentes como lista ou texto; país lista curta vs. completa; estratégia de migração) | Especificação 31/08 | Escolher opção em cada uma |
| 4 | PR #33 — só mescla com sua confirmação de teste manual | Autorização condicional sua | Confirmar teste |
| 5 | PR #36 — aprovar o princípio "mapear sem modificar" + a migration aditiva de aliases | Especificação de política unificada | Aprovar ou não |
| 6 | 13 decisões humanas do CA-04 CRM Mestre (nenhuma respondida) | Artefato consolidado v1.0.1 | Ver Parte III do documento arquivado |
| 7 | **Nova:** criar a série de 8 prompts de ficha (`docs/prompts/`) proposta pela auditoria de hoje, ou manter só como proposta por ora | Auditoria de hoje | Autorizar início da especificação, como fez com Motor Contratual/Pessoa Canônica |

O item 7 é o único genuinamente novo deste pente-fino: a auditoria que você enviou
propõe uma série de 8 documentos de especificação (Pessoa 360, Núcleo 360, Genealogia
360, Lead/CRM, Contrato, Visão Admin/App Cliente, Redesenho de cards, Radar
jurídico) — nenhum ainda existe. Segue a mesma régua já usada para Motor Contratual e
Pessoa Canônica: é especificação, não implementação, e só começa com sua autorização
explícita.

## 8. Antes de publicar no GitHub — confirmação necessária

Conforme a Política de Entrega de Artefatos e o Prompt de Uso Diário (PR #37/#38),
publicar isto no GitHub requer sua confirmação explícita dos seguintes pontos:

- **Repositório:** `tatianatosi/soul-ancestry`
- **Branch:** `docs/mapa-autoridade-admin-desk-app` (mesma da PR #34 já aberta, onde
  os demais documentos de hoje foram adicionados)
- **Caminho do arquivo:** `docs/auditorias/PENTE-FINO-PENDENCIAS-E-ENTREGAS-2026-09-01.md`
- **Tipo de ação:** novo arquivo, sem alterar nenhum arquivo existente
- **Mensagem de commit (resumo):** "docs: pente-fino de pendências e entregas
  (01/09/2026), verifica auditoria de fichas CA-UX-04 enviada pela proprietária"
- **PR:** já existe (PR #34, draft) — não abre PR nova, só adiciona commit
- **Conteúdo:** exatamente o texto deste documento

## 9. Riscos, limites e fora de escopo

Não altera schema, RLS, sessão, permissões ou qualquer sistema. Não cria os 8 prompts
de ficha (item 7 da pendência). Não responde nenhuma das 13 decisões do CA-04. Não
migra dado real de nenhuma pessoa.

## 10. Critério de aceite

- Toda afirmação da auditoria enviada foi checada contra o repositório real, não
  presumida.
- Profissão e os demais campos da procuração confirmados como já presentes no modelo,
  com citação do trecho real.
- Pendências de dias anteriores e de hoje consolidadas em uma única lista, sem
  duplicar nem inventar item novo além do que a auditoria de hoje trouxe.

## 11. Próximos passos

Aguardar sua confirmação para publicar este documento (§8) e sua decisão sobre os 7
itens pendentes (§7) — em particular se autoriza o início da especificação da série de
8 prompts de ficha.
