# Clube Ancestral — Arquitetura da Biblioteca de Evidências e Projeções

**Versão:** 1.0  
**Data:** 19 de agosto de 2026  
**Status:** decisão canônica para implementação  
**Escopo:** normalização de fontes, evidências, validação, ficha genealógica, Desk, relatórios, App Cliente, one-page e PDF aprovado.

---

## 1. Decisão central

A Biblioteca de Evidências é a camada normalizada entre fontes/materiais e o Desk. App Cliente, one-page e PDF aprovado não devem ler diretamente fontes, documentos, evidências internas ou hipóteses.

```text
Fonte ou material
→ Biblioteca de Evidências
→ Pessoa / Relação / Evento / Linhagem / Caso
→ Validação humana e confiança
→ Desk e relatórios internos
→ Projeção autorizada
→ App Cliente / One-page / PDF aprovado
```

Princípio: **integração invisível, evidência visível**.

---

## 2. Entidades

| Entidade | Finalidade |
|---|---|
| Fonte | Origem do material ou informação |
| Evidência | Informação rastreável vinculada a fonte, pessoa, evento ou relação |
| Documento | Tipo de evidência documental, com arquivo/referência interna |
| Validação | Revisão humana da evidência e do vínculo proposto |
| Variante de nome | Grafias, traduções, apelidos e discrepâncias documentais |
| Pessoa | Perfil genealógico individual |
| Relação | Vínculo entre pessoas, com status e evidência |
| Evento | Marco temporal/geográfico vinculado à pessoa/família |
| Linhagem | Caminho de pesquisa estruturado |
| Achado | Interpretação operacional de evidências |
| Relatório | Entrega robusta de fase baseada em evidências |
| Projeção | Conteúdo sanitizado e aprovado para destino cliente-facing |

---

## 3. Evidência e confiança

### Estados epistemológicos

- `INFORMACAO_COMPARTILHADA_FAMILIA`
- `DADO_PESQUISA_INICIAL`
- `EM_VALIDACAO_DOCUMENTAL`
- `VALIDADO_POR_DOCUMENTO`
- `PENDENTE_CONFIRMACAO`
- `NAO_APLICAVEL`

### Níveis de confiança

- `INICIAL`
- `BAIXO`
- `MEDIO`
- `ALTO`

Regras:

- Não permitir salto automático de `INICIAL` para `ALTO`.
- Elevação exige responsável, data, justificativa e revisão humana.
- Busca negativa é evidência válida, com fonte, data e estratégia alternativa.
- Fonte colaborativa é exploratória; não confirma sozinha vínculo, cidadania, elegibilidade ou rota.

---

## 4. Visibilidade

Destinos controlados:

| Código | Uso |
|---|---|
| `desk_only` | Pesquisa, evidência, fonte, hipótese e operação interna |
| `crm_only` | Dados comerciais e lifecycle interno |
| `app` | Conteúdo sanitizado e aprovado ao cliente |
| `one_page` | Síntese aprovada para devolutiva/uso comercial |
| `pdf_aprovado` | Conteúdo aprovado para relatório/exportação |

Fonte crua, URL interna, token, documento bruto, transcrição, hipótese jurídica, score, risco interno, dado de terceiro e mecanismo de matching nunca são projetados ao cliente.

---

## 5. Projeções autorizadas

### `app_projections`

- `source_entity_type`
- `source_entity_id`
- `case_id` opcional
- `projection_type`
- `destination`: app, one_page, pdf_aprovado
- `content_sanitized`
- `approval_status`: draft, in_review, approved, published, archived
- `approved_by`
- `approved_at`
- `visibility_scope`
- `effective_from`
- `archived_at`
- `language_validation_status`

Nenhuma projeção pode existir sem entidade-fonte e aprovação humana.

---

## 6. Relatórios e entregas

Relatórios existentes:

- `REPORT_F1_DIAGNOSTICO`
- `REPORT_F2_PESQUISA`
- `REPORT_F3_PRONTIDAO_DOCUMENTAL`
- `REPORT_F4_PROTOCOLO`
- `REPORT_F5_CONCLUSAO`
- `REPORT_MEM_LEGADO`

Relatório é síntese de evidências e pendências, não nova evidência. Micro-entrega é item menor e não deve duplicar relatório.

---

## 7. Encontros de Linhagem

O conteúdo de Encontro de Linhagem nasce no Desk, em Pesquisa e Evidências → Pessoas e Linhagens → Encontros de Linhagem.

No App Cliente, aparece somente como uma projeção/entrega aprovada dentro de:

```text
Jornada do Cliente
→ Entregas da Jornada
→ História e Linhagens
→ Encontro de Linhagem
```

O modelo estático aprovado deve ficar como **template de projeção**, não como dado solto:

1. Contexto histórico.
2. Territórios migratórios.
3. Memória familiar.
4. Práticas culturais documentadas.
5. Encontros no Brasil.
6. Repertórios narrativos.
7. Próximo passo ou continuação de pesquisa.
8. Disclaimer de limites e fontes.

Proibições:

- Não atribuir personalidade, destino, comportamento, trauma, espiritualidade ou cura à ancestralidade.
- Não afirmar conexão entre linhas por sobrenome/localidade sem evidência.
- Não publicar sem validação, sanitização e aprovação humana.

---

## 8. Critérios de aceite

1. Fonte e evidência não são exibidas diretamente no App Cliente.
2. Evidência tem estado epistemológico, confiança, responsável e data de validação.
3. Pessoa, relação, evento e achado podem referenciar evidências.
4. Relatórios F1/F2 vinculam evidências sem duplicá-las.
5. Projeção ao cliente exige conteúdo sanitizado e aprovação.
6. Busca negativa pode ser cadastrada e gera próxima pesquisa.
7. Encontro de Linhagem é criado no Desk e publicado no App apenas como projeção aprovada.
8. Nenhuma publicação automática ocorre.
