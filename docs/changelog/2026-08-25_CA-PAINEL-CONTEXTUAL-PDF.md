# 2026-08-25 — Painel contextual da cadeia da jornada — prévia de PDF somente leitura

- **Merge de `origin/main`**: incorpora o trabalho já feito no Lovable
  (commits `gpt-engineer-app[bot]`) em `src/lib/cadeia-jornada-pdf.ts`
  (novo), `src/lib/cadeia-jornada-visao.ts` e
  `src/components/desk/cadeia-jornada.tsx` — sem conflito com o trabalho
  desta sessão (arquivos não se sobrepõem).
- **Inspeção confirmada**: `resumoTextoPainelContextual` já reunia motivo,
  evidências, próxima ação, pontuação do melhor ajuste e os 11 elos em
  texto simples; botão "Copiar resumo" já usava
  `navigator.clipboard.writeText` com fallback acessível (`try/catch` →
  mensagem em `role="status" aria-live="polite"`); "Gerar PDF somente
  leitura" já abria a prévia em diálogo modal com `<iframe srcDoc=...>`
  usando a mesma função (`htmlImpressaoPainelContextual`) que a impressão;
  "Fechar" já devolvia o foco ao gatilho; Escape e o trap de Tab/Shift+Tab
  já cobriam tanto o drawer por elo quanto a prévia.
- **Testes de regressão adicionados** em
  `src/lib/__tests__/cadeia-jornada-painel-contextual.test.ts` (23 testes
  no arquivo, todos novos além dos 4 pré-existentes): conteúdo do resumo
  em texto simples, uso do clipboard e do fallback, região `aria-live`,
  diálogo com iframe usando o mesmo documento da impressão, restauração de
  foco, Escape/Tab em ambos os diálogos, e ausência de `fetch`/`supabase`/
  `insert`/`update`/`createServerFn` tanto no componente quanto no gerador
  de PDF.
- **Verificação**: `tsc --noEmit` limpo · suíte completa 1297/1297 · `vite
  build` verde (Cloudflare Workers).

Nenhuma escrita de dado, ação externa, migration, alteração de RLS ou
deploy. A impressão usa só a janela de impressão nativa do navegador
(`window.print()`); nenhum envio de rede em nenhum ponto do fluxo.
