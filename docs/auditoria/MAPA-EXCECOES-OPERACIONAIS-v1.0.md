# Mapa de exceções operacionais e documentos — v1.0

Entidade canônica única: `public.ops_excecoes` (RLS por organização, inserção/edição restrita ao papel `admin`, auditoria em `audit_logs`). Não existe entidade paralela de exceções.
Catálogo executável: `src/lib/varredura-autorizacoes.ts` → consumido por `src/lib/ops.server.ts` (`TIPOS_EXCECAO`) e pela tela `/ops-excecoes`.

## Catálogo (12 tipos)

| Tipo | Quando ocorre | Prazo padrão | Regularização | Impacto enquanto pendente |
|---|---|---|---|---|
| Micro-entrega em caso pausado | entrega precisa avançar com caso pausado | 30 dias | reativar caso ou concluir entrega | item na fila com selo de exceção |
| Reabertura de caso encerrado | caso encerrado volta a operar | sem prazo | encerrar novamente com motivo | histórico anterior preservado |
| Desbloqueio de tarefa | dependência não se resolverá a tempo | 15 dias | resolver dependência original | bloqueio visível como pendência assumida |
| Prazo excedido | SLA estourado por decisão consciente | 15 dias | repactuar prazo e concluir | atraso segue contabilizado |
| Documento pendente | etapa avança sem documento legível | 30 dias | anexar/substituir e revisar | documento pendente; nada trava |
| Dado cadastral incompleto | pessoa/dependente sem campo obrigatório | 30 dias | completar cadastro canônico | campo ausente sinalizado nas prévias |
| Proposta incompleta aprovada | aprovação antes das páginas 1–7 | 15 dias | completar e revalidar conferência | conferência de escopo em aberto |
| SKU/preço não homologado | escopo usa item fora da base | 15 dias | homologar na fonte mestre | fila de saneamento do catálogo |
| Condição comercial fora do padrão | desconto/parcelamento fora da matriz | 30 dias | homologar ou ajustar | sinal comercial no Painel Hoje |
| Consentimento pendente | avanço interno antes do aceite | 15 dias | coletar consentimento ou dispensa | nenhuma liberação ao cliente |
| Contrato sem anexo aplicável | versão gerada antes do anexo | 15 dias | vincular anexo e gerar nova versão | prévia interna destaca falta |
| Divergência de escopo proposta × OS | escopos não coincidem | 15 dias | reconciliar na fonte canônica | divergência na conferência de escopo |

Regras: toda exceção exige motivo (mín. 10 caracteres), autora e organização; o prazo padrão é aplicado automaticamente quando a proprietária não informa data; exceção regularizada nunca é tratada como vencida (`excecaoVencida`). Exceção vencida e não regularizada continua visível — nunca é apagada.

## Documentos ao longo do ciclo

Etapas que aceitam documento: lead, discovery, proposta, contrato, ordem de serviço, onboarding, pesquisa, entrega e pós-entrega.

- Registro de documento pode ser criado **antes** do arquivo existir (`storage_path` opcional em `documents`).
- Anexo posterior, substituição com versão (`versao`, `versao_substituta`) e reclassificação (categoria, sensibilidade, visibilidade, status) são operações internas auditadas.
- Não há exclusão física: apenas arquivamento com motivo, autor e data.
- Liberação/publicação ao cliente é **ação externa** com confirmação final explícita.
