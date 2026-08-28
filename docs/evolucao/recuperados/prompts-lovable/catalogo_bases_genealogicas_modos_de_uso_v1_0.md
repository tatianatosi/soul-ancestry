# Clube Ancestral — Catálogo de Bases Genealógicas e Modos de Uso

**Versão:** 1.0  
**Data:** 19 de agosto de 2026  
**Status:** decisão canônica para implementação pré-5B  
**Escopo:** catálogo, governança, avaliação e ativação gradual de fontes genealógicas.  
**Não inclui:** API, scraping, consulta externa, credenciais, pesquisa externa ou publicação no App Cliente.

---

## 1. Decisão

As bases genealógicas são ativos estruturais do Clube Ancestral. Elas devem ser cadastradas no Desk como fontes governadas antes de qualquer integração. Fonte aberta não significa fonte automatizável; registro localizado não equivale a evidência validada.

Princípio: **integração invisível, evidência visível**.

---

## 2. Módulo no Desk

Nome do módulo interno: **Fontes e Integrações Genealógicas**.

Não usar “Scraping” como nome de módulo. Scraping só pode existir como avaliação interna de risco/vedação.

---

## 3. Entidade canônica

### `genealogical_sources_catalog`

| Campo | Descrição |
|---|---|
| `id` | Identificador único |
| `nome` | Nome da fonte/base/instituição |
| `pais_eixo` | País ou eixo temático |
| `citizenship_track_id` | Trilha vinculada, quando aplicável |
| `tipo_de_acervo` | Civil, religioso, militar, imigração, notarial, colaborativo etc. |
| `cobertura_temporal` | Período coberto |
| `cobertura_geografica` | Território/localidade coberta |
| `nivel_de_fonte` | Primária; secundária; colaborativa; índice; institucional |
| `acesso` | Público; login; pago; parceria; restrito |
| `licenca_termos` | Referência a termos de uso |
| `custo` | Gratuito, faixa, sob consulta ou não aplicável |
| `autenticacao_necessaria` | Sim; não; a confirmar |
| `trata_dados_pessoais` | Sim; não; a confirmar |
| `risco` | Baixo; médio; alto; crítico |
| `uso_recomendado` | Hipótese, localização, evidência, contexto etc. |
| `prioridade` | Crítica; alta; média; baixa |
| `modo_de_uso_permitido` | Ver seção 4 |
| `scraping_status` | Proibido por padrão; exige validação; não aplicável |
| `ultima_verificacao` | Data |
| `status_documentacao` | Não iniciada; parcial; completa; a revisar |
| `status_integracao` | Ver seção 5 |
| `proxima_acao` | Campo controlado |
| `observacao_risco` | Texto interno |
| `responsavel_revisao` | Usuário interno |
| `data_origin` | production_real; migration_legacy; development_fixture; sandbox |

---

## 4. Modos de uso permitidos

| Código | Uso |
|---|---|
| `manual` | Consulta humana fora do sistema, com registro posterior de resultado/evidência |
| `metadados_linkout` | Link interno de referência e metadados, sem coleta automatizada |
| `api_validada` | Somente após termos, credenciais, segurança, piloto e homologação |
| `parceria` | Acesso por acordo formal/parceiro autorizado |
| `restrito` | Fonte não acessível para operação comum |
| `nao_validado` | Fonte ainda não aprovada para uso operacional |

`Scraping` não é modo de uso. Estado de scraping:

- `proibido_por_padrao`
- `exige_validacao_juridica_tecnica`
- `nao_aplicavel`

---

## 5. Maturidade de fonte

```text
CATALOGADA
→ DOCUMENTADA
→ TERMOS_A_CONFIRMAR
→ ELEGIVEL_PARA_PILOTO
→ PILOTO_INTERNO
→ HOMOLOGADA_MANUAL
→ HOMOLOGADA_API
```

Estados alternativos: `RESTRITA`, `DESCONTINUADA`.

Nenhuma fonte pode receber `HOMOLOGADA_API` sem decisão humana, termo verificado, responsável e registro de piloto.

---

## 6. Matriz de avaliação

### `source_evaluation_matrix`

- `source_id`
- valor_genealogico
- tipos_evidencia_possiveis
- cobertura
- acesso
- termos_consulta_manual
- termos_linkout
- termos_api
- dados_pessoais_risco
- confiabilidade
- integracao_proposta
- risco
- revisao_humana_obrigatoria
- cache_retencao
- projecao_cliente_permitida
- parecer_operacional
- decisao_humana
- decidido_por
- decidido_em
- status

A projeção ao cliente é sempre indireta: fonte não aparece no App; apenas evidência/entrega sanitizada aprovada.

---

## 7. Backlog de ativação

### `sources_activation_backlog`

- `source_id`
- `pais_trilha`
- `case_id` opcional
- `motivo_prioridade`
- `utilidade_para_caso`
- `condicao_pendente`
- `proximo_passo`
- `responsavel`
- `prioridade`
- `decisao_humana`
- `data_decisao`
- `status`

Visões necessárias:

- Fontes relevantes para casos ativos.
- Termos a confirmar.
- Elegíveis para piloto.
- Restritas.
- Por país/trilha.
- Por tipo de acervo.
- Sem responsável.
- Aguardando decisão humana.

---

## 8. Ligação com pesquisa

Uma fonte catalogada pode ser vinculada a `research_item`, `research_person`, `document_request`, `evidence`, `genealogical_finding` e `research_action_plan_item`.

Vincular fonte não equivale a consultar a fonte. Toda consulta futura deverá gerar `source_access_logs`, com finalidade, modo de acesso, data, responsável, resumo do resultado, revisão humana e retenção.

---

## 9. Limites de segurança

- Não armazenar token, credencial, payload completo ou documento bruto em log de acesso.
- Não mostrar fonte, URL, API, mecanismo de matching, licença ou logs no App Cliente.
- Fonte colaborativa é exploratória e inicia evidência com confiança inicial ou baixa.
- Fonte institucional não elimina necessidade de validação do vínculo individual.
- Busca negativa é uma evidência pesquisável e deve ser registrada.

---

## 10. Critérios de aceite

1. Fonte pode ser cadastrada sem criar integração.
2. Fonte sem termos validados não pode ir a piloto.
3. Fonte restrita não aparece como sugestão operacional.
4. Fonte manual pode vincular-se a pesquisa sem consulta externa.
5. Fonte homologada manualmente não equivale a API homologada.
6. Fonte não aparece diretamente no App Cliente.
7. Backlog permite priorização por caso, país e tipo de acervo.
8. Nenhuma API, scraping ou consulta real é executada.
