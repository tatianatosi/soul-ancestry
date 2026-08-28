import { describe, expect, it } from "vitest";

import {
  MODULOS_HISTORICOS,
  ehModuloHistorico,
  lacunasDosModulos,
  legendaEstado,
  projecaoSemConteudoInterno,
  projetarParaCliente,
  relacaoAtivaNaArvore,
  validarRegistroModulo,
  type RegistroModulo,
} from "@/lib/genealogia-modulos";
import {
  montarArvore,
  montarTimeline,
  type Evento,
  type Perfil,
  type Relacao,
} from "@/lib/pessoas-linhagens";

const perfil = (id: string, nome: string, extra: Partial<Perfil> = {}): Perfil => ({
  id: `perf-${id}`,
  research_person_id: id,
  case_id: "caso-1",
  nome_completo: nome,
  nome_nascimento: null,
  sexo: null,
  nascimento_data: null,
  nascimento_data_aproximada: null,
  nascimento_localidade: null,
  morte_data: null,
  morte_data_aproximada: null,
  morte_localidade: null,
  causa_morte: null,
  sepultamento_localidade: null,
  status_verificacao: "pendente",
  evidence_id: null,
  verified_at: null,
  internal_notes: null,
  ...extra,
});

const relacao = (from: string, to: string, extra: Partial<Relacao> = {}): Relacao => ({
  id: `rel-${from}-${to}`,
  person_from_id: from,
  person_to_id: to,
  relation_type: "pai_mae",
  relation_date: null,
  relation_date_aproximada: null,
  locality: null,
  status_pesquisa: "confirmado",
  evidence_id: null,
  source_id: null,
  internal_notes: null,
  ...extra,
});

const evento = (id: string, person: string, extra: Partial<Evento> = {}): Evento => ({
  id,
  person_id: person,
  event_type: "nascimento",
  start_date: "1900-01-01",
  end_date: null,
  approximate_date: null,
  locality: "Vêneto",
  description_internal: null,
  validation_status: "confirmado",
  evidence_id: "ev-1",
  source_id: null,
  ...extra,
});

const registro = (extra: Partial<RegistroModulo> = {}): RegistroModulo => ({
  id: "m1",
  case_id: "caso-1",
  person_id: "p1",
  titulo: "Residência em Treviso",
  subtipo: "residência",
  periodo_inicio: null,
  periodo_fim: null,
  data_precisao: "desconhecida",
  localidade: null,
  descricao_interna: null,
  evidence_id: null,
  source_id: null,
  status_verificacao: "pendente",
  client_visibility: "interna",
  ...extra,
});

describe("Ficha piloto genealógica", () => {
  it("1. mantém os 13 módulos históricos declarados e reconhecíveis", () => {
    expect(MODULOS_HISTORICOS).toHaveLength(13);
    expect(new Set(MODULOS_HISTORICOS.map((m) => m.tabela)).size).toBe(13);
    expect(ehModuloHistorico("military_records")).toBe(true);
    expect(ehModuloHistorico("crm_casos")).toBe(false);
  });

  it("2. bloqueia registro confirmado sem evidência ou fonte", () => {
    expect(validarRegistroModulo(registro({ status_verificacao: "confirmado" }))).toContain(
      "Registro confirmado exige evidência ou fonte vinculada.",
    );
    expect(
      validarRegistroModulo(registro({ status_verificacao: "confirmado", source_id: "f1" })),
    ).toHaveLength(0);
  });

  it("3. recusa período final anterior ao inicial e título vazio", () => {
    const erros = validarRegistroModulo(
      registro({ titulo: " ", periodo_inicio: "1920-01-01", periodo_fim: "1910-01-01" }),
    );
    expect(erros).toContain("Título do registro é obrigatório.");
    expect(erros).toContain("Período final não pode ser anterior ao inicial.");
  });

  it("4. só aprova para o cliente registro confirmado", () => {
    expect(validarRegistroModulo(registro({ client_visibility: "aprovada" }))).toContain(
      "Só registro confirmado pode ser aprovado para o App Cliente.",
    );
  });

  it("5. exibe legenda de estado sem juízo de mérito na árvore interna", () => {
    expect(legendaEstado("hipotese")).toBe("Hipótese de pesquisa");
    expect(legendaEstado("provavel")).toBe("Provável — suporte parcial");
    expect(legendaEstado("qualquer")).toBe("Pendente de verificação");
    expect(relacaoAtivaNaArvore("refutado")).toBe(false);
    expect(relacaoAtivaNaArvore("hipotese")).toBe(true);
  });

  it("6. deriva árvore e timeline internas apenas de registros persistidos", () => {
    const perfis = [perfil("p1", "Ana"), perfil("p2", "Giovanni")];
    const arvore = montarArvore(perfis, [relacao("p2", "p1")]);
    expect(arvore).toHaveLength(1);
    expect(arvore[0]!.nome).toBe("Giovanni");
    expect(arvore[0]!.filhos[0]!.nome).toBe("Ana");
    expect(montarTimeline(perfis, [evento("e1", "p1")])).toHaveLength(1);
  });

  it("7. projeta ao cliente somente o que está aprovado", () => {
    const perfis = [
      perfil("p1", "Ana", { client_visibility: "aprovada" } as Partial<Perfil>),
      perfil("p2", "Giovanni", { client_visibility: "aprovada" } as Partial<Perfil>),
      perfil("p3", "Hipótese interna"),
    ];
    const relacoes = [
      relacao("p2", "p1", { client_visibility: "aprovada" } as Partial<Relacao>),
      relacao("p2", "p3"),
    ];
    const eventos = [
      evento("e1", "p1", { client_visibility: "aprovada" } as Partial<Evento>),
      evento("e2", "p3", { description_internal: "nota interna sensível" }),
    ];
    const projecao = projetarParaCliente(perfis, relacoes, eventos, montarArvore(perfis, relacoes));
    const nomes = JSON.stringify(projecao.arvore);
    expect(nomes).toContain("Giovanni");
    expect(nomes).toContain("Ana");
    expect(nomes).not.toContain("Hipótese interna");
    expect(projecao.timeline).toHaveLength(1);
    expect(projecaoSemConteudoInterno(projecao, perfis, eventos)).toBe(true);
  });

  it("8. bloqueia projeção quando nada foi aprovado", () => {
    const perfis = [perfil("p1", "Ana")];
    const projecao = projetarParaCliente(perfis, [], [], montarArvore(perfis, []));
    expect(projecao.publicavel).toBe(false);
    expect(projecao.motivo).toContain("devolutiva aprovada");
  });

  it("9. aponta lacunas dos módulos sem sugerir pesquisa externa automática", () => {
    const lacunas = lacunasDosModulos(
      [{ tabela: "residences_migrations", registro: registro() }],
      new Map([["p1", "Ana"]]),
    );
    expect(lacunas).toHaveLength(2);
    expect(lacunas[0]!.pessoa).toBe("Ana");
    expect(JSON.stringify(lacunas)).not.toMatch(/solicitar|certidão|contatar/i);
  });
});
