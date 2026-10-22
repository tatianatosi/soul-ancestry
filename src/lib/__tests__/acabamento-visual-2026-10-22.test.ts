import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";

/**
 * Acabamento visual do Desk e do App (22/10/2026).
 *
 * Decisões vinculantes da Proprietária, no parecer de design: fade de 200ms no
 * Desk, redução de movimento respeitada, esqueleto no lugar de texto de espera,
 * ícone dourado no vazio honesto, home pública com dois botões, árvore em SVG
 * nativo, Recharts eliminado e nenhuma dependência nova.
 */
const styles = readFileSync("src/styles.css", "utf8");
const shell = readFileSync("src/components/saas/shell.tsx", "utf8");
const home = readFileSync("src/routes/index.tsx", "utf8");
const portalShell = readFileSync("src/components/portal/portal-shell.tsx", "utf8");
const heatmap = readFileSync("src/components/desk/heatmap-aderencia-pais.tsx", "utf8");
const saudeHero = readFileSync("src/components/caso/case-health-hero.tsx", "utf8");
const pacote = JSON.parse(readFileSync("package.json", "utf8")) as {
  dependencies: Record<string, string>;
  devDependencies?: Record<string, string>;
};

describe("Desk: fade de entrada e redução de movimento", () => {
  it("o fade de 200ms existe e é escopado ao conteúdo do Desk", () => {
    expect(styles).toContain("[data-desk-entrada]");
    expect(styles).toMatch(/animation:\s*desk-entrada\s*200ms/);
    expect(styles).toContain("@keyframes desk-entrada");
  });

  it("o bloco é remontado por rota, para a animação rodar a cada troca de tela", () => {
    expect(shell).toContain('<div key={rota} data-desk-entrada>');
  });

  it("quem pede menos movimento no sistema não recebe animação no Desk", () => {
    const reduzido = styles.slice(styles.lastIndexOf("@media (prefers-reduced-motion: reduce)"));
    expect(reduzido).toContain("[data-desk-shell] *");
    expect(reduzido).toMatch(/animation-duration:\s*0\.01ms\s*!important/);
    expect(reduzido).toMatch(/transition-duration:\s*0\.01ms\s*!important/);
  });

  it("nenhum token global foi alterado para isso", () => {
    expect(styles).toContain("--navy: #13294B;");
    expect(styles).toContain("--gold: #C2A84D;");
    expect(styles).toContain("--cream: #F0EEE9;");
  });
});

describe("Vazio honesto com ícone dourado", () => {
  it("o EstadoVazio tem ícone em text-gold, decorativo, e o texto segue igual", () => {
    const bloco = shell.slice(shell.indexOf("export function EstadoVazio"));
    expect(bloco).toContain("text-gold");
    expect(bloco).toContain('aria-hidden="true"');
    expect(bloco).toContain("<p>{mensagem}</p>");
  });
});

describe("Home pública: dois botões, sem superfície interna", () => {
  it("tem exatamente os dois botões aprovados", () => {
    expect(home).toContain(">\n                Entrar no Clube\n              </Link>");
    expect(home).toContain(">\n                Falar com Especialista\n              </a>");
  });

  it("o WhatsApp vem da fonte única, sem número novo no arquivo", () => {
    expect(home).toContain("WHATSAPP_ESPECIALISTA");
    expect(home).toContain("href={WHATSAPP_ESPECIALISTA.url}");
    expect(home).not.toMatch(/wa\.me\/\d/);
  });

  it("a prévia da equipe e o atalho para /golive saíram da vitrine", () => {
    // O caminho ainda pode ser citado em comentário (explicando para onde foi);
    // o que não pode é existir link ou caso fixo apontando para lá.
    expect(home).not.toContain('to="/app-cliente-como-pessoa"');
    expect(home).not.toContain('to="/golive"');
    expect(home).not.toContain("a11a0000-0000-4000-8000-000000000002");
    expect(home).not.toMatch(/>\s*Acessar App do Cliente/);
  });

  it("a árvore é SVG nativo, em token de marca, e é decorativa", () => {
    const arvore = home.slice(home.indexOf("function ArvoreInstitucional"), home.indexOf("export const Route"));
    expect(arvore).toContain("<svg");
    expect(arvore).toContain('role="presentation"');
    expect(arvore).toContain('aria-hidden="true"');
    expect(arvore).toContain("var(--navy)");
    expect(arvore).toContain("var(--gold)");
    expect(arvore).not.toMatch(/#[0-9a-fA-F]{6}/);
  });
});

describe("App Cliente: esqueleto no lugar do texto de espera", () => {
  it("o carregamento desenha a silhueta dos cards sem perder o texto de leitor de tela", () => {
    const bloco = portalShell.slice(portalShell.indexOf("export function PortalCarregando"));
    expect(bloco).toContain("data-portal-carregando");
    expect(bloco).toContain('aria-busy="true"');
    expect(bloco).toContain('<span className="sr-only">{COPY_GERAL.carregando}</span>');
    expect(bloco).toContain("animate-pulse");
    expect(bloco).toContain("app-folha");
  });
});

describe("Cores: tokens no lugar de hex fixo", () => {
  it("heatmap e cartão de saúde usam token nas cores da paleta oficial", () => {
    for (const arquivo of [heatmap, saudeHero]) {
      expect(arquivo).not.toContain("#13294B");
      expect(arquivo).not.toContain("#F0EEE9");
      expect(arquivo).not.toContain("#1B365D");
    }
    expect(saudeHero).not.toContain("#FCB73A");
    expect(saudeHero).toContain("text-gold");
  });

  it("a escala do heatmap continua sendo escala — os dois tons intermediários não têm token", () => {
    // Decisão consciente: #D6DEE9 e #7C93B3 são degraus entre cream e navy, sem
    // token equivalente. Trocá-los por token achataria o heatmap.
    expect(heatmap).toContain("#D6DEE9");
    expect(heatmap).toContain("#7C93B3");
  });
});

describe("Dependências: Recharts fora, nada novo dentro", () => {
  it("recharts saiu do package.json e o componente órfão foi removido", () => {
    expect(pacote.dependencies.recharts).toBeUndefined();
    expect(existsSync("src/components/ui/chart.tsx")).toBe(false);
  });

  it("nenhuma biblioteca de animação foi instalada", () => {
    const todas = { ...pacote.dependencies, ...(pacote.devDependencies ?? {}) };
    for (const proibida of ["framer-motion", "motion", "gsap", "animejs", "lottie-react", "@lottiefiles/dotlottie-react"]) {
      expect(todas[proibida], `dependência não autorizada: ${proibida}`).toBeUndefined();
    }
  });
});
