import { describe, expect, it } from "vitest";

import {
  CATALOGOS_TEMPLATE,
  PRECEDENCIA_TEMPLATES,
  podeSerFonteDeTemplate,
  resolverCatalogoTemplate,
  rotaCanonicaTemplates,
} from "@/lib/consolidacao-catalogos-templates";
import { DUPLICIDADE_CATALOGOS_TEMPLATE } from "@/lib/fiacao-cadencia-catalogo";
import { MODULOS_DESK } from "@/lib/desk-modulos";

describe("CA-OPS-03 — consolidação dos catálogos de templates", () => {
  it("tem exatamente um catálogo canônico", () => {
    expect(CATALOGOS_TEMPLATE.filter((c) => c.papel === "canonico")).toHaveLength(1);
  });

  it("a Biblioteca de Mensagens prevalece", () => {
    expect(PRECEDENCIA_TEMPLATES.vencedor).toBe("biblioteca-mensagens");
    expect(PRECEDENCIA_TEMPLATES.rotaVencedora).toBe("/biblioteca-mensagens");
  });

  it("o alias histórico resolve para a fonte canônica", () => {
    expect(resolverCatalogoTemplate("bib-templates-com")?.id).toBe("biblioteca-mensagens");
    expect(rotaCanonicaTemplates("bib-templates-com")).toBe("/biblioteca-mensagens");
  });

  it("alias nunca pode ser fonte de conteúdo", () => {
    expect(podeSerFonteDeTemplate("bib-templates-com")).toBe(false);
    expect(podeSerFonteDeTemplate("biblioteca-mensagens")).toBe(true);
  });

  it("não remove rotas nem histórico", () => {
    expect(PRECEDENCIA_TEMPLATES.rotasRemovidas).toHaveLength(0);
    expect(PRECEDENCIA_TEMPLATES.historicoPreservado).toBe(true);
  });

  it("registro de duplicidade fica resolvido", () => {
    expect(DUPLICIDADE_CATALOGOS_TEMPLATE.decisaoHumanaPendente).toBe(false);
  });

  it("a entrada do Desk aponta para a fonte única", () => {
    const modulo = MODULOS_DESK.find((m) => m.id === "bib-templates-com");
    expect(modulo?.tipo).toBe("duplicado");
    expect(modulo?.fonteUnica).toBe("biblioteca-mensagens");
    expect(modulo?.destino).toContain("/biblioteca-mensagens");
  });
});
