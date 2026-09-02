# Pacote de Instruções — Redesenho Unificado do Desk, App Cliente, Pessoas e Famílias

**Status:** rascunho — recebido da proprietária em 02/09/2026, aguardando aprovação para execução. Arquivado aqui na íntegra por instrução implícita de "adicionar ao repositório" (mesmo padrão dos demais prompts desta sessão); nenhum passo de implementação foi iniciado a partir deste documento.
**Versão:** v1.0
**Data do pacote:** 2026-08-31
**Responsável pela decisão:** Proprietária do Clube Ancestral
**Classificação:** briefing + plano + prompts + especificação de mockup
**Destino canônico após aprovação:** `docs/prompts/` e `docs/arquitetura/`
**Fontes de evidência:** Drive, Dropbox, anexos da conversa, mockup visual aprovado, fluxo visual Desk–App–WhatsApp, prompt de autoridade e materiais de Jornada Única/CRM/Onboarding.
**Escopo:** preparar ordem de leitura, links e instruções para Claude/Lovable redesenharem o mesmo web app com Desk Intelligence, App Cliente e Pessoas/Famílias integrados.
**Premissas:** mesmo caso/núcleo/pessoa canônico; duas superfícies autorizadas (interna e cliente); Admin com visão master segura; RLS, sessão, isolamento e auditoria preservados.
**Limites:** nenhuma publicação, alteração de banco, migração, envio de mensagem, emissão de link mágico, cobrança ou automação é autorizada por este pacote.
**Próximos passos:** enviar o bloco de execução ao Claude, solicitar primeiro o diagnóstico e mockup estático, aprovar visualmente e somente então implementar corte a corte.
**Critério de aceite:** seção final.

## Observação de arquivamento (não faz parte do pacote original)

**Este documento supera a "Taxonomia Canônica do Mockup Aprovado" registrada em 30–31/08** (7 telas nomeadas de App Cliente/Desk, com regra explícita de não-renomeação) — por ser posterior e explicitamente marcado "Decisão atual" na tabela de fontes abaixo, aplica-se a regra já combinada com a proprietária: entre dois documentos que se contradizem, quando um foi atualizado depois, vale o mais novo. A nova taxonomia (7 áreas do Desk, 8 telas do App Cliente, 12 telas do Desk) fica registrada como a referência vigente a partir desta data; o documento anterior fica preservado como histórico, não como concorrente.

Nenhuma implementação foi iniciada a partir deste pacote. O próprio texto instrui explicitamente: "Não implemente ainda." O passo 0 que ele pede (mapa de fontes lidas, inventário de rotas/componentes/entidades/políticas, de-para de arquitetura, mockup visual "Hoje → Amanhã" para aprovação) ainda depende de decisão da proprietária sobre por onde começar.

---

## Decisão de uso

Este é o pacote único a ser enviado ao Claude. Não envie os prompts dispersos de forma independente nem peça implementação direta a partir de um único PDF.

A ordem correta é:

```text
1. Ler e inventariar fontes
2. Confirmar arquitetura e de-para de rotas
3. Produzir mockup "Hoje → Amanhã", tela a tela
4. Receber aprovação visual da proprietária
5. Implementar por cortes pequenos e verificáveis
6. Validar persistência, RLS, refresh e mobile
7. Só depois preparar automações e Calendar
```

## Princípio do produto

```text
Um web app
→ uma organização
→ casos, pessoas, núcleos e eventos canônicos
→ Desk Intelligence: superfície interna de decisão, pesquisa, operação e publicação
→ App Cliente: front-end externo do mesmo produto
→ Admin: visão master autorizada das duas superfícies
```

O App Cliente não é produto, banco ou aplicativo paralelo. O cliente tem acesso apenas ao front-end cliente-facing; a Admin vê dentro do Desk a projeção efetivamente publicada para cada pessoa/núcleo, sem impersonação por senha, token ou link mágico do cliente.

## Fontes e links

### Núcleo obrigatório

| Prioridade | Material | Finalidade | Link |
|---:|---|---|---|
| 1 | Prompt de Autoridade Admin — cópia compartilhada | Regras de RLS, persistência, classificação por capacidade e segurança | [Google Docs](https://docs.google.com/document/d/1gvsnTCn9EkHk_U2jhEjfAlBvDk9NDo_Y2We76eWx4fU/edit?usp=drivesdk) |
| 1 | Prompt de Autoridade Admin — versão principal | Referência alternativa do mesmo prompt | [Google Docs](https://docs.google.com/document/d/19Q4w7lfBiYG_IlvdS3wCPt43tdspaP_Zhn1rkS-kT9g/edit?usp=drivesdk) |
| 1 | Mockup visual aprovado | Referência visual de linguagem, cartões, páginas e separação App Cliente/Desk | [Google Drive PDF](https://drive.google.com/file/d/174E3dC5gqA5yPZi_aks8nv2qPAcE4vWL/view?usp=drivesdk) |
| 1 | Fluxo visual WhatsApp, App Cliente e Desk Intelligence | Jornada, microentrega, radar em dois níveis, árvore em dois níveis e arquitetura simplificada | [Google Drive PDF](https://drive.google.com/file/d/177PfJie-D80_Vw0rJyELiTujE5KkgjvM/view?usp=drivesdk) |
| 1 | Fluxo da Jornada Clube Ancestral | Referência de jornada operacional e cliente-facing | [Google Docs](https://docs.google.com/document/d/1UnxzVjVLFJ7eXzZAGGphC69gOiXZqvJI/edit?usp=drivesdk&ouid=100591103237305873676&rtpof=true&sd=true) |
| 1 | Prompt revisado de taxonomia unificada | Decisão atual: App no mesmo web app, Pessoa/Família 360, Radar macro/micro e Admin master | Arquivo entregue nesta conversa: `prompt-claude-taxonomia-desk-unificado-app-cliente-pessoas-radar.md` |
| 1 | Pacote do Claude para Jornada Única | Registro de Caso, Pessoa, Família, CRM, Pesquisa, evidências, microentregas, alertas e Ana Luiza | [Documento de acervo/histórico](https://docs.google.com/document/d/1eXCYjOk03Mdr0yxe0Z_nXlWylpFJId35/edit?usp=drivesdk&ouid=100591103237305873676&rtpof=true&sd=true) |

### Jornada, CRM e onboarding

| Prioridade | Material | Finalidade | Link |
|---:|---|---|---|
| 2 | Painel de Calls Discovery | Campos, decisões e evidências da call antes do handoff para o caso | [Google Sheets](https://docs.google.com/spreadsheets/d/1iq61cjwZkd6dQ8b3fqiPBwKGQPRh7g_0npCHchR0_10/edit?usp=drivesdk) |
| 2 | `painel-calls.tsx` | Motor/dados do painel de Calls | [Dropbox](https://www.dropbox.com/preview/Downloads%20072024/Ancestral%20Canvas%20%282%29/src/lib/painel-calls.ts) |
| 2 | `painel-calls.tsx` | Interface do painel de Calls | [Dropbox](https://www.dropbox.com/preview/Downloads%20072024/Ancestral%20Canvas%20%282%29/src/components/crm/painel-calls.tsx) |
| 2 | `onboarding-jornada.ts` | Lógica da Jornada Única e do onboarding | [Dropbox](https://www.dropbox.com/preview/Downloads%20072024/Ancestral%20Canvas%20%282%29/src/lib/onboarding-jornada.ts) |
| 2 | `onboarding-jornada.functions.ts` | Funções de jornada/onboarding | [Dropbox](https://www.dropbox.com/preview/Downloads%20072024/Ancestral%20Canvas%20%282%29/src/lib/onboarding-jornada.functions.ts) |
| 2 | `painel-onboarding-jornada.tsx` | Interface do painel de onboarding/jornada | [Dropbox](https://www.dropbox.com/preview/Downloads%20072024/Ancestral%20Canvas%20%282%29/src/components/painel/painel-onboarding-jornada.tsx) |
| 2 | Fluxo comercial canônico no CRM vivo | Regra de origem, lead, discovery, proposta, follow-up e handoff | [Dropbox](https://www.dropbox.com/preview/Downloads%20072024/Ancestral%20Canvas%20%282%29/.lovable/plan/fluxo-comercial-can%C3%B4nico-no-crm-vivo-2026-08-21.md) |
| 2 | Dicionário de validações do Painel Calls/CRM | Vocabulário controlado, estados e validações da descoberta | [Dropbox](https://www.dropbox.com/preview/Downloads%20072024/Clube-Ancestral/05_CA04_CRM_DISCOVERY_HANDOFF/Dicionario_Validacoes_Painel_Calls_CRM_v1.1.md) |

### Pesquisa, App Cliente e referências visuais

| Prioridade | Material | Finalidade | Link |
|---:|---|---|---|
| 3 | Bases e repositórios — Intelligence Desk Fase 01 | Inventário de bases genealógicas, fontes e repositórios do motor de pesquisa | [Google Sheets](https://docs.google.com/spreadsheets/d/1h9b1NSaDPC3lGobGTgfZS_6Xz0DvNEtl/edit?usp=drivesdk&ouid=100591103237305873676&rtpof=true&sd=true) |
| 3 | Bases e repositórios — cópia (2) | Cópia para comparação de cobertura | [Google Sheets](https://docs.google.com/spreadsheets/d/1UCYshyb7AodXAeXx8n7D4bpRMIhiEefC/edit?usp=drivesdk&ouid=100591103237305873676&rtpof=true&sd=true) |
| 3 | App Cliente — fases | Referência de telas/estados históricos do front-end | [Dropbox](https://www.dropbox.com/preview/app-cliente-fases.html) |
| 3 | App Cliente Fase 1 | Referência de conteúdo e estrutura do cliente | [Dropbox](https://www.dropbox.com/preview/clube-ancestral-app-cliente-fase1.html) |
| 3 | App Cliente mobile first | Referência de responsividade | [Dropbox](https://www.dropbox.com/preview/app-cliente-mobile-first-fase1.html) |
| 3 | `desk-app.tsx` | Mockup/estrutura histórica do Desk em código | [Dropbox](https://www.dropbox.com/preview/Downloads%20072024/Ancestral%20Canvas%20%282%29/src/components/desk-app.tsx) |
| 3 | Elementos ausentes no Desk/App | Inventário de lacunas funcionais declaradas | [Google Drive](https://drive.google.com/file/d/1y7x80Nz0smrdkVDJqT24wk3ZPwDAG2x7/view?usp=drivesdk) |

### Materiais do projeto já consolidados

| Material | Localização prevista | Uso no redesenho |
|---|---|---|
| Mapa de autoridade Admin/Desk/App | `docs/auditorias/` | Classificar por capacidade: UI, handler, função, RLS, escrita, releitura e refresh |
| Jornada Única / onboarding | `docs/arquitetura/` | Garantir um onboarding ativo/rascunho por `case_id` |
| Motor contratual modular | `docs/arquitetura/` | Separar escopo, parâmetros, rascunho, contrato, OS e gates reais |
| Dados vivos e integrações | `docs/arquitetura/` | Preservar fonte canônica, projeções e integrações futuras |
| Pré-onboarding Ana Luiza | `docs/arquitetura/` ou `docs/auditorias/` | Caso de teste familiar real, sem inferir direito ou liberar ações externas |
| Navegação Desk em 8 grupos | `docs/arquitetura/` | Inventário transitório de rotas; não é o menu final obrigatório |
| 14 abas e incorporações | `docs/arquitetura/` | Preservar capacidades aprovadas; não replicar menu de 14 abas |

## Instrução principal para Claude

> Leia integralmente os materiais prioritários antes de alterar código. O objetivo não é criar outro app nem apenas reorganizar links: é redesenhar um único web app do Clube Ancestral, em que o Desk Intelligence opera os mesmos casos, pessoas, núcleos, tarefas, pesquisas, documentos, entregas e permissões que alimentam o App Cliente.
>
> O App Cliente é o front-end externo do mesmo produto. O cliente só vê conteúdo cliente-facing sanitizado, autorizado e publicado. A proprietária/Admin deve ter visão master, dentro do Desk, do que cada pessoa e cada família efetivamente vê no App, sem usar senha, token ou sessão do cliente e sem criar uma cópia de dados.
>
> Não implemente ainda. Primeiro devolva: (1) mapa de fontes lidas; (2) inventário de rotas, componentes, entidades e políticas; (3) de-para da arquitetura atual para a taxonomia alvo; (4) mockup visual "Hoje → Amanhã", tela a tela, para aprovação.

## Taxonomia alvo

### Sete áreas do Desk

| Área | Função | Cartões de entrada |
|---|---|---|
| **Hoje** | Orquestra a carteira do dia | casos urgentes, famílias pendentes, calls/propostas, microentregas, acessos, marcos e alertas |
| **Comercial & CRM Vivo** | Entrada, origem, discovery, proposta e handoff | leads, calls, oportunidades, proposta, follow-up e conversão |
| **Casos 360** | Comando integral por caso | estado, responsável, plano, próximos passos, formalização, onboarding e entregas |
| **Pessoas & Famílias 360** | Identidade, núcleo, vínculos e acesso | pessoa, núcleo, papéis, dependentes, representação, documentos e experiência App |
| **Pesquisa & Intelligence** | Investigação, bases, evidências e produção | pesquisa, fontes, consultas, evidências, árvore, achados, relatórios e microentregas |
| **Formalização & Financeiro** | Instrumentos e condição para transições | proposta estruturada, escopo, contrato, cláusulas, anexos, OS, condição e financeiro |
| **Radar & Decisões** | Prioridade, jurídico, qualidade e exceções | radar macro, radar de caso, marcos jurídicos, riscos, decisões e critérios |

### Administração restrita

Equipe, papéis, configurações, dicionários, integrações, importações, dados técnicos e auditoria técnica ficam em utilidades administrativas, fora da navegação primária cotidiana.

### App Cliente como perspectiva no Desk

Dentro de **Pessoa 360** e **Caso 360**, criar a seção **"Experiência no App"** e a ação **"Abrir Visão Administrativa do Cliente"**.

A visão deve exibir o que está realmente liberado:

- módulos disponíveis;
- jornada/etapa cliente-facing;
- próximo passo publicado;
- documentos/pedidos publicados;
- árvore e radar simplificados quando autorizados;
- Biblioteca e Legado;
- última microentrega e atualização;
- convite, link mágico e estado de acesso;
- indicadores de uso apenas se eventos reais existirem.

## Regras de modelo

### Jornada Única

```text
origem e lead
→ Call Discovery / CRM vivo
→ diagnóstico humano
→ proposta e condição
→ formalização e decisão operacional
→ onboarding único por case_id
→ núcleo, dossiê e acessos
→ plano de ação e primeira microentrega
→ pesquisa, evidência e execução
→ revisão humana
→ liberação App Cliente
→ comunicação contextual
→ continuidade/upgrade contextual quando elegível
```

### Microentrega

Uma microentrega é a unidade de valor. Ela nasce no Desk, recebe responsável, tipo, fonte/evidência quando aplicável, estado, revisão, texto interno, texto cliente-facing, destino, aprovação e horário de publicação.

```text
planejada → em produção → em revisão → aprovada → liberada → publicada → arquivada
```

Somente conteúdo sanitizado e publicado chega ao App Cliente. WhatsApp/e-mail são canais externos: o Desk pode criar tarefa e rascunho; enviar exige a regra de confirmação aplicável.

### Pessoa, família e caso

- **Pessoa:** identidade individual, papéis, dados permitidos, consentimento, documentos, casos, acesso App e histórico.
- **Núcleo familiar:** grupo de pessoas com vínculos, dossiê-mãe, ambiente de acesso, dependentes e representação.
- **Caso:** unidade operacional da Jornada Única, com plano, serviço, proposta, formalização, pesquisa, entregas e decisões.
- Não duplicar pessoa/caso/núcleo para resolver falha de interface.

### Radar macro e micro

**Macro, na carteira:** qual caso/família exige atenção, por que, qual o próximo marco e qual ação resolve.

**Micro, no Caso 360/Pessoa 360:** estágio, eixos comercial e formalização/operação, urgência, riscos, marcos jurídicos, documento, responsável, próxima ação, onboarding, microentrega, acesso e decisão humana pendente.

Nenhum score opaco substitui causa, consequência e ação. O App Cliente não vê score, hipótese jurídica, risco bruto ou força probatória interna.

### Jurídico e formalização

| Objeto | Onde fica |
|---|---|
| Matriz/motor por país, via e marco | Radar & Decisões, com recorte no Caso 360 |
| Revisão jurídica humana | Radar & Decisões + Caso 360 |
| Rascunho, contrato, cláusulas, anexos e OS | Formalização & Financeiro |
| Dicionário jurídico, parâmetros e vocabulário | Administração / Dicionários |

Gates protegem transições reais — versão final, assinatura, cobrança, ativação, pesquisa externa ou publicação — e não impedem rascunho, leitura, correção de dados ou preparação interna autorizada.

## Mockup visual: pedido obrigatório

Produza um **mockup comparativo em PDF, tela a tela**, inspirado no último mockup visual do Lovable e no mockup aprovado. Não produzir código nesta etapa.

### Formato do PDF

- Capa + índice.
- Seção **Hoje**: inventário visual conciso das superfícies/rotas atuais, sem afirmar que toda tela é funcional.
- Seção **Amanhã**: arquitetura proposta e telas redesenhadas.
- Uma página por tela principal; para telas densas, desktop e mobile na mesma página.
- Em cada tela: objetivo, usuário, dados que entram, dados que saem, ligação com o App/Desk e ações principais.
- Usar dados fictícios claramente marcados como `Demonstração — não representa dados reais`.
- Incluir legenda de estados: interno, em revisão, aprovado, publicado, bloqueado por regra real, pendente.

### Premissas visuais imutáveis

1. **Linguagem do mockup original aprovado:** editorial, sóbria, acolhedora e premium; não usar estética genérica de dashboard SaaS.
2. **Paleta:** usar o Pantone/guia de marca do Clube Ancestral como fonte de verdade. Antes de desenhar, extrair as cores, tipografia, margens, contornos e padrões do guia de marca e do mockup aprovado; não adivinhar hexadecimais.
3. **Cards como unidade visual principal:** cards de caso, pessoa, família, entrega, prioridade, documento, decisão e acesso. Tabelas somente para inventário, auditoria, fontes e comparações.
4. **Desktop e mobile:** desenhar breakpoints 1440 px, 768 px e 375 px/430 px. Nenhuma rolagem horizontal, botão primário encoberto, menu inacessível ou Assistente sobreposto à ação crítica.
5. **Hierarquia:** uma decisão principal por cartão; ação primária inequívoca; linguagem humana e específica.
6. **Taxonomia:** usar os nomes aprovados/definidos neste pacote; não criar sinônimos técnicos desnecessários.
7. **Separação de superfícies:** o que é interno recebe marcador discreto; o que é cliente-facing usa texto sanitizado e orientação compreensível.
8. **Imagem:** usar somente elementos visuais do guia/marca aprovados ou ilustrações neutras sem dados pessoais; não criar retratos "reais" de clientes.

### Telas do App Cliente — Amanhã

| # | Tela | Conteúdo obrigatório |
|---:|---|---|
| A1 | Painel/Home | etapa, próximo passo, microentrega, pessoas conectadas, progresso e alertas permitidos |
| A2 | Jornada | marcos liberados, linha do tempo, o que está em andamento e próximo passo aprovado |
| A3 | Documentos | pedidos/situação autorizados, instruções simples, envio quando a regra permitir |
| A4 | Radar do cliente | avanço, pendência compreensível e próximo passo; sem score/hipótese/risco jurídico |
| A5 | Árvore/Conectados | apenas conexões, ramos e fatos liberados |
| A6 | Biblioteca & Legado | microentregas, relatórios, memória e conteúdos publicados |
| A7 | Conta & Família | acesso, convite, participantes autorizados, preferências e suporte |
| A8 | Portal de proposta (estado pré-workspace) | proposta/diagnóstico autorizado, sem abrir o caso completo antes da regra aplicável |

### Telas do Desk — Amanhã

| # | Tela | Conteúdo obrigatório |
|---:|---|---|
| D1 | Hoje | cards de urgência, microentregas, acesso App, formalização, calls e ação do dia |
| D2 | Comercial & CRM Vivo | cards/pipeline de leads, Calls, propostas, follow-up e handoff |
| D3 | Casos 360 — carteira | cards de caso, estágio, responsável, radar resumido, próxima ação e última entrega |
| D4 | Caso 360 — página central | resumo, jornada, radar, família, pesquisa, formalização, onboarding, entregas e auditoria contextual |
| D5 | Pessoas 360 | pessoa, papéis, casos, núcleo, documentos, acesso e Experiência no App |
| D6 | Núcleo Familiar 360 | membros, titularidade, dependentes, representação, dossiê e acessos |
| D7 | Visão Administrativa do Cliente | exatamente a projeção cliente-facing publicada, com origem interna navegável |
| D8 | Pesquisa & Intelligence | pesquisa, bases, fontes, árvore, evidências, achados, relatórios e microentregas |
| D9 | Formalização & Financeiro | escopo, proposta, contrato, OS, cláusulas/anexos, condição e estado financeiro permitido |
| D10 | Radar macro da carteira | cards priorizados com causa, consequência, próximo marco e ação |
| D11 | Radar micro do caso | urgência, jurídico, documentos, operação, valor percebido, microentrega e decisão |
| D12 | Administração/Dicionários | papéis, regras, vocabulário e integrações, fora do fluxo diário |

### Páginas comparativas obrigatórias

- Hoje: Painel atual versus Central Hoje proposta.
- Hoje: ficha/rotas atuais de caso versus Caso 360 contextual.
- Hoje: Radar em matriz versus Radar macro + micro com cards.
- Hoje: App Cliente apartado no menu versus App Cliente como front-end com visão master no Desk.
- Hoje: Pessoas distribuídas em telas versus Pessoa 360 e Núcleo 360.
- Hoje: Pesquisa/evidências em rotas fragmentadas versus Pesquisa & Intelligence.
- Hoje: formalização/jurídico espalhados versus taxonomia de quatro objetos.

## Ordem de implementação após aprovação visual

### Corte 0 — diagnóstico

- Mapear rota → componente → handler → função/RPC → tabela/view → RLS → releitura.
- Não implementar mudança de menu, dados ou integrações.

### Corte 1 — superfície de comando

- Central Hoje com cards que abrem objetos canônicos.
- Caso 360 e Pessoa 360 com links contextuais.
- Corrigir primeiro qualquer escrita que não persiste, com feedback e refresh.

### Corte 2 — modelo família/App

- Pessoa 360, Núcleo 360 e Experiência no App.
- Visão Administrativa do Cliente derivada da projeção autorizada.
- Validar portal de proposta, grupo familiar, convite, link mágico e documentos por capacidade real.

### Corte 3 — pesquisa e valor

- Pesquisa & Intelligence.
- Fontes, evidências, achados, relatórios Fase 1/Fase 2 e microentregas.
- Ciclo produção → revisão → aprovação → publicação.

### Corte 4 — formalização e decisões

- Formalização & Financeiro.
- Radar macro/micro, matriz jurídica aplicada por país/via/marco e decisões humanas.

### Corte 5 — automação posterior

Somente depois de objetos estáveis e homologados:

- alertas internos;
- fila de comunicação;
- integração WhatsApp/e-mail conforme aprovação;
- Google Calendar a partir de tarefa/próxima ação canônica, com deduplicação e auditoria.

## Evidência de aceite por capacidade

Nenhuma capacidade será considerada pronta por aparência. Para cada ação relevante, registrar:

```text
área
→ rota e componente
→ usuário/organização
→ ação/handler
→ função/RPC
→ tabela/view
→ política/RLS e regra de estado
→ payload
→ linhas afetadas
→ releitura
→ refresh
→ resultado
→ tarefa/próxima ação/sem nova ação
```

Classificações permitidas:

- `HABILITADA_E_VALIDADA`
- `HABILITADA_EM_CODIGO_AGUARDANDO_TESTE`
- `PARCIAL`
- `BLOQUEADA_POR_REGRA_DE_ESTADO`
- `ACAO_EXTERNA_NAO_IMPLEMENTADA`
- `SOMENTE_LEITURA_DELIBERADA`
- `SEM_UI_PARA_FUNCAO_EXISTENTE`
- `SEM_FUNCAO_OU_SCHEMA`
- `COM_ERRO_OU_RISCO_CONHECIDO`

## Critérios de aceite

- O mockup PDF compara Hoje e Amanhã, tela a tela, desktop e mobile, sem usar dados reais.
- O mockup preserva guia de marca, paleta/pantone, linguagem, cartões e taxonomia do mockup aprovado.
- O App Cliente é explicitamente parte do mesmo web app e do mesmo modelo de dados.
- A Admin possui visão master segura e auditável da experiência do cliente por pessoa/núcleo/caso.
- Pessoas 360 e Núcleos Familiares 360 são áreas explícitas e acessíveis por cards.
- O Radar possui visão macro de carteira e micro de caso, com motivo e ação.
- Pesquisa & Intelligence incorpora bases genealógicas, fontes, evidências, achados, relatórios e microentregas.
- Marketing/CRM, formalização/financeiro e jurídico permanecem explícitos.
- O onboarding é único por `case_id` e a publicação de microentrega exige revisão/aprovação.
- Nenhuma rota/capacidade existente é excluída no diagnóstico.
- Nenhuma automação externa é criada antes da estabilização e homologação dos objetos canônicos.
