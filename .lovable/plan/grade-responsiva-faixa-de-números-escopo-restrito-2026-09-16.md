# Grade responsiva + faixa de números (escopo restrito)

Somente apresentação. Nenhum dado criado, nenhuma publicação, nenhum envio, nenhum convite ou link mágico, nenhuma alteração de banco, RLS, migration ou deploy. Ao final, para para revisão.

## Situação já verificada

- As oito telas do item 1 (`Hoje`, `Comercial`, `Kanban`, `Pesquisa`, `Financeiro`, `Jurídico`, `Radar`, `Portal`) já usam a grade e a faixa de números do Desk.
- As sete telas do item 2 (`Caso 360`, `Pessoa 360`, `Pessoas & Famílias`, `Leads`, `Microentregas`, `Formalização`, `Configurações`) hoje não usam grade nem faixa — a leitura sequencial já está preservada.
- A faixa de números já limita a quatro colunas e os selos já têm as cinco cores pedidas com texto visível.
- `Hoje` já mostra exatamente ativos, vencidas, sem próxima ação e aguardando externo.

Ou seja, o trabalho é de normalização e conferência, não de construção do zero.

## O que será feito

1. **Grade** — confirmar duas colunas no computador e uma no celular nas oito telas do item 1, corrigindo apenas onde houver bloco fora da grade ou coluna que estoure em 375 px.
2. **Faixa de números** — deixar exatamente os quatro números pedidos por tela, nesta ordem:
   - Hoje: ativos · vencidas · sem próxima ação · aguardando externo
   - Comercial: leads ativos · sem próxima ação · calls vencidas · propostas sem follow-up
   - Kanban: vencidas · hoje · próximos sete dias · aguardando externo
   - Pesquisa: perguntas abertas · fontes · evidências em revisão · achados aprovados
   - Financeiro: contratado · recebido confirmado · em aberto · vencido
   - Jurídico: em revisão · pendências formais · assinados · anexos pendentes
   - Portal: rascunhos · em revisão · publicados · acessos ativos
   - Radar: mantém a faixa atual, pois o item 3 não define conjunto para ela.
3. **Fonte real** — cada número vem do leitor que já existe para aquela tela. Se um número não tiver leitor real disponível, ele não é inventado: aparece como `Sem registros` e a lacuna é listada no relatório final, para decisão sua.
4. **Vazios honestos** — onde não houver dado, `0` ou `Sem registros`. Nenhum gráfico decorativo, série fictícia, pessoa, documento, pagamento, achado ou publicação é criado. Gráficos existentes que ficarem sem fonte real passam a mostrar o vazio, em vez de desenho vazio.
5. **Selos** — texto sempre visível, com o significado fixo: azul em andamento/interno, dourado aguardando revisão/decisão, verde concluído/confirmado/publicado, terracota vencido/bloqueado/atenção, cinza ausente/não aplicável/arquivado.
6. **Leitura sequencial preservada** — nada de grade nem faixa nas sete telas do item 2.
7. **Biblioteca Mestre** — não é criada nesta rodada. Fica registrada como lacuna, com a proposta dos seis cartões de entrada (Acervo, Bases Genealógicas, Dicionários, Trilhas Jurídicas, Modelos e Referências) para uma etapa posterior.

## Entrega

- Preview antes e depois, em computador e em 375/390 px, de `Hoje`, `Comercial`, `Pesquisa` e `Financeiro`.
- Tabela curta por tela: números exibidos, origem de cada número, o que ficou vazio e por quê.
- Lista das lacunas de fonte encontradas, sem correção automática.

## Detalhes técnicos

- Arquivos de apresentação: `src/components/golive/shell.tsx` (`GradeDesk`, `FaixaKpis`, `Selo`, `Vazio`) e as rotas `src/routes/_authenticated/golive.{index,comercial,kanban,pesquisa,financeiro,juridico,radar,portal}.tsx`.
- Leitores já existentes reutilizados sem alteração de regra: `golive-operacao.ts`, `golive-comercial.ts`, `golive-pesquisa.ts`, `golive-juridico.ts`, `golive-portal.ts`, `golive-radar.ts`, `golive-analitico.ts`.
- Nenhum writer, nenhuma função de escrita, nenhum schema, nenhuma política de acesso e nenhum arquivo de rota das sete telas excluídas são tocados.
- Verificação: tipos, testes existentes e build, além das capturas em 1280 px, 390 px e 375 px.
