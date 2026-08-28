# Clube Ancestral — Prompts 0 a P1

Versão consolidada — 23/08/2026

> **Fonte canônica de código:** `tatianatosi/soul-ancestry`.
>
> Estes prompts consideram as entregas já registradas no repositório e evitam repetir CA-OPS-02, CA-OPS-03, CA-PORTAL-01 a 04, CA-04, CA-06, Dicionário Calls→CRM, Radar canônico e reorganização dos oito grupos do Desk.

---

# Prompt 0 — Inventário e evidência de publicação

```text
DESTINO: Lovable — projeto Clube Ancestral
https://soul-ancestry.lovable.app

ID: CA-BASE-00-INVENTARIO-EVIDENCIA-PUBLICACAO

MODO: EXECUTE EM LEITURA. NÃO ALTERAR CÓDIGO, DADOS, BANCO, RLS,
MIGRATION, AUTENTICAÇÃO, INTEGRAÇÕES OU DEPLOY.

OBJETIVO
Produzir uma fotografia única, verificável e atual do que existe no
repositório canônico `tatianatosi/soul-ancestry`, distinguindo:

A. implementado no código;
B. testado localmente/CI;
C. publicado no ambiente de preview;
D. publicado no domínio de produção;
E. homologado com sessão e dado real;
F. bloqueado por segurança, fonte, RLS, decisão humana ou ausência de
   conta de teste.

NÃO REFAZER IMPLEMENTAÇÕES.
NÃO DECLARAR “NO AR” APENAS POR EXISTIR COMMIT, BUILD OU ROTA.
NÃO DECLARAR RLS HOMOLOGADA SEM TESTE DE ACESSO CRUZADO.

FONTES OBRIGATÓRIAS
- Branch `main` do repositório Soul Ancestry;
- histórico recente de commits;
- árvore de rotas;
- documentação sob `docs/`;
- testes existentes;
- configuração de deploy disponível no projeto, somente em leitura;
- ambiente preview/produção apenas se houver acesso autorizado.

INVENTARIAR AO MENOS
1. CA-OPS-02 — catálogo operacional, alertas derivados, Painel Hoje e
   painel contextual;
2. CA-OPS-03 — consolidação de catálogos de templates;
3. CA-PORTAL-01 — estrutura, rotas e navegação do App Cliente;
4. CA-PORTAL-02 — dados vivos, cadência e isolamento;
5. CA-PORTAL-03 — marca, copy e acessibilidade;
6. CA-PORTAL-04 — sanitização de linguagem para dados vivos;
7. CA-04 — CRM Mestre;
8. Dicionário Calls → CRM;
9. CA-06 — Catálogo Operacional 30;
10. CA-UX-04 — navegação Desk, Marketing e Administração;
11. CA-GOV-01 — Governança viva/referências, se houver artefatos;
12. Radar canônico.

CRITÉRIOS
- Código: confirmar arquivos, exportações, rotas e testes.
- Testado: registrar comando e resultado apenas se existir evidência.
- Preview/produção: registrar URL, commit/release associado e data.
- Homologado: exigir evidência de fluxo real autenticado quando aplicável.
- Bloqueado: declarar bloqueio sem tentar contornar sessão, RLS ou
  permissões.

ARTEFATOS OBRIGATÓRIOS
Criar:
- `docs/status/CA-BASE-00_Matriz_Implementado_Publicado_Homologado.csv`;
- `docs/status/CA-BASE-00_Inventario_Artefatos_e_Evidencias.md`;
- `docs/changelog/2026-08-23_CA-BASE-00.md`.

COLUNAS MÍNIMAS DA MATRIZ
id_entrega;
area;
artefato;
arquivo_ou_rota;
commit_ou_sha;
implementado_codigo;
teste_evidenciado;
preview_confirmado;
producao_confirmada;
homologado_com_dado_real;
fonte_de_evidencia;
restricao;
risco;
proxima_acao;
responsavel_decisao.

ENTREGA FINAL
- total de itens inventariados;
- o que está apenas no código;
- o que está confirmado em preview;
- o que está confirmado em produção;
- o que foi homologado com usuário/dado real;
- bloqueios e lacunas reais;
- sem recomendações genéricas.

DECLARAÇÃO OBRIGATÓRIA
“Nenhuma ação externa, alteração de dados, migration, mudança de RLS ou
deploy foi executado.”
```

---

# Prompt 1 — Governança: indicadores vivos e referências explícitas

```text
DESTINO: Lovable — projeto Clube Ancestral
https://soul-ancestry.lovable.app

ID: CA-GOV-01-FASE-A-INDICADORES-E-REFERENCIAS

MODO: EXECUTE.

NÃO FAÇA AUDITORIA GENÉRICA.
NÃO REABRA CA-OPS-02, CA-OPS-03, CA-PORTAL-01 A 04, CA-04 OU CA-06.
NÃO ALTERE BIBLIOTECA DE MENSAGENS, MÓDULOS CONTEXTUAIS, PORTAL DO
CLIENTE, NAVEGAÇÃO PRINCIPAL, INTEGRAÇÕES OU DEPLOY.

NESTA FASE É PROIBIDO:
- criar tabela;
- executar migration;
- criar ou alterar RLS;
- inserir seed/backfill;
- criar mutação persistente;
- alterar dado existente.

CONTEXTO CONFIRMADO
O pente-fino de Governança identificou duas prioridades:

1. `/governanca/indicadores` apresenta definições/números hardcoded e
   não pode aparentar medição operacional atual quando não existir fonte
   canônica real.
2. `/governanca/decisoes` é histórico estático e precisa de proposta
   controlada para evoluir a registro append-only; essa persistência não
   será implementada nesta fase.

Também precisam de classificação explícita:
- `/governanca/criterios-aceite`;
- `/governanca/matriz-conformidade`;
- `/governanca/corte-vertical`;
- `/governanca/inventario-recuperacao`;
- `/governanca/inventario-patrimonial`;
- `/governanca/identificadores`;
- `/governanca/varredura-completude`.

NÃO TRATAR COMO FALHA
- `/biblioteca-mensagens`: fonte canônica operacional de templates;
- `/governanca/modulos-contextuais`: catálogo técnico de
  `desk-modulos.ts`;
- `/governanca/contrato-base`: documento jurídico de referência;
- `/governanca/modelos-contratuais`: matriz comparativa de referência,
  salvo evidência contrária.

OBJETIVO 1 — INDICADORES
Para cada indicador em `/governanca/indicadores`:

1. Localizar fonte canônica existente em `/metricas`, `/conversao`,
   `/financeiro`, `onboarding-jornada` ou Governança.
2. Quando houver fonte e cálculo real reutilizável:
   - conectar à consulta existente;
   - não duplicar fórmula;
   - mostrar valor, período e atualização quando disponíveis;
   - usar estado vazio seguro quando não houver dados.
3. Quando não houver fonte real:
   - remover número que pareça medição atual;
   - apresentar literalmente:
     “Definição do indicador — medição ainda não implementada.”
   - manter apenas finalidade, fórmula conceitual e fonte planejada;
   - não inventar meta, tendência, zero ou percentual.
4. Separar visualmente “Indicadores com medição disponível” de
   “Definições de indicadores”.

OBJETIVO 2 — LOG DE DECISÕES: SOMENTE PROPOSTA
Para `/governanca/decisoes`:

1. Extrair os campos do histórico estático.
2. Preparar proposta completa de persistência append-only:
   - schema sugerido para `governanca_decisoes`;
   - SQL de tabela, índices e constraints;
   - policies RLS;
   - matriz de papéis;
   - regra de não exclusão física;
   - arquivamento com data, autor e motivo;
   - backfill idempotente;
   - rollback;
   - testes de autorização e retenção.
3. NÃO executar SQL, migration, RLS, backfill ou seed.
4. Na interface atual, mostrar banner temporário:
   “Histórico de referência em transição para registro operacional.
   Novas decisões aguardam ativação controlada.”
5. Não criar formulário que pareça funcional sem persistência aprovada.

OBJETIVO 3 — REFERÊNCIAS EXPLÍCITAS
Classificar cada rota listada como:
A. conectada a fonte viva/persistida; ou
B. documento de referência.

Quando B:
- exibir banner:
  “Documento de referência — atualizado manualmente por [papel].
   Última revisão: [data]. Não representa dado operacional em tempo real.”
- exibir versão/responsável/data quando existirem;
- se inexistentes, declarar ausência sem inventar metadado;
- ajustar título/copy para não sugerir dado vivo.

REGRA ESPECIAL
Se `/governanca/varredura-completude` não executa nem persiste uma
varredura real, renomear para:
“Checklist de completude de referência”.

TESTES
1. Nenhum número hardcoded é mostrado como medição atual.
2. Cada indicador tem fonte canônica ou estado explícito de medição não
   implementada.
3. Não há duplicação de fórmula.
4. As sete rotas foram classificadas como viva ou referência.
5. Referências mostram banner e ausência explícita de metadado, quando
   aplicável.
6. A varredura não sugere execução se for apenas referência.
7. Log de decisões não aparenta persistência antes da aprovação.
8. Nenhuma migration, RLS, seed ou mutation foi criada.
9. Typecheck, testes e build passam.

DOCUMENTAÇÃO
Criar:
- `docs/governanca/CA-GOV-01_Fase_A_Indicadores_e_Referencias.md`;
- `docs/governanca/CA-GOV-01_Matriz_Classificacao_Telas.csv`;
- `docs/governanca/CA-GOV-01_Proposta_Log_Decisoes.md`;
- `docs/changelog/2026-08-23_CA-GOV-01.md`.

ENTREGA FINAL
- indicadores conectados, fonte e cálculo reutilizado;
- indicadores que ficaram apenas como definição;
- classificação de cada rota;
- títulos/banners alterados;
- SQL, RLS, backfill e rollback propostos para aprovação humana;
- typecheck, testes e build;
- declaração literal:
  “Nenhuma ação externa, alteração de dados, migration, mudança de RLS
  ou deploy foi executado.”
```

---

# Prompt P1 — Biblioteca de Mensagens ↔ Onboarding-Jornada

```text
DESTINO: Lovable — projeto Clube Ancestral
https://soul-ancestry.lovable.app

ID: CA-OPS-04-BIBLIOTECA-ONBOARDING-PREVIEW-MANUAL

MODO: EXECUTE.

NÃO REABRA CA-OPS-02.
NÃO CRIE NOVO MOTOR DE CADÊNCIA, NOVO CATÁLOGO OU NOVA FILA.
NÃO TRANSFORME PREVIEW EM ENVIO.
NÃO ALTERE BANCO, MIGRATION, RLS, SESSÃO, PERMISSÕES, INTEGRAÇÕES,
META, WHATSAPP, E-MAIL, WEBHOOK, DADOS OU DEPLOY.

CONTEXTO
- A Biblioteca de Mensagens é a fonte canônica única de modelos.
- `bib-templates-com` é apontador histórico e não pode fornecer corpo
  textual, versão ou regra operacional.
- Onboarding-Jornada já calcula alertas internos por caso.
- O objetivo é criar ponte somente leitura entre alerta e preview do
  modelo vigente, sem duplicar cálculo e sem persistência.

OBJETIVO
Em `PainelOnboardingJornada` e nas superfícies de alertas de `/ops`,
adicionar ação contextual ao lado de alertas elegíveis:

“Ver modelo sugerido”

A ação deve abrir a Biblioteca de Mensagens ou preview interno canônico
já existente, com contexto seguro e mínima informação necessária.

ALERTAS ELEGÍVEIS
Usar exclusivamente os alertas reais já derivados pelo motor atual,
quando disponíveis, tais como:
- caso bloqueado;
- sem próxima ação;
- sem microentrega planejada;
- 10+ dias sem touchpoint;
- 14+ dias sem atualização.

NÃO reimplementar a derivação. Reutilizar o motor, IDs e severidades
existentes.

REGRAS DE RESOLUÇÃO
1. Resolver somente pela Biblioteca de Mensagens.
2. Template elegível deve ser:
   - vigente;
   - não arquivado;
   - não demo;
   - compatível com evento/alerta;
   - compatível com gates existentes.
3. Se não existir template elegível, mostrar:
   “Não há modelo vigente para este alerta.”
4. Nunca criar modelo, versão, rascunho, uso, fila, touchpoint, tarefa,
   alerta, prazo, caso, evento ou log.
5. Nunca enviar, agendar ou acionar canal externo.
6. A única ação permitida é:
   `abrir_preview_e_copiar_manual`.

CONTEXTO E SANITIZAÇÃO
- Passar somente contexto mínimo seguro do caso.
- Não expor UUID, ID interno, SKU, preço, policy, endpoint, nota interna,
  responsável interno, causa confidencial de bloqueio ou dado de outro
  caso.
- Não inferir caso se não houver `case_id` e chave canônica confiáveis.
- Sem chave canônica, não mostrar atalho ambíguo; encaminhar para a
  investigação operacional existente.

INVARIANTES
Quando existirem no objeto resultante, devem permanecer literalmente:
- `envioExecutado: false`;
- `persistido: false`.

TESTES OBRIGATÓRIOS
1. O alerta usa derivação existente, sem cálculo duplicado.
2. O atalho aparece apenas para alerta/caso com chave canônica.
3. A resolução consulta somente a fonte canônica.
4. Template arquivado/demo/não vigente não é elegível.
5. Ausência de template usa estado seguro e não cria nada.
6. Preview recebe apenas contexto sanitizado.
7. Não há handler de envio, mutation, webhook, integração ou persistência.
8. `envioExecutado` e `persistido` permanecem `false`.
9. Alias histórico não fornece texto de template.
10. Guardas e rotas existentes de `/ops` e Biblioteca permanecem.
11. Typecheck, testes e build passam.

DOCUMENTAÇÃO
Criar:
- `docs/operacao/CA-OPS-04_Biblioteca_Onboarding_Preview_Manual.md`;
- `docs/operacao/CA-OPS-04_Matriz_Alertas_Modelos.csv`;
- `docs/changelog/2026-08-23_CA-OPS-04.md`.

A matriz deve incluir:
alerta;
evento_canonico;
severidade;
fonte_derivacao;
fonte_template;
template_elegivel;
gate;
acao_permitida;
contexto_bloqueado;
sem_template;
envio_executado;
persistido;
teste.

ENTREGA FINAL
- alertas conectados ao preview;
- alertas sem modelo e comportamento seguro;
- exportações reais reutilizadas;
- arquivos/linhas alterados;
- provas de ausência de side effect;
- typecheck, testes e build;
- declaração literal:
  “Nenhuma ação externa, alteração de dados, migration, mudança de RLS
  ou deploy foi executado.”
```

---

# Prompt P2 — Painel Hoje por papel: pesquisador

```text
DESTINO: Lovable — projeto Clube Ancestral
https://soul-ancestry.lovable.app

ID: CA-UX-05-PAINEL-HOJE-POR-PAPEL-PESQUISADOR

MODO: EXECUTE.

NÃO REESTRUTURE O PAINEL HOJE.
NÃO REMOVA AS CINCO CATEGORIAS GENÉRICAS EXISTENTES.
NÃO ALTERE RLS, PERMISSÕES, SESSÃO, PAPÉIS, BANCO, MIGRATION,
ATRIBUIÇÕES OU DEPLOY.
NÃO CRIE TAREFA, PRAZO, ALERTA, FILA, TOUCHPOINT OU COMUNICAÇÃO.

OBJETIVO
Adicionar ao Painel Hoje um bloco suplementar, somente para usuário com
papel de pesquisador, mostrando casos realmente atribuídos ao usuário
logado que possuam pesquisa pendente.

O bloco não substitui nem oculta categorias, sinais críticos, exceções,
comercial ou alertas genéricos. Ele apenas acrescenta contexto para o
trabalho do pesquisador.

FONTE ÚNICA
- Reutilizar a mesma fonte e a mesma derivação já usadas em
  `/pesquisa-modulo`.
- Reutilizar atribuição canônica do usuário logado.
- Não duplicar query, cálculo de pendência ou regra de atribuição.
- Não usar seed, fixture, caso-demo, lista fixa ou atribuição inferida.

COMPORTAMENTO
Para pesquisador:
- exibir bloco “Pesquisa pendente para você”;
- listar apenas casos atribuídos ao usuário autenticado;
- mostrar somente dados necessários para identificar e priorizar o caso;
- exibir estado de pesquisa permitido e link direto para o dossiê/módulo
  real do caso;
- não mostrar conteúdo de pesquisa, hipótese, fonte, evidência, nota
  interna ou dado de caso não atribuído.

Para não pesquisador:
- não renderizar o bloco;
- preservar exatamente a experiência atual.

ESTADO VAZIO
Quando o pesquisador não tiver casos pendentes:
“Não há pesquisas pendentes atribuídas a você neste momento.”

SEGURANÇA
- Papel deve vir da sessão/autorização existente, não de parâmetro de URL
  ou flag de client-side.
- Caso deve vir da atribuição existente, não de filtro local inseguro.
- Não tratar ausência de atribuição como “todos os casos”.
- Não ocultar sinal crítico existente por papel.
- Não mudar guardas de rota.

COPY E DESIGN
- Usar design system do Desk e tokens atuais.
- Linguagem interna clara, sem termo técnico de banco/API.
- Skeleton durante carregamento; erro neutro com nova tentativa; estado
  vazio seguro.

TESTES OBRIGATÓRIOS
1. Pesquisador vê somente o bloco adicional e suas atribuições reais.
2. Não pesquisador não vê o bloco.
3. Pesquisador sem pendências vê estado vazio.
4. Caso não atribuído não aparece.
5. Não há fallback para demo, fixture ou lista fixa.
6. As cinco categorias genéricas permanecem.
7. Sinais críticos existentes permanecem visíveis.
8. Links apontam para rota real do dossiê/módulo.
9. Não há mutation, criação de tarefa, alteração de prazo ou envio.
10. Typecheck, testes e build passam.

DOCUMENTAÇÃO
Criar:
- `docs/ux/CA-UX-05_Painel_Hoje_por_Papel_Pesquisador.md`;
- `docs/ux/CA-UX-05_Matriz_Papel_Bloco_Fonte.csv`;
- `docs/changelog/2026-08-23_CA-UX-05.md`.

ENTREGA FINAL
- fonte canônica reutilizada;
- regra de papel e de atribuição;
- comportamento para pesquisador, não pesquisador e vazio;
- arquivos/linhas alterados;
- testes/typecheck/build;
- declaração literal:
  “Nenhuma ação externa, alteração de dados, migration, mudança de RLS
  ou deploy foi executado.”
```

---

# Prompt P3 — Homologação real de isolamento do Portal

```text
DESTINO: Lovable — projeto Clube Ancestral
https://soul-ancestry.lovable.app

ID: CA-PORTAL-05-HOMOLOGACAO-ISOLAMENTO-PUBLICADO

MODO: EXECUTE SOMENTE TESTES E DOCUMENTAÇÃO.

NÃO ALTERAR CÓDIGO, BANCO, MIGRATION, RLS, SESSÃO, PAPÉIS, DADOS,
INTEGRAÇÕES OU DEPLOY.
NÃO CRIAR CLIENTE, CASO OU CONTA REAL.
NÃO BURLAR `beforeLoad`, RLS, URL, sessão ou guardas.

PRÉ-CONDIÇÃO
Existirem duas contas de teste autorizadas, vinculadas a dois casos
canônicos distintos:
- Cliente A → Caso A;
- Cliente B → Caso B.

Se não existirem, registrar literalmente:
“NÃO COMPROVADO NO DOMÍNIO PUBLICADO — não há duas contas de teste
autorizadas vinculadas a casos distintos.”

OBJETIVO
Comprovar em ambiente publicado que Cliente A não acessa dados do Caso B
por rota direta, query/função ou mensagem de erro reveladora.

TELAS A TESTAR
- Home;
- Jornada;
- Radar;
- Árvore;
- Documentos;
- Entregas;
- Fase 01;
- Fase 02;
- Legado;
- Conta.

FONTES A TESTAR QUANDO FOREM CONSULTADAS
- `portal_projecoes`;
- `documents`;
- `client_deliverables`;
- `knowledge_items`;
- `genealogical_person_profiles`;
- demais views/RPCs consultadas pelas rotas acima.

PROCEDIMENTO
1. Login como Cliente A.
2. Confirmar leitura do próprio Caso A apenas onde autorizado.
3. Alterar diretamente o `case_id`/identificador da URL para Caso B,
   nas telas aplicáveis.
4. Confirmar que:
   - nenhuma linha de Caso B é retornada;
   - nenhum título, contador, badge, erro ou mensagem confirma existência
     de conteúdo do Caso B;
   - nenhuma função/RPC retorna dado de Caso B;
   - a interface usa estado neutro seguro.
5. Repetir como Cliente B contra Caso A.
6. Registrar evidência sanitizada: tela, data/hora, usuário de teste,
   rota, resultado e fonte protegida. Não registrar dados pessoais.

CRITÉRIOS DE PASSAGEM
- Isolamento de banco/RLS, não apenas filtro visual.
- Sem UUID, policy, tabela, endpoint, SKU ou nota interna na interface.
- Sem conteúdo de outro caso.
- Sem liberar Entregas, Legado, Fase 01 ou Fase 02 se a fonte
  correspondente não passar.

SE ALGUMA FONTE FALHAR
- não corrigir nesta execução;
- manter conteúdo da tela em estado seguro;
- classificar como BLOQUEADO;
- documentar rota, fonte, sintoma e risco;
- não declarar homologação completa.

ARTEFATOS
Criar:
- `docs/portal/CA-PORTAL-05_Relatorio_Homologacao_Isolamento.md`;
- `docs/portal/CA-PORTAL-05_Matriz_Acesso_Cruzado.csv`;
- `docs/changelog/2026-08-23_CA-PORTAL-05.md`.

ENTREGA FINAL
- PASSOU/FALHOU/BLOQUEADO por tela e fonte;
- evidência sanitizada;
- confirmação explícita se o teste ocorreu em preview ou produção;
- fontes que permanecem bloqueadas;
- declaração literal:
  “Nenhuma ação externa, alteração de dados, migration, mudança de RLS
  ou deploy foi executado.”
```

---

# Prompt P4 — Log de decisões append-only (somente após aprovar P1/Fase A)

```text
DESTINO: Lovable — projeto Clube Ancestral
https://soul-ancestry.lovable.app

ID: CA-GOV-01-FASE-B-LOG-DECISOES-APPEND-ONLY

PRÉ-CONDIÇÃO ABSOLUTA
A proprietária aprovou explicitamente, sem alteração:
- schema SQL;
- migration;
- seed/backfill idempotente;
- policies RLS;
- regras de arquivamento;
- rollback;
- matriz de papéis;
- plano de testes;

Usar exatamente a proposta aprovada em:
`docs/governanca/CA-GOV-01_Proposta_Log_Decisoes.md`.

NÃO MUDAR SQL, COLUNAS, PAPÉIS, RLS OU BACKFILL APÓS A APROVAÇÃO.
Se qualquer detalhe mudar, parar e solicitar nova aprovação.

OBJETIVO
Converter `/governanca/decisoes` de histórico estático para registro
operacional append-only, preservando integralmente o histórico atual.

EXECUTAR
1. Aplicar migration aprovada.
2. Aplicar policies RLS aprovadas.
3. Executar backfill idempotente aprovado.
4. Garantir que cada decisão histórica seja preservada com conteúdo e
   ordenação/datas disponíveis.
5. Atualizar a rota para leitura da fonte real.
6. Permitir criação apenas para papéis aprovados.
7. Proibir delete físico.
8. Permitir apenas arquivamento auditável, com autor, data e motivo.
9. Não permitir edição destrutiva do histórico.
10. Remover o banner de transição apenas após a fonte real estar ativa e
    os testes passarem.

NÃO AUTORIZADO
- alteração fora do schema aprovado;
- envio, integração externa, webhook ou comunicação;
- criar tarefa, alerta, fila ou touchpoint;
- deploy;
- alterar registros históricos de forma não prevista no backfill.

TESTES OBRIGATÓRIOS
1. Backfill idempotente não duplica histórico.
2. Registro histórico aparece na tela.
3. Papel autorizado cria nova decisão.
4. Papel não autorizado não lê/não cria.
5. Cliente não acessa.
6. Delete físico é negado.
7. Arquivamento grava autor, data e motivo.
8. Histórico arquivado permanece consultável.
9. Nenhum efeito externo é criado.
10. Typecheck, testes e build passam.

DOCUMENTAÇÃO
Atualizar:
- `docs/governanca/CA-GOV-01_Fase_B_Log_Decisoes.md`;
- `docs/governanca/CA-GOV-01_Matriz_Classificacao_Telas.csv`;
- `docs/changelog/2026-08-23_CA-GOV-01.md`.

ENTREGA FINAL
- migration e SHA/arquivo aplicado;
- policies aplicadas;
- quantidade de registros migrados;
- provas de idempotência e não exclusão;
- testes/typecheck/build;
- declaração literal:
  “Nenhuma ação externa, alteração de dados, migration, mudança de RLS
  ou deploy foi executado.”
```
