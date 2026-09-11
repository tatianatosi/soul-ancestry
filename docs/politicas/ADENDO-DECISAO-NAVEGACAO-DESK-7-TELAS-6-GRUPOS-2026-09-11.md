# Adendo — Decisão de navegação do Desk: 7 telas + 6 grupos internos (2026-09-11)

**Status:** vigente (decisão da proprietária).  
**Substitui como face:** menu principal de 8 grupos e menu principal de 6 abas operacionais.  
**Não apaga:** rotas, módulos, dados nem os 6 grupos como camada operacional interna.

## Decisão

```text
FACE PRINCIPAL DO DESK (sempre visível)
1. Visão Geral
2. Casos 360
3. Checklist
4. Validação Jurídica
5. Radar Interno
6. Alertas
7. Biblioteca Mestre

CAMADA OPERACIONAL INTERNA (recolhida/contextual)
1. Hoje
2. Comercial
3. Casos & Pessoas
4. Pesquisa
5. Formalização
6. Governança
```

- **8 grupos como menu principal:** proibido (origem de menu pesado e rotas concorrentes).
- **6 abas/grupos:** úteis só por dentro (filtros, contexto, implementação) — não são a face.
- **7 telas do mockup:** face canônica do Desk.

## Código

- Face: `FACE_DESK` em `src/lib/navegacao-desk.ts` + apresentação em `src/components/saas/shell.tsx`.
- Grupos internos: `GRUPOS_DESK` (6) — submenu/contexto sob “Operação”, fechado até toque explícito no mobile.
- Rotas existentes permanecem acessíveis por CTA, face, pesquisa e submenus.

## Critério de aceite

Em desktop e mobile, ações comuns (criar/abrir caso, abrir pessoa, Mesa Discovery, preparar contrato, ver financeiro, abrir pesquisa, configuração) em até dois toques/cliques, sem exigir entendimento da estrutura técnica.

## Relacionados

- Gap CRM Journey: `docs/relatorios/2026-09-11_gap-crm-journey-vs-app.md`
- Mockup 17 páginas (visual normativo)
- Dívida antiga “8 vs 6 grupos” na memória: **resolvida nesta decisão** (face ≠ grupos internos)
