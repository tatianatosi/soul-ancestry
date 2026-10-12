# Checklist Executivo: Saneamento, Experiência do App Cliente e Desk v4

```yaml
status: aprovado
versao: v1.0
data: 2026-10-12
responsavel_pela_decisao: Proprietária do Clube Ancestral
classificacao: checklist operacional e matriz de prontidão de produto
caminho_sugerido_no_repositorio: docs/auditorias/2026-10-12-checklist-saneamento-desk-v4-app-cliente.md
fontes:
  - Prancha Visual Desk Intelligence v4
  - Mockup Canônico de 17 Páginas do App Cliente
  - Laudo pericial de auditoria relatorio.md (2026-10-11)
  - docs/arquitetura/de-para-mockup-17-paginas-desk-v4-e-expurgo-passado.md (v1.2)
  - Dossie-Consolidado-Ana-Luiza-CA-CID-AT-FAM-2026-001.pdf
escopo: >
  Auditoria e checklist unificado entre as 7 abas do App Cliente, as telas do Desk v4,
  o motor de saneamento e as pendências das jornadas ativas de 12/10/2026.
premissas:
  - Desk opera com 6 setores canônicos (SETORES_DESK_V5).
  - App Cliente preserva rigorosamente as 7 abas canônicas imutáveis.
  - Saneamento rigoroso: nenhum dado interno (token, role, custo, nota técnica) vaza para o cliente.
criterio_de_aceite: >
  Checklist exaustivo tela a tela confrontado com o mockup de 17 páginas e a prancha v4;
  roteiro de prompts para execução no Lovable e tarefas prioritárias do dia.
```

## 1. Matriz de Saneamento: Desk v4 vs. Projeção Sanitizada do App Cliente

O princípio fundamental da arquitetura do Clube Ancestral estabelece que o **Desk Intelligence v4 é a autoridade analítica e operacional**, enquanto o **App Cliente exibe exclusivamente projeções sanitizadas** aprovadas pela equipe:

| Eixo de Informação | Desk Intelligence v4 (Interno) | App Cliente / Portal (Sanitizado) | Status de Saneamento |
|---|---|---|---|
| **Elegibilidade / Viabilidade** | Notas de risco, histórico de cartórios, jurisprudência e hipóteses de busca. | Indicadores de progresso e lacunas honestas (sem promessa jurídica ou parecer formal). | **Homologado** |
| **Pesquisa e Acervo** | Registros paroquiais brutos, paleografia, transcrições em análise e conflitos de grafia. | Evidências autenticadas liberadas, certidões oficiais e linha genealógica confirmada. | **Pendente de liberação pelo pesquisador** |
| **Pessoas e Família** | Ficha completa, CPF, RG, endereços, notas civis e árvore em 7 gerações com fontes. | Árvore genealógica visual, nomes dos ascendentes diretos e dados essenciais da linhagem. | **Pendente de expurgo de genograma demo** |
| **Financeiro e Contratos** | Custo operacional, simulação de taxas Asaas, links de webhook e margem de serviço. | Cota familiar individual ativa (R$ 320/mês), parcelas pagas/a vencer e contrato do Estudo v2. | **Pendente de validação no Asaas** |
| **Comunicação / Notificações** | Roteiro SPIN, matriz de automação, gatilhos de escalonamento humano e logs. | Notificações acolhedoras, avisos de novos documentos e orientações da próxima etapa. | **Homologado** |

---

## 2. Checklist de Experiência do App Cliente (Confronto com Mockup 17 Páginas)

### Aba 1: Home (`/portal`)
- [ ] **Expurgo de Mocks**: Eliminação definitiva dos componentes `<BlocoExemploVisual />` e atributos `data-exemplo-visual`.
- [ ] **Régua da Jornada**: Renderização do stepper com as 10 etapas da jornada familiar (Etapa 1: Diagnóstico Concluído; Etapa 2: Formalização em andamento).
- [ ] **Identidade da Família**: Exibição dos 4 membros reais (Ana Luiza, Adair Pinto, Alice Gomes e menor Felipe).
- [ ] **Próxima Ação Real**: Card apontando para assinatura do contrato v2 direcionando para `/portal/conta`.
- [ ] **Selo Nobre**: Badge em Ouro Nobre (`#C2A84D`): "CIDADANIA AUSTRÍACA · § 58c StbG".

### Aba 2: Jornada (`/portal/jornada`)
- [ ] **Linha Ancestral**: Eixo do tempo com marcos de Graz (1895), Viena e imigração para o Brasil (1920).
- [ ] **Linha do Processo**: Etapas da montagem do dossiê, certidões brasileiras e protocolo em Viena (MA 35).
- [ ] **Conector Visual**: Marcação gráfica "União de Ramos" destacada em Ouro Nobre.
- [ ] **Limpeza de Debug**: Remoção do texto "Radar média dos eixos".

### Aba 3: Radar (`/portal/radar`)
- [ ] **Gráfico Hexagonal SVG**: 6 dimensões (Documentação, Origem, Conexões Familiares, Progresso Geral, Memória e Legado).
- [ ] **Honestidade de Dados**: Dimensões sem total conhecido exibem "Lacuna", nunca zero arbitrário.
- [ ] **Origem Geográfica**: Painel com destaque para Áustria (Graz e Viena).

### Aba 4: Árvore (`/portal/arvore`)
- [ ] **Cadeia Canônica G1 a G7**: Heinrich (G7) -> Rudolf (G6) -> Otto x Lotte (G5) -> Ana Maria (G4) -> Cleusa (G3) -> Adair (G2) -> Ana Luiza (G1) -> Felipe (G0).
- [ ] **Destaque G5**: Badge e moldura em Ouro Nobre para os antepassados perseguidos pelo regime nazista (§ 58c).
- [ ] **Expurgo Demo**: Remoção do genograma estático genérico.

### Aba 5: Documentos (`/portal/documentos`)
- [ ] **Triagem Visual**: Três seções claras (Solicitados à Família, Em Conferência/Busca e Liberados).
- [ ] **Visualização e Download**: Botão funcional para download do PDF do Estudo Genealógico e certidões.

### Aba 6: Legado (`/portal/legado`)
- [ ] **Cadernos de Memória**: Galeria com as biografias familiares e narrativas históricas de Graz e Viena.
- [ ] **Disclaimer Legal**: Rodapé obrigatório informando o caráter histórico e educativo do material.

### Aba 7: Conta (`/portal/conta`)
- [ ] **Assinatura Individual**: Exibição da cota de R$ 320,00/mês para o titular logado via Asaas.
- [ ] **Blindagem**: Sem telas de bloqueio de dependente para Adair e Alice.

---

## 3. Checklist do Desk Intelligence v4 (Confronto com Prancha Visual v4)

- [ ] **Navegação em 6 Setores**: Hoje, Marketing & Comercial, Pessoas & Casos, Inteligência & Pesquisa, Formalização & Financeiro, Governança & Administração.
- [ ] **Painel Hoje**: Expurgo da coluna "Sessão demo do App Cliente"; foco na fila prioritária de tarefas reais.
- [ ] **Caso 360**: Botão flutuante 'Assistente' reposicionado para não sobrepor o Heatmap M1–M6.
- [ ] **Mesa de Discovery**: Integração direta das notas da chamada com a emissão da proposta comercial.
- [ ] **Centro de Inteligência**: Painel de extração dos 8 países conectado ao acervo do caso.

---

## 4. Roteiro Consolidado de Tarefas de Hoje (12/10/2026)

```markdown
1. BACKEND & INFRAESTRUTURA (CLAUDE CODE)
   [x] PR #140: Sanitização de ilike concluída
   [x] PR #139: Tipagem de calls e hooks concluída
   [ ] Executar PR isolada fix/test-radar-seis-eixos-assertion para sanar o teste do Radar
   [ ] Retirar PR #139 e PR #140 de Draft e mesclar no main
   [ ] Fechar formalmente PR #119 e PR #123 (superadas)

2. FRONTEND & DESIGN SYSTEM (LOVABLE)
   [ ] Aplicar prompt de expurgo de BlocoExemploVisual e ajuste da Home (/portal)
   [ ] Renderizar stepper permanente de 10 etapas e cartões dos 4 membros familiares
   [ ] Atualizar links de Árvore e Jornada para o padrão visual canônico v4
   [ ] Homologar visualização nos viewports 375px (mobile) e 1280px (desktop)

3. OPERAÇÃO & FECHAMENTO PILOTO (TATIANA)
   [ ] Emitir no Desk o contrato final do Estudo Genealógico v2 da Ana Luiza
   [ ] Coletar assinaturas digitais de Ana Luiza, Adair Pinto e Alice Gomes
   [ ] Gerar os 3 carnês individuais de R$ 320/mês no Asaas
   [ ] Liberar o Magic Link oficial para analuizabox@gmail.com
```
