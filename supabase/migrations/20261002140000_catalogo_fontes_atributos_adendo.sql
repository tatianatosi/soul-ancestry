-- Corte 1-bis (02/10/2026) — Taxonomia M real do Adendo de Correções Bloco
-- 5A (seção 2 e 3). O Corte 1b semeou só 4 fontes com os 2 eixos que já
-- existiam (nivel_de_fonte, modo_de_uso_permitido). O Adendo define SETE
-- categorias M (M1, M2, M3-CANDIDATA, M3-APROVADA, M4, M5, M6) — não seis
-- — e modo_de_uso_permitido com SETE valores, faltando `api_candidata`.
--
-- Esta migration só adiciona (CHECK superconjunto + colunas nullable);
-- nenhuma linha existente fica inválida.

-- 1) gsc_modo_chk ganha api_candidata (superconjunto dos 6 valores atuais).
ALTER TABLE public.genealogical_sources_catalog DROP CONSTRAINT IF EXISTS gsc_modo_chk;
ALTER TABLE public.genealogical_sources_catalog
  ADD CONSTRAINT gsc_modo_chk
  CHECK (modo_de_uso_permitido = ANY (ARRAY[
    'manual', 'metadados_linkout', 'api_candidata', 'api_validada', 'parceria', 'restrito', 'nao_validado'
  ]));

-- 2) Atributos padronizados do Adendo §3 que ainda não existem na tabela.
-- `modelo_acesso` (M1..M6) é eixo DIFERENTE de `nivel_de_fonte`
-- (primaria/secundaria/colaborativa/indice/institucional) — não substitui,
-- complementa (Adendo §2: "nivel_de_fonte não é a taxonomia M").
ALTER TABLE public.genealogical_sources_catalog
  ADD COLUMN IF NOT EXISTS modelo_acesso text,
  ADD COLUMN IF NOT EXISTS api_status text DEFAULT 'a-confirmar',
  ADD COLUMN IF NOT EXISTS api_documentacao_url text,
  ADD COLUMN IF NOT EXISTS url_canonica text,
  ADD COLUMN IF NOT EXISTS url_pesquisa text,
  ADD COLUMN IF NOT EXISTS termos_de_uso_url text,
  ADD COLUMN IF NOT EXISTS robots_verificado text DEFAULT 'pendente',
  ADD COLUMN IF NOT EXISTS direitos_de_reuso text DEFAULT 'a-confirmar',
  ADD COLUMN IF NOT EXISTS permite_cache text DEFAULT 'a-confirmar',
  ADD COLUMN IF NOT EXISTS permite_download text DEFAULT 'a-confirmar',
  -- Default conservador deliberado (Adendo §4, regra-base: "Proibido por
  -- padrão até termos/licença/risco serem aprovados"). É a trava que deixa
  -- a base pronta para quando decidirmos automatizar, sem autorizar nada
  -- agora (resposta 3 da Proprietária, 01/10).
  ADD COLUMN IF NOT EXISTS permite_automacao text DEFAULT 'nao',
  ADD COLUMN IF NOT EXISTS nivel_de_evidencia text,
  ADD COLUMN IF NOT EXISTS jurisdicao text,
  ADD COLUMN IF NOT EXISTS responsavel_validacao text;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'gsc_modelo_acesso_chk') THEN
    ALTER TABLE public.genealogical_sources_catalog
      ADD CONSTRAINT gsc_modelo_acesso_chk
      CHECK (modelo_acesso IS NULL OR modelo_acesso = ANY (ARRAY['M1','M2','M3-CANDIDATA','M3-APROVADA','M4','M5','M6']));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'gsc_api_status_chk') THEN
    ALTER TABLE public.genealogical_sources_catalog
      ADD CONSTRAINT gsc_api_status_chk
      CHECK (api_status IS NULL OR api_status = ANY (ARRAY['inexistente','a-confirmar','candidata','aprovada','rejeitada']));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'gsc_robots_chk') THEN
    ALTER TABLE public.genealogical_sources_catalog
      ADD CONSTRAINT gsc_robots_chk CHECK (robots_verificado IS NULL OR robots_verificado = ANY (ARRAY['sim','nao','pendente']));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'gsc_direitos_reuso_chk') THEN
    ALTER TABLE public.genealogical_sources_catalog
      ADD CONSTRAINT gsc_direitos_reuso_chk
      CHECK (direitos_de_reuso IS NULL OR direitos_de_reuso = ANY (ARRAY['aberto','restrito','proibido','a-confirmar']));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'gsc_permite_cache_chk') THEN
    ALTER TABLE public.genealogical_sources_catalog
      ADD CONSTRAINT gsc_permite_cache_chk CHECK (permite_cache IS NULL OR permite_cache = ANY (ARRAY['sim','nao','a-confirmar']));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'gsc_permite_download_chk') THEN
    ALTER TABLE public.genealogical_sources_catalog
      ADD CONSTRAINT gsc_permite_download_chk CHECK (permite_download IS NULL OR permite_download = ANY (ARRAY['sim','nao','a-confirmar']));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'gsc_permite_automacao_chk') THEN
    ALTER TABLE public.genealogical_sources_catalog
      ADD CONSTRAINT gsc_permite_automacao_chk CHECK (permite_automacao IS NULL OR permite_automacao = ANY (ARRAY['sim','nao','a-confirmar']));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'gsc_nivel_evidencia_chk') THEN
    ALTER TABLE public.genealogical_sources_catalog
      ADD CONSTRAINT gsc_nivel_evidencia_chk
      CHECK (nivel_de_evidencia IS NULL OR nivel_de_evidencia = ANY (
        ARRAY['hipotese','pista','evidencia-a-validar','validado-por-documento','busca-negativa']
      ));
  END IF;
END $$;

-- 3) Trigger g08 (trg_g08_source_guard) ganha a regra do Adendo: M3-APROVADA
-- exige api_validada + permite_automacao='sim' + termos_de_uso_url +
-- responsavel_validacao preenchidos. Hoje (02/10) nenhuma fonte satisfaz
-- isso — é a trava que impede qualquer fonte de "virar automatizável" por
-- hipótese, exatamente como o Adendo exige ("decisão humana registrada").
CREATE OR REPLACE FUNCTION public.fn_g08_source_guard()
RETURNS trigger AS $trigger$
BEGIN
  IF NEW.estagio_maturidade = 'CATALOGADA'
     AND NEW.status_integracao NOT IN ('sem_integracao','bloqueada') THEN
    RAISE EXCEPTION 'Fonte apenas catalogada não é integração: documente e avalie antes de mudar a situação de integração.';
  END IF;

  IF (NEW.estagio_maturidade = 'TERMOS_A_CONFIRMAR' OR NEW.status_documentacao = 'termos_a_confirmar')
     AND NEW.estagio_maturidade IN ('ELEGIVEL_PARA_PILOTO','PILOTO_INTERNO','HOMOLOGADA_MANUAL','HOMOLOGADA_API') THEN
    RAISE EXCEPTION 'Fonte com termos a confirmar não avança para piloto nem homologação.';
  END IF;

  IF NEW.estagio_maturidade IN ('ELEGIVEL_PARA_PILOTO','PILOTO_INTERNO','HOMOLOGADA_MANUAL','HOMOLOGADA_API')
     AND NEW.status_documentacao <> 'completa' THEN
    RAISE EXCEPTION 'Avanço de maturidade exige documentação completa da fonte.';
  END IF;

  IF NEW.estagio_maturidade = 'HOMOLOGADA_API' AND NEW.modo_de_uso_permitido <> 'api_validada' THEN
    RAISE EXCEPTION 'Homologação por API exige modo de uso permitido api_validada. Fonte manual não equivale a API homologada.';
  END IF;

  IF NEW.estagio_maturidade = 'HOMOLOGADA_MANUAL' AND NEW.modo_de_uso_permitido NOT IN ('manual','metadados_linkout','parceria') THEN
    RAISE EXCEPTION 'Homologação manual exige modo de uso manual, metadados/linkout ou parceria.';
  END IF;

  IF NEW.scraping_status = 'nao_aplicavel' AND NEW.modo_de_uso_permitido = 'api_validada' AND NEW.status_documentacao <> 'completa' THEN
    RAISE EXCEPTION 'Modo API validada exige documentação completa e parecer registrado.';
  END IF;

  IF NEW.estagio_maturidade IN ('RESTRITA','DESCONTINUADA') AND NEW.status_integracao NOT IN ('bloqueada','sem_integracao') THEN
    RAISE EXCEPTION 'Fonte restrita ou descontinuada não pode permanecer com integração ativa.';
  END IF;

  -- Adendo §2 (M3-APROVADA) — pré-requisitos para API oficialmente
  -- autorizada: termos validados, autenticação confirmada, permissão de
  -- automação, revisão humana registrada. Sem os quatro, a fonte não entra
  -- nesta categoria por hipótese.
  IF NEW.modelo_acesso = 'M3-APROVADA' THEN
    IF NEW.modo_de_uso_permitido IS DISTINCT FROM 'api_validada'
       OR NEW.permite_automacao IS DISTINCT FROM 'sim'
       OR NEW.termos_de_uso_url IS NULL
       OR NEW.responsavel_validacao IS NULL THEN
      RAISE EXCEPTION 'M3-APROVADA exige modo_de_uso_permitido=api_validada, permite_automacao=sim, termos_de_uso_url e responsavel_validacao preenchidos. Nenhuma fonte entra nesta categoria por hipótese.';
    END IF;
  END IF;

  NEW.updated_at := now();
  NEW.updated_by := auth.uid();
  RETURN NEW;
END;
$trigger$ LANGUAGE plpgsql;

COMMENT ON COLUMN public.genealogical_sources_catalog.modelo_acesso IS
  'Taxonomia M1-M6 do Adendo Bloco 5A (02/10/2026). Eixo distinto de nivel_de_fonte. M3-APROVADA travado por trg_g08_source_guard.';
