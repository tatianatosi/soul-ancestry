# Resolução Oficial às 4 Dúvidas do Claude Sonnet e Desbloqueio da Branch

```yaml
status: aprovado
versao: v1.0
data: 2026-10-13
hora: 11:25 BRT
responsavel_pela_decisao: Tatiana Melani Tosi (Proprietária do Clube Ancestral)
classificacao: resolucao de bloqueios tecnicos, autorizacao de branch e definicao visual das 7 telas
caminho_no_repositorio: docs/prompts/2026-10-13-resposta-bloqueios-claude-sonnet.md
fontes:
  - Dúvidas Técnicas do Claude Sonnet (13/10/2026 10:44 BRT)
  - Mockup Normativo de 17 Páginas (clubeancestralmockup.pdf, Páginas 3 a 9)
  - relatorio-divergencias.md
escopo: >
  Resposta cabal aos 4 pontos levantados pelo Claude Sonnet:
  (1) Autorização formal de trabalho em branch isolada 'claude/portal-mockup-parity';
  (2) Fornecimento do descritivo visual completo das Páginas 3 a 9 do Mockup;
  (3) Tratamento de dados reais com vazio honesto e proteção rigorosa de PII;
  (4) Fatiamento do escopo tela a tela para revisão segura.
premissas:
  - Não commitar direto na main; usar branch 'claude/portal-mockup-parity' com PR em draft;
  - Não expor e-mail, telefone real ou dados sensíveis de menores em código aberto;
  - O Sonnet deve construir os containers visuais mantendo os loaders e o vazio honesto.
criterio_de_aceite: >
  Início imediato do trabalho pelo Claude Sonnet na branch autorizada;
  execução da Tela 1 (Home) e Tela 2 (Jornada).
```

---

## Mensagem Oficial de Resposta para Enviar ao Claude Sonnet

```markdown
RESPOSTA SOBERANA DA PROPRIETÁRIA — DESBLOQUEIO TÉCNICO (13/10/2026)

Respondendo pontualmente aos seus 4 bloqueios com total clareza e autoridade:

1. CONGELAMENTO E BRANCH:
- O congelamento foi LEVANTADO para o seu trabalho.
- VOCÊ ESTÁ AUTORIZADO a criar a branch `claude/portal-mockup-parity` e abrir a PR em DRAFT, sem merge direto em `main`. Isso protege o Lovable e a produção enquanto você coda.

2. O CONTEÚDO VISUAL DAS PÁGINAS 3 A 9 DO MOCKUP (clubeancestralmockup.pdf):
Como você não tem o PDF binário, aqui está o descritivo normativo exato do design aprovado:
- Página 3 (Home): Card editorial navy no topo com borda dourada, título do caso, 3 próximas ações em cards brancos destacados, pessoas conectadas com ícone dourado e grid de 2 colunas para achados históricos (ano em destaque dourado).
- Página 4 (Jornada): Linha do tempo em DUAS COLUNAS PARALELAS (Família/Ancestral à esquerda vs. Processo institucional à direita), conectadas por card terracota/bege de união e linhas douradas finas.
- Página 5 (Radar): Gráfico de teia amplo centralizado (70% da largura) e GRADE 2x3 para os 6 cartões de dimensão (Origem, Documentação, Pesquisa, etc.).
- Página 6 (Árvore): Moldura nobre central em painel branco, exibindo os 8 elos canônicos sem espaçamento vertical excessivo, com destaque dourado no foco.
- Página 7 (Documentos): Lista estruturada de 10 atos da cidadania com tags de estado ("Em busca cartorária", "Aguardando"), área de envio visível e cofre seguro sem botões falsos.
- Página 8 (Legado): Prateleiras de coleções com formato visual de cadernos/livros familiares com capas elegantes (crest/brasão).
- Página 9 (Conta): Ficha cadastral com iniciais, selo de membro, card do Projeto Familiar (3 assinaturas de R$ 320) e suporte oficial.

3. POLÍTICA DE DADOS, LGPD E VAZIO HONESTO:
- REGRA DE PII: PROIBIDO colocar e-mail, telefone real ou documentos de menores hardcoded no código.
- USE OS LOADERS EXISTENTES: O código deve ler os loaders reais de `src/data/` ou Supabase. Onde não houver dado real de volta, renderize o VAZIO HONESTO com mensagens acolhedoras e elegantes (ex.: "Acervo sob curadoria técnica", "Os membros terão seu lugar aqui quando compartilhados").
- O marco de 1895 de Graz vinculado a Otto Reimer é DADO HISTÓRICO REAL APROVADO, pode ser consumido.

4. ESCOPO FATIADO (COMECE PELA TELA 1 E 2):
- Não precisa fazer as 7 telas de uma vez só.
- Execute primeiro a TELA 1 (Home em `src/routes/portal/index.tsx`) e a TELA 2 (Jornada em `src/routes/portal/jornada.tsx`).
- Rode `npm run typecheck` e `npm run build`, e suba o commit na branch `claude/portal-mockup-parity`.

Pode criar a branch e começar agora!
```
