# Auditoria de Pull Requests e Pendências Técnicas

```yaml
status: aprovado
versao: v1.0
data: 2026-10-12
responsavel_pela_decisao: Proprietária do Clube Ancestral
classificacao: relatório de auditoria e governança técnica de repositório
caminho_sugerido_no_repositorio: docs/auditorias/2026-10-12-auditoria-pendencias-prs.md
fontes:
  - GitHub API (tatianatosi/soul-ancestry)
  - PRs #142, #140, #139, #125, #123, #121, #120, #119, #118, #117
  - Commit HEAD main 9f2c08235c69c818b9c43c7d06fe76f6bf5d3fe2
  - docs/arquitetura/de-para-mockup-17-paginas-desk-v4-e-expurgo-passado.md (v1.2)
escopo: >
  Auditoria completa de pull requests abertas no repositório, validação
  de pendências técnicas impeditivas e direcionamento de governança.
premissas:
  - Branch main está no commit 9f2c082 (Lovable update: types.ts).
  - PRs #139 e #140 implementaram as orientações cirúrgicas autorizadas pela Proprietária.
  - PR #142 documentou o mapa do App Cliente via Cartographer.
criterio_de_aceite: >
  Quadro comparativo de todas as PRs abertas com indicação de ação recomendada (merge, fechar ou arquivar);
  confirmação de que não existem bloqueios técnicos no código do backend.
```

## 1. Sumário Executivo

A auditoria em tempo real no repositório `tatianatosi/soul-ancestry` identifica **9 Pull Requests abertas** no GitHub:
- **3 PRs Ativas Recentes (#142, #140, #139)**: Criadas pelo Claude Code conforme diretrizes da Proprietária. O backend está com 5.384 testes verdes.
- **6 PRs Legadas (#125, #123, #121, #120, #119, #118, #117)**: Criadas em meados de setembro/2026 via Cursor/agente externo, superadas pela Resolução Normativa da Proprietária (Seção 0 do De-Para v1.2) ou aguardando homologação visual da dona.

---

## 2. Quadro de Status das Pull Requests Abertas

| PR | Título / Escopo | Base | Head Branch | Status | Testes / Typecheck | Ação Recomendada |
|---|---|---|---|---|---|---|
| **#140** | `fix(db): sanitizar caracteres curinga em buscas ilike de clientes e contatos` | `main` (`7c5cc45`) | `fix/escape-ilike-wildcards` | Draft (Pronta) | 5.384 testes verdes (8 pulados) | **Pronta para Merge no main** |
| **#139** | `refactor(types): tipagem estrita de callbacks em painel-calls e hooks` | `main` (`7c5cc45`) | `feat/tipagem-painel-calls` | Draft (Pronta) | 5.384 testes verdes (8 pulados) | **Pronta para Merge no main** |
| **#142** | `docs(mapa): mapa do App Cliente (portal) gerado pelo Cartographer` | `main` (`9f2c082`) | `docs/cartographer-app-cliente` | Draft | Documentação pura (58 arquivos) | **Manter Aberto para Consulta / Merge Opcional** |
| **#119** | `Desk: sidebar canônica de 7 telas do mockup + limpeza §22` | `a00e574` | `cursor/sidebar-7-telas-mockup-2d77` | Draft (11/09) | **Superada pela Seção 0 do De-Para** | **Fechar (Desk tem 6 setores normativos)** |
| **#125** | `fix: --background/--card do :root nunca receberam o creme OKI aprovado` | `53416b5` | `fix/background-card-cor-oki-nao-aplicada` | Aberta (12/09) | 25 erros preexistentes da época | **Fechar ou Reavaliar Paleta** |
| **#123** | `Go-live: App Cliente mockup + marca OKI + caseId App↔Desk` | `f2892b5` | `cursor/app-cliente-preview-a5bc` | Draft (12/09) | Aguardava aprovação de marca | **Fechar / Arquivar** |
| **#121** | `Arquivar Planilha, SKU e conciliação só no GitHub` | `eda4a97` | `cursor/legado-arquivo-github-0ed5` | Draft (11/09) | Superada pelo De-Para v1.2 | **Fechar / Arquivar** |
| **#120** | `Caso 360: macro operacional (sem muro de pesquisa/financeiro)` | `6bd7f38` | `cursor/casos-360-macro-cenario-5722` | Draft (11/09) | Absorvida pela evolução do main | **Fechar / Arquivar** |
| **#118** | `fix(planejador): motor ponta a ponta — hidratar, fase, ativo e espelho` | `0b2e56c` | `cursor/motor-planejador-ponta-a-ponta-fced` | Draft (11/09) | Integrada via rotas golive | **Fechar / Arquivar** |
| **#117** | `Caso 360: cadeia legado → lista-alimento → planejador → App → WhatsApp` | `eda4a97` | `cursor/cadeia-caso-360-planejador-0ed5` | Draft (11/09) | Superada pelo De-Para v1.2 | **Fechar / Arquivar** |

---

## 3. Análise Detalhada das Pendências Técnicas

1. **PR #140 (Sanitização ilike)**: Concluída com êxito. Três pontos de escape aplicados em `golive.functions.ts`. Sem pendências.
2. **PR #139 (Tipagem e Hooks)**: Concluída com êxito. Elimina `: any` em callbacks e estabiliza `useEffect` no portal. Sem pendências.
3. **PR #142 (Cartographer)**: Documentação viva. As notas sobre faturas e eventos de acesso são melhorias mapeadas para a fase pós-piloto.
4. **Alinhamento Arquitetural**: O fechamento da PR #119 é fundamental para assegurar a autoridade dos 6 setores canônicos (`SETORES_DESK_V5`) aprovados no `de-para-mockup-17-paginas-desk-v4-e-expurgo-passado.md` (v1.2).
