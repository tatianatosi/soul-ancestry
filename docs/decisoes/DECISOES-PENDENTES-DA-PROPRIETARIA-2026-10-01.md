# Decisões pendentes da Proprietária — registro vivo

- **Status:** aberto
- **Data desta apuração:** 2026-10-01
- **Responsável pela decisão:** Proprietária do Clube Ancestral (tati@pluggedresearch.com)
- **Como foi apurado:** leitura direta dos 9 documentos enviados em 01/10 + consultas
  somente-leitura ao banco conectado ao Lovable (`liiqqibnirnpnvjmjrpj`), pelo canal
  `query_database`. Nenhuma linha foi alterada para produzir este documento.
- **Por que este arquivo existe:** a lista estava só no arquivo de plano da sessão,
  fora do diretório do projeto — o app não conseguia abrir. Agora é versionada.

Nada aqui é assumido por hipótese. Cada item diz o que trava e onde está a evidência.

---

## 1. Achados novos de 01/10 — medidos no banco, não em documento

Estes dois não estavam em nenhuma lista anterior. Apareceram ao cruzar o
documento do Planejador (03/09) com o estado real do banco.

### 1.1 Os 43 marcos jurídicos estão todos `a_revisar` — o validador não tem marco em dia em nenhum país

| Tabela | Situação real | Quantas |
|---|---|---|
| `versioned_legal_rules` | `aprovado` | **20 (todas)** |
| `legal_reference_milestones` | `a_revisar` / `em_revisao` | **43 (todas)** |
| `legal_reference_milestones` | `vigente` / `homologado` | **0** |

`avaliarValidacaoJuridicaCaso` (`src/lib/validacao-juridica-caso.ts:112`) só considera
um marco em dia quando `status = 'vigente'` **e** `lifecycle_status ∈ (vigente,
homologado)`. Como nenhum marco está nesse estado, **todo marco de todo país aparece
como pendência no validador**, nos 20 países com trilha.

**Decisão necessária:** promover marco de `a_revisar` para `vigente` é ato de revisão
jurídica, com responsável nomeado e data — exatamente o que o seu próprio modelo de
regra exige ("responsável jurídico e data da última revisão", documento de 03/09 §2).
Eu não promovo 43 marcos por conta própria. Preciso saber quais marcos estão de fato
revisados e por quem.

### 1.2 Vinte países têm trilha jurídica e regra aprovada; só dois têm fonte de pesquisa

Trilhas e regras aprovadas existem para: Alemanha, Áustria, Bélgica, Brasil, Croácia,
Eslovênia, Espanha, Estônia, França, Hungria, Irlanda, Itália, Letônia, Lituânia,
Luxemburgo, Países Baixos, Polônia, Portugal, Romênia, Tchéquia.

Fontes em `genealogical_sources_catalog` hoje: **Brasil 2, Itália 2, todos os outros 0.**

As planilhas que você enviou cobrem 9 desses países (Brasil, Itália, Portugal, Espanha,
Alemanha, Áustria, Polônia, Tchéquia, Croácia). Depois de eu semear tudo, **11 países
continuam com trilha jurídica e nenhuma base de pesquisa documentada**:

> Bélgica · Eslovênia · Estônia · França · Hungria · Irlanda · Letônia · Lituânia ·
> Luxemburgo · Países Baixos · Romênia

**Decisão necessária:** indicar a fonte de pesquisa de cada um, ou declarar que a
trilha fica sem pesquisa própria por ora. Não invento nome de arquivo nem URL
(sua decisão 10 de 01/10).

---

## 2. Decisões do Adendo Bloco 5A ainda abertas

D-01, D-04, D-05 e D-06 você aprovou em 01/10 e estão sendo gravadas no código.
Estas oito seguem abertas (§10 do Adendo):

| # | Decisão | Área | O que trava |
|---|---|---|---|
| D-02 | Fonte piloto: qual base do Brasil e qual da Itália começa primeiro | Pesquisa | foco inicial do piloto 5A.1 |
| D-03 | País piloto: confirmar Brasil + Itália ou outro par | Comercial/Pesquisa | nacionalidades do piloto |
| D-07 | Quem aprova PDF, qual conteúdo e qual template | Produto | geração de PDF ao cliente |
| D-08 | Quando imagem de terceiro pode entrar em PDF/Caderno | Legal | reprodução de acervo |
| D-09 | Quais fontes podem ser classificadas `M3-APROVADA` | Técnico/Legal | qualquer integração (Bloco 5B) |
| D-10 | Quais etapas/famílias comerciais liberam entrega | Comercial | matriz produto × entregável |
| D-11 | Glossário final de termos permitidos e proibidos | Linguagem | checker de conteúdo narrativo |
| D-12 | Política de cache e TTL por tipo de dado | Técnico | backend futuro |

---

## 3. Pendências do documento do Planejador (03/09) — verificadas hoje no banco

O documento é prompt executável, portanto aprovado. Verifiquei no catálogo real
(organização Clube Ancestral, 46 SKUs) o que das suas §6 continua aberto.

| Pendência do documento | Estado real hoje | Aberta? |
|---|---|---|
| Homologar CA-CID-001 × CA-CID-024 | `CA-CID-024` **não existe** no catálogo real | resolvida na prática — confirmar que foi intencional |
| Fundir CA-CID-002 + variantes A/B/C/D | As 4 variantes existem, `homologado`, mas `ofertável = false` e Asaas `pendente` | **sim** — neutralizadas, não fundidas |
| CA-CID-019 × CA-CID-020 (sobreposição) | **Ambos** `homologado`, **ofertáveis**, R$ 4.500, Asaas validado | **sim, e é a mais urgente** — dois SKUs ofertáveis para o mesmo conceito e preço |
| Escopo CA-CID-003 × CA-POS-001 | `CA-POS-001` **não existe** no catálogo real | resolvida na prática |
| Conjunto inicial de países por bloco regional e prioridade comercial | 20 países com trilha, sem prioridade comercial registrada | **sim** |
| Hierarquia produto-pai × SKU | `product_catalog.produto_pai_id` está **vazio em todos os 46 SKUs** | **sim** — a matriz §4 do documento não está gravada |

Nota de schema: `product_catalog.produto_pai_id` é um UUID auto-referente (SKU → SKU),
enquanto `case_plans.produto_pai_id` guarda o código `PP-01…09`. São coisas diferentes
com o mesmo nome de coluna. O caso da Ana está com `PP-03`, rota Áustria.

---

## 4. Decisões estruturais de longa data

| Decisão | O que trava |
|---|---|
| Percentual no 4º eixo "Elegibilidade" do Radar — você liberou o percentual do **heatmap de aderência**; o eixo Elegibilidade continua sem número | copy do Radar no App |
| Preços no App (R$ 269 / 19 / 39 do mockup) — exige autorização escrita (A7) | bloco de plano na Conta |
| `painel-dia.tsx` × `/painel` — qual é a fonte viva do Painel Hoje | nenhum agente toca nos dois arquivos |
| Taxonomia do Desk: 6 grupos vigentes × 8 do texto da memória permanente | menu do Desk |
| Integração externa (Drive, Dropbox, FamilySearch, Antenati, Asaas) e qualquer envio, assinatura ou cobrança para fora | fora do alcance desta sessão |
| Declarar `COMPROVADO_EM_USO` com os prints autenticados (inicial, ação, confirmação, releitura, integração) | arquivamento de qualquer motor |

---

## 5. Fatos humanos do caso Ana — o sistema mostra, não escolhe

Nenhum destes é bug: são decisões sobre a realidade da família.

1. Felipe é menor e a representação legal não está marcada como documentada.
2. A via do lead (descendência) divergia da via do caso (reparação histórica).
3. Maria (casamento Silveira, 1912) está como contratante signatária — se é ancestral,
   precisa sair de contratante e entrar na Pesquisa.
4. O dossiê-mãe tem duas referências concorrentes.
5. CPF, RG, telefone e naturalidade de Alice e Felipe não são conhecidos pelo sistema —
   é pendência declarada, não reserva a remover do código.

---

## 6. Limpeza do demo — autorizada por você em 01/10, pegada medida

| Onde | Linhas |
|---|---|
| Organizações `DEMO — Alfa/Beta (fictícia)` | 2 |
| `product_catalog` dentro das orgs DEMO | 72 |
| `crm_casos` / `clientes` dentro das orgs DEMO | 0 / 0 |
| `clientes` com "demo/teste" no nome, na organização real | 3 |
| `crm_casos` com "demo/teste" no nome ou código, na organização real | 2 |
| `leads` com "demo/teste" no nome, na organização real | 5 |

Vou tratar como **arquivamento lógico com reversão**, não `DELETE` físico — é o que o
AGENTS.md exige ("não apagar sem classificação, dependência, arquivamento e reversão";
"bloqueio de exclusão física crítica"). As telas já deixaram de oferecer esses registros
no Corte 1c. Se você quiser exclusão física mesmo, me diga explicitamente e eu faço
com manifesto de reversão antes.
