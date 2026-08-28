# Fechamento e critério de go-live operacional (PROMPT 10)

**Data:** 25/08/2026 · Consolida os PROMPTs 01–09 executados nesta sessão e o
estado do repositório em `claude/ancestral-club-desk-intelligence-0gsoeg`.
Estados permitidos por você: `OPERACIONAL_COMPROVADA`,
`OPERACIONAL_COM_RESSALVAS`, `IMPLEMENTADO_LOCAL`,
`CONFIGURADO_PENDENTE_DE_TESTE`, `DOCUMENTADO_SEM_IMPLEMENTACAO`,
`PENDENTE_DE_VALIDACAO_HUMANA`, `BLOQUEADO_POR_GATILHO`,
`NAO_LOCALIZADO_NESTA_SESSAO`. Código, teste local ou build verde **não** é
tratado como prova de operação real em produção — só como prova de que o
código existe e se comporta como descrito.

## PROMPT 08 — validação autenticada em produção: não executada

Este ambiente não tem sessão autenticada no domínio publicado nem
credenciais de homologação. Estado: **`NAO_COMPROVADO_NO_DOMINIO_PUBLICADO`**
para todo o roteiro E2E pedido (login Proprietária/cliente, navegação,
Painel Hoje, override de teste, isolamento do portal, ausência de SKU/preço
no App Cliente). Nenhuma hipótese local substitui essa prova — os itens
abaixo que dependem de prova autenticada estão marcados
`CONFIGURADO_PENDENTE_DE_TESTE` ou `PENDENTE_DE_VALIDACAO_HUMANA`, nunca
`OPERACIONAL_COMPROVADA`.

## Matriz de prontidão

| Capacidade | Dono | Fonte de verdade | Evidência | Estado final | Lacuna residual | Decisão pendente |
| --- | --- | --- | --- | --- | --- | --- |
| Case_ID canônico (Ana Luiza) | Proprietária | `owner_override_events` | `PEND-01` resolvido 22/08: `CA-CID-AT-FAM-2026-001` canônico | `OPERACIONAL_COMPROVADA` (localmente) | Nenhuma no código; prova em produção pendente do PROMPT 08 | — |
| Opportunity_ID / CRM | Engenharia | `crm-mestre`, `fluxo-canonico.tsx` | `opportunity_id` real em uso, schema confirmado | `OPERACIONAL_COM_RESSALVAS` | Sem prova autenticada em produção | — |
| Override auditável da Proprietária | Engenharia | `override-proprietaria-comercial.ts` | 26 testes, evento imutável, escopo por tipo | `IMPLEMENTADO_LOCAL` | Sem UI própria ainda (só motor + servidor); sem uso em produção | Priorizar tela dedicada, se quiser antes de usar de verdade |
| Ana Luiza — INICIAR_ANTES_DO_PAGAMENTO | Proprietária | Mesmo módulo, fixture testado | Condição original preservada, escopo limitado, sem inferir pagamento | `PENDENTE_DE_VALIDACAO_HUMANA` | Decisão real ainda não registrada — só a capacidade existe | Você decide se registra a exceção de verdade para o caso |
| Materialização de Anexo I (D-02) | Engenharia | `ressincronizarAnexosDoCaso` | Bug confirmado, corrigido, dois-passos simular/confirmar, testado | `IMPLEMENTADO_LOCAL` | Não executado sobre o caso real da Ana ainda | Rodar "Ver o que será feito" → "Sincronizar agora" na tela do caso |
| Materialização de Anexos II/IV/V | Engenharia | `anexos-materializacao.ts` | Motor pronto e testado desde antes desta sessão | `CONFIGURADO_PENDENTE_DE_TESTE` | Texto jurídico aprovado ainda não recebido (os 5 modelos enviados são formulários em branco, não conteúdo preenchido) | Enviar o conteúdo já preenchido e aprovado |
| Contrato-base — versão | Jurídico/Proprietária | `contrato-base-consolidado.ts` | Código = v1.0; documento colado = v2.0 | `PENDENTE_DE_VALIDACAO_HUMANA` | Divergência de versão não resolvida | Confirmar se v2 é aprovação nova ou o mesmo v1 relabelado |
| Catálogo — preço sugerido vs. atual | Proprietária | Planilha Mestre (`catalogo-fonte-mestre.ts`) | 24/30 SKUs operacionais divergentes, mapeados em `CA-AUD-09` | `PENDENTE_DE_VALIDACAO_HUMANA` | Homologação formal ainda não aplicada às 24 linhas | Aprovar aplicação em bloco (mesma regra de CA-CID-023) |
| Links Asaas | Financeiro | Planilha Mestre | 23 com link, 7 `revisar_manual`, 0 sem link | `DOCUMENTADO_SEM_IMPLEMENTACAO` (sem API real) | Sem conexão real ao Asaas neste repositório | Revisar os 7 manualmente antes de qualquer cobrança |
| CA-CURSO-001 (Arquivado) | Proprietária | `ca06-catalogo-operacional.ts` | Bloqueio ativo confirmado, sem oferta ativa | `OPERACIONAL_COMPROVADA` (localmente) | Nenhuma | Reativar ou não — decisão já enquadrada, sem prazo |
| Fila de follow-up do Painel Hoje | Engenharia | `fila-follow-up-proprietaria.ts` | Dedup + precedência testados, fixtures Ana/João/Lara | `IMPLEMENTADO_LOCAL` | Não wireada ao Painel Hoje real ainda (só o motor) | Decidir se entra na tela agora ou fica para depois |
| Agenda assistida | Engenharia | `agenda-assistida.ts` | 4 estados, sanitização de pauta testados | `IMPLEMENTADO_LOCAL` | Sem UI; sem conector de calendário no repositório | — |
| Rascunhos governados de comunicação | Engenharia | `rascunhos-comunicacao-governados.ts` | Templates de João/Lara versionados, sem handler de envio (testado) | `IMPLEMENTADO_LOCAL` | Sem UI própria; textos ainda não revisados por você | Aprovar ou ajustar o texto dos dois modelos |
| Financeiro/Asaas (execução real) | Financeiro | `varredura-completude.ts` PEND-08 | "Preparadas, nunca executadas" | `CONFIGURADO_PENDENTE_DE_TESTE` | Sem transação real | — |
| Webhooks/integrações | Engenharia | `varredura-completude.ts` PEND-13 | "Intenção preparada" | `DOCUMENTADO_SEM_IMPLEMENTACAO` | Sem implementação | — |
| Validação autenticada em produção | — | — | Não executável neste ambiente | `NAO_COMPROVADO_NO_DOMINIO_PUBLICADO` | Sem sessão/credencial disponível | Rodar quando houver ambiente de homologação acessível |

## Risco aceito vs. não aceito

- **Aceito nesta sessão** (dentro do escopo já autorizado por você): registrar
  a capacidade de override auditável sem efetivar nenhuma exceção real;
  corrigir o bug D-02 no motor sem rodar a sincronização sobre o caso real;
  preparar rascunhos de comunicação sem nenhum envio.
- **Não aceito / não decidido**: aplicar a homologação de preço às 24 linhas
  divergentes; registrar de fato a exceção `INICIAR_ANTES_DO_PAGAMENTO` para
  Ana Luiza; confirmar a versão do contrato-base; usar os textos de
  João/Lara sem sua revisão prévia.

## Não foi feito nesta sessão (fora do alcance seguro)

- Nenhum deploy, comunicação real, cobrança, assinatura, publicação ou
  integração externa.
- Nenhuma migration ou alteração de RLS.
- Nenhum dado real de caso foi alterado — só código, testes e documentação.
