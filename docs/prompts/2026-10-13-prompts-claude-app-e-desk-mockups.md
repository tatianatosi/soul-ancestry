# Especificação de Prompts Claude: Alinhamento Minucioso App Cliente e Desk aos Mockups Canônicos

```yaml
status: aprovado
versao: v1.0
data: 2026-10-13
hora: 12:25 BRT
responsavel_pela_decisao: Tatiana Melani Tosi (Proprietária do Clube Ancestral)
classificacao: prompts de engenharia para claude, alinhamento tela a tela aos mockups
caminho_no_repositorio: docs/prompts/2026-10-13-prompts-claude-app-e-desk-mockups.md
fontes:
  - Prancha V4 Desk Intelligence & Ancestral Canvas (App Cliente)
  - Taxonomia Canônica do Mockup Aprovado (7 Telas do App + 6 Áreas do Desk)
  - docs/auditorias/2026-10-13-codigo-atualizado-menu-principal-desk.md
escopo: >
  Dois blocos de prompts executáveis, herméticos e minuciosos para serem colados no Claude Code / Lovable,
  forçando o alinhamento estético, estrutural e funcional do Desk e do App Cliente aos mockups oficiais.
premissas:
  - O App Cliente renderiza exatamente as 7 experiências aprovadas sem jargão ou travas internas;
  - O Desk opera sob a paleta Navy / Gold / Cream / Terracotta com 6 setores e abas contextuais;
  - Não são permitidos botões mortos, mensagens proibidas de gate cerimonial ou telas em branco.
criterio_de_aceite: >
  Prompts contendo requisitos detalhados de layout, design tokens, estados de dados e regras de interação.
```

---

## Bloco 1 — Prompt para o Claude Code: O App Cliente (Ancestral Canvas)

> **Instrução de uso:** Copie o bloco abaixo na íntegra e envie para o agente encarregado do App Cliente (`/portal` e rotas do cliente).

```markdown
# ORDEM DE ENGENHARIA DE INTERFACE: ALINHAMENTO DO APP CLIENTE AO MOCKUP APROVADO

Você atuará como Engenheiro de Produto Sênior no Clube Ancestral.
Sua missão é alinhar rigorosamente o App Cliente (rota `/portal` e sub-rotas do cliente) ao mockup canônico de 7 telas aprovado pela fundadora.

### 1. REGRAS DE DESIGN SYSTEM E PALETA (CANVAS)
- Fundo da aplicação: `bg-cream` (#FDFBF7 / warm light beige).
- Cores de destaque: `navy` (#1B2A4A para tipografia e cartões nobres) e `gold` (#C5A059 para realces de prestígio e marcos).
- Alertas e prazos: `terracotta` (#C85A32).
- Tipografia: Serifada editorial para cabeçalhos e boas-vindas; sem serifa límpida para dados.

### 2. AS 7 TELAS CANÔNICAS DO APP CLIENTE
Você deve garantir que o cliente navegue fluidamente entre estas 7 seções contextuais:
1. **Home (Boas-vindas & Visão Geral):** Card de destaque com o status atual do processo familiar, barra de progresso suave, próximo marco e canal direto com a consultora.
2. **Jornada (Linha do Tempo):** Timeline elegante com marcos do caso (ex: Áustria §58c). Itens concluídos, em andamento e futuros. NUNCA exibir termos como "bloqueado por gate", "NO_GO" ou travas de backoffice.
3. **Documentos & Cofre Familiar:** Lista limpa de certidões por titular (Ana, Adair, Alice, Felipe). Status claros: "Recebido", "Em análise", "Pendente envio". Upload facilitado sem jargão técnico.
4. **Radar de Elegibilidade:** Visão gráfica da linha de transmissão (jus sanguinis / reparação histórica) e marcos atingidos.
5. **Árvore Familiar & Linhagem:** Genograma visual ilustrando a ligação genealógica do ascendente europeu até os requerentes.
6. **Biblioteca & Acervo:** Arquivos históricos sanitizados, fotos restauradas e transcrições de certidões antigas.
7. **Legado & Pós-Cidadania:** Orientações sobre o passaporte europeu, registro consular e futuro dos filhos.

### 3. REGRAS INEGOCIÁVEIS DE HIGIENE
- PROIBIDO exibir SKUs internos (ex: `PACOTE-AT-01`), preços provisórios de planilha ou termos jurídicos litigiosos.
- A experiência deve ser acolhedora, humana e de alto padrão consultivo.
- Persistência: dados devem ser lidos do Supabase via rota canônica sem telas em branco.
```

---

## Bloco 2 — Prompt para o Claude Code: O Desk Intelligence

> **Instrução de uso:** Copie o bloco abaixo na íntegra e envie para o agente encarregado do Desk (`/painel`, `/casos`, shell e navegação interna).

```markdown
# ORDEM DE ENGENHARIA DE INTERFACE: ALINHAMENTO DO DESK AO MOCKUP PRANCHA V4

Você atuará como Arquiteto Front-End no Clube Ancestral.
Sua missão é consolidar a navegação e a experiência do Desk Intelligence estritamente alinhadas ao componente de Shell aprovado e à Prancha V4.

### 1. ESTRUTURA DO MENU LATERAL (SIDEBAR CANÔNICA)
A barra lateral fixa deve seguir a paleta Navy/Gold (`bg-navy` #1B2A4A, texto `text-cream`, seleção `bg-gold text-navy`) e implementar exatamente os 6 setores canônicos definidos em `SETORES_DESK_V5`:
1. **Hoje (`/painel`):** Visão do dia, Kanban operacional, Microentregas, Alertas, SLA e Exceções.
2. **Marketing & Comercial (`/leads`):** Aquisição, CRM Vivo, Discovery Calls, Propostas, Conversão.
3. **Pessoas & Casos (`/casos`):** Casos 360, Ficha de Pessoas, Núcleos Familiares.
4. **Inteligência & Pesquisa (`/pesquisa-modulo`):** Pesquisas em curso, Radar de Elegibilidade, Fontes Genealógicas, Acervo de Evidências, Devolutivas Externas.
5. **Formalização & Financeiro (`/contratos`):** Contratos Paramétricos, Matriz Jurídica, Ordens de Serviço, Financeiro Asaas.
6. **Governança & Administração (`/configuracoes`):** Configurações, Acessos Portal, Equipe (Admin), Catálogo Oficial, Integrações.

### 2. SUBNAVEGAÇÃO POR ABAS NO TOPO
- Ao selecionar um setor na barra lateral, o topo do Desk deve renderizar imediatamente as abas contextuais daquele setor (`data-desk-abas-setor`).
- O item ativo da aba deve ter sublinhado sólido em `border-gold font-semibold text-navy`.

### 3. POLÍTICA DE AUTORIDADE OPERACIONAL (SEM FALSOS BLOQUEIOS)
- A proprietária administradora tem autoridade total: o sistema deve aplicar o princípio "pendência informa, não impede".
- Nunca desabilitar botões essenciais com `disabled={true}` genérico. Se houver pendência interna, exibir aviso explicativo e permitir que a proprietária confirme a ação.
- Tratamento de erro: falha de rede ou dados vazios nunca devem ocultar componentes; renderizar feedback claro com estado de carregamento e tentativa de recuperação.
```
