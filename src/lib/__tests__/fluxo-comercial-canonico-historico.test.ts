import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const ler = (p: string) => readFileSync(p, "utf8");

/**
 * 27/08/2026 — "o CRM que vamos usar é o que foi derivado do Painel de
 * Calls e roteiro de discovery, dump de WhatsApp... CRM mestre e legado
 * nunca usei" (Proprietária). Confirmado direto no banco: contacts,
 * opportunities e crm_interactions têm 0 registros cada — nunca foram
 * usados. Viviam embutidos dentro de /leads, competindo visualmente com o
 * CRM real (leads, com dado de verdade). Relocados para
 * /historico/fluxo-comercial-canonico — nada apagado, só parou de disputar
 * a mesma tela do CRM canônico.
 */
describe("Fluxo comercial canônico (contacts/opportunities) — histórico, não em /leads", () => {
  const leads = ler("src/routes/_authenticated/leads.tsx");
  const historico = "src/routes/_authenticated/historico.fluxo-comercial-canonico.tsx";

  it("/leads não embute mais o modelo paralelo nunca usado", () => {
    expect(leads).not.toContain("FluxoComercialCanonico");
    expect(leads).not.toContain("PainelCanonicoCrm");
  });

  it("o âncora antigo continua alcançável, agora como ponte pro histórico", () => {
    expect(leads).toContain('id="crm-contatos"');
    expect(leads).toContain("/historico/fluxo-comercial-canonico");
  });

  it("a visão histórica existe, preserva os dois componentes e não redireciona", () => {
    expect(existsSync(historico)).toBe(true);
    const rota = ler(historico);
    expect(rota).toContain("<FluxoComercialCanonico");
    expect(rota).toContain("<PainelCanonicoCrm");
    expect(rota).toContain('createFileRoute("/_authenticated/historico/fluxo-comercial-canonico")');
    expect(rota).toContain('name: "robots", content: "noindex"');
    expect(rota).not.toMatch(/redirect|navigate\(/);
    expect(rota).toContain('to="/leads"');
  });

  it("fica fora do menu principal — só alcançável pelo link em /leads", () => {
    const nav = ler("src/lib/navegacao-desk.ts");
    expect(nav).not.toContain('to: "/historico/fluxo-comercial-canonico"');
  });
});
