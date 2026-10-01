-- Corte 1 (01/10/2026) — Fonte e Evidência Únicas.
--
-- `research_evidence_items` passa a ser a tabela canônica de evidência (é a
-- única com dado real: 5 linhas em 2 casos; `evidences` está vazia). Mas o
-- grafo de transição vive nos 11 valores em português do CHECK
-- `evidences_workflow_ck`, enquanto `evidence_status` aqui só aceita 6 valores
-- em inglês. Mapear 11 → 6 perderia estado operacional: "requer tradução" e
-- "requer retificação" virariam ambos `under_review`, e a equipe deixaria de
-- saber o que a evidência está esperando.
--
-- Esta coluna aditiva carrega **exatamente o mesmo vocabulário já aprovado**
-- em `evidences` — nenhum termo novo é inventado. `evidence_status` continua
-- NOT NULL e válido, alimentado por de-para a partir daqui
-- (`src/lib/evidencia-canonica.ts#parDeEstado`), para os leitores existentes
-- não quebrarem.
--
-- Aditiva e nullable: linha antiga segue válida e aparece como "recebida" até
-- a equipe reclassificar explicitamente — o sistema não adivinha.

ALTER TABLE public.research_evidence_items
  ADD COLUMN IF NOT EXISTS workflow_status text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.research_evidence_items'::regclass
      AND conname = 'rei_workflow_status_ck'
  ) THEN
    ALTER TABLE public.research_evidence_items
      ADD CONSTRAINT rei_workflow_status_ck CHECK (
        workflow_status IS NULL OR workflow_status IN (
          'recebida',
          'registrada',
          'em_revisao',
          'divergente',
          'insuficiente',
          'requer_complemento',
          'requer_retificacao',
          'requer_traducao_apostila',
          'rejeitada_inaplicavel',
          'aprovada_para_entrega',
          'publicada'
        )
      );
  END IF;
END $$;

COMMENT ON COLUMN public.research_evidence_items.workflow_status IS
  'Situação fina da evidência (mesmo vocabulário de evidences_workflow_ck, 11 valores). evidence_status é a projeção grossa derivada por de-para. Nulo = linha anterior ao Corte 1, tratada como recebida até reclassificação humana.';
