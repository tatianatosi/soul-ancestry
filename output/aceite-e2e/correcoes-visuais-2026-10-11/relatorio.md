# Correções visuais — 11/10/2026

- Rascunho: drft_01m4kn1q40ebyrm1knr10nzrdb; nenhuma integração ou publicação.
- SHA observado após alterações: 47e5407fd069ab17b011e38bf305d6bd786fcd51.
- Ambiente: localhost:8080, Chromium, sessão administrativa da proprietária, caso a11a0000-0000-4000-8000-000000000002.
- App conferido pela rota /app-cliente-como-pessoa?casoId=a11a0000-0000-4000-8000-000000000002.

## Alterações

1. src/components/desk/heatmap-aderencia-pais.tsx: margem inferior e reserva lateral em desktop. Tabela do caso Ana não intersecta o botão Assistente por medição de retângulos; qualidade.png inspecionada.
2. src/components/portal/andamento-publicado.tsx: legenda substituída por “Como sua jornada está avançando”; barra por “Avanço da sua jornada”. Fórmulas preservadas.
3. src/routes/portal/legado.tsx: aviso padrão existente renderizado fora da condição de existência dos encontros, sem fabricar encontro. Texto jurídico preservado.

## Evidências e limites

- jornada.png, legado.png, conta.png: 1280×1800; mesma sessão/caso.
- qualidade.png: Radar Individual com caso Ana selecionado, 1280×1800.
- legado-375.png: 375×1800; sem overflow horizontal.
- Cinco imagens inspecionadas. Nenhum erro JavaScript capturado.
- 16 testes existentes passaram; compilação da plataforma: build OK em 00:49:57 UTC.
- A assinatura continua R$320 por mês, aguardando confirmação. Não acrescentada condição familiar fixa: fonte publicada consultada pela interface não comprova três assinaturas/parcelas. Requer reconciliação da condição pela responsável pelas fontes financeiras.
- A rota administrativa do App não contém ficha civil ou CaseHealthHero. Ausência de dados civis no App não comprova mascaramento do Hero do Desk; requisito BLOQUEADO_POR_FONTE_DE_EVIDENCIA.
- Não comprovados login cliente, isolamento A×B, persistência de escrita ou aprovação operacional.
- Nenhuma tabela, regra de negócio, rota, dado, teste ou dependência alterada.