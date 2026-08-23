# CA-OPS-02 — Fiação: cadência, Biblioteca de Mensagens e catálogo de módulos

Data: 2026-08-23. Escopo: conectar sistemas já existentes, sem criar aba,
motor, fila, CRM, biblioteca ou view agregadora.

## Pré-condições comprovadas

1. **`case_id` compartilhado** — `obterPainelJornada` (`src/lib/onboarding-jornada.functions.ts`)
   devolve `casos[].case_id` e `codigo`; o atalho leva exatamente esse `case_id`
   para `/biblioteca-mensagens` como parâmetro de busca. Não há heurística de
   correspondência por nome.
2. **Sem gravação** — `src/lib/fiacao-cadencia-catalogo.ts` é puro (sem I/O),
   e o banner da Biblioteca só lê `templates` já carregados. Nenhuma chamada a
   `registrarUsoTemplate`, touchpoint, fila ou rascunho é feita ao abrir o
   modelo. As invariantes `envioExecutado: false`, `persistido: false` e
   `usoRegistrado: false` são retornadas pela resolução.
3. **Gates preservados** — a resolução não valida nem afrouxa gate algum;
   `validarUsoTemplate`/`registrarUsoTemplate` continuam sendo o único caminho
   de uso, com validação no banco (contrato, pagamento, onboarding, entrega,
   publicação). O contexto apenas exibe qual gate se aplica.

## 1. Biblioteca de Mensagens como catálogo oficial — CONECTADO

- Mapa alerta → modelo em `MAPA_ALERTA_TEMPLATE`.
- `resolverModeloVigente` só considera modelos `status = "vigente"`, não
  arquivados e não demo. Sem correspondência, devolve
  “Não há modelo vigente para este alerta.” e nada é criado.
- Atalho “Abrir modelo sugerido” ao lado de cada alerta elegível em `/ops`.
- A Biblioteca exibe contexto seguro não persistido: caso, tipo de alerta,
  severidade, gate e variáveis permitidas. Ação permitida sempre
  `abrir_preview_e_copiar_manual`.

| Alerta | Modelo esperado | Severidade | Gate |
|---|---|---|---|
| `sem_touchpoint_10d` | reengajamento/acompanhamento | alta | onboarding |
| `sem_atualizacao_14d` | atualização de andamento | crítica | entrega |
| `sem_proxima_acao` | interno de próximo passo | média | interno |
| `sem_microentrega_planejada` | interno de alinhamento de entrega | média | entrega |
| `caso_bloqueado` | condicionado ao gate aplicável | crítica | contrato/pagamento |

## 2. Onboarding-Jornada → Painel Hoje — BLOQUEADO (atalho implementado)

Motivo técnico: os contadores `alerta: true` são agregados e as ocorrências por
caso trazem apenas `case_id`, `codigo` e títulos de alerta — não trazem
severidade normalizada nem rota canônica por linha no mesmo payload. Integrar
linha a linha exigiria recalcular cadência dentro do Painel Hoje, o que é
proibido. Implementado apenas o atalho destacado
“Ver cadência e onboarding em risco” → `/ops`, no bloco existente
“Sinais de atenção”. Nenhuma tarefa, status, prazo, alerta persistido ou
contagem paralela foi criada. Registro em `INTEGRACAO_CADENCIA_PAINEL`.

## 3. Duplicidade de catálogos — INVESTIGADO

Fontes diferentes: `/biblioteca-mensagens` usa `message_templates`,
`message_template_versions` e `message_template_usage`; `bib-templates-com` é
entrada de catálogo da Biblioteca Mestre **sem fonte de dados própria e sem
rota navegável**. Nenhum dado foi migrado, fundido ou apagado. O módulo passa a
se chamar “Modelos institucionais”, com destino explícito apontando o catálogo
oficial `/biblioteca-mensagens`. Precedência: a Biblioteca de mensagens
operacionais prevalece para qualquer comunicação. Decisão humana de consolidação
fica registrada como pendente em `DUPLICIDADE_CATALOGOS_TEMPLATE`.

## 4. Catálogo de alertas — INVESTIGADO

Ver `AUDITORIA_MODULOS_ALERTA` e a matriz CSV. `desk-modulos.ts` recebeu o campo
`estadoReal` e destinos verdadeiros; onde não existe rota, o destino declara a
ausência. Nenhuma aba Alertas ou view agregadora foi criada.

## Proibições respeitadas

Nenhuma mensagem enviada; nenhuma integração externa configurada; nenhum dado,
migration, RLS, sessão, permissão, paleta, navegação ou deploy alterado; nenhum
dado demo criado.
