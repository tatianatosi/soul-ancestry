import { describe, expect, it } from "vitest";
import { camadaDoRegistro, elegibilidadeAtivacao, type PessoaLista } from "@/lib/clientes-lista";

const base: PessoaLista = {
  id: "1",
  nome: "Teste",
  nome_social: null,
  email: null,
  telefone: null,
  origem: "site",
  status_comercial: "contratado",
  pais_interesse: "Itália",
  status: "ativo",
  classificacao: "pre_cliente",
  is_demo: false,
  archived_at: null,
  archive_motivo: null,
  ativacao_decidida_em: null,
  ativacao_justificativa: null,
  contratoAssinado: true,
  pagamentoConfirmado: true,
  participacoes: [],
  casosVinculados: 1,
};

describe("camadas de registro de clientes", () => {
  it("diferencia pessoa, perfil de cliente, participante de caso e núcleo", () => {
    expect(camadaDoRegistro({ ...base, casosVinculados: 0 })).toBe("pessoa");
    expect(camadaDoRegistro({ ...base, classificacao: "cliente_ativo" })).toBe("client_profile");
    expect(camadaDoRegistro(base)).toBe("case_member");
    expect(camadaDoRegistro({ ...base, classificacao: "participante_familiar" })).toBe(
      "family_nucleus",
    );
    expect(camadaDoRegistro({ ...base, participacoes: [{ nucleo: "n", papel: "filho" }] })).toBe(
      "family_nucleus",
    );
  });

  it("bloqueia promoção em formalização e nos estágios de pré-cliente", () => {
    for (const s of [
      "lead",
      "oportunidade",
      "proposta_enviada",
      "aceite_verbal",
      "proposta_aprovada",
      "em_formalizacao",
    ]) {
      const r = elegibilidadeAtivacao({ ...base, status_comercial: s });
      expect(r.apto).toBe(false);
    }
  });

  it("bloqueia membro de núcleo e cadastro sem caso", () => {
    expect(elegibilidadeAtivacao({ ...base, classificacao: "participante_familiar" }).apto).toBe(
      false,
    );
    expect(elegibilidadeAtivacao({ ...base, casosVinculados: 0 }).apto).toBe(false);
  });

  it("permite ativar participante de caso contratado com contrato e pagamento", () => {
    expect(elegibilidadeAtivacao(base).apto).toBe(true);
  });
});
