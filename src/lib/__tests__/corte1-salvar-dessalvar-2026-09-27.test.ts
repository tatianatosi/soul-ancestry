import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";

import { formularioDoPlanoSalvo, preservadoDoPlanoSalvo } from "@/lib/planejador-salvo";
import { camposAlterados } from "@/lib/jornada-planejador";
import { sincronizarParametroDependentes } from "@/lib/dependentes.server";
import { MARCA_ESVAZIADO_PELA_EQUIPE } from "@/lib/parametros-dicionario";

/**
 * Corte 1 (27/09/2026) — "salvar/dessalvar em qualquer aba e sair da linha".
 * Cada teste trava uma das causas reais: formulário que abria em branco e
 * apagava o salvo, rascunho que passava de um registro a outro, servidor que
 * dizia "salvo" sem salvar e pré-carga que devolvia o que foi apagado.
 */

const ler = (p: string) => readFileSync(p, "utf8");

describe("Planejador do Caso 360 abre com o plano salvo", () => {
  const linha = {
    objetivo: "Cidadania austríaca",
    etapa: "Discovery concluído",
    fase_jornada: "onboarding",
    produto_pai_id: "PP-01",
    composicao: "nucleo_familiar",
    rota_confirmada: "Áustria §58c",
    proxima_acao: "Enviar certidão",
    prazo_proxima_acao: "2026-10-05T00:00:00+00:00",
    entregas: ["Dossiê"],
    microentregas: ["Prancha 1", "Prancha 2"],
    marcos: ["Assinatura"],
    checklist_aplicavel: ["RG"],
    perguntas: [],
    dependencias_cliente: ["Certidão original"],
    dependencias_terceiros: [],
    fontes: { cartorio: { estado: "confirmada", referencia: "Livro 3" } },
    regras_anexos: ["Anexo II"],
  };

  it("traduz a linha de case_plans de volta para o formulário (nada volta em branco)", () => {
    const f = formularioDoPlanoSalvo(linha, "CA-CID-001");
    expect(f.objetivo).toBe("Cidadania austríaca");
    expect(f.faseJornada).toBe("onboarding");
    expect(f.produtoPaiId).toBe("PP-01");
    expect(f.composicao).toBe("nucleo_familiar");
    expect(f.produtoSkuCodigo).toBe("CA-CID-001");
    expect(f.prazoProximaAcao).toBe("2026-10-05");
    expect(f.microentregas).toBe("Prancha 1\nPrancha 2");
    expect(f.dependenciasCliente).toBe("Certidão original");
  });

  it("valor fora do vocabulário nunca é inventado — vira vazio", () => {
    const f = formularioDoPlanoSalvo({ ...linha, fase_jornada: "fase_2_pesquisa", produto_pai_id: "PP-99" });
    expect(f.faseJornada).toBe("");
    expect(f.produtoPaiId).toBe("");
  });

  it("fontes e regras de anexos salvas voltam intactas no próximo salvar", () => {
    const p = preservadoDoPlanoSalvo(linha);
    expect(p.fontes).toEqual([{ chave: "cartorio", estado: "confirmada", referencia: "Livro 3" }]);
    expect(p.regrasAnexos).toEqual(["Anexo II"]);
    expect(preservadoDoPlanoSalvo(null)).toEqual({ fontes: [], regrasAnexos: [] });
  });

  it("o componente lê o plano salvo, não envia listas vazias e invalida as telas certas", () => {
    const src = ler("src/components/contrato/planejador-operacional.tsx");
    expect(src).toContain("lerPlanejadorSalvo");
    expect(src).toContain("fontes: preservado.fontes");
    expect(src).toContain("regrasAnexos: preservado.regrasAnexos");
    expect(src).not.toMatch(/fontes: \[\],/);
    for (const chave of ["planejador-salvo", "jornada-planejador", "ficha-caso-cadeia-operacional"]) expect(src).toContain(`"${chave}"`);
  });

  it("a atualização do plano grava, relê e compara (gravarComVerificacao)", () => {
    const srv = ler("src/lib/cadeia-operacional.server.ts");
    const trecho = srv.slice(srv.indexOf("if (planId) {"), srv.indexOf("} else {", srv.indexOf("if (planId) {")));
    expect(trecho).toContain("gravarComVerificacao");
    expect(trecho).not.toContain('.update(payload)');
  });
});

describe("Jornada do planejador envia só o que mudou", () => {
  const plano = {
    etapa: "Onboarding",
    rotaConfirmada: "Áustria",
    produtoPaiId: "PP-01",
    marcoAtual: "D0",
    responsavelUserId: "u1",
    proximaAcao: "Ligar",
    prazoProximaAcao: "2026-10-01",
  };

  it("nenhuma mudança → nada vai ao servidor", () => {
    expect(camposAlterados({ ...plano }, plano)).toEqual({});
  });

  it("só o campo editado é enviado; limpar vira null", () => {
    expect(camposAlterados({ ...plano, marcoAtual: "D7" }, plano)).toEqual({ marco_atual: "D7" });
    expect(camposAlterados({ ...plano, prazoProximaAcao: "" }, plano)).toEqual({ prazo_proxima_acao: null });
  });
});

describe("Rascunho não passa de um registro para outro", () => {
  it("Caso 360: o formulário só é zerado ao trocar de caso ou após o próprio salvar", () => {
    const src = ler("src/routes/_authenticated/casos.$caseId.index.tsx");
    expect(src).not.toMatch(/setForm\(\{\}\);\s*\n\s*\}, \[caso\?\.\["updated_at"\]\]\)/);
    expect(src).toMatch(/setForm\(\{\}\);\s*\n\s*\}, \[id\]\)/);
  });

  it("/calls: trocar de lead zera rascunho (também via link) e pede confirmação com edição pendente", () => {
    const src = ler("src/components/crm/painel-calls.tsx");
    expect(src).toContain("const trocarLead");
    expect(src).toContain("Há alterações não salvas neste lead");
    expect(src).not.toContain("window.confirm(");
    const efeito = src.slice(src.indexOf("if (!leadIdInicial) return;"), src.indexOf("}, [leadIdInicial]);"));
    expect(efeito).toContain("setRascunho({})");
  });

  it("/nucleos: núcleo novo abre com rascunho próprio; abrir outro zera membro em edição", () => {
    const src = ler("src/routes/_authenticated/nucleos.tsx");
    const abrir = src.slice(src.indexOf("function abrir(n: Nucleo)"), src.indexOf("function abrir(n: Nucleo)") + 400);
    expect(abrir).toContain("setRascunhoMembro(null)");
    expect(src).toContain("if (recarregado) abrir(recarregado)");
  });

  it("salvarMembroNucleo só grava na organização da sessão", () => {
    const src = ler("src/lib/nucleos-desk.functions.ts");
    const fn = src.slice(src.indexOf("export const salvarMembroNucleo"));
    expect(fn.slice(0, fn.indexOf("const { data: nucleo }"))).toContain('.eq("organization_id", organization_id)');
  });

  it("Ficha genealógica: salvar limpa a edição do perfil; trocar de aba com edição pendente confirma", () => {
    const src = ler("src/routes/_authenticated/pessoas-linhagens.$caseId.tsx");
    expect(src).toContain("Há alterações não salvas no Perfil 360°");
    expect(src).toContain("{ onSuccess: () => aoSalvar?.() }");
  });
});

describe("Servidor não diz 'salvo' sem salvar", () => {
  const src = ler("src/lib/saas.functions.ts");
  it("campo obrigatório esvaziado é recusado com mensagem, não descartado em silêncio", () => {
    expect(src).toContain("recusados.push(chave)");
    expect(src).toContain("CAMPO_OBRIGATORIO_VAZIO");
  });
  it("prazo limpo de propósito não volta preenchido pelo padrão de startup", () => {
    expect(src).toContain("if (enviadosPelaTela.has(k)) continue;");
  });
});

describe("Contrato: pré-carga não devolve o que a equipe apagou", () => {
  it("esvaziar marca a linha; a preparação pula linha marcada", () => {
    expect(ler("src/lib/contrato-parametros.functions.ts")).toContain(": MARCA_ESVAZIADO_PELA_EQUIPE");
    const prep = ler("src/lib/contrato-preparar.functions.ts");
    expect(prep).toContain("atual.origem_detalhe === MARCA_ESVAZIADO_PELA_EQUIPE");
    expect(prep).toContain("linhaEscopo.origem_detalhe !== MARCA_ESVAZIADO_PELA_EQUIPE");
    expect(MARCA_ESVAZIADO_PELA_EQUIPE).toBe("Esvaziado pela equipe");
  });

  it("linha da ficha de parâmetros remonta com o valor persistido", () => {
    expect(ler("src/routes/_authenticated/contrato-parametros.$id.tsx")).toContain(
      'key={`${v.id}:${v.valor ?? ""}:${v.status ?? ""}`}',
    );
  });

  it("salvar um dependente não apaga a edição dos outros", () => {
    const src = ler("src/components/contrato/painel-dependentes.tsx");
    expect(src).not.toMatch(/setNovo\(null\);\s*\n\s*setEdicao\(\{\}\);/);
    expect(src).toContain("[p.id as string]: _salvo");
  });

  function supabaseFalso(linhaValor: string | null) {
    const updates: unknown[] = [];
    const filtros: string[] = [];
    const q = (tabela: string): any => {
      const b: any = {
        select: () => b,
        eq: (c: string, v: string) => {
          filtros.push(`${tabela}.${c}=${v}`);
          return b;
        },
        is: () => b,
        update: (v: unknown) => {
          updates.push(v);
          return b;
        },
        maybeSingle: async () => ({ data: { id: "linha", valor: linhaValor } }),
        then: (r: any) =>
          r({
            data:
              tabela === "case_dependents"
                ? [{ id: "d1", nome_completo: "Felipe", vinculo_com_titular: "filho", status_representacao: "pendente" }]
                : [{ id: "ficha" }],
          }),
      };
      return b;
    };
    return { cli: { from: q }, updates, filtros };
  }

  it("sincronizar dependentes não regrava (nem desvalida) linha que já tem o mesmo resumo", async () => {
    const primeiro = supabaseFalso(null);
    await sincronizarParametroDependentes(primeiro.cli, "caso", "org");
    expect(primeiro.updates).toHaveLength(1);
    const resumo = (primeiro.updates[0] as { valor: string }).valor;

    const segundo = supabaseFalso(resumo);
    await sincronizarParametroDependentes(segundo.cli, "caso", "org");
    expect(segundo.updates).toHaveLength(0);
    expect(segundo.filtros).toContain("case_dependents.organization_id=org");
    expect(segundo.filtros).toContain("contract_case_parameters.organization_id=org");
  });
});

describe("Segurança achada junto", () => {
  it("módulo que alternava registros via supabaseAdmin sem login foi removido, com o componente morto que o usava", () => {
    expect(existsSync("src/lib/crm.functions.ts")).toBe(false);
    expect(existsSync("src/components/desk-crm.tsx")).toBe(false);
  });
});
