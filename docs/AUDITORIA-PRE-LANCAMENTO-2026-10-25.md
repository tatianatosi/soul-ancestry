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

## Pendente (não corrigido — precisa de decisão ou é maior)

### Antes do lançamento (P0/P1)
1. **App Cliente — testes vermelhos herdados de `main`** (Documentos, Conta,
   Home, carregamento): depende do fim do resgate do Lovable e da decisão de
   texto, tela a tela.
2. **Cliente reconvidado fica trancado**: revogar não arquiva o acesso antigo;
   o reconvite cria segunda linha e `.maybeSingle()` falha
   (`portal.functions.ts:196`, `portal.server.ts:192`).
3. **App sem botão "Sair"** e links de aba que perdem `?casoId` (família com
   mais de um caso vê casos diferentes por aba) — `fonte-portal.tsx:213`.
4. **Login: limite de tentativas** pode trancar a proprietária e não protege
   o caminho real de senha (relatório auth-session H2).
5. **Endpoints de diagnóstico sem login**: `equipe.diagnostico-conexao`,
   `equipe.diagnostico-rotas`.
6. **`/microentregas` e o Painel Hoje** montam o GoLive sem `?casoId` e caem
   no caso piloto (Ana).
7. **Onboarding**: `cobranca_aprovada` não é satisfeito pelos checks; o
   recálculo volta plano `em_andamento` para `liberado_preparacao`.
8. **/calls**: botão "Confirmar consentimento" sempre recusado (falta a versão
   do aviso); campos SPIN carregam texto do lead anterior ao trocar de lead.

### Depois do lançamento (P2)
- `confirmarEnvioDocumento`/uploads: tamanho e tipo conferidos só no navegador.
- `definirPapel` apaga `user_roles` fisicamente (contra a regra de não excluir).
- Três telas extras ainda roteáveis no App (`/portal/casos/$id`,
  `/portal/mensagens/$id`, `/portal/faturas`; esta última sem a checagem de contratante).
- Painel Hoje: ~1.000 consultas sequenciais por carga (`pendenciasCadeiaPainel`).
- Duas máquinas de contrato (parâmetros × contratos) sem amarração forte.
- Preços e decisões de catálogo escritos no código (`catalogo-homologacao.ts`).
- `<html lang="en">` e página de erro em inglês; marca antiga "Ancestral Canvas" no e-mail.
- `vercel.json` e comentários da Vercel podem sair.

## Por que "as queries falhavam"

- No app: as leituras listadas acima pediam colunas ou valores que não existem
  no banco; o erro era engolido e a tela ficava vazia ou não salvava.
- Nesta sessão de trabalho: os testes de banco foram feitos dentro de transação
  que se desfaz de propósito; o desfazer aparece como "Lovable API error 400"
  mesmo quando o teste passou.
- Configuração: o app só fala com `liiqq…`; a Vercel não interfere mais.
