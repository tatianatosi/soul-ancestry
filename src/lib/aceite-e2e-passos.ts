/**
 * Roteiro canônico dos passos 3 a 8 do Aceite Final Operacional.
 *
 * Fonte única consumida por:
 *  - scripts/aceite-operacional-e2e.py (execução ponta a ponta autenticada)
 *  - src/lib/__tests__/aceite-e2e-passos.test.ts (integridade do roteiro)
 *
 * Nenhum passo executa ação externa (comunicação, cobrança, publicação,
 * pesquisa externa ou integração). Todos são leitura/navegação autenticada,
 * com coleta de evidência visual e de eventos de auditoria já persistidos.
 */

export const CASO_CANONICO = "CA-CID-AT-FAM-2026-001";
export const CASO_LEGADO = "CA-AUT-ANALUIZA-FAM-2026-001";

export type PassoAceiteE2E = {
  /** Identificador estável do passo (P3..P8). */
  id: string;
  /** Número do passo no roteiro de aceite. */
  numero: number;
  titulo: string;
  /** Rota interna autenticada visitada pelo harness. */
  rota: string;
  /** Texto que deve estar visível na página para o passo ser considerado válido. */
  evidenciaTexto: string;
  /** Nome do arquivo de captura gerado em output/aceite-e2e/. */
  captura: string;
  /** Tabelas de auditoria inspecionadas antes/depois do passo. */
  tabelasAuditoria: string[];
  /** O passo é apenas de leitura (não escreve em nenhuma tabela). */
  somenteLeitura: boolean;
};

export const PASSOS_ACEITE_E2E: readonly PassoAceiteE2E[] = [
  {
    id: "P3",
    numero: 3,
    titulo: "Operar Caso — identificador canônico e alias legado",
    rota: `/casos?busca=${CASO_LEGADO}`,
    evidenciaTexto: CASO_CANONICO,
    captura: "p3-caso-alias.png",
    tabelasAuditoria: ["case_aliases", "audit_logs"],
    somenteLeitura: true,
  },
  {
    id: "P4",
    numero: 4,
    titulo: "Operar Painel Hoje — fila, exceções e sinais",
    rota: "/painel",
    evidenciaTexto: "Painel Hoje",
    captura: "p4-painel-hoje.png",
    tabelasAuditoria: ["audit_logs"],
    somenteLeitura: true,
  },
  {
    id: "P5",
    numero: 5,
    titulo: "Operar Formalização — contrato-base e Anexos I–V",
    rota: "/governanca/contrato-base",
    evidenciaTexto: "Anexo",
    captura: "p5-formalizacao-anexos.png",
    tabelasAuditoria: ["contract_annexes", "contract_review_events"],
    somenteLeitura: true,
  },
  {
    id: "P6",
    numero: 6,
    titulo: "Operar Pesquisa — módulo genealógico do caso",
    rota: "/pesquisa",
    evidenciaTexto: "Pesquisa",
    captura: "p6-pesquisa.png",
    tabelasAuditoria: ["research_audit_events", "audit_logs"],
    somenteLeitura: true,
  },
  {
    id: "P7",
    numero: 7,
    titulo: "Operar Comercial — conversão e catálogo homologado",
    rota: "/conversao",
    evidenciaTexto: "Convers",
    captura: "p7-comercial.png",
    tabelasAuditoria: ["catalog_audit_events", "conversion_events"],
    somenteLeitura: true,
  },
  {
    id: "P8",
    numero: 8,
    titulo: "Operar Modo Proprietária — overrides auditados",
    rota: "/modo-proprietaria",
    evidenciaTexto: "Proprietária",
    captura: "p8-modo-proprietaria.png",
    tabelasAuditoria: ["owner_override_events", "audit_logs"],
    somenteLeitura: true,
  },
] as const;

/** Tabelas de auditoria consultadas pelo harness (união, sem repetição). */
export function tabelasAuditoriaMonitoradas(): string[] {
  return Array.from(
    new Set(PASSOS_ACEITE_E2E.flatMap((p) => p.tabelasAuditoria)),
  ).sort();
}

export function passoPorId(id: string): PassoAceiteE2E | undefined {
  return PASSOS_ACEITE_E2E.find((p) => p.id === id);
}
