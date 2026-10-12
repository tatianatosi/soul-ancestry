# Parecer Técnico: Divergência de Asserção no Teste do Radar e Governança de CI

```yaml
status: aprovado
versao: v1.0
data: 2026-10-12
responsavel_pela_decisao: Proprietária do Clube Ancestral
classificacao: relatório técnico de qualidade e governança de CI
caminho_sugerido_no_repositorio: docs/auditorias/2026-10-12-parecer-ci-teste-radar.md
fontes:
  - Repositório GitHub tatianatosi/soul-ancestry (main)
  - PR #142 (docs(mapa): mapa do App Cliente gerado pelo Cartographer)
  - Arquivo de teste: src/lib/__tests__/radar-reconciliado-6-app-4-desk-2026-10-03.test.ts (linha 154)
  - Componente de rota: src/routes/portal/radar.tsx (commit 8590797 do Lovable)
  - Log de execução de CI (typecheck-and-test)
escopo: >
  Análise da quebra do CI no teste do Radar na branch main herdada pela PR #142,
  com comprovação da causa-raiz, preservação da intenção de design e orientação de resolução.
premissas:
  - A PR #142 apenas adiciona o arquivo docs/CODEBASE_MAP.md (sem alterações em código-fonte de aplicação).
  - A falha é determinística e foi introduzida no main por commit anterior do Lovable (8590797).
  - O componente src/routes/portal/radar.tsx adotou novo padrão de disclosure visual sem data-radar-calculo.
criterio_de_aceite: >
  Identificação precisa da linha defasada no teste de regressão;
  orientação normativa para ajuste da asserção em PR isolada sem reversão do layout do Lovable.
```

## 1. Sumário do Incidente de CI

Na execução do fluxo automatizado `typecheck-and-test` da **PR #142** (que apenas insere `docs/CODEBASE_MAP.md`), foi identificada uma falha determinística de teste unitário:
- **Arquivo com falha**: `src/lib/__tests__/radar-reconciliado-6-app-4-desk-2026-10-03.test.ts:154`
- **Asserção reprovada**: `expect(APP).toContain("data-radar-calculo");`
- **Causa Real**: O commit `8590797` (bot do Lovable em `main`), ao reformular o bloco visual de cálculo das 6 dimensões do Radar, removeu o atributo `data-radar-calculo` e a chamada textual estática `d.comoCalculamos`, delegando a exibição detalhada para o componente especializado `<RadarSeisEixos />`.
- **Origem da Falha**: A falha **não foi introduzida pela PR #142**; trata-se de herança de um estado defasado presente na própria branch `main`.

---

## 2. Análise Técnica da Defasagem

O teste `radar-reconciliado-6-app-4-desk-2026-10-03.test.ts` continha a seguinte rotina de inspeção estática no arquivo `src/routes/portal/radar.tsx`:

```typescript
it("a tela do cliente renderiza a conta", () => {
  expect(APP).toContain("data-radar-calculo");
  // 08/10/2026: virou disclosure (<summary>Como calculamos</summary>) no
  // Lovable; a conta continua visível ao cliente, agora recolhível.
  expect(APP).toContain("Como calculamos");
  expect(APP).toContain("d.comoCalculamos");
});
```

Contudo, a evolução do design no Lovable substituiu essa marcação inline pelo componente isolado `<RadarSeisEixos dimensoes={dimensoes} />`, mantendo a integridade visual mas tornando o teste de string estática em `radar.tsx` incompatível.

---

## 3. Resolução Normativa e Próximo Passo

1. **Isolamento da PR #142**:
   - A PR #142 permanece íntegra em seu escopo de documentação de arquitetura.
2. **Correção em PR Separada (`fix/radar-test-assertion`)**:
   - Não reverter o código visual gerado pelo Lovable em `src/routes/portal/radar.tsx`.
   - Ajustar a asserção no arquivo de teste (`radar-reconciliado-6-app-4-desk-2026-10-03.test.ts`) para validar a presença do componente `<RadarSeisEixos />` ou inspecionar o próprio componente `<RadarSeisEixos />` onde o cálculo é renderizado.
3. **Comando de Liberação**:
   - Abrir branch isolada: `git checkout -b fix/test-radar-seis-eixos-assertion`.
   - Atualizar a asserção do teste.
   - Submeter PR para restabelecer a barra verde completa no `main`.
