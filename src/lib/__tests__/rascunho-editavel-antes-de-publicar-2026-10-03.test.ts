import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import { recusaDePublicacaoNoApp } from "@/lib/projecao-publicavel";

/**
 * 03/10/2026 — pedido literal da Proprietária, sobre o texto da Ana: "veja se
 * temos um campo que podemos editar o texto antes de ser publicado sempre com
 * persistência universal... no futuro tudo terá que ser revisado com copy da
 * marca".
 *
 * Não tínhamos. Medido: `publicarNoAppGoLive` ia direto a `published`, com
 * insert cru (sem releitura, sem auditoria) e — o defeito que explica a tela
 * vazia da Ana — SEM o guard de fronteira, que ficou só em
 * `publicarInstrumentoNoAppGoLive`. A microentrega dela ficou "publicada" no
 * banco com a palavra "fontes" e o App a descartou em silêncio.
 */

const ESCRITORES = readFileSync("src/lib/golive-escritores.functions.ts", "utf8");

function corpo(nome: string): string {
  const i = ESCRITORES.indexOf(`export const ${nome} = createServerFn`);
  if (i < 0) throw new Error(`${nome} não existe`);
  const j = ESCRITORES.indexOf("\nexport const ", i + 10);
  return ESCRITORES.slice(i, j === -1 ? undefined : j);
}

describe("Rascunho editável com persistência — o passo que faltava antes de publicar", () => {
  it("existem os três atos separados: salvar rascunho, listar, publicar", () => {
    for (const nome of ["salvarRascunhoProjecaoApp", "listarRascunhosProjecaoApp", "publicarRascunhoProjecaoApp"]) {
      expect(ESCRITORES).toContain(`export const ${nome} = createServerFn`);
    }
  });

  it("o rascunho grava com releitura (persistência universal) e audita", () => {
    const c = corpo("salvarRascunhoProjecaoApp");
    expect(c).toMatch(/inserirComVerificacao|gravarComVerificacao/);
    expect(c).toContain("inserirComVerificacao");
    expect(c).toContain("gravarComVerificacao");
    expect(c).toContain("audit_logs");
    expect(c).toContain('approval_status: "draft"');
  });

  it("salvar NÃO bloqueia por texto ainda não publicável — devolve o motivo", () => {
    /*
      O rascunho é interno. Bloquear o salvamento impediria justamente editar
      o texto problemático. Quem recusa é a publicação.
    */
    const c = corpo("salvarRascunhoProjecaoApp");
    expect(c).toContain("recusaDePublicacaoNoApp");
    expect(c).not.toContain("exigirPublicavelNoApp");
  });

  it("publicar o rascunho aplica o guard, grava com releitura e registra timeline", () => {
    const c = corpo("publicarRascunhoProjecaoApp");
    expect(c).toContain("exigirTipoPublicavelNoApp");
    expect(c).toContain("exigirPublicavelNoApp");
    expect(c).toContain("gravarComVerificacao");
    expect(c).toContain("registrarTimelineCaso");
    // Só rascunho é promovido por aqui — nunca reabre algo já publicado.
    expect(c).toContain('!== "draft"');
  });

  it("publicarNoAppGoLive ganhou o guard que faltava e deixou de usar insert cru", () => {
    const c = corpo("publicarNoAppGoLive");
    expect(c).toContain("exigirTipoPublicavelNoApp");
    expect(c).toContain("exigirPublicavelNoApp");
    expect(c).toContain("inserirComVerificacao");
    // O guard precisa vir ANTES da gravação, ou não guarda nada.
    expect(c.indexOf("exigirPublicavelNoApp")).toBeLessThan(c.indexOf("inserirComVerificacao"));
  });

  it("o texto real da Ana, como estava publicado, é recusado com motivo — e a versão aprovada passa", () => {
    const comoEstava = "Concluimos a primeira prancha da linha materna Silveira e ja registramos as fontes consultadas.";
    const recusa = recusaDePublicacaoNoApp(comoEstava);
    expect(recusa).not.toBeNull();
    expect(recusa!.motivo).toContain("vocabulário interno");

    const aprovada =
      "Concluímos a primeira prancha da linha materna Silveira. Estado de validação: em conferência. Próximo passo: devolutiva da equipe.";
    expect(recusaDePublicacaoNoApp(aprovada)).toBeNull();
  });

  it("a tela de microentregas salva rascunho em vez de publicar direto, e monta o painel de revisão", () => {
    const rota = readFileSync("src/routes/_authenticated/golive.microentregas.tsx", "utf8");
    expect(rota).toContain("salvarRascunhoProjecaoApp");
    expect(rota).not.toContain("publicarNoAppGoLive");
    expect(rota).toContain("<RascunhosApp />");
  });

  it("o painel mostra o motivo e fecha o botão de publicar enquanto o texto não puder ir", () => {
    const painel = readFileSync("src/components/golive/rascunhos-app.tsx", "utf8");
    expect(painel).toContain("r.recusa.motivo");
    expect(painel).toContain("r.recusa.comoCorrigir");
    expect(painel).toContain("disabled={Boolean(r.recusa)");
    // Publica-se o que está gravado, não o que está na tela sem salvar.
    expect(painel).toContain('(textos[r.id] ?? "") !== r.conteudo');
  });
});
