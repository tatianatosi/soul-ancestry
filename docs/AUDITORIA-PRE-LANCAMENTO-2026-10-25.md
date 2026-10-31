# Auditoria pré-lançamento — 25/10/2026

Cartographer, orçamento médio: 11 segmentos revisados por especialistas
(auth/sessão, persistência, contrato, comercial/catálogo, GoLive, CRM/leads,
pesquisa, jornada/planejador, telas diversas do Desk, lib diversa, App Cliente).
Relatórios completos em `.cartographer/reports/` (local, não versionado).
Mapa do projeto: `docs/CODEBASE_MAP.md`.

Cada achado abaixo foi conferido no banco vivo (`liiqqibnirnpnvjmjrpj`) ou no
código antes de corrigir.

## Corrigido hoje (PR #197)

### Banco (aplicado no Lovable Cloud, registrado em `supabase/pendentes/`)
- Pilotos: Ana ativada; 19 bloqueios do piloto arquivados.
- 118 funções de proteção cedem à proprietária (`20261025160000`).
- Taxonomias da Biblioteca voltam a aceitar edição (`20261025220000`).

### Consultas que falhavam em silêncio
| O quê | Efeito antes |
|---|---|
| `documents.is_demo` (coluna não existe) em 5 leituras do App | Documentos/Entregas/Jornada do App vazios |
| `genealogical_sources_catalog.pais` → `pais_eixo` | seletor de fonte vazio na pesquisa |
| `data_origin` fora do CHECK em 3 escritores | registrar interação, fechamento de caso e interação do CRM sempre falhavam |
| `crm_interactions.tipo` fora do CHECK | cópia do Discovery para o CRM nunca gravava |
| `piloto_conferencia.status` (não existe) | diagnóstico mostrava bloqueio falso |
| status `pendente/enviado` em solicitações documentais | contador sempre 0, não dava para cancelar |
| proposta sem SKU | aprovar travava (TypeError) e a OS nunca saía |

### Segurança
- Papéis lidos pela organização inteira (qualquer membro virava "admin") em
  onboarding, biblioteca de mensagens, pesquisa, documentos e gestão do portal.
- `/devolutiva` (one-pages com nomes de clientes) estava aberta sem login.
- Envio de documento do cliente aceitava qualquer caminho de arquivo.

### Autoridade da proprietária
- Telas: "Salvo e conferido" só quando o banco guardou de fato; sem digitar
  PUBLICAR/ATIVAR; sem mínimo de caracteres em motivos.
- Servidor: sequência do GoLive, envio para assinatura, OS sem proposta
  aprovada, solicitação/entrega/ticket em caso ainda não ativado.

## Corrigido em 26/10 (segunda rodada, "fix all")

| Item | O que mudou |
|---|---|
| Cliente reconvidado trancado | `portal-vinculo.ts` escolhe o vínculo ativo/mais recente em vez de falhar com duas linhas |
| App sem "Sair" | botão "Sair do App" na Conta (fora da prévia do admin) |
| Caso perdido ao trocar de aba | `LinkPortal` mantém `?casoId` |
| Login trancável | o limite próprio não bloqueia mais o formulário (Supabase já limita); falhas seguem registradas |
| Diagnósticos sem login | conexão: só admin ativo com token; rotas: só equipe |
| Microentregas no caso piloto | rascunhos do App exigem escolher o caso |
| Painel Hoje | decisões e microentregas dizem de qual caso são; leitura dos casos em paralelo (lotes de 8) |
| Onboarding | pagamento confirmado satisfaz "cobrança aprovada"; recálculo não volta o plano de estado |
| /calls | consentimento envia a versão do aviso; SPIN e anotações não vazam entre leads |
| Faturas no caso do App | só para o contratante (fail-closed) |
| Envio do cliente | tamanho/tipo conferidos no arquivo armazenado |
| Idioma e marca | `lang="pt-BR"`, páginas de erro em português, "Clube Ancestral" na prévia de e-mail |
| Vercel | `vercel.json` removido |

## Corrigido em 26/10 (terceira rodada — demais achados dos 6 relatórios)

| Item | O que mudou |
|---|---|
| Homologação de SKU | item com pendência marcado "Homologar" nunca chegava ao servidor (filtro duplicado descartava antes); diálogo sem ids não fecha mais em silêncio |
| Caso 360 — marcos do App | "Aprovar para o cliente"/"Revogar" trocaram botão cru (gated por flag de vínculo, sem confirmação) por `AcaoOperacional` — nunca some sem explicação |
| Alertas / Microentregas | falha de leitura não aparece mais como "vazio"; KPI mostra "…"/"—" em vez de "0" |
| Importações | editar CSV/mapeamento depois de pré-visualizar invalida a prévia |
| Matriz jurídica | dois diagnósticos liam `legal_clause_matrix` sem filtro de organização (dependiam só de RLS) |
| Checklist cadastral | "completo" não existe no CHECK da coluna — item sempre contava como pendente (2 lugares) |
| Condição comercial | mesmo bug de comparação ("pendente" não existe no CHECK) deixava a pendência invisível no diagnóstico da cadeia |
| Evento de conversão | case_id/lead_id do cliente iam para dentro de uma string de filtro `.or()` do PostgREST; INSERT trocou `{ ...data }` por payload explícito |
| /calls | link de navegação ao handoff travava com `pointer-events-none` mesmo a ação real já liberando a proprietária com aviso |
| leads.tsx | validação no cliente ignorava o modo livre da proprietária |
| Planejador | SKU sem o campo `elegivel_para_proposta` preenchido sumia da lista (`NULL <> false` é NULL em SQL, não verdadeiro) |
| Compartilhar achado (App) | titular podia compartilhar com client_id de outra família; a policy de SELECT deixaria essa pessoa ler. Checagem extra: destinatário precisa ter acesso ativo ao mesmo caso |
| Mensagens de erro (App) | 11 pontos devolviam texto cru de Postgres/Storage ao cliente; fatura mostrava status interno cru ("emitida") em vez de "Em aberto" |

## Ainda pendente (decisão da Proprietária ou trabalho maior)

1. **Testes vermelhos do App herdados de `main`** (Documentos, Conta, Home,
   carregamento): o texto atual veio do resgate do Lovable; decidir, tela a
   tela, se volta o texto antigo (como nos rótulos L3/L4) ou se os testes
   passam a seguir o texto novo.
2. ~~**Remover papel apaga a linha de `user_roles`**~~ — **corrigido em
   27/10, autorizado ("Autorizado item 02 para os dois juntos")**: coluna
   `archived_at` aplicada no banco real + `equipe.server.ts` e
   `definirPapel` (`saas.functions.ts`) trocaram `.delete()`/`.insert()`
   por soft-delete/upsert + as 13 leituras de papel em todo o código
   passaram a filtrar `archived_at is null`. Registrado em
   `supabase/pendentes/README.md`.
3. ~~**Telas extras do App ainda roteáveis** (`/portal/casos/$id`,
   `/portal/mensagens/$id`, `/portal/faturas`)~~ — **`/portal/faturas`
   corrigido em 26/10** (achado da Proprietária: "Invoices são as faturas
   dos clientes revise"). Confirmado por grep: a rota existia com RLS e
   gate de contratante prontos (`minhasFaturas`, `portal_sou_contratante_financeiro`),
   mas nenhuma das 7 abas canônicas linkava para lá —
   `PORTAL_ROTAS_FORA_DO_SPEC` já registrava a opção recomendada "A.
   Faturas dentro de Conta". Implementada: seção "Faturas" dentro da aba
   Conta, mesma função/gate/fail-closed da rota solta, sem criar 8ª aba.
   `/portal/casos/$id` e `/portal/mensagens/$id` continuam como pendência —
   decidir para onde cada link vai. A falha de segurança (fatura de
   não-contratante) já tinha sido fechada antes.
4. ~~**Duas máquinas de contrato** (parâmetros × contratos) e **preços
   escritos no código** (`catalogo-homologacao.ts`)~~ — **verificado em
   26/10, era leitura apressada minha, não achado real.** `contracts`
   (status, gates, assinatura, `signature_reference`) e
   `contract_case_parameters` (conteúdo/parametrização) são ligadas por
   `contract_id` (FK real) e o código já usa a ligação
   (`contrato-parametros.functions.ts:242-243` lê `contracts` a partir de
   `registro.contract_id`) — não são duas máquinas competindo pelo mesmo
   papel, são duas tabelas de responsabilidades diferentes (ciclo de vida
   × conteúdo), devidamente unidas. `contracts` não tem nenhuma coluna de
   preço/valor — confirmado por grep no schema gerado. Os dois números em
   `catalogo-homologacao.ts` (R$ 280, R$ 297) são anotações de referência
   de um bloqueio de governança para 3 SKUs nominados
   (`DECISOES_INICIAIS`), nunca lidos por nenhuma tela ou fluxo de preço —
   só por `catalogo-homologacao.functions.ts`, server-side, para decidir
   se o SKU está liberado para proposta. Nada a decidir aqui; nada a
   corrigir.
5. ~~**`validarLead`**~~ — **todas liberadas em 27/10, autorizado ("Pode
   liberar todas as proteções do item 5")**: as 5 regras da tabela abaixo
   ganharam `!livre`. A inconsistência achada (746-749 duplicava a regra já
   livre na 708, sem o guard) foi resolvida igualando as duas.
   | Linha | Regra liberada |
   |---|---|
   | 692-697 | Pagamento inicial confirmado exige `asaas_evento_referencia` |
   | 699-701 | Onboarding iniciado exige `asaas_evento_referencia` |
   | 732-744 | Consentimento concedido exige data/canal/versão do aviso; gravação sem consentimento é bloqueada |
   | 746-749 | Elegibilidade Forte/Provável exige `confianca_triagem` + `linha_transmissao` |
   | 752-753 | Escopo de pesquisa prévia exige autorização registrada |

   Vocabulário controlado (`CATALOGOS`, linhas 650-655; escopo/nacionalidade,
   755-759) e nome/e-mail continuam sem `!livre` — integridade estrutural
   de dado, fora do pedido (não eram proteção de negócio, por isso não
   entraram na lista original).
6. ~~**`leads.tsx`**: trocar de lead no kanban, "Abrir ficha" ou fechar a
   ficha descarta rascunho não salvo sem aviso~~ — **corrigido em 26/10**.
   Extraído `trocarDeLead` (reaproveita o banner inline que a lista já
   desenhava — "Descartar e abrir o outro lead" / "Continuar editando" —,
   sem `window.confirm`) e aplicado nos três pontos. Teste dedicado:
   `leads-descarte-rascunho-2026-10-26.test.ts`.
7. **Gestão de acessos ao portal** (`listarAcessosPortal`): lê todo o
   histórico de acesso de todos os clientes da organização sem checar papel
   — qualquer `podeEscrever` (inclusive comercial/financeiro/pesquisador) vê.
   Investigado em 26/10: a rota está agrupada em "Pessoas & Casos" no menu
   (`navegacao-desk.ts`), não em Governança — indício de que o público
   pretendido já é mais largo que admin, não um vazamento de role. Mantido
   sem apertar: estreitar errado quebraria comercial/pesquisador sem eu
   saber qual papel depende disso hoje. Decisão de produto, não bug óbvio.

## Por que "as queries falhavam"

- No app: as leituras listadas acima pediam colunas ou valores que não existem
  no banco; o erro era engolido e a tela ficava vazia ou não salvava.
- Nesta sessão de trabalho: os testes de banco foram feitos dentro de transação
  que se desfaz de propósito; o desfazer aparece como "Lovable API error 400"
  mesmo quando o teste passou.
- Configuração: o app só fala com `liiqq…`; a Vercel não interfere mais.
