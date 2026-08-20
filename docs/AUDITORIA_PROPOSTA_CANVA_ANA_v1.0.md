# Auditoria da Proposta Canva — Caso CA-CID-AT-FAM-2026-001

**Versão:** 1.0 · **Data:** 20/08/2026 · **Modo:** somente leitura
**Escopo:** verificação da proposta Canva como fonte mandatória de escopo.
**Não executado:** importação de conteúdo do Canva, edição da proposta, preenchimento por inferência, liberação de assinatura ou financeiro.

---

## 1. Identificação da proposta vigente

| Verificação | Resultado | Situação |
|---|---|---|
| Vinculada ao mesmo case_id | Sim — vinculada ao caso familiar CA-CID-AT-FAM-2026-001 (proposta única, versão 1) | OK |
| Status aprovada/aceita | `aprovada` (aprovada em 17/08/2026) | OK |
| Arquivada | Não | OK |
| Substituída | Não (sem proposta sucessora) | OK |
| Recusada | Não | OK |
| Expirada | **Sim** — validade até 19/08/2026, hoje 20/08/2026 | **BLOQUEIO** |
| Origem Canva | `canva` | OK |
| Referência do deck | `DECK-CANVA-CA-CID-AT-FAM-2026-001-v1` (referência interna e de origem coincidem) | OK |
| Páginas 1–7 registradas | Sim — todas as 7 páginas registradas | OK |
| Conteúdo extraído por página | **Parcial** — status de extração `parcial`: páginas 1–2 extraídas; páginas 3, 4, 5, 6 e 7 em extração, com 10 campos não localizados | **BLOQUEIO** |

**Conclusão de cabeçalho:** a proposta é a fonte mandatória correta (origem, deck, caso e status íntegros), mas **está vencida** e **não possui extração integral**. Enquanto ambos persistirem, o escopo não pode ser considerado homologado.

---

## 2. Matriz campo a campo de escopo

Cobertura: **Completa** (campo extraído), **Ausente** (campo não localizado na página), **Parcial**.
Conteúdo descrito de forma não sensível (sem reprodução de documentos, contatos ou endereços).

| # | Campo | Página | Conteúdo/estado encontrado | Parâmetro de destino | Anexo | Cobertura | Divergência | Bloqueio gerado | Ação humana necessária |
|---|---|---|---|---|---|---|---|---|---|
| 1 | proposta_referencia | 1 | Referência de proposta e versão presentes | objeto_contrato | ANX-ESCOPO | Completa | Nenhuma | — | Nenhuma |
| 2 | caso_contexto | 1 | Caso/núcleo e país/contexto presentes | pais_rota, objeto_contrato | ANX-ESCOPO | Completa | Nenhuma (país Áustria coerente com CRM e parâmetros) | — | Nenhuma |
| 3 | processos_participantes | 2 | Participantes e processos incluídos presentes | beneficiarios, partes_signatarias | ANX-INDIVIDUAL | Completa | Parâmetros listam 3 signatários adultos + 1 dependente menor; participação do menor segue com representação pendente | Participação do dependente bloqueada | Concluir representação legal do dependente antes de fechar o rol |
| 4 | escopo_macro | 2 e 3 | Presente na p.2; parte da p.3 ainda em extração | escopo_resumo, produto_sku | ANX-ESCOPO | Parcial | SKU no parâmetro é CA-CID-AT-001 (atendimento familiar, § 58c StbG); a proposta ainda não confirma o SKU por página | Escopo macro não homologado | Concluir extração da p.3 e confirmar aderência ao SKU |
| 5 | servicos_incluidos | 3 | **Não localizado** (p.3 em extração) | servicos_incluidos | ANX-ESCOPO | Ausente | Parâmetro já preenchido pelo planejador sem lastro na proposta | Escopo contratual sem fonte mandatória | Extrair p.3 e conferir contra o parâmetro; não inferir |
| 6 | servicos_excluidos | 3 | **Não localizado** (p.3 em extração) | servicos_excluidos | ANX-ESCOPO | Ausente | Parâmetro `servicos_excluidos` vazio e CRM sem escopo excluído resumido | Exclusões indefinidas | Extrair p.3 e registrar exclusões a partir da proposta |
| 7 | escopos_individuais | 4 | **Não localizado** (p.4 em extração) | escopo_resumo | ANX-INDIVIDUAL | Ausente | Anexos individuais sem base por participante | Anexo individual não gerável | Extrair p.4 por participante |
| 8 | composicao_familiar | 4 | Presente | vinculo_familiar, beneficiarios | ANX-INDIVIDUAL, ANX-PRIVACIDADE | Completa | `vinculo_familiar` consta como importado a confirmar | Confirmação de vínculo pendente | Validar vínculo familiar contra a p.4 |
| 9 | responsabilidades | 4 e 5 | **Não localizado** (p.4/p.5 em extração) | representacao_legal, partes_signatarias | ANX-INDIVIDUAL, ANX-REPRESENTACAO | Ausente | Responsabilidades por processo sem lastro; anexo de representação depende deste campo | Anexo de representação bloqueado | Extrair p.4 e p.5 e definir responsável por processo |
| 10 | entregas_jornada | 5 | **Não localizado** (p.5 em extração) | fases_entregas, prazos_referencia | ANX-ESCOPO | Ausente | `fases_entregas` preenchido pelo planejador; `prazos_referencia` vazio | Jornada e prazos não homologados | Extrair p.5 e reconciliar com as fases já parametrizadas |
| 11 | valor_total | 6 | **Não localizado** (p.6 em extração) | valor_total | ANX-COMERCIAL | Ausente | Valor no cabeçalho da proposta e no parâmetro é R$ 9.600 (BRL), porém sem página de origem extraída; CRM traz a mesma cifra apenas como referência interna | Financeiro bloqueado | Extrair p.6 e homologar o valor por fonte de página |
| 12 | forma_pagamento | 6 | **Não localizado** (p.6 em extração) | forma_pagamento | ANX-COMERCIAL | Ausente | Cabeçalho da proposta descreve assinaturas mensais por responsável, mas o parâmetro `forma_pagamento` está vazio | Condição comercial não homologada | Extrair p.6 e preencher a partir da página, sem inferência |
| 13 | parcelas | 6 | **Não localizado** (p.6 em extração) | parcelas, vencimentos | ANX-COMERCIAL | Ausente | Parâmetros `parcelas` e `vencimentos` vazios | Cronograma financeiro inexistente | Extrair p.6 e registrar parcelas e vencimentos |
| 14 | responsaveis_financeiros | 6 | Presente | contratante_nome, partes_signatarias | ANX-COMERCIAL | Completa | Contratante no parâmetro coincide com o CRM | — | Conferir na homologação da p.6 |
| 15 | despesas_externas | 7 | **Não localizado** (p.7 em extração) | despesas_externas | ANX-COMERCIAL | Ausente | Parâmetro `despesas_externas` vazio | Regra de despesas de terceiros indefinida | Extrair p.7 e registrar a regra |
| 16 | prazo_validade | 7 | Presente | prazos_referencia | ANX-COMERCIAL | Completa | Validade registrada como 19/08/2026 — já vencida | Proposta expirada | Renovar validade ou emitir nova versão pela via formal |
| 17 | proximos_passos | 7 | **Não localizado** (p.7 em extração) | fases_entregas | ANX-ESCOPO | Ausente | Sem definição de próximos passos na fonte mandatória | Onboarding sem sequência homologada | Extrair p.7 |

**Resumo:** 6 campos completos, 1 parcial, 10 ausentes. Dos 17 campos, todos os obrigatórios permanecem sob dependência de extração ou de renovação da validade.

---

## 3. Conflitos com outras fontes

| Fonte | Conflito observado | Efeito |
|---|---|---|
| Parâmetros do contrato | Campos comerciais (forma de pagamento, parcelas, vencimentos, despesas externas, prazos) vazios enquanto o cabeçalho da proposta descreve condição comercial | Contrato não pode ser gerado com lastro completo |
| Parâmetros do contrato | Serviços incluídos e fases de entrega preenchidos pelo planejador sem página de origem extraída | Risco de escopo sem fonte mandatória |
| CRM | Caso marca condição comercial interna como pendente e não possui escopo incluído/excluído resumido nem data de proposta; a proposta aprovada não está referenciada por id de origem no caso | Rastreabilidade CRM ↔ proposta incompleta |
| CRM | Referência de proposta no caso é textual e declarada "sem cobrança" | Nenhuma cobrança pode ser derivada dessa referência |
| Comercial/Financeiro | Valor único de R$ 9.600 aparece em proposta, parâmetro e CRM, porém não homologado por página | Financeiro permanece bloqueado |
| Vínculo familiar | Parâmetro em estado "importado a confirmar" e dependente menor com representação pendente | Anexos individual e de representação bloqueados |

Não foi identificada divergência de país/rota: Áustria, via administrativa § 58c StbG, coerente entre proposta, CRM e parâmetros.

---

## 4. Bloqueios consolidados

1. **Proposta expirada** (validade 19/08/2026). Impede tratar a proposta como escopo vigente.
2. **Extração incompleta** — páginas 3, 4, 5, 6 e 7 em extração; 10 campos obrigatórios não localizados.
3. **ANX-ESCOPO** não gerável: depende de páginas 2–5 integrais.
4. **ANX-COMERCIAL** não gerável: depende de páginas 6–7 integrais.
5. **ANX-INDIVIDUAL / ANX-REPRESENTACAO** não geráveis: escopos individuais e responsabilidades ausentes, representação do dependente pendente.
6. **Assinatura e financeiro permanecem bloqueados** — nenhuma liberação foi feita nesta auditoria.

---

## 5. Ações humanas necessárias (ordem sugerida)

1. Decidir formalmente sobre a validade: renovar com motivo registrado ou emitir nova versão da proposta Canva.
2. Concluir a extração das páginas 3 a 7, campo a campo, a partir do deck `DECK-CANVA-CA-CID-AT-FAM-2026-001-v1`.
3. Reconciliar os parâmetros preenchidos pelo planejador com o conteúdo extraído, marcando divergências.
4. Confirmar o vínculo familiar e resolver a representação legal do dependente menor.
5. Vincular formalmente a proposta ao caso no CRM (referência de origem e data) e encerrar a pendência de condição comercial interna.
6. Somente após 1–5, submeter à revisão humana para eventual liberação de assinatura e financeiro.

---

*Documento de auditoria em modo leitura. Nenhum dado foi alterado, importado ou inferido. Nenhum juízo de mérito sobre o caso é emitido.*
