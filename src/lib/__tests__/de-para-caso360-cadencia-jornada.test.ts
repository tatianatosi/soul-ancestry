import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import { calcularCadencia } from "@/lib/jornada-cliente";

/**
 * §14 linha 7 do De-Para (Desk — Caso 360, "Jornada D0–D365"): etapa atual,
 * cadência Em dia, próxima ação, microentrega e alertas. Etapa, marcos,
 * última microentrega e alertas já existiam no Estado Integrado do Caso;
 * cadência era o único item ausente, apesar do motor (`calcularCadencia`,
 * já usado pelo Painel Hoje e pelo Fechamento de caso) já existir. Este
 * corte só liga o Estado Integrado ao mesmo motor, sobre o mesmo `caso`
 * já recebido por prop — nenhuma query nova.
 */

const componente = readFileSync("src/components/caso/estado-integrado.tsx", "utf8");

describe("EstadoIntegradoCaso — cadência real (§14 linha 7)", () => {
  it("importa o motor já existente, não recalcula a regra localmente", () => {
    expect(componente).toContain('import { calcularCadencia } from "@/lib/jornada-cliente";');
    expect(componente).toContain("calcularCadencia({");
  });

  it("lê os 3 campos de cadência direto do `caso` já recebido por prop — sem useQuery/useServerFn novo", () => {
    expect(componente).toContain('caso["ultimo_touchpoint_em"]');
    expect(componente).toContain('caso["aguardando_instituicao_externa"]');
    expect(componente).toContain('caso["motivo_espera_externa"]');
    expect(componente).not.toContain("useQuery");
    expect(componente).not.toContain("useServerFn");
  });

  it("renderiza o item Cadência com rótulo humano para os 3 estados do motor", () => {
    expect(componente).toContain('rotulo="Cadência"');
    expect(componente).toMatch(/regular:\s*"Em dia"/);
    expect(componente).toMatch(/atencao:\s*"Atenção"/);
    expect(componente).toMatch(/critico:\s*"Crítico"/);
  });

  it("caso sem touchpoint nunca aparece como 'Em dia' — motor real, sem fabricar estado otimista", () => {
    const saude = calcularCadencia({ hoje: new Date().toISOString(), ultimoTouchpointEm: null });
    expect(saude.status).toBe("critico");
    expect(saude.motivo).toBe("Nenhum touchpoint registrado com o cliente.");
  });

  it("espera institucional externa comunicada não vira alerta de cadência crítica", () => {
    const hoje = new Date().toISOString();
    const dias20atras = new Date(Date.now() - 20 * 86_400_000).toISOString();
    const saude = calcularCadencia({
      hoje,
      ultimoTouchpointEm: dias20atras,
      aguardandoInstituicaoExterna: true,
      motivoEsperaExterna: "Aguardando resposta do consulado.",
    });
    expect(saude.status).toBe("regular");
  });
});
