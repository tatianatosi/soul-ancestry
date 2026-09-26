# P23 — Pente-fino sistêmico contra a "Correção Canônica" e atualização do Product Knowledge do Lovable (2026-09-26)

```yaml
status: verificado — nenhum gap de execução novo encontrado; Product Knowledge do Lovable atualizado
responsável pela decisão: Proprietária do Clube Ancestral
pedido literal: "preciso que adicione ao design system e ao Product knowledge as premissas
  que estão aqui e as correções isso vale pra tudo que estamos fazendo faça um pente fino
  sistêmico e veja o que precisa ser executado e execute resgatando o foco do clube ...
  E revisão e verificação e execução de todo o contexto para executar somente a prova visual
  será direcionada ao Lovable"
```

## O que foi pedido e como foi interpretado

Você colou de novo a "Correção Canônica — Catálogo Multipaís, Produtos-Pai, Jornada, Valores e
Legado" (v2.0, 2026-09-04) e o "Adendo — Contexto Não Arquivável" (2026-09-10), pedindo: (1)
adicionar as premissas ao **Product Knowledge** do Lovable (não há "design system" separado
configurado no workspace — `list_design_systems` devolveu vazio; a seção "Design System e UX"
já existente dentro do próprio Product Knowledge é onde esse conteúdo vive hoje); (2) fazer um
pente-fino sistêmico contra tudo que já foi feito nesta sessão e executar o que faltar; (3)
lembrar que só a prova visual vai para o Lovable — o resto (revisão/verificação/execução) é
meu trabalho aqui.

## Achado principal: quase tudo já estava executado — cortes P13 a P22

O documento de 04/09 é uma variante mais antiga do mesmo "Prompt Canônico" que os cortes P13,
P16, P17, P18, P19, P20, P21 e P22 desta sessão já verificaram e, onde havia gap real, fecharam.
Conferi cada critério de aceite da seção 8 do documento contra o estado vivo do banco/código:

| Critério (seção 8 do documento) | Estado real, verificado agora |
|---|---|
| Nenhum artefato depende da Planilha Mestre | Confirmado — `grep` por `from("legacy_catalog_import")` em `src/` devolve zero resultados; nenhum leitor em runtime. `PARAMETROS`/`SKUS_REFERENCIA` (o único resíduo real) foi corrigido no P22. |
| `PACOTE-*` só como legado/alias | Confirmado — `planner_catalog_feed.legacy_aliases` (P13), nunca usado para criar SKU novo. |
| Lista-alimento separa aderente de legado/divergência/arquivamento/pendência | Confirmado — dicionário de 8 estados já é o CHECK real da tabela, aplicado nos cortes P16-P21. |
| Produtos-pai/trilhas/fases organizam o Caso 360 sem recodificar CA | Confirmado — `case_plans.produto_pai_id` (PP-01–09), nenhuma taxonomia nova. |
| Itália não é modelo padrão | Verificado agora, não presumido: busca por "Itália" como default/placeholder em `src/` só encontra um texto de exemplo ilustrativo num textarea de colar WhatsApp (`varredura-whatsapp.tsx:152`, "meu bisavô era italiano…") — não é lógica, é só um exemplo de preenchimento. Nenhuma constante, ordenação ou copy trata Itália como central. |
| Países recebem tratamento explícito de cobertura/preço | Confirmado — todos os 12 países/processos da tabela já têm entrada em `price_catalog_rescued` (P13/P20), incluindo o gap de parcelas fechado no P20 e as divergências Itália/Portugal resolvidas no P21. |
| Todo valor tem tipo/fonte/data/estado/escopo; condição particular nunca vira preço de catálogo | Confirmado — `price_catalog_rescued` (país) e `commercial_conditions` (caso) são tabelas estruturalmente separadas; a condição de R$9.600 da Ana nunca sobrescreveu a referência de R$4.800 da Áustria (checado de novo agora). |
| Proposta Canva consome só condição de caso aprovada | Confirmado no P22 — `materializarProposta` lê `product_catalog`, nunca `PARAMETROS`. |
| Curso arquivado, fora do motor comercial | Confirmado — `CA-CURSO-001` = `ARQUIVADO_DECISAO_PROPRIETARIA` (checado de novo agora). |

**Nenhuma migration nova foi necessária nesta rodada.** O "executar" que restava era garantir
que o *contexto* (as premissas corrigidas) ficasse registrado onde o Lovable realmente lê antes
de cada resposta do seu próprio agente — isso não existia até agora e foi a ação real deste
corte.

## O que foi executado agora

**Product Knowledge do Lovable atualizado** (`mcp__Lovable__set_project_knowledge` +
`set_workspace_knowledge`, projeto `1a628b61-ec68-454f-85e1-671d6f297370` e workspace
`Wz4qQwCLZpC4gWd6tkIV`) — nova seção "Foco do Clube e catálogo multipaís (2026-09-26, P13-P22)"
acrescentada ao documento já existente (nada removido), cobrindo, de forma condensada (limite
real de 10.000 caracteres da ferramenta, verificado por tentativa e erro):

- o funil família → ramos → base compartilhada → trilhas → pesquisa incremental → condição do
  caso → memória/continuidade, com Itália explicitamente marcada como "nunca central";
- o pipeline real Planilha Mestre → `legacy_catalog_import`/`price_catalog_rescued` →
  `planner_catalog_feed` → `product_catalog` → `case_plans`/`case_services` → Desk → App;
- `PACOTE-*` como alias legado, taxonomia `CA-*` preservada, produto-pai como orquestração;
- o dicionário de 8 estados, `CA-CURSO-001` arquivado;
- a fórmula de três camadas (`referencia_da_trilha` / `condicao_do_caso` / `caso_multipais`) e a
  regra de aceitar o preço sugerido sem sobrescrever divergência;
- o contrato não lendo mais parâmetro estático legado, e a realidade do Canva (extração manual,
  versão de proposta já real);
- um resumo de uma frase da regra de continuidade, apontando para o texto integral em
  `docs/politicas/`.

Não há um "design system" separado no workspace do Lovable (`list_design_systems` retornou
vazio) — as premissas de design/UX já vivem dentro do próprio Product Knowledge, na seção
"Design System e UX" pré-existente; não criei um artefato paralelo para isso.

## O que não foi tocado, e por quê

- Não recriei nenhuma das tabelas do "prompt corretivo único" da seção 7 do documento
  (`family_case`, `family_branch`, `research_base`, `nationality_track`,
  `incremental_scope`, `microdelivery`) — são a mesma proposta que o P9/P13/P14 já mapearam para
  entidades reais existentes (`case_plans`+`crm_casos`, `lineage_paths`, `research_cases`,
  `commercial_conditions`, `client_deliverables`) — criar tabelas novas com esses nomes
  duplicaria estrutura já real, o erro que o próprio `AGENTS.md` proíbe.
- Não toquei nos 91 SKUs/dicionário de divergência como um projeto novo — as divergências
  concretas que existiam de fato (Itália/Portugal) já foram resolvidas no P21; o resto da
  "pré-lista de alimento" do documento de 04/09 é o mesmo conteúdo que os cortes P16/P17/P18
  já reclassificaram com os 8 estados reais.
- Não fabriquei prova visual — como sempre nesta sessão, isso é exclusivamente da Proprietária
  no Lovable.

## Verificação

Sem alteração de código/schema nesta rodada — verificação foi só de leitura (`grep` direcionado
+ consultas ao banco real já citadas acima). Nenhum `tsc`/suíte/build necessário. Nenhuma
migration criada.

## Prova Lovable pós-push

Nenhuma tela nova para conferir — a mudança desta rodada é de contexto (Product Knowledge do
Lovable), não de produto. Você pode conferir o conteúdo atualizado abrindo as configurações de
Knowledge do projeto/workspace no editor do Lovable.
