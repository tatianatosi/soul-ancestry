import { describe, expect, it } from "vitest";
import { createRootRoute, createRoute, createRouter } from "@tanstack/react-router";
import { sitemapStaticPaths, sitemapXML } from "../sitemap";

describe("mapa público do Clube Ancestral", () => {
  it("inclui Home e exclui toda a área privada mesmo com filho marcado", () => {
    const root = createRootRoute({ staticData: { sitemap: false } });
    const home = createRoute({ getParentRoute: () => root, path: "/", staticData: { sitemap: true } });
    const portal = createRoute({ getParentRoute: () => root, path: "portal", staticData: { sitemap: "exclude-subtree" } });
    const child = createRoute({ getParentRoute: () => portal, path: "arvore", staticData: { sitemap: true } });
    const router = createRouter({ routeTree: root.addChildren([home, portal.addChildren([child])]) });
    expect(sitemapStaticPaths(router)).toEqual(["/"]);
  });
  it("usa o domínio público sem datas artificiais ou URLs duplicadas", () => {
    const xml = sitemapXML("https://soul-ancestry.lovable.app", [{ path: "/" }, { path: "/" }]);
    expect(xml.match(/<loc>/g)).toHaveLength(1);
    expect(xml).toContain("<loc>https://soul-ancestry.lovable.app/</loc>");
    expect(xml).not.toContain("<lastmod>");
  });
  it("recusa endereço externo como entrada", () => {
    expect(() => sitemapXML("https://soul-ancestry.lovable.app", [{ path: "//outro.test/" }])).toThrow();
  });
});