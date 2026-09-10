# Clube Ancestral — Adendo ao Resgate Mestre
## PRs interrompidas, desviadas ou reordenadas pela Urgência de Autoridade

**Versão:** 1.0
**Data:** 02 de setembro de 2026
**Documento-pai:** `CA-ARTEFATO-MESTRE-RESGATE-PROMPTS-DECISOES-FILA-2026-09-02.md`
**Natureza:** adendo de reconciliação de fila P0; não autoriza merge, migration, alteração de dados ou ação externa.

---

## 1. Objetivo

Este adendo registra quais frentes e PRs foram interrompidas, deslocadas, reabertas, condicionadas ou deixadas em espera pela urgência de **autoridade operacional da proprietária** e pela auditoria de autoridade administrativa do Desk/App Cliente.

A urgência não significa que todas as PRs abaixo sejam defeituosas. Significa que a capacidade de a proprietária operar, revisar, salvar, navegar e decidir precedeu a expansão de novas frentes, automações, unificações de dados e melhorias de layout.

### Definição operacional

Uma PR entra neste adendo se atende pelo menos a um dos critérios:

- Foi criada como resposta direta a bloqueio de autonomia, acesso, decisão ou persistência da proprietária.
- Foi interrompida ou reordenada porque ainda não existia autoridade/visibilidade comprovada para operar a tela correspondente.
- Ficou dependente da auditoria de autoridade, da decisão de fonte canônica ou de teste de persistência.
- Passou a ser tratada como prioridade inferior após a descoberta de bloqueios P0 de autoridade.

---

## 2. Contexto factual resgatado

A rodada de autoridade identificou que a questão não era somente "ter tela" ou "ter função": havia funções sem superfície acessível, sistemas duplicados e ações que pareciam concluídas sem prova suficiente de persistência.

Os achados que explicam a reordenação foram:

- A proprietária precisava recuperar capacidade de operar o próprio ambiente sem bloqueios desnecessários.
- O mapeamento de autoridade cobriu Desk e App Cliente em 10/10 áreas, mas o fechamento do mapa não equivale à correção de todos os itens encontrados.
- Há funções de CRM de bastidor sem rota/tela do Desk; isto inclui criação de contato, oportunidade, discovery e aceite verbal.
- Biblioteca de Mensagens possui edição de texto preparada, mas não havia superfície ativa confirmada que a chamasse.
- "Usuários e papéis" aparece em dois lugares (`/configuracoes` e `/equipe`) sem reconciliação funcional confirmada.
- Quatro telas do App Cliente foram identificadas como conteúdo fixo, não dado vivo do banco.
- A confirmação de gravação precisa incluir salvar, recarregar/F5 e reler o dado persistido; mensagem visual isolada não é prova suficiente.

---

## 3. Linha de interrupção e reordenação

| Momento | Evento de autoridade | Consequência na fila |
|---|---|---|
| 28/08 | Urgência de autonomia da proprietária se torna P0. | Revisões amplas e novas funcionalidades perdem prioridade diante de acesso, navegação e ação operacional. |
| 29/08 | Hotfix de autonomia e reversões de barreiras operacionais. | PRs de correção/rollback passam à frente de planos de arquitetura e integrações. |
| 30/08 | Correção da causa-raiz de edição de pessoa no núcleo e criação de PRs de persistência/reconciliação. | Pessoa, Fontes/Checklist e Contrato entram em trilha de teste antes de novas frentes. |
| 31/08 | Auditoria de autoridade administrativa ganha prioridade e é fechada como mapa de 10/10 áreas. | PRs de política, unificação e detecção ficam em espera ou sem urgência enquanto a operação é esclarecida. |
| 01/09 | Teste real de Comercial/Financeiro e Contrato com Ana; surgem falhas de persistência e lacunas de fonte única. | Motor Contratual e Pessoa Canônica tornam-se bloqueios de decisão; implementação estrutural não deve avançar sem decisão. |
| 02/09 | Entram PRs de correção, arquivamento, varredura de WhatsApp e artefatos. | Retomar somente em fila única, com separação entre correção P0, decisão arquitetural e documentação. |

---

## 4. PRs diretamente ligadas à urgência

| PR | Título / foco | Relação com autoridade | Estado atual conhecido | Tratamento no resgate mestre |
|---|---|---|---|---|
| #25 | Hotfix: restaura autonomia operacional da proprietária | Resposta direta à perda de autonomia operacional. | Fechada. | Manter como precedente: autonomia da proprietária é requisito de aceite. |
| #24 | Revert de redução de fricção operacional | Reversão de alteração que exigiu correção para preservar operação real. | Fechada. | Histórico de reversão; não reabrir sem causa técnica nova. |
| #26 | Remove telas redundantes de gate/auditoria | Reorganização para reduzir barreiras e ruído no trabalho operacional. | Fechada. | Histórico; validar que itens removidos não perderam função necessária. |
| #27 | Corrige causa-raiz de "dados da Ana não salvam" | Autoridade prática de edição: antes não havia fluxo efetivo de pessoa no núcleo. | Fechada. | Base do teste de Pessoa; não considerar a frente completamente encerrada sem teste das PRs #32/#35. |
| #28 | Tela de Contrato: ações principais e dados técnicos recolhidos | Redução de fricção para operar contrato; depois exigiu reconciliação com outras mudanças. | Fechada. | Serve de antecedente da #35 e #40. |
| #29 | Caso-piloto: NO_GO/gates viram dados técnicos | Retira bloqueios visuais do caminho de trabalho, sem remover controles de governança. | Fechada. | Preservar distinção: ocultar ruído não é apagar regra. |
| #31 | P0: escrita declarava sucesso sem confirmar linha afetada | Autoridade de salvar só existe se a persistência for comprovada. | Aberta em draft. | P0 de teste: próxima ação em Fonte/Checklist → salvar → F5 → releitura. |
| #32 | Pessoa: salvar com releitura + decisão de tarefa | Recupera capacidade de editar pessoa e comprovar resultado; inclui retorno de tarefa. | Aberta em draft. | P0/P3; exige teste real. |
| #33 | Piloto Real: pendências vivas | Substitui lista fixa por pendências operáveis, com contexto real. | Fechada. | Manter como padrão de exibição operacional. |
| #34 | Mapa de autoridade admin — 10/10 áreas | Auditoria central de autoridade do Desk e App Cliente. | Fechada. | O mapa está fechado; correções derivadas ficam em fila própria. |
| #35 | Reconciliação `contratos.$id.tsx` — #28 × #32 | Evita que correção de UX/autoridade seja perdida ou conflite na tela de contrato. | Aberta em draft. | P0 de reconciliação; requer teste no preview. |
| #39 | P0: persistência em Comercial/Financeiro | Prova que proposta/fatura persistem após salvar e F5. | Fechada em 01/09. | Tratada como evidência de fluxo confirmado; não reabrir sem regressão. |
| #40 | Contrato: remoção de botões redundantes | Nasceu na simplificação de operação, mas o teste revelou falha real de sincronização de objeto/escopo/partes. | Aberta em draft. | Permanece priorizada, condicionada à decisão do Motor Contratual. |
| #44 | Corrige bugs de persistência e aposenta campo de proposta no Caso 360 | Consolida os crashes encontrados no teste e remove uma falsa superfície de integração. | Aberta em draft. | P0 de correção; revisar escopo e testar antes de merge. |
| #45 | Atualiza Mapa de Autoridade Admin com achados de 01/09 | Mantém a auditoria de autoridade atualizada após os achados. | Aberta em draft. | Documental; revisar consistência antes de merge. |
| #47 | Corrige leads arquivados ainda exibidos na lista | Autoridade de operação inclui confiar na lista de trabalho e não atuar sobre lead arquivado por erro de filtro. | Aberta em draft. | P1 após validações P0 de persistência/contrato. |

---

## 5. PRs interrompidas ou colocadas em espera

Estas PRs não foram necessariamente abandonadas. Foram explicitamente deslocadas porque a urgência de autoridade, persistência e fonte canônica deveria ser resolvida primeiro.

| PR | Frente | Motivo da interrupção / espera | Condição objetiva para retomar |
|---|---|---|---|
| #30 | Detecção de núcleos duplicados | Tela somente de leitura, sem urgência e dependente da política unificada; não havia duplicidade real encontrada. | Aprovar política unificada e definir Pessoa Canônica antes de qualquer fusão. |
| #36 | Política Unificada de Casos — Fase 1 | Migration aditiva de aliases ainda não aplicada; decisão de "mapear sem modificar" era necessária. | Decisão explícita da proprietária sobre o princípio; revisão de migration antes de aplicação. |
| #41 | Revisão Motor Contratual/Pessoa Canônica | Documento de diagnóstico, sem decisão final para virar implementação. | Decidir tabela/entidade de pessoa, dependentes, vínculo de proposta e modo de ressincronização. |
| #42 | Fix de classificação de Giovanna | Correção técnica/documental não é bloqueio de autoridade de operação diária. | Revisar como PR isolada e mesclar apenas se a classificação e os testes forem aprovados. |
| #43 | Arquivamento de decisões canônicas | Documentação não elimina o bloqueio de autoridade nem implementa os motores. | Revisão documental; pode seguir independentemente, sem competir com P0. |
| #46 | Ficha Giovanna + estudo de Pessoa Canônica | Amplia material de desenho, mas não resolve fonte única dos seis cadastros. | Decisão D-01 de Pessoa Canônica e escopo de migração piloto. |
| #48 | Varredura WhatsApp para rascunho do lead | Ponte útil, mas não deve avançar acima de persistência, segurança e fonte canônica; sinal extraído requer revisão humana. | Garantir que a varredura crie rascunho/sugestão, preserve origem e não marque dado como confirmado. |
| #49 | Arquivamento de Skills de Inteligência | É documental e não resolve bloqueios P0 de autoridade/persistência. | Pode ser revisada/mesclada como registro, sem alterar operação. |

---

## 6. Itens não representados por uma PR única

A urgência de autoridade revelou lacunas que não podem ser "fechadas" apenas por merge de documentação ou ajuste visual.

| Lacuna | Evidência resgatada | Resposta correta |
|---|---|---|
| CRM de bastidor sem carroceria | Funções de contato, oportunidade, discovery e aceite verbal existem, mas nenhuma rota do Desk as chamava. | Criar inventário de rotas/handlers e escolher uma fatia de UI conectada a dados reais; não criar segundo CRM. |
| Biblioteca de Mensagens sem chamada de tela confirmada | Edição de texto existe, mas não estava ligada a uma superfície operacional confirmada. | Decidir rota/ciclo editorial e validar persistência antes de expansão de templates. |
| Usuários e papéis em duplicidade | `/configuracoes` e `/equipe` possuem sistemas paralelos. | Mapear entidades e fonte de verdade; não fundir ou apagar antes de inspeção de permissões/RLS. |
| Telas de App Cliente com texto fixo | Legado, Entregas, Fase 01 e Fase 02 não buscavam dado real. | Definir contrato de dados e sanitização; não expor dados internos para preencher telas. |
| Pessoa fragmentada | `clientes`, `leads`, `contacts`, `nucleo_membros`, `contract_parties` e `genealogical_person_profiles` concorrem como representação de pessoa. | Decidir Pessoa Canônica antes de integração ou migração estrutural. |
| Motor Contratual desconectado | Proposta/Parâmetros/Contrato não estavam conectados de forma completa; campos livres de proposta não alimentavam o motor. | Vincular proposta por ID, versão e design Canva; ressincronizar por botão explícito, com prévia e auditoria. |

---

## 7. Atualização da prioridade P0

A prioridade correta não é recomeçar todos os prompts interrompidos. É estabilizar a autoridade prática da proprietária e só então retomar as frentes que dependem dela.

### P0-A — Autoridade de operação e persistência

1. Revisar PR #44, delimitando exatamente quais bugs corrige e quais campos livres desativa.
2. Testar PR #31 com o protocolo salvar → F5 → abrir novamente → confirmar valor vindo do banco.
3. Testar PR #32 com alteração real de pessoa e criação de tarefa, verificando persistência e retorno visual.
4. Testar PR #35 no contrato, para garantir que #28 e #32 coexistem sem perda de comportamento.
5. Testar PR #40 no caso Ana, registrando o comportamento de objeto, escopo e partes.

### P0-B — Decisões que liberam a retomada

1. **Pessoa Canônica:** tabela nova `pessoas_canonicas` ou expansão de `clientes`.
2. **Dependentes:** relação por referência a outras pessoas ou texto simples.
3. **Motor Contratual:** ressincronização automática ou por botão explícito.
4. **Campo livre de proposta:** aposentar ou manter com rótulo inequívoco de que não alimenta contrato.
5. **Política Unificada:** aprovar ou rejeitar "mapear sem modificar" antes de aplicar migration de aliases.

### P1 — Retomar depois da estabilização

- PR #36 e PR #30: política unificada e detecção de núcleos.
- PR #47: lista de leads arquivados.
- PR #48: rascunho de lead a partir de varredura WhatsApp.
- PRs #41, #42, #43, #45, #46 e #49: documentação, classificação e arquivamento.

---

## 8. Protocolo de reativação de PR interrompida

Nenhuma PR listada como interrompida/em espera deve ser retomada apenas porque está verde ou porque o código existe.

Para reativar uma PR:

1. Confirmar que a decisão P0 da qual ela depende já foi tomada e registrada.
2. Confirmar a fonte de verdade das entidades tocadas.
3. Listar rota, handler, tabela, política de acesso e efeito esperado.
4. Definir teste de aceite com releitura quando houver escrita.
5. Verificar que não há migração, RLS, integração externa ou ato irreversível embutido sem autorização específica.
6. Criar/atualizar artefato de evidência antes de solicitar merge.
7. Solicitar autorização explícita da proprietária para mesclar.

---

## 9. Registro de decisão de fila

**Decisão de continuidade adotada por este adendo:**

- PRs de documentação, mapa e arquivamento podem continuar como registro, mas não substituem correções P0.
- PRs de unificação, dados canônicos, automações e novas superfícies ficam condicionadas às decisões de Pessoa Canônica e Motor Contratual.
- PRs que afetam a capacidade de salvar, consultar e operar o próprio sistema têm precedência sobre novos motores.
- A auditoria de autoridade é considerada **fechada como mapeamento**, não como implementação integral de todos os achados.

---

## 10. Próxima atualização permitida

Atualizar este adendo somente quando ocorrer um dos eventos abaixo:

- Uma PR P0 for testada com evidência de persistência/releitura.
- Uma decisão de Pessoa Canônica, dependentes, ressincronização ou campo de proposta for tomada pela proprietária.
- Uma PR for mesclada com autorização explícita.
- Uma migration for revisada e autorizada/aplicada de forma verificável.
- Um achado de autoridade alterar o escopo ou a ordem de prioridade.

Sem um desses eventos, este documento permanece como a fila oficial de retomada das frentes deslocadas pela urgência de autoridade.

---

## 11. Reconciliação com o que já aconteceu nesta sessão (adicionada no arquivamento, 02/09/2026)

Este adendo foi recebido junto com o Artefato Mestre e com um terceiro arquivo que é **duplicata confirmada** (via `diff`) do artefato de Skills já arquivado na PR #49 (`docs/prompts/ARTEFATO-RESGATE-SKILLS-INTELIGENCIA-VARREDURA-DOSSIE-2026-09-02.md`). O terceiro arquivo não gerou novo documento — não há conteúdo adicional a preservar além do que a PR #49 já registra.

Confronto do estado descrito aqui contra o estado real do repositório e das PRs no momento do arquivamento (verificado via `list_pull_requests`):

- **Nenhuma PR foi mesclada** desde a criação deste adendo. #30–#32, #35, #36, #40–#49 seguem abertas em draft, exatamente como listado nas seções 4 e 5. Isso confirma que a regra "somente com autorização explícita da proprietária" (seção 9) continua sendo respeitada — não houve merge autônomo em nenhuma frente.
- **P0-B item 1 (Pessoa Canônica) já foi decidido nesta sessão**, fora da lista de opções apresentada aqui ("tabela nova `pessoas_canonicas` ou expansão de `clientes`"): a proprietária decidiu explicitamente pela extensão de `clientes`, aplicada como migration aditiva/nullable em produção e documentada na PR #51 (`docs/arquitetura/PESSOA-360-DE-PARA-LEAD-ATE-CLIENTE-2026-09-02.md`). Este item do P0-B está portanto **resolvido**, não mais pendente.
- **P0-B item 5 (Política Unificada)** também avançou: a verificação "mapear sem modificar" foi reconfirmada por consulta direta ao banco na PR #51 (Fase 1/Fase 2 já refletidas nos dados reais, caso Ana Luiza com 3 aliases). A Fase 3 (`case_participants`, motor de fusão) **não foi criada** — os dois pré-requisitos que a bloqueiam continuam de pé, então a decisão de "aprovar ou rejeitar" antes de aplicar essa migration especificamente ainda está aberta.
- **PR #47 e #48**, listadas aqui como P1 (retomar depois da estabilização), permanecem no estado que este adendo já previa: código implementado e testes automatizados passando, mas **sem o teste manual salvar → F5 → releitura no preview** que o protocolo da seção 8 exige antes de merge. Nenhuma delas foi mesclada fora de ordem.
- **PR #50** (Decisões Canônicas de Catálogo/Planejador) é nova desde este adendo — não altera a fila P0-A/P0-B, é documental/de correção de premissa (Planilha Mestre → catálogo homologado), mesmo perfil de baixo risco das PRs #43/#45/#49 já tratadas na seção 5.
- **P0-A (protocolo salvar → F5 → releitura nas PRs #31, #32, #35, #40, #44) continua sem evidência registrada nesta sessão.** Esse teste exige clique manual da proprietária no preview e não foi feito por mim nesta sessão — permanece como a pendência mais crítica da fila, à frente de qualquer nova frente de decisão ou documentação.
- Nenhuma migration, RLS, chave de serviço ou dado real foi tocado por este arquivamento — este documento é puramente de registro, como a seção 9 exige para PRs de documentação.

### Verificação pontual sobre persistência de "informações da contratante" (02/09/2026)

A proprietária pediu para verificar se as informações da contratante no perfil institucional persistem, apontando que vêm do motor contratual — e citou que existe um prompt com todos os motores, inclusive o de contrato. Esse prompt é `docs/politicas/PROMPT-MESTRE-MOTORES-A-IMPLANTAR.md`, cuja seção P2 (Motor Contratual) já registra a regra: *"Perfil institucional da contratada deve ser reutilizado automaticamente; não duplicar dados societários em cada caso."*

Verificação feita no código real (não em documentação), separando os dois blocos que o termo "perfil institucional" mistura:

1. **Dados da CONTRATADA (Clube Ancestral)** — razão social, CNPJ, endereço institucional etc. — vêm de `PERFIL_INSTITUCIONAL`, uma constante fixa em `src/lib/contrato-base-consolidado.ts`. Existe uma camada de persistência versionada (`institutional_profiles`, `src/lib/perfil-institucional-persistido.{ts,functions,server}.ts`) que grava snapshots dessa constante por organização/versão — mas nenhuma rota ou tela chama `registrarPerfilInstitucional` com valores editados: hoje, mudar esse dado exige alterar a constante no código e implantar, não uma edição no Desk. Isso está correto por desenho — é o achado 2 do `docs/arquitetura/MOTOR-CONTRATUAL-INVENTARIO-E-DE-PARA-2026-08-31.md` ("já correto — não mexer"), porque são dados societários fixos que raramente mudam.
2. **Dados da CONTRATANTE (a parte cliente do instrumento)** — nome, documento, endereço — vêm da matriz de Parâmetros do contrato (`contract_case_parameters`/`contract_parameter_values`, campos `contratante_nome`/`contratante_documento`/`contratante_endereco`) e são copiados **uma única vez** para `contract_parties` (papel `contracting_client`) no momento de "enviar para assinatura" (`enviarParaAssinatura`, em `src/lib/contrato-parametros.functions.ts`). **Edições feitas depois na matriz de Parâmetros não chegam sozinhas ao instrumento** — isso é uma lacuna real, não uma suspeita.

A correção dessa lacuna específica já está escrita: é exatamente a **PR #35** (`Reconciliação contratos.$id.tsx — PR #28 × PR #32`, aberta em draft, ainda não mesclada). Ela adiciona `ressincronizarContratanteDaMatriz` (`src/lib/contratos.functions.ts`), um botão "Ressincronizar contratante da matriz" na aba Partes do contrato, e edição inline dos campos da parte — usando o padrão seguro de gravação (`gravarComVerificacao`/`inserirComVerificacao`, com confirmação de linha afetada e releitura). O próprio texto que a PR adiciona na tela já avisa a proprietária exatamente sobre essa lacuna: *"a cópia automática só acontece uma vez, na criação do instrumento; edições feitas depois na matriz de parâmetros não chegam aqui sozinhas."*

**Conclusão verificada:** a suspeita da proprietária está correta hoje, em `main` — a informação da contratante editada depois da criação do contrato não persiste automaticamente na parte do instrumento. O código que resolve isso já existe, mas está na PR #35, que segue sem merge e sem o teste manual salvar → F5 → reabrir → confirmar exigido pelo protocolo. Isso não é um item novo: é exatamente o **P0-A item 4** já registrado na seção 7 deste adendo ("Testar PR #35 no contrato, para garantir que #28 e #32 coexistem sem perda de comportamento") — permanece a pendência crítica para fechar este ponto, não uma nova frente de trabalho.

---

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Y6kSyG3iFYKD8RxoB8Z3bv
