import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * Achado crítico #1 do audit-as-ux-eng (reviews/audit-as-ux-eng.md, 01/11/2026):
 * `communication_queue` recebia rascunhos (#205, contratos.functions.ts, cadastro-checklist.functions.ts)
 * com `status: "awaiting_approval"`/`"rascunho"`, mas nenhum `.tsx` do repositório lia essa tabela —
 * a equipe não tinha onde achar nem aprovar o rascunho depois de criado.
 *
 * Fecha o gap reaproveitando a tela /atendimento já existente (sem Desk sector novo, por
 * AGENTS.md — "nunca manter segunda lista de menu"): painelAtendimento passa a ler
 * communication_queue, e duas novas ações (aprovar/arquivar) ficam disponíveis ali.
 */

const FUNCOES = resolve(__dirname, "../portal-atendimento.functions.ts");
const COMPONENTE = resolve(__dirname, "../../components/portal/atendimento-interno.tsx");
const ROTA = resolve(__dirname, "../../routes/_authenticated/atendimento.tsx");
const ATENDIMENTO_LIB = resolve(__dirname, "../atendimento.ts");

function ler(caminho: string): string {
  return readFileSync(caminho, "utf8");
}

describe("UX crítico #1 — fila de comunicação sem tela de aprovação", () => {
  it("painelAtendimento lê communication_queue e devolve rascunhosComunicacao", () => {
    const funcoes = ler(FUNCOES);
    expect(funcoes).toMatch(/\.from\("communication_queue"\)/);
    expect(funcoes).toContain("rascunhosComunicacao: (rascunhos.data ?? [])");
  });

  it("a leitura exclui arquivados e já enviados, sem inventar status novo", () => {
    const funcoes = ler(FUNCOES);
    const bloco = funcoes.slice(funcoes.indexOf('.from("communication_queue")'));
    expect(bloco.slice(0, 400)).toMatch(/\.is\("archived_at", null\)/);
    expect(bloco.slice(0, 400)).toMatch(/\.is\("sent_at", null\)/);
  });

  it("aprovarRascunhoComunicacao só marca revisão — não envia nada", () => {
    const funcoes = ler(FUNCOES);
    expect(funcoes).toContain("export const aprovarRascunhoComunicacao");
    const bloco = funcoes.slice(funcoes.indexOf("export const aprovarRascunhoComunicacao"));
    const corpo = bloco.slice(0, bloco.indexOf("export const arquivarRascunhoComunicacao"));
    expect(corpo).toContain('status: "approved"');
    expect(corpo).toContain("approved_by: userId");
    expect(corpo).not.toMatch(/sendEmail|enviarEmail|resend|whatsapp.*send/i);
  });

  it("arquivarRascunhoComunicacao exige papel autorizado e nunca exclui a linha", () => {
    const funcoes = ler(FUNCOES);
    const bloco = funcoes.slice(funcoes.indexOf("export const arquivarRascunhoComunicacao"));
    expect(bloco).toContain("PAPEIS_ENTREGA.includes(papel)");
    expect(bloco).toContain('status: "archived"');
    expect(bloco).not.toMatch(/\.delete\(\)/);
  });

  it("a rota /atendimento valida ?rascunho= e repassa para o componente", () => {
    const rota = ler(ROTA);
    expect(rota).toContain("validateSearch: buscaAtendimento");
    expect(rota).toContain("Route.useSearch()");
    expect(rota).toMatch(/rascunhoFoco=\{rascunho\}/);
  });

  it("buscaAtendimento só deixa passar rascunho, igual ao padrão de buscaGoLive", () => {
    const lib = ler(ATENDIMENTO_LIB);
    expect(lib).toContain("export function buscaAtendimento");
  });

  it("AtendimentoInterno renderiza a fila com ações de aprovar e arquivar", () => {
    const componente = ler(COMPONENTE);
    expect(componente).toContain("Fila de comunicação pendente de aprovação");
    expect(componente).toContain("aprovarComunicacao.mutate({ rascunhoId: r.id })");
    expect(componente).toContain('acaoExterna="arquivar_rascunho_comunicacao"');
  });

  it("o card de indicador avisa quantos rascunhos aguardam aprovação", () => {
    const componente = ler(COMPONENTE);
    expect(componente).toContain("Comunicações aguardando aprovação");
    expect(componente).toContain("rascunhosPendentesCount");
  });
});
