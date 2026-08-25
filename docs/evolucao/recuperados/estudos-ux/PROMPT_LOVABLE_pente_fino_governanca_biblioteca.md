Destino: Lovable — projeto Clube Ancestral (https://soul-ancestry.lovable.app)
Contexto: pente-fino confirmado por código (não suposição) nos 26 itens de Governança e biblioteca —
16 são reais e conectados a dado vivo, 8 são estáticos ("só descrição", sem nenhuma query ao banco),
2 são estáticos mas aceitáveis pela natureza de documento de referência. Este prompt trata os 8
estáticos, com prioridade nos dois mais críticos.

Quando rodar: pós-lançamento.

Modo de execução obrigatório: EXECUTE, com evidência objetiva. Para cada item, ou (a) conectar a dado
real do banco, ou (b) manter estático mas expor isso claramente na tela (não deixar o nome do módulo
sugerir dado vivo quando não é), com justificativa registrada.

────────────────────────────────────────

PRIORIDADE ALTA

1. Log de decisões (/governanca/decisoes, 260 linhas, 0 queries)

Hoje é conteúdo fixo no arquivo — adicionar uma decisão exige deploy de código. Isso contradiz o
princípio de auditoria append-only que o projeto já declara em outros documentos de governança.

Executar: criar uma tabela real (governanca_decisoes ou equivalente) com os campos já usados no
conteúdo estático atual (problema, regra anterior, regra nova, arquivos afetados, impacto, responsável,
status, data). Migrar as decisões já registradas no arquivo estático para essa tabela como dado inicial
(não perder histórico). A tela passa a ler da tabela via query real. Permitir que a equipe (papel
admin/operações) adicione novas decisões pela própria tela, sem precisar de deploy. Manter regra de
não exclusão física — só arquivamento.

2. Indicadores e métricas (/governanca/indicadores, 223 linhas, 0 queries, usa DETALHE_INDICADOR e
   MANIFESTACAO_INDICADOR hardcoded)

O nome da tela promete métrica viva; hoje entrega número fixo no código.

Executar: para cada indicador hoje hardcoded, identificar a fonte real de dado equivalente já existente
no produto (muitos provavelmente já têm fonte real em /metricas, /conversao, /financeiro ou
onboarding-jornada — reusar, não duplicar cálculo). Ligar a tela ao dado real. Se algum indicador não
tiver fonte real disponível ainda, marcar explicitamente na tela como "definição do indicador, medição
ainda não implementada" — não exibir um número fixo como se fosse medição atual.

────────────────────────────────────────

PRIORIDADE MÉDIA — decidir por item: virar dado real, ou assumir como documento de referência

Para cada um dos itens abaixo, a decisão é binária e deve ser tomada e registrada (não deixar
ambíguo): (a) conectar a dado real do banco, ou (b) manter como documento de referência estático, com
aviso visível na própria tela ("Documento de referência, atualizado manualmente por [papel], última
revisão em [data]") para que ninguém confunda com dado vivo.

3. Critérios de aceite (/governanca/criterios-aceite)
4. Matrizes conceituais (/governanca/matriz-conformidade)
5. Corte vertical e fontes (/governanca/corte-vertical)
6. Inventário e recuperação (/governanca/inventario-recuperacao)
7. Inventário patrimonial (/governanca/inventario-patrimonial)
8. Varredura de completude (/governanca/varredura-completude) — este em especial: o nome "varredura"
   sugere execução real; se a varredura de fato roda (mesmo manualmente) e o resultado é salvo, ligar
   a esse resultado real; se é só uma checklist de referência, renomear para deixar isso claro.

────────────────────────────────────────

NÃO MEXER (confirmados como estáticos aceitáveis, por natureza de documento)

- Contrato-base consolidado (texto legal, versionado por commit é aceitável — só confirmar que a
  versão/data de aprovação aparece visível na tela).
- Módulos contextuais (é o próprio catálogo de código desk-modulos.ts sendo exibido — natureza
  estática correta; só manter atualizado conforme os prompts de reconciliação já enviados).

────────────────────────────────────────

Ao final: reportar por item — conectado a dado real / mantido como referência com aviso adicionado /
pendente de decisão da proprietária — com evidência (print da tela antes/depois, ou trecho de código
da nova query).
