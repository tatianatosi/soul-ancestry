-- Corte 1-bis, parte 2 (02/10/2026) — semeia as 20 fontes da "Matriz de
-- fontes prioritárias com status corrigido" do Adendo Bloco 5A §3, com a
-- classificação M, modo_de_uso_permitido, api_status, permite_automacao,
-- direitos_de_reuso e status_integracao exatamente como o Adendo declara.
--
-- Nenhuma fonte entra homologada ou com automação liberada: todas
-- `estagio_maturidade='CATALOGADA'`, `status_documentacao='termos_a_confirmar'`
-- (ressalvada nas poucas que o Adendo já marca `inexistente`/`nao`
-- explicitamente), `permite_automacao` segue o default conservador 'nao'
-- (coluna da migration anterior) exceto onde o Adendo diz 'a-confirmar'.
--
-- `nivel_de_fonte` (eixo já existente, primaria/secundaria/colaborativa/
-- indice/institucional) e `acesso` (publico/login/pago/parceria/restrito)
-- não são campos do Adendo §3 — são derivados aqui da própria definição de
-- cada categoria M (§2 do mesmo documento), nunca de suposição por fonte
-- individual: M1→institucional, M2→indice, M3-CANDIDATA→indice,
-- M4→institucional, M5→secundaria, M6→colaborativa. `acesso`: M2 (Adendo
-- define como "metadados públicos")→publico; M3-CANDIDATA (APIs públicas
-- em avaliação)→publico; M4 (parceria institucional)→parceria; M1/M5→
-- restrito (consulta pessoal/interna); M6 (árvores colaborativas com
-- conta)→login.
--
-- Achado antes de aplicar: o Adendo usa, em prosa, "avaliacao"/"nenhum" na
-- coluna status_integracao — mas o CHECK real (gsc_status_int_chk) só aceita
-- sem_integracao|uso_manual|piloto_interno|homologada_manual|homologada_api|
-- bloqueada. Nenhuma das 20 fontes tem integração técnica iniciada; as duas
-- leituras do Adendo mapeiam honestamente para sem_integracao (nunca um
-- valor de CHECK inventado).
--
-- Idempotente por (organization_id, nome).
INSERT INTO public.genealogical_sources_catalog
  (organization_id, nome, pais_eixo, nivel_de_fonte, acesso, modo_de_uso_permitido,
   modelo_acesso, api_status, permite_automacao, direitos_de_reuso, status_integracao,
   status_documentacao, trata_dados_pessoais, uso_recomendado, proxima_acao, data_origin)
SELECT v.organization_id, v.nome, v.pais_eixo, v.nivel_de_fonte, v.acesso, v.modo_de_uso_permitido,
       v.modelo_acesso, v.api_status, v.permite_automacao, v.direitos_de_reuso, v.status_integracao,
       'termos_a_confirmar', v.trata_dados_pessoais, v.uso_recomendado,
       'A CONFIRMAR NOS TERMOS OFICIAIS (Adendo Bloco 5A §3). Nenhuma automação até decisão humana registrada.',
       'registro_interno'
  FROM (VALUES
    ('11f32aae-ea08-47e0-8114-f5d8a900c9a1'::uuid, 'FamilySearch', 'Global', 'indice', 'publico', 'api_candidata', 'M3-CANDIDATA', 'candidata', 'a-confirmar', 'restrito', 'sem_integracao', false,
     'Reclassificada como candidata técnica não produtiva; uso produtivo e automação seguem proibidos até aprovação formal de credencial, OAuth e condições produtivas.'),
    ('11f32aae-ea08-47e0-8114-f5d8a900c9a1'::uuid, 'Portale Antenati', 'Itália', 'indice', 'publico', 'metadados_linkout', 'M2', 'a-confirmar', 'a-confirmar', 'a-confirmar', 'sem_integracao', false,
     'Reclassificada. Consulta humana/metadados/link profundo. Não afirmar API pública aprovada sem documentação oficial.'),
    ('11f32aae-ea08-47e0-8114-f5d8a900c9a1'::uuid, 'PARES (Portal de Arquivos Espanhóis)', 'Espanha', 'indice', 'publico', 'api_candidata', 'M3-CANDIDATA', 'a-confirmar', 'a-confirmar', 'a-confirmar', 'sem_integracao', false,
     'Não aprovar automação. Manter como API/endpoints a validar.'),
    ('11f32aae-ea08-47e0-8114-f5d8a900c9a1'::uuid, 'Szukaj w Archiwach', 'Polônia', 'indice', 'publico', 'metadados_linkout', 'M2', 'a-confirmar', 'a-confirmar', 'a-confirmar', 'sem_integracao', false,
     'Não afirmar API aprovada até validação técnica e jurídica. Consulta humana/metadados.'),
    ('11f32aae-ea08-47e0-8114-f5d8a900c9a1'::uuid, 'Museu da Imigração (SP)', 'Brasil', 'indice', 'publico', 'metadados_linkout', 'M2', 'inexistente', 'nao', 'a-confirmar', 'sem_integracao', false,
     'Registrar direitos de uso, download e reprodução como pendentes. Não armazenar ou republicar imagens sem permissão.'),
    ('11f32aae-ea08-47e0-8114-f5d8a900c9a1'::uuid, 'DigitArq (Torre do Tombo)', 'Portugal', 'indice', 'publico', 'metadados_linkout', 'M2', 'a-confirmar', 'a-confirmar', 'a-confirmar', 'sem_integracao', false,
     'Manter consulta e metadados. Não aprovar scraping até validação técnica e jurídica.'),
    ('11f32aae-ea08-47e0-8114-f5d8a900c9a1'::uuid, 'Memória Italiana CA', 'Itália (interna)', 'secundaria', 'restrito', 'manual', 'M5', 'inexistente', 'nao', 'a-confirmar', 'sem_integracao', false,
     'Fonte-mãe metodológica interna. Registra que orienta pesquisa, mas não valida prova documental.'),
    ('11f32aae-ea08-47e0-8114-f5d8a900c9a1'::uuid, 'Geneanet', 'Europa', 'colaborativa', 'login', 'manual', 'M6', 'candidata', 'nao', 'restrito', 'sem_integracao', true,
     'Hipótese/pista. Nunca validação final isolada.'),
    ('11f32aae-ea08-47e0-8114-f5d8a900c9a1'::uuid, 'MyHeritage', 'Global', 'colaborativa', 'login', 'manual', 'M6', 'candidata', 'nao', 'restrito', 'sem_integracao', true,
     'Hipótese/pista. Nunca validação final isolada.'),
    ('11f32aae-ea08-47e0-8114-f5d8a900c9a1'::uuid, 'Ancestry (árvores públicas)', 'Global', 'colaborativa', 'login', 'manual', 'M6', 'candidata', 'nao', 'restrito', 'sem_integracao', true,
     'Hipótese/pista. Nunca validação final isolada.'),
    ('11f32aae-ea08-47e0-8114-f5d8a900c9a1'::uuid, 'Arquivo Nacional (Brasil)', 'Brasil', 'indice', 'publico', 'metadados_linkout', 'M2', 'a-confirmar', 'a-confirmar', 'a-confirmar', 'sem_integracao', false,
     'Consulta e metadados. Não automatizar sem validação de termos.'),
    ('11f32aae-ea08-47e0-8114-f5d8a900c9a1'::uuid, 'Arquivos Distritais (Portugal)', 'Portugal', 'indice', 'publico', 'metadados_linkout', 'M2', 'inexistente', 'nao', 'a-confirmar', 'sem_integracao', false,
     'Consulta e metadados. Não automatizar.'),
    ('11f32aae-ea08-47e0-8114-f5d8a900c9a1'::uuid, 'Paróquias (IT/PT/HR/AT/BR)', 'Vários', 'institucional', 'restrito', 'manual', 'M1', 'inexistente', 'nao', 'a-confirmar', 'sem_integracao', true,
     'Consulta humana guiada. Sem automação.'),
    ('11f32aae-ea08-47e0-8114-f5d8a900c9a1'::uuid, 'Cartórios de registro civil (BR)', 'Brasil', 'institucional', 'restrito', 'manual', 'M1', 'inexistente', 'nao', 'restrito', 'sem_integracao', true,
     'Dados pessoais. Exige consentimento/autorização.'),
    ('11f32aae-ea08-47e0-8114-f5d8a900c9a1'::uuid, 'Consulado/Embaixada', 'Vários', 'institucional', 'parceria', 'parceria', 'M4', 'inexistente', 'nao', 'restrito', 'sem_integracao', true,
     'Solicitação institucional. Registrar custo, SLA, responsável.'),
    ('11f32aae-ea08-47e0-8114-f5d8a900c9a1'::uuid, 'Hemerotecas (PT/AT/BR)', 'Vários', 'indice', 'publico', 'metadados_linkout', 'M2', 'inexistente', 'nao', 'a-confirmar', 'sem_integracao', false,
     'Consulta e metadados. Verificar direitos de reprodução.'),
    ('11f32aae-ea08-47e0-8114-f5d8a900c9a1'::uuid, 'Find a Grave', 'Global', 'indice', 'publico', 'api_candidata', 'M3-CANDIDATA', 'candidata', 'a-confirmar', 'a-confirmar', 'sem_integracao', false,
     'Exige API/licença. A confirmar nos termos oficiais.'),
    ('11f32aae-ea08-47e0-8114-f5d8a900c9a1'::uuid, 'Croatian State Archives', 'Croácia', 'institucional', 'restrito', 'manual', 'M1', 'inexistente', 'nao', 'a-confirmar', 'sem_integracao', false,
     'Consulta humana guiada. Presencial.'),
    ('11f32aae-ea08-47e0-8114-f5d8a900c9a1'::uuid, 'Austrian State Archives (ÖStA)', 'Áustria', 'indice', 'publico', 'metadados_linkout', 'M2', 'a-confirmar', 'a-confirmar', 'a-confirmar', 'sem_integracao', false,
     'Consulta e metadados. Não automatizar sem validação.'),
    ('11f32aae-ea08-47e0-8114-f5d8a900c9a1'::uuid, 'Matricula Online (AT)', 'Áustria', 'indice', 'publico', 'api_candidata', 'M3-CANDIDATA', 'candidata', 'a-confirmar', 'a-confirmar', 'sem_integracao', false,
     'Exige API/licença. A confirmar nos termos oficiais.')
  ) AS v(organization_id, nome, pais_eixo, nivel_de_fonte, acesso, modo_de_uso_permitido,
         modelo_acesso, api_status, permite_automacao, direitos_de_reuso, status_integracao,
         trata_dados_pessoais, uso_recomendado)
 WHERE NOT EXISTS (
   SELECT 1 FROM public.genealogical_sources_catalog g
    WHERE g.organization_id = v.organization_id AND g.nome = v.nome
 );
