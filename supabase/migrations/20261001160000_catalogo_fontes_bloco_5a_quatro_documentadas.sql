-- Corte 1b (01/10/2026) — Fonte oficial viva no fluxo.
--
-- `genealogical_sources_catalog` estava VAZIA (0 linhas): a taxonomia M1–M6 do
-- Bloco 5A existia só em documento, nunca como dado. Sem catálogo, o campo
-- "Fonte vinculada" não tinha o que oferecer e cada tela inventava a sua
-- origem — uma delas era texto livre.
--
-- Esta semente grava **somente as 4 fontes que o Bloco 5A documenta**
-- (`docs/arquitetura/FICHA-PILOTO-GIOVANNA-BLOCO-5A-EXECUTADO-2026-09-27.md`,
-- D-04), com o de-para de nível e modo de uso que o próprio documento declara:
--
--   M1 (registro oficial/cartório, manual) → primaria|institucional + manual
--   M2 (metadados/linkout, ex. Portale Antenati) → indice|secundaria + metadados_linkout
--
-- O que NÃO é feito aqui, de propósito (D-04 segue pendente da Proprietária):
--   - a 5ª fonte não é inventada — o documento diz que falta uma e não diz qual;
--   - a ordem de prioridade não é atribuída: as 4 ficam em `prioridade` média,
--     o default, porque ranquear sem decisão seria fabricar a decisão;
--   - nenhuma é homologada: todas entram CATALOGADA / termos a confirmar,
--     portanto nenhuma libera uso automático;
--   - a URL do Portale Antenati fica nula — o documento nomeia a fonte, não o
--     endereço, e endereço é coisa que não se escreve de memória.
--
-- Idempotente por (organization_id, nome). Só para a organização real.

INSERT INTO public.genealogical_sources_catalog
  (organization_id, nome, pais_eixo, tipo_de_acervo, nivel_de_fonte, acesso,
   modo_de_uso_permitido, estagio_maturidade, status_documentacao, status_integracao,
   trata_dados_pessoais, uso_recomendado, proxima_acao, data_origin)
SELECT v.organization_id, v.nome, v.pais_eixo, v.tipo_de_acervo, v.nivel_de_fonte, v.acesso,
       v.modo_de_uso_permitido, 'CATALOGADA', 'termos_a_confirmar', 'sem_integracao',
       true, v.uso_recomendado,
       'D-04 pendente: falta a 5a fonte e a ordem de prioridade. Nao usar como fonte homologada ate decisao da Proprietaria.',
       'registro_interno'
  FROM (VALUES
    ('11f32aae-ea08-47e0-8114-f5d8a900c9a1'::uuid,
     'Cartórios brasileiros',
     'Brasil', 'registro_civil', 'primaria', 'restrito', 'manual',
     'M1 — registro oficial obtido manualmente. Certidão emitida pelo cartório competente.'),
    ('11f32aae-ea08-47e0-8114-f5d8a900c9a1'::uuid,
     'Arquivo ou registro civil brasileiro aplicável',
     'Brasil', 'arquivo_publico', 'institucional', 'restrito', 'manual',
     'M1/M2 — arquivo público ou registro civil competente, conforme a localidade do caso.'),
    ('11f32aae-ea08-47e0-8114-f5d8a900c9a1'::uuid,
     'Portale Antenati',
     'Itália', 'indice_digitalizado', 'indice', 'publico', 'metadados_linkout',
     'M2 — consulta de metadados e linkout. Nunca substitui a certidão oficial.'),
    ('11f32aae-ea08-47e0-8114-f5d8a900c9a1'::uuid,
     'Comune, arquivo distrital, paróquia ou arquivo local italiano aplicável',
     'Itália', 'arquivo_local', 'institucional', 'restrito', 'manual',
     'M1/M2 — arquivo local italiano competente, conforme a comuna do ascendente.')
  ) AS v(organization_id, nome, pais_eixo, tipo_de_acervo, nivel_de_fonte, acesso,
         modo_de_uso_permitido, uso_recomendado)
 WHERE NOT EXISTS (
   SELECT 1 FROM public.genealogical_sources_catalog g
    WHERE g.organization_id = v.organization_id AND g.nome = v.nome
 );
