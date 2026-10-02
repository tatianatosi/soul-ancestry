-- Corte 0 (01/10/2026) — o vínculo documento↔evidência passa a apontar para a
-- tabela canônica.
--
-- `case_source_document_links.evidence_id` tem FK para `public.evidences`, que
-- deixou de ser a tabela canônica de evidência no Corte 1a (estava vazia, com
-- zero linhas, enquanto `research_evidence_items` tinha o dado real). Com essa
-- FK, gravar ali o id de uma evidência canônica é rejeitado pelo banco — era o
-- obstáculo que impedia religar `criarEvidenciaRascunhoDeFonte`.
--
-- Solução aditiva: uma coluna nova, com FK para a tabela canônica. A antiga
-- continua existindo e continua sendo lida, para a linha histórica que algum dia
-- apareça — hoje `case_source_document_links` tem 0 linhas, então não há o que
-- migrar, e nada é reescrito.
--
-- Não altera nem remove `evidence_id`. Não mexe em RLS.

ALTER TABLE public.case_source_document_links
  ADD COLUMN IF NOT EXISTS research_evidence_item_id uuid
    REFERENCES public.research_evidence_items(id);

COMMENT ON COLUMN public.case_source_document_links.research_evidence_item_id IS
  'Evidência canônica do vínculo (research_evidence_items). Substitui evidence_id, que aponta para a tabela legada public.evidences e permanece só para leitura de linha histórica.';

CREATE INDEX IF NOT EXISTS csdl_research_evidence_item_idx
  ON public.case_source_document_links(research_evidence_item_id);
