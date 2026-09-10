# CA08-JURIDICO-PROPORCIONAL — execução (09/09/2026)

Aplicada `docs/politicas/fonte-de-verdade-design-e-execucao.md` v1.0. Nenhuma tabela, taxonomia ou legal_framework/country_track/legal_gate criado — só uma leitura nova combinando o que já existe.

## Achado

A tela "Validação Jurídica" (`/matriz-juridica`, hoje rotulada "(bloqueios)" na navegação) só mostrava temas contratuais **por organização** (matriz de cláusulas), sem nenhuma leitura **por caso** de `citizenship_tracks`/`versioned_legal_rules`/`legal_reference_milestones`. O bloco "Jurídico" do Caso 360 já era corretamente uma ponte sem formulário duplicado, mas sem nenhuma leitura de rota/marco/estado do próprio caso.

## Fontes usadas (nenhuma nova)

`case_services.citizenship_track_id` → `citizenship_tracks` (rota) → `legal_reference_milestones` e `versioned_legal_rules` (marcos e regras da rota) + `legal_clause_matrix` (temas contratuais, já existente) + `case_dependents` (representação de menor). Nova função pura `avaliarValidacaoJuridicaCaso` (`validacao-juridica-caso.ts`) + leitor `validacaoJuridicaCaso` (`crm-desk.functions.ts`, GET, mesmo padrão de `diagnosticoInstrumentos`).

## Atos formais bloqueados (proporcional, não universal)

Cada pendência aponta exatamente um ato: tema contratual bloqueante pendente → **assinatura**; marco/regra jurídica desatualizada ou em revisão → **protocolo** (procedimento/prazo/requisito) ou **publicação jurídica** (lei/artigo/regulamento/fonte oficial, inclusive o que alimenta `app_projections`); dependente participante sem representação documentada → **acesso sensível de menor**. "Envio formal" fica disponível na taxonomia de atos para uso futuro, sem pendência própria mapeada nesta rodada — nenhum conteúdo jurídico novo foi inventado, só rótulos operacionais dos campos já existentes (`reference_type`, `bloqueia_assinatura`, `participa_do_contrato`).

## Rascunhos liberados (confirmado, não alterado)

Lead, caso, Discovery, pesquisa, tarefa, escopo, proposta rascunho, condição interna, contrato rascunho, OS e microentrega interna nunca importam `validacaoJuridicaCaso`/`avaliarValidacaoJuridicaCaso` — confirmado por leitura de `ops.functions.ts`, `comercial.functions.ts` e `discovery-roteiro.ts`. A leitura é só-diagnóstico (GET, `nenhuma_acao_externa`), igual ao padrão já usado por `diagnosticoInstrumentos`.

## Onde aparece

Nova seção "Validação jurídica deste caso" dentro do bloco "Jurídico" já existente no Caso 360 (`#secao-comercial`), antes da ponte "Motor e matriz de contrato" — mesma seção, sem tela nova, sem formulário. Mostra rota aplicável, estado, decisão humana necessária, documento/evidência pendente e qual ato é afetado. Os quatro links da ponte (`/casos/.../contrato/preparar`, `/contratos`, `/matriz-juridica`, `/ordens-servico`) continuam intactos.

## Testes

`validacao-juridica-caso.test.ts` (9, função pura): sem rota mas com tema pendente ainda reporta pendência; tudo em dia dá zero pendências; marco por tipo de referência mapeia protocolo vs. publicação; `dispensa_homologada` nunca vira pendência; regra não aprovada afeta publicação jurídica; dependente sem representação afeta só acesso de menor; dependente não participante nunca gera pendência; tema não aplicável nunca bloqueia; atos nunca duplicam. `ca08-juridico-proporcional.test.ts` (12): fontes corretas, nenhuma tabela/taxonomia nova, leitura é GET sem ação externa, nenhum escritor de lead/tarefa/proposta importa a validação jurídica, seção aparece no Caso 360 sem formulário, ponte de 4 links intacta, RLS por case_id/track_id preservada. `npx tsc --noEmit`, `npx vitest run --exclude '**/.claude/**'` (191 arquivos, 1844 testes) e `npx vite build` — todos limpos.

## Pendência (0 de até 5)

Nenhuma nova.

Commit: branch temporária → main → recovery.
