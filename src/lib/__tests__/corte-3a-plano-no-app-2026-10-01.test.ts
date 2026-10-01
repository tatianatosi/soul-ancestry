import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import {
  conteudoPlano,
  pareceComercial,
  planoPublicado,
  rotuloSituacaoPlano,
  validarPublicacaoPlano,
} from "@/lib/plano-publicacao";

/**
 * Corte 3a (01/10/2026) — "Publicar plano no App". A Conta mostra nome,
 * situação e vigência. Preço, parcela e SKU seguem proibidos (A7).
 */
const ler = (p: string) => readFileSync(p, "utf8");
const ok = { nomeComercial: "Acompanhamento Familiar de Cidadania", situacao: "ativo", vigencia: "até dezembro de 2026" };

describe("o que nunca pode ir ao App", () => {
  it("recusa preço, parcela, desconto e código de catálogo", () => {
    for (const texto of [
      "R$ 9.600",
      "10 parcelas de 320",
      "com desconto",
      "valor combinado",
      "CA-CID-023",
      "PP-01",
      "PROD-DIAG-FAM-MULTI",
      "9.600",
      "320,00",
    ])
      expect(pareceComercial(texto)).toBe(true);
  });

  it("deixa passar texto legítimo do cliente", () => {
    for (const texto of ["Acompanhamento Familiar de Cidadania", "até dezembro de 2026", "Em preparação"])
      expect(pareceComercial(texto)).toBe(false);
  });

  it("a validação recusa o plano inteiro quando o texto tem preço ou dado interno", () => {
    expect(validarPublicacaoPlano(ok)).toEqual([]);
    expect(validarPublicacaoPlano({ ...ok, nomeComercial: "Plano R$ 9.600" }).join(" ")).toMatch(/preço, parcela ou código/);
    expect(validarPublicacaoPlano({ ...ok, vigencia: "10 parcelas" }).join(" ")).toMatch(/preço, parcela ou código/);
    expect(validarPublicacaoPlano({ ...ok, situacao: "inventado" }).join(" ")).toMatch(/situação/);
    expect(validarPublicacaoPlano({ ...ok, nomeComercial: "aa" }).join(" ")).toMatch(/nome do plano/);
  });
});

describe("conteúdo e leitura", () => {
  it("monta e relê nome · situação · vigência", () => {
    expect(rotuloSituacaoPlano("ativo")).toBe("Em acompanhamento");
    const conteudo = conteudoPlano(ok);
    expect(conteudo).toBe("Acompanhamento Familiar de Cidadania · Em acompanhamento · até dezembro de 2026");
    expect(planoPublicado([{ id: "1", projection_type: "plano", content_sanitized: conteudo, effective_from: "2026-10-01" }])).toEqual({
      nome: "Acompanhamento Familiar de Cidadania",
      situacao: "Em acompanhamento",
      vigencia: "até dezembro de 2026",
    });
  });

  it("vale a publicação mais recente; sem plano devolve null", () => {
    const base = { projection_type: "plano" };
    expect(
      planoPublicado([
        { ...base, id: "1", content_sanitized: "Antigo · Pausado", effective_from: "2026-09-01" },
        { ...base, id: "2", content_sanitized: "Novo · Em acompanhamento", effective_from: "2026-10-01" },
      ])?.nome,
    ).toBe("Novo");
    expect(planoPublicado([])).toBeNull();
    expect(planoPublicado([{ id: "9", projection_type: "marco", content_sanitized: "Outro tipo" }])).toBeNull();
  });

  it("uma publicação que escapou com preço não é exibida nem assim", () => {
    // Defesa em profundidade: se algo entrou no banco por fora, o leitor ignora.
    expect(planoPublicado([{ id: "1", projection_type: "plano", content_sanitized: "Plano · R$ 9.600" }])).toBeNull();
  });
});

describe("escritor e telas", () => {
  const fn = ler("src/lib/plano-publicacao.functions.ts");
  it("publica com aprovador, data, destino app e tipo plano; grava com releitura", () => {
    for (const t of [
      'projection_type: "plano"',
      'destination: "app"',
      'approval_status: "published"',
      "approved_by: userId",
      "approved_at: agora",
      "inserirComVerificacao(",
      "gravarComVerificacao(",
      "validarPublicacaoPlano(",
    ])
      expect(fn).toContain(t);
    expect((fn.match(/\.eq\("organization_id", organizationId\)/g) ?? []).length).toBeGreaterThanOrEqual(4);
  });

  it("despublicar arquiva com motivo, nunca apaga", () => {
    expect(fn).toContain('approval_status: "archived", archived_at:');
    expect(fn).toContain("motivo (mínimo 5 letras)");
  });

  it("o escritor antigo de contrato/proposta ficou intocado", () => {
    // `publicarInstrumentoNoAppGoLive` publica com parcelas — é outro uso.
    expect(ler("src/lib/golive-escritores.functions.ts")).toContain("publicarInstrumentoNoAppGoLive");
    expect(fn).not.toContain("publicarInstrumentoNoAppGoLive");
  });

  it("painel no Desk em Caso 360 › Formalização, com confirmação inline", () => {
    expect(ler("src/routes/_authenticated/casos.$caseId.index.tsx")).toContain("<PublicarPlanoApp caseId={id} />");
    const painel = ler("src/components/contrato/publicar-plano-app.tsx");
    expect(painel).toContain("Confirmar publicação");
    expect(painel).toContain("Confirmar retirada");
    expect(painel).not.toContain("window.confirm");
  });

  it("a Conta do App lê o plano publicado e não importa o escritor do Desk", () => {
    const tela = ler("src/routes/portal/conta.tsx");
    expect(tela).toContain("planoPublicado(vivo.data?.projecoes ?? [])");
    expect(tela).toContain("data-conta-plano-nome");
    expect(tela).not.toContain("plano-publicacao.functions");
  });
});
