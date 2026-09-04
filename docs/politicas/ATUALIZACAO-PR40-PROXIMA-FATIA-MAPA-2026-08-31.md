# Atualização operacional — PR #40 e próxima fatia do Mapa de Autoridade Admin

```yaml
status: em revisão
versão: 1.0
data: 2026-08-31
projeto: Clube Ancestral
classificação: atualização operacional e plano de auditoria
responsável pela decisão: Proprietária do Clube Ancestral
fontes de evidência:
  - Relato operacional recebido em 2026-08-31
  - PR #40 — Contrato: remove botões de ação redundantes com a navegação de abas
  - PR #35 como branch-base da alteração, conforme relato
  - Prompt Mestre — Motores a Implantar
  - Mapa de Autoridade Admin
escopo:
  - registrar a simplificação de controles de contrato
  - delimitar a próxima fatia de mapeamento: Marketing, Configuração e sete telas do App Cliente
premissas:
  - PR #40 foi implementada sobre a branch do PR #35
  - TypeScript, testes e build verdes demonstram integridade de código, não homologação manual em preview
limites:
  - não autoriza merge, alteração adicional de contrato, criação de tarefas em novas superfícies ou mudança de taxonomia visual
  - não declara que as ações restantes do contrato foram validadas por teste manual
próximos passos:
  - concluir auditoria rota → componente → handler → função → tabela → persistência das áreas restantes
  - classificar leitura, escrita, lacunas de UI, mock/lista, ações externas e persistência pendente
  - não iniciar P3/P4/P9 com base apenas no mapa
critério de aceite:
  - cada linha mapeada informa evidência concreta e não é classificada por inferência
substitui: nenhum
```

> **Nota ao arquivar (31/08/2026):** este documento pede a mesma fatia do Mapa
> (Marketing, Configuração, App Cliente) que já foi entregue no commit
> `cf4c86a` — a auditoria chegou antes deste pedido explícito ser processado,
> mas cobre exatamente o método e as áreas pedidas aqui. A seção "Limite
> factual sobre Criar tarefa" também repete a posição "somente Painel Ops",
> que já tinha sido contestada por evidência de código e, depois,
> reconciliada com a proprietária em conversa (causa era URL de preview
> errada, não ausência de implementação) — ver
> `CORRECAO-CRIAR-TAREFA-PAINEL-OPS-2026-08-31.md` e
> `RECONCILIACAO-CRIAR-TAREFA-FECHAMENTO-MAPA-2026-08-31.md`. Este documento
> parece ter sido escrito antes dessa reconciliação chegar à conversa.

## PR #40 — simplificação do contrato

A PR #40 remove os três controles que duplicavam a navegação por abas:

```text
Editar contrato
Adicionar cláusula
Adicionar anexo
```

As abas correspondentes permanecem disponíveis. A remoção não elimina acesso a Resumo, Cláusulas ou Anexos; somente evita que botões apresentados como ação principal façam o mesmo que a navegação abaixo.

Ações principais que permanecem no contrato:

```text
Salvar rascunho
Criar tarefa
Solicitar revisão humana
```

A classificação correta é:

```text
PR #40: simplificação de UX/semântica em código, aguardando validação manual no preview.
```

## Limite factual sobre "Criar tarefa"

A existência visual de "Criar tarefa" em uma área não deve ser interpretada como motor de tarefa disponível e validado fora do Painel Ops. A política de correção registrada pela proprietária prevalece:

```text
Criar tarefa disponível e confirmado: somente Painel Ops.
Demais superfícies: não declarar disponível sem teste de escrita, releitura e refresh.
```

Portanto, a presença do controle no contrato deve ser tratada no mapa como item a verificar, e não como funcionalidade homologada.

## Próxima fatia: Mapa de Autoridade Admin

A próxima atividade é auditoria, não implantação de motor. Cobrir somente as áreas ainda sem rastreamento completo:

```text
1. Marketing
2. Configuração
3. App Cliente — Home
4. App Cliente — Jornada
5. App Cliente — Radar
6. App Cliente — Árvore
7. App Cliente — Documentos
8. App Cliente — Legado
9. App Cliente — Conta
```

## Método obrigatório de mapeamento

Para cada rota, aba, card, botão ou formulário, registrar:

| Campo | Exigência |
|---|---|
| Superfície e rota | Caminho real da aplicação |
| Componente | Arquivo/componente responsável |
| Capacidade | Ler, criar, editar, arquivar, concluir, reprogramar, liberar ou ação externa |
| Handler | Evento/mutation/client function acionada |
| Função/RPC | Server function ou endpoint efetivamente chamado |
| Fonte de dados | Tabela, view, bucket ou serviço consultado/escrito |
| Escopo de organização | Como a organização e o papel são resolvidos |
| Persistência | Confirmada em banco/preview, código aguardando teste, parcial, inexistente ou leitura deliberada |
| Relação com case_id | Como evita criar fonte/identidade paralela |
| Próxima ação/tarefa | Existência real, ausência ou lacuna; não inferir por botão visível |
| Classificação | Uma classificação principal e motivo concreto |
| Próximo passo | Menor correção ou teste necessário |

Classificações permitidas:

```text
HABILITADA_E_VALIDADA
HABILITADA_EM_CODIGO_AGUARDANDO_TESTE
PARCIAL
BLOQUEADA_POR_REGRA_DE_ESTADO
ACAO_EXTERNA_NAO_IMPLEMENTADA
SOMENTE_LEITURA_DELIBERADA
SEM_UI_PARA_FUNCAO_EXISTENTE
SEM_FUNCAO_OU_SCHEMA
COM_ERRO_OU_RISCO_CONHECIDO
```

## Critérios específicos

### Marketing

Verificar se cada área é motor funcional ou somente lista/leitura:

```text
Dashboard
Produtos e ofertas
Campanhas
Conteúdos
Landing pages
Formulários/captação
Segmentos e públicos
Automações/cadências
Origem de leads
Conversão/funil
Biblioteca de mensagens
Métricas
```

Não declarar CAC, CPL, ROI, conversão, campanha ou cadência como dado real sem origem persistida, fórmula rastreável e ação contextual.

### Configuração

Mapear, sem criar fonte concorrente:

```text
Perfil institucional
Catálogo e preços
Equipe e acessos
Integrações
Modelos e templates
Parâmetros
Dados técnicos
Qualidade/auditoria
```

O perfil institucional exige atenção especial: o CNPJ institucional continua em fontes paralelas identificadas e não deve ser "corrigido" por sincronização parcial durante esta auditoria.

### App Cliente

Usar exclusivamente a taxonomia aprovada:

```text
Home
Jornada
Radar
Árvore
Documentos
Legado
Conta
```

Para cada tela, verificar:

```text
rota
→ fonte do conteúdo
→ filtro por acesso/organização/caso/participante
→ conteúdo efetivamente liberado
→ ação disponível
→ escrita real ou leitura deliberada
→ separação de dados internos e dados de cliente
→ comportamento de owner/admin em visualização autorizada, se houver
```

Não renomear, fundir ou substituir as telas durante o mapeamento.

## Resultado esperado da auditoria

Ao término, o Mapa de Autoridade Admin deverá distinguir de modo explícito:

```text
- o que funciona e foi validado;
- o que está implementado em código e aguarda preview;
- o que é lista ou leitura deliberada;
- o que possui função sem UI;
- o que tem UI sem persistência verificada;
- o que depende de integração externa;
- o que representa risco de fonte paralela;
- a primeira correção mínima por área.
```

Nenhuma dessas conclusões, isoladamente, autoriza iniciar P3, P4, P9, integração externa ou revisão visual ampla.
