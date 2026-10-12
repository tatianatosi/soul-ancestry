# Auditoria visual autenticada — caso Ana Luiza

## Objetivo
Navegar no ambiente atual com a sessão autorizada de `tati@pluggedresearch.com`, capturar as dez superfícies solicitadas e emitir um relatório factual, sem alterar dados, permissões, rotas ou regras.

## Limite da evidência
- As imagens produzidas pelo agente serão identificadas como **inspeção administrativa autenticada**, não como `COMPROVADO_EM_USO` nem “prova oficial da Proprietária”.
- A prova oficial continua exigindo ação executada pela própria Proprietária, confirmação, releitura após F5/reabertura e integração quando aplicável.
- Cada item receberá somente um resultado permitido: `PASSOU`, `FALHOU`, `BLOQUEADO_POR_DADO`, `BLOQUEADO_POR_DECISAO`, `ERRO_DE_FONTE` ou `NAO_LOCALIZADO`.

## Execução
1. Restaurar a sessão autorizada no navegador sem registrar tokens, cookies ou outros segredos nas imagens e no relatório.
2. Abrir as rotas pedidas e confirmar em tela a identidade segura do caso canônico, sem expor dados civis desnecessários.
3. Capturar em `output/aceite-e2e/`:
   - `01-desk-painel-hoje.png` — `/painel`, quatro KPIs e ausência visual de dados DEMO no grid.
   - `02-desk-caso360-hero.png` — `/casos/CA-CID-AT-FAM-2026-001`, após eventual redirecionamento canônico, enquadrando o `CaseHealthHero` e verificando o mascaramento observável.
   - `03-desk-radar-heatmap.png` — `/qualidade`, aba Radar Individual, caso Ana selecionado, enquadrando o Heatmap de Aderência Operacional por País.
   - `04-portal-home.png` a `10-portal-conta-sem-upsell.png` — as sete rotas `/portal/*`, somente se a sessão tiver autorização real para o caso.
4. Nas rotas diretas do App, não criar acesso, não trocar identidade e não contornar a autorização. Se a conta master não tiver acesso cliente direto, registrar o resultado correspondente e usar `/app-cliente-como-pessoa?casoId=a11a0000-0000-4000-8000-000000000002` apenas como evidência administrativa complementar, claramente separada — nunca como substituta do login do cliente.
5. Fazer F5/reabertura de cada superfície para confirmar que o estado visual permanece; isso não converte a inspeção do agente em prova da Proprietária.
6. Conferir visualmente cada PNG para garantir rota/título legível, enquadramento correto, ausência de sobreposição e ausência de segredos.

## Critérios honestos de conformidade
- Não declarar “dados demo removidos” apenas porque não estão no recorte; conferir o grid renderizado e seus rótulos.
- Não declarar dados civis “mascarados” se o `CaseHealthHero` ou os campos civis não forem localizados.
- Não declarar evidências, relações, seis eixos completos ou assinatura ativa quando a fonte mostrar `Lacuna`, condição prevista ou ausência de dado.
- Na Conta, validar o texto real autorizado: `Condição familiar: 3 assinaturas / parcelas mensais`, com R$ 320/mês × 10 como condição prevista/aguardando confirmação; não afirmar cobrança ativa ou Asaas sem fonte confirmada.
- Na Árvore, ausência de relações publicadas permanece `BLOQUEADO_POR_DADO`; pessoas por geração não comprovam parentesco.

## Relatório
Gerar `output/aceite-e2e/relatorio-auditoria-visual.md` com, para cada um dos dez itens: arquivo, data/hora UTC, ambiente, rota inicial e final, sessão usada, objeto observado, resultado permitido, evidência visível, divergência ou bloqueio e limite da inspeção.

O relatório terminará declarando que código, build, teste, preview e capturas do agente não substituem a prova visual executada pela Proprietária e que nenhum contexto foi arquivado.