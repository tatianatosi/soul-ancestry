# P21/P22 — Divergências de país resolvidas, contrato deixa de ler legado, versão de proposta já existe (2026-09-26)

```yaml
status: executado (P21 dados + P22 código) + investigado (versão/Canva — achado abaixo)
responsável pela decisão: Proprietária do Clube Ancestral
pedido literal: "Será que é necessário que o contrato leia os parâmetros do legado o ideal é
  deixar tudo remetendo aos dados atuais acredito que adicionar versão no nível de proposta
  precisa verificar como está a extração direto do Canva e em relação aos produtos divergentes
  veja que te pontuei as soluções para eles anteriormente para já estarem ativos com as
  mudanças acima"
```

## P21 — Produtos divergentes: resolvidos com os valores que você já tinha apontado

Você confirmou: os valores que colou no P20 (Itália R$4.700, Portugal R$4.800 de honorários-base)
**são** a solução para as 6 linhas `DIVERGENTE` de `price_catalog_rescued` que bloqueavam
exposição/cobrança desde o P15/P16 (Itália: R$4.500/4.700/4.800; Portugal: R$3.800/4.400/4.800).

Executado: a referência vencedora (a mesma que você já tinha confirmado) foi promovida de
`REFERENCIA_RESGATADA` para **`HOMOLOGADO_CATALOGO`** — o único estado que, pela sua própria
definição, pode aparecer em oferta/link/cobrança. As alternativas perdedoras (R$4.500/4.800 na
Itália; R$3.800/4.400 em Portugal) foram **arquivadas** (`archived_at`/`archive_motivo` —
nunca `DELETE`, rastreável). Os dois "duplicados" (uma linha `DIVERGENTE` com o mesmo valor da
vencedora) também foram arquivados, por serem redundantes com a referência já promovida.

## P22 — O contrato não lê mais o parâmetro financeiro do legado

Você perguntou se é necessário o contrato ler os parâmetros do legado — não é, e já corrigi.

**Achado exato**: `planejador-parametros.ts` só usava o lookup estático `PARAMETROS`
(`src/data/casos.ts`) para **dois campos de exibição** ("parcelas" e "despesas_externas"),
usados só na pré-carga do contrato da Ana Luiza (único caso que usa essa convenção hoje). Não
era usado para nenhum outro campo (país/rota, escopo, partes/beneficiários vêm de outro lugar,
já real). Antes de tocar, confirmei (investigação dedicada) que esse valor **nunca é gravado
como definitivo**: os dois lugares que chamam essa função (`contrato-preparar.functions.ts`,
`contrato-parametros.functions.ts`) só usam o resultado como **pré-carga de campo vazio**
(`status: "importado_a_confirmar"`), sempre atrás de um gate de confirmação humana antes do
contrato poder avançar — nunca sobrescreve valor já persistido.

**O que troquei**: criei `src/lib/financeiro-referencia.ts` (puro) +
`financeiro-referencia.server.ts`, que resolve a referência financeira do caso a partir de
dado real, nesta ordem:
1. **Condição comercial do caso** (`commercial_conditions`, filtrado por `case_id`) — quando
   existe, prevalece (ex.: a condição particular da Ana, "3 assinaturas mensais de R$320...").
2. **Referência do país** (`price_catalog_rescued`, nível país — `item_id is null`,
   `HOMOLOGADO_CATALOGO`/`REFERENCIA_RESGATADA`) — honorários/despesas/taxas/parcelas, a mesma
   tabela do P20/P21, agora com Itália/Portugal já `HOMOLOGADO_CATALOGO`.

Sem nenhuma das duas fontes, nenhum valor é fabricado — o campo simplesmente não aparece
(pendência, como sempre foi). O país é resolvido pelo qualificador já existente no código do
caso (`qualificadorPaisDoCodigo`, `src/lib/coerencia-caso.ts` — ex.: `AT` em
`CA-CID-AT-FAM-...`), reaproveitado, não inventado.

`planejador-parametros.ts` deixou de importar `PARAMETROS` de `@/data/casos` — passou a receber
a referência já resolvida como parâmetro (mesmo padrão já usado para `skuHomologado`,
resolvido pelo chamador, módulo continua puro). `src/data/propostas.ts` (achado da investigação:
**dead code**, zero importadores em `src/`) continua importando `PARAMETROS` do arquivo legado
— não removi o export porque quebraria o typecheck desse arquivo morto; se quiser que eu apague
esse arquivo órfão também, me avise (é limpeza separada, não pedida agora).

## "Adicionar versão no nível de proposta" — já existe, não precisa adicionar

Investiguei antes de mexer, como você pediu. Achado: minha resposta do P20 estava **incompleta**
— eu tinha procurado uma coluna chamada literalmente "version" (inglês) e não achei; a coluna
real se chama **`versao`** (português), e ela já existe em `proposals`: inteiro, `NOT NULL`,
default 1, mais `substituida_por_id`/`substituida_em` (qual proposta substituiu esta e quando),
`derivada_de_id` (linhagem), `restaurado_em`/`restaurado_por`/`restauracao_motivo` — um sistema
de versionamento completo, já real. `commercial_conditions.proposal_id` já referencia
`proposals` por FK, e o gerador de código de condição comercial já embute a versão da proposta
(`CC-${caso.codigo}-P${row.versao}`, `cadeia-operacional.server.ts`). **Não há nada para
adicionar aqui** — o gap era só na minha leitura anterior, corrigido agora.

**Sobre "extração direto do Canva"**: confirmado, não existe integração de API com o Canva em
nenhum lugar do código (sem dependência, sem OAuth, sem chamada HTTP a domínio do Canva). O
fluxo real é 100% manual: a equipe monta a proposta visualmente no Canva (fora do app), depois
digita os valores extraídos página por página no formulário `CompletudeCanva`
(`src/components/contrato/completude-canva.tsx`), que grava em `proposal_canva_pages` — nunca
um `fetch`/exportação automática. Achado à parte, não corrigido agora (fora do pedido):
`sincronizarComercialDaProposta` (`anexos-persistidos.server.ts`) grava `origem: "proposta"` em
`commercial_conditions` mas **não preenche `proposal_id`** nesse caminho específico — uma lacuna
pequena na rastreabilidade por FK, diferente do outro caminho (`cadeia-operacional.server.ts`)
que já faz certo. Se quiser que eu feche esse gap também, é um corte à parte.

## Verificação

`tsc --noEmit` limpo, testes novos (`p21-resolve-divergentes-italia-portugal-2026-09-26.test.ts`:
4 testes; `p22-financeiro-referencia-2026-09-26.test.ts`: 9 testes — nunca fabrica valor,
condição do caso prevalece, referência do país como fallback, `planejador-parametros.ts` não
importa mais o legado), suíte completa idêntica à baseline, `vite build` limpo. Migration do
P21 aplicada ao banco real e registrada em `schema_migrations`.

## Prova Lovable pós-push

Onde a lista-alimento/preços resgatados for exibida: Itália e Portugal aparecem
`HOMOLOGADO_CATALOGO` (não mais bloqueados), sem os valores alternativos arquivados. Na
preparação de contrato da Ana Luiza: os campos "parcelas"/"despesas externas" continuam
aparecendo pré-carregados, agora a partir da condição comercial real do caso dela
(`commercial_conditions`), não do arquivo estático — mesmo comportamento visível, fonte
diferente por baixo.
