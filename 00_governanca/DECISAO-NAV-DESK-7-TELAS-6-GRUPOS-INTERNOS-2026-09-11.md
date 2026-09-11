# Decisão de Navegação do Desk — 7 telas + 6 grupos internos

- **Status:** em revisão (`revisar` até preview + certificação da proprietária)
- **Versão:** v1.0
- **Data:** 2026-09-11
- **Responsável:** Proprietária do Clube Ancestral
- **Registro na sync:** [`SINCRONIZACAO_MESTRE_2026-09-11.md`](./SINCRONIZACAO_MESTRE_2026-09-11.md)
- **Escopo:** uma única arquitetura de face do Desk; sem apagar módulos, dados ou rotas.
- **Limites:** esta peça **não** altera navegação sozinha; é decisão de interface a aplicar na PR de produto ativa após preview.

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

CAMADA OPERACIONAL INTERNA (recolhida/contextual)
1. Hoje
2. Comercial
3. Casos & Pessoas
4. Pesquisa
5. Formalização
6. Governança
```

## Classificação

| Opção | Estado |
|---|---|
| 7 telas mockup como face | `decidido` (recomendado; em revisão) |
| 6 grupos só internos | `decidido` |
| 6 grupos como face atual no código | `revisar` (substituir face, não apagar funções) |
| 8 grupos como menu principal | `historica_superada` |

## Onde cada função fica (resumo)

| Função | Tela mockup | Grupo interno |
|---|---|---|
| Painel Hoje, prioridades, microentregas do dia | Visão Geral / Alertas | Hoje |
| Leads, Mesa Discovery/Calls, propostas | Visão Geral / Casos 360 | Comercial |
| Pessoas, clientes, núcleos | Casos 360 | Casos & Pessoas |
| Contratos, OS, financeiro do caso | Casos 360 / Validação Jurídica | Formalização |
| Pesquisa, evidências, fontes | Biblioteca Mestre / Casos 360 | Pesquisa |
| Catálogo, SKUs legado, templates, integrações | Biblioteca Mestre | Governança (submenu; nunca 1ª dobra) |

## Ação de implementação (quando autorizada)

1. Menu principal = as 7 telas; 6 grupos = metadados/submenus/contexto.
2. Rotas existentes via CTA, busca e submenus recolhidos — nada apagado.
3. Mobile: só os 7 itens abertos; submenus fechados até toque.
4. Confirmar ≤2 passos: criar/abrir caso, pessoa, Mesa Discovery, preparar contrato, financeiro, pesquisa, configuração.
5. **Não** abrir PR só de nav; aplicar na PR de produto ativa; preview antes de publicar.

## Microentregas e o dia

Microentregas são **intrínsecas** à jornada/onboarding. Alimentam o alerta do Hoje (ex.: mandar achado à Alice; atualizar grupo WhatsApp da família; publicar no App). Não são item de menu nem SKU.
