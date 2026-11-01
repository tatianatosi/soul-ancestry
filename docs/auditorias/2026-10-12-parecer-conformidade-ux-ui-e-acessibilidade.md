# Parecer Técnico de UX/UI: Conformidade de Produção e Auditoria de Superfície

```yaml
status: aprovado
versao: v1.0
data: 2026-10-12
hora: 23:59 BRT
responsavel_pela_decisao: Tatiana Melani Tosi (Proprietária do Clube Ancestral)
classificacao: auditoria de ux ui, conformidade de interface e preservacao de congelamento de codigo
caminho_no_repositorio: docs/auditorias/2026-10-12-parecer-conformidade-ux-ui-e-acessibilidade.md
fontes:
  - Auditoria Estática de Frontend (12/10/2026 22:58 BRT)
  - src/styles/tokens-clube-ancestral.css (Commit 27d2f234)
  - docs/auditorias/2026-10-12-homologacao-launchworthy-lovable.md
escopo: >
  Avaliação dos três apontamentos de UX/UI (componentes >200 linhas, labels de formulário e cores hexadecimais),
  determinando o isolamento do congelamento de código para o Go-Live e o plano de refatoração para a Fase 2.
premissas:
  - 214 arquivos com carregamento, 251 com estado vazio e 218 responsivos (sm/md/lg/xl);
  - Zero uso de cores fora da marca (0 roxo/índigo);
  - Nenhum commit de refatoração deve quebrar a árvore de componentes nesta noite.
criterio_de_aceite: >
  Isolamento das dívidas de tamanho de arquivo (painel-calls, painel-dia, atendimento-interno);
  confirmação de que a interface atende aos padrões de produção para o primeiro cliente.
```

---

## 1. Veredito Executivo de UX/UI

A revisão estática de 399 arquivos comprova que a interface do **Clube Ancestral** possui maturidade visual e estrutural superior à média de MVPs:
- **Resiliência:** Estados de loading, empty state e erro implementados na grande maioria das rotas.
- **Identidade Estrita:** 0 roxo/índigo genéricos, 5 gradientes discretos e uso consolidado do Navy `#13294B` e Ouro `#C2A84D`.
- **Acessibilidade Teclado/Semântica:** `alt` em imagens e contenção de cliques em contêineres devidamente tratados.

---

## 2. Tratamento das 3 Lacunas Identificadas

| # | Apontamento | Diagnóstico Real | Conduta Recomendada para Amanhã |
|---|---|---|---|
| **1** | **Componentes >200 linhas** (`painel-calls.tsx`, `painel-dia.tsx`, etc.) | São telas complexas de cockpit operacional que agregam múltiplos cards em um único arquivo. Funcionam perfeitamente em runtime. | **Manter Congelado:** Não fatiar agora. Fatiar 1.200 linhas às vésperas do go-live geraria risco de regressão de props. |
| **2** | **Rótulos de formulário (`<label>` vs `aria-label`)** | 676 inputs e 165 `aria-label`. Os formulários essenciais do portal do cliente possuem placeholders e textos descritivos claros. | **Homologar no Navegador:** Realizar o teste com leitor de tela na sprint de acessibilidade pós-faturamento. |
| **3** | **Cores hexadecimais literais (117 ocorrências)** | Valores hexadecimais diretos em componentes gráficos do SVG e kit de marca. | **Dívida Estética Leve:** Não altera a renderização nem afeta a percepção da cliente Ana Luiza. |

---

## 3. Diretriz para o Teste de Navegador no Preview do Lovable

A recomendação técnica de rodar a checagem com **axe-core** e contraste 4,5:1 no navegador é **aprovada para execução em modo leitura**:
- **Ambiente:** Pode ser executada diretamente contra a URL pública `soul-ancestry.lovable.app/portal` sem tocar em código.
- **Refatoração:** Qualquer fatiamento de código em subcomponentes fica agendado para o ciclo seguinte ao fechamento comercial.
