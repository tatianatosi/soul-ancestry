# Status final Ana — Ficha Genealógica e gates de prontidão

**Projeto:** Clube Ancestral  
**Versão:** v1.0  
**Data:** 20 de agosto de 2026  
**Caso:** `CA-CID-AT-FAM-2026-001`  
**Estado operacional:** `NO_GO`  
**Finalidade:** Registro objetivo do que está implementado, do que está somente estruturado e dos requisitos pendentes antes de assinatura, pagamento, onboarding e go-live.

---

## 1. Resposta objetiva

A Ana **tem a Ficha Piloto Genealógica implementada e vinculável ao caso**, mas ela está intencionalmente **sem dados genealógicos reais preenchidos**. Nenhum nome, data, relação, documento, fonte, evidência, evento, linhagem ou achado foi inventado ou carregado para “popular” a interface.

Portanto:

```text
Ficha Genealógica: estrutura implementada e pronta para uso.
Ficha Genealógica da Ana preenchida com dados reais: não.
Pesquisa externa: não iniciada.
App Cliente com conteúdo genealógico: não publicado.
```

A Ana também possui estruturas técnicas de cadastro, núcleo, dependentes, proposta, condição comercial, `case_service`, matriz jurídica, relatórios, pesquisa, evidências, achados, plano de ação e fontes. Isso **não significa que todos os requisitos de go-live estão OK**. O caso permanece `NO_GO` por bloqueios humanos, comerciais e jurídicos documentados.

---

## 2. Ficha Piloto Genealógica

### Implementado

| Componente | Estado |
|---|---|
| Perfil genealógico por pessoa | Implementado (`genealogical_person_profiles`) |
| Variantes de nome | Implementado (`name_variants`) |
| Relações familiares | Implementado (`genealogical_relationships`) |
| Eventos/timeline | Implementado (`genealogical_events`) |
| Linhagens e linha dupla | Implementado (`lineage_paths`) |
| Árvore interna derivada | Implementada |
| Linha do tempo interna derivada | Implementada |
| Lacunas de pesquisa | Implementadas |
| Rota | `/pessoas-linhagens/$caseId` |
| RLS/autoria/arquivamento | Implementados |
| Exclusão física | Bloqueada |
| Testes | 12 testes aprovados; build/typecheck limpos |

### Estado específico Ana

| Item | Estado |
|---|---|
| Estrutura vinculável ao caso | Sim |
| Pessoas reais inseridas no módulo genealógico | Não |
| Relações reais inseridas | Não |
| Eventos reais inseridos | Não |
| Linhagens reais inseridas | Não |
| Fontes/evidências reais vinculadas | Não |
| Dados inventados/fixtures usados na Ana | Não |
| Conteúdo publicado no App | Não |

### Regra de preenchimento futuro

```text
Fonte/material
→ evidência
→ validação e confiança
→ pessoa/relação/evento/linhagem
→ árvore/timeline internas
→ achado ou relatório
→ projeção sanitizada aprovada
→ App Cliente
```

Não preencher árvore, relação, cronologia ou linhagem diretamente para “completar” a experiência visual.

---

## 3. Estruturas do piloto implementadas

| Domínio | Estrutura | Estado técnico |
|---|---|---|
| Identidade | G-01 + G-01B | Concluído |
| Cadastro/núcleo | ANA-B-01 | Concluído tecnicamente |
| Persistência/RLS/feedback | ANA-SAVE-SEC-01B | Concluído; 8 testes verdes |
| Proposta Canva | ANA-A-01 | Concluído tecnicamente; bloqueios corretos preservados |
| Case service/condição | ANA-C-01 | Concluído tecnicamente; decisões humanas pendentes |
| Matriz jurídica | ANA-E-01 | Concluído tecnicamente; decisões humanas pendentes |
| Preparação interna | ANA-D-01 | Concluído; apenas diagnóstico/prévia interna |
| Pessoas/linhagens | G-02 | Concluído |
| Evidências/projeções | G-03 | Concluído |
| Pesquisa/documentos | G-04 | Concluído |
| Relatórios F1/F2 | G-05 | Concluído |
| Achados/encontros | G-06 | Concluído |
| Plano de ação/terceiros | G-07 + G-07B | Concluído |
| Fontes 5B-Pre | G-08 | Concluído, sem integração externa |
| Visibilidade do App/smoke test | ANA-APP-SMOKE-03 | Pendente de execução |

---

## 4. Requisitos de go-live Ana

| Requisito | Estado | Observação |
|---|---|---|
| Caso/núcleo por referências de ID | Técnico concluído | Adair reconciliado; Felipe com FKs para Ana |
| Dependente protegido | Técnico concluído | Felipe sem contrato/App/anexo até representação documentada |
| Persistência e RLS | Técnico concluído | Releitura/comparação, guard, autoria, auditoria e fixtures controladas |
| Proposta Canva | Bloqueado | Validade vencida em 19/08 e extração parcial páginas 3–7 |
| Cadastro de signatários/contratada | Pendente | Itens cadastrais reais pendentes por pessoa/contratada |
| Produto e preço | Pendente humano | Exige homologação rastreável vigente |
| Forma de pagamento/parcelas/vencimento | Pendente humano | Deve virar condição comercial homologada |
| `case_service` | Pendente humano | Permanece `draft` enquanto critérios não forem decididos |
| Critérios de aceite | Pendente humano | Dez critérios sem decisão final |
| Matriz jurídica | Pendente humano | Temas bloqueantes precisam de decisão e versão jurídica vigente |
| Representação Felipe | Condicional | Só bloqueia se contrato/App/anexo for ativado para ele |
| Preparação de instrumentos | Técnico concluído | Retorna bloqueios; não gera contrato/OS |
| Assinatura | Bloqueada | Gates humanos e comerciais pendentes |
| Financeiro/Asaas | Bloqueado | Depende de contrato/condição/assinatura aprovados |
| Onboarding real | Bloqueado | Depende de assinatura + pagamento + requisitos operacionais |
| Pesquisa externa | Bloqueada | Depende de contrato/pagamento/autorização aplicável |
| App real/entregas | Bloqueado | ANA-APP-SMOKE-03 ainda pendente e não há projeções publicadas |

---

## 5. Próximas ações humanas

1. Decidir sobre a proposta Canva vencida: renovar, substituir ou encerrar; completar somente a extração verificável das páginas 3–7.
2. Completar e verificar cadastro de Ana, Adair, Alice e dados oficiais da contratada.
3. Homologar produto, preço, condição comercial, parcelas, vencimento e forma de pagamento.
4. Decidir os dez critérios de aceite do `case_service`.
5. Obter decisões para os temas jurídicos bloqueantes, com responsável, justificativa, data e versão jurídica vigente.
6. Definir se Felipe participará de contrato, App ou anexo; se sim, documentar representação legal.
7. Reexecutar `diagnosticoInstrumentos` e resolver os códigos de bloqueio remanescentes.
8. Executar `ANA-APP-SMOKE-03` sem ação externa.

---

## 6. Critério de prontidão

A Ana só pode ser declarada pronta para contrato quando:

- [ ] Proposta comercial vigente e escopo verificável.
- [ ] Cadastro e núcleo familiar completos/validados.
- [ ] Produto, condição, parcelas e vencimento homologados.
- [ ] `case_service` consolidado.
- [ ] Critérios de aceite decididos.
- [ ] Temas jurídicos bloqueantes decididos com versão vigente.
- [ ] Representação de Felipe documentada se aplicável.
- [ ] `diagnosticoInstrumentos` retornar sem bloqueio crítico.
- [ ] Smoke test aprovado ou falhas críticas corrigidas.

A assinatura, a cobrança, o pagamento, o onboarding e a pesquisa externa exigem confirmações humanas específicas adicionais.

---

## 7. Decisão

```text
A Ana possui a estrutura genealógica e operacional implementada.
A Ana não possui Ficha Genealógica real preenchida nem está pronta para go-live.
O estado correto do caso continua NO_GO.
```

Nenhuma etapa futura deve usar o fato de a estrutura estar pronta como autorização para preencher dados por suposição, publicar conteúdo, iniciar pesquisa ou executar ação externa.

---

## 8. Changelog

### v1.0 — 20/08/2026

- Registrado estado final da Ficha Piloto Genealógica da Ana.
- Diferenciadas estrutura implementada, dados reais não inseridos e gates humanos pendentes.
- Consolidado estado de G-01 a G-08, ANA-A/B/C/D/E e ANA-SAVE-SEC-01B.
- Mantido `NO_GO` até satisfação dos requisitos de prontidão.
