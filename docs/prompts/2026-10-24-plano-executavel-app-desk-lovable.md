# Clube Ancestral: plano executável do App Cliente e Desk V4

O App Cliente vem primeiro: recuperar a experiência rica aprovada, usando os conteúdos reais já produzidos, e permitir que a operação a sustente. Este é um plano de implementação por entregas verificáveis, não uma autorização para redesenhar o produto nem outra declaração de que o sistema está pronto.

```yaml
status: em revisão
versao: v1.0
data: 2026-10-24
alvo: lançamento de domingo, 2026-10-25, condicionado ao aceite
responsavel_pela_decisao: Proprietária do Clube Ancestral
classificacao: plano executável e especificação de correções
caminho_proposto: docs/prompts/2026-10-24-plano-executavel-app-desk-lovable.md
substitui:
  - Prioridades e estados de PR do checklist anterior desta sessão, no que estiver explicitamente atualizado aqui
nao_substitui:
  - Mockup aprovado de 17 páginas
  - Prancha visual aprovada do Desk V4
  - Decisões posteriores expressas da proprietária
escopo:
  - 11 anexos recebidos, incluindo 10 PDFs e um CSV
  - Todas as 216 páginas de conteúdo PDF distinto, com índice individual e inspeção visual
  - 53 achados do CSV original, sem apagar os antigos por ausência em relatório posterior
  - Análise estática de 1026 arquivos de código e 123 declarações de rota
  - Inventário de 622 referências candidatas de destino no código
  - Conferência pública do Lovable e dos redirecionamentos de autenticação
base_github: d537e45204162a29a2f14535db7cc8ec141021fd
base_publicada_confirmada_no_navegador: d537e45204162a29a2f14535db7cc8ec141021fd
premissas:
  - Aprovação visual não autoriza copiar fatos, documentos, preços ou identidades demonstrativos.
  - A casca aprovada deve ser preservada; conteúdo ausente requer rastrear sua origem, não esvaziar a promessa.
  - Cada função já existente deve ser reaproveitada antes de construir outra.
  - A mesma família e o mesmo caso devem acompanhar leitura, edição, publicação e navegação.
limites:
  - Não houve login independente da cliente nem autenticação da proprietária no Lovable nesta rodada.
  - A inspeção anônima não valida operações de escrita, conteúdo interno, autorização por caso ou arquivos privados.
  - Testes locais do aplicativo não foram executados; CI remoto foi consultado.
  - Nenhuma alteração de aplicativo, merge, deploy, migration, publicação editorial, convite ou cobrança foi executada.
fontes:
  - PDFs e CSV anexados, com nomes, páginas e diferenças registrados no caderno técnico
  - GitHub tatianatosi/soul-ancestry, código e PRs recentes
  - Navegador cloud no site publicado do Lovable
proximos_passos:
  - Executar o pacote EXEC-01, reaproveitando a PR190, após revisão e autorização de integração.
  - Concluir contrato, conteúdo real e acesso independente, sem bypass de segurança.
  - Executar os pacotes visuais e funcionais preservando cada requisito aprovado.
criterio_de_aceite:
  - Prova publicada e autenticada do caminho Desk → dado persistido → conteúdo aprovado → App da cliente.
  - Sete abas ricas e funcionais, sem conteúdo fictício e sem redução silenciosa da experiência.
  - Contrato legível, condição comercial correta e cobrança autorizada sem duplicação.
  - Todas as falhas críticas encerradas por evidência, não apenas por prompt, relatório ou merge.
```

## Começar pelo App: sete telas, uma experiência

A referência aprovada tem o App na primeira parte: capa e abertura nas páginas físicas 1–2, suas sete telas nas páginas 3–9. Na prancha de seis páginas, o App ocupa as páginas 2–4 e precede o Desk; essa ordem de prioridade é mantida aqui.

| Tela | Preservar da referência | Aplicar, sem redesenhar | Prova de conclusão |
|---|---|---|---|
| **Home** · MOCK17 p.3; PRANCHA pp.2–3 | Saudação, caso, progresso, próximos passos, pessoas conectadas e achados | Reusar selo #186 e régua #187; alimentar ações e achados a partir de publicações reais; não repetir cobrança como narrativa genealógica | Um próximo passo verdadeiro com destino útil, achado já produzido acessível, métricas com significados distintos |
| **Jornada** · MOCK17 p.4; PRANCHA pp.2–3 | Duas linhas: história e processo; destaque de união de ramos | Usar publicações de história/processo e o escritor existente de União de Ramos; não inventar uniões ou datas | Marco real, origem rastreável, detalhe legível e ligação explícita quando houver evidência |
| **Radar** · MOCK17 p.5; PRANCHA pp.2–3 | Gráfico central, seis dimensões e cartões explicativos | Preservar composição e seis posições; calcular só eixos com base; separar prontidão, progresso e elegibilidade | Cada valor tem origem; ausência aparece como ausência; nenhuma pontuação se apresenta como chance jurídica |
| **Árvore** · MOCK17 p.6; PRANCHA pp.2–3 | Hierarquia visual, conexões, gerações e contexto | Preservar árvore geracional publicada; conferir correspondência com cadastro civil; recolher repetição de nomes sem apagar dados | Pessoa e relação corretas; gerações dinâmicas; nenhuma família demonstrativa ou de outro caso |
| **Documentos** · MOCK17 p.7; PRANCHA pp.2 e 4 | Upload, checklist consolidado, contador e entregas | Manter #184; localizar arquivos reais, publicar somente os autorizados e testar upload/download no acesso real | Pedido e arquivo corretos, contador derivado, arquivo abre, atualização persiste |
| **Legado** · MOCK17 p.8; PRANCHA pp.2 e 4 | Achados narrativos com data e detalhe; conteúdo editorial | Reusar pesquisa já feita; completar publicação até chegar à tela; manter oferta premium como requisito pendente de condição real, não apagá-la por parecer de auditor | Achado verdadeiro abre detalhe; narrativa útil; CTA comercial só com oferta vigente aprovada |
| **Conta** · MOCK17 p.9; PRANCHA pp.2 e 4 | Perfil, serviço/plano, histórico e preferências | Usar identidade e contrato vigentes; distinguir previsto, contratado, cobrado e pago; não restaurar preços de demonstração | Perfil correto, condição coerente, histórico real e nenhum plano ativo inferido |

**Regra visual:** manter navy, creme, dourado, tipografia, logo, hierarquia editorial, cartões e navegação das sete abas. Dados insuficientes não justificam retirar toda a composição, e composição bonita não justifica inventar dados.

**Regra de autoridade:** “fora do escopo” e “divergência intencional”, escritos por um auditor, não cancelam automaticamente o que a proprietária aprovou. Premium, critérios do Radar, gerações e exposição comercial permanecem explicitamente rastreados; qualquer mudança de significado exige a decisão correspondente.

## O que mudou desde o checklist anterior

As versões recentes foram relidas no GitHub, e os documentos antigos não foram tomados como retrato atual. A prioridade agora é completar o circuito de operação e conteúdo, aproveitando as mudanças já integradas.

| Item | Estado atualizado | Consequência executável |
|---|---|---|
| #181 · Caso 360 em cards | Mesclada | Preservar oito cards de resumo, modo de ficha completa e links para o GoLive do mesmo caso |
| #182 · Origem do magic link | Mesclada | Testar o link no domínio operacional; não reimplementar a origem |
| #183 · Leitura de contrato | Mesclada | Testar diálogo/iframe com contrato real; não abrir outra PR idêntica |
| #184 · Checklist documental | Mesclada | O achado antigo “sem leitor” foi atendido em código; completar dados e teste autenticado |
| #185 · Documentos reais | Mesclada, mas apenas SQL proposto em `supabase/pendentes/`, com `PREENCHER` | Não está aplicada nem comprova arquivo disponível; não executar o SQL sem completar e revisar |
| #186 · Selo do caso | Mesclada | Preservar linguagem da família; selo não é ativação |
| #187 · Régua de preparação | Mesclada | Preservar separação entre preparação e pesquisa; não mapear fases por equivalência inventada |
| #188 · Bloqueios do piloto | Mesclada | Mostra a trava, mas não a resolve; confirmar os bloqueios reais após publicação |
| #189 · “Nada persiste” | Mesclada, apenas laudo | Nenhuma implementação dos três componentes propostos é provada por essa PR |
| #190 · Ação de resolução | Aberta na inspeção, patch revisado | Primeira candidata: monta o escritor existente em tela; testar comportamento e autorização antes de integrar |

Os estados e escopos foram conferidos nas [PR #181](https://github.com/tatianatosi/soul-ancestry/pull/181), [PR #183](https://github.com/tatianatosi/soul-ancestry/pull/183), [PR #185](https://github.com/tatianatosi/soul-ancestry/pull/185), [PR #188](https://github.com/tatianatosi/soul-ancestry/pull/188), [PR #189](https://github.com/tatianatosi/soul-ancestry/pull/189) e [PR #190](https://github.com/tatianatosi/soul-ancestry/pull/190). A base `d537e452` teve CI remoto concluído com sucesso, o que não substitui teste de uso autenticado ([execução do CI](https://github.com/tatianatosi/soul-ancestry/actions/runs/40096932309)).

### Lovable publicado: correção do diagnóstico de defasagem

O navegador desta rodada identificou `data-commit-sha="d537e45204162a29a2f14535db7cc8ec141021fd"` no site publicado, igual à base GitHub inspecionada. Portanto, a divergência de versão observada no checklist anterior não deve continuar sendo apresentada como bloqueio atual; uma consulta HTTP anterior nesta mesma rodada ainda retornara `25d0c244`, razão para registrar horário/revisão e preferir a confirmação posterior no navegador ([Lovable publicado](https://soul-ancestry.lovable.app)).

Isso comprova a identificação da revisão entregue, não o funcionamento das áreas privadas. Home pública, entrada da equipe e porta do cliente foram abertas; as rotas protegidas testadas redirecionaram à autenticação, com resultados individuais no caderno técnico.

## Ordem de execução: uma fila, não novos estudos paralelos

| Pacote | Resultado concreto | Executor | Depende de |
|---|---|---|---|
| EXEC-00 | Base e referências congeladas para este ciclo | Responsável técnico | Já levantadas; reconferir SHA antes de editar |
| EXEC-01 | Operadora consegue resolver um bloqueio real pelo produto | Responsável técnico; proprietária decide cada resolução | Revisar #190 e confirmar papel/organização |
| EXEC-02 | Contrato real legível e formalização/cobrança coerentes | Técnico + operação | Versão e dados comerciais vigentes |
| EXEC-03 | Documentos e conteúdo real disponíveis ao caso certo | Operação + técnico | Arquivos/fontes existentes, revisão e autorização |
| EXEC-04 | Sete abas recuperam valor e ações úteis | Técnico + operação editorial | Conteúdo do EXEC-03 e acesso independente |
| EXEC-05 | Desk mantém a prancha e opera o caso sem páginas intermináveis | Técnico | Reusar #171/#174/#180/#181 e os escritores existentes |
| EXEC-06 | Cada ação crítica salva ou explica claramente a recusa | Técnico | Executar junto de cada pacote, não como megaprojeto separado |
| EXEC-07 | Uma homologação final da candidata publicada | Técnico + proprietária | Pacotes críticos concluídos e sessão autorizada |

EXEC-01, EXEC-02 e a localização do acervo real são o caminho inicial. Não aguardar uma modernização total do CRM ou o mapeamento universal de todas as regras do banco para atender o primeiro cliente.

## EXEC-00: preservar a base e impedir nova regressão

**Entregar:** uma branch de correção sobre a revisão atual, com escopo fechado por pacote. Não alterar a interface antes de capturar o trecho equivalente da referência e o comportamento atual.

- Conferir `git status` e SHA; se main avançar, reconciliar o diff antes de tocar no mesmo arquivo.
- Manter `src/lib/navegacao-desk.ts`, `src/components/saas/shell.tsx` e `src/components/portal/portal-shell.tsx` como referências existentes, sem criar outro shell.
- Preservar o Caso 360 macro e o GoLive como vida completa do caso, conforme decisão de 23/10.
- Não aplicar um relatório de 06/10 que trata o shell GoLive como separado sobre o código de 24/10 que já o monta em `SaasShell`.
- Manter todos os escritores e editores até provar equivalência; não remover uma rota por parecer duplicada visualmente.
- Não abrir migration nova, trocar Supabase, migrar hospedagem ou implementar um “motor único” amplo como condição artificial para domingo.

**Aceite:** diff limitado, referência identificada e nenhuma exclusão de função operacional aprovada. Arquivo de documentação entregue não encerra um item de implementação.

## EXEC-01: bloqueio com ação operável, não apenas aviso

**Diagnóstico reconciliado:** o código de main mostra bloqueios reais após #188, mas o escritor `resolverBloqueioPiloto` ainda não estava montado nesse fluxo. A PR #190 liga a função existente; não se trata apenas de pedir uma decisão que a proprietária já poderia executar.

**Arquivos da correção candidata:**

- `src/routes/_authenticated/onboarding.$id.tsx`
- `src/lib/piloto.functions.ts`
- `src/lib/orfaos-classificados.ts`
- `src/lib/__tests__/resolver-bloqueio-piloto-2026-10-24.test.ts`, presente na PR

**Aplicar:**

1. Revisar a PR #190, sem criar outro `resolverBloqueioPiloto`.
2. Confirmar que cada ação usa o `id` do bloqueio exibido e que o servidor limita a organização e o papel.
3. Manter justificativa real obrigatória. A string automática “Sem justificativa informada.” não pode satisfazer artificialmente a regra.
4. Tratar tanto exceção lançada quanto retorno `{ ok: false, erro }`; nenhuma dessas respostas pode gerar sucesso.
5. Após uma decisão autorizada, reler bloqueios e recalcular a prontidão. Estado local e toast não bastam.
6. Preservar rastreio de autor/data e não expor “resolver tudo”.
7. Só ativar após a regra real permitir e mediante autorização específica.

**Testar antes do merge/publicação:** justificativa vazia/curta, cancelamento, usuário sem permissão, registro de outra organização, erro de rede, retorno negativo, resolução válida, F5 e repetição da ação. Usar ambiente e registro de teste autorizados; não marcar bloqueio real como não aplicável só para “testar”.

**Aceite:** a operação consegue completar a decisão legítima pela interface; banco, tela e nova sessão concordam. Se um requisito material não foi cumprido, ele continua pendente, com caminho claro para regularização.

## EXEC-02: contrato, formalização e recebimento

**Entregar:** o instrumento correto pode ser lido e encaminhado pelo fluxo autorizado, sem criar outra versão por simples abertura. Cobrança e assinatura devem refletir o acordo vigente e não a demonstração do mockup.

**Referência da proprietária:** Estudo Genealógico v2, original de oito páginas e 16 cláusulas, sem recuperar o contrato-base obsoleto como novo instrumento comercial. Um arquivo de código com nome interno “base” não prova sozinho que o texto está errado; comparar o conteúdo persistido com o original aprovado.

**Regra comercial explicitamente corrigida pela proprietária em 24/10, na sessão `d7498c11`, às 11:56 UTC:** três assinaturas de R$ 320 por mês, durante dez meses, total familiar R$ 9.600. Cada assinatura totaliza R$ 3.200 no período, não por mês; não usar o rateio histórico R$ 4.800/R$ 2.400/R$ 2.400. Conferir o instrumento persistido contra essa instrução antes de qualquer cobrança, sem presumir que a correção já foi aplicada no banco.

**Arquivos para reaproveitar:**

- `src/routes/_authenticated/contratos.$id.tsx`, com a correção #183.
- `src/routes/_authenticated/casos.$caseId.contrato.preparar.tsx`.
- `src/components/contrato/cards-contrato-caso.tsx`.
- `src/components/contrato/reconciliar-contato-partes.tsx`.
- `src/lib/contrato-preparar.functions.ts` e `src/lib/comercial.functions.ts`.

**Aplicar:**

1. Abrir o contrato persistido e conferir a versão do texto, participantes, signatários, pagadores, escopo, anexos e valores.
2. Testar as duas leituras corrigidas por #183, inclusive fechar/reabrir e rolar até o final.
3. Comparar integridade do instrumento, não apenas quantidade de páginas: mudança de paginação não prova perda de cláusula.
4. Preservar o modelo aprovado; corrigir preenchimento, apresentação ou ligação sem reescrever a política jurídica.
5. Garantir que contrato, proposta, OS e anexos tenham função distinta. Não criar assinaturas duplicadas por haver vários cartões.
6. Mostrar estados de envio, aceite, assinatura, cobrança e recebimento separadamente.
7. Conferir cobrança preexistente e idempotência antes de emitir outra; não transformar o valor previsto histórico em recebimento.
8. Corrigir feedback de erro nas ações críticas usando o padrão existente, inclusive reconciliação de contato.

**Aceite:** abrir não grava; o contrato final está completo e legível; as ações não duplicam registros. Envio para assinatura, emissão/envio de cobrança e comunicação à cliente só ocorrem após autorização específica.

**Não fazer:** executar #173 ou saneamento histórico indiscriminadamente por estar na lista antiga. Primeiro reproduzir o problema na versão persistida e conferir se a correção ainda é necessária.

## EXEC-03: acervo e publicação real, sem conteúdo de mentira

**Entregar:** transformar o trabalho já feito em material visível à cliente. Primeiro procurar registro, arquivo e vínculo existentes; só pedir novamente o que de fato não estiver disponível.

**Reaproveitar:**

- `src/routes/portal/documentos.tsx`, com #184.
- `src/lib/portal-cliente.functions.ts`: `meuCaso`, `prepararEnvioDocumento`, `confirmarEnvioDocumento`, `baixarEntrega`.
- `src/lib/documentos.functions.ts`.
- `src/components/biblioteca/fila-publicacao-real.tsx`.
- `src/components/biblioteca/conteudo-editorial-conectado.tsx`.
- `src/lib/biblioteca-evidencias.functions.ts`.
- `src/lib/projecao-publicavel.ts`, para diagnosticar recusa antes da publicação.

**Aplicar:**

1. Para cada documento/achado já produzido, localizar título verdadeiro, arquivo, origem, caso, permissão de uso e estado de revisão.
2. Separar `portal_document_requests`, tarefas internas, registros em `documents`, arquivos de storage, microentregas e projeções. Não somar essas fontes como se fossem documentos liberados.
3. Usar o fluxo existente de upload/ingestão autorizado. Preservar o arquivo original e seu vínculo; não fabricar `storage_path`.
4. Conferir que documento liberado tem arquivo real acessível pela função de download, não somente linha de banco.
5. Manter o checklist conectado por #184; completar os pedidos reais e testar a mudança de estado.
6. Publicar uma entrega real revisada pelo caminho governado. Confirmar que o leitor da cliente não a filtra silenciosamente.
7. Se houver conteúdo persistido que some no App, rastrear nesta ordem: caso/organização → autorização → tipo → aprovação → publicação → sanitização → leitor → componente.
8. Quando um texto for recusado pelo filtro, mostrar causa e correção editorial adequada. Não remover RLS ou sanitização global para “fazer aparecer”.
9. Adicionar devolutiva legível às três mutations editoriais sem `onError` direto, depois de verificar se já existe tratamento compartilhado. A falta de handler local é candidata à revisão, não prova automática de perda de gravação.

### Tratamento obrigatório da PR #185

O arquivo `supabase/pendentes/20261024120000_documentos_reais_ana_liberados.sql` continua contendo placeholders, apesar do merge. Seus comentários também repetem uma medição antiga de “0 bloqueios”, que não deve prevalecer sobre as fontes reais acrescentadas por #188.

Antes de qualquer aplicação: preencher apenas metadados verificados, revisar o vínculo, evitar duplicação por chave/idempotência e substituir a premissa “o total do caso será exatamente três” por uma validação restrita aos registros pretendidos. O arquivo atual não é um comando pronto para colar; o fluxo de produto já existente deve ser preferido quando cobrir a ação.

**Aceite:** pedido real, arquivo real, caso correto, liberação autorizada e abertura como cliente independente. A prévia administrativa permanece somente leitura e não é falha de upload por não deixar enviar arquivo.

## EXEC-04: conteúdo rico e ações de cada aba

**Entregar:** as sete telas da primeira seção deste plano, com sua composição aprovada e conteúdo útil, sem converter um painel financeiro em história familiar.

**Arquivos delimitados:** `src/routes/portal/{index,jornada,radar,arvore,documentos,legado,conta}.tsx`, componentes existentes em `src/components/portal/`, `src/components/caso/publicar-uniao-ramos.tsx` e leitores já usados por essas telas.

**Correção de uma conclusão de outra sessão:** em `d537e452`, `radar.tsx` monta `RadarSeisEixos` e `jornada.tsx` contém `data-jornada-duas-linhas`, Linha Ancestral e Linha do Processo. `visibilidadeTela`, em `app-visibilidade.ts`, retorna `always_available` para as sete abas principais quando há acesso; não há ali uma regra que desligue as sete por falta de certidão final. Portanto, não recriar o gráfico/estrutura nem remover essa proteção com base naquele diagnóstico; testar dados, composição e leitor efetivos.

**Aplicar:**

1. Conferir cada card e ação contra MOCK17 e PRANCHA; manter ordem de leitura e hierarquia.
2. Em Home, cada “Ver”, “Continuar” ou próximo passo precisa de destino real e contexto do caso. Não criar três ações fictícias para igualar o desenho.
3. Em Jornada, usar o escritor existente `publicarUniaoDeRamos` quando houver duas publicações e vínculo comprovado; preservar o lugar editorial sem inventar casamento.
4. Em Radar, manter as seis dimensões previstas e explicação de dados faltantes. A troca de “Elegibilidade” por “Progresso Geral” deve ter decisão rastreável; o relatório não a autoriza por si.
5. Em Árvore, manter G1–Gn conforme a família real, conexões e visual hierárquico. Repetições auxiliares podem virar detalhe recolhido, sem apagar a genealogia.
6. Em Documentos, provar os três blocos distintos: envio, checklist e entregas.
7. Em Legado, o “Ver detalhes” deve abrir material verdadeiro; reaproveitar a biblioteca editorial, não trocar a aba por um catálogo genérico.
8. Em Conta, representar a condição vigente e histórico real. Blocos comerciais demonstrativos ficam aguardando condição aprovada, não são lançados com preços do mockup.
9. Em todos os links de `LinkPortal`, preservar o caso escolhido. A autorização deve ser revalidada no destino, não herdada apenas do parâmetro.
10. Testar renderização em 375 px e desktop, áreas de toque, menu fixo, teclado, rolagem até o final e ausência de sobreposição.
11. Resolver o código público do caso para o UUID real antes de qualquer operação em campos `case_id` do tipo UUID. Não copiar o código textual `CA-CID-AT-FAM-2026-001` para uma chave estrangeira só porque um prompt antigo o utilizou assim.

### Separar os três “Apps”

- **`/portal/*`:** experiência real autenticada da cliente.
- **`/app-cliente-como-pessoa`:** prévia administrativa do caso, explicitamente sem provar identidade independente.
- **`/golive/app`:** superfície operacional/espelho, não substituta da experiência final.

O código de `/golive/app` ainda contém ações `IrPara` para `/portal/proposta` sem transmitir explicitamente o caso. Revisar essas duas chamadas dentro do contexto administrativo: preservar caso pela prévia adequada, não transportar a proprietária silenciosamente para o portal real de outra identidade.

**Aceite:** comparação de cada aba com a referência e um teste útil por bloco. “Sem dados” só é aceito depois de confirmar ausência verdadeira, não quando o material já está no Drive, na pesquisa, no banco ou numa fila de aprovação.

## EXEC-05: Desk V4 completo, com o que já existe preservado

As onze superfícies aprovadas não equivalem a onze novos menus, e a prancha de Portal/Configuração reúne funções que hoje têm destinos separados. A solução é conectar e organizar essas funções sem criar mais um sistema paralelo.

| Superfície aprovada | Destino atual a usar | Aplicação concreta |
|---|---|---|
| Hoje | `/painel` | Até quatro indicadores prioritários; cada gráfico responde a uma pergunta própria; links para decisão/tarefa/caso, sem somar contadores de fontes diferentes |
| Comercial | `/leads`, com ponte para `/calls` | Funil e carteira em leads; Calls é Discovery; não reconstruir todo o CRM dentro de Calls porque o comparativo antigo usou essa rota |
| Kanban | `/tarefas` | Quadro existente, filtros e criar tarefa visíveis; `/ops` continua leitura operacional, não substituto do Kanban |
| Caso 360 | `/casos/$caseId` | Preservar os oito cards de #181, ficha completa em modo próprio e âncoras funcionando |
| Pessoa 360 | `/pessoas/$clienteId` | Máscara de documento, rede e fontes reais; não usar `/pessoas` como carteira |
| Radar e matrizes | `/qualidade` | Rótulos humanos, eixo claro, coerência entre matriz e detalhe; não estimar eixo sem base |
| Pesquisa | `/pesquisa-modulo` | Pergunta, responsável e próxima ação; formulário em ação contextual; cadeia fonte/evidência/achado/microentrega preservada |
| Financeiro | `/financeiro` | Previsão separada de caixa; tabela utilizável no celular; retirar nomes técnicos da leitura principal |
| Jurídico/contrato | `/contratos` e detalhe | Manter quatro indicadores úteis, escopo/assinatura/completude, parecer específico da trilha separado de matriz de cláusulas |
| Pessoas e famílias | `/nucleos`, `/clientes` e Pessoa 360 | Conferir vínculo entre cadastro operacional e árvore publicada; não apagar uma fonte por parecer repetida |
| Portal/Configuração | `/acessos-portal`, prévia e `/configuracoes` | Conectar publicação, prévia, permissões e auditoria; cada contador mantém sua fonte explícita |

Marketing, Biblioteca, OPS, Calls, onboarding e todas as 19 rotas GoLive continuam no inventário complementar. Não somem do plano por não serem páginas autônomas da prancha de onze superfícies.

### Correções delimitadas por arquivo

- **`src/routes/_authenticated/financeiro.tsx`:** retirar da primeira leitura a explicação com `payments.conciliacao_status`, encontrada ainda no código; manter informação técnica em detalhe de suporte e corrigir largura/tabela se o problema persistir.
- **`src/routes/_authenticated/qualidade.tsx` e componentes chamados:** substituir enum cru por rótulo humano sem mudar o estado persistido; reproduzir divergência matriz/detalhe antes de alterar regra.
- **`src/routes/_authenticated/calls.tsx`:** preservar Antes/Durante/Revisão e handoff; agrupar formulários por momento, sem desmonte de escritor e sem duplicar pessoa/lead.
- **`src/routes/_authenticated/casos.$caseId.index.tsx`:** preservar #181; testar URL por UUID e código, com/sem barra final, inclusive âncoras que abrem a ficha.
- **`src/routes/_authenticated/tarefas.tsx`:** preservar o Kanban já presente e a ação de criação vinculada ao CRUD existente; não tratar “não abri a aba” como “a função não existe”.
- **`src/components/golive/shell.tsx` e `dados.ts`:** preservar `search={true}`, `casoId` no seletor, `queryKey` por caso e `useEscritorGoLive`. Testar links de ação internos que não passam pelo menu, pois o menu correto não garante todos os atalhos.
- **`src/lib/piloto-ana.ts:95`:** referência `/piloto-ana` sem rota registrada. Verificar chamadores; a busca atual não encontrou consumo de `derivarPendenciasPiloto` fora de sua definição. Tratar como referência legada candidata, não como botão quebrado comprovado da tela publicada.

**Aceite:** todas as superfícies mantêm seu conteúdo e têm caminho para executar a tarefa relevante. Nenhuma limpeza de menu remove um escritor ainda necessário.

## EXEC-06: persistência verificável, sem reescrever o banco inteiro

O laudo #189 propõe generalizar o diagnóstico das recusas. Sua contagem de 692 pontos de `RAISE EXCEPTION` não representa 692 bloqueios ativos da Ana, nem demonstra que o App perdeu todos os salvamentos; não transformar essa contagem em um projeto obrigatório antes de faturar.

**Aplicar em cada ação tocada:**

1. Explicar previamente a condição que bloqueia aquela ação, usando a fonte real.
2. Exibir motivo legível, campo/registro afetado e ação possível; preservar a mensagem técnica em detalhe.
3. Não tratar ausência de linhas como sucesso.
4. Confirmar retorno do escritor e reler o registro; invalidar a query correta do mesmo caso.
5. Proteger edição não salva ao sair, trocar caso ou atualizar.
6. Registrar uma prova de salvar → reler → F5 → nova sessão.
7. Não criar outro helper concorrente com `gravarComVerificacao`, `exigirLinhaGravada` ou `classificarErroPersistencia`.

**Primeiro corte:** onboarding, contrato/contatos, publicação editorial, documentos e próxima ação do caso. A análise AST encontrou 19 chamadas com objeto de `useMutation` sem `onError` direto; antes de corrigir, ler o tratamento compartilhado/caller. Não declarar 19 bugs só por essa contagem.

**Aceite:** a ação funciona ou recusa de forma compreensível; nada “parece salvo” sem persistência. Não desativar trigger, relaxar RLS nem mudar CHECK para passar no teste.

## EXEC-07: uma homologação final, com roteiro de ação

Executar sobre uma candidata publicada identificada. Depois disso, repetir apenas os testes afetados por uma correção, não produzir outra auditoria de todas as telas a cada ajuste.

| ID | Ação | Resultado obrigatório |
|---|---|---|
| T01 | Abrir Caso 360 por UUID/código, com/sem barra | Mesmo caso, sem carregamento infinito, com resumo e detalhe acessíveis |
| T02 | Escolher outro caso autorizado no GoLive, navegar e salvar dado de teste | Caso preservado em URL, leitor e escritor; nada muda na Ana por fallback |
| T03 | Resolver bloqueio de teste com justificativa inválida | Recusa legível; nenhuma mudança persistida |
| T04 | Resolver bloqueio autorizado com justificativa real | Persistência, auditoria e prontidão atualizadas após F5 |
| T05 | Abrir contrato e percorrer até o final | Texto integral, sem pop-up bloqueado, sem versão criada pela leitura |
| T06 | Repetir ação de formalização/cobrança em teste autorizado | Nenhuma duplicação |
| T07 | Preparar arquivo e enviá-lo no contexto autorizado | Arquivo e registro vinculados ao caso correto |
| T08 | Publicar material real revisado | Fila, leitor e App concordam; não fica “publicado mas invisível” |
| T09 | Entrar com identidade independente da cliente | Seu caso e suas entregas; nenhum privilégio da proprietária |
| T10 | Abrir arquivo liberado como cliente | Conteúdo correto e autorização verificada |
| T11 | Abrir as sete abas e cada CTA disponível nelas | Destino útil, contexto preservado, conteúdo verdadeiro |
| T12 | Acessar outro caso/arquivo sem permissão | Recusa; nenhuma informação da outra família |
| T13 | Navegar em 375 px e desktop até o rodapé | Sem corte, sobreposição ou controles inacessíveis |
| T14 | Comparar os blocos alterados com a prancha aprovada | Sem remoção/redução silenciosa de composição ou conteúdo |
| T15 | Falhar rede/servidor em ação crítica de teste | Sem falso sucesso e sem perda silenciosa de edição |
| T16 | Sair e entrar novamente | Dados continuam corretos e estado de sessão coerente |

### Conferência de links

O inventário CSV identifica arquivo, linha, expressão e resultado estático. Endereço registrado não significa tela funcional; expressão dinâmica não significa link quebrado.

- Testar os destinos de CTA e links profundos no contexto correto, incluindo `casoId`, parâmetros e âncoras.
- Para arquivo privado, confirmar acesso pela função autorizada, não apenas resposta HTTP.
- Não clicar em cobrança, envio de WhatsApp, assinatura ou publicação externa para “testar link” sem autorização.
- O endereço `/pessoas`, consultado como verificação adicional, retornou 404; a rota canônica de detalhe é `/pessoas/$clienteId` e a carteira é `/clientes`. Isso não prova um link quebrado do menu.
- Os PDFs não contêm anotações de hyperlink clicável; rotas e botões aparecem como texto/imagem. Foram confrontados com código e destinos, sem fingir que clicar numa captura executa a ação.

### GO para a primeira cliente

Liberar apenas quando acesso independente, conteúdo rico verdadeiro, contrato correto, ações operacionais críticas e isolamento passarem. A proprietária aprova a candidata; cobrar/enviar contrato/convidar continuam ações específicas, não autorizadas por um selo do checklist.

### NO-GO

Bloqueio real sem tratamento, contrato errado, arquivo inexistente apresentado como entrega, acesso cruzado, cobrança divergente, perda de dado ou interface vazia apresentada como experiência entregue impedem o lançamento. Pequenas pendências visuais só podem ser aceitas explicitamente e não cancelam a promessa contratada.

## Comando de execução para o responsável técnico

O bloco abaixo pode ser entregue ao executor com este documento e o caderno técnico. Ele delimita a primeira implementação sem iniciar outra investigação geral.

```text
Trabalhe em tatianatosi/soul-ancestry sobre main atual, reconciliando a base
auditada d537e452 com qualquer avanço posterior. Leia AGENTS.md.

Execute primeiro EXEC-01 deste plano. Não redesenhe App/Desk, não crie novo
shell, não duplique resolverBloqueioPiloto e não altere RLS, triggers ou
migrations para contornar pendências.

Reaproveite a PR #190 se ainda for necessária. Verifique seu diff e CI atual.
Teste: retorno negativo, exceção, justificativa inválida, papel sem permissão,
registro fora da organização, leitura após gravação, F5 e repetição.
O botão precisa permitir a decisão legítima; não feche bloqueios reais
automaticamente e não marque todos como não aplicáveis.

Entregue o diff mínimo e as provas. Não produza novo plano geral.
Após essa entrega, avance para EXEC-02 e EXEC-03 na ordem do documento.
Qualquer conteúdo que já exista deve ser localizado e reaproveitado.

Para cada requisito, devolva:
ID / fonte-página / arquivo-função / PR-SHA / revisão publicada /
registro usado / ação executada / resultado / limite / aceite pendente.

Não declare resolvido por existir componente, teste textual, SQL proposto
ou merge. Se faltar acesso, arquivo ou decisão, registre o impedimento
exato e continue o trabalho independente que for possível.

Merge, deploy, escrita de produção, publicação editorial, convite,
assinatura e cobrança exigem autorização da proprietária no escopo
específico. Não remova funcionalidade aprovada para encerrar o pacote.
```

### Verificação técnica mínima de cada pacote

Usar as dependências e o lockfile do checkout, sem atualizar pacotes por conveniência. Os comandos abaixo são roteiro para o executor; não foram executados nesta rodada.

```sh
# No checkout do soul-ancestry com dependências já instaladas:
git status --short
git rev-parse HEAD
npx --no-install tsc --noEmit
npm run test -- --exclude '.claude/**'
npm run build
```

Testes específicos já existentes para reaproveitar incluem `app-p0-checklist-documental-2026-10-24`, `leitura-contrato-sem-popup-2026-10-24`, `ativacao-portao-piloto-2026-10-24`, `g2-caso360-cards-vida-2026-10-23`, `portal-resiliencia-rede` e `navegacao-desk`. As provas devem incluir teste de comportamento; testes que apenas procuram strings em arquivos não bastam para encerrar o requisito.

## Como ler as versões sem perder pontos importantes

Todos os onze anexos foram mantidos no inventário. A comparação de bytes confirmou igualdade dentro de dois grupos específicos de cópias recebidas, mas os seis documentos distintos e o CSV têm finalidades e conteúdos diferentes; não foram fundidos num único parecer.

- **MOCK17:** referência aprovada de experiência e apresentação.
- **PRANCHA:** composição desktop/mobile e onze superfícies do Desk.
- **GOL06:** 59 páginas do estudo GoLive, incluindo 19 rotas, sete abas internas e lotes do caso.
- **COMP21:** 15 páginas de comparação, defeitos e ausências na data de 21/10.
- **FALT21:** nove páginas de uma versão separada que montou elementos; não prova publicação.
- **AUD23:** 110 páginas da prévia autenticada administrativa, incluindo capturas até o rodapé; não prova login independente.
- **CSV23:** 53 achados preservados individualmente com encaminhamento no caderno técnico. São 15 “Dados insuficientes”, 19 “Parcial”, cinco “Não executado”, quatro “Sobreposição”, quatro “Bloqueado”, três “Divergência intencional”, dois “Fora do escopo” e um “Falta”; portanto, a afirmação de outra sessão de que mais de 70% seriam apenas falta de dados não se sustenta neste CSV.

Uma pendência antiga não é encerrada porque desapareceu do relatório novo. Ela só muda de estado com código correspondente, dado real e prova; uma diferença intencional alegada por um auditor não equivale a autorização da proprietária.

## Entrega e limites finais

O caderno técnico registra cada página distinta, cada achado do CSV, o inventário de rotas, os destinos analisados e os resultados públicos do Lovable. Os CSVs de rotas e links permitem localizar a implementação sem obrigar a proprietária a reler as auditorias.

Este plano está preparado para `docs/prompts/2026-10-24-plano-executavel-app-desk-lovable.md`, e o caderno para `docs/auditorias/2026-10-24-caderno-reconciliacao-paginas-rotas.md`. Não foram enviados ao GitHub; a aprovação das pranchas não foi transformada em aprovação automática deste novo plano.

O limite que ainda impede homologação integral é o acesso autenticado atual. A revisão de código, das páginas anexadas e da publicação pública foi realizada; gravação real, visão privada da proprietária e experiência independente da Ana continuam explicitamente pendentes.
