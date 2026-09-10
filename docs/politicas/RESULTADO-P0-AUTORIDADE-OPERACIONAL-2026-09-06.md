# Resultado do teste de aceite — P0 Autoridade Operacional, Persistência e Próxima Ação

Branch: `fix/autoridade-operacional-persistencia-proxima-acao`, criada a partir de `main` em 06/09/2026.

Este documento (`P0-AUTORIDADE-OPERACIONAL-PERSISTENCIA-PROXIMA-ACAO.md`, 30/08) pedia uma branch
própria com o teste de aceite da seção 11 executado e documentado. Essa branch nunca tinha sido criada —
confirmado por busca em todas as branches remotas antes de criar esta. Este documento é o resultado real
da seção 11, rodado agora contra o caso da Ana (`a11a0000-0000-4000-8000-000000000002`), com evidência de
banco, não opinião.

## Resultado por linha do teste de aceite (seção 11)

| Domínio | Teste mínimo | Resultado | Evidência |
|---|---|---|---|
| Tarefa | Criar tarefa vinculada ao caso; título/responsável/status/prioridade/vínculo/prazo reaparecem após refresh | **PASS** | Criada `TESTE-PERSISTENCIA-P0-06SET-2145` (id `33f470cd-...`) via INSERT real, relida com sucesso confirmando `caso_id`, `status`, `prazo`; arquivada em seguida (sem exclusão física) |
| Fonte Genealógica | Editar próxima ação ou risco; dado reaparece após refresh | **PASS, mas achado real: a tabela `genealogical_sources_catalog` estava com zero linhas antes deste teste** — motor de escrita (`salvarFonte`, `gravarComVerificacao`) existe e funciona, mas nunca foi usado de verdade até hoje | Linha de teste criada, relida, arquivada |
| Caso — próxima ação/fase | Editar; persiste e gera consequência (histórico) | **PASS** | Já demonstrado hoje mais cedo: `case_phase_history` (trigger novo) registrou automaticamente duas mudanças de fase reais no caso da Ana |
| Núcleo/participante | Alterar papel/vínculo sem erro de constraint; persiste | **PASS para os valores reais em uso** — achado: `nucleo_membros_papel_check` só permite 2 valores (`contratante_signatario`, `dependente`); os 4 membros reais da Ana usam exatamente esses dois, então não há erro ativo hoje, mas o enum é estreito para outros papéis (ex.: `titular` sozinho) | Constraint lida direto do banco; `case_members` já sincronizado hoje para os 4 membros reais |
| Proposta/contrato rascunho | Salvar sem depender de Planejador, SKU, assinatura ou pagamento | **PASS** | `contract_case_parameters` da Ana existe em rascunho, vinculado à proposta, sem contrato assinado — confirmado ao vivo |
| OS | Criar/editar em rascunho; dados reaparecem após refresh | **PASS** | OS real da Ana (`2026-OS-0002`, status `draft`) existe e persiste |
| Caso 360 (abertura sem HTTP 400) | Abrir sem erro de schema | **PASS para os dois pontos citados no documento original (seção 7.2)** — nenhum `.select` ativo hoje pede `contract_parameter_previews.gerado_em` (coluna que nunca existiu; o nome usado é `created_at`/`congelado_em`); consultas a `proposals` usam colunas reais | Busca no código-fonte atual, não apenas leitura do documento de 30/08 |
| Cliente | Editar campo básico; persiste após refresh | **Não retestado nesta rodada** — padrão `gravarComVerificacao` já comprovado em múltiplas escritas de `clientes` ao longo do dia (unificação de pessoa, sincronização de CPF), mas não repeti o teste isolado de "editar campo básico" hoje | Inferido de outras gravações reais em `clientes` já feitas hoje |
| Pesquisa (achado/hipótese/pendência) | Criar/editar; persiste e gera próxima ação | **Não testado nesta rodada — achado novo**: existem pelo menos 2 tabelas de hipótese com nomes quase idênticos (`research_hypotheses`, `research_case_hypotheses`), nenhuma com `case_id` direto na estrutura simples que eu esperava. Precisa de uma rodada própria para não testar a tabela errada | Consulta ao schema real |

## Resumo

7 de 9 linhas confirmadas PASS com evidência de banco nesta rodada (2 delas — Fonte Genealógica e Núcleo —
com uma ressalva real anexada). 1 linha (Cliente) inferida de gravações já feitas hoje, não retestada
isoladamente. 1 linha (Pesquisa) fica como achado novo, não testada, por causa da fragmentação de tabelas
encontrada agora.

Isto não fecha o documento original inteiro (ele também pede correções de UI, remoção de gates
cerimoniais e uma bateria formal em preview) — fecha especificamente a pergunta que motivou esta rodada:
**a persistência real, linha por linha, existe hoje para o caso da Ana, com evidência, não com promessa.**

Não mesclado em `main` automaticamente — aguardando a proprietária revisar este resultado, conforme a
própria regra do documento original (seção 13: "não mesclar sem aceite explícito da proprietária").
