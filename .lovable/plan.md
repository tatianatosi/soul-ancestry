# Pesquisa do caso + Biblioteca (acervo e fila editorial)

Apresentação e leitura apenas. Nada de banco novo, migration, RLS, deploy ou dado fictício. Comercial, Caso/Planejador, contratos, financeiro, Portal e App ficam intocados.

## O que muda

### 1. Pesquisa (`/golive/pesquisa`) — pesquisa do caso canônico
Cadeia visual em seis passos: Pergunta › Fonte › Evidência › Achado › Revisão › Publicação.

Três blocos analíticos, nessa ordem:
1. **Cobertura por fonte** — evidências agrupadas por tipo/origem, separando validada e em revisão.
2. **Produção de evidência** — fontes, evidências e achados por semana (últimas 7 semanas, com seletor de período).
3. **Fila editorial do caso** — rascunho, revisão, aprovado, publicado.

Cards de linha de pesquisa mostram só: pergunta, fonte, evidência, confiança, responsável e estado real. Achado nunca atualiza árvore nem App: fica marcado como hipótese até revisão humana.

Sem dados: "Nenhuma linha de pesquisa aberta" e um botão que leva à tela dona da ação. Onde já existe registro de fonte/evidência/achado no motor atual, o botão continua igual — não crio escritor novo.

### 2. Biblioteca (`/golive/biblioteca`) — acervo e fila editorial
Tela nova de leitura, com aviso explícito de que é acervo da organização, não segundo motor de pesquisa (não há filtro por caso, não há cadeia de achado).
- Acervo: itens do repositório mestre por categoria e situação de vigência.
- Fila editorial: contagem e lista por estado (ideia/pauta, rascunho, em revisão, aprovado, publicado).
- Estados vazios canônicos e CTA apenas de navegação.
- Entrada no menu do shell, depois de Pesquisa.

## Fontes de dados (já existentes)
- `research_cases` → objetivo, situação, confiança, próxima ação (pelo `case_id` canônico).
- `research_sources` → título, tipo, situação, instituição.
- `research_evidence_items` → tipo, estado (`collected`/`under_review`/`validated`/…), confiança, responsável, datas de criação/revisão/validação.
- `research_hypotheses` → perguntas e grau de confiança.
- `genealogical_findings` → achados e estado de validação (hoje sem linhas → estado vazio).
- `editorial_content_items` → fila editorial (filtra `is_demo = false` e não arquivado).
- `master_library_items` → acervo (não arquivado).

Filtros sempre por identificador: `organization_id`, `case_id`/`research_case_id`, `archived_at is null`. Nunca por texto ou nome.

## Cálculos
- Cobertura por fonte: contagem de evidências por `evidence_type`/origem, quebrada em validada (`validated`) × em revisão (`collected`, `under_review`).
- Produção semanal: contagem por semana (segunda a domingo, horário local) de fontes, evidências e achados criados.
- Fila editorial: agrupamento por `status`, mapeado para rascunho / revisão / aprovado / publicado; estados fora do mapa aparecem como "Outros".
- Data de referência injetável nas funções temporais, no mesmo padrão já usado em Hoje/Kanban.

## Detalhes técnicos
- `src/lib/golive.functions.ts`: ampliar o retorno de pesquisa (datas, responsável, estado de revisão) e adicionar leitura de acervo/fila editorial por organização.
- `src/lib/golive-pesquisa.ts` (novo): funções puras de cobertura, produção semanal e fila, com testes em `golive-pesquisa.test.ts`.
- `src/routes/_authenticated/golive.pesquisa.tsx`: reescrita de apresentação com os três blocos e a cadeia de seis passos.
- `src/routes/_authenticated/golive.biblioteca.tsx` (novo) e link no `shell.tsx`.
- Reuso de `Barras`/`Linha` em `src/components/golive/graficos.tsx`; gráfico adicional só se a fonte já entregar o dado.

## Entrega
Preview navegável, screenshots desktop e 375 px de Pesquisa e Biblioteca, tabela de fontes/cálculos e lista de estados vazios. `tsgo` e build rodados. Sem commit, push, merge ou publicação. Paro para revisão.

## Observação sobre os dados reais de hoje
Existem 5 fontes, 4 evidências e 5 hipóteses no banco; achados genealógicos estão em zero, então esse passo da cadeia vai aparecer como estado vazio. A fila editorial tem 15 itens, todos em "pauta aprovada" — os demais estados ficarão vazios.
