# Auditoria de prompts da Ana — implementação, lacunas e ordem de correção

**Projeto:** Clube Ancestral  
**Versão:** v1.0  
**Data:** 20 de agosto de 2026  
**Status:** Auditoria de leitura; nenhuma alteração autorizada por este documento  
**Caso:** `CA-CID-AT-FAM-2026-001`  
**Estado operacional:** `NO_GO` preservado

---

## 1. Objetivo

Este documento reconcilia os prompts e cortes relacionados ao piloto Ana com o estado reportado como implementado. Ele separa:

- Implementado e confirmado.
- Implementado com lacuna/dado inconsistente.
- Documentado, mas ainda não comprovado como implementado.
- Explicitamente fora de escopo até autorização posterior.

Não substitui a matriz de conformidade visual. O mockup aprovado continua soberano em layout, nomenclatura, ordem e navegação; módulos profundos devem existir como painel, subaba ou subrota contextual, nunca como nova aba principal concorrente.

---

## 2. Princípios vigentes

1. O mockup aprovado é contrato visual e de navegação.
2. A matriz `mockup → rota → dado → estado de implementação` é a referência obrigatória e está em `src/lib/matriz-conformidade.ts`, consultável em `/governanca/matriz-conformidade`.
3. Módulos profundos entram em rotas contextuais, conforme `/governanca/modulos-contextuais`, sem substituir as 14 abas originais do Desk.
4. O caso Ana permanece em `NO_GO` até que todos os gates materiais estejam satisfeitos.
5. Nenhuma ação externa deve ser disparada por esta auditoria: contrato, OS, assinatura, cobrança, link de pagamento, pasta, documento externo, pesquisa externa, mensagem ou publicação no App permanecem dependentes de gate e aprovação.

---

## 3. Estado confirmado do núcleo Ana

| Elemento | Estado confirmado | Observação |
|---|---|---|
| Caso | 1 caso familiar: `CA-CID-AT-FAM-2026-001` | ID histórico; eventual migração para ID canônico é posterior e controlada |
| Núcleo | `Silveira / Friedmann-Reimer` ativo | Um núcleo familiar ativo |
| Adultos | Ana Luiza, Adair e Alice | Signatários, com `cliente_id` |
| Dependente | Felipe | Dependente do Processo A de Ana; sem `clientes`, sem assinatura e sem acesso App |
| Representação | Pendente | Dependente não bloqueia apenas por existir; bloqueia se participar de contrato, App ou anexo sem representação válida |
| Barreira de dependente | Ativa | Dupla barreira: TypeScript `bloqueiosDependentes` + trigger `fn_case_dependent_guard` |
| Responsável | Tatiana Tosi | Deve permanecer responsável principal/supervisora, conforme decisão operacional |
| Estado | `NO_GO` | Preservado até correções e gates de formalização |

---

## 4. Reconciliação dos cortes Ana

| Corte/prompt | Finalidade | Estado | Evidência/resultado | Próxima decisão |
|---|---|---|---|---|
| A | Proposta Canva e escopo | Implementado, bloqueado corretamente | Conferência de proposta, páginas, campos, conflitos, anexos e gate | Materializar somente dados verificáveis; não inferir lacunas |
| B | Checklist cadastral por pessoa | Implementado com P0 | Checklist existe, mas identidade de Adair diverge do registro canônico | Corrigir referência para pessoa, não por string de nome |
| C | `case_service` e critérios | Implementado, requer validação de consolidação | Estruturas declaradas existentes | Confirmar que serviço, condição e critérios usam referências canônicas |
| D | Instrumentos/preparação | Não implementado; parada correta | Regra pura e funções ainda pendentes | Retomar somente após P0 cadastral e referências dependentes |
| E | Matriz jurídica na preparação | Parcialmente implementado | `matriz-juridica.ts`, funções e matriz existem; componente/painéis na rota ainda pendentes | Concluir como prévia/checklist, sem cláusula jurídica final |
| F | Dependentes e representação | Parcialmente implementado com P0 | Campos físicos existem, mas IDs de Felipe→Ana não são persistidos | Gravar relações por ID e eliminar vínculo apenas textual |
| G | Ficha familiar A–E | Documentado, não comprovado em persistência | Auditoria informa ausência de persistência própria | Implementar após saneamento de identidade e dependentes |
| H | Núcleo e plano inicial | Implementado de forma insuficiente | `nucleoOk`/`planoInicialOk` derivam de mera existência de linha | Substituir por critérios de completude/gates verificáveis |
| I | Catálogos de eixos | Implementado com duplicação | Catálogos duplicados em `crm-desk.ts` e `caso-ficha.ts` | Centralizar em dicionário único versionado |
| J | Mockup e matriz de conformidade | Implementado e vigente | Matriz e regras de rota contextual registradas | Usar como gate de qualquer ajuste UI futuro |
| K | Mobile/navegação | Pendente crítico | Financeiro e abas posteriores não acessíveis em mobile, segundo relato anterior | Corrigir sem alterar dados ou regras |
| L | Ficha Piloto Genealógica | Pendente | Prompts e artefatos existem; sem prova de schema/tela persistente | Executar só após correções P0 e P1 desta auditoria |

---

## 5. Lacunas priorizadas

### P0 — Corrigir antes de qualquer novo bloco Ana

| ID | Lacuna | Risco | Correção obrigatória |
|---|---|---|---|
| ANA-P0-01 | Adair em `checklist_cadastral` registrado como `Adair Gomes Silveira`, divergente de `Adair Pinto Silveira Júnior` em `clientes`, `nucleo_membros` e `contract_parties` | Identidade paralela; joins falham; formalização pode usar pessoa errada | Migrar checklist de chave por string para `pessoa_ref_id`/`cliente_id`; reconciliar o registro existente com log e teste |
| ANA-P0-02 | `dependent_person_id` e `titular_responsavel_legal_id` não são gravados | Felipe→Ana depende de texto; trigger/TS não têm relacionamento referencial completo | Persistir FKs, backfill controlado Felipe→Ana, validação server-side e teste |
| ANA-P0-03 | `nucleoOk` e `planoInicialOk` dependem de existência de linha | Caso pode parecer pronto sem núcleo/plano completos | Criar critérios verificáveis por gate, itens obrigatórios e evidência de conclusão |
| ANA-P0-04 | Catálogos duplicados entre `crm-desk.ts` e `caso-ficha.ts` | Estados divergem entre tela, regra e banco | Centralizar dicionários; manter mapeamento de compatibilidade temporário; adicionar teste de paridade |

### P1 — Corrigir antes de preparar instrumento para assinatura

| ID | Lacuna | Correção obrigatória |
|---|---|---|
| ANA-P1-01 | Blocos A–E da ficha familiar não possuem persistência própria | Modelar entidades/campos e persistir por referência, sem copiar dados entre telas |
| ANA-P1-02 | Preparação de instrumentos D/E incompleta | Criar consolidador de pré-requisitos, server function de leitura e painéis internos; manter sem cláusula/contrato final |
| ANA-P1-03 | Matriz jurídica não está plenamente incorporada na rota de preparação | Adicionar painel contextual com decisão humana, versão, justificativa, responsável e data |
| ANA-P1-04 | Proposta Canva requer saneamento de campos ainda não localizados e validade comercial vencida | Revalidar somente com dados canônicos; não liberar contrato/assinatura/financeiro por texto livre |
| ANA-P1-05 | Navegação mobile impede uso de eixos relevantes | Recuperar acesso a Financeiro, Formalização, Matriz Jurídica, Pesquisa e Biblioteca |

### P2 — Pós-correção estrutural

| ID | Lacuna | Correção posterior |
|---|---|---|
| ANA-P2-01 | Ficha Piloto Genealógica/árvore | Pessoas, relações, linhagens, eventos, variantes e árvore derivada |
| ANA-P2-02 | Biblioteca de Evidências | Fonte → evidência → validação → projeção autorizada |
| ANA-P2-03 | Pesquisa e solicitações | Documentos, fontes, pendências e plano de ação |
| ANA-P2-04 | Relatórios F1/F2 | Vincular ao motor, sem recriar relatórios existentes |
| ANA-P2-05 | Achados e Encontros de Linhagem | Implementar somente após evidências e linhagens persistentes |

---

## 6. Prompt imediato de correção P0

> **Canal recomendado:** Claude Code/GitHub. Se executado no Lovable, deve limitar-se à UI; migration, relações, FKs, testes e consolidação de dicionário devem ser feitos em código versionado.

```text
[ID ANA-FIX-P0] CORRIGIR INTEGRIDADE REFERENCIAL E GATES DO PILOTO ANA.

NÃO CRIAR CONTRATO, ORDEM DE SERVIÇO, CLÁUSULA, ASSINATURA, COBRANÇA, LINK DE PAGAMENTO, PASTA, DOCUMENTO EXTERNO, PESQUISA EXTERNA, COMUNICAÇÃO EXTERNA OU PUBLICAÇÃO NO APP.
NÃO RENOMEAR CASOS REAIS.
NÃO APAGAR REGISTROS; toda correção deve ser auditável e reversível.

CONTEXTO:
- Caso: CA-CID-AT-FAM-2026-001, permanece NO_GO.
- Núcleo: Silveira / Friedmann-Reimer.
- Adultos: Ana Luiza, Adair e Alice, signatários com cliente_id.
- Felipe: dependente do Processo A de Ana; signature_required=false; possui_acesso_app=false; representação pendente.
- Barreiras atuais TS bloqueiosDependentes + trigger fn_case_dependent_guard devem ser preservadas e reforçadas.

A. CORRIGIR IDENTIDADE CADASTRAL DE ADAIR
- Localizar o registro de checklist_cadastral que usa "Adair Gomes Silveira".
- Não usar nome como chave de unicidade para checklist.
- Adicionar pessoa_ref_id e/ou cliente_id como referência obrigatória no checklist_cadastral.
- Migrar o registro existente para o adulto canônico "Adair Pinto Silveira Júnior" por referência de ID.
- Preservar o valor histórico no audit log e registrar motivo da reconciliação.
- Impedir criação futura de checklist por string de nome quando existir pessoa/cliente vinculado.
- Criar busca de possíveis duplicidades por normalização de nome apenas como alerta de revisão; ela não deve unir pessoas automaticamente.

B. PERSISTIR DEPENDENTE E RESPONSÁVEL LEGAL POR ID
- Garantir gravação de dependent_person_id e titular_responsavel_legal_id em case_dependents.
- Criar backfill controlado ligando Felipe ao registro de pessoa de Ana, sem criar cliente para Felipe.
- Validar FKs e impedir vínculo apenas textual quando a pessoa correspondente existir.
- Preservar: Felipe não é signatário, não possui acesso App e não tem anexo individual enquanto a representação for pendente.
- Se contrato, App ou anexo for marcado para Felipe sem representação documentada, manter bloqueio TS e trigger de banco.

C. SUBSTITUIR GATES DE EXISTÊNCIA POR GATES DE COMPLETUDE
- nucleoOk não pode ser verdadeiro apenas por existir linha de núcleo.
- planoInicialOk não pode ser verdadeiro apenas por existir linha de plano.
- Definir critérios verificáveis e persistidos para núcleo:
  1. núcleo vinculado ao caso;
  2. contratante identificado;
  3. participantes com papel definido;
  4. dependentes com status de representação;
  5. dossiê-mãe/ambiente/nível de acesso quando aplicável.
- Definir critérios verificáveis e persistidos para plano inicial:
  1. responsável principal;
  2. case_service consolidado;
  3. próxima ação datada;
  4. checklist aplicável criado;
  5. primeira entrega planejada quando onboarding estiver liberado.
- Exibir itens pendentes com motivo; não reduzir a um booleano opaco.

D. CENTRALIZAR CATÁLOGOS
- Localizar catálogos duplicados em crm-desk.ts e caso-ficha.ts.
- Criar fonte canônica única de dicionários, tipos e estados.
- Preservar adaptadores temporários para não quebrar UI existente.
- Criar teste de paridade que falha se uma opção existir em uma tela/regra e não na fonte canônica.

E. TESTES
1. Checklist de Adair fica ligado ao cliente/pessoa canônicos depois de reload.
2. Novo checklist não aceita pessoa por string livre quando há referência existente.
3. Felipe persiste dependent_person_id e titular_responsavel_legal_id.
4. Felipe sem participação contratual/App/anexo não bloqueia apenas por existir.
5. Felipe com participação e representação pendente bloqueia no TypeScript e no banco.
6. Núcleo com linha vazia não satisfaz nucleoOk.
7. Plano vazio não satisfaz planoInicialOk.
8. Catálogo centralizado permanece igual nas telas e regras.
9. Caso Ana permanece NO_GO.

F. ENTREGA
Mostrar:
- migrations e arquivos alterados;
- registros reconciliados e log de auditoria sanitizado;
- critérios de completude de núcleo/plano;
- resultado dos testes;
- confirmação de que nenhuma ação externa, contrato, cobrança ou publicação foi executada.
```

---

## 7. Ordem após P0

```text
ANA-FIX-P0
→ teste manual Caso → Família → Pessoa → Formalização
→ completar D/E apenas como prévia/checklist interno
→ corrigir mobile
→ validar proposta Canva e cadastro real da Ana
→ contrato pronto para assinatura, quando todos os gates aplicáveis forem satisfeitos
→ onboarding real após assinatura + pagamento
→ Ficha Piloto Genealógica e Pesquisa/Evidências
→ congelar Lovable e iniciar migração Claude Code/GitHub/Servla
```

---

## 8. Critérios para afirmar “prompts da Ana implementados”

Só usar a afirmação quando todos os itens abaixo forem verdadeiros e testados:

- [ ] A matriz de conformidade do mockup está verde ou possui exceções documentadas.
- [ ] Caso, núcleo, adultos e dependente usam referências por ID, não somente texto.
- [ ] Não existem identidades paralelas em checklist, núcleo, clientes, contrato ou dependentes.
- [ ] Gates de núcleo, plano, proposta, dependente, formalização e matriz jurídica são verificáveis.
- [ ] D/E produzem somente checklist/prévia interna até haver decisão jurídica e dados completos.
- [ ] Mobile acessa todos os eixos necessários.
- [ ] Proposta Canva mostra ausência/conflito sem inferir informações.
- [ ] Contrato, assinatura, cobrança, pesquisa externa e comunicação continuam bloqueados quando aplicável.
- [ ] Smoke test do caso Ana passa em desktop e mobile.

Até lá, o estado correto é:

```text
Implementação parcial com NO_GO controlado.
```

---

## 9. Registro de revisão

| Data | Fonte | Resultado |
|---|---|---|
| 20/08/2026 | Regra de mockup soberano e matriz de conformidade | Confirmada como vigente |
| 20/08/2026 | `docs/FICHA_POS_CRM_FAMILIA_ANA_v1.0.md` reportado pelo Lovable | Auditoria de leitura; nenhum arquivo alterado |
| 20/08/2026 | Devolutiva de D/E interrompida | Nenhuma cláusula, contrato, OS, assinatura ou cobrança criada |
| 20/08/2026 | Esta auditoria | P0 de identidade, dependente, gates e catálogos consolidado para correção |
