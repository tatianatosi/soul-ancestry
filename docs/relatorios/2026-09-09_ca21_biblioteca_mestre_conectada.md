# CA21-BIBLIOTECA-MESTRE-CONECTADA — execução (09/09/2026)

## Achado

Mapeamento completo das 6 subáreas do objetivo (Acervo, Bases Genealógicas, Dicionários/Taxonomias, Trilhas, Modelos, Catálogo) contra os 4 domínios (Pesquisa, Contratos, Comercial, App) mostrou que **5 das 6 já estavam conectadas** a usos reais, de cortes anteriores:

- **Bases Genealógicas, Dicionários, Trilhas, Acervo e Jurídico → Pesquisa**: `referenciasNormativasDoCaso` + `ConsultaBasesHomologadas`, já em produção em `pesquisa-evidencias.$caseId.tsx`, já filtram por país/trilha do caso.
- **Catálogo (product_catalog) → Comercial**: extensamente conectado via `cadeia-operacional.server.ts` (SKU, preço, condição comercial).
- **Trilhas → Comercial/Leads**: `listarTrilhasJuridicas` já alimenta `trilha_referencia_id` em `leads.tsx`.

A única lacuna real: **Modelos F1/F2** (`master_library_items`, categoria `modelos`) nunca era lida por nenhuma tela de operação. Quem elabora um relatório de fase (F1 a F5, em `relatorios-fase.$caseId.tsx`) não tinha como ver qual versão de modelo está homologada na Biblioteca Mestre — a regra da própria subárea ("Relatório publicado precisa apontar para uma versão aprovada de modelo") não tinha onde se apoiar. `case_reports` não tem campo de vínculo com `master_library_items` — criar esse campo é mudança de schema, fora do escopo desta CA sem aprovação explícita.

## Alterado

`src/lib/relatorios-fase.functions.ts`: `painelRelatoriosFase` passa a ler `master_library_items` (categoria=`modelos`, não arquivado, escopado por organização) e retorna `modelosBiblioteca`. Nenhuma escrita nova.

`src/routes/_authenticated/relatorios-fase.$caseId.tsx`: nova seção somente leitura "Modelos F1/F2 homologados (Biblioteca Mestre)" — título, versão e situação de homologação de cada modelo — com link para a Biblioteca Mestre completa (`/biblioteca`). "Sem dado" declarado quando não há modelo cadastrado.

## Preservado

Nenhuma tabela, rota ou aba nova. Nenhuma cópia da tela cheia da Biblioteca Mestre — apenas o subconjunto "modelos" no ponto onde relatórios de fase são de fato elaborados. As conexões já existentes (Pesquisa via `referenciasNormativasDoCaso`/`ConsultaBasesHomologadas`, Comercial via `cadeia-operacional`/`leads.tsx`) não foram tocadas nem duplicadas — travadas por teste de regressão. Nenhum vínculo é gravado em `case_reports` (o campo não existe); a leitura é só referência para quem elabora o relatório.

## Testes

`ca21-biblioteca-mestre-conectada.test.ts` (7): `painelRelatoriosFase` lê `master_library_items` filtrado por categoria e organização, sem escrita nova; a rota renderiza o painel de modelos e linka para `/biblioteca`; "sem dado" declarado quando vazio; as conexões pré-existentes (Bases/Dicionários/Trilhas/Acervo/Jurídico em Pesquisa, Catálogo em Comercial, Trilhas em Leads) seguem intactas, sem duplicação. `npx tsc --noEmit` limpo. `npx vitest run --exclude '**/.claude/**'` — 205 arquivos, 1965 testes, todos passando. `npx vite build` — limpo.

## SHA

Commit único → main → recovery (ver mensagem de commit).

## Pendência

Vínculo estrutural entre relatório publicado e versão de modelo (campo em `case_reports`) exige migração de schema — fora do escopo desta CA sem aprovação explícita da proprietária. Não bloqueia CA22.
