# Mapa de dados: Lead → Cliente/Caso → Contrato (2026-09-27)

```yaml
status: executado (documental + 1 gap fechado no Corte 4)
corte: 5 de 5 — plano "motor jurídico + Caso 360 unificado + varredura
  Pesquisa/Biblioteca Mestre + mapa de dados lead→cliente"
responsável pela decisão: Proprietária do Clube Ancestral
```

## Finalidade

Responder à pergunta direta da Proprietária: "o que realmente foi
unificado e o que persiste" entre as fichas (Lead/CRM Vivo, Ficha
Operacional, Ficha Piloto, Ficha Genealógica, Pessoa 360, Contrato), com
o exemplo concreto da Ana — poucos dados no lead, mais no Discovery, dados
completos no contrato, "um fluxo só". Rastreamento feito por leitura
direta do código (não por suposição), campo a campo, tabela a tabela.

## A cadeia completa, verificada no código

| Fase | Tela/aba | Tabela | Campos principais | Como chega da fase anterior |
|---|---|---|---|---|
| **Lead** | CRM Vivo (intake) | `leads` (migração `20260816151056`) | `nome`, `email`, `telefone`, `origem`, `pais_interesse`, `estagio` | Digitação original |
| **Discovery / Mesa de Calls** | `painel-calls.tsx` → `salvarLeadDesk` | `leads` (mesma linha — confirmado por múltiplos `ALTER TABLE ADD COLUMN`, nunca tabela nova) | `consentimento_status/em/canal`, campos SPIN, `nacionalidades_interesse[]`, `pais_linha_prioritaria`, `trilha_referencia_id`, `marco_referencia_id`, `proxima_acao/_em`, `status_call`, `elegibilidade_preliminar` | Mesma linha do lead — acrescida, nunca copiada |
| **Handoff (conversão)** | `handoff-discovery.functions.ts` | cria `clientes` (se não reusar) + `crm_casos`; grava `leads.case_id` | `clientes`: nome/email/telefone/origem/pais_interesse via `payloadClienteDoLead` | Cópia única (`inserirComVerificacao`), decidida por `decidirClienteDoHandoff` (e-mail exato = reusa; telefone/nome pedem confirmação humana — nunca fusão automática, Fase 0 revogou isso) |
| **Ficha Operacional** | `casos.$caseId.index.tsx` (Caso 360) | `crm_casos`, `case_members` | `codigo`, `status`, `proxima_acao`, `responsavel_principal`, membros (`nome`/`parentesco`/`data_nascimento`) | Leitura direta — canônico, sem cópia |
| **Ficha Piloto** | `ficha-piloto-genealogica.functions.ts` | `research_cases` + `research_people` (via `case_id`) | `canonical_name`, `birth_date`, `birth_place`, `nationality_context` | Só leitura — mesmas tabelas da Ficha Genealógica |
| **Ficha Genealógica / Pesquisa** | `pessoas-linhagens.functions.ts` | `research_people` + `genealogical_person_profiles` | `nascimento_data/localidade`, `morte_data/localidade`, `sexo` | `genealogical_person_profiles.client_id` (nullable) — vínculo manual, nunca fusão automática |
| **Pessoa 360** | `pessoa.functions.ts` | `clientes` | CPF, endereço estruturado, RG, estado civil, profissão; também lê nascimento/óbito do perfil vinculado quando existe (correção P32) | CPF/endereço/RG/estado civil/profissão nunca existiram em `leads`/Discovery — primeira digitação aqui |
| **Ficha Contrato** | `contratos.functions.ts`, `reconciliar-contato-partes.tsx` | `contract_parties` | `person_name`, `document_number`, `email`, `phone`, `address` | Snapshot cópia única em `enviarParaAssinatura`; reconciliado por `sincronizarPessoaDoCaso` (CPF), `sincronizarContatoPartesDoCaso` (nome/e-mail/telefone/**endereço, Corte 4**) — só preenche vazio, nunca sobrescreve |

### O exemplo da Ana, na prática

1. **Lead**: nome, e-mail, telefone, país de interesse — só isso.
2. **Discovery**: a mesma linha (`leads`) ganha consentimento, respostas do
   SPIN, país/linha prioritária, trilha jurídica de referência, próxima
   ação — nunca uma segunda ficha.
3. **Handoff**: `clientes` + `crm_casos` nascem a partir do lead — nome/
   e-mail/telefone copiados uma vez (não há segunda digitação).
4. **Pessoa 360**: aqui, e só aqui, entram CPF, endereço estruturado, RG,
   estado civil, profissão — dados que a jornada de Discovery nunca
   capturou (correto: não fazem sentido numa call inicial).
5. **Contrato**: no envio para assinatura, o snapshot (`contract_parties`)
   copia nome/e-mail/telefone/endereço de `clientes` — e, desde a Fase 0 +
   Corte 4, um mecanismo de reconciliação sem-dedup evita que a equipe
   redigite esses 4 campos se já estiverem preenchidos no cadastro
   canônico (só preenche o vazio; divergência é sinal, nunca fusão
   automática).

## Pontos de ruptura encontrados — 1 fechado, 4 declarados

| # | Ruptura | Estado |
|---|---|---|
| 1 | Endereço (`clientes` estruturado × `contract_parties.address` texto livre) nunca comparado | **Fechado no Corte 4** (`montarEnderecoCanonico` + `sincronizarContatoPartesDoCaso`) |
| 2 | `leads.nacionalidades_interesse` (array) vira texto livre dentro de `clientes.observacoes` no handoff — perda de estrutura | **Declarado, não construído** — exigiria nova coluna array em `clientes`, decisão de schema fora do escopo desta rodada |
| 3 | Sem `lead_id` persistente em `clientes` — vínculo lead↔cliente é uma decisão de um instante (`decidirClienteDoHandoff`), não reconciliado depois | **Declarado, não construído** — adicionar FK persistente é decisão de arquitetura |
| 4 | `research_people.birth_date`/`birth_place` são colunas mortas (nenhum escritor as preenche) — a Ficha Piloto já mostra o dado real vindo de `genealogical_person_profiles` quando existe (correção P32), mas as colunas continuam lá, vazias | **Documentado** — não é bug ativo (já contornado), mas as colunas mortas continuam existindo |
| 5 | `genealogical_person_profiles.client_id` é vínculo manual — nunca fusão automática com `clientes`/`case_members` por nome | **Por design** — mesma regra da Fase 0 (revogação de fusão automática por nome), não é um bug a corrigir |

## Apêndice — varredura de Pesquisa/Centro de Inteligência/Biblioteca Mestre (2026-09-27)

A Proprietária pediu nova varredura sistêmica, alegando que adendos
anteriores sobre esses módulos não foram executados. Achado, por leitura
direta do código e dos documentos:

- **Assistente de Pesquisa Genealógica**: já existia e funcionava
  (`/pesquisa-assistente`, IA real via Lovable AI Gateway), mas lia
  tabelas erradas/vazias — **corrigido no Corte 1** desta mesma rodada
  (agora lê `research_case_hypotheses`/`research_evidence_items`, as
  reais).
- **Centro de Inteligência**: já foi executado (CA11, 09/09/2026) como
  camada de roteamento sobre `/biblioteca`, mapeando 9 áreas às suas telas
  reais. Uma auditoria anterior (2026-09-03) já recomendou explicitamente
  **não** criar um módulo/aba separado com esse nome — decisão já tomada,
  não é pendência a reabrir.
- **Biblioteca Mestre**: construída e majoritariamente conectada
  (Bases Genealógicas, Dicionários, Trilhas, Acervo, Jurídico, Modelos
  F1/F2 — todos já ligados a Pesquisa/Comercial).
- **Bases Genealógicas**: catálogo estático real
  (`genealogical_sources_catalog`), mas **sem nenhuma integração externa
  viva** (FamilySearch/Portale Antenati/Ancestry) — nenhum SDK, OAuth ou
  cliente de API existe no repositório. **Declarado, não construído**:
  exige decisão de integração externa (custo, escopo, credenciais) antes
  de qualquer código.
- **Motor jurídico automático**: construído no **Corte 2** desta rodada
  (3 índices — continuidade da linha, completude documental, confiabilidade
  jurídica — nunca um score único, por proibição explícita da
  especificação original).
- **Camada de leitura unificada do Caso 360**: construída no **Corte 3**
  desta rodada (Cadeia Caso 360, na Visão do caso).

## Verificação

`tsc --noEmit` limpo. Suíte completa e `vite build` — ver rodapé do
commit. Este corte é majoritariamente documental — o único código deste
corte específico é este arquivo; os gaps de código (motor jurídico,
Cadeia Caso 360, endereço, assistente de pesquisa) já foram fechados nos
Cortes 1–4, cada um com seu próprio commit/SHA.

## Decisões humanas ainda pendentes (não resolvidas por este mapa)

1. `nacionalidades_interesse` estruturado em `clientes` (nova coluna array)?
2. `lead_id` persistente em `clientes` (nova FK)?
3. Integração externa real com bases genealógicas (FamilySearch/Antenati/etc.)?
4. Qual dos 3 sistemas de hipótese (`research_hypotheses` /
   `research_case_hypotheses` / `research_cases.internal_hypothesis`) é o
   canônico daqui pra frente (achado da rodada anterior, ainda em aberto)?
