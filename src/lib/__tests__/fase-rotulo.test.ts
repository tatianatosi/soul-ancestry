import { describe, expect, it } from "vitest";

import { rotuloFase, rotuloFaseCliente } from "@/lib/fase-rotulo";
import { FASES_JORNADA as FASES_ONBOARDING } from "@/lib/onboarding-jornada";
import { FASES_JORNADA as FASES_ENTREGA, ROTULO_FASE } from "@/lib/jornada-cliente";

describe("rótulo de fase", () => {
  it("as duas grafias da mesma fase rendem o mesmo rótulo", () => {
    // É o defeito que aparecia na tela: `case_plans.fase_jornada` grava
    // "aceite_e_formalizacao" e a tela rotulava por "aceite_formalizacao".
    expect(rotuloFase("aceite_e_formalizacao")).toBe(rotuloFase("aceite_formalizacao"));
    expect(rotuloFase("pesquisa_e_validacao")).toBe(rotuloFase("pesquisa_validacao"));
    expect(rotuloFase("protocolo_e_acompanhamento")).toBe(rotuloFase("protocolo_acompanhamento"));
  });

  it("todo id dos dois catálogos tem rótulo legível", () => {
    for (const id of FASES_ENTREGA) expect(rotuloFase(id)).toBe(ROTULO_FASE[id]);
    for (const f of FASES_ONBOARDING) expect(rotuloFase(f.id)).toBe(f.rotulo);
  });

  it("nenhum rótulo devolvido é o próprio id cru", () => {
    // O sintoma era a Proprietária ler "aceite_e_formalizacao — 3" na tela.
    for (const f of FASES_ONBOARDING) expect(rotuloFase(f.id)).not.toBe(f.id);
  });

  it("valor fora do catálogo volta como veio, sem rótulo inventado", () => {
    expect(rotuloFase("fase_desconhecida_do_banco")).toBe("fase_desconhecida_do_banco");
    expect(rotuloFase(null)).toBe("Sem fase registrada");
  });

  it("a linguagem do cliente existe para toda fase de onboarding", () => {
    for (const f of FASES_ONBOARDING) expect(rotuloFaseCliente(f.id)).toBe(f.cliente);
    expect(rotuloFaseCliente("fase_que_nao_existe")).toBeNull();
  });

  it("os dois catálogos cobrem as mesmas oito fases", () => {
    // Se um dos lados ganhar ou perder uma fase, isto quebra antes de a tela
    // passar a mostrar id cru de novo.
    const norm = (v: string) => v.replace(/_e_/g, "_");
    expect(new Set(FASES_ONBOARDING.map((f) => norm(f.id)))).toEqual(
      new Set(FASES_ENTREGA.map(norm)),
    );
  });
});

describe("atalhos contextuais no menu", () => {
  it("marca o grupo de origem quando a rota é citada de fora dele", async () => {
    const { origemDoAtalho } = await import("@/lib/navegacao-desk");
    // /matriz-juridica mora em Governança e é citada em Comercial e Casos.
    expect(origemDoAtalho("Comercial", "/matriz-juridica")).toBe("Governança");
    expect(origemDoAtalho("Casos", "/matriz-juridica")).toBe("Governança");
  });

  it("não marca a entrada canônica — não há nada a dizer ali", async () => {
    const { origemDoAtalho } = await import("@/lib/navegacao-desk");
    expect(origemDoAtalho("Governança", "/matriz-juridica")).toBeNull();
    expect(origemDoAtalho("Marketing", "/marketing")).toBeNull();
  });

  it("rota sem registro de atalho não ganha marca", async () => {
    const { origemDoAtalho } = await import("@/lib/navegacao-desk");
    expect(origemDoAtalho("Casos", "/tarefas")).toBeNull();
  });

  it("toda rota de LINKS_CONTEXTUAIS aparece mesmo nos grupos declarados", async () => {
    const { GRUPOS_DESK, LINKS_CONTEXTUAIS } = await import("@/lib/navegacao-desk");
    for (const l of LINKS_CONTEXTUAIS) {
      for (const nome of [l.origem, ...l.tambemEm]) {
        const g = GRUPOS_DESK.find((x) => x.label === nome);
        expect(g, `grupo ${nome} não existe`).toBeTruthy();
        const tem = g!.sub.some((s) => "to" in s && s.to === l.rota);
        expect(tem, `${l.rota} deveria estar em ${nome}`).toBe(true);
      }
    }
  });
});
