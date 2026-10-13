# Diretiva Executiva: Resposta e Desbloqueio das Ordens para o Claude Code

```yaml
status: aprovado
versao: v1.0
data: 2026-10-13
hora: 12:45 BRT
responsavel_pela_decisao: Tatiana Melani Tosi (Proprietária do Clube Ancestral)
classificacao: resposta de autoridade técnica, saneamento de contradições e desbloqueio do claude code
caminho_no_repositorio: docs/relatorios/2026-10-13-resposta-desbloqueio-claude-code.md
fontes:
  - AGENTS.md (Regra canônica das 7 abas do App Cliente)
  - entrega-1-sistema-visual-app-home.test.ts (Tokens visuais travados por teste)
  - Prancha Visual Desk V4 (11 Telas de Aprovação)
escopo: >
  Instrução executiva para responder diretamente às duas objeções levantadas pelo Claude Code,
  ratificando os tokens oficiais, mantendo a estrutura canônica das 7 abas e orientando a priorização do Desk.
premissas:
  - Os tokens HEX travados no teste devem ser rigorosamente preservados (#13294B, #C2A84D, #F0EEE9, #9A3A2F);
  - As 7 abas do App Cliente são as oficiais do AGENTS.md: Home, Jornada, Radar, Árvore, Documentos, Legado e Conta;
  - O PR #147 não é responsável pelas falhas pré-existentes de conta.tsx e marcos-jornada.functions.ts.
criterio_de_aceite: >
  Texto de resposta conciso e imperativo para ser colado no terminal do Claude Code.
```

---

## Mensagem Oficial para Colar no Claude Code:

```markdown
Perfeito. Sua postura técnica está corretíssima em proteger os testes travados e a governança do AGENTS.md. 

Aqui estão as deliberações oficiais da Proprietária para destravar o seu trabalho imediatamente:

### 1. Paleta de Cores: PRESERVAR OS TOKENS TRAVADOS
- Mantenha estritamente os tokens já protegidos por `entrega-1-sistema-visual-app-home.test.ts`:
  - `--navy: #13294B`
  - `--gold: #C2A84D`
  - `--cream: #F0EEE9`
  - `--terracotta: #9A3A2F`
- Não altere nenhum token HEX no código e não quebre a suíte de testes unitários.

### 2. Estrutura do App Cliente: AS 7 TELAS CANÔNICAS DO AGENTS.md
- A estrutura do App Cliente permanece 100% fiel ao AGENTS.md e às rotas reais já existentes em `src/routes/portal/`:
  1. **Home** (`/portal`)
  2. **Jornada** (`/portal/jornada`)
  3. **Radar** (`/portal/radar`)
  4. **Árvore** (`/portal/arvore`)
  5. **Documentos** (`/portal/documentos`)
  6. **Legado** (`/portal/legado`)
  7. **Conta** (`/portal/conta`)
- Nenhuma rota será renomeada ou criada a mais. Biblioteca e acervo continuam vivendo harmonicamente dentro de Legado/Documentos, como já homologado.

### 3. Sobre o CI do PR #147:
- Ciente e registrado que as 2 falhas (`conta.tsx` e `marcos-jornada.functions.ts`) são pré-existentes no `main` e externas ao seu diff. Seu comentário de não-responsabilidade no PR está validado.

### 4. Ordem de Execução Agora:
Com essas duas premissas blindadas (paleta preservada e 7 telas canônicas mantidas), aplique o ajuste estético exclusivamente no **Desk Intelligence** para aproximá-lo da **Prancha V4**:
- Topbar limpa com a busca global `[ 🔍 Buscar caso, pessoa ou documento ]` e avatar `[ TT Tatiana Tosi ˅ ]`.
- Régua de pílulas horizontais navegáveis.
- Elimine a duplicação do cabeçalho "Hoje" e o bloco azul escuro pesado que subiu no mobile (375px).

Pode prosseguir com a branch de visual do Desk.
```
