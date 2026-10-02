-- Heatmap de aderência por país (campos 14/16/18 da Ficha Master, 54 campos)
-- Prioridade 2 da sequência de execução de 02/10/2026 (instrução literal da
-- Proprietária: "Implementar os 5 campos do heatmap no Planejador").
--
-- Percentual de aderência por ramo/país liberado no App em 01/10/2026
-- (exceção registrada, declarada em docs/decisoes, e em
-- src/lib/excecoes-fronteira-app.ts quando o Corte 1-quater a criar) —
-- "radar do progresso de cada aba do App", não parecer jurídico.
--
-- Aditiva, nullable, sem reescrever linha existente. lineage_paths já é a
-- estrutura real de ramos por caso (P14, múltiplos ramos), cada um ligado a
-- citizenship_tracks.pais — não cria tabela nova nem coluna duplicada de
-- país (isso já existe via citizenship_track_id).
ALTER TABLE public.lineage_paths
  ADD COLUMN IF NOT EXISTS aderencia_percentual smallint;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'lineage_paths_aderencia_percentual_ck'
  ) THEN
    ALTER TABLE public.lineage_paths
      ADD CONSTRAINT lineage_paths_aderencia_percentual_ck
      CHECK (aderencia_percentual IS NULL OR (aderencia_percentual BETWEEN 0 AND 100));
  END IF;
END $$;

COMMENT ON COLUMN public.lineage_paths.aderencia_percentual IS
  'Percentual de aderência do ramo (0-100, sem símbolo %). Gravado sempre inteiro — nunca string com "%". Liberado no App em 01/10/2026 (heatmap), nunca no 4º eixo "Elegibilidade" do Radar sem decisão separada.';
