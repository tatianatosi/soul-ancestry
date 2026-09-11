import { describe, expect, it } from "vitest";
import { existsSync, statSync } from "node:fs";
import { MARCA_LOGOS, SITE_OFICIAL, MARCA_GUIA_PATH } from "@/lib/marca";
import { BRAND_LOGO_URL, BRAND_SITE_URL } from "@/lib/brand-asset";

describe("Marca oficial + site SEO (2026-09-11)", () => {
  it("SITE_OFICIAL é o domínio institucional e não um host Vercel", () => {
    expect(SITE_OFICIAL).toBe("https://clubeancestral.com.br/");
    expect(BRAND_SITE_URL).toBe(SITE_OFICIAL);
    expect(SITE_OFICIAL).not.toContain("vercel.app");
  });

  it("logos oficiais existem em public/marca e o principal permanece estável", () => {
    expect(existsSync("public/marca/logo-variante-1.svg")).toBe(true);
    expect(existsSync("public/marca/logo-variante-2.svg")).toBe(true);
    expect(existsSync("public/marca/logo-variante-3.svg")).toBe(true);
    expect(statSync("public/marca/logo-variante-1.svg").size).toBe(127559);
    expect(BRAND_LOGO_URL).toBe(MARCA_LOGOS.principal);
    expect(existsSync("public/clube-ancestral-logo.svg")).toBe(true);
    expect(statSync("public/clube-ancestral-logo.svg").size).toBe(127559);
  });

  it("guia de marca arquivado está no caminho canônico", () => {
    expect(existsSync(MARCA_GUIA_PATH)).toBe(true);
  });
});
