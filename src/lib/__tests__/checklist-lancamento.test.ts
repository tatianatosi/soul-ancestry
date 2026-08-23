import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

import {
  ACOES_NAO_ACIONAVEIS,
  ITENS_CHECKLIST,
  bloqueiosRemanescentes,
  calcularResumo,
  estadoEfetivo,
  montarRegistroDecisao,
  validarDecisaoLancamento,
  type ItemChecklist,
} from "@/lib/checklist-lancamento";

const componente = fs.readFileSync(
  path.resolve(process.cwd(), "src/components/governanca/checklist-lancamento.tsx"),
  "utf8",
);

describe("P0.3 — checklist de lançamento controlado", () => {
  it("1. nenhum item bloqueado/pendente aprova o lançamento automaticamente", () => {
    const resumo = calcularResumo();
    expect(resumo.aprovadoAutomaticamente).toBe(false);
    expect(resumo.decisaoHumanaNecessaria).toBe(true);
    expect(resumo.bloqueados).toBeGreaterThan(0);
    expect(bloqueiosRemanescentes().length).toBeGreaterThan(0);
    expect(resumo.semBloqueioTecnico).toBe(false);
  });

  it("item marcado como aprovado sem evidência cai para PENDENTE", () => {
    const item: ItemChecklist = {
      id: "x",
      secao: "dados",
      titulo: "sem prova",
      estado: "APROVADO_COM_EVIDENCIA",
      evidencia: "   ",
    };
    expect(estadoEfetivo(item)).toBe("PENDENTE");
  });

  it("2. o aceite exige ação explícita (decisão, responsável, motivo) e é auditado", () => {
    expect(
      validarDecisaoLancamento({ decisao: null, responsavel: "", motivo: "", cienteDosPendentes: false }),
    ).toHaveLength(3);

    expect(
      validarDecisaoLancamento({
        decisao: "liberar_acesso_controlado",
        responsavel: "Tatiana Tosi",
        motivo: "Liberação restrita para verificação interna de acesso.",
        cienteDosPendentes: false,
      }),
    ).toHaveLength(1);

    const pedido = {
      decisao: "liberar_acesso_controlado" as const,
      responsavel: "Tatiana Tosi",
      motivo: "Liberação restrita para verificação interna de acesso.",
      cienteDosPendentes: true,
    };
    expect(validarDecisaoLancamento(pedido)).toHaveLength(0);

    const registro = montarRegistroDecisao(pedido);
    expect(registro.acao).toBe("decisao_lancamento_controlado");
    expect(registro.entidade).toBe("checklist_lancamento_controlado");
    expect(registro.valor_novo.responsavel).toBe("Tatiana Tosi");
    expect(registro.pendencias_assumidas.length).toBeGreaterThan(0);
  });

  it("3. o checklist não aciona contrato, cobrança, assinatura, mensagem, integração ou publicação", () => {
    for (const item of ITENS_CHECKLIST.filter((i) => i.secao === "comercial_fora_de_escopo")) {
      expect(item.estado).toBe("BLOQUEADO");
    }
    for (const acao of ACOES_NAO_ACIONAVEIS) {
      expect(componente.includes(`executar_${acao}`)).toBe(false);
    }
    expect(componente).not.toMatch(/confirmarAcaoExterna|enviarEmail|emitirCobranca|publicar\(/);
    // A única escrita é o registro auditado da decisão humana.
    expect(componente.match(/useServerFn\(/g)).toHaveLength(1);
    expect(componente).toContain("registrarDecisaoProprietaria");
  });

  it("4. o checklist vive apenas na superfície interna (Modo Proprietária)", () => {
    const painel = fs.readFileSync(
      path.resolve(process.cwd(), "src/components/governanca/modo-proprietaria.tsx"),
      "utf8",
    );
    expect(painel).toContain("<ChecklistLancamentoControlado />");

    const usos = fs
      .readdirSync(path.resolve(process.cwd(), "src/routes"), { recursive: true })
      .filter((f): f is string => typeof f === "string" && /\.tsx?$/.test(f))
      .filter((f) => {
        const conteudo = fs.readFileSync(path.resolve(process.cwd(), "src/routes", f), "utf8");
        return conteudo.includes("ChecklistLancamentoControlado");
      });
    // nenhuma rota de portal/cliente importa o checklist
    expect(usos.filter((f) => /portal|canvas|cliente/i.test(f))).toHaveLength(0);
  });
});
