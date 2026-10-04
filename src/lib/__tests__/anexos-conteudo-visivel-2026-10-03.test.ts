import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import {
  ACAO_SEGUINTE_ANEXO,
  ROTULO_STATUS_ANEXO_SALVO,
  STATUS_ANEXO_SALVO,
  acaoSeguinteAnexo,
  conteudoDoAnexoSalvo,
  corpoRenderizadoDoAnexo,
  escaparHtml,
  rotuloStatusAnexoSalvo,
} from "@/lib/anexos-conteudo";
import { instanciasDeAnexos } from "@/lib/anexos-persistidos.server";
import { conferirInstancias } from "@/lib/anexos-instancia";

/**
 * Proprietária, 03/10/2026: "Os anexos não estão lá vivos, o mesmo com os
 * demais — não consegue se ver o que está sendo aprovado."
 *
 * Causa medida: `rendered_html` das 19 instâncias do caso tinha só código,
 * título, finalidade e regra; os campos efetivamente aprovados viviam apenas
 * em `structured_data` e nenhuma tela lia isso. O selo "drafting" aparecia
 * sem rótulo humano e sem ação seguinte.
 */

const ANEXO = {
  codigo: "ANEXO_I_ORDEM_SERVICO",
  titulo: "Anexo I — Ordem de Serviço",
  finalidade: "Vincular escopo aprovado e entregas da OS ao instrumento.",
  regra: "Somente após proposta/OS válida e aprovada do mesmo caso.",
  condicional: false,
  aplicavel: true,
  obrigatorio: true,
  motivo: "Proposta aprovada vinculada ao caso.",
  estado: "obrigatorio" as const,
  campos: [
    { rotulo: "Cliente", valor: "Ana Luiza Silveira", fonte: "crm_confirmado" },
    { rotulo: "Prazo de execução", valor: null, fonte: "proposta_aprovada", observacaoAusencia: "Sem prazo aprovado." },
  ],
  pendencias: ["Prazo de execução ainda não aprovado."],
  impactoAusencia: "Sem Anexo I a OS não pode ser emitida.",
  destinos: ["revisao" as const],
  gatesBloqueados: [],
};

describe("Anexos vivos — o conteúdo aprovado fica visível (03/10/2026)", () => {
  it("1. o conteúdo salvo deixa de ser só título/finalidade: inclui os campos aprovados", () => {
    const [i] = instanciasDeAnexos({ anexos: [ANEXO as never], internos: [] });
    expect(i.rendered_html).toContain("Ana Luiza Silveira");
    expect(i.rendered_html).toContain("Prazo de execução");
    expect(i.rendered_html).toContain("Sem prazo aprovado.");
    expect(i.rendered_html).toContain("crm_confirmado");
    expect(i.rendered_html).toContain("Prazo de execução ainda não aprovado.");
    expect(i.rendered_html).toContain("Sem Anexo I a OS não pode ser emitida.");
  });

  it("2. campo sem valor nunca ganha valor fictício — entra como pendência nomeada", () => {
    const html = corpoRenderizadoDoAnexo({
      codigo: "X",
      titulo: "T",
      campos: [{ rotulo: "CPF", valor: null }],
    });
    expect(html).toContain("Pendente — não inferido.");
    expect(html).not.toMatch(/CPF<\/th><td>[0-9]/);
  });

  it("3. texto do caso é escapado antes de entrar no HTML salvo", () => {
    expect(escaparHtml('<script>a&"b"')).toBe("&lt;script&gt;a&amp;&quot;b&quot;");
    const html = corpoRenderizadoDoAnexo({
      codigo: "X",
      titulo: "<img onerror=1>",
      campos: [{ rotulo: "Obs", valor: "<b>x</b>" }],
    });
    expect(html).not.toContain("<img");
    expect(html).not.toContain("<b>x</b>");
    expect(html).toContain("&lt;img");
  });

  it("4. o leitor traduz structured_data em conteúdo exibível, sem inventar nada", () => {
    const [i] = instanciasDeAnexos({ anexos: [ANEXO as never], internos: [] });
    const c = conteudoDoAnexoSalvo(i.structured_data);
    expect(c).not.toBeNull();
    expect(c!.campos.map((x) => x.rotulo)).toEqual(["Cliente", "Prazo de execução"]);
    expect(c!.campos[1].valor).toBeNull();
    expect(c!.campos[1].observacaoAusencia).toBe("Sem prazo aprovado.");
    expect(c!.pendencias).toEqual(["Prazo de execução ainda não aprovado."]);
    expect(c!.impactoAusencia).toBe("Sem Anexo I a OS não pode ser emitida.");
  });

  it("5. estado vazio é declarado, não preenchido com texto genérico", () => {
    expect(conteudoDoAnexoSalvo({})).toBeNull();
    expect(conteudoDoAnexoSalvo(null)).toBeNull();
    expect(conteudoDoAnexoSalvo("texto")).toBeNull();
    expect(conteudoDoAnexoSalvo([])).toBeNull();
  });

  it("6. dispensa manual gravada é lida como tal", () => {
    const c = conteudoDoAnexoSalvo({ overrideManual: true, motivo: "Menor sem representação exigida." });
    expect(c?.overrideManual).toBe(true);
    expect(c?.motivo).toBe("Menor sem representação exigida.");
  });

  it("7. nenhum estado salvo fica como selo inerte: todos têm rótulo humano e próximo passo", () => {
    for (const s of STATUS_ANEXO_SALVO) {
      expect(ROTULO_STATUS_ANEXO_SALVO[s], s).toBeTruthy();
      expect(ACAO_SEGUINTE_ANEXO[s], s).toBeTruthy();
      expect(rotuloStatusAnexoSalvo(s)).not.toBe(s);
      expect(acaoSeguinteAnexo(s)).toBeTruthy();
    }
    // "drafting" era exatamente o chip sem função dos 5 anexos internos.
    expect(rotuloStatusAnexoSalvo("drafting")).toBe("Em preparação");
    expect(acaoSeguinteAnexo("drafting")).toContain("Revisar");
    expect(rotuloStatusAnexoSalvo(null)).toBe("Sem instância salva");
  });

  it("8. anexo interno só persistido também chega à tela com conteúdo e estado", () => {
    const instancias = instanciasDeAnexos({
      anexos: [],
      internos: [{ codigo: "ANX-ESCOPO", titulo: "Anexo de escopo", motivo: "Sempre aplicável ao caso." } as never],
    });
    const linhas = conferirInstancias(
      [],
      instancias.map((i) => ({
        annex_code: i.annex_code,
        title: i.title,
        status: i.status,
        annex_version: 1,
        model_version: i.model_version,
        file_hash: null,
        tem_conteudo: true,
        atualizado_em: null,
        is_test: false,
        conteudo: conteudoDoAnexoSalvo(i.structured_data),
      })),
    );
    expect(linhas).toHaveLength(1);
    expect(linhas[0].estado).toBe("somente_persistida");
    expect(linhas[0].statusPersistido).toBe("drafting");
    expect(linhas[0].conteudo?.motivo).toBe("Sempre aplicável ao caso.");
    expect(linhas[0].conteudo?.natureza).toBe("interno");
  });

  it("9. as telas mostram o conteúdo salvo, o estado real e o próximo passo", () => {
    // 04/10/2026: o conteúdo saiu para um componente único, usado no fluxo
    // (cartão de anexos) e no bloco recolhido — uma renderização, dois lugares.
    const conteudo = readFileSync("src/components/contrato/conteudo-salvo-anexo.tsx", "utf8");
    expect(conteudo).toContain("Ver o conteúdo salvo deste anexo");
    expect(conteudo).not.toContain("dangerouslySetInnerHTML");
    const painel = readFileSync("src/components/contrato/instancia-documental.tsx", "utf8");
    expect(painel).toContain("ConteudoSalvoDoAnexo");
    expect(painel).toContain("rotuloStatusAnexoSalvo");
    expect(painel).toContain("acaoSeguinteAnexo");
    expect(painel).toContain("l.conteudo");
    // Conteúdo é renderizado estruturado; markup do banco nunca é injetado.
    expect(painel).not.toContain("dangerouslySetInnerHTML");

    const anexos = readFileSync("src/components/contrato/anexos-i-v.tsx", "utf8");
    // O conteúdo aprovado aparece no próprio cartão de anexos do fluxo.
    expect(anexos).toContain("ConteudoSalvoDoAnexo");
    expect(anexos).toContain("Instância salva:");
    expect(anexos).toContain("rotuloStatusAnexoSalvo");
    expect(anexos).toContain("Ainda sem instância salva");

    const leitor = readFileSync("src/lib/anexos-instancia.functions.ts", "utf8");
    expect(leitor).toContain("conteudoDoAnexoSalvo(l.structured_data)");
    expect(leitor).not.toContain("rendered_html: l.rendered_html");
  });
});
