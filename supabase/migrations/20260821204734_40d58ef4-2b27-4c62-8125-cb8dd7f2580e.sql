ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS status_call text,
  ADD COLUMN IF NOT EXISTS elegibilidade_preliminar text,
  ADD COLUMN IF NOT EXISTS confianca_triagem text,
  ADD COLUMN IF NOT EXISTS geracao_ascendente text,
  ADD COLUMN IF NOT EXISTS linha_transmissao text,
  ADD COLUMN IF NOT EXISTS risco_ruptura text,
  ADD COLUMN IF NOT EXISTS complexidade_documental text,
  ADD COLUMN IF NOT EXISTS estado_documental_inicial text,
  ADD COLUMN IF NOT EXISTS pendencia_documental_prioritaria text,
  ADD COLUMN IF NOT EXISTS exige_idioma_entrevista text,
  ADD COLUMN IF NOT EXISTS requerentes_potenciais integer,
  ADD COLUMN IF NOT EXISTS estrutura_familiar text,
  ADD COLUMN IF NOT EXISTS objecao_predominante text,
  ADD COLUMN IF NOT EXISTS nivel_intencao text,
  ADD COLUMN IF NOT EXISTS produtos_recomendados text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS sku_referencia text,
  ADD COLUMN IF NOT EXISTS despesas_terceiros_status text,
  ADD COLUMN IF NOT EXISTS despesas_terceiros_regra text,
  ADD COLUMN IF NOT EXISTS despesas_terceiros_faixa text,
  ADD COLUMN IF NOT EXISTS consentimento_gravacao boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS spin_situacao boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS spin_problema boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS spin_implicacao boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS spin_necessidade boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS gravacao_link_interno text,
  ADD COLUMN IF NOT EXISTS dossie_link_interno text;

ALTER TABLE public.leads
  ADD CONSTRAINT leads_despesas_regra_chk CHECK (
    despesas_terceiros_regra IS NULL OR despesas_terceiros_regra IN (
      'cliente_paga_direto','cliente_antecipa_aprovado','clube_nao_antecipa'
    )
  );

ALTER TABLE public.leads
  ADD CONSTRAINT leads_requerentes_chk CHECK (requerentes_potenciais IS NULL OR requerentes_potenciais > 0);