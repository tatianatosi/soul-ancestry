-- Resgate Ana (autorização explícita da Proprietária, 27/09/2026):
-- o instrumento da Ana é o Contrato de Estudo Genealógico v2 (MODELO-ESTUDO +
-- BASE-GEN-V2, texto já vigente) — não um "Contrato-base familiar" genérico.
-- Só troca o título de apresentação de um contrato ainda não assinado; não
-- altera cláusula, parte, valor, status nem versão. Idempotente.
UPDATE public.contracts
SET title = 'Contrato de Estudo Genealógico v2 — Silveira / Friedmann-Reimer (Áustria)'
WHERE id = 'a11a0000-0000-4000-8000-0000000000c1'
  AND title LIKE 'Contrato-base familiar%'
  AND signed_at IS NULL;
