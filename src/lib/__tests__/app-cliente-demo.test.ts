import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { GRUPOS_DESK, MENU_CONTA } from "@/lib/navegacao-desk";

const ler = (p: string) => readFileSync(p, "utf8");

const rota = ler("src/routes/_authenticated/app-cliente-demo.tsx");
const abas = ler("src/components/portal/abas-app-cliente.tsx");
const shell = ler("src/components/portal/portal-shell.tsx");
const fonte = ler("src/components/portal/fonte-portal.tsx");
const visib = ler("src/components/portal/portal-visibilidade.tsx");

describe("sessão demo do App Cliente", () => {
  it("renderiza os componentes reais do portal, não uma reprodução", () => {
    expect(abas).toContain('from "@/routes/portal/jornada"');
    expect(abas).toContain('from "@/routes/portal/arvore"');
    expect(abas).toContain('from "@/routes/portal/radar"');
    expect(rota).toContain("ABAS_APP_CLIENTE");
  });

  it("é rota interna do Desk, autenticada e noindex", () => {
    expect(rota).toContain('createFileRoute("/_authenticated/app-cliente-demo")');
    expect(rota).toContain('{ name: "robots", content: "noindex" }');
  });

  it("monta o provider com o selo de dado fictício", () => {
    expect(rota).toContain("<FontePortalProvider");
    expect(rota).toContain("selo: SELO_DEMO_PORTAL");
  });

  it("nada nesta tela envia, publica ou grava", () => {
    expect(rota).not.toMatch(/useMutation|\.insert\(|\.update\(|\.delete\(|enviar|publicar/i);
  });

  it("as sete abas do mockup são a face; Entregas e Fases não são 1º nível", () => {
    expect([...abas.matchAll(/chave: "/g)]).toHaveLength(7);
    expect(abas).toContain('chave: "home"');
    expect(abas).toContain('chave: "conta"');
    expect(abas).not.toContain("/portal/entregas");
    expect(abas).not.toContain("/portal/fase-01");
  });
});

describe("guardas do modo de prévia", () => {
  it("a consulta ao portal fica desabilitada sob provider", () => {
    // Rota interna não deve nem tentar ler o portal como se fosse cliente.
    expect(fonte).toContain("enabled: externa === null");
  });

  it("a visibilidade não chama escopoDoPortal em prévia — senão as abas travam em Carregando", () => {
    expect(visib).toContain("enabled: previa === null");
    expect(visib).toContain("ESCOPO_PREVIA");
    expect(visib).toContain("carregando: false");
  });

  it("o shell não redireciona quem não é cliente, em prévia", () => {
    // Sem isto, a Proprietária seria expulsa da própria tela que abriu.
    expect(shell).toContain("if (previa) return;");
  });

  it("sair da prévia não encerra a sessão do Desk", () => {
    // O botão do App Cliente chama signOut(); em prévia isso deslogaria a
    // Proprietária do Desk inteiro.
    const corpoSair = shell.slice(
      shell.indexOf("async function sair()"),
      shell.indexOf("return (", shell.indexOf("async function sair()")),
    );
    const saidaAntecipada = corpoSair.indexOf("if (previa)");
    const signOut = corpoSair.indexOf("signOut()");
    expect(saidaAntecipada).toBeGreaterThan(-1);
    expect(signOut).toBeGreaterThan(saidaAntecipada);
  });

  it("o selo aparece no topo sempre que há prévia", () => {
    expect(shell).toContain("data-previa-portal");
    expect(shell).toContain("{previa.selo}");
  });

  it("em prévia o cabeçalho mostra a origem, não o nome de um cliente", () => {
    expect(shell).toContain("previa ? previa.titulo :");
  });
});

describe("o link morto do espelho no menu", () => {
  it("deixou de apontar para a âncora que nunca existiu", () => {
    const json = JSON.stringify(GRUPOS_DESK);
    expect(json).not.toContain('"espelho"');
  });

  it("a sessão demo saiu do grupo Cliente e mora no menu da conta", () => {
    expect(JSON.stringify(GRUPOS_DESK)).not.toContain("/app-cliente-demo");
    expect(JSON.stringify(MENU_CONTA)).toContain("/app-cliente-demo");
  });
});
