import { describe, expect, it } from "vitest";

import {
  agruparPlanoAcao,
  calcularEstimativa,
  estadoComunicacaoUI,
  pendenciasCriticasPesquisa,
  rascunhoComunicacao,
  validarItemPlano,
  type ItemPainel,
} from "@/lib/plano-acao-pesquisa";

const HOJE = new Date("2026-08-20T12:00:00.000Z");

const base: ItemPainel = {
  id: "a1",
  case_id: "c1",
  action_type: "solicitacao_documento",
  titulo: "Solicitar certidão de nascimento",
  reason: "Falta documento para comprovar geração 2.",
  priority: "critica",
  status: "planejada",
  due_date: "2026-08-18",
  data_origin: "registro_interno",
};

describe("G-07B plano de ação de pesquisa", () => {
  it("1. ação crítica vencida aparece no Painel Hoje", () => {
    const itens = pendenciasCriticasPesquisa([base], HOJE);
    expect(itens.map((i) => i.id)).toEqual(["a1"]);
    expect(agruparPlanoAcao([base], HOJE).urgenteHoje).toHaveLength(1);
  });

  it("2. ação aguardando resposta sem next_check_at é negada", () => {
    const erros = validarItemPlano({ ...base, status: "aguardando_resposta" });
    expect(erros).toContain("Item aguardando resposta exige data de próxima rechecagem.");
    expect(
      validarItemPlano({ ...base, status: "aguardando_resposta", next_check_at: "2026-08-27" }),
    ).toEqual([]);
  });

  it("3. ação realizada sem resultado interno é negada; com resultado gera interação imutável", () => {
    expect(validarItemPlano({ ...base, status: "realizada" })).toContain(
      "Registre o resultado interno da ação realizada.",
    );
    const valido = {
      ...base,
      status: "realizada" as const,
      contact_result_internal: "Atendente confirmou acervo.",
    };
    expect(validarItemPlano(valido)).toEqual([]);
    const rascunho = rascunhoComunicacao(valido);
    expect(rascunho.status).toBe("draft_created");
    expect(rascunho.enviado).toBe(false);
  });

  it("4. estimativa de terceiro calcula faixa e não cria lançamento financeiro", () => {
    const calc = calcularEstimativa({
      quantity: 2,
      unit_price_min: 80,
      unit_price_max: 120,
      currency: "BRL",
    });
    expect(calc.estimated_total_min).toBe(160);
    expect(calc.estimated_total_max).toBe(240);
    expect(calc.geraLancamentoFinanceiro).toBe(false);
    expect(calc.aviso).toMatch(/Não é caixa, receita/);
  });

  it("5. comunicação externa permanece em draft_created e não possui envio", () => {
    const externo = estadoComunicacaoUI({ ...base, suggested_channel: "email" });
    expect(externo.estado).toBe("draft_created");
    expect(externo.requerAprovacaoHumana).toBe(true);
    expect(externo.podeEnviarPelaUI).toBe(false);
    expect(estadoComunicacaoUI({ ...base, suggested_channel: "desk_only" }).estado).toBe(
      "sem_comunicacao",
    );
  });

  it("6. fixture não aparece no Painel Hoje", () => {
    const fixture = { ...base, id: "fx", data_origin: "fixture_demo" };
    expect(pendenciasCriticasPesquisa([base, fixture], HOJE).map((i) => i.id)).toEqual(["a1"]);
  });

  it("agrupa semana, rechecagens vencidas e histórico sem duplicar abertas", () => {
    const g = agruparPlanoAcao(
      [
        base,
        { ...base, id: "a2", due_date: "2026-08-24", priority: "alta" },
        {
          ...base,
          id: "a3",
          status: "aguardando_resposta",
          next_check_at: "2026-08-19",
          due_date: null,
        },
        { ...base, id: "a4", status: "concluida", contact_result_internal: "ok" },
      ],
      HOJE,
    );
    expect(g.estaSemana.map((i) => i.id)).toEqual(["a2"]);
    expect(g.rechecagensVencidas.map((i) => i.id)).toEqual(["a3"]);
    expect(g.concluidas.map((i) => i.id)).toEqual(["a4"]);
    expect(g.urgenteHoje.map((i) => i.id)).toEqual(["a1"]);
  });
});
