# Sugestões visuais — CRM Vivo e Painel de Calls (uso diário)

Somente proposta visual para aprovação. Nada é alterado no Desk, no App (em pausa) ou nos dados; nada é publicado.

## O que será entregue
Um PDF de sugestões, com comparação "como está hoje" e "como ficaria" para cada tela, em computador (1280) e celular (375):

1. **CRM Vivo**
   - Hoje: página longa, com formulários empilhados até o rodapé.
   - Proposta: fila do dia no topo (quem precisa de ação hoje), ficha da pessoa ao lado ao clicar, e o fluxo em etapas curtas (Origem → Discovery → Próxima ação → Proposta → Passagem ao caso), uma etapa aberta por vez.
   - Cada resposta mostra de onde veio e seu estado (confirmada, sugerida, não registrada).
   - Um botão principal por etapa, com destino claro.

2. **Painel de Calls**
   - Hoje: cerca de 14 mil pixels de rolagem.
   - Proposta: modo "durante a call": roteiro SPIN em blocos recolhíveis, anotação rápida e campos do dicionário apenas quando forem úteis.
   - Ao terminar: resumo de revisão com o que vai para o CRM, pendências e próxima ação. Nada é gravado sem confirmação.

3. **Dicionários e listas como "alimento"**
   - Saem da tela principal e ficam num painel lateral de consulta.
   - Mostram para qual motor cada lista envia dados (Discovery, Proposta, Jornada), sem formulário solto.

4. **Padrões comuns**
   - Selos sempre com texto.
   - No máximo 4 indicadores por tela.
   - Vazio honesto ("Não registrado").
   - Celular em uma coluna, sem rolagem lateral.

## Como será feito
- Partir das capturas reais de 18/10, já tiradas.
- Desenhar as propostas como imagens de referência (wireframes), com a paleta canônica: navy, ouro e creme, títulos em Cormorant e corpo em Montserrat.
- Usar apenas campos e listas que já existem no sistema, sem inventar dados.
- Salvar o PDF e as imagens em Arquivos, numa pasta datada.

## Detalhes técnicos
- Fontes lidas, somente leitura: as rotas do CRM Vivo e de Calls, o dicionário das calls e o glossário oficial, para listar os campos reais e seus leitores.
- Nenhuma edição em `src/`, nenhuma migration, nenhum draft e nenhuma publicação.
- Implementar qualquer item depois exige aprovação separada, por corte.
