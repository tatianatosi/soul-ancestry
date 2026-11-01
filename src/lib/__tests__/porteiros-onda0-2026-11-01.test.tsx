// @vitest-environment jsdom
/**
 * Onda 0 (01/11/2026): os porteiros órfãos ganham chamador real, provado por render.
 * - classificacao-dados → bloco "Origem dos dados fixos" em /qualidade
 * - portal-navegacao / portal-mapa-kit → barra do App Cliente e lista de abas
 * - rotulos-humanos → nome de tabela não aparece cru no Desk
 */
import { readFileSync } from "node:fs";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { OrigemDosDados } from "@/components/qualidade/origem-dos-dados";
import { ABAS_APP_CLIENTE } from "@/components/portal/abas-app-cliente";
import { INVENTARIO_FONTES, type FonteClassificada } from "@/lib/classificacao-dados";
import { abasCanonicasDoPortal } from "@/lib/portal-navegacao";
import { MAPA_APP_CLIENTE_KIT } from "@/lib/portal-mapa-kit";
import { rotuloHumano } from "@/lib/rotulos-humanos";

afterEach(cleanup);

describe("classificacao-dados no Desk", () => {
  it("lista cada fonte fixa com a classificação e diz que nenhuma não-real chega ao App", () => {
    render(<OrigemDosDados />);
    for (const f of INVENTARIO_FONTES) expect(screen.getByText(f.modulo)).toBeTruthy();
    expect(screen.getByRole("status").textContent).toMatch(/Nenhuma fonte fixa não-real está ligada ao App Cliente/);
  });

  it("acusa fonte não-real exposta ao App e fonte sem prova", () => {
    const ruim: FonteClassificada[] = [
      { modulo: "src/data/x.ts", descricao: "fixture", classificacao: "demo", superficies: ["app_cliente"], prova: "" },
    ];
    render(<OrigemDosDados inventario={ruim} />);
    const aviso = screen.getByRole("status").textContent ?? "";
    expect(aviso).toMatch(/1 fonte\(s\) não-real aparecem na superfície do App Cliente/);
    expect(aviso).toMatch(/1 fonte\(s\) sem prova de origem/);
    expect(screen.getByText("Sem prova registrada")).toBeTruthy();
  });

  it("vazio honesto quando não há fonte registrada", () => {
    render(<OrigemDosDados inventario={[]} />);
    expect(screen.getByText("Nenhuma fonte fixa registrada.")).toBeTruthy();
  });

  it("está montado na tela de Qualidade, não só importado em teste", () => {
    expect(readFileSync("src/routes/_authenticated/qualidade.tsx", "utf8")).toContain("<OrigemDosDados />");
  });
});

describe("navegação única do App Cliente", () => {
  it("a barra (portal-navegacao) e as abas (portal-mapa-kit) têm as mesmas 7 rotas, na mesma ordem", () => {
    const barra = abasCanonicasDoPortal().map((a) => a.rota);
    expect(barra).toHaveLength(7);
    expect(ABAS_APP_CLIENTE.map((a) => a.rota)).toEqual(barra);
    expect(MAPA_APP_CLIENTE_KIT.map((m) => m.rota)).toEqual(barra);
  });

  it("o shell consome a fonte única em vez de lista própria", () => {
    const shell = readFileSync("src/components/portal/portal-shell.tsx", "utf8");
    expect(shell).toContain("abasCanonicasDoPortal()");
    expect(shell).not.toMatch(/\{ to: "\/portal\/jornada"/);
  });

  it("os rótulos da barra coincidem com o texto de cada tela (COPY_TELAS)", () => {
    const rotulos = abasCanonicasDoPortal().map((a) => a.rotulo);
    expect(rotulos).toEqual(ABAS_APP_CLIENTE.map((a) => a.rotulo));
  });
});

describe("rotulos-humanos no Desk", () => {
  it("traduz nome técnico de tabela e mantém o que não conhece legível", () => {
    expect(rotuloHumano("audit_logs")).toBe("Registro de auditoria");
    expect(rotuloHumano("tabela_nova_x")).toBe("Tabela nova x");
    expect(within(document.body).queryByText("audit_logs")).toBeNull();
  });

  it("manifesto e configuração de acesso usam o rótulo, não o nome da tabela", () => {
    expect(readFileSync("src/components/governanca/manifesto.tsx", "utf8")).toContain("rotuloHumano(h.entidade)");
    expect(readFileSync("src/components/desk/configuracao-acesso-v4.tsx", "utf8")).toContain('rotuloHumano(String(e["entidade"]))');
  });
});
