# Compilado Executivo de Prompts em Ordem de Prioridade: Lovable e Claude (Dia D)

```yaml
status: aprovado
versao: v1.0
data: 2026-10-12
hora: 23:59 BRT
responsavel_pela_decisao: Tatiana Melani Tosi (Proprietária do Clube Ancestral)
classificacao: compilado de prompts prioritarios, esteira lovabe e claude code, paridade visual de mockups
caminho_no_repositorio: docs/prompts/2026-10-12-compilado-prompts-prioritarios-lovable-e-claude.md
fontes:
  - clubeancestralmockup.pdf (Mockup App Cliente — 17 páginas)
  - prancha-comparativa-desk-v4-12-rotas-1440-2026-09-24-4.jpg (Prancha Visual V4)
  - src/lib/portal-fallback-canonico.ts (Commit 9a61888f)
  - src/lib/portal-experiencia-integral.ts (Commit b1445240)
  - src/lib/saneamento-desk-app-v4.ts (Commit d0dc12db)
  - public/manifest.json (Commit 9b7477db)
escopo: >
  Compilado hierarquizado de prompts prontos para copiar e colar no Lovable e executar no Claude Code.
  Organizado por ordem estrita de prioridade, garantindo paridade visual idêntica de 100% das 17 páginas
  do App Cliente e das 12 rotas da Prancha Visual V4 do Desk, com segurança e UX/UI blindadas.
premissas:
  - O Lovable não deve tentar reescrever o backend nem recriar schemas de banco.
  - O Claude Code cuida das travas de compilação, rate limit e segurança no terminal.
criterio_de_aceite: >
  Zero telas em branco em todas as abas;
  paridade visual estrita com os mockups aprovados;
  execução modular sem perda de contexto prévio.
```

---

## 1. Regra de Ouro da Execução (Como Não Entrar em Loop)

1. **Nunca peça o app inteiro de uma vez ao Lovable:** O Lovable trunca o contexto quando recebe ordens de 17 telas simultâneas. Envie os prompts **exatamente na ordem de blocos prioritários abaixo**.
2. **O Claude atua no Terminal e o Lovable na Interface:** O Claude resolve código, imports e segurança (`git pull`, build e TypeScript). O Lovable apenas consome os módulos canônicos exportados no Git.

---

## 2. Compilado de Prompts para o LOVABLE (Frontend e UI/UX)

### Bloco 1 (Prioridade Crítica P0): Ativação dos Fallbacks Canônicos nas Abas Principais
*Objetivo: Eliminar telas em branco na Home, Árvore, Cofre de Documentos e Contrato.*

```markdown
ATUALIZAÇÃO DE PARIDADE VISUAL (P0): Consuma os módulos canônicos já existentes no projeto sem recriar tabelas ou rotas.
1. Em 'src/routes/portal/index.tsx' (Home): Importe 'REGUA_10_ETAPAS_CANONICA' de 'src/lib/portal-fallback-canonico.ts'. Renderize a régua de 10 fases da jornada §58c com 60% preenchido na Fase 4 (Curadoria em Graz) no tom ouro #C2A84D.
2. Em 'src/routes/portal/arvore.tsx': Importe 'ARVORE_CANONICA_PORTAL' de 'src/lib/portal-experiencia-integral.ts'. Renderize a linhagem multigeracional completa de Otto Reimer (7 pessoas) em cards elegantes com borda de 12px.
3. Em 'src/routes/portal/documentos.tsx': Importe 'COFRE_DOCUMENTOS_PORTAL'. Renderize os 5 cartões de certidões ativas com botões 'Ver Certidão' e 'Baixar PDF'. É PROIBIDO exibir mensagens de 'nenhum documento'.
4. Em 'src/routes/portal/conta.tsx': Importe 'CONTRATO_PORTAL_CANONICO'. Exiba a ficha formal do Contrato 2026-CB-0001 (3 assinaturas de R$ 320/mês × 10 meses) e botão para o WhatsApp 11 98838-4907.
Aplique agora mantendo o padrão visual Navy #13294B e Off-White #F8F9FA.
```

---

### Bloco 2 (Prioridade Alta P1): Paridade de 100% das 17 Páginas do Mockup
*Objetivo: Fechar a experiência integral das páginas secundárias (Legado, Relatórios e Suporte).*

```markdown
ATUALIZAÇÃO DE ROTAS COMPLEMENTARES (P1): Garanta a paridade estética com as páginas 10 a 17 do mockup oficial 'clubeancestralmockup.pdf':
1. Rota '/portal/legado': Renderize a narrativa biográfica da imigração de Graz para o Brasil com fotos em sépia/restauradas e cards de linha do tempo histórica da família Silveira Rodrigues.
2. Rota '/portal/radar': Desacople a legenda dos 4 eixos para fora do SVG, aplicando o layout aprovado com os responsáveis nominais (Dr. Klaus Becker em Graz, MA 35 e Tatiana Tosi).
3. Rota '/portal/relatorios': Exiba os cards para visualização do Relatório Fase 01 (Estudo Genealógico) e Fase 02 (Parecer de Elegibilidade §58c) com botão de download.
4. Rota '/portal/suporte': Adicione a central de concierge com botão de ação direta para o WhatsApp institucional e perguntas frequentes sobre os prazos de Viena.
Não altere a lógica de roteamento nem esconda abas na navegação mobile/desktop.
```

---

### Bloco 3 (Prioridade Média P2): Polimento Fino e PWA (Mobile e Desktop)
*Objetivo: Experiência nativa no celular sem overflow e suporte a tela cheia.*

```markdown
POLIMENTO FINO RESPONSIVO E PWA (P2):
1. Verifique a integração com 'public/manifest.json'. O app deve exibir a barra de navegação inferior no mobile (375px) com botões táteis de 52px de altura mínima e cabeçalho fixo no Navy #13294B.
2. Aplique a transição suave de fade (0.2s) entre as abas do portal para evitar saltos visuais na navegação.
3. Certifique-se de que nenhum card apresente rolagem horizontal (overflow-x) em telas compactas de iPhone e Android.
```

---

## 3. Compilado de Comandos e Prompts para o CLAUDE CODE (Terminal / Backend)

### Bloco A (Prioridade Crítica P0): Sincronização e Validação de Compilação
*Objetivo: Garantir que o repositório local e a branch main estejam perfeitamente sincronizados sem erros de build.*

```bash
# Executar no terminal do Claude Code:
git pull origin main
npm run build || npx tsc --noEmit
```

*Se houver qualquer divergência de tipagem, o Claude deve rodar o seguinte prompt:*
```markdown
Verifique a compilação TypeScript em 'src/lib/'. Confirme que 'src/lib/saneamento-desk-app-v4.ts', 'src/lib/portal-fallback-canonico.ts' e 'src/lib/portal-experiencia-integral.ts' estão exportando corretamente 'CASO_CANONICO_ANA_LUIZA' e as interfaces correspondentes sem nenhum erro de tipo. Garanta que o teste passe com 0 erros.
```

---

### Bloco B (Prioridade Alta P1): Blindagem de Rate Limit no Endpoint de IA Paga
*Objetivo: Fechar a vulnerabilidade [HIGH] apontada na auditoria de segurança em 'api/pesquisa-assistente.ts'.*

```markdown
PROMPT CLAUDE CODE — SEGURANÇA E RATE LIMIT:
Abra 'src/routes/api/pesquisa-assistente.ts' e implemente uma trava de rate limit para usuários autenticados:
1. Limite o uso a no máximo 15 requisições de IA por usuário por dia (janela de 24 horas).
2. Se o usuário atingir o teto de 15 chamadas, retorne HTTP 429 com mensagem amigável: 'Você atingiu o limite de consultas diárias do assistente genealógico. Novas consultas estarão disponíveis amanhã.'
3. Não altere o 'requireSupabaseAuth' nem exponha chaves secretas.
```

---

### Bloco C (Prioridade Alta P1): Prancha Visual V4 do Desk (12 Rotas Operacionais)
*Objetivo: Assegurar que as 12 telas administrativas do Desk V4 estejam mapeadas e protegidas contra telas vazias.*

```markdown
PROMPT CLAUDE CODE — DESK PRANCHA V4:
Abra 'src/lib/desk-modulos.ts' e 'src/routes/_authenticated/' para garantir a consistência das 12 rotas da Prancha V4:
1. '/painel' (Visão Geral Hoje): Deve ler as métricas operacionais e tarefas do dia sem quebrar com banco vazio.
2. '/casos.$caseId': A Ficha 360 deve consumir 'CASO_CANONICO_ANA_LUIZA' como fallback imediato para o caso piloto.
3. '/contratos': Assegure que a lista de instrumentos exiba o Contrato 2026-CB-0001 no status 'Aguardando Assinatura Gov.br'.
4. Garanta que nenhuma rota administrativa do Desk lance exceção não tratada na ausência de linhas no Supabase.
```

---

## 4. Ordem Cronológica de Execução para Amanhã

```
[08:00] Claude Code: git pull origin main && npx tsc --noEmit (Validação zero-erros)
   ↓
[08:15] Lovable: Aplicar Bloco 1 (Home, Árvore, Cofre e Contrato com fallbacks)
   ↓
[08:30] Lovable: Aplicar Bloco 2 (Legado, Radar e Suporte)
   ↓
[09:00] Comercial: Gerar as 3 assinaturas de R$ 320 no Asaas e assinar via Gov.br
   ↓
[09:15] Envio WhatsApp: Contrato Assinado + Links Asaas + Link do Portal do Cliente
```
