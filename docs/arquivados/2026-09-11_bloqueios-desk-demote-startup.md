/**
 * 2026-09-11 — Demote de bloqueios excessivos no Desk (startup solo).
 *
 * Decisão da proprietária (Tatiana Melani Tosi): a operação é startup, não
 * banco nem empresa de 100+ pessoas. Checklists longos, SLAs e gates que
 * desabilitavam botões deixavam a admin sem ação.
 *
 * O que permanece (informa):
 * - Requisitos de ativação / onboarding / formalização como lista visível
 * - SLA e cadência como sinal no Painel / Ops (sem disabled)
 * - Confirmação com motivo em ação externa (política de autoridade)
 *
 * O que deixou de impedir a proprietária (código vivo):
 * - Ativar caso com checklist incompleto → AcaoOperacional + owner_override
 * - Handoff Discovery com gates incompletos → mesmo padrão
 * - Próxima ação incompleta → defaults internos (Tatiana, desk_only, +7d)
 * - Caso ativo sem responsável → livre para proprietária; default = sessão
 * - Preparação contratual → podeExecutar(..., papel) libera admin
 *
 * Responsável padrão canônico: `src/lib/responsavel-padrao.ts`
 * Política: `docs/politicas/politica-autoridade-operacional.md`
 *
 * Complemento (mesmo dia): retirou ticks que só reconfirmam identidade —
 * «sou a responsável», «aprovação interna», checklist da contratada por caso
 * e tarefa de perfil institucional. Ver `src/lib/checks-identidade-startup.ts`.
 *
 * Não apagamos tabelas nem migrations de checklist — só o comportamento de
 * trava na aplicação. Artefatos de governança já removidos estão em
 * `docs/arquivados/governanca-removida-2026-08-29/`.
 */

export const DEMOTE_BLOQUEIOS_STARTUP_2026_09_11 = {
  responsavelPadrao: "Tatiana Melani Tosi",
  principio: "pendencia_informa_nao_impede",
  superficies: [
    "onboarding_ativacao",
    "mesa_discovery_handoff",
    "proxima_acao",
    "preparacao_contratual",
    "abertura_caso_tarefa",
    "checks_identidade_contratada",
  ],
} as const;
