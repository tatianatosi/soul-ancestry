# Decisão de Navegação do Desk — 7 telas + 6 grupos internos

- **Status:** vigente (decisão da proprietária, 2026-09-11)
- **Versão:** v1.0
- **Fonte:** documento colado pela proprietária nesta data (mockup 17 páginas + taxonomia canônica; comparação visual 09/09; PRs #95–#101)
- **Escopo:** uma única face de navegação do Desk; não apaga módulos, dados nem rotas

## Decisão

**Não** usar 6 abas nem 8 grupos como face principal.

```text
FACE PRINCIPAL DO DESK (sempre visível)
1. Visão Geral
2. Casos 360
3. Checklist
4. Validação Jurídica
5. Radar Interno
6. Alertas
7. Biblioteca Mestre

CAMADA OPERACIONAL INTERNA (recolhida / contextual)
1. Hoje
2. Comercial
3. Casos & Pessoas
4. Pesquisa
5. Formalização
6. Governança
```

## Regras de implementação

1. Menu principal = as 7 telas acima (`FACE_PRINCIPAL_DESK` em `src/lib/navegacao-desk.ts`).
2. Os 6 grupos são metadados/submenus/contexto — **não** segunda barra lateral concorrente.
3. Rotas existentes continuam acessíveis por CTA, busca e submenus recolhidos; nada é apagado.
4. Mobile: só os 7 itens abertos; submenus fechados até toque explícito.
5. Critério de aceite: ação comum em até dois toques (criar/abrir caso, pessoa, Mesa Discovery, contrato, financeiro, pesquisa, configuração).

## O que esta decisão encerra

- Alternância 8 grupos ↔ 6 abas ↔ 7 telas como faces concorrentes.
- Dívida declarada “6 vs 8 grupos no menu principal”: o menu principal são **7 telas**; os **6 grupos** ficam internos.

## Código

- Face: `FACE_PRINCIPAL_DESK`
- Acervo operacional: `GRUPOS_DESK` / `GRUPOS_OPERACIONAIS_DESK`
- Shell: `src/components/saas/shell.tsx` renderiza a face; grupos só como submenu contextual
