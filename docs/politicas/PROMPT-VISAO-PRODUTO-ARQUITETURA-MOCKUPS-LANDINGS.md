# Prompts Executáveis — Visão de Produto, Arquitetura Validada, Mockups e Landings

**Projeto:** Clube Ancestral  
**Repositório:** `tatianatosi/soul-ancestry`  
**Infraestrutura-alvo:** Supabase próprio + Vercel + GitHub  
**Destino:** Claude Code / equipe responsável pelo produto  
**Data:** 28 de agosto de 2026

Este arquivo reúne quatro prompts independentes. Eles devem entrar na fila **após** a estabilização do acesso da proprietária e após as revisões R00–R07. Nenhum prompt autoriza remover dados ou introduzir governança, auditorias, reconfirmações, gates de interface ou fluxos que impeçam a operação.

---

# P01 — Visão de Produto Completa: quem acessa, onde vai, o que faz e o que recebe

```markdown
# P01 — MAPA DE PRODUTO COMPLETO DO CLUBE ANCESTRAL

Repositório: tatianatosi/soul-ancestry
Objetivo: produzir uma visão única, concreta e verificável do produto inteiro, mostrando quem usa cada ambiente, quais rotas pode acessar, o que pode fazer, quais dados consome, quais dados produz e qual resultado recebe.

A pergunta que este documento deve responder é:

> Quem entra no sistema, para onde vai, o que faz, qual dado é salvo, qual motor é acionado e o que recebe de volta?

## Regra da revisão

Não implementar nada nesta tarefa.
Não criar tabela, migration, rota, tela, card, mock, integração ou governança.
Não presumir que uma rota representa uma função operante.
Basear a resposta no código e nas rotas/tabelas reais existentes.

## Perfis a mapear

1. Proprietária / owner.
2. Administrador / admin.
3. Equipe operacional: genealogista, atendimento, financeiro e jurídico, caso esses papéis existam.
4. Cliente / titular do portal.
5. Visitante público / lead.
6. Admin em visualização de cliente.

## Ambientes a mapear

```text
Site público e landing pages
Diagnóstico/Radar
Login
Desk Intelligence
Caso 360
Pesquisa documental/genealógica
Planejador de Cidadania
Propostas
Contratos
Financeiro
Marketing e CRM
Onboarding e Cadências
Portal/App Cliente
Configurações e Equipe
```

## Para cada perfil x ambiente, mapear

- ponto de entrada e rota;
- condição real de acesso;
- páginas disponíveis;
- ação que a pessoa executa;
- formulário/botão/função envolvida;
- tabela ou bucket consultado/alterado;
- evento ou próximo motor acionado;
- saída visível para a pessoa;
- dependências externas, se houver;
- estado real: funcional, parcial, interface sem persistência, mock, ausente ou bloqueado.

## Formato obrigatório: Matriz de acesso e resultado

| Perfil | Ambiente / rota | Para que serve | Pode fazer | Dados lidos | Dados gravados | Próximo motor / evento | O que recebe/visualiza | Estado real | Lacuna/bloqueio |
|---|---|---|---|---|---|---|---|---|---|

## Fluxos ponta a ponta obrigatórios

Mapear detalhadamente estes seis caminhos:

1. Visitante → diagnóstico/radar → lead → contato/proposta.
2. Lead externo/manual → cliente → caso → proposta → contrato → pagamento → onboarding.
3. Caso de cidadania → pesquisa → documento → pendência → planejador → atualização ao cliente.
4. Cliente → portal → jornada → documento → contrato → pagamento → próximo passo.
5. Owner/admin → Caso 360 → abrir visão de cliente → voltar ao Desk.
6. Pós-reconhecimento → AIRE/passaporte/registros → legado/assinatura.

Para cada fluxo, usar:

| Etapa | Usuário | Rota | Ação | Função | Tabela/bucket | Saída persistida | Próxima etapa | Estado |
|---|---|---|---|---|---|---|---|---|

## Saída final

Entregar somente:

1. Matriz de acesso e resultado.
2. Seis fluxos ponta a ponta.
3. Lista de até 15 lacunas priorizadas por impacto operacional.
4. Uma frase para cada lacuna: “sem isto, [perfil] não consegue [resultado]”.

Não transformar o resultado em uma lista genérica de funcionalidades. Não afirmar que algo está feito apenas por existir uma rota, tela, componente ou documento.
```

---

# P02 — Revisão da arquitetura visual validada: App Cliente (7 telas) e Desk (8 grupos)

```markdown
# P02 — REVISÃO DE ARQUITETURA E MOCKUPS VALIDADOS
## App Cliente com 7 telas + Desk Intelligence com 8 grupos

Repositório: tatianatosi/soul-ancestry
Objetivo: conferir o que foi validado visualmente contra o que existe no código e contra o que está conectado a dados reais. Consolidar uma arquitetura visual única, sem cenários contraditórios por aba.

Não implementar mudanças nesta tarefa.
Não criar novos fluxos de governança, auditoria, modo proprietária, reconfirmação ou gates.
Não redefinir a marca sem evidência.
Não tratar um mockup como funcionalidade implantada.

## Parte A — App Cliente: 7 telas canônicas

Usar estas sete telas como arquitetura canônica da experiência do cliente:

1. **Início / Meu caso**
   - resumo do caso;
   - fase atual;
   - próxima ação;
   - progresso;
   - achados recentes;
   - pagamento/contrato quando liberados.

2. **Jornada**
   - linha do tempo do processo;
   - fases, milestones previstos e concluídos;
   - previsão em faixa;
   - explicações simples de dependências externas.

3. **Documentos**
   - checklist;
   - itens solicitados;
   - upload;
   - documentos recebidos/liberados;
   - status compreensíveis.

4. **Descobertas / Pesquisa**
   - pessoas da árvore;
   - fontes;
   - documentos e achados históricos liberados;
   - linha do tempo familiar.

5. **Propostas e Contratos**
   - proposta disponível;
   - contrato, PDF e status;
   - escopo resumido;
   - ação de aceite/contato quando aplicável.

6. **Financeiro / Conta**
   - pagamentos;
   - parcelas;
   - saldo/informações liberadas;
   - links de pagamento apenas se válidos.

7. **Perfil e Ajuda**
   - dados pessoais;
   - canais de contato;
   - FAQ/como funciona;
   - preferências de comunicação;
   - sair.

## Parte B — Desk Intelligence: 8 grupos canônicos

1. **Hoje**
   - tarefas, atrasos, follow-ups, próximas ações e atalhos.
2. **Marketing**
   - origem, campanhas, leads, pipeline e conversão.
3. **Comercial**
   - clientes, oportunidades, propostas, produtos/SKUs e negociação.
4. **Casos**
   - Caso 360, jornada, responsáveis, pendências, milestones e visão de cliente.
5. **Pesquisa**
   - pessoas, relações, fontes, pedidos, documentos, evidências e hipóteses.
6. **Contratos e Financeiro**
   - contratos, PDFs, parcelas, pagamentos, saldo, despesas e conciliação.
7. **Cliente**
   - portal, conteúdo liberado, entregas, comunicações, onboarding e cadências.
8. **Configurações e Equipe**
   - organização, membros, papéis, templates e integrações; não incluir governança como grupo de trabalho.

## Revisão tela a tela

Para cada uma das 7 telas do App Cliente e 8 grupos do Desk, informar:

- rota existente;
- componente principal;
- campos/cards realmente presentes;
- dados que deveria exibir;
- tabelas/funções que realmente fornecem dados;
- dados persistidos versus mock/lista;
- ações disponíveis;
- se a ação grava no Supabase;
- como chega à próxima tela/etapa;
- divergências entre mockup validado, código e comportamento atual;
- prioridade de correção.

## Formato obrigatório: App Cliente

| Tela | Rota | Objetivo para cliente | Componentes/ações | Fonte de dados real | Persistência | Mock/lista? | Integração com Desk | Estado | Correção mínima |
|---|---|---|---|---|---|---|---|---|---|

## Formato obrigatório: Desk

| Grupo | Rotas | Objetivo operacional | Ações reais | Fonte de dados real | Conecta com quais módulos | Mock/lista? | Estado | Correção mínima |
|---|---|---|---|---|---|---|---|---|

## Mapa de navegação obrigatório

Apresentar uma árvore única:

```text
Site público
├── Diagnóstico/Radar
├── Login cliente
│   └── App Cliente
│       ├── Início
│       ├── Jornada
│       ├── Documentos
│       ├── Descobertas
│       ├── Propostas e Contratos
│       ├── Financeiro e Conta
│       └── Perfil e Ajuda
└── Login interno
    └── Desk Intelligence
        ├── Hoje
        ├── Marketing
        ├── Comercial
        ├── Casos
        ├── Pesquisa
        ├── Contratos e Financeiro
        ├── Cliente
        └── Configurações e Equipe
```

## Critérios de qualidade

- O cliente não vê menus internos, governança, dados de outros clientes ou indicadores do Desk.
- Owner/admin não precisa virar cliente, fazer logout ou reconfirmar nada para abrir uma visão de cliente.
- Cada ação deve ter consequência verificável: salvar, abrir, gerar, atualizar, concluir ou navegar.
- Não declarar tela pronta se só existe um layout sem dados reais.
- Identificar todas as duplicidades de cenários, nomes de fase e rotas que confundem a navegação.

## Entrega

Entregar somente a revisão tabulada, o mapa de navegação e uma lista priorizada de divergências. Não corrigir nada nesta tarefa.
```

---

# P03 — Landing page de abertura do aplicativo

```markdown
# P03 — LANDING PAGE PÚBLICA DE ABERTURA DO APP CLUBE ANCESTRAL

Repositório: tatianatosi/soul-ancestry
Objetivo: construir uma landing page pública, elegante, clara e conversiva para apresentar o aplicativo e direcionar visitantes para Diagnóstico/Radar, acesso do cliente ou contato humano.

Esta landing não substitui o site institucional. Ela é a porta de entrada do ecossistema digital do Clube Ancestral.

## Tom e linguagem

Usar português do Brasil, tom humano, consultivo, acolhedor, claro e profissional.

Não usar linguagem técnica de software, promessas de resultado jurídico, tom burocrático, pressão comercial artificial, jargão de “dashboard”, “governança”, “compliance”, “pipeline”, “feature” ou “auditoria”.

A linguagem deve refletir o posicionamento do Clube Ancestral: pesquisa genealógica profissional, memória familiar, documentos e cidadania europeia por ancestralidade.

## Objetivo principal de conversão

CTA primário:

```text
Descobrir meu caminho
```

Destino: Diagnóstico/Radar elegível já existente.

CTAs secundários:

```text
Já sou cliente — acessar meu espaço
Falar com o Clube Ancestral
```

Não colocar checkout direto nem formulário longo no topo.

## Estrutura obrigatória da página

### 1. Hero

Eyebrow:

```text
Clube Ancestral
```

Título:

```text
Sua história pode abrir novos caminhos.
```

Subtítulo:

```text
Descubra as possibilidades da sua origem familiar, organize documentos e acompanhe sua jornada de cidadania e legado em um só lugar.
```

Botões:

```text
[Descobrir meu caminho]
[Já sou cliente]
```

Elemento visual: uma composição editorial com árvore/linhagem, documentos históricos, mapa sutil ou linha do tempo. Não usar bandeiras espalhadas, passaportes genéricos, avião, malas ou estética de agência de imigração.

### 2. Proposta de valor

Título:

```text
Mais do que documentos: uma jornada para compreender a sua origem.
```

Três blocos:

```text
Entenda suas possibilidades
Um diagnóstico inicial transforma informações familiares em caminhos mais claros.

Organize sua pesquisa e seus documentos
Acompanhe certidões, pendências, descobertas e próximos passos com tranquilidade.

Construa um legado que continua
Reúna histórias, pessoas e registros importantes para você e para sua família.
```

### 3. Como funciona

Título:

```text
Seu caminho começa com poucas informações.
```

Etapas:

```text
1. Conte o que você sabe
Informe sobrenomes, países de origem e informações familiares disponíveis.

2. Receba uma direção inicial
O Clube Ancestral ajuda a organizar hipóteses, documentos e próximos passos.

3. Acompanhe sua jornada
Quando você se torna cliente, seu espaço reúne pesquisa, documentos, entregas e orientações.
```

### 4. Áreas de atuação

Exibir cards ou blocos para:

```text
Cidadania por ancestralidade
Pesquisa genealógica
Busca e organização de certidões
Montagem documental
Memória e legado familiar
Pós-reconhecimento: registros e passaporte
```

Não usar preços nessa seção.

### 5. O aplicativo

Título:

```text
Um espaço seu para acompanhar cada descoberta.
```

Explicar em linguagem simples:

```text
No espaço do cliente, você acompanha a jornada do seu caso, sabe quais documentos são necessários, recebe atualizações, consulta propostas e contratos e preserva descobertas importantes da sua família.
```

Inserir prévias/mockups do App Cliente, mas não inventar telas que não estejam na arquitetura validada.

### 6. Confiança e limites

Título:

```text
Clareza em cada etapa.
```

Texto:

```text
Cada história familiar tem documentos, caminhos e tempos próprios. O Clube Ancestral trabalha com pesquisa, organização e orientação personalizada. A análise de viabilidade depende das informações e evidências disponíveis em cada caso.
```

Não prometer cidadania, passaporte ou prazo garantido.

### 7. CTA final

Título:

```text
Comece pela sua história.
```

Texto:

```text
Em poucos minutos, você pode nos contar o que já sabe sobre sua família e receber uma direção inicial.
```

Botões:

```text
[Descobrir meu caminho]
[Falar com o Clube Ancestral]
```

### 8. Rodapé

Incluir:

```text
Clube Ancestral
Pesquisa genealógica e cidadania europeia por ancestralidade
Links: Diagnóstico, Acesso do Cliente, Contato, Privacidade, Termos
```

## Requisitos técnicos

- Página responsiva e mobile-first.
- Sem dados mockados que pareçam informações de clientes.
- CTAs devem apontar para rotas reais; se uma rota não existir, usar contato humano em vez de link quebrado.
- Medir apenas eventos essenciais e reais: `landing_view`, `cta_diagnostico_click`, `cta_login_cliente_click`, `cta_contato_click`.
- Não exigir login para visualizar.
- Não exibir menu de Desk, rotas administrativas, auditoria, governança ou qualquer estado interno.

## Entrega esperada

- rota pública funcional;
- conteúdo em português revisado;
- CTAs reais;
- layout alinhado à marca existente;
- preview Vercel;
- evidência de que cada CTA aponta para um destino válido.

Não publicar em produção sem aprovação da proprietária.
```

---

# P04 — Landing page de acesso do cliente

```markdown
# P04 — LANDING PAGE DE ACESSO AO ESPAÇO DO CLIENTE

Repositório: tatianatosi/soul-ancestry
Objetivo: criar uma página de acesso clara, acolhedora e coerente com a linguagem institucional do Clube Ancestral, levando clientes ao login e oferecendo um caminho humano para quem ainda não tem acesso.

## Objetivo da página

Não vender. Não apresentar o Desk. Não exibir tecnologia ou regras internas.

A página deve responder, de forma simples:

```text
Já sou cliente. Onde acompanho minha jornada?
```

## Linguagem

Português do Brasil, tom calmo, humano e claro.

Evitar:

```text
portal SaaS
workspace
conta corporativa
compliance
auditoria
onboarding técnico
usuário não autorizado
acesso negado
```

Usar:

```text
Seu espaço
Sua jornada
Seus documentos
Suas descobertas
Próximos passos
Falar com a equipe
```

## Estrutura obrigatória

### 1. Hero

Título:

```text
Seu espaço no Clube Ancestral.
```

Subtítulo:

```text
Acompanhe sua jornada, documentos, descobertas e próximos passos em um só lugar.
```

CTA principal:

```text
[Entrar no meu espaço]
```

O botão precisa apontar para a rota real de login do cliente.

CTA secundário:

```text
[Ainda não recebi meu acesso]
```

Esse CTA abre contato humano ou formulário curto. Não direcionar para páginas de governança, erro técnico ou cadastro administrativo.

### 2. O que você encontra

Cards simples:

```text
Sua jornada
Veja em que etapa seu caso está e o que acontece a seguir.

Seus documentos
Consulte documentos liberados e veja o que ainda precisa ser enviado.

Suas descobertas
Acompanhe informações e registros encontrados sobre sua família.

Propostas, contratos e pagamentos
Tenha seus documentos comerciais organizados quando estiverem disponíveis.
```

### 3. Como acessar

Texto curto:

```text
Use o e-mail informado ao Clube Ancestral. Se for seu primeiro acesso ou se precisar de ajuda, fale com nossa equipe.
```

Não expor instruções internas de permissões, roles, Supabase, tokens, reconfirmação ou auditoria.

### 4. Ajuda

Título:

```text
Precisa de ajuda?
```

Texto:

```text
Se você não encontrou seu acesso ou tem alguma dúvida sobre seu caso, nossa equipe está aqui para orientar.
```

Botões:

```text
[Falar pelo WhatsApp]
[Enviar e-mail]
```

Os botões só devem aparecer se os links/canais forem reais e configurados. Caso contrário, usar um formulário de contato que crie uma solicitação real no sistema.

### 5. Rodapé

```text
Clube Ancestral
Seu caminho, sua história, seu legado.
Privacidade · Termos · Contato
```

## Requisitos técnicos

- Mobile-first.
- Rota pública.
- Sem menu do Desk.
- Sem dados de outros clientes.
- Sem mensagem genérica “sem permissão”.
- Em caso de falha de login, mostrar mensagem humana e acionável:

```text
Não foi possível entrar agora. Confira seu e-mail ou fale com nossa equipe para receber ajuda.
```

- Não redirecionar cliente para Modo Proprietária, Reconfirmar Propriedade, Auditoria, Governança ou qualquer rota interna.
- Se owner/admin abrir essa landing, ele pode fazer login no Desk normalmente; não misturar login administrativo com login do cliente.

## Entrega esperada

- rota pública;
- CTA de login apontando para destino real;
- CTA de suporte configurado ou substituído por solicitação real;
- layout coerente com a landing de abertura;
- preview Vercel;
- teste de links sem navegação quebrada.

Não publicar em produção sem aprovação da proprietária.
```

---

# P05 — Mockups visuais tela a tela: App Cliente, Desk e Landings

```markdown
# P05 — MOCKUPS VISUAIS VALIDADOS, TELA A TELA

Projeto: Clube Ancestral
Objetivo: criar mockups visuais completos, navegáveis e consistentes para as páginas públicas, as sete telas do App Cliente e os oito grupos do Desk Intelligence.

Importante: este trabalho é de design/protótipo e arquitetura visual. Não alegar que uma ação funciona no banco se ela ainda não estiver integrada. Em mockup, usar sinalização clara de estado demonstrativo e nunca apresentar dados fictícios como dados reais de clientes.

## Direção visual

- Estética editorial, acolhedora, premium e documental.
- Hierarquia tipográfica forte: títulos serifados; interface e corpo com sans-serif legível.
- Paleta do Clube Ancestral: azul profundo/navy, terracota, areia/off-white, dourado pontual e cinzas quentes.
- Uso de linhas do tempo, papéis/documentos, ramos familiares, mapas discretos e arquivo histórico.
- Evitar visual de fintech, banco, software corporativo, dashboard excessivamente denso, ícones frios em excesso ou estética genérica de agência de imigração.
- Mobile-first para o App Cliente; Desk otimizado para desktop e responsivo.
- Garantir contraste, fonte mínima legível, estados vazios e ações primárias claras.

## Regra de conteúdo

Usar dados claramente fictícios e rotulados como demonstração, por exemplo:

```text
Caso de demonstração
Cliente exemplo
Documento de exemplo
```

Não usar dados reais de clientes, CPF, valores privados, documentos reais ou informações sensíveis em mockups.

## Entregas de mockup

### A. Duas landing pages

1. Landing de abertura do aplicativo.
2. Landing de acesso ao cliente.

### B. App Cliente — 7 telas

1. Início / Meu caso.
2. Jornada.
3. Documentos.
4. Descobertas / Pesquisa.
5. Propostas e Contratos.
6. Financeiro / Conta.
7. Perfil e Ajuda.

### C. Desk Intelligence — 8 grupos

1. Hoje.
2. Marketing.
3. Comercial.
4. Casos / Caso 360.
5. Pesquisa.
6. Contratos e Financeiro.
7. Cliente / Onboarding e Cadências.
8. Configurações e Equipe.

## Para cada mockup, produzir

| Elemento | Obrigatório |
|---|---|
| Nome da tela e objetivo | Sim |
| Desktop ou mobile | Sim |
| Cabeçalho e navegação | Sim |
| Conteúdo principal | Sim |
| Estado com dados | Sim, apenas dados de demonstração rotulados |
| Estado vazio | Sim |
| Estado de erro/indisponibilidade | Sim, mensagem humana e ação de retorno |
| Ação primária | Sim |
| Ação secundária | Quando aplicável |
| Destino da navegação | Sim |
| Dados que a tela precisa consumir | Sim, anotação lateral ou documentação curta |
| Dados que a ação precisa gravar | Sim, anotação lateral ou documentação curta |

## Mapa obrigatório de telas

### Landing de abertura

```text
Hero
→ Diagnóstico/Radar
→ Login cliente
→ Contato
```

### Landing de cliente

```text
Acesso cliente
→ Login
→ App Cliente / Início
→ Ajuda humana
```

### App Cliente

```text
Início
├── Jornada
├── Documentos
├── Descobertas
├── Propostas e Contratos
├── Financeiro e Conta
└── Perfil e Ajuda
```

### Desk

```text
Hoje
├── Marketing
├── Comercial
├── Casos / Caso 360
│   ├── Planejador
│   ├── Pesquisa
│   ├── Documentos
│   ├── Propostas
│   ├── Contratos e Financeiro
│   ├── Onboarding e Cadências
│   └── Abrir visão do cliente
├── Pesquisa
├── Contratos e Financeiro
├── Cliente
└── Configurações e Equipe
```

## Mockup essencial: Caso 360

A tela Caso 360 deve ser apresentada como a mesa de trabalho da proprietária. Deve conter, acima da dobra:

```text
Nome do cliente
Nome/código do caso
País, rota e fase
Próxima ação
Pendência principal
Responsável
Proposta/contrato
Saldo/próxima parcela
Tarefa mais urgente
Progresso documental
Última atualização
[Abrir visão do cliente]
```

Abaixo da dobra, usar abas ou seções para:

```text
Jornada
Documentos
Pesquisa
Propostas
Contratos
Financeiro
Onboarding e Cadências
Atualizações
```

Não colocar Modo Proprietária, Auditoria, Governança, Reconfirmar Propriedade, Aprovações ou qualquer elemento de bloqueio no mockup.

## Mockup essencial: Onboarding completo

O mockup de Onboarding/Cadências deve ter:

```text
Cenário do cliente
Serviço/produto contratado
Jornada atual
Checklist de coleta inicial
Próxima tarefa
Cadência de comunicação
Histórico de contatos
Pendências do cliente
Pendências internas
Data da próxima atualização
```

Não reduzir o mockup a uma timeline D+0/D+1/D+15. Mostrar uma jornada que percorre entrada, coleta, primeira entrega, pendências, execução, atualizações recorrentes, conclusão e continuidade.

## Mockup essencial: Marketing conectado

O mockup de Marketing deve mostrar:

```text
Origem
Campanha
Lead
Interesse/país/objetivo
Estágio
Responsável
Próximo contato
Última atividade
Proposta vinculada
Cliente/caso convertido
Receita atribuída quando houver
```

Não criar dashboard com números fictícios que pareçam métricas reais. Dados demonstrativos devem ser marcados como “exemplo visual”.

## Entrega esperada

1. Um arquivo/projeto de design com as telas organizadas por ambiente.
2. Uma página de índice com o mapa de navegação.
3. Nomeação padronizada:

```text
LP-01_Abertura_App
LP-02_Acesso_Cliente
APP-01_Inicio
APP-02_Jornada
APP-03_Documentos
APP-04_Descobertas
APP-05_Propostas_Contratos
APP-06_Financeiro_Conta
APP-07_Perfil_Ajuda
DESK-01_Hoje
DESK-02_Marketing
DESK-03_Comercial
DESK-04_Casos_360
DESK-05_Pesquisa
DESK-06_Contratos_Financeiro
DESK-07_Cliente_Cadencias
DESK-08_Configuracoes_Equipe
```

4. Notas curtas de cada tela indicando rota esperada, dados de origem e ação principal.
5. Nenhuma alegação de funcionalidade sem integração real ao Supabase.
```

---

# Ordem recomendada na fila

```text
1. Revisões R00–R07 e recuperação de acesso da proprietária.
2. P01 — Visão única de produto e fluxos reais.
3. P02 — Revisão visual e funcional de App Cliente + Desk.
4. P05 — Mockups tela a tela, usando P01/P02 como referência.
5. P03 — Landing pública de abertura.
6. P04 — Landing de acesso do cliente.
```

> As landings e mockups não substituem os motores reais. Elas só devem apontar para rotas existentes e ações que possam ser executadas de verdade.