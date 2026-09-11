# Decisão de navegação do Desk — 11/09/2026

**Status:** vigente (face em implementação na PR de produto ativa)  
**Responsável:** Proprietária do Clube Ancestral  
**Escopo:** uma única arquitetura de interface. Não apaga módulos, dados ou rotas.

## Decisão

Não usar **6 abas** nem **8 grupos** como face principal.

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

Registro canônico: `src/lib/navegacao-desk.ts` (`GRUPOS_DESK` = 7 telas; `GRUPOS_OPERACIONAIS_DESK` = 6 internos).

## Regras

- Os 8 grupos não voltam como menu principal.
- Os 6 grupos não substituem a taxonomia visual aprovada.
- Rotas existentes seguem acessíveis por CTA, pesquisa e submenus recolhidos.
- No mobile, só os sete itens abrem; submenus ficam fechados até toque no chevron.
- Ações comuns (abrir caso, pessoa, Mesa Discovery, contrato, financeiro, pesquisa, configuração) cabem em até dois passos.
