import { describe, expect, it } from "vitest";

import {
  calcularLacunas,
  contarNos,
  montarArvore,
  montarTimeline,
  projecaoClienteBloqueada,
  validarEvento,
  validarLinhagem,
  validarPerfil,
  validarRelacao,
  validarVariante,
  type Evento,
  type Linhagem,
  type Perfil,
  type Relacao,
  type Variante,
} from "@/lib/pessoas-linhagens";

const perfil = (
  id: string,
  personId: string,
  nome: string,
  extra: Partial<Perfil> = {},
): Perfil => ({
  id,
  research_person_id: personId,
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
  archived_at: null,
  ...extra,
});

const relacao = (id: string, de: string, para: string, extra: Partial<Relacao> = {}): Relacao => ({
  id,
  person_from_id: de,
  person_to_id: para,
  relation_type: "pai_mae",
  relation_date: null,
  relation_date_aproximada: null,
  locality: null,
  status_pesquisa: "a_confirmar",
  evidence_id: null,
  source_id: null,
  internal_notes: null,
  archived_at: null,
  ...extra,
});

const evento = (id: string, personId: string, extra: Partial<Evento> = {}): Evento => ({
  id,
  person_id: personId,
  event_type: "nascimento",
  start_date: null,
  end_date: null,
  approximate_date: null,
  locality: null,
  description_internal: null,
  validation_status: "pendente",
  evidence_id: null,
  source_id: null,
  archived_at: null,
  ...extra,
});

const linhagem = (id: string, nome: string, extra: Partial<Linhagem> = {}): Linhagem => ({
  id,
  case_id: "caso-1",
  family_id: null,
  nome_da_linha: nome,
  pessoa_ancora_id: null,
  tipo_da_linha: "a_confirmar",
  citizenship_track_id: null,
  objetivo: null,
  geracao_alvo: null,
  status: "em_estruturacao",
  evidencias_chave: [],
  risco_principal: null,
  proximo_marco: null,
  responsavel: null,
  archived_at: null,
  ...extra,
});

describe("G-02 — pessoas, relações e linhagens", () => {
  /* Teste 1 — pessoa e relação persistem em estrutura, sem campos rígidos */
  it("1. estrutura de pessoa e relação não usa campos rígidos Filho 1 / Irmão 2", () => {
    const p = perfil("perfil-1", "p1", "Pessoa A");
    expect(Object.keys(p).some((k) => /filho_?\d|irmao_?\d/i.test(k))).toBe(false);
    const r = relacao("rel-1", "p1", "p2");
    expect(r.person_from_id).toBe("p1");
    expect(r.person_to_id).toBe("p2");
  });

  /* Teste 2 — árvore muda ao criar relação válida */
  it("2. a árvore muda ao criar relação válida entre pessoas existentes", () => {
    const perfis = [perfil("a", "p1", "Ancestral"), perfil("b", "p2", "Descendente")];
    const antes = montarArvore(perfis, []);
    expect(antes).toHaveLength(2);
    expect(contarNos(antes)).toBe(2);

    const depois = montarArvore(perfis, [relacao("r1", "p1", "p2", { relation_type: "pai_mae" })]);
    expect(depois).toHaveLength(1);
    expect(depois[0]!.personId).toBe("p1");
    expect(depois[0]!.filhos[0]!.personId).toBe("p2");
    expect(depois[0]!.filhos[0]!.geracao).toBe(1);
    expect(contarNos(depois)).toBe(2);
  });

  it("2b. árvore não inventa vínculo: relação inexistente não vira aresta", () => {
    const perfis = [perfil("a", "p1", "A"), perfil("b", "p2", "B")];
    const arvore = montarArvore(perfis, [relacao("r1", "p1", "p9")]); // p9 não é perfil do caso
    expect(arvore).toHaveLength(2);
    expect(arvore.every((n) => n.filhos.length === 0)).toBe(true);
  });

  /* Teste 3 — variante de nome não duplica pessoa */
  it("3. variante de nome exige pessoa existente e não duplica", () => {
    const existentes: Variante[] = [
      {
        id: "v1",
        person_id: "p1",
        variante: "Giovanni",
        tipo: "italianizacao",
        periodo: null,
        localidade: null,
        estado_validacao: "a_confirmar",
        nivel_confianca: "baixo",
        evidence_id: null,
        source_id: null,
        observacao_interna: null,
        archived_at: null,
      },
    ];
    expect(
      validarVariante({ person_id: "", variante: "João", tipo: "grafia" }, existentes),
    ).toContain("Variante precisa estar vinculada a uma pessoa já cadastrada.");
    expect(
      validarVariante({ person_id: "p1", variante: " giovanni ", tipo: "grafia" }, existentes),
    ).toContain("Esta variante já está registrada para a pessoa — variante não cria pessoa nova.");
    expect(
      validarVariante({ person_id: "p1", variante: "Joam", tipo: "grafia" }, existentes),
    ).toEqual([]);
    // a variante não gera nova pessoa na árvore
    const arvore = montarArvore([perfil("a", "p1", "João")], []);
    expect(contarNos(arvore)).toBe(1);
  });

  /* Teste 4 — relação sem evidência permanece a confirmar */
  it("4. relação sem evidência ou fonte não pode ser confirmada", () => {
    expect(
      validarRelacao({
        person_from_id: "p1",
        person_to_id: "p2",
        relation_type: "pai_mae",
        status_pesquisa: "confirmado",
      }),
    ).toContain("Relação só sai de “a confirmar” com evidência ou fonte vinculada.");
    expect(
      validarRelacao({
        person_from_id: "p1",
        person_to_id: "p2",
        relation_type: "pai_mae",
        status_pesquisa: "confirmado",
        evidence_id: "ev-1",
      }),
    ).toEqual([]);
    const arvore = montarArvore(
      [perfil("a", "p1", "A"), perfil("b", "p2", "B")],
      [relacao("r", "p1", "p2")],
    );
    expect(arvore[0]!.filhos[0]!.relacaoComPai?.status).toBe("a_confirmar");
  });

  it("4b. pessoa não pode ter relação consigo mesma", () => {
    expect(
      validarRelacao({ person_from_id: "p1", person_to_id: "p1", relation_type: "irmao" }),
    ).toContain("Uma pessoa não pode ter relação consigo mesma.");
  });

  /* Teste 5 — linha dupla: duas linhas no mesmo caso */
  it("5. o mesmo caso aceita duas linhagens distintas (linha dupla)", () => {
    const existentes = [linhagem("l1", "Linha paterna", { tipo_da_linha: "paterna" })];
    expect(
      validarLinhagem({ case_id: "caso-1", nome_da_linha: "Linha materna" }, existentes),
    ).toEqual([]);
    expect(
      validarLinhagem({ case_id: "caso-1", nome_da_linha: "linha paterna" }, existentes),
    ).toContain("Já existe uma linha com este nome neste caso.");
  });

  /* Teste 6 — App Cliente não lê perfis nem relações internas */
  it("6. projeção ao App Cliente é bloqueada por padrão", () => {
    const projecao = projecaoClienteBloqueada();
    expect(projecao.publicavel).toBe(false);
    expect(projecao.motivo).toMatch(/devolutiva aprovada/i);
  });

  /* Perfil e evento — evidência obrigatória para confirmação */
  it("7. perfil confirmado exige evidência de suporte", () => {
    expect(validarPerfil({ nome_completo: "Ana", status_verificacao: "confirmado" })).toContain(
      "Perfil confirmado exige evidência de suporte vinculada.",
    );
    expect(
      validarPerfil({ nome_completo: "Ana", status_verificacao: "confirmado", evidence_id: "ev" }),
    ).toEqual([]);
    expect(validarPerfil({ nome_completo: "" })).toContain("Nome completo é obrigatório.");
  });

  it("8. evento confirmado exige evidência ou fonte e datas coerentes", () => {
    expect(
      validarEvento({ person_id: "p1", event_type: "morte", validation_status: "confirmado" }),
    ).toContain("Evento confirmado exige evidência ou fonte vinculada.");
    expect(
      validarEvento({
        person_id: "p1",
        event_type: "residencia",
        start_date: "1900-01-02",
        end_date: "1899-01-01",
      }),
    ).toContain("Data final não pode ser anterior à data inicial.");
  });

  /* Timeline derivada de registros */
  it("9. linha do tempo deriva de eventos persistidos e ordena datas ausentes ao final", () => {
    const perfis = [perfil("a", "p1", "Ana")];
    const itens = montarTimeline(perfis, [
      evento("e2", "p1", { event_type: "morte", start_date: "1950-05-05" }),
      evento("e1", "p1", { event_type: "nascimento", start_date: "1900-01-01", evidence_id: "ev" }),
      evento("e3", "p1", { event_type: "migracao", approximate_date: "década de 1920" }),
    ]);
    expect(itens.map((i) => i.id)).toEqual(["e1", "e2", "e3"]);
    expect(itens[0]!.pessoa).toBe("Ana");
    expect(itens[0]!.comEvidencia).toBe(true);
    expect(itens[2]!.dataExibicao).toBe("década de 1920 (aprox.)");
  });

  /* Lacunas — nada é inferido */
  it("10. lacunas apontam o que falta sem preencher dado ausente", () => {
    const perfis = [perfil("a", "p1", "Ana")];
    const lacunas = calcularLacunas(
      perfis,
      [relacao("r", "p1", "p2")],
      [evento("e", "p1")],
      [linhagem("l", "Linha")],
    );
    expect(lacunas.some((l) => l.descricao.includes("Data de nascimento ausente"))).toBe(true);
    expect(lacunas.some((l) => l.descricao.includes("sem pessoa âncora"))).toBe(true);
    expect(perfis[0]!.nascimento_data).toBeNull();
  });
});
