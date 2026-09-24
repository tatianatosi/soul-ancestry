# Design System — Clube Ancestral

**Status:** em revisão  
**Versão:** v1.1  
**Data:** 2026-09-18  
**Responsável pela decisão:** Proprietária do Clube Ancestral  
**Fonte:** mockups aprovados do App Cliente e Desk Intelligence; contratos e regras deste diretório.

Este diretório reúne contratos de marca, interface, conteúdo, comportamento e prova. Documentação não substitui execução: uma interface só é aceita com fonte real, comportamento verificável, prova visual e F5 quando aplicável.

## Contratos canônicos

| Documento | Função |
|---|---|
| `tokens.md` | paleta, tipografia, breakpoints e estados semânticos |
| `componentes.md` | papéis de componentes, cópias e roteiro de consolidação |
| `regras-de-uso.md` | regras de cor, KPI, selo, vazio, CTA e navegação |
| `taxonomia-canonica.md` | Pessoa Unificada e vocabulário de interface |
| `mascaras-e-validadores.md` | formatos, validação e entrada de pessoa |
| `visibilidade-e-sanitizacao.md` | projeção autorizada para o App Cliente |
| `de-para-pessoa-unificada.md` | de-para e roteiro de evolução da pessoa |
| `contrato-interface-app-cliente.md` | contrato de layout, conteúdo e estados das 7 abas do App |
| `contrato-interface-desk.md` | contrato das 7 telas e 6 grupos internos do Desk |
| `contrato-cta-contexto-e-prova.md` | CTAs, `case_id`, persistência, histórico, fila, F5 e prova visual |
| `contrato-entre-agentes.md` | como um pedido da Proprietária vira trabalho publicado: aprovação, execução corte a corte, publicação em `main` e prova visual no Lovable |

## Navegação imutável

```text
App Cliente: Home → Jornada → Radar → Árvore → Documentos → Legado → Conta

Desk: Visão Geral → Casos 360 → Checklist → Validação Jurídica → Radar Interno → Alertas → Biblioteca Mestre

Grupos internos Desk: Hoje · Comercial · Casos & Pessoas · Pesquisa · Formalização · Governança
```

Os grupos internos são contexto/filtro/submenu, não uma segunda navegação.

## Ordem de aplicação

1. Tokens e componentes base em consumidor real.
2. Regras de uso, estado vazio, CTA e responsividade no mesmo consumidor.
3. Pessoa Unificada e validadores antes de persistir.
4. Persistência → histórico → fila/estado → F5.
5. Interface App/Desk contra mockups aprovados, uma tela por vez.
6. Prova visual desktop e 375 px; aceite da Proprietária.

## Regra de mudança

Não renomear, fundir, expandir ou substituir telas, taxonomias, cores, estados, CTAs ou política de visibilidade sem decisão explícita da Proprietária. Não usar dados demo como preenchimento real.
