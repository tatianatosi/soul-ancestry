# Relatório de validação independente — Top SKUs Clube Ancestral

**Data da revisão:** 10 de agosto de 2026  
**Escopo revisado:** documento de proposta com 415 linhas e matriz auxiliar com 91 registros de SKU. Foi também feita conferência de cobertura, nomes e status contra o catálogo oficial citado (`SANEAMENTO_DE_SKUS.csv`, 91 registros), exclusivamente para validar a regra de fonte de verdade.  
**Natureza do parecer:** revisão crítica de consistência e governança; não constitui aprovação operacional, jurídica, comercial ou de catálogo.

## 1. Resultado geral

# **APROVADO COM RESSALVAS**

A proposta atende às salvaguardas centrais: é textual e não executa alterações de sistema; usa linguagem de candidatura e validação humana; não contém promessas jurídicas ou comerciais proibidas; preserva itens históricos; mantém o App Cliente sem SKU/ranking técnico; e apresenta plena consistência interna entre a matriz do documento e o CSV.

A ressalva é **moderada** e localizada: `CA-CURSO-001` está no catálogo oficial com status atual **Arquivado**, mas aparece como `CANDIDATO TOP 30` no documento e no CSV sem expor expressamente esse conflito de status nem colocá-lo de modo específico na fila de validação. A condição de “candidato” e as travas gerais impedem que isso seja uma ativação automática, mas a pendência deve ficar explícita antes de usar a recomendação como insumo de decisão.

## 2. Método e síntese da evidência

- Leitura integral das 415 linhas da proposta e dos 91 registros de dados do CSV (92 linhas físicas, incluindo cabeçalho).
- Extração e comparação dos 91 pares `SKU`/`Rótulo de status` da seção **Matriz de priorização completa** contra os 91 pares do CSV.
- Validação de listas, rótulos permitidos, cobertura, duplicidade, recomendação resumida, rastreabilidade de linhas `-OLD` e tabela de pontuação.
- Recalculo programático de todas as 30 linhas da matriz de pontuação, além de reamostragem destacada de oito linhas.
- Busca textual por linguagem proibida, números de mercado, prazos em dias e menções de resultado jurídico.
- Conferência independente do conjunto de 91 SKUs e dos nomes contra o catálogo oficial citado, para avaliar a regra de status/fonte de verdade.

### Contagens verificadas

| Rótulo | Quantidade no CSV | Quantidade esperada pela proposta |
| --- | ---: | ---: |
| `CANDIDATO TOP 10` | 10 | 10 |
| `CANDIDATO TOP 30` | 20 | 20 adicionais |
| `ARQUIVAR/HISTÓRICO` | 24 | — |
| `NÃO PRIORITÁRIO` | 26 | — |
| `PENDENTE DE VALIDAÇÃO HUMANA` | 11 | — |
| **Total** | **91** | **91** |

## 3. Problemas encontrados

### Problema 1 — status oficial “Arquivado” não explicitado para candidato Top 30

- **Localização exata:** Matriz de priorização completa, linha 81 (`CA-CURSO-001`); lista **Candidatos Top 30**, linha 218; matriz de pontuação 0–5, linha 265; CSV, registro físico 51 (`CA-CURSO-001`). A fonte oficial citada registra o SKU como **Arquivado** na sua linha 51.
- **Descrição:** `CA-CURSO-001 — Kit Pesquisa Faça Você Mesmo` recebe o rótulo `CANDIDATO TOP 30` e a confiança “Hipótese estratégica”, mas a proposta não informa, nessas localizações, que o status atual no catálogo oficial é Arquivado. A fila inclui validação de conteúdo/autonomia (item 8), porém não nomeia a decisão de manter, reativar ou definitivamente arquivar esse SKU. Isso enfraquece a rastreabilidade da regra de que o catálogo é a referência de status; não se trata de uma ativação efetiva, pois o documento mantém a candidatura pendente e proíbe publicação.
- **Severidade:** **Moderado.**
- **Sugestão de correção:** escolher uma das duas opções, sempre por decisão humana: 
  1. reclassificar `CA-CURSO-001` como `PENDENTE DE VALIDAÇÃO HUMANA` até a ratificação de status; ou
  2. manter `CANDIDATO TOP 30`, mas acrescentar na matriz, no CSV e na fila: “status atual no SANEAMENTO: Arquivado; candidatura condicionada à decisão humana de reativação/ajuste; sem publicação, link ou cobrança até ratificação”.

### Sem outros problemas críticos ou menores identificados

Não foram encontradas divergências de SKU/rótulo entre o documento e o CSV, erro de soma, rótulo fora do conjunto autorizado, duplicidade nas listas Top 10/Top 30, promessa jurídica, prazo fixo em dias, número de mercado inventado, tratamento de Sophi/link isolado como prova suficiente, exposição de SKU/ranking no App Cliente, nem perda de rastreabilidade de linhas `-OLD`.

## 4. Checklist obrigatório A–K

| Item | Verificação realizada | Resultado |
| --- | --- | --- |
| **A** | Leitura integral da proposta (415 linhas) e do CSV (91 registros de SKU). | **Conforme.** Leitura concluída integralmente. |
| **B** | Busca por `garante`, `certeza`, `100% de sucesso`, `aprovação garantida`, `elegibilidade confirmada` e expressões de prazo em dias. Também foi feita leitura contextual das menções a aprovação, elegibilidade, êxito jurídico, obtenção de documento e prazo. | **Conforme.** Zero ocorrências das cinco expressões proibidas e zero prazos em dias. As menções a elegibilidade/aprovação/prazo nas linhas 131, 168, 344, 346, 352, 377–380, 403 e 411 são preventivas/negativas (“não prometer”, “não concluir”, “não pode exibir”), não promessas. |
| **C** | Varredura de valores monetários, percentuais, números de leads/clientes e conversão; revisão dos números estruturais e de pontuação. | **Conforme.** Não há percentuais, contagens de leads/clientes, taxas de conversão, volumes, receita, margem, custo ou demanda afirmados como fatos. Os únicos valores monetários reproduzidos são `R$ 1.436` e `R$ 990` (linhas 41 e 132), explicitamente apresentados como conflito e atribuídos a SANEAMENTO/Auditoria-Mãe. As escalas 0–5, 0–50, somas e contagens são elementos metodológicos/calculáveis; `5min`, `60s` e “3 sobrenomes” são nomes/descrições catalogadas, não prazos de entrega. |
| **D** | Comparação de todos os 91 SKUs e seus rótulos na Matriz de priorização completa contra o CSV. | **Conforme.** 91/91 SKUs coincidem; não há SKU somente em um dos arquivos e não há qualquer rótulo diferente. |
| **E** | Extração das duas listas e validação de cardinalidade, sobreposição e duplicidade. | **Conforme.** A lista Top 10 contém exatamente 10 itens; a lista Top 30 contém exatamente 30 itens no total, sendo os mesmos 10 mais 20 adicionais. Não há repetição nem item Top 10 ausente da lista Top 30. |
| **F** | Conferência da coerência entre confiança e evidência para os 30 candidatos. | **Conforme, com a ressalva de status do Problema 1.** Há 2 itens como “Validado por evidência direta”: `CA-CID-001` (linha 131) e `CA-CID-003` (linha 134), ambos sustentados pela Auditoria-Mãe e pelo caso real de Giovanna. Os demais se distribuem em 3 “Parcialmente validado” e 25 “Hipótese estratégica”; Sophi é expressamente tratada como caso-modelo, e Pareto/link isolado não é tratado como prova suficiente. `CA-CURSO-001` permanece hipótese, mas seu status oficial Arquivado deve ser explicitado. |
| **G** | Estrutura e aritmética da matriz 0–5 de 30 candidatos. | **Conforme.** Todas as 30 linhas têm exatamente 10 notas A–J, cada uma no intervalo 0–5, e as 30 somas declaradas batem com a soma das notas. Reamostragem manual: `CA-CID-001` 41 (linha 236), `CA-CID-002` 37 (237), `CA-CID-023` 35 (238), `CA-CID-003` 37 (239), `CA-HIST-001` 37 (240), `CA-MEM-003` 38 (242), `CA-ASS-001` 33 (246) e `CA-CURSO-001` 31 (265). As somas também coincidem com o CSV. |
| **H** | Checagem de rastreabilidade de `-OLD`, duplicados e itens obsoletos. | **Conforme.** As 19 linhas `-OLD` do CSV e da matriz estão como `ARQUIVAR/HISTÓRICO`; todas apontam uma linha canônica no texto resumido. Duplicados não-`OLD` relevantes também são preservados/encaminhados com a referência canônica, por exemplo `CA-CID-004/005 → CA-CID-006`, `CA-CID-007 → CA-CID-011`, `CA-CID-008 → CA-CID-014` e `CA-MEM-002 → CA-MEM-003`. |
| **I** | Revisão da Matriz de exibição por sistema. | **Conforme.** A linha 376 restringe explicitamente o App Cliente/Canvas a etapa, entrega, evidência, progresso, checklist e próximo passo; proíbe SKU/ID, ranking Top 10/Top 30, catálogo técnico, preço provisório e link isolado. |
| **J** | Verificação do cabeçalho de status no início. | **Conforme.** A linha 3 traz, de forma clara, “PROPOSTA — PENDENTE DE VALIDAÇÃO HUMANA” e esclarece que não se trata de decisão automática nem alteração de catálogo. |
| **K** | Cruzamento das pendências distribuídas no documento com a Fila de validação humana. | **Parcialmente conforme.** A fila cobre a ratificação dos 30 candidatos, preço/escopo/link, duplicidades, assinaturas, capacidade/direitos, CRM/Planejador/Sophi, países e conteúdo de cursos. A única lacuna identificada é a decisão específica sobre o status Arquivado de `CA-CURSO-001` (Problema 1). Recomenda-se adicioná-la à fila, idealmente junto ao item 8 ou como subitem explícito. |

## 5. Verificação das oito regras inegociáveis

1. **Sem ação em sistemas:** conforme. A linha 5 proíbe expressamente criar, editar, desativar, publicar, pagar, integrar ou excluir; as ondas 1 e 4 também vedam criar/alterar produto, link ou cobrança com base na recomendação.
2. **Nenhum Top SKU definitivo:** conforme. O cabeçalho, o resumo e as listas usam “candidato”, “proposta” e “pendente de validação humana”; não foi localizada declaração de SKU definitivo.
3. **Sem números/evidência de mercado inventados:** conforme. A proposta declara ausência de séries de demanda, receita, conversão e margem; o único valor monetário é tratado como conflito de fontes, não como preço recomendado.
4. **Catálogo como fonte de existência/status:** conforme com a ressalva moderada de `CA-CURSO-001`. Os 91 SKUs e nomes conferem com o catálogo e os conflitos relevantes são mantidos como pendência; falta tornar expresso o status Arquivado desse candidato específico.
5. **Separação SKU versus experiência do cliente:** conforme. A regra do App Cliente é explícita e adequada.
6. **Sophi/teste/link isolado não como prova suficiente:** conforme. Sophi aparece como caso-modelo/piloto, e link/Pareto aparecem apenas como sinais auxiliares ou itens a reconciliar.
7. **Históricos e duplicados preservados:** conforme. Não houve remoção/omissão; há rótulo histórico e linha canônica.
8. **Sem nova família sem teste de encaixe:** conforme. A arquitetura mantém sete famílias; países são explicitamente contexto de caso, não família paralela, e o texto declara que nenhum candidato implica novo SKU.

## 6. Confirmação da correção recente do CSV

**Confirmada.** As 30 linhas candidatas — exatamente 10 `CANDIDATO TOP 10` e 20 `CANDIDATO TOP 30` — contêm simultaneamente:

- `papel contextual:`;
- `gatilho de uso:`; e
- a ressalva “candidato — pendente de validação humana antes de qualquer decisão de catálogo.”

Nenhuma das 61 linhas não candidatas recebeu indevidamente `papel contextual:` ou `gatilho de uso:`. Portanto, a substituição da antiga linguagem de “absorção/redirecionamento” ocorreu nas 30 linhas corretas e não afetou indevidamente as demais. A ressalva do Problema 1 não invalida essa confirmação; uma condição de status pode ser acrescentada ao texto contextual de `CA-CURSO-001` sem remover a estrutura corrigida.

## 7. Conclusão e condição de uso

A recomendação pode seguir como **insumo auditável para deliberação humana**, não como comando de operação. Antes de qualquer decisão comercial posterior, corrija ou registre explicitamente a pendência de status de `CA-CURSO-001`, incluindo responsável e decisão esperada na Fila de validação humana. Permanecem aplicáveis todas as travas já previstas para preço, escopo, link, direitos, capacidade, caso-modelo, pagamento e publicação.
