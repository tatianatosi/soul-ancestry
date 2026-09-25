# P2 — Reativar CRM Vivo e Painel de Calls

- Status: executado em código (24/09/2026). Falta a prova autenticada da Proprietária no Lovable.
- Decisões aplicadas (da ordem P2): `/calls` = Mesa de Discovery, entrada canônica do CRM Vivo; `/leads` = Leads e Triagem sobre a mesma tabela `leads`; `/crm-mestre` = mapa de regras, sem escritor de lead; Contato = vínculo do Lead/Pessoa Canônica, nunca registro concorrente.
- Sem CRM, kanban, planilha de contatos ou aba principal paralelos. Nenhuma tabela nova. Nenhuma migration aplicada.

## O que já existia (conferido, não refeito)

| Item | Onde |
|---|---|
| Call/Discovery persistida no lead (data agendada/realizada, status, resultado, resumo, responsável, próxima ação datada, handoff) | `leads` via `salvarLeadDesk` (`src/lib/crm-desk.functions.ts`), com `gravarComVerificacao` (grava e relê) |
| `/calls` e `/leads` sobre o mesmo registro | as duas telas usam `listarLeadsDesk` + `salvarLeadDesk`, mesma `queryKey ["leads-desk"]`; leitura com `semCache()` |
| Salvar, cancelar, erro, sucesso, duplo envio | botão "Gravar registro da call" desabilitado durante a gravação; "Descartar alterações"; erro de validação e de rede na tela |
| Handoff | `executarHandoffDiscovery` (`src/lib/handoff-discovery.functions.ts`) — cria/reusa pessoa e caso e só grava o vínculo no lead; o lead nunca é apagado |

## O que mudou nesta execução

| Pedido | O que mudou | Onde |
|---|---|---|
| Motivo de no-show/cancelamento | O campo aparece quando o status é no-show ou cancelada. O servidor recusa a gravação sem motivo quando o status muda para esses valores; para a Proprietária a pendência informa e não impede (política de autoridade operacional) — a trilha registra "motivo pendente". O motivo vai para a trilha do lead (não há coluna própria; nenhuma migration) | `painel-calls.tsx`, `salvarLeadDesk`, `src/lib/crm-vivo.ts` (`eventosDeCall`, `exigeMotivoDeCall`, `statusPedeMotivo`) |
| Fila CRM Vivo | Sete filas na Mesa, derivadas das mesmas linhas de `leads`: call sem registro, discovery sem desfecho, lead sem responsável, lead sem próxima ação, qualificação pendente, aceite verbal sem confirmação formal, pronto para handoff. Cada nome abre o lead na própria Mesa. Lead arquivado, perdido ou já convertido (com caso) sai das filas | `filaCrmVivo` (`src/lib/crm-vivo.ts`), bloco `data-fila-crm-vivo` em `painel-calls.tsx` |
| Trilha do lead | Eventos nomeados em `audit_logs` (entidade `lead`): call agendada, call realizada, no-show, call cancelada, discovery concluída, handoff concluído, conversão em pessoa canônica e caso. Só a mudança vira evento — regravar o mesmo estado não duplica. Leitura `trilhaDoLead`, filtrada pela organização; bloco "Trilha do lead" na Mesa | `registrarEventosCall` (`crm-desk.functions.ts`), `registrarHandoffNaTrilhaDoLead` (`handoff-discovery.functions.ts`), `TrilhaDoLead` (`painel-calls.tsx`) |
| Contatos como vínculo | Card "Contatos" na Pessoa 360: lista `client_contacts` da pessoa, adiciona e arquiva (com motivo, sem exclusão física). Recusa, sem fundir: contato que é a própria pessoa, contato que já é outra pessoa canônica (mostra o link para a Pessoa 360 dela) e contato repetido | `adicionarContatoPessoa`, `arquivarContatoPessoa`, `carregarPessoa` (`src/lib/pessoa.functions.ts`), `avaliarNovoContato` (`crm-vivo.ts`), `src/components/pessoa/contatos-pessoa.tsx` |

## Limites declarados

- **Trilha visível só para administrador.** A RLS vigente de `audit_logs` (`audit_select_admin`) só deixa administrador da organização ler. Para os demais, o bloco diz que não há evento visível e que os eventos continuam sendo gravados. Não alterei RLS.
- **Contato extra antes da conversão.** `client_contacts.client_id` é obrigatório: um lead ainda sem pessoa canônica não guarda contatos extras além do próprio e-mail e telefone. Depois da conversão, os contatos vivem na Pessoa 360. Para guardar contatos também antes da conversão, a migração mínima seria esta — **registrada aqui, não aplicada** (depende de autorização explícita de banco):

```sql
-- Proposta P2 (não aplicada): contato ligado ao lead antes da conversão.
alter table public.client_contacts
  alter column client_id drop not null,
  add column if not exists lead_id uuid references public.leads(id);
alter table public.client_contacts
  add constraint client_contacts_dono_chk check (client_id is not null or lead_id is not null);
create index if not exists idx_client_contacts_lead on public.client_contacts(lead_id);
-- No handoff: update client_contacts set client_id = <pessoa> where lead_id = <lead> and client_id is null.
```

  Resultado desse ponto: `BLOQUEADO_POR_DECISAO`.
- **Filas do Painel Hoje.** O Hoje continua com as filas próprias (`montarFilasHoje`); a Mesa usa as mesmas regras (`discoverySemDesdobramento`, `aceiteSemConfirmacaoFormal`), sem cópia de dado.

## Testes

`src/lib/__tests__/p2-crm-vivo-2026-09-24.test.ts` (22 casos): mesmo lead em `/calls` e `/leads`; releitura e leitura sem cache; as sete filas aparecem e somem conforme o estado (inclusive arquivado, perdido e convertido); eventos só na mudança; motivo exigido no servidor e na tela; handoff e conversão na trilha nos dois ramos, sem apagar o lead; contatos não duplicam pessoa; filtros por `organization_id` em toda leitura/escrita nova.

## Prova visual (Lovable, sessão autenticada da Proprietária)

Com dado sintético reversível (nome sem "teste/demo/sandbox"):

1. `/calls`: escolher um lead, mudar "Status da call" para No-show → aparece "Motivo do no-show ou cancelamento"; o botão de gravar fica bloqueado até o motivo ser preenchido. Gravar. Recarregar a página: o status continua No-show e a "Trilha do lead" mostra "No-show · motivo: …".
2. Na mesma Mesa, conferir a "Fila CRM Vivo": o lead some de "Call sem registro" quando o registro é completado e de "Lead sem próxima ação" quando ganha próxima ação com data.
3. Abrir `/leads`, localizar o mesmo lead: mesmo status, mesmo resumo e mesma próxima ação, sem divergência.
4. Converter pela Mesa ("Converter em cliente/pessoa canônica e abrir o caso"). Voltar a `/calls?lead=<id>`: a trilha mostra "Handoff concluído" e "Convertido em pessoa canônica e caso"; o lead não aparece mais nas filas.
5. `/pessoas/<id>` da pessoa convertida: card "Contatos" → adicionar um contato novo (grava e reaparece após recarregar); tentar adicionar um contato com o e-mail de outra pessoa cadastrada → recusa com link "Abrir a Pessoa 360".

Prints exigidos: inicial, ação, confirmação, releitura e integração, no registro `docs/relatorios/2026-09-11_registro-prova-autenticada.md`.
