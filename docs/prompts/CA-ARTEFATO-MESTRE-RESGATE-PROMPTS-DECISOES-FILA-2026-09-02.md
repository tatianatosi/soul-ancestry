# Clube Ancestral — Artefato Mestre de Resgate
## Prompts, Decisões, Implementações e Fila de Retomada

**Versão:** 1.0
**Data de corte:** 02 de setembro de 2026
**Natureza:** artefato de governança e continuidade; não é texto narrativo de retomada
**Fontes cotejadas:** memória de projeto, materiais recuperados em `docs/evolucao/recuperados/`, inventário de prompts de 31/08 e PRs recentes do repositório `tatianatosi/soul-ancestry`.

---

## 1. Finalidade e regra de uso

Este artefato concentra os prompts e decisões que estruturam o Clube Ancestral. Ele serve para orientar qualquer nova sessão, revisão de PR, implementação no código ou leitura de material externo sem reabrir decisões já tomadas, misturar histórico com estado atual ou transformar documento em fato técnico.

### Convenções de status

| Status | Significado |
|---|---|
| `IMPLEMENTADO_E_TESTADO` | Há código e teste/uso registrado, dentro do escopo descrito. |
| `IMPLEMENTADO_A_CONFIRMAR` | Há código ou migration, mas a persistência, o comportamento final ou o uso real ainda requer prova. |
| `DOCUMENTADO` | Existe prompt, decisão ou especificação; não implica implementação. |
| `HISTORICO` | Material preservado para contexto; não comanda operação atual sem validação. |
| `EM_DECISAO` | Requer decisão explícita da proprietária antes de nova implementação. |
| `PAUSADO` | Não iniciar até existir escopo, gatilho ou autorização. |
| `NAO_AUTORIZADO` | Não executar sem confirmação humana específica. |

### Invariantes

- Não criar, fundir, apagar ou migrar dados reais por inferência.
- Não alterar RLS, sessão, autorização por organização, auditoria ou migração produtiva sem revisão e autorização explícitas.
- Não enviar mensagem, WhatsApp, e-mail, contrato, cobrança, link de pagamento ou pedido externo sem confirmação humana final.
- Não tratar mockup, documento, proposta antiga, relato, transcrição ou WhatsApp como fonte final só porque existe no repositório.
- Não criar novo `case_id` para o mesmo caso entre CRM, dossiê, proposta, contrato, financeiro, Drive, app, tarefa ou go-live.
- App Cliente e One Page recebem apenas conteúdo autorizado, sanitizado e adequado à audiência; Desk/Dossiê mantêm o contexto interno.

---

## 2. Linha do tempo de prompts e decisões

| Período | Prompt, bloco ou artefato | Resultado que permanece válido | Estado atual |
|---|---|---|---|
| Até 13/08 | CA-04 — CRM Mestre, Discovery e Handoff | Arquitetura conceitual de CRM, dicionário de validações, discovery/SPIN, handoff e decisões humanas pendentes. | `DOCUMENTADO` com partes implementadas; CRM operacional único ainda exige consolidação. |
| 11–14/08 | Bloco 5A, CA-05, CA-06 e Glossário | Arquitetura genealógica, ficha pré-consulta, catálogo operacional e vocabulário controlado para comunicação. | `IMPLEMENTADO_A_CONFIRMAR` / `DOCUMENTADO`; fontes e conteúdo de pesquisa exigem proveniência e validação. |
| 15/08 | CA-EVO-02 — Mapa de Automações, Templates, Gatilhos e Sobreposições | Mapeamento de automações, sobreposições, gatilhos e bloqueios; não presumir que algo documentado está ativo. | `DOCUMENTADO`; base de auditoria. |
| 15/08 | CA-EVO-03 — Motor Contratual Modular | Modelo de Estudo Genealógico é a única base contratual operacional aprovada; outros modelos são históricos/comparativos. | `IMPLEMENTADO_A_CONFIRMAR`; integração proposta → parâmetros/contrato ainda necessita decisão e teste. |
| 15/08 em diante | CA-EVO-04 — Dados Vivos e Integrações | Fontes de verdade por domínio; Canva como proposta-mestre; Dropbox como backup/histórico; App/One Page como projeção sanitizada. | `DOCUMENTADO` e parcialmente refletido no código. |
| 15/08 | CA-EVO-05A/05B — Preparação e ativação controlada | Preparação de Ana Luiza, gates, checklist e separação entre preparação e go-live efetivo. | `HISTORICO` para o caso; não prova ativação externa atual. |
| 19/08 | Decisões Canônicas de CRM, Catálogo, Planejador e Jornada | Fonte comercial, dossiê, jornada, comunicação e limites do MVP; WhatsApp automático e automações financeiras fora do MVP. | `DOCUMENTADO`; exige revisão quando uma funcionalidade nova tocar esses domínios. |
| 20–25/08 | Auditorias de migração, rotas, RLS, dados locais e prontidão | Separação entre interface/mocks/dados vivos; mapeamento de domínios e controle de go/no-go. | `DOCUMENTADO`; não substitui inspeção atual do código/banco. |
| 28–31/08 | Rodada de simplificação do Desk e correções P0 | Caso 360 como centro, remoção de telas redundantes, ajuste de autonomia da proprietária, persistência e reconciliações em PRs. | Parte `IMPLEMENTADO_E_TESTADO`, parte em PR draft. |
| 31/08–02/09 | Revisão Motor Contratual, Pessoa Canônica, Calls e skills | Descoberta de cadastros fragmentados, necessidade de ressincronização explícita, varredura WhatsApp, Client Varredura e proposta Canva. | `EM_DECISAO` / `DOCUMENTADO`; próximo corte arquitetural. |

---

## 3. Índice temático dos prompts recuperados

### 3.1 Fundação de CRM, Discovery e Comercial

| Artefato / família | Mandato que permanece | Não assumir |
|---|---|---|
| `CRM-MESTRE_Arquitetura_Conceitual_v1.0.md` | CRM organiza lead, contato, oportunidade, discovery, aceite, handoff e histórico. | Que uma tela existente já torne o CRM único, persistido ou integrado a todos os sistemas. |
| `DICIONARIO_VALIDACOES_CALLS_CRM_v1.0.md` | Campos de CRM e Calls requerem taxonomia, etapa e validação controlada. | Que resposta livre, WhatsApp ou transcrição valide campo jurídico/comercial final. |
| `DISCOVERY-CRM_SPIN_BLOCO4_Registro.md` | Discovery deve transformar conversa em dados verificáveis, com campos e handoff definidos. | Que o Painel de Calls vire repositório de dossiê, pesquisa ou evidência. |
| `PENTE-FINO_Discovery_CRM_v1.0.docx` | Auditoria de roteiros, SPIN, pós-call, ciclo de vida e qualidade de captura. | Que a existência do arquivo equivalha a execução atual. |
| `CA_BIBLIOTECA_WHATSAPP_COMPLETA.md` | Biblioteca de mensagens por contexto e etapa; uso humano governado. | Envio automático ou integração ativa de WhatsApp. |

### 3.2 Genealogia, pesquisa e dossiê

| Artefato / família | Mandato que permanece | Não assumir |
|---|---|---|
| `BLOCO-5A_Arquitetura_Genealogica.*` | Pesquisa exige fontes, evidências, distinção entre relato, hipótese e confirmação. | Que um nome citado em conversa ou one-page seja genealogicamente provado. |
| `CA-05_Ficha_Pre_Consulta_Erwin_Prade.docx` | Ficha pré-consulta organiza dados de entrada e perguntas de investigação. | Que a ficha seja prova documental ou conclusão jurídica. |
| `MANIFESTO_Fontes_Genealogicas_Italia.md` | Fontes genealógicas precisam de escopo, país, instituição, tipo de acervo e regra de uso. | Que toda a base externa já esteja extraída no repositório. |
| `ADENDO_GLOSSARIO_OFICIAL_VALIDACOES.md` | Linguagem ao cliente deve usar confirmação gradual e evitar promessas/conclusões indevidas. | Que termos permitidos dispensem revisão do conteúdo caso a caso. |

### 3.3 Produtos, catálogo, preços e propostas

| Artefato / família | Mandato que permanece | Não assumir |
|---|---|---|
| `CA-06_Catalogo_Operacional_30.md` | Catálogo operacional precisa distinguir item ativo, arquivado, candidato e histórico. | Que todos os SKUs listados estejam homologados ou vigentes. |
| `PROPOSTA_Definicao_Top_SKUs_Arquitetura_Comercial.md` | Priorização comercial deve manter critérios, risco e fontes. | Que Top SKU altere preço, catálogo ou Asaas por si só. |
| `CA-EVO-04_Dados_Vivos_e_Integracoes.md` | Canva é fonte-mestre de proposta; Dropbox é backup/histórico; proposta exige versão. | Que uma cópia em Dropbox seja versão vigente. |
| `escopo-proposta.ts` e materiais contratuais correlatos | Proposta aprovada pauta o escopo; divergências viram revisão humana. | Que CRM, WhatsApp, planejador ou texto livre alterem escopo automaticamente. |

### 3.4 Contrato, formalização e governança

| Artefato / família | Mandato que permanece | Não assumir |
|---|---|---|
| `CA-EVO-03_Motor_Contratual_Modular.md` | Modelo de Estudo Genealógico é a base contratual operacional aprovada. | Que modelos simples, 2024 ou genérico v2 possam voltar a ser base sem decisão jurídica. |
| `CA-CONTRATO-BASE-v2_e_Modelos_Anexos_2026-08-25.md` | Preserva comparação e estado de anexos/modelos. | Que anexos ausentes, documentos antigos ou comparação sejam versão jurídica vigente. |
| `BLOCO-4_Contrato_Dados_Fonte_Unica_QA.docx` | Dados de contrato exigem fonte, validação, controle de qualidade e rastreabilidade. | Que o preenchimento técnico elimine a revisão jurídica ou a aprovação humana. |
| `MATRIZ-AUTORIZACAO-PROPRIETARIA-v1.0.md` e equivalentes | Atos externos e ações irreversíveis exigem confirmação explícita. | Que um botão ou rascunho possa produzir ação externa autônoma. |

### 3.5 Produto, UX, Desk e App Cliente

| Artefato / família | Mandato que permanece | Não assumir |
|---|---|---|
| `Desk_Simples_Arquitetura_Visual_e_Operacional.md` | Simplificar navegação sem apagar função real; manter Caso 360 como contexto de trabalho. | Que cards, métricas ou telas duplicadas representem domínios diferentes. |
| `Taxonomia_Canonica_Mockup_Aprovado_App_Cliente_e_Desk.md` | Desk é operação interna; App é projeção cliente-facing. | Que o App Cliente possa consultar dado bruto de CRM, WhatsApp ou pesquisa. |
| `PROMPTS_VISAO_PRODUTO_ARQUITETURA_MOCKUPS_LANDINGS.md` | Manter coerência entre produto, rotas, visual e estados. | Que mockups sejam banco, integração ou prova de persistência. |
| `PROMPT_CORRECAO_ADMIN_VISAO_CLIENTE.md` | Separar autoridade administrativa de visibilidade do cliente. | Que usuários/papéis duplicados estejam reconciliados por terem nomes semelhantes. |

### 3.6 Migração, segurança e operação

| Artefato / família | Mandato que permanece | Não assumir |
|---|---|---|
| `PROMPT_MIGRACAO_COMPLETA_CLUBE_ANCESTRAL_SEM_BARREIRAS.md` e correlatos | Migração deve inventariar, classificar, preservar dados e provar funcionamento. | Que uma migration existente tenha sido aplicada em produção. |
| `P0_Autoridade_Operacional_Persistencia_e_Proxima_Acao.md` | Gravação só é sucesso quando a escrita e a releitura comprovam o resultado. | Toast, ausência de erro visual ou estado local como prova suficiente. |
| `Pente_Fino_Implantacao_e_Pendencias_Clube_Ancestral_2026-08-30.md` | Pente-fino separa implementação, pendência e risco. | Que não haver erro em uma tela prove a cadeia ponta a ponta. |
| `2026-08-30_politica_entrega_artefatos_e_versionamento_github.md` | Artefato antes de código, versão explícita, evidência e destino conhecido. | Merge ou alteração de estado externo sem autorização. |

---

## 4. Decisões canônicas preservadas

### 4.1 Fonte e autoridade por domínio

| Domínio | Fonte que prevalece | Uso das fontes secundárias |
|---|---|---|
| Caso, pesquisa, evidência, documentos, pendências e histórico | Desk / Dossiê interno | CRM, mensagens e arquivos apenas complementam ou referenciam, conforme vínculo. |
| Proposta e escopo | Proposta vigente aprovada no Canva, com versão identificada | CRM, WhatsApp, transcrição e campos livres podem gerar contexto, nunca redefinir escopo. |
| SKU, preço e condição comercial | Catálogo/fonte comercial homologada e exceção aprovada | Proposta, planejador, WhatsApp e valor manual devem ser conciliados; não prevalecem isoladamente. |
| Dados pessoais cadastrais | Cadastro/documento confirmado, sob acesso governado | Relato e formulário ficam `a_confirmar` até validação aplicável. |
| Estrutura familiar e pesquisa | Dossiê/evidência com proveniência e revisão | Conversa e transcrição são fonte de apoio narrativa. |
| Conteúdo ao cliente | Desk decide, responsável aprova e sanitiza; App/One Page exibem | Nunca projetar dados brutos de atendimento, pesquisa interna ou contrato. |
| Backup e histórico | Dropbox e versões arquivadas | Não são fonte operacional ou versão vigente sem confirmação. |

### 4.2 Contrato

- Base contratual autorizada: **Modelo de Estudo Genealógico**.
- Modelos Simples e 2024: referência histórica, sem uso operacional.
- Contrato genérico v2: material comparativo, não fonte de formalização.
- Proposta aprovada deve alimentar a conferência de escopo por versão e evidência; não por campo livre duplicado.
- Alterações contratuais devem ser explícitas, revisáveis, rastreáveis e aprovadas pela pessoa autorizada.

### 4.3 Comunicação e WhatsApp

- WhatsApp automático, automações financeiras e execução externa não pertencem ao MVP sem decisão posterior.
- A varredura de WhatsApp é uma ferramenta de captura interna: o dump manual pode gerar sugestões para o Painel de Calls; não prova fatos nem envia mensagens.
- A ação correta do sistema é rascunhar, estruturar, sinalizar e aguardar confirmação humana.

### 4.4 Caso, pessoa e família

- Não duplicar caso por módulo ou fase.
- Relações familiares, contatos, clientes, leads, partes contratuais e perfis genealógicos precisam convergir para uma arquitetura de Pessoa Canônica, sem fusão automática.
- Dados de pessoa devem manter fonte, status de confirmação, visibilidade, vínculo de caso e auditoria.

---

## 5. Prompts recentes e situação de execução

| Grupo | Entrega/efeito registrado | Situação |
|---|---|---|
| PR #25–#29 | Correções de autonomia, reversões, remoção de redundâncias e ajuste da apresentação do piloto/contrato. | Fechadas; usar como histórico de mudanças confirmadas. |
| PR #31 | Correção P0 para escrita que declarava sucesso sem releitura/linha afetada. | Aberta em draft; exige teste real de Fonte/Checklist. |
| PR #32 | Pessoa: salvar com releitura e tarefa; ajustes mobile. | Aberta em draft; exige teste de persistência e retorno da tarefa. |
| PR #33 | Pendências vivas no piloto em substituição à lista fixa. | Fechada. |
| PR #34 | Mapa de Autoridade Admin em 10/10 áreas. | Fechada; atualização adicional está em PR #45. |
| PR #35 | Reconciliação de `contratos.$id.tsx` entre mudanças #28 e #32. | Aberta em draft; requer teste na tela de contrato. |
| PR #36 | Política Unificada de Casos, Fase 1: mapear sem modificar. | Aberta em draft; decisão de princípio necessária antes de aplicar migration. |
| PR #37–#38 | Política de artefatos/versionamento e rotina artefato-primeiro. | Fechadas. |
| PR #39 | Persistência de Comercial/Financeiro. | Fechada em 01/09; teste real foi registrado como concluído. |
| PR #40 | Ajuste de botões redundantes do contrato e investigação de falha de sincronização. | Aberta em draft; o problema de objeto/escopo/partes tornou-se especificação do Motor Contratual. |
| PR #41 | Revisão documentada de Motor Contratual e Pessoa Canônica. | Aberta em draft; documentação, não implementação estrutural. |
| PR #42 | Correção da classificação de `caseDataGiovanna.ts` para demo. | Aberta em draft. |
| PR #43 | Arquivamento das decisões canônicas de 19/08. | Aberta em draft. |
| PR #44 | Correções de persistência e aposentadoria do campo livre de proposta no Caso 360. | Aberta em draft; revisar escopo e testar antes de merge. |
| PR #45 | Atualização do Mapa de Autoridade Admin com achados de 01/09. | Aberta em draft. |
| PR #46 | Ficha piloto Giovanna e pacote de redesenho no estudo de Pessoa Canônica. | Aberta em draft. |
| PR #47 | Correção de leads arquivados que continuavam na lista. | Aberta em draft. |
| PR #48 | Varredura WhatsApp: usar sinal extraído no rascunho do lead. | Aberta em draft; primeira ponte concreta entre varredura e CRM. |
| PR #49 | Arquivamento do artefato de Skills de Inteligência, Varredura e Dossiê. | Aberta em draft; documental. |

---

## 6. Inventário de capacidades: fato, proposta e lacuna

| Capacidade | O que existe | Limite / lacuna | Próximo passo correto |
|---|---|---|---|
| Painel de Calls e CRM | Campos, interações, tipos de conversa, Discovery e estruturas de CRM existem. | Ainda há risco de fontes paralelas e necessidade de confirmar o sistema operacional único. | Testar a cadeia dump → sugestão → revisão → gravação → releitura. |
| Varredura de WhatsApp | Código de varredura e componente no Painel de Calls; PR #48 propõe usar sinal no rascunho do lead. | Não é conexão automática com WhatsApp Business; não deve gravar dado final sem revisão. | Aprovar e testar PR #48 com dumps de teste e origem preservada. |
| Client Varredura | Capacidade documentada para localizar materiais por cliente/caso. | Skill autônoma não foi localizada como implementação isolada. | Formalizar entradas, fontes autorizadas, saída e objeto de auditoria. |
| `ca-client-go-live` | Procedimento/skill de preparação e auditoria descrito; execução histórica para Ana. | Não prova go-live atual e não deve criar ações externas por presunção. | Usar como checklist de preparação; exigir gates e evidência atual. |
| Pessoa 360 | Diversos cadastros e perfis existem no schema/código. | Seis representações fragmentadas, sem fonte única consolidada. | Decidir Pessoa Canônica e modelo de relações antes de migração. |
| One Page / Sophi | Estruturas de conteúdo, componentes e material de caso existem. | Conteúdo vigente, sanitização e aprovação de publicação precisam ser confirmados. | Fazer revisão editorial por caso e contrato de dados para projeção cliente. |
| Propostas Canva | Canva é fonte-mestre de escopo; há regras de conferência de escopo. | Vínculo de design, versão, aprovação e ressincronização ainda não é fluxo integral comprovado. | Criar leitura estruturada por `proposal_id` + versão + design Canva. |
| Motor Contratual | Parâmetros, regras, telas e base jurídica existem. | Objeto, escopo e partes não sincronizam automaticamente a partir dos parâmetros/proposta. | Decidir ressincronização explícita e fonte de cada campo; depois implementar em fatia testável. |
| Política Unificada de Casos | Fase 1 documentada em PR #36; há foco em alias e mapeamento sem modificar. | Migration ainda não aplicada; fases de unificação seguem pausadas. | Aprovar o princípio "mapear sem modificar"; só depois avaliar aplicação. |

---

## 7. Decisões abertas que bloqueiam implementação estrutural

### D-01 — Pessoa Canônica

**Decisão necessária:** criar `pessoas_canonicas` como entidade independente ou expandir `clientes`.

**Recomendação:** criar entidade independente e manter `clientes`, `leads`, `contacts`, `nucleo_membros`, `contract_parties` e `genealogical_person_profiles` como papéis/vínculos especializados.

**Motivo:** uma pessoa não é sinônimo de cliente, lead, parte contratual ou perfil de pesquisa. Ampliar `clientes` prolonga a sobrecarga semântica e dificulta relações familiares, rastreabilidade e visibilidade.

**Dependentes:** representar como vínculo entre pessoas canônicas, com tipo de relação, evidência e status de confirmação. Texto livre deve ser observação provisória, não estrutura definitiva.

### D-02 — Motor Contratual

**Decisão necessária:** ressincronização automática ou por botão explícito.

**Recomendação:** botão explícito, prévia de diferenças e auditoria completa.

**Regra:** o motor lê somente a proposta vigente identificada e aprovada; exibe diferenças com parâmetros/contrato; a pessoa autorizada seleciona o que aplicar. Nenhuma revisão posterior de proposta deve alterar contrato silenciosamente.

### D-03 — Campo livre de proposta

**Decisão necessária:** destino dos campos livres semelhantes em Caso 360 e Leads.

**Recomendação:** aposentar como fonte funcional, preservar conteúdo histórico com rótulo claro e adotar vínculo oficial `proposal_id` + versão + design Canva + aprovação.

### D-04 — Política Unificada de Casos

**Decisão necessária:** aprovar ou não o princípio da Fase 1: mapear aliases sem modificar registros existentes.

**Recomendação:** aprovar para reduzir risco de dados e gerar mapa de divergências antes de qualquer unificação física.

### D-05 — One Page Sophi

**Decisão necessária:** tratar Sophi como primeira onda de validação ou manter como histórico até conciliação.

**Recomendação:** somente iniciar após confirmar pessoa/caso, versão da proposta, dados liberados e aprovação editorial. A One Page não deve ser usada como fonte de fato interno.

---

## 8. Fila única de execução

### P0 — Executar primeiro

1. Revisar e testar PR #44: bugs de persistência e aposentadoria do campo de proposta do Caso 360.
2. Testar PR #31: editar próxima ação em fonte/checklist, salvar, F5 completo e comprovar releitura.
3. Testar PR #32: salvar dado de Pessoa e verificar persistência; testar criação de tarefa e feedback visual.
4. Decidir D-01 e D-02 antes de construir tabelas/migrações ou automações de pessoa/contrato.
5. Testar PR #35 e PR #40 no fluxo de contrato, registrando o que ocorre com objeto, escopo e partes.

### P1 — Em seguida

6. Aprovar o princípio da PR #36 sem aplicar migração até revisão específica.
7. Revisar PR #48 com dumps de teste: conferir que sinal extraído vira rascunho e não dado automaticamente validado.
8. Revisar PR #47 para garantir que filtros de lead arquivado não escondam dados legítimos nem alterem histórico.
9. Consolidar o artefato de skills/documentação em PR #49 e conectar ao índice de governança.
10. Revisar PRs documentais #41, #42, #43, #45 e #46 por consistência, nomenclatura e vínculo com decisões abertas.

### P2 — Somente após as decisões P0

11. Especificar schema lógico de Pessoa Canônica sem aplicar migration produtiva.
12. Especificar objeto de leitura de proposta: `proposal_id`, versão, `canva_design_id`, status de aprovação, páginas/evidências e log de ressincronização.
13. Formalizar Client Varredura com entradas, fontes permitidas, objeto de resultado e critérios de aceite.
14. Criar contrato de dados de One Page/App Cliente e rotina de sanitização/aprovação.
15. Só depois discutir motores unificados, integrações externas ou automação de canal.

---

## 9. Critérios de aceite reutilizáveis

| Domínio | Critério mínimo de aceite |
|---|---|
| Persistência | Alterar, salvar, recarregar/abrir de novo e confirmar valor lido do banco. Não aceitar apenas toast ou estado de tela. |
| Varredura | Fonte entra, sugestão aparece, pessoa revisa, origem/confiança ficam registradas e nenhum dado é aceito automaticamente. |
| Pessoa | Vínculos entre registros são explicáveis; não há fusão automática; alteração gera auditoria. |
| Proposta/Contrato | Design e versão identificados; diferenças exibidas; aplicação é explícita; escopo e condição comercial têm fonte correta. |
| Conteúdo ao cliente | Somente campos permitidos aparecem; conteúdo bruto/sensível não vaza; publicação requer aprovação. |
| Migração | SQL revisado, ambiente alvo confirmado, backup/rollback definido, RLS preservada e prova pós-aplicação registrada. |
| Integração externa | Simulação ou rascunho interno primeiro; confirmação final antes de envio/criação/alteração externa. |

---

## 10. Prompt-base para a próxima sessão

```text
CLUBE ANCESTRAL — EXECUÇÃO CONTROLADA POR ARTEFATO

Use como fonte de continuidade o arquivo:
CA_ARTEFATO_MESTRE_RESGATE_PROMPTS_DECISOES_E_FILA_2026-09-02.md

Objetivo desta sessão: executar somente a próxima fatia P0 explicitamente escolhida pela proprietária.

Antes de editar código:
1. Identifique a decisão aberta e a PR/arquivo correspondente.
2. Diferencie fato implementado, hipótese, documento e dado local.
3. Liste as entidades/tabelas/rotas afetadas.
4. Declare o critério de aceite com teste de persistência/releitura, quando houver escrita.
5. Não tocar RLS, sessão, permissões organizacionais, auditoria, migration produtiva, integrações ou ações externas sem autorização explícita.

Durante a execução:
- Não criar nova arquitetura se a decisão D-01 ou D-02 ainda não tiver sido tomada.
- Não transformar WhatsApp/transcrição/relato em dado confirmado.
- Não sincronizar proposta e contrato automaticamente.
- Não mesclar PR sem autorização explícita da proprietária.

Ao finalizar:
- Gerar ou atualizar artefato versionado.
- Informar arquivos alterados, testes realizados, resultado e limitações.
- Se bloqueado, reportar uma decisão objetiva necessária, sem inventar saída.
```

---

## 11. Registro de encerramento

Este artefato consolida a retomada até 02/09/2026. Ele não autoriza merge, migration, alteração de dados, disparo de integração, comunicação externa, criação de tarefa ou publicação para cliente.

O próximo ciclo deve escolher uma única frente P0, executá-la com evidência e atualizar este inventário somente quando houver alteração verificável de estado.

---

## Reconciliação com o que já aconteceu nesta sessão (adicionada no arquivamento, 02/09/2026)

Este artefato foi recebido depois de vários itens da sua própria fila P0/P1 já terem sido resolvidos nesta mesma sessão, e uma das suas "recomendações" (D-01) já ter sido substituída por decisão explícita e posterior da proprietária. Registrado aqui em vez de silenciosamente ignorado, seguindo a mesma regra já combinada: entre o que este artefato recomenda e o que a proprietária decidiu depois, ao vivo, vale o mais novo.

- **D-01 (Pessoa Canônica):** este artefato recomenda tabela nova `pessoas_canonicas`. A proprietária decidiu depois, em conversa direta, estender `clientes` — e a migração `pessoa_canonica_extensao_clientes` já foi aplicada ao Supabase real (PR #51). A recomendação deste documento fica registrada como alternativa considerada e não escolhida, não como pendência em aberto.
- **D-04 (Política Unificada, Fase 1):** já verificado nesta sessão com consulta direta ao banco — zero duplicidade de caso/cliente, e o caso da Ana Luiza já estava reconciliado antes desta sessão (ver `PESSOA-360-DE-PARA-LEAD-ATE-CLIENTE-2026-09-02.md`, seção 2). "Aprovar o princípio" já não é mais o passo pendente; o que falta é decidir Fase 3 (`case_participants`), com os dois pré-requisitos que a própria matriz de reconciliação de 30/08 registrou.
- **PR #50** (Decisões Canônicas de Catálogo/Planejador aplicadas, correção da premissa de Planilha Mestre) e **PR #51** (Pessoa Canônica + verificação da política unificada) não existiam quando este artefato foi escrito — são posteriores ao corte de "02/09" deste documento.
- **PR #47** e **PR #48**, listados aqui como P1 "a revisar", já foram implementados nesta sessão (não apenas documentados): #47 corrige o filtro de arquivados em `listarLeadsDesk`; #48 conecta o sinal da varredura ao rascunho do lead, preservando a regra de não gravar automaticamente.
- A fila P0 dos itens 1–3 (testar PR #44/#31/#32 com protocolo salvar→F5→reler) continua sendo, em grande parte, teste manual em preview — só a proprietária pode confirmar o clique real na tela. Onde deu para verificar o padrão de persistência por consulta direta ao banco (sem clicar na UI), isso foi feito nas rodadas anteriores desta sessão e registrado nos respectivos PRs.
