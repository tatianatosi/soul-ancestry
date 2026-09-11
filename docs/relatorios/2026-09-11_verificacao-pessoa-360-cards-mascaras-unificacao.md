# Verificação — Pessoa 360 / artefato CA-008 vs runtime (cards + máscaras)

**Data:** 2026-09-11  
**Disparo:** prints `/pessoas/…` (Cliente de Homologação) + pedido de conferir artefato/prompt vs `/clientes`  
**Status:** inventário (sem implementação nesta fatia)

## 1. Veredito curto

Você tem razão: **não há cadastro unificado fechado**. Existe:

- schema civil em `clientes` (camada 1);
- tela `/pessoas/$clienteId` que **agrega cards** por referência;
- lista operacional `/clientes` (pré-cliente / ativação) **sem** o formulário canônico completo nem máscaras.

O artefato **CA-PESSOA-360-UNIFICACAO-008** ainda exige conversão Lead→Cliente, CTAs de ambiguidade, backfill, aceite A×B e o relatório de saída `2026-09-05_pessoa_360_unificacao_execucao.md` — **esse arquivo não existe no repo**.

## 2. Fontes canônicas conferidas

| Artefato / prompt | Papel |
|---|---|
| [`ARTEFATO_CA-PESSOA-360-UNIFICACAO-008.md`](../evolucao/recuperados/prompts-execucao-2026-09-11/ARTEFATO_CA-PESSOA-360-UNIFICACAO-008.md) | Execução: `clientes.id` canônico; seções Comercial, Casos/Contratos, Família, Pesquisa, Documentos/Consentimentos, Histórico; nav; aceite homologação |
| [`2026-09-03_PESSOA-360-CONJUNTO-UNIFICADO-DE-DADOS.md`](../arquitetura/2026-09-03_PESSOA-360-CONJUNTO-UNIFICADO-DE-DADOS.md) | 5 camadas (civil, vínculo, pesquisa G-02, módulos de vida, App) — unificar = FK/leitura, não fusão |
| [`PESSOA-CANONICA-MODELO-DE-CAMPOS-2026-08-31.md`](../arquitetura/PESSOA-CANONICA-MODELO-DE-CAMPOS-2026-08-31.md) | Campos + **máscaras CPF/CEP/telefone/UF** |
| [`2026-09-05_execucao_pessoa_360_operacional.md`](2026-09-05_execucao_pessoa_360_operacional.md) | O que já foi colado na rota `/pessoas` (blocos) |
| Fatias 2026-09-11 | Nav + próxima ação nos cards de Caso (PR #101) — **não** = unificação |

## 3. Cards em `/pessoas/$clienteId` (código × print)

Arquivo: [`src/routes/_authenticated/pessoas.$clienteId.tsx`](../../src/routes/_authenticated/pessoas.$clienteId.tsx)

| Card / seção | No print / código | Vs artefato CA-008 |
|---|---|---|
| **Quem é** (contato + Dados civis + Endereço + Editar) | Sim | Parcial — é a edição canônica civil; sem bloco “Comercial” separado |
| **Casos** (cards com próxima ação, Formalização, Jornada, Caso, App) | Sim (print mostra 1 caso + “Abrir visão do cliente”) | Parcial — boa; não substitui Caso 360 |
| **Núcleo familiar e papéis** | Sim (0 vínculos no print) | Parcial |
| **Propostas, contratos e documentos** | Sim (3 colunas vazias no print) | Parcial — falta Consentimentos / privacidade como seção |
| **Conteúdo publicado para o App Cliente** | Sim (2 projeções: arvore + marco) | Extra útil; não estava no checklist mínimo do §4, mas alinha App |
| **Antes de virar cliente** (leads candidatos) | No código (abaixo da dobra) | Parcial — conversão/vínculo manual; não é fluxo Lead→Cliente completo do §4.1 |
| **Pesquisa genealógica interna** | No código | Parcial — match por nome, sem FK |
| **Linha do tempo** | No código | Parcial — eventos de caso, não timeline unificada 5 camadas |
| Comercial (status, ativação, origem comercial rica) | Só campos soltos / origem em Quem é | **Faltando** como seção |
| Documentos/Consentimentos (LGPD) | Só lista docs na coluna | **Faltando** consentimentos |
| Histórico / auditoria unificada | Linha do tempo limitada | **Faltando** |

## 4. `/clientes` — o que é de verdade

Rota: [`src/routes/_authenticated/clientes.tsx`](../../src/routes/_authenticated/clientes.tsx) · URL print: `https://soul-ancestry.vercel.app/clientes`

- Lista pré-clientes / clientes com status comercial, ativação, arquivamento.
- Modal **Novo** com: nome, e-mail, telefone, origem, status, país, classificação — **sem CPF/RG/endereço/dados civis**.
- **Nenhuma** importação de `formatarCpf` / `formatarTelefone` / `formatarCep`.
- Link para Pessoa 360 existe em fluxos relacionados; a lista em si **não é** o cadastro unificado.

Conclusão: `/clientes` = carteira comercial; `/pessoas/$id` = ficha 360 parcial. Cadastro unificado = ainda **dois mundos**.

## 5. Máscaras — onde estão e onde falham

Módulo: [`src/lib/validacao-pessoa.ts`](../../src/lib/validacao-pessoa.ts) (`formatarCpf`, `formatarCep`, `formatarTelefone`, `cpfValido`, `UFS_BRASIL`).

| Superfície | CPF | Telefone | CEP | RG | UF select |
|---|---|---|---|---|---|
| Pessoa 360 — **modo Editar** | Sim (`mascara: formatarCpf`) | Sim | Sim (campo CEP no form) | **Não** (texto livre número + órgão/UF) | Sim |
| Pessoa 360 — **modo leitura** | **Não** — `valor={cliente.cpf}` cru | Cru | Endereço concatenado cru | Cru | — |
| `/clientes` criar/editar modal | **Não** | **Não** | n/a | n/a | n/a |
| Caso 360 (trechos) | Usa formatadores em alguns inputs | parcial | parcial | — | — |

PR histórica **#69** (máscara CPF/CEP/UF/telefone) constava como draft não mesclada no quadro; o utilitário **entrou por outro caminho** e está em uso na Pessoa — mas **não** cobriu `/clientes` nem a **exibição** formatada.

No print de homologação os civis estão `—`, então máscara de digitação **não é observável** até Editar com valor.

## 6. Unificação — o que falta (sem inflar)

```text
Lead ──(parcial: evidência + vínculo manual)──► clientes
clientes ◄── Pessoa 360 (leitura agregada)
   │
   ├── crm_casos / núcleo / contrato / proposta / docs  (cards OK se FK preenchida)
   ├── genealogical_*  (só match fraco; isolamento deliberado)
   └── App  (só via app_projections — espelho no card)
```

Gaps duros do CA-008 ainda abertos:

1. Conversão Lead→Cliente com prevenção de duplicidade + histórico (não só “Antes de virar cliente”).
2. Relatório de saída §7 **ausente**.
3. Aceite homologação A×B + reload (prova autenticada Pessoa 360 = `NAO_LOCALIZADO` no registro vivo).
4. Consentimentos / comercial como seções de primeira classe.
5. Máscaras na criação em `/clientes` + formatação na leitura da Pessoa.
6. Máscara/normalização de RG (número brasileiro vs órgão/UF).
7. Unificação `contacts` ↔ `clientes` ↔ `leads` (Pessoa 360 **não** carrega `contacts`).
8. Cards “Pessoa 360 rápida” no Cockpit/Hoje (prompt) — hoje só link “Buscar pessoa 360” → `/clientes`.
9. Artefato CA-FICHAS original (.docx) não está no repo (só destilado em AGENTS/memória).

## 7. Próximos passos sugeridos (ordem sua)

1. Aplicar máscaras no modal de `/clientes` + formatar CPF/telefone/CEP na leitura da Pessoa 360 (fatia pequena, alta percepção).
2. Fechar conversão Lead→Cliente conforme CA-008 §4.1 com teste de reload.
3. Adicionar cards Consentimentos + Comercial; não inventar tabela.
4. Só então P11 visual dos cards.

Nada implementado nesta verificação.
