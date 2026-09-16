# Regras de uso — obrigatórias

1. **Cor somente por token.** Nenhum hex literal em componente de tela.
   Exceção documentada: e-mail transacional, PDF e SVG gerado, que usam
   `src/lib/marca.ts` porque não aceitam CSS custom property.

2. **Selo sempre com texto**, nunca só cor:
   - azul — em andamento
   - dourado — aguardando
   - verde — concluído
   - terracota — vencido / atenção
   - cinza — ausente

3. **Máximo de quatro KPIs por superfície**, cada um com **fonte, fórmula e
   período** visíveis, e estado vazio explícito.

4. **Gráfico só com dado real.** Sem série sintética, sem gráfico decorativo,
   sem placeholder ilustrativo.

5. **Estado vazio com frase honesta** e no máximo **uma** ação válida.
   "Sem informação" não é estado: usar aguardando / pausado / encerrado /
   cancelado / não registrado.

6. **Navegação congelada.** App Cliente: exatamente **7 abas**
   (Home · Jornada · Radar · Árvore · Documentos · Legado · Conta).
   Desk: **6 grupos** e **15 superfícies internas**. Rota profunda não vira aba.

7. **375 px em uma coluna, sem overflow horizontal.** Alvo de toque mínimo
   `--ca-touch-target` (44 px) e respeito à área segura (`--ca-safe-*`).

8. **Um CTA principal por estado.** Ações secundárias em peso discreto.

9. **Salvar nunca publica.** Publicar é ato separado, explícito e auditado.

10. **Contrato em leitura contínua.** Partes, escopo, condição, texto, anexos,
    OS, validação jurídica, assinatura e histórico em sequência legível —
    nunca fatiado em abas ou modais.

## Anti-padrões

- Criar um nono grupo no Desk ou uma oitava aba no App.
- Criar mais uma versão de Cartão/Selo/KPI/Vazio/Tabela/Gráfico/Timeline.
- Usar cor como único portador de significado.
- KPI sem fonte/fórmula/período; gráfico sem dado.
- Nome técnico de tabela no fluxo principal (só em "Detalhes técnicos").
- Dado de teste/DEMO sem rótulo, ou dentro de métrica real.
- Juízo de mérito do caso em superfície do cliente.
