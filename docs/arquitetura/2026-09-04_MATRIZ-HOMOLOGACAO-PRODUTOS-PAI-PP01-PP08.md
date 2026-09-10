# Matriz de homologação: Produtos-Pai PP-01–PP-08 (fases da vida) × SKUs reais

```yaml
status: matriz de homologação — pendente de decisão da Proprietária
versão: 1.0
data: 2026-09-04
projeto: Clube Ancestral
classificação: pente-fino obrigatório (seção 9 do "Resgate canônico — Produtos-Pai,
  SKUs e Planejador Universal vivo", 03/09/2026)
responsável pela decisão: Proprietária Administradora do Clube Ancestral
fonte: docs/... "Resgate canônico — Produtos-Pai, SKUs e Planejador Universal vivo"
  (enviado 04/09, data do documento 03/09) — cruzado ao vivo contra product_catalog
  (Supabase, projeto zsxpdbhdvbuulwpepemd), 35 códigos ativos, em 04/09/2026.
escopo: somente leitura. Nenhuma escrita em product_catalog além do que já foi
  arquivado antes desta tarefa (55 duplicatas). Nenhum código alterado.
```

## Correção de rumo registrada

O documento-fonte deste mapeamento é explícito: a taxonomia **P01–P09** que os PRs #79 e
#82 usaram (organizada por bloco histórico de cidadania/país, do documento
`2026-09-02_PLANEJADOR-UNIVERSAL-PRODUTOS-PAI-JORNADA-REVISAO-FINAL.md`) **não deve ser
usada isoladamente para orientar o novo Planejador Universal** — ela representa "material
de saneamento anterior". A arquitetura corrigida organiza por **fase da vida** primeiro,
não por bloco de cidadania:

```
Fases da vida / necessidades da família
→ Produtos-Pai (capacidade e promessa de valor)
→ Ofertas e SKUs-filho homologados
```

Esta matriz usa a taxonomia nova (**PP-01 a PP-08**), não a antiga. Onde os dois esquemas
discordam sobre um `code`, registro os dois abaixo — a decisão de qual arquitetura vale é
da Proprietária, não miuha.

## 1. Matriz de homologação por Produto-Pai

| Produto-Pai | Código técnico | Fase da vida | SKUs-filho existentes hoje | SKUs a arquivar/reconciliar | Países/rotas aplicáveis | Estado de homologação | Dono da decisão |
|---|---|---|---|---|---|---|---|
| Descoberta Ancestral e Diagnóstico | PP-01 | Descobrir | `CA-CID-001` (parcial — ver nota) | `CA-CID-022`/`CA-CID-026` (AncestralScan, `MANTER` em 25/08, **ausentes hoje** — ver `2026-09-04_SKUS-91-REAPROVEITAMENTO-PRODUTO-PAI.md` §2) | Nenhum campo de país estruturado | `CA-CID-001` = `bloqueado` | Proprietária — decidir se reativa AncestralScan como SKU-filho de PP-01 |
| Pesquisa Genealógica e Reconstrução | PP-02 | Descobrir | `CA-HIST-001`, `CA-HIST-002`, `CA-HIST-004`, `CA-HIST-005` | Nenhum extra além do já arquivado | Não estruturado | Todos `bloqueado`, exceto nenhum homologado | Proprietária |
| Estratégia de Cidadania e Rota Jurídico-Documental | PP-03 | Decidir | `CA-CID-023` (âncora, "Jornada completa") | `CA-CID-021` (combo cruza PP-01+PP-06, sem produto-pai único — mesmo achado do PR #82 sob a taxonomia antiga) | Itália (texto livre no nome) | `bloqueado` | Proprietária |
| Dossiê, Documentação e Prontidão | PP-04 | Preparar | `CA-CID-002`, `002A`, `002B`, `002C`, `002D`, `CA-CID-019`, `CA-CID-020` | Nenhum extra | Não estruturado | Todos `bloqueado` | Proprietária |
| Gestão de Processo, Acompanhamento e Coordenação Familiar | PP-05 | Executar | `CA-CID-025` (`homologado`, elegível p/ proposta) | `CA-FAM-002`/`CA-WPP-002` — ambíguos entre PP-05 e PP-08, ver nota | Não estruturado | `CA-CID-025` homologado; resto `bloqueado` | Proprietária — resolver ambiguidade PP-05×PP-08 |
| Reconhecimento, Registros e Vida Cidadã | PP-06 | Transicionar | `CA-CID-006`, `CA-CID-009`, `CA-CID-016`, `CA-CID-018` | 6 códigos de registro pós-cidadania (`CA-CID-011/012/013/014/015/017`) marcados `AJUSTAR` em 25/08, **ausentes hoje** (§2 do doc de reaproveitamento) | Itália (regularização) | Todos `em_revisao`/`bloqueado` | Proprietária — decidir se reativa o bloco pós-cidadania |
| Memória, Acervo e Legado Familiar | PP-07 | Preservar | `CA-IND-001`, `CA-IND-002`, `CA-IND-005`, `CA-IND-006`, `CA-MEM-003`, `CA-MEM-004`, `CA-MEM-008`, `CA-COMBO-001` | Nenhum extra | Não aplicável (produto não-jurídico) | `CA-MEM-003` `em_revisao`; resto `bloqueado` | Proprietária |
| Continuidade, Manutenção e Relação com a Família | PP-08 | Manter | `CA-ASS-001..005`; possivelmente `CA-FAM-002`/`CA-WPP-002` (ver nota PP-05) | `CA-ASS-006` (`AJUSTAR` em 25/08, **ausente hoje**) | Não aplicável | `CA-ASS-002`/`CA-ASS-005` `homologado`; resto `em_revisao` | Proprietária |

**Nota sobre `CA-CID-001`**: `papel_comercial` = "Diagnóstico e direção" bate com a promessa
de PP-01, mas `tipo_oferta` = `produto_pai` e `familia_comercial` = "cidadania" (não
"descoberta") sugerem que esse código foi originalmente pensado sob a taxonomia antiga
(P01, bloco de cidadania). Mantenho o mapeamento para PP-01 pela descrição textual, mas
sinalizo que nenhum campo estruturado do banco confirma isso — é leitura de nome, não de
metadado.

**Nota sobre `CA-FAM-002`/`CA-WPP-002`**: `familia_comercial` = "continuidade" (aponta
PP-08) mas `jornada_fase` = "acompanhamento" (aponta PP-05, "Executar"). Os dois campos do
próprio banco discordam entre si — não decidi por nenhum lado.

## 2. Matriz por SKU

| SKU | Produto-Pai obrigatório | Tipo | Fase da vida | País/rota | Status catálogo | Preço/link homologados? | Proposta? | Contrato? | App? |
|---|---|---|---|---|---|---|---|---|---|
| `CA-ASS-001` | PP-08 | assinatura | Manter | — | `em_revisao` | Não | Não | Não | Não |
| `CA-ASS-002` | PP-08 | assinatura | Manter | — | `homologado` | Sim | Sim | Sim | Sim |
| `CA-ASS-003` | PP-08 | assinatura | Manter | — | `em_revisao` | Não | Não | Não | Não |
| `CA-ASS-004` | PP-08 | assinatura | Manter | — | `em_revisao` | Não | Não | Não | Não |
| `CA-ASS-005` | PP-08 | assinatura, modalidade anual de `CA-ASS-002` | Manter | — | `homologado` | Sim | Sim | Sim | Sim |
| `CA-CID-001` | PP-01 (ver nota §1) | pai | Descobrir | Itália (texto livre) | `bloqueado` | Não | Não | Não | Não |
| `CA-CID-002` | PP-04 | pai (de 002A-D) | Preparar | não estruturado | `bloqueado` | Não | Não | Não | Não |
| `CA-CID-002A` | PP-04 | filho de `CA-CID-002` | Preparar | não estruturado | `bloqueado` | Não | Não | Não | Não |
| `CA-CID-002B` | PP-04 | filho de `CA-CID-002` | Preparar | não estruturado | `bloqueado` | Não | Não | Não | Não |
| `CA-CID-002C` | PP-04 | filho de `CA-CID-002` | Preparar | não estruturado | `bloqueado` | Não | Não | Não | Não |
| `CA-CID-002D` | PP-04 | filho de `CA-CID-002` | Preparar | não estruturado | `bloqueado` | Não | Não | Não | Não |
| `CA-CID-006` | PP-06 | complemento | Transicionar | Itália | `em_revisao` | Não | Não | Não | Não |
| `CA-CID-009` | PP-06 | complemento | Transicionar | Itália | `bloqueado` | Não | Não | Não | Não |
| `CA-CID-016` | PP-06 | complemento | Transicionar | Itália | `bloqueado` | Não | Não | Não | Não |
| `CA-CID-018` | PP-06 | complemento | Transicionar | Europa (genérico) | `bloqueado` | Não | Não | Não | Não |
| `CA-CID-019` | PP-04 | complemento | Preparar | não estruturado | `bloqueado` | Não | Não | Não | Não |
| `CA-CID-020` | PP-04 | complemento | Preparar | não estruturado | `bloqueado` | Não | Não | Não | Não |
| `CA-CID-021` | **sem correspondência única** (cruza PP-01+PP-06) | combo | — | não estruturado | `bloqueado` | Não | Não | Não | Não |
| `CA-CID-023` | PP-03 | pai, "jornada completa" (cruza PP-03 a PP-06 na prática) | Decidir | Itália | `bloqueado` | Não | Não | Não | Não |
| `CA-CID-025` | PP-05 | complemento | Executar | não estruturado | `homologado` | Sim | Sim | Sim | Sim |
| `CA-COMBO-001` | PP-07 | sazonal | Preservar | não aplicável | `bloqueado` | Não | Não | Não | Não |
| `CA-FAM-002` | **PP-05 ou PP-08** (ver nota §1) | complemento | Executar/Manter (ambíguo) | não aplicável | `bloqueado` | Não | Não | Não | Não |
| `CA-HIST-001` | PP-02 | pai | Descobrir | não aplicável | `bloqueado` | Não | Não | Não | Não |
| `CA-HIST-002` | PP-02 | pai | Descobrir | não aplicável | `bloqueado` | Não | Não | Não | Não |
| `CA-HIST-004` | PP-02 | pai | Descobrir | não aplicável | `bloqueado` | Não | Não | Não | Não |
| `CA-HIST-005` | PP-02 | complemento | Descobrir | não aplicável | `bloqueado` | Não | Não | Não | Não |
| `CA-HIST-006` | PP-02/PP-03 (combo, "ponte pesquisa/cidadania") | complemento | Descobrir/Decidir | não aplicável | `em_revisao` | Não | Não | Não | Não |
| `CA-IND-001` | PP-07 | complemento | Preservar | não aplicável | `bloqueado` | Não | Não | Não | Não |
| `CA-IND-002` | PP-07 | upgrade | Preservar | não aplicável | `bloqueado` | Não | Não | Não | Não |
| `CA-IND-005` | PP-07 | pai | Preservar | não aplicável | `bloqueado` | Não | Não | Não | Não |
| `CA-IND-006` | PP-07 | pai, B2B | Preservar | não aplicável | `bloqueado` | Não | Não | Não | Não |
| `CA-MEM-003` | PP-07 | pai | Preservar | não aplicável | `em_revisao` | Não | Não | Não | Não |
| `CA-MEM-004` | PP-07 | pai | Preservar | não aplicável | `bloqueado` | Não | Não | Não | Não |
| `CA-MEM-008` | PP-07 | upgrade | Preservar | não aplicável | `bloqueado` | Não | Não | Não | Não |
| `CA-WPP-002` | **PP-05 ou PP-08** (ver nota §1) | complemento | Executar/Manter (ambíguo) | não aplicável | `homologado` | Não (não elegível p/ proposta apesar de homologado) | Não | Não | Não |

## 3. Leitura direta da matriz

- **31 de 35 SKUs ativos** mapeiam para exatamente um PP-01–PP-08. **2** (`CA-CID-021`,
  `CA-FAM-002`/`CA-WPP-002` contam como par ambíguo) não têm produto-pai único; `CA-CID-023`
  e `CA-HIST-006` mapeiam a um PP âncora mas na prática atravessam mais de um.
- **Só 4 SKUs estão `homologado`** hoje: `CA-ASS-002`, `CA-ASS-005` (PP-08), `CA-CID-025`
  (PP-05), `CA-WPP-002` (PP-05/PP-08, mas **não elegível para proposta** apesar de
  homologado — `elegivel_para_proposta = false`, inconsistência a esclarecer). Os outros 31
  estão `bloqueado` ou `em_revisao` — **nenhum pronto para proposta/contrato/App** segundo o
  critério da seção 9 do documento-fonte.
- **PP-01 (Descoberta) é o mais pobre em SKU real**: só `CA-CID-001`, e com correspondência
  por leitura de nome, não por metadado. Os dois SKUs que fariam esse produto-pai funcionar
  de verdade como porta de entrada gratuita (`CA-CID-022`/`026`, AncestralScan) estão
  ausentes do catálogo hoje — mesmo achado do documento de reaproveitamento de 91 SKUs.

## 4. O que este documento NÃO decide

- **Não decide** qual das duas taxonomias (P01–P09 antiga, usada nos PRs #79/#82, ou
  PP-01–PP-08 nova, usada aqui) é a arquitetura final — apenas segue a instrução mais
  recente da Proprietária de que a antiga não deve orientar sozinha.
- **Não resolve** a ambiguidade `CA-FAM-002`/`CA-WPP-002` (PP-05×PP-08) nem `CA-CID-021`
  (sem produto-pai único) — ambas exigem decisão humana, e a base de dados real (dois campos
  discordantes) não resolve sozinha.
- **Não decide** reativar `CA-CID-022`/`026`, os 6 códigos pós-cidadania ou `CA-ASS-006` —
  já sinalizados como ausentes em `2026-09-04_SKUS-91-REAPROVEITAMENTO-PRODUTO-PAI.md`.
- **Não homologa** nenhum SKU para proposta/contrato/App além dos 4 já marcados
  `homologado` no banco — e sinaliza a inconsistência de `CA-WPP-002` (homologado mas
  `elegivel_para_proposta = false`) para revisão.
- **Não altera nenhuma linha de `product_catalog`, nenhum código, nenhuma migration.**
