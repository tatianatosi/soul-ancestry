# Auditoria de adaptação — MODELO ESTUDO GENEALÓGICO e contrato v2

Versão 1.0 · 19/08/2026 · **somente leitura** — nenhum template, contrato, anexo, dado real, política de retenção, preço, proposta, assinatura ou cobrança foi alterado.

## 0. Evidência estrutural que condiciona toda a auditoria

| Fonte | Evidência técnica | Consequência |
|---|---|---|
| MODELO-ESTUDO v1 (`contract_templates`, status `active`, `requires_human_review = true`) | `default_clauses = []`, `required_fields = []`, `body_schema` sem corpo de cláusula | O modelo existe como **rótulo de governança**, não como texto jurídico versionado |
| BASE-GEN-V2 v2 (`contract_templates`, status `active`, `requires_human_review = true`) | `default_clauses = []`, `required_fields = []` | Idem |
| Prévia (`montarPrevia`, `src/lib/contrato-parametros.server.ts`) | Renderiza apenas os 6 grupos de parâmetros + lista de anexos por regra | A prévia **não contém cláusula nenhuma**: é uma ficha de parâmetros com selo, não um instrumento |
| Ficha (`contract_parameter_values`) | 30 campos em 6 grupos: partes(6), membros(4), objeto(4), serviços(5), comerciais(6), assinatura(5) | Cobertura de variáveis é boa; cobertura de texto-base é nula |
| Cláusulas do contrato publicado no site | **não localizadas no repositório nem no banco** | Toda comparação cláusula a cláusula abaixo é feita contra o texto-base normativo esperado, e o próprio texto é lacuna P0 |

Leitura direta: o motor hoje é **motor de parâmetros e gates**, não motor de cláusulas. Nenhuma cláusula jurídica está representada como texto-base versionado; o que existe são as variáveis que alimentariam essas cláusulas.

## 1. Matriz de cobertura por cláusula/item

Classificação: **TB** texto-base · **VAR** variável parametrizável · **ANX** anexo · **CFG** configuração institucional · **EXT** regra externa.
Estado: **coberto** · **parcial** · **ausente** · **conflitante** · **jurídico** (exige validação jurídica).

| # | Cláusula/item | Origem | Classe | Campo/parâmetro | Destino na prévia | Obrig. | Versão | Estado | Impacto | Evidência técnica |
|---|---|---|---|---|---|---|---|---|---|---|
| C1 | Qualificação do contratante (nome civil, CPF/RG, endereço, contato) | MODELO-ESTUDO §1 | VAR | `contratante_nome`, `contratante_documento`, `contratante_endereco`, `contratante_contato` | grupo "Partes e qualificação" | sim | ficha v1 | **coberto** (variáveis) / **ausente** (texto) | geração, assinatura | `parametros-dicionario.ts` L58-96; grupo `partes` no banco |
| C2 | Qualificação da contratada (razão social, CNPJ, sede, representante) | MODELO-ESTUDO §1 | TB+VAR | `contratada_qualificacao` (texto longo único) | "Partes" | sim | — | **parcial** | geração, assinatura | campo único agrega CNPJ/sede/representante sem estrutura nem validação |
| C3 | Contrato familiar com múltiplos signatários | BASE-GEN-V2 / CA-DEC-2026-08-17-01 | VAR+ANX | `partes_signatarias`, `vinculo_familiar`, `beneficiarios` | "Partes"/"Membros" + ANX-INDIVIDUAL | sim | v2 | **coberto** | geração, assinatura | `nucleo_membros`; 3 signatários (Ana, Adair, Alice) |
| C4 | Anexo individual por requerente | BASE-GEN-V2 | ANX | `beneficiarios` → 1 instância/pessoa | seção "Anexos aplicáveis" | sim | v2 | **coberto** | geração | `anexos-dicionario.ts` L211-238 |
| C5 | Dependente menor (Felipe) vinculado a titular, sem assinatura | CA-DEC-2026-08-17-01 | VAR+ANX | `dependentes` | ANX-INDIVIDUAL / ANX-REPRESENTACAO | condicional | v2 | **conflitante** | geração, assinatura | `dependentes` é lido por `anexos-dicionario.ts` L216/244 mas **não existe** em `DICIONARIO_CAMPOS` nem em `contract_parameter_values` |
| C6 | Representação legal de menor/incapaz | MODELO-ESTUDO | VAR+ANX | `representacao_legal` | "Partes" + ANX-REPRESENTACAO | condicional | v1 | **coberto** | geração, assinatura | dicionário L104-114, justificativa obrigatória |
| C7 | Objeto do contrato | MODELO-ESTUDO §2 | TB+VAR | `objeto_contrato` | "Objeto" | sim | — | **parcial** | geração | validação "sem promessa de resultado" é textual, não verificada |
| C8 | Escopo macro e entregas por fase | Proposta Canva p.2-5 | VAR+ANX | `escopo_resumo`, `fases_entregas`, `servicos_incluidos` | "Objeto"/"Serviços" + ANX-ESCOPO | sim | v2 | **coberto** | geração, revisão | `escopo-proposta.ts`; ANX-ESCOPO L128-144 |
| C9 | Exclusões expressas (certidões, traduções, apostilas, taxas) | MODELO-ESTUDO §3 | VAR+ANX | `servicos_excluidos` | "Serviços" + ANX-ESCOPO | sim | — | **coberto** | geração | dicionário L203-210 |
| C10 | Natureza intelectual do serviço (obrigação de meio, entrega de estudo) | MODELO-ESTUDO §2 | TB | — | — | sim | — | **ausente** / **jurídico** | geração, litígio | nenhum texto-base; nenhum campo |
| C11 | Proibição de garantia de documento, linhagem, cidadania ou resultado | MODELO-ESTUDO §2/§4 | TB+CFG | — | — | sim | — | **ausente** / **jurídico** | geração, cliente-facing | `canvas-sanitize.ts` sanitiza mérito **no portal**, não no contrato; nenhuma cláusula negativa no motor |
| C12 | Relatório técnico como entrega; linguagem que não configura parecer jurídico | MODELO-ESTUDO §2 | TB+CFG | parcialmente `fases_entregas` | "Serviços" | sim | — | **parcial** / **jurídico** | geração, revisão | taxonomia existe em `REGRAS_VERIFICAVEIS_POR_DOMINIO_v1.0.md`, não no template |
| C13 | Reunião online de devolutiva | MODELO-ESTUDO §3 | VAR | — | — | condicional | — | **ausente** | geração, escopo | nenhum campo de reunião/devolutiva na ficha (grep sem resultado) |
| C14 | Guarda e sigilo das informações | MODELO-ESTUDO §5 | TB+ANX | — | ANX-PRIVACIDADE | sim | — | **ausente** (texto) / **parcial** (anexo) | retenção, LGPD | ANX-PRIVACIDADE só declara finalidade; campos `beneficiarios`, `partes_signatarias`, `representacao_legal` |
| C15 | Retenção e descarte de dados (prazo e forma) | LGPD / MODELO-ESTUDO §5 | CFG+ANX | — | ANX-PRIVACIDADE | sim | — | **ausente** | retenção | nenhum campo de prazo de retenção ou política de descarte em lugar algum |
| C16 | Consentimento por titular e base legal | LGPD | EXT+ANX | `consent_records`, `consentimento_ativo()` | ANX-PRIVACIDADE (por referência) | sim | — | **parcial** | ativação, financeiro | tabela e gate existem; **0 consentimentos registrados** no piloto |
| C17 | Valor total | Proposta p.6 | VAR | `valor_total` | "Comerciais" | sim | v2 | **coberto** | financeiro | dicionário L240-248; justificativa obrigatória |
| C18 | Forma de pagamento | Proposta p.6 | VAR | `forma_pagamento` (lista controlada) | "Comerciais" | sim | v2 | **coberto** | financeiro | `CAT_FORMA_PAGAMENTO` |
| C19 | Parcelas e responsáveis | Proposta p.6 | VAR | `parcelas`, `responsaveis_financeiros` (escopo) | "Comerciais" + ANX-COMERCIAL | sim | v2 | **parcial** | financeiro | `parcelas` é texto curto livre: não valida quantidade × valor × responsável |
| C20 | Vencimentos | Proposta p.6 | VAR | `vencimentos` | "Comerciais" | sim | — | **parcial** | financeiro | texto curto; sem estrutura de datas |
| C21 | Condição de início da execução (pagamento da 1ª parcela / assinatura) | MODELO-ESTUDO §4 | TB+CFG | gates de ativação | — | sim | — | **parcial** | geração, ativação | existe como check de ativação (`case_activation_checks`), não como cláusula |
| C22 | Suspensão de prazo por pendência do cliente | MODELO-ESTUDO §4 | TB | — | — | sim | — | **ausente** / **jurídico** | prazo, litígio | nenhum campo nem cláusula |
| C23 | Despesas de terceiros — cláusula institucional literal | Regra institucional | CFG+ANX | `despesas_externas` (lista controlada) | ANX-COMERCIAL (injeção automática) | sim | v1 | **coberto** | financeiro | `CLAUSULA_DESPESAS_TERCEIROS` injetada em ANX-COMERCIAL; `third_party_expenses` + `trg_third_party_expense_guard` |
| C24 | Exceção formal à regra de despesas | Regra institucional | VAR | `excecoes_comerciais` | "Comerciais" + auditoria | condicional | v1 | **coberto** | financeiro | justificativa obrigatória; trigger de exceção |
| C25 | Cumprimento e encerramento do contrato | MODELO-ESTUDO §6 | TB | — | — | sim | — | **ausente** / **jurídico** | encerramento | nenhum texto-base |
| C26 | Inadimplemento, atraso, multa e juros | MODELO-ESTUDO §6 | TB | — | — | a validar | — | **ausente** / **jurídico** | financeiro, litígio | nenhum campo; existência da cláusula no texto vigente **não confirmada** |
| C27 | Rescisão e efeitos | MODELO-ESTUDO §6 | TB | — | — | sim | — | **ausente** / **jurídico** | encerramento | nenhum texto-base |
| C28 | Foro de eleição | MODELO-ESTUDO §7 | TB+CFG | — | — | sim | — | **ausente** | litígio | grep "foro" sem resultado no motor |
| C29 | Forma de assinatura e registro | MODELO-ESTUDO §7 | VAR | `forma_assinatura`, `data_assinatura`, `referencia_assinatura` | "Assinatura" + auditoria | sim | — | **coberto** | assinatura | dicionário L305-330; `data_assinatura` só com comprovante |
| C30 | Revisão humana registrada antes da versão final | CFG institucional | CFG | `revisor_responsavel`, `revisao_humana_em/por`, `aprovado_por/em` | selo + auditoria | sim | — | **coberto** | geração, assinatura | `contract_case_parameters`; gate `revisao_humana` em `contrato-preparar.functions.ts` |
| C31 | Duas parcelas do texto-base × dez parcelas da Ana | MODELO-ESTUDO §4 × proposta | TB×VAR | `parcelas` | "Comerciais" + ANX-COMERCIAL | sim | — | **conflitante** | financeiro, assinatura | texto-base fixa 2 parcelas; condição real do caso é 10; sem cláusula parametrizada, a divergência não é detectável pelo motor |

Resumo: 31 itens — **12 cobertos**, **8 parciais**, **9 ausentes**, **2 conflitantes**. Nenhum item de texto-base está coberto.

## 2. Lacunas priorizadas

**P0 — bloqueiam a existência do instrumento**
1. **Texto-base ausente nos dois templates ativos.** `default_clauses` e `required_fields` vazios em MODELO-ESTUDO v1 e BASE-GEN-V2 v2: a prévia gera uma ficha, não um contrato (C10, C25, C27, C28).
2. **Cláusulas do contrato publicado no site não estão no repositório.** Sem elas não há baseline de comparação nem controle de versão jurídica.
3. **Cláusula de proibição de garantia** (documento, linhagem, cidadania, resultado) não existe no motor (C11) — é o risco jurídico e reputacional mais alto do produto.
4. **Campo `dependentes` inexistente** e ainda assim consumido pelo motor de anexos (C5): ANX-INDIVIDUAL e ANX-REPRESENTACAO do Felipe dependem de um campo que ninguém consegue preencher.

**P1 — bloqueiam versão final íntegra**
5. Retenção, descarte e guarda/sigilo sem texto e sem parâmetro (C14, C15).
6. Condição de início e suspensão de prazo apenas como gate operacional, sem cláusula (C21, C22).
7. Incompatibilidade 2 × 10 parcelas sem detecção automática (C31).
8. `parcelas` e `vencimentos` como texto livre — impedem conferência automática contra a proposta e contra o Asaas (C19, C20).

**P2 — completam a adaptação**
9. Reunião online não parametrizada (C13).
10. `contratada_qualificacao` como campo único sem estrutura (C2).
11. Natureza intelectual e não-parecer-jurídico do relatório só existem como doutrina, não como cláusula (C10, C12).
12. Inadimplemento/atraso: confirmar se existe no texto vigente antes de modelar (C26).
13. Consentimento: 0 registros no piloto (C16).

## 3. Cláusulas que exigem validação jurídica antes de qualquer modelagem

C10 natureza intelectual · C11 proibição de garantia · C12 relatório técnico e limite de parecer · C15 prazo de retenção e descarte · C22 suspensão de prazo · C25 cumprimento/encerramento · C26 inadimplemento/multa/juros · C27 rescisão e efeitos · C28 foro · C31 número de parcelas do texto-base.

Nenhum desses itens pode ser redigido, inferido ou "preenchido por analogia" pelo motor.

## 4. Proposta de mapeamento técnico (não aplicada)

1. **Cláusulas como registros versionados.** Popular `default_clauses` de cada template com objetos `{ id, titulo, texto_base, tipo: fixa|parametrizada|condicional, variaveis: [campo], anexo_destino, versao, aprovador_juridico }`. Nada entra sem aprovador jurídico nomeado.
2. **Prévia por cláusula.** `montarPrevia` passaria a renderizar cláusulas na ordem do template, interpolando `[[campo]]` a partir da ficha, mantendo o selo de rascunho e marcando variável pendente como hoje.
3. **Campos novos na ficha** (grupo entre parênteses): `dependentes` (membros), `reuniao_online` (serviços, lista controlada), `retencao_prazo` e `descarte_forma` (privacidade — novo grupo), `condicao_inicio` e `suspensao_prazo` (serviços), `foro` (assinatura, CFG institucional), `inadimplemento` (comerciais, se confirmado juridicamente), `contratada_cnpj`/`contratada_sede`/`contratada_representante` (partes, substituindo o texto único), `parcelas_estrutura` (comerciais, JSON quantidade/valor/vencimento/responsável).
4. **Cláusula negativa como configuração institucional**, não variável: bloco fixo de "não garantia" injetado em todo instrumento, com a mesma mecânica já usada para a cláusula de despesas de terceiros em ANX-COMERCIAL.
5. **Validador de coerência texto-base × parâmetro**: se a cláusula fixa declara N parcelas e `parcelas_estrutura` declara M ≠ N, gerar conflito crítico `clausula_x_parametro` — mesma família de bloqueios já usada por `coerencia-caso`.
6. **Auditoria**: registrar por versão de prévia o par (template, versão de cláusula) usado em cada cláusula, sem gravar texto sensível em log.

## 5. Testes necessários após aprovação humana

1. Template sem `default_clauses` não gera versão final (só rascunho marcado).
2. Cláusula parametrizada com variável vazia aparece como `[[campo]] — pendente` no rascunho e bloqueia o final.
3. Cláusula de não-garantia presente em 100% das prévias, inclusive rascunho.
4. Contrato familiar: 3 signatários → 3 ANX-INDIVIDUAL; Felipe como dependente → 0 assinatura e 1 ANX-REPRESENTACAO.
5. `dependentes` preenchido gera instância nominal vinculada ao titular correto.
6. Conflito 2 × 10 parcelas dispara bloqueio crítico e impede assinatura e financeiro.
7. Cláusula de despesas de terceiros presente literalmente em ANX-COMERCIAL, salvo exceção aprovada com justificativa, aprovador e validade.
8. Retenção/descarte ausentes bloqueiam a versão final quando ANX-PRIVACIDADE é aplicável.
9. Alteração de cláusula sem aprovador jurídico é rejeitada pelo guard.
10. Snapshot congelado preserva o texto da cláusula da versão usada, mesmo após o template evoluir.
11. Regressão: nenhuma cláusula cliente-facing contém juízo de mérito (reaproveitar `canvas-sanitize`).

---

**Estado: aguardando revisão humana explícita.** Nenhuma alteração foi aplicada a templates, contratos, anexos, dados reais, retenção, preços, propostas, assinaturas ou cobranças.
