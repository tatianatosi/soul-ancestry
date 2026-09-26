# P25 — CRM Vivo/Calls contra marcos jurídicos: gaps reais fechados (2026-09-26)

```yaml
status: executado — gaps seguros fechados; 5 achados maiores flagados para decisão sua
responsável pela decisão: Proprietária do Clube Ancestral
pedido literal: "Verifique o que foi aplicado no Crm vivo e no calls e o faltante execute"
  + documento colado "2026-09-08-prompt-planejador-marcos-juridicos-crm-vivo.pdf"
```

## O que já estava aplicado (confirmado, não refeito)

O motor de marcos jurídicos que o documento pede (`legal_framework`/`legal_gate`) já existe sob
outro nome, real e testado: `citizenship_tracks` → `versioned_legal_rules` →
`legal_reference_milestones`, já ligado ao Caso 360 ("Validação jurídica deste caso") e à Mesa
Discovery (`/calls`, dropdown "Trilha jurídica de referência", auto-vinculado quando a varredura
de WhatsApp aceita um país). Dos 8 campos que o documento exige por marco jurídico, **6 já têm
coluna real**: país/via, título/resumo, fonte oficial, datas de vigência/revisão, requisitos
documentais, gatilho de revisão humana, risco. Confirmado por consulta direta: **10 dos 12
países/processos da sua matriz já têm trilha + regra + marco reais** (8 já `aprovado`: Itália,
Portugal, Espanha, Alemanha, Polônia, Hungria, Áustria, Luxemburgo; 2 `em_revisao`: Croácia,
Romênia).

## Gaps genuínos encontrados e fechados agora

1. **Irlanda: trilha, regra e marco genuinamente inexistentes.** Criados agora, com o mesmo
   padrão conservador já usado para Bélgica (P17) — "Marco oficial a homologar", nenhuma fonte
   legal específica afirmada sem confirmação. Não fabriquei citação de lei irlandesa.
2. **França: mesma ausência total.** Criada trilha de naturalização (separada das trilhas de
   descendência europeias, como você já separa o Brasil), mesmo padrão conservador.
3. **Brasil: tinha trilha, mas nenhuma regra nem marco jurídico associado.** Fechado — mesmo
   padrão.
4. **"Casos ativos por fase, país, responsável e saúde" — país/via faltava no Painel Hoje.**
   Fase, responsável e prioridade (o análogo real de "saúde" nesta base) já apareciam por caso em
   `/casos` e agregados em `/painel`; só faltava a agregação por país. Adicionada a coluna
   `pais`/`via` na consulta de carteira já existente (nenhuma query nova) e uma função pura
   `casosPorPaisVia`, com um card novo "Casos por país e via" no Painel Hoje.
5. **"Radar de marcos jurídicos e casos impactados" — confirmado genuinamente ausente.** O motor
   jurídico só fazia busca num sentido (caso → regras aplicáveis); não existia o sentido inverso
   (marco → quais casos usam aquela trilha). Construído agora: `radarMarcosJuridicos` (função
   pura) + `radarMarcosJuridicosDoPainel` (leitura própria, junção em memória das 3 tabelas já
   reais — nenhuma tabela nova) + card "Radar de marcos jurídicos" no Painel Hoje. Contagem real:
   hoje só a Áustria tem 1 caso realmente ligado a uma trilha (Ana Luiza) — os demais mostram 0,
   porque é a verdade dos dados, não porque o radar esteja incompleto.

## O que NÃO executei — e por quê (decisão sua, não minha)

- **Responsável pela revisão normativa** (`citizenship_tracks.owner_id`/`responsavel_revisao`,
  `versioned_legal_rules.reviewed_by`, `legal_reference_milestones.verified_by`): a coluna existe
  em todas as 3 tabelas, mas **0 de 31 trilhas e 0 de 18 marcos têm alguém atribuído**. Não
  inventei um nome — isso precisa de uma pessoa real seu lado.
- **Uma segunda implementação de Painel Hoje mais completa (`painelHojeDesk`/`PainelDeskHoje`/
  `PainelDia`) existe no código, testada, mas nunca foi ligada a nenhuma rota — órfã.** Ela já
  cobre SLA em risco, fila de revisão jurídica e ações rápidas, mais perto do seu documento do
  que o `/painel` ao vivo. Decidir se ela substitui o `/painel` atual ou se deve ser removida como
  código morto é uma decisão de arquitetura maior — não troquei a tela que sua equipe usa hoje
  sem sua confirmação explícita.
- **"Higiene de dados" como painel permanente** (IDs duplicados, dados ausentes, conflitos de
  preço/fonte, agregados): a detecção de duplicidade já existe (`verificarDuplicidadeLead`), mas
  só sob consulta pontual, não como card do Painel. Construir isso como KPI permanente é um corte
  à parte, de tamanho médio.
- **"Financeiro por caso restrito a condição aprovada" e "oportunidades de memória/legado/
  continuidade"**: nenhuma das duas tem hoje uma superfície real no Painel/CRM — são construções
  novas de agregação, não um ajuste aditivo pequeno. Fico aguardando sua confirmação de escopo
  antes de construir, dado o tamanho.

## Verificação

`tsc --noEmit` limpo. Testes novos: `golive-operacao.test.ts` (+1: `casosPorPaisVia`),
`radar-marcos-juridicos.test.ts` (4 testes — nunca inventa impacto, trilha sem marco não aparece,
ordenação, dado inconsistente não quebra), `p25-irlanda-franca-brasil-marcos-2026-09-26.test.ts`
(4 testes — nenhuma fonte legal fabricada, idempotente), `p25-painel-hoje-pais-e-radar-juridico-
2026-09-26.test.ts` (3 testes — sem query nova para país/via, radar nunca esconde 0). Suíte
completa idêntica à baseline (7 arquivos/11 testes pré-existentes, visuais/portal, sem relação com
este corte). `vite build` limpo. Migration aplicada ao banco real e registrada em
`schema_migrations`.

## Prova Lovable pós-push

Abrir `/painel` (Hoje): novo card "Casos por país e via" mostra a contagem real por país (hoje,
majoritariamente "Sem país registrado" para os casos-demo/teste, e a linha real da Ana em
Áustria) e novo card "Radar de marcos jurídicos" lista os marcos reais com a contagem de casos
afetados, link para "Validação jurídica" (`/matriz-juridica`). Em `/calls`, o dropdown "Trilha
jurídica de referência" agora também lista Irlanda e França.
