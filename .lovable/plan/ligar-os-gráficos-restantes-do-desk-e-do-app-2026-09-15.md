# Ligar os gráficos restantes do Desk e do App

Fechar os blocos visuais que ainda aparecem vazios nas superfícies Pesquisa, Financeiro, Jurídico, Portal/Configuração e nas sete abas do App, usando somente o que já está gravado hoje. Comercial, Hoje, Kanban, Caso 360, Pessoa 360 e Pessoas & Famílias já foram ligados nas etapas anteriores e não mudam.

## Princípio

Nada de dado novo: nenhum registro, tabela, migration, RLS, writer, catálogo, SKU, mock ou automação. Onde a informação já existe no banco mas ainda não é lida, a leitura passa a trazê-la. Onde a informação não existe, o bloco continua com o estado vazio canônico e um CTA apenas de navegação — nunca um gráfico de substituição.

## O que será ligado

**Pesquisa**
- Cobertura por tipo de fonte, evidências por estado e achados por grau de validação.
- Ritmo de produção por semana, a partir das datas já gravadas nos registros de pesquisa.
- Cadeia pergunta → fonte → evidência → achado mantida como hoje.

**Financeiro**
- Situação das faturas por estado e totais contratado, em aberto, vencido e pago.
- Recebimento por mês, a partir das datas de confirmação já gravadas nas faturas/pagamentos.

**Jurídico & Contratos**
- Pipeline de formalização por estado: proposta, escopo, contrato, anexos e ordem de serviço.
- Itens de escopo que exigem revisão humana e instrumentos assinados versus pendentes.
- Prazos continuam vazios enquanto não houver campo de prazo gravado.

**Portal / Configuração Master**
- Publicações por estado, acessos por situação e e-mails autorizados por estado.
- Linha de publicações no tempo, usando a data de publicação já registrada.
- Cobertura por aba do App permanece vazia: a projeção não declara aba de destino.

**App Cliente (espelho interno, sete abas)**
- Home: etapa atual, próximo passo e última publicação.
- Jornada: marcos e linha do tempo das publicações.
- Documentos: contagem por situação liberada ao cliente.
- Legado: descobertas aprovadas e conteúdo publicado.
- Conta: titular, participantes autorizados e situação de acesso.
- Radar do App e gerações da Árvore continuam vazios: as seis dimensões publicáveis e a geração familiar ainda não existem como dado.

## Detalhes técnicos

- Componentes novos apenas visuais em `src/components/golive/graficos.tsx`: rosca (donut) e série temporal reutilizáveis, no mesmo padrão de `Barras`, `Linha` e `Escada`.
- Cálculos puros e testáveis em módulos irmãos de `golive-operacao.ts` / `golive-comercial.ts`, com data de referência injetável.
- `src/lib/golive.functions.ts` passa a expor campos de data e estado que já existem nas tabelas lidas (publicação, confirmação de fatura, criação de evidência/achado), sem nova tabela ou consulta a eixo paralelo.
- Filtros continuam por identificador: `organization_id`, `case_id`, titular e arquivado. Nunca por nome ou texto.
- Testes unitários dos novos cálculos, `tsgo --noEmit` e build.

## Entrega

Prévia navegável, screenshots desktop e 375 px das superfícies alteradas, e tabela de fonte/cálculo/estado vazio por bloco. Sem publicação em produção, sem commit, push, merge ou deploy.
