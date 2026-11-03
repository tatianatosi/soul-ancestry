# Plano por fase — auditorias do Cartographer e do Understand até a execução (02/11/2026)

**Meta:** terminar as duas auditorias e executar o que elas apontarem, tabela por tabela, coluna por coluna e tela por tela. Nada vira "feito" sem evidência (teste, CI, grep do código).

**Regras que valem em todas as fases:** trabalhar só na branch `claude/*`; `git merge origin/main` antes de PR; sem migration, RLS, convite, publicação, merge ou deploy sem autorização explícita; sem tabela nova nem vocabulário CHECK novo.

## Estado de partida (02/11/2026, 14:40 UTC)

| Item                     | Estado                                                                                                |
| ------------------------ | ----------------------------------------------------------------------------------------------------- |
| Produção Lovable         | `/api/saude` com sha `9d9ed155` ("Main protegida e PR bloqueada", editor do Lovable); `bancoOk: true` |
| Coletor de erros         | na `main` (`337321f6`), grava em `audit_logs` com `acao='erro_app'`                                   |
| Vercel                   | os dois projetos pausados (`soul-ancestry`, `recriacao-do-clube-ancestral`); lançamento só no Lovable |
| Cartographer onda 1      | 2 de 5 relatórios prontos (documentos, infra)                                                         |
| Cartographer ondas 2 e 3 | 7 especialistas retomados às 14:40 UTC após o limite de uso                                           |

## Fase 1 — Cartographer, ondas 2 e 3 (CONCLUÍDA em 02/11/2026: 7 de 7 relatórios)

- **Entrada:** 7 especialistas: contrato-comercial, crm-leads-calls, pesquisa-genealogia, jornada-planejador-motores, golive-casos, app-cliente-portal, desk-telas.
- **Saída:** `.cartographer/reports/<segmento>.md` com tabela escritor→leitor→tela→estado, achados P0/P1/P2 e órfãos com ponto de religação.
- **Pronto quando:** os 7 arquivos existem e cada um tem a tabela e a lista de correções.
- **Se parar por limite:** reenviar só o que parou, por mensagem.

## Fase 2 — Cartographer, onda 1 que faltou (CONCLUÍDA em 02/11/2026: os 3 relatórios foram entregues)

- **Segmentos:** auth-sessao, persistencia-banco, banco-esquema-rls.
- **Quando:** só depois da fase 1 terminar, para não estourar o limite de novo.
- **Pronto quando:** os 3 relatórios existem. ✅ Entregues: `auth-sessao`, `persistencia-banco`, `banco-esquema-rls`. O de autenticação/sessão mostrou que o banco aceita a conta da Proprietária; a causa provável é a diferença entre a prévia do editor e a versão publicada, mais o vínculo de acesso que não era refeito.

## Fase 3 — Síntese e triagem

- Rodar `synthesize.py` do Cartographer; gerar `FINAL_REPORT` e o backlog ordenado.
- Triagem (portão D): cada achado vira um de três destinos: corrigir agora, decisão da Proprietária, ou falso positivo (com a prova).
- **Pronto quando:** backlog com dono, arquivo exato e teste previsto por item.

## Fase 4 — Understand de novo e matriz do grosso

- Regerar grafo, classificação e órfãos (`scripts/gerar-grafo.mjs`, `scripts/classificar-arquivos.mjs`).
- Rodar `scripts/reconciliar-codigo-banco.mjs` e montar a matriz tabela → quem lê → quem escreve → tela, listando colunas NOT NULL sem escritor e colunas nunca lidas.
- **Pronto quando:** a matriz cobre as 195 tabelas e cada lacuna entra no backlog da fase 3.

## Fase 5 — Correções, um PR pequeno por tema, nesta ordem

1. **Autoridade e sessão:** o que impede salvar/publicar para a admin (resultado do relatório de desk-telas e de auth-sessao).
2. **Escritas quebradas:** valor fora do CHECK, coluna inexistente, UPDATE de 0 linhas, erro engolido.
3. **Documentos:** curadoria antes de liberar ao cliente, validação de `storagePath`, filtros `is_demo` que nunca agem, `STATUS_DOCUMENTO` sem `pendente_de_revisao`, regra de hooks em `components/privacidade/painel.tsx`.
4. **Órfãos de família:** religar os 7 módulos nos pontos que a fase 1 apontar.
5. **Infra:** CI que barra de fato, job `Supabase Preview` (aponta para o banco antigo), limpeza dos restos da Vercel.

Cada PR: teste novo que falha antes e passa depois, `tsc` e vitest limpos, CI verde, e a trava de reconciliação código × banco.

## Fase 6 — Publicação e leitura de erros reais

- Merge e publicação pela `/lancar`, **só com a autorização da Proprietária a cada rodada**.
- Depois de publicado, conferir `/api/saude` (sha e `bancoOk`) e ler as linhas `erro_app` de `audit_logs`; cada erro vira correção pelo arquivo exato.

## Fase 7 — Lançamento com um cliente (Ana, `CA-CID-AT-FAM-2026-001`)

- Pré-checagens: divergência de contrato (`crm_casos.contrato_assinado=true` × contrato `pending_data`) e curadoria dos 3 documentos já liberados.
- Criação do acesso ao portal (`client_portal_case_access`) e convite: ato da Proprietária, na sessão dela, depois do "pode".

## Fora do alcance do Claude (precisa da Proprietária)

- Proteger a `main` no GitHub (configuração do repositório).
- Mudanças no banco: só pelo Lovable e com autorização.
- Texto do conhecimento do projeto no Lovable (limite de 10.000 caracteres; decidir o que cortar).

## Revisão de 02/11/2026 (pedido da Proprietária: "ainda faltou os relatórios pendentes")

**Os 12 relatórios do Cartographer existem** em `.cartographer/reports/` (pasta local da sessão, fora do git): documentos-storage-privacidade, infra-ci-sync, auth-sessao, persistencia-banco, banco-esquema-rls, contrato-comercial, crm-leads-calls, pesquisa-genealogia, jornada-planejador-motores, golive-casos, app-cliente-portal, desk-telas.

**O que de fato continua pendente nas auditorias**
1. **Síntese oficial (fase 3):** `synthesize.py` e o `FINAL_REPORT` do Cartographer não rodaram. O backlog em `BACKLOG-TAREFAS-AUDITORIAS-2026-11-02.md` é a síntese feita à mão.
2. **Understand de novo (fase 4):** grafo, classificação e a matriz das 195 tabelas não foram refeitos hoje.
3. **Áreas que os especialistas disseram não ter lido a fundo** (limite declarado nos próprios relatórios):
   - `crm-leads-calls`: `leads.tsx` (1.783 linhas), `painel-calls.tsx` (1.323), crm-mestre/ca04, varredura/templates-whatsapp, `portal-atendimento.functions.ts` inteiro.
   - `contrato-comercial`: rotas `contratos.*`, `financeiro.tsx`, `propostas.tsx`, `golive.comercial/financeiro`, `portal/faturas` e `portal/proposta`, `conciliacao-catalogo.server.ts`, eventos financeiros em `saas.functions.ts`.
   - `golive-casos`: Caso 360 (`casos.$caseId.index.tsx`, 5.226 linhas) e cerca de 25 funções de servidor do Caso 360, só varridas por coluna.
   - `jornada-planejador-motores`, `app-cliente-portal`, `desk-telas`, `pesquisa-genealogia`: banco vivo e navegador não consultados; CHECKs lidos das migrations.
4. **Achados dos 3 últimos relatórios que ainda não viraram tarefa:** ver a seção "Achados sem tarefa" do backlog.

