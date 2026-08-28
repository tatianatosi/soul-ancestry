Destino: Lovable — projeto Clube Ancestral (https://soul-ancestry.lovable.app)
Objetivo: auditar a arquitetura de módulos contextuais do Desk Intelligence (CA-UX-01.2, definida em
src/lib/desk-modulos.ts) e separar, módulo a módulo, o que é operação real (precisa de tela/painel
próprio com ações) do que é apenas uma métrica que deveria aparecer como número/badge no cabeçalho da
aba de origem — sem painel dedicado e sem duplicar o mesmo sinal em duas abas diferentes.

Modo de execução obrigatório: EXECUTE. Não responda com plano, resumo ou promessa. Leia o código real,
classifique cada item com evidência (de onde vem o dado, quem o consome hoje), proponha e implemente
a consolidação, rode build, e reporte resultado objetivo por item. Se não for possível confirmar algo
com segurança (por exemplo, se dois módulos são de fato a mesma fonte de dado ou só parecem iguais no
nome), marque como A CONFIRMAR COM A PROPRIETÁRIA — não decida sozinho fundir dado operacional real.

Escopo e proibições
- Não remover, renomear ou fundir nenhuma das 14 abas principais do Desk nem das 8 telas principais
  listadas em TELAS_PRINCIPAIS_DESK — o objetivo é dentro de cada aba, não entre abas.
- Não criar nenhuma aba principal nova — a regra "nenhum módulo profundo vira aba principal" continua
  valendo.
- Não alterar dados reais de caso, cliente, contrato, catálogo ou financeiro — isso é reorganização de
  apresentação e navegação, não mudança de dado.
- Não apagar histórico/log nenhum — se um painel for descontinuado por ser duplicado, seu conteúdo
  precisa continuar acessível a partir da fonte única, não desaparecer.
- Registrar cada decisão de consolidação seguindo o mesmo protocolo já usado no projeto (problema,
  regra anterior, regra nova, arquivos afetados, impacto, responsável de validação, status).

────────────────────────────────────────

1. Classificar cada um dos 38 módulos de MODULOS_DESK

Para cada módulo (id, nome, tela, forma, destino), adicionar uma classificação nova — sugestão de
enum `tipo: "operacional" | "metrica" | "duplicado"`:

- operacional: tem dado próprio, ação própria (usuário faz algo ali: edita, aprova, preenche) e faz
  sentido como subrota/painel dedicado. Exemplos prováveis: crm-leads, crm-propostas, jur-matriz,
  caso-formalizacao, caso-go-live.
- metrica: é um número, contagem, ou indicador derivado de dado que já existe em outro módulo
  operacional — não precisa de painel próprio, só de um badge/card no cabeçalho da aba onde aparece
  hoje. Exemplos prováveis a verificar: ov-receita, ov-conversao, ov-indicadores (já são "card → 
  subrota", então já estão no padrão correto — confirmar que continuam assim).
- duplicado: o mesmo sinal/dado aparece como módulo separado em mais de uma tela. Verificar
  especificamente:
  - chk-d10-d14 (Checklist semanal) vs ale-d10-d14 (Alertas) — é o mesmo marco D10/D14 vindo da mesma
    fonte de dado, ou são cálculos/critérios diferentes com o mesmo nome por coincidência? Reportar a
    fonte de dado real de cada um antes de decidir.
  - Alertas como um todo (ale-achados, ale-microentregas, ale-documentos, ale-acoes-vencidas,
    ale-rascunhos, ale-fila-revisao) contra os módulos equivalentes dentro de Casos 360
    (caso-achados, caso-documentos) e Checklist (chk-pendencias-resp, chk-rechecagens) — reportar, para
    cada par suspeito, se Alertas consulta a mesma tabela/fonte com um filtro de urgência (o que seria
    correto: Alertas é uma view derivada) ou se mantém um dado próprio que pode divergir do de origem
    (o que seria um risco real de inconsistência, não só redundância visual).

Entregar: a tabela MODULOS_DESK atualizada com a coluna `tipo`, e um resumo por tela (quantos
operacionais, quantos métrica, quantos duplicados encontrados).

────────────────────────────────────────

2. Implementar a consolidação dos itens classificados como "métrica"

Para cada módulo classificado como métrica que hoje tem `forma: "painel"` mas na prática só mostra um
número/status sem ação própria:
- Mover a exibição para um badge/indicador no cabeçalho da aba onde o módulo reside (não em painel
  separado dentro da mesma tela).
- Confirmar que o número exibido vem de cálculo real sobre o dado de origem (não hardcoded, não
  duplicado em uma tabela paralela).
- Manter o destino/subrota de origem como o único lugar onde a ação de fato acontece.

Não fazer essa mudança em nenhum módulo classificado como "operacional" ou como "a confirmar".

────────────────────────────────────────

3. Resolver os duplicados confirmados

Para cada par confirmado como duplicado (mesma fonte, mesmo cálculo, exibido duas vezes):
- Escolher uma tela como fonte única de exibição operacional (onde o usuário toma a ação), e nas
  demais telas onde o mesmo sinal aparecia como módulo separado, substituir por um badge/contador que
  aponta (link ou destaque) para a tela fonte — não duplicar o painel.
- Se o par não for de fato duplicado (fontes ou critérios diferentes apesar do nome parecido), deixar
  como está e documentar a diferença real encontrada, para que o nome deixe de causar essa confusão no
  futuro (ex.: renomear um dos dois para refletir o critério específico).

Não decidir sozinho qual tela "vence" quando ambas parecerem igualmente centrais para a operação —
nesse caso, reportar as duas opções e aguardar decisão da proprietária, como já é praticado no projeto
para decisões que afetam fluxo de trabalho da equipe.

────────────────────────────────────────

Aceite único deste ciclo: entregar (a) a matriz MODULOS_DESK classificada e comentada, (b) a lista de
mudanças efetivamente implementadas com commit, (c) a lista de itens que ficaram como "a confirmar com
a proprietária" com a pergunta objetiva que falta responder para cada um, e (d) build passando sem
quebrar nenhuma das 14 abas principais nem os 8 gates de fonte de verdade já documentados no projeto.
