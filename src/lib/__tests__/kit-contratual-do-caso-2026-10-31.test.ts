import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import {
  kitContratualDoCaso,
  politicaDeDespesas,
  statusContratoBase,
  statusOrdemServico,
  statusProcuracaoDoAnexo,
  type EntradaKit,
  type LinhaAnexo,
  type LinhaDespesa,
} from "@/lib/kit-contratual-do-caso";

const caso = {
  id: "c1",
  codigo: "CA-TESTE-001",
  clienteNome: "Cliente de Teste",
  responsavel: "Equipe",
  abertoEm: "2026-10-01",
  pais: "AT",
};
const vazio: EntradaKit = {
  caso,
  contrato: null,
  versao: null,
  ordemServico: null,
  despesas: [],
  anexos: [],
  eventos: [],
};

const anexo = (
  annex_code: string,
  status: string,
  campos: { rotulo: string; valor: string | null }[] = [],
): LinhaAnexo => ({
  annex_code,
  status,
  annex_version: 1,
  structured_data: { campos: campos.map((c) => ({ ...c, fonte: "x", observacaoAusencia: null })) },
});

const despesa = (p: Partial<LinhaDespesa> = {}): LinhaDespesa => ({
  descricao: "Certidão",
  categoria: "certidao",
  estado: "estimada_comunicada",
  pagador: "cliente",
  estimativa_min: 100,
  estimativa_max: 200,
  valor_pago: null,
  moeda: "BRL",
  aprovado_pelo_cliente_em: null,
  observacoes: null,
  ...p,
});

describe("kitContratualDoCaso — vazio honesto (31/10/2026)", () => {
  it("caso sem nada registrado: tudo 'não criado', sem versão, sem aceite, sem timeline", () => {
    const k = kitContratualDoCaso(vazio);
    expect(k.contratacao.contrato_base).toMatchObject({
      status: "nao_enviado",
      versao: "",
      data_aceite: "",
    });
    expect(k.contratacao.ordem_servico.status).toBe("nao_criada");
    expect(k.contratacao.autorizacoes.pesquisa_especifica).toEqual([]);
    expect(k.contratacao.autorizacoes.procuracao_brasileira.status).toBe("nao_iniciada");
    expect(k.contratacao.autorizacoes.procuracao_europeia.status).toBe("nao_iniciada");
    expect(k.contratacao.alteracoes_escopo).toEqual([]);
    expect(k.contratacao.timeline).toEqual([]);
    expect(k.contratacao.despesas_externas.itens).toEqual([]);
    expect(k.avisos).toEqual([]);
  });

  it("nunca expõe documento para baixar nem link: o kit é só leitura", () => {
    const k = kitContratualDoCaso({
      ...vazio,
      contrato: {
        id: "k",
        contract_number: "CT-1",
        status: "signed",
        signed_at: "2026-10-20",
        approved_for_send_at: null,
        created_at: null,
      },
    });
    expect(k.contratacao.contrato_base.documento_disponivel).toBe(false);
    expect(k.contratacao.contrato_base.secure_url).toBe("");
    expect(k.contratacao.ordem_servico.documento_disponivel).toBe(false);
  });

  it("usa os dados do caso recebido, não um caso fixo", () => {
    const k = kitContratualDoCaso({
      ...vazio,
      caso: { ...caso, codigo: "OUTRO-9", clienteNome: "Outra Família" },
    });
    expect(k.codigo).toBe("OUTRO-9");
    expect(k.clienteNome).toBe("Outra Família");
    expect(k.contratacao.ordem_servico.case_id).toBe("OUTRO-9");
  });
});

describe("kitContratualDoCaso — contrato e ordem de serviço", () => {
  it("contrato assinado vira 'aceito' com a data real e a versão vem do número e da versão salva", () => {
    const k = kitContratualDoCaso({
      ...vazio,
      contrato: {
        id: "k",
        contract_number: "CT-7",
        status: "signed",
        signed_at: "2026-10-20T10:00:00Z",
        approved_for_send_at: null,
        created_at: null,
      },
      versao: { version_number: 3, created_at: null },
    });
    expect(k.contratacao.contrato_base).toMatchObject({
      status: "aceito",
      data_aceite: "2026-10-20T10:00:00Z",
      versao: "CT-7 · v3",
    });
  });

  it("mapeia os status reais, sem pular etapa", () => {
    expect(statusContratoBase("under_human_review")).toBe("nao_enviado");
    expect(statusContratoBase("approved_for_send")).toBe("aguardando_aceite");
    expect(statusContratoBase("cancelled")).toBe("arquivado");
    expect(statusOrdemServico("draft")).toBe("rascunho");
    expect(statusOrdemServico("pending_approval")).toBe("aguardando_aceite");
    expect(statusOrdemServico("active")).toBe("aceita");
    expect(statusOrdemServico("archived")).toBe("arquivada");
    expect(statusOrdemServico(undefined)).toBe("nao_criada");
  });

  it("ordem de serviço real preenche número, versão e escopo; o que não existe fica vazio", () => {
    const k = kitContratualDoCaso({
      ...vazio,
      ordemServico: {
        service_order_number: "OS-2026-004",
        status: "draft",
        versao: 2,
        scope_summary: "Escopo X",
        deliverable_summary: null,
        start_date: null,
        case_id: "c1",
      },
    });
    expect(k.contratacao.ordem_servico).toMatchObject({
      status: "rascunho",
      produto_sku: "OS-2026-004 · v2",
      escopo_resumo: "Escopo X",
      entregaveis: [],
      valor_contratado: "",
    });
  });
});

describe("kitContratualDoCaso — despesas", () => {
  it("política só existe quando o pagador é unânime", () => {
    expect(politicaDeDespesas([])).toBe("nao_definida");
    expect(politicaDeDespesas([despesa(), despesa()])).toBe("pagamento_direto_pela_cliente");
    expect(politicaDeDespesas([despesa({ pagador: "clube_antecipa" })])).toBe(
      "antecipacao_total_pelo_clube",
    );
    expect(politicaDeDespesas([despesa(), despesa({ pagador: "clube_antecipa" })])).toBe(
      "nao_definida",
    );
    expect(politicaDeDespesas([despesa({ pagador: "terceiro_autorizado" })])).toBe("nao_definida");
  });

  it("itens reais viram faixa de estimativa e valor pago; sem despesas é 'não aplicável', não 'estimativa'", () => {
    expect(kitContratualDoCaso(vazio).contratacao.despesas_externas.status).toBe("nao_aplicavel");
    const k = kitContratualDoCaso({
      ...vazio,
      despesas: [despesa({ estado: "aprovada", valor_pago: 150 })],
    });
    const d = k.contratacao.despesas_externas;
    expect(d.status).toBe("aprovada_pela_cliente");
    expect(d.itens[0].estimativa).toMatch(/100,00.*200,00/);
    expect(d.itens[0].valor_real).toMatch(/150,00/);
  });
});

describe("kitContratualDoCaso — anexos III, IV e V", () => {
  it("status do anexo salvo vira o vocabulário de procuração, sem saltar de etapa", () => {
    expect(statusProcuracaoDoAnexo("missing")).toBe("nao_iniciada");
    expect(statusProcuracaoDoAnexo("drafting")).toBe("rascunho_em_preparacao");
    expect(statusProcuracaoDoAnexo("ready_for_review")).toBe("aguardando_revisao_interna");
    expect(statusProcuracaoDoAnexo("approved")).toBe("aguardando_assinatura_cliente");
    expect(statusProcuracaoDoAnexo("signed_with_contract")).toBe("assinada");
    expect(statusProcuracaoDoAnexo(null)).toBe("nao_iniciada");
  });

  it("Anexo IV com jurisdição Brasil alimenta só a procuração brasileira", () => {
    const k = kitContratualDoCaso({
      ...vazio,
      anexos: [
        anexo("ANEXO_IV_PROCURACAO", "drafting", [
          { rotulo: "Jurisdição da procuração", valor: "Brasil" },
          { rotulo: "Finalidade", valor: "Certidões" },
        ]),
      ],
    });
    expect(k.contratacao.autorizacoes.procuracao_brasileira).toMatchObject({
      status: "rascunho_em_preparacao",
      finalidade: "Certidões",
    });
    expect(k.contratacao.autorizacoes.procuracao_europeia.status).toBe("nao_iniciada");
  });

  it("Anexo IV com jurisdição europeia alimenta só a europeia", () => {
    const k = kitContratualDoCaso({
      ...vazio,
      anexos: [
        anexo("ANEXO_IV_PROCURACAO", "ready_for_review", [
          { rotulo: "Jurisdição da procuração", valor: "Europa · Áustria" },
        ]),
      ],
    });
    expect(k.contratacao.autorizacoes.procuracao_europeia.status).toBe(
      "aguardando_revisao_interna",
    );
    expect(k.contratacao.autorizacoes.procuracao_brasileira.status).toBe("nao_iniciada");
  });

  it("Anexo IV sem jurisdição não é atribuído a ninguém e o kit avisa", () => {
    const k = kitContratualDoCaso({ ...vazio, anexos: [anexo("ANEXO_IV_PROCURACAO", "drafting")] });
    expect(k.contratacao.autorizacoes.procuracao_brasileira.status).toBe("nao_iniciada");
    expect(k.contratacao.autorizacoes.procuracao_europeia.status).toBe("nao_iniciada");
    expect(k.avisos[0]).toMatch(/sem jurisdição registrada/);
  });

  it("anexo não aplicável ou arquivado não conta como existente; Anexos III e V só aparecem quando há instância viva", () => {
    const sem = kitContratualDoCaso({
      ...vazio,
      anexos: [
        anexo("ANEXO_III_AUTORIZACAO_PESQUISA", "not_applicable"),
        anexo("ANEXO_V_ALTERACAO_ESCOPO", "archived"),
      ],
    });
    expect(sem.contratacao.autorizacoes.pesquisa_especifica).toEqual([]);
    expect(sem.contratacao.alteracoes_escopo).toEqual([]);
    const com = kitContratualDoCaso({
      ...vazio,
      anexos: [
        anexo("ANEXO_III_AUTORIZACAO_PESQUISA", "drafting"),
        anexo("ANEXO_V_ALTERACAO_ESCOPO", "ready_for_review"),
      ],
    });
    expect(com.contratacao.autorizacoes.pesquisa_especifica).toHaveLength(1);
    expect(com.contratacao.alteracoes_escopo).toHaveLength(1);
  });
});

describe("kitContratualDoCaso — histórico", () => {
  it("eventos reais viram etapas concluídas, internas, com a data do banco", () => {
    const k = kitContratualDoCaso({
      ...vazio,
      eventos: [
        {
          id: "e1",
          event_type: "send_drafted",
          occurred_at: "2026-10-30T09:00:00Z",
          created_at: null,
        },
        { id: "e2", event_type: "evento_novo", occurred_at: null, created_at: "2026-10-29" },
      ],
    });
    const t = k.contratacao.timeline!;
    expect(t[0]).toMatchObject({
      titulo: "Rascunho de envio criado",
      status: "concluido",
      data: "2026-10-30T09:00:00Z",
      visibilidade: "interna",
    });
    expect(t[1]).toMatchObject({ titulo: "evento novo", data: "2026-10-29" });
  });
});

describe("montagem: o Kit Contratual deixou de ser órfão e não lê mais caso fixo", () => {
  const kit = readFileSync("src/components/kit-contratual.tsx", "utf8");
  const preparar = readFileSync(
    "src/routes/_authenticated/casos.$caseId.contrato.preparar.tsx",
    "utf8",
  );
  const servidor = readFileSync("src/lib/kit-contratual.functions.ts", "utf8");

  it("o componente não importa useActiveCase nem o modelo estático", () => {
    expect(kit).not.toContain("useActiveCase");
    expect(kit).not.toMatch(/from "@\/data\//);
  });

  it("a tela de preparar o contrato monta o kit passando o caso aberto", () => {
    expect(preparar).toContain("<KitContratualDoCaso casoId={casoUuid} />");
  });

  it("a leitura é só leitura, no client da sessão, e erro de leitura não vira vazio", () => {
    expect(servidor).toContain("requireSupabaseAuth");
    expect(servidor).not.toContain("supabaseAdmin");
    expect(servidor).not.toMatch(/\.(insert|update|delete|upsert)\(/);
    expect(servidor).toContain("if (r.error) throw new Error(r.error.message)");
  });
});
