# PRD Aprovado — Soul Ancestry: Go-live do App Cliente e Reuso de Motores

**Status:** aprovado  
**Versão:** v1.0  
**Data:** 2026-09-11  
**Responsável pela decisão:** Proprietária do Clube Ancestral  
**Fonte(s) de evidência:** mockup aprovado de 17 páginas; taxonomia canônica do mockup aprovado; mockup visual revisado nesta conversa; PRs e commits de 11/09/2026 no repositório oficial `tatianatosi/soul-ancestry`; `CA-CONN-01_base_existente_desk.md`; documentos de catálogo operacional e micro-entregas; guia de marca do Clube Ancestral.  
**Escopo:** destravar a publicação do App Cliente em `https://soul-ancestry.vercel.app`, preservar a interface aprovada e ordenar o reaproveitamento dos motores existentes no backend/Desk.  
**Premissas:** repositório único oficial `tatianatosi/soul-ancestry`; Vercel oficial `https://soul-ancestry.vercel.app`; App Cliente é a prioridade; código e tabelas existentes devem ser reaproveitados quando confirmados; toda alteração continua em PR pequeno, com preview e print para aprovação da proprietária antes de merge.  
**Limites:** sem novo MVP, CRM paralelo, banco paralelo, redesign do App Cliente, auditoria/inventário amplo, migração estrutural não necessária ou criação de bloqueios globais; sem pagamento, mensagem, assinatura, publicação de conteúdo do cliente ou ação formal automática.  
**Próximos passos:** pausar a tarefa atual do Cursor; enviar o prompt de retomada deste documento; executar o Lote 0; apresentar preview e prints; aguardar aprovação explícita; fazer merge somente depois do aceite.  
**Critério de aceite:** o App Cliente aprovado está navegável no preview e pronto para produção no domínio oficial; as sete telas mantêm sua taxonomia; dados demonstrativos ou vazios são honestos; toda alteração tem print antes do merge; nenhuma funcionalidade existente é removida para obter o go-live.

---

## 1. Decisão executiva

O produto oficial é o **Soul Ancestry**, no repositório privado `tatianatosi/soul-ancestry` e no endereço `https://soul-ancestry.vercel.app`.

A partir desta data:

1. **Somente esse repositório e esse Vercel são referência de produto.** Repositórios anteriores, recriações e mockups isolados não devem orientar mudanças de runtime.
2. **O App Cliente entra no ar primeiro.** A interface aprovada não será redesenhada, renomeada ou reestruturada durante a preparação de go-live.
3. O Desk evolui como **backend e superfície interna de apoio**, reaproveitando motores reais já presentes, em pequenas fatias conectadas ao mesmo caso/pessoa/família.
4. O trabalho deixa de abrir novas frentes de auditoria, inventário, documentos extensos e loops de prompt. A regra é: **uma entrega pequena, um preview, prints da proprietária, aprovação, merge**.
5. Segurança será proporcional a uma startup de pesquisa: livre para rascunhar, pesquisar, organizar e preparar; bloqueio apenas antes de ação externa, financeira, jurídica formal ou exposição de dado privado.

---

## 2. Fonte única e interface aprovada

### Endereços e fonte de verdade

| Item | Referência oficial |
|---|---|
| Repositório | `tatianatosi/soul-ancestry` |
| Branch de produção | `main` |
| Vercel de produção | `https://soul-ancestry.vercel.app` |
| Estratégia de entrega | Branch curta → PR → preview Vercel → prints da proprietária → aprovação explícita → merge em `main` → Vercel produção |

### App Cliente — congelado visualmente

```text
Home → Jornada → Radar → Árvore → Documentos → Legado → Conta
```

Não renomear `Conta` para `Acesso`; não introduzir rotas internas do Desk na navegação do cliente; não trocar a ordem sem aprovação explícita posterior.

O App Cliente mostra apenas conteúdo liberado: jornada, atualizações, próximos passos compartilháveis, documentos solicitados/liberados, entregas, árvore e radar explicados em linguagem de cliente. Não mostra notas internas, hipóteses não revisadas, matriz de risco interna, parecer jurídico detalhado, CRM, preços não conciliados ou dados de familiares sem autorização.

### Desk — preservar a face aprovada

```text
Visão Geral → Casos 360 → Checklist → Validação Jurídica →
Radar Interno → Alertas → Biblioteca Mestre
```

CRM, Pesquisa, Pessoas, Financeiro, Contratos, Marketing e Governança são domínios acessados por contexto e atalhos internos. O número de abas não é prioridade; o conteúdo conectado é.

---

## 3. Motores e skills a reaproveitar

A tabela abaixo não presume que todos os itens estão homologados em produção. Ela registra o que já aparece como implementado, parcialmente integrado ou com código/tabelas existentes nas PRs verificadas. Cada motor deve ser reaproveitado **somente** na próxima fatia que o utiliza, sem reescrever o que já existe.

| Motor/skill | Evidência de existência | Reuso no produto | Prioridade | Estado nesta etapa |
|---|---|---|---:|---|
| Autenticação e conta de proprietária | Registros de preview autenticado com `tati@pluggedresearch.com` | Login do App/Desk e validação de preview | P0 | Reusar e verificar somente se impedir login no preview |
| App Cliente de 7 telas | Taxonomia visual aprovada e referência em PRs | Go-live imediato, sem redesign | P0 | Preservar |
| Caso 360 | PR #117 e PR #120: composição, jornada, pontes para pesquisa/financeiro | Centro de contexto interno; dados do caso alimentam o App | P0 | Reusar sem virar tela infinita |
| Pessoa 360 | PR #114: núcleo, pesquisa, achados, proposta, contrato, discovery e linha do tempo | Contexto individual/familiar e ponte para pesquisa | P1 | Reusar; corrigir máscara de PII antes de exposição indevida |
| Núcleos familiares e relações | Tabelas/rotas citadas em PR #114: `nucleos_familiares`, `nucleo_membros`, `research_people` | Árvore e Pessoa 360; dados de família no Caso 360 | P1 | Reusar |
| Pesquisa genealógica | `research_people`, `genealogical_findings`, `evidences`, dossiê `/pesquisa` citados em PRs | Coração intelectual do Clube: fontes, achados, evidências, pessoas e entregas | P1 | Reusar e tornar visível no fluxo, não reduzir a Memória Italiana |
| Bases genealógicas e evidências | PR #109 corrigiu workflow de evidências e vocabulário; genealogia usa relações/status alinhados | Alimenta Árvore, Jornada, Radar, Pessoa 360, Caso 360 e Biblioteca Mestre | P1 | Reusar; estado interno não vai para App sem publicação |
| Biblioteca Mestre / conteúdos e legado | Navegação aprovada e módulo de conteúdo já existente | Entregas e publicações liberadas ao App; produção interna por caso | P1 | Reusar |
| Radar e matrizes | Radar Interno aprovado; evidências, validação e qualidade citadas em PRs | Radar do cliente simplificado e Radar Interno rastreável | P1 | Reusar apenas dados/fórmulas existentes; vazio honesto onde não houver base |
| Checklist e tarefas | `/tarefas`; motor de tarefa ligado ao `case_id` descrito em PR #32 | Próxima ação, cadência, execução e alertas | P1 | Reusar |
| Painel Hoje / Visão Geral | PR #97 e #112: casos ativos, alertas, leads sem próxima ação, vencidos e ações | Cockpit do Desk; não é prioridade para bloquear o go-live do App | P2 | Reusar sem criar cards sem fonte |
| CRM Vivo e Mesa de Discovery | PRs #98, #110 e #112: SPIN como sequência de perguntas em `/calls`, passagem para proposta e handoff | Origem → lead → discovery → proposta → pessoa/caso; posterior ao go-live | P2 | Reusar; não criar `crm_calls` paralelo |
| Planejador Universal | PR #118: hidratação, fase válida, espelho em `crm_casos`, kit de prints | Composição do caso e produto/pai/trilha, quando necessário | P2 | Reusar após App estar on-line |
| Catálogo operacional e lista-alimento | PR #117/PR #99: `planner_catalog_feed`, `product_catalog`, `case_plans`, `case_services` | Somente como origem controlada de produto/serviço, sem jogar planilhas no runtime | P2 | Reusar sem reabrir reconciliação agora |
| Proposta e contrato | PR #114 cita `proposals`, `contracts`; auditoria registra páginas Canva, escopo e condição comercial | Exibir status de jornada ao cliente e trabalhar validação no Desk | P2 | Reusar; ações formais seguem bloqueio pontual |
| Financeiro | Rotas `/financeiro`, condições/contratos e vínculo de caso já referidos | Visão interna de contrato, parcelas e status; funil receita posterior | P2 | Reusar sem ativar cobrança automática |
| Marketing/funil | O mockup aprovado pede funil de leads; CRM Journey registra origem e cadeia | Visão executiva futura: origem → lead → discovery → proposta → contrato → pagamento | P3 | Não iniciar antes do go-live do App |
| Comunicação humana / WhatsApp | `communication_queue`; PRs indicam WhatsApp sem disparo automático | Registrar fila e comunicação manual posterior | P3 | Manter desligado para automação |
| Micro-entregas, memória e legado | Catálogo operacional e estudos de micro-entregas; Biblioteca/Legado do App | Entregas de valor no App e continuidade comercial contextual | P2 | Reusar como conteúdo publicado; não transformar em upsell automático agora |
| Brand system | Guia de marca existe nos arquivos do projeto; mockup aprovado define linguagem visual | Logo oficial, navy elevado, marfim, dourado, areia e terracota | P0 | Aplicar somente ajuste visual necessário; Pantone oficial depende do manual homologado |

### Decisão sobre a riqueza genealógica

**Memória Italiana é apenas uma camada de conteúdo/legado.** Ela não substitui o ecossistema de bases genealógicas. O produto deve preservar e reaproveitar, conforme dados já existentes:

- Pessoas e perfis genealógicos.
- Núcleos familiares e membros.
- Relações e linhagens.
- Eventos vitais, migratórios e históricos.
- Pesquisa por pessoa/caso.
- Fontes, evidências, citações e achados.
- Documentos e dossiês.
- Linha do tempo e árvore.
- Relatórios, conteúdos e micro-entregas liberadas.

No App Cliente, essa riqueza aparece de forma simples em **Jornada, Radar, Árvore, Documentos e Legado**. No Desk, ela permanece pesquisável e operável em Caso 360, Pessoa 360, Pesquisa e Biblioteca Mestre.

---

## 4. Ordem obrigatória de execução

### Lote 0 — pausar, orientar e não perder trabalho

**Objetivo:** interromper o loop de PRs concorrentes e alinhar o Cursor ao go-live.

1. Pausar/cancelar o agente do Cursor que esteja executando a tarefa atual, antes de ele criar nova PR, migration, regra, documentação ou merge.
2. Não fechar nem mesclar automaticamente as PRs abertas. Elas são insumo de reaproveitamento, mas várias concorrem entre si em navegação, catálogo e estrutura.
3. Enviar o prompt de retomada da seção 6 a um único agente/branch.
4. O Cursor deve iniciar somente pelo Lote 1.

### Lote 1 — App Cliente pronto para produção

**Objetivo:** gerar um preview funcional e aprová-lo visualmente.

Escopo permitido:

- Corrigir build, rotas, login, renderização, responsividade básica e erros impeditivos.
- Garantir que as sete telas existem com os nomes aprovados.
- Garantir estados vazios honestos e rótulo `Dados demonstrativos` quando aplicável.
- Garantir que conteúdos internos não apareçam no App.
- Aplicar logo oficial e navy elevado apenas se o ativo oficial já estiver no projeto e a troca for isolada.
- Criar uma única PR focada em go-live/estabilização do App.

Fora de escopo:

- Novas telas, novo design system, banco novo, revisão de taxonomia, CRM, financeiro, marketing, migrações amplas ou integrações automáticas.

Entrega obrigatória:

- URL do preview Vercel.
- Print de cada uma das 7 telas em desktop ou mobile conforme superfície principal.
- Print de login/Conta, se login fizer parte do fluxo.
- Lista curta de arquivos alterados.
- Nenhum merge antes do aceite da proprietária.

### Lote 2 — ponte mínima App ↔ Caso

**Objetivo:** eliminar duplicação sem reabrir arquitetura.

- Confirmar que o App lê um caso por `caseId` estável ou por adapter equivalente já existente.
- O Desk lê o mesmo caso; o App apenas recebe campos publicados/autorizados.
- Conectar o mínimo para Home, Jornada, Radar, Árvore, Documentos, Legado e Conta apresentarem conteúdo ou estado vazio coerente.
- Não criar base paralela nem “portal data” digitado manualmente em duplicidade.

### Lote 3 — Caso 360 e Pessoa 360

**Objetivo:** aproveitar o que já foi iniciado, sem transformar a ficha em muro de informações.

- Caso 360: hero de situação, responsável, próxima ação, fase e pontes resumidas para pesquisa, documentos, proposta/contrato, financeiro e cliente.
- Pessoa 360: pessoa, núcleo, relações, pesquisa, achados, documentos, proposta/contrato e histórico conectados por ID.
- Corrigir a exposição de CPF, telefone e CEP por extenso indicada na PR #114 antes de considerar a tela apta a circulação ampla.
- Cada página deve apresentar print de ação e print de resultado antes de merge.

### Lote 4 — pesquisa, genealogia e entregas

**Objetivo:** recolocar a inteligência genealógica no centro.

- Reaproveitar pesquisa, achados, evidências, fontes, relações, núcleo familiar e documentos já existentes.
- Fazer as pontes Caso 360 ↔ Pessoa 360 ↔ Pesquisa ↔ Biblioteca Mestre.
- Publicar para o App somente uma entrega/achado quando uma pessoa interna marcar explicitamente como liberado.
- Não criar automação de IA, matching ou ingestão externa nesta fase.

### Lote 5 — operação comercial e financeira

**Objetivo:** usar os motores existentes depois que App e dados centrais estiverem estáveis.

Ordem interna:

1. CRM/Mesa de Discovery/SPIN.
2. Proposta e handoff para pessoa/caso.
3. Planejador e composição do caso.
4. Contrato e validação jurídica por ação formal.
5. Financeiro por contrato/parcela/pagamento conciliado.
6. Marketing e funil origem → receita.

Não contar pipeline como receita recebida. Não emitir cobrança, abrir link de pagamento ou disparar WhatsApp automaticamente nesta fase.

---

## 5. Protocolo de entrega e aprovação

Este é o fluxo obrigatório que substitui a rotina de múltiplos relatórios:

```text
1 mudança pequena
→ 1 branch
→ 1 PR clara
→ 1 preview Vercel
→ prints enviados à proprietária
→ aprovação explícita no chat/GitHub
→ merge
→ Vercel em produção
```

### Prints obrigatórios

Para toda mudança visível:

1. Print inicial com rota visível.
2. Print da ação executada.
3. Print da confirmação/resultado.
4. Print após F5 ou reabertura quando houver gravação.
5. Print da integração seguinte quando a alteração afetar outro módulo.

Para mudanças puramente visuais sem gravação, bastam: tela antes (se relevante), tela depois em preview e comportamento mobile/desktop quando aplicável.

### Regra de merge

- O Cursor **não mescla** sozinho.
- A proprietária aprova após ver o preview e os prints.
- A autorização precisa citar a PR e/ou SHA que será mesclada.
- Não abrir mais de uma PR concorrente para o mesmo bloco do produto.
- Se houver uma PR já aberta que resolve o mesmo Lote, o Cursor deve atualizar ou abandonar explicitamente a duplicada; não iniciar uma terceira variação.

---

## 6. Como pausar o Cursor agora

### Ação imediata na interface do Cursor

1. Abra o **Cursor Dashboard** ou a conversa do agente que está em execução.
2. Clique em **Stop**, **Cancel**, **Interrupt** ou equivalente no agente/background agent ativo.
3. Não clique em “Merge” e não peça continuação automática.
4. Espere o agente registrar o estado final da execução. Se houver branch/PR criada, mantenha-a aberta e não mescle.
5. Envie a mensagem abaixo no mesmo chat do Cursor ou abra uma nova tarefa no repositório `tatianatosi/soul-ancestry`.

### Mensagem de pausa para colar no Cursor

```text
PAUSE AGORA.

Não faça mais alterações, não crie novos documentos, não abra outra PR, não rode migration, não altere RLS, não mexa em catálogo, não redesenhe telas e não faça merge/deploy.

Pare no estado atual e me responda somente:
1. branch atual;
2. SHA atual;
3. PR aberta, se existir;
4. arquivos modificados ainda não mesclados;
5. se há comando/processo em execução.

Não produza auditoria, inventário ou resumo longo. Aguarde minha próxima instrução.
```

### Prompt de retomada para o Cursor

Após a pausa e a resposta do Cursor, enviar:

```text
CONTEXTO OFICIAL
Produto: Soul Ancestry / Clube Ancestral.
Repositório único: tatianatosi/soul-ancestry.
Produção oficial: https://soul-ancestry.vercel.app.
Não usar repositórios anteriores, recriações ou Vercels alternativos como referência.

DECISÃO DA PROPRIETÁRIA
A prioridade é colocar o App Cliente no ar o mais rápido possível usando o mockup aprovado. Não haverá novo ciclo de auditoria, inventário, documentação longa, redesign ou arquitetura excessiva.

APP CLIENTE — NÃO ALTERAR TAXONOMIA OU DESIGN APROVADO
Home → Jornada → Radar → Árvore → Documentos → Legado → Conta.

DESK — PRESERVAR A FACE APROVADA
Visão Geral → Casos 360 → Checklist → Validação Jurídica → Radar Interno → Alertas → Biblioteca Mestre.

TAREFA ÚNICA AGORA: LOTE 1 — PRONTIDÃO DE GO-LIVE DO APP CLIENTE
1. Leia o estado já existente no repo e as PRs abertas somente para reaproveitar código útil.
2. Escolha uma única branch/PR. Não crie variações concorrentes.
3. Corrija apenas o que impede o App Cliente de renderizar, navegar, autenticar quando aplicável, responder em telas pequenas ou gerar preview Vercel.
4. Preserve todas as sete telas e os seus nomes.
5. Não crie novas tabelas, não faça migrations, não altere RLS, não integre pagamentos, não dispare mensagens e não implemente CRM, financeiro, marketing ou jurídico detalhado.
6. Preserve a riqueza genealógica já existente: pessoas, núcleos, relações, pesquisa, fontes, evidências, achados, documentos, árvore, linha do tempo, relatórios e legado. Memória Italiana é apenas uma parte do produto, não a substituição das bases genealógicas.
7. O App só mostra dados publicados/autorizados; notas internas, riscos, hipóteses e detalhes jurídicos/financeiros ficam no Desk.
8. Segurança proporcional: não bloquear rascunhos, pesquisa, tarefas, navegação ou preparação; bloquear apenas publicação para cliente, dado privado de terceiro, envio/assinatura de contrato, cobrança/pagamento e ação formal.
9. Ao final, rode os testes/build já existentes necessários e gere preview Vercel. Não faça merge.
10. Envie para aprovação:
   - URL do preview;
   - print da Home;
   - print de Jornada;
   - print de Radar;
   - print de Árvore;
   - print de Documentos;
   - print de Legado;
   - print de Conta;
   - lista de arquivos modificados;
   - uma frase objetiva sobre o único bloqueio real, se houver.

PARE DEPOIS DISSO E AGUARDE APROVAÇÃO EXPLÍCITA DA PROPRIETÁRIA PARA MERGE.
```

---

## 7. Estado atual: o que aproveitar e o que pausar

### Trabalho aproveitável já visível hoje

- A Mesa de Discovery/SPIN já foi tratada como fluxo de perguntas no Painel de Calls, ligado a Leads e posterior handoff; não criar CRM paralelo.
- Há tentativa de consolidar a face de 7 telas do Desk e manter grupos internos recolhidos, preservando rotas.
- Caso 360 já possui trabalho de composição do caso e uma proposta de visão macro para não virar “muro” de pesquisa e financeiro.
- Pessoa 360 já foi conectada a núcleo, pesquisa, achados, proposta, contrato, discovery, WhatsApp e linha do tempo por tabelas existentes.
- Há motores/tabelas citados para pesquisa e genealogia: `research_people`, `genealogical_findings`, `evidences`, `nucleos_familiares`, `nucleo_membros`, `case_timeline_events`.
- Há cadeia existente para catálogo e composição do caso: `planner_catalog_feed`, `product_catalog`, `case_plans`, `case_services`, `citizenship_tracks` e `app_projections`.
- O motor de tarefas está conectado ao mesmo `case_id`; o trabalho prévio descreve confirmação por releitura após salvar.

### Trabalho a pausar agora

- PRs concorrentes que tentam decidir novamente a navegação de 6, 7 ou 8 grupos/telas.
- Qualquer nova rodada de catalogação, arquivamento, reconciliação de SKU ou documento de governança.
- Implementação de funil de marketing/receita, pagamento Asaas, WhatsApp automático ou migração ampla.
- Qualquer regra que amplie bloqueios globais de Desk, pesquisa, rascunho, proposta ou contrato em preparação.

### Dívida curta antes do go-live ampliado

- Confirmar preview Vercel com login e variáveis de ambiente reais se houver falha.
- Corrigir exposição de CPF, telefone e CEP por extenso indicada no Pessoa 360 antes da circulação ampla do Desk.
- Verificar que a Home/Jornada/Radar/Árvore/Documentos/Legado/Conta do App apontam para dados existentes ou exibem estados vazios honestos.

---

## 8. Marca e mockup

A imagem de mockup revisada aprovada nesta conversa deve orientar apenas a **essência visual e a organização de conteúdo** do Desk: navy mais alto, marfim, dourado, bordas areia, terracota/âmbar para exceções, cards refinados e pesquisa/financeiro/radar como partes reais de um mesmo ecossistema.

Para o App Cliente, prevalece o mockup de 17 páginas e a taxonomia canônica já aprovada. O Cursor não deve “modernizar” ou substituir essa face como condição para publicar.

Logo: usar somente o ativo oficial já armazenado no projeto ou entregue pela proprietária. Não gerar emblema alternativo. Pantones: aplicar exclusivamente após confirmação no guia homologado; enquanto isso, preservar os tokens visuais existentes e elevar o navy apenas em mudança isolada e aprovada em preview.

---

## 9. Critérios de saída

### App Cliente no ar

- [ ] O preview carrega no Vercel sem erro impeditivo.
- [ ] As sete telas aprovadas existem e navegam: Home, Jornada, Radar, Árvore, Documentos, Legado e Conta.
- [ ] O App não expõe informação interna, técnica, jurídica, financeira ou de terceiros sem liberação.
- [ ] Dados demonstrativos estão rotulados; ausências usam estado honesto.
- [ ] Prints do preview foram enviados para aprovação.
- [ ] A proprietária aprovou explicitamente a PR/SHA.
- [ ] O merge ocorreu apenas após aprovação.
- [ ] `https://soul-ancestry.vercel.app` foi aberto e conferido após o deploy.

### Desk em evolução correta

- [ ] O Desk lê o mesmo caso/pessoa/família por identificadores estáveis, sem cópias paralelas.
- [ ] Pesquisa e bases genealógicas aparecem como domínio central, não como módulo residual.
- [ ] Caso 360 organiza e aponta; não duplica todas as telas em uma página infinita.
- [ ] Toda mudança posterior chega por PR pequena, preview e prints antes do merge.
