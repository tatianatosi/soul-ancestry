# Radar & Matrizes do Desk

Conectar apenas a tela Radar do shell de go-live aos dados que já estão gravados por caso. Nenhuma outra tela do Desk e nada do App Cliente são tocados.

## O que a tela passa a mostrar

**1. Matriz urgência × prontidão**
Um ponto por caso da carteira autorizada (hoje o Radar mostra só um caso). Cada ponto recebe número e o nome do caso aparece na legenda numerada abaixo do desenho, para não haver rótulo sobreposto. Quando dois casos caem quase no mesmo lugar, o ponto é deslocado levemente e o nome continua na lista.

**2. Radar individual de 4 eixos**
Para o caso selecionado na matriz (o do piloto vem selecionado). Quatro eixos internos: formalização, pagamento, documentos mínimos e próxima ação. Sem percentual jurídico e sem qualquer leitura de elegibilidade.

**3. Ordem de atendimento**
Lista ordenada com a regra curta escrita na tela (prazo vencido primeiro, depois prioridade registrada, depois caso sem próxima ação, depois espera externa). Cada linha mostra responsável, prazo, próxima ação e alertas abertos, com link para o Caso 360.

## Regras

- Só carteira autorizada da organização: registros arquivados, demo, teste e homologação ficam fora da leitura, sem apagar nada.
- Sem dado suficiente, cada bloco exibe "Dados insuficientes para radar." e um caminho para o Caso 360.
- Nenhum número é inventado, estimado ou inferido: o que não estiver gravado aparece como pendente ou sem registro.
- Sem banco novo, sem migration, sem permissão nova, sem gravação, sem publicação em produção.

## Detalhes técnicos

- `src/lib/golive.functions.ts`: ampliar a leitura já existente da carteira (`crm_casos`, mesmos filtros `organization_id` + `archived_at IS NULL`) com campos já existentes na tabela — `titulo`, `fase`, `ativo`, `risco`, `responsavel_principal`, `proxima_acao`, `contrato_assinado`, `pagamento_confirmado`, `documentos_minimos_ok`, `aguardando_instituicao_externa` — e aplicar o mesmo saneamento de registro de teste usado nas demais superfícies. Somar contagem de alertas abertos por caso a partir de `case_alerts`, filtrada pelos ids da carteira.
- `src/lib/golive-radar.ts` (novo, cálculo puro): urgência a partir do prazo da próxima ação, prontidão a partir dos três marcos gravados, ordenação de atendimento e afastamento de pontos coincidentes. Data de referência injetável.
- `src/lib/golive-radar.test.ts` (novo): prazo vencido, hoje, +7, sem prazo, caso sem próxima ação, espera externa, pontos coincidentes e carteira vazia.
- `src/routes/_authenticated/golive.radar.tsx`: três blocos, seleção de caso na matriz, legenda numerada, estado vazio canônico e link para `/golive/caso`.

## Entrega

- Prévia navegável em `/golive/radar`.
- Screenshots autenticados desktop e 375 px.
- Tabela dos campos usados em cada eixo e em cada bloco.
- `tsgo`, build e os testes novos. Sem commit, push, merge ou deploy.
