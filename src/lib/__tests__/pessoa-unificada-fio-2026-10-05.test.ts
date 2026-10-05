import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import {
  ELOS_DO_FIO,
  ETAPAS_FIO,
  ROTULO_ETAPA,
  STATUS_SEM_PESSOA_CANONICA,
  eloPor,
  eloSeAplica,
  elosMecanicos,
  filaDeResolucao,
  resumoDoFio,
  saudeDoFio,
  type PessoaDoFio,
} from "@/lib/pessoa-unificada-fio";

/**
 * Diretriz da Proprietária (05/10/2026): "Pesquisa é o centro de inteligência
 * operacional do Clube Ancestral. Pessoa Unificada é o fio permanente que
 * atravessa: Lead → Contact/Call → Cliente → Caso → Núcleo → Ficha Piloto →
 * Ficha Genealógica → Pessoas/Relações → Fontes/Evidências →
 * Hipóteses/Lacunas/Achados → Contrato → Portal/App Cliente", e: "verá que
 * nada foi executado corretamente por isso temos várias lacunas".
 *
 * Ela tinha razão, e a medição do caso-piloto em 05/10 diz onde:
 *
 * | coluna que carrega a identidade | medido antes |
 * |---|---|
 * | `research_people.family_member_id` | 0 de 10 — e NENHUMA linha de código em `src/lib` escreve essa coluna |
 * | `research_people.genealogical_person_profile_id` | 0 de 10 — lida e nunca escrita |
 * | `genealogical_person_profiles.client_id` | 0 de 10 |
 * | `research_evidence_items.person_id` | 0 de 1 |
 * | `genealogical_findings.primary_research_person_id` | 0 de 2 |
 *
 * A consequência medida, que é o que importa: a Fase D (27/09) corrigiu certo a
 * Pessoa 360 — parou de casar `canonical_name` com o nome da pessoa canônica,
 * porque fusão por nome é proibida, e passou a usar o vínculo auditado
 * `genealogical_person_profiles.client_id`. Só que ninguém nunca preencheu esse
 * vínculo. Resultado: a Pessoa 360 da requerente encontrava **zero** pessoas de
 * pesquisa, e os achados, as evidências e o registro genealógico dela não
 * apareciam na ficha dela.
 *
 * Este teste trava as regras do fio. O conteúdo é dado do caso, no banco, com
 * auditoria — não vive no código.
 */

const FIO = readFileSync("src/lib/pessoa-unificada-fio.ts", "utf8");
const FN = readFileSync("src/lib/pessoa-unificada-fio.functions.ts", "utf8");
const PAINEL = readFileSync("src/components/pesquisa/fio-pessoa-unificada.tsx", "utf8");
const HUB = readFileSync("src/routes/_authenticated/pesquisa-evidencias.$caseId.tsx", "utf8");

describe("o fio tem as doze etapas que a Proprietária escreveu, na ordem", () => {
  it("as doze, nessa sequência", () => {
    expect([...ETAPAS_FIO]).toEqual([
      "lead",
      "contato_call",
      "cliente",
      "caso",
      "nucleo",
      "ficha_piloto",
      "ficha_genealogica",
      "pessoas_relacoes",
      "fontes_evidencias",
      "hipoteses_lacunas_achados",
      "contrato",
      "portal_app",
    ]);
  });

  it("cada etapa tem rótulo em PT-BR", () => {
    for (const e of ETAPAS_FIO) expect(ROTULO_ETAPA[e]?.length, e).toBeGreaterThan(3);
  });

  it("cada elo nomeia a coluna real que carrega a identidade, e onde se resolve", () => {
    for (const elo of ELOS_DO_FIO) {
      // tabela.coluna, nunca um nome vago de conceito
      expect(elo.coluna, elo.chave).toMatch(/^[a-z_]+\.[a-z_]+$/);
      expect(ETAPAS_FIO).toContain(elo.de);
      expect(ETAPAS_FIO).toContain(elo.para);
      expect(elo.ondeResolver.length, elo.chave).toBeGreaterThan(20);
      // "verificar" não é rota: tem de dizer a tela
      expect(elo.ondeResolver.toLowerCase(), elo.chave).not.toBe("verificar");
    }
  });

  it("as etapas extremas do fio estão cobertas: Lead entra e App Cliente sai", () => {
    const etapas = new Set(ELOS_DO_FIO.flatMap((e) => [e.de, e.para]));
    expect(etapas.has("lead")).toBe(true);
    expect(etapas.has("portal_app")).toBe(true);
    expect(etapas.has("contrato")).toBe(true);
  });
});

describe("mecânico × decisão de identidade — a distinção central", () => {
  it("só o elo mecânico é religável, e ele declara de qual vínculo copia", () => {
    const mec = elosMecanicos();
    expect(mec.length).toBeGreaterThan(0);
    for (const e of mec) {
      expect(e.inversoDe, e.chave).toBeTruthy();
      // Cada lado da origem é uma tabela.coluna real; a composição usa "∘".
      for (const lado of e.inversoDe!.split("∘").map((x) => x.trim())) {
        expect(lado, `${e.chave} ← ${lado}`).toMatch(/^[a-z_]+\.[a-z_]+$/);
      }
    }
  });

  it("o elo mecânico é o inverso exato de um vínculo que já existe", () => {
    const e = eloPor("pesquisa_para_perfil")!;
    expect(e.natureza).toBe("mecanico");
    expect(e.coluna).toBe("research_people.genealogical_person_profile_id");
    expect(e.inversoDe).toBe("genealogical_person_profiles.research_person_id");
  });

  it("ligar pessoa de pesquisa a pessoa canônica NUNCA é mecânico", () => {
    /*
      Este é o elo que a Fase D teve de consertar: casar `canonical_name` com o
      nome da pessoa canônica. Dizer QUEM é quem continua sendo decisão humana.
    */
    for (const chave of ["perfil_para_cliente", "caso_para_membro"]) {
      expect(eloPor(chave)!.natureza, chave).toBe("decisao_de_identidade");
    }
  });

  it("o membro da pessoa de pesquisa é COMPOSIÇÃO de duas decisões, não palpite", () => {
    /*
      Corrigido em 05/10 depois de medir: eu tinha classificado
      `pesquisa_para_membro` como decisão de identidade. Não é — dado que o
      perfil diz qual é a pessoa canônica (decisão humana) e que case_members
      diz qual é o membro dela no caso (outra decisão humana), o membro é
      derivável. A composição declara de onde vem, e os dois lados são colunas
      reais.
    */
    const e = eloPor("pesquisa_para_membro")!;
    expect(e.natureza).toBe("mecanico");
    expect(e.inversoDe).toContain("genealogical_person_profiles.client_id");
    expect(e.inversoDe).toContain("case_members.cliente_id");
  });

  it("composição ambígua não grava: zero ou mais de um membro fica declarado", () => {
    expect(FN).toContain("candidatos.length === 1");
    expect(FN).toContain("ambiguosNaoGravados");
    expect(FN).toContain("ambiguidade é declarada, não resolvida");
  });

  it("nem o módulo nem o escritor casam pessoa por nome, endereço, profissão ou filiação", () => {
    for (const [nome, texto] of [
      ["módulo", FIO],
      ["escritor", FN],
      ["painel", PAINEL],
    ] as const) {
      expect(texto, nome).not.toContain("canonical_name ===");
      expect(texto, nome).not.toContain("nomeNormalizado");
      expect(texto, nome).not.toMatch(/ilike.*canonical_name/i);
    }
    // E o escritor grava só as duas colunas do fio, nenhuma outra.
    expect(FN).toContain('payload["genealogical_person_profile_id"]');
    expect(FN).toContain('payload["family_member_id"]');
    expect(FN).not.toContain('payload["client_id"]');
    expect(FN).not.toContain('payload["cliente_id"]');
  });
});

describe("pessoa histórica não conta como fio rompido", () => {
  it("ascendente não tem pessoa canônica, membro nem parte — e isso está declarado", () => {
    expect(STATUS_SEM_PESSOA_CANONICA).toContain("ancestor");
    expect(eloSeAplica(eloPor("perfil_para_cliente")!, "ancestor")).toBe(false);
    expect(eloSeAplica(eloPor("cliente_para_contrato")!, "ancestor")).toBe(false);
    expect(eloSeAplica(eloPor("caso_para_membro")!, "ancestor")).toBe(false);
  });

  it("mas os elos internos da pesquisa e o do App valem para ela", () => {
    for (const chave of ["pesquisa_para_perfil", "evidencia_para_pessoa", "achado_para_pessoa", "pessoa_para_app"]) {
      expect(eloSeAplica(eloPor(chave)!, "ancestor"), chave).toBe(true);
    }
  });

  it("requerente e familiar têm todos os elos aplicáveis", () => {
    for (const status of ["subject", "family_member", "descendant"]) {
      for (const elo of ELOS_DO_FIO) expect(eloSeAplica(elo, status), `${status}/${elo.chave}`).toBe(true);
    }
  });
});

describe("a conta do fio é honesta: não diz completo com elo aberto", () => {
  const pessoa = (id: string, status: string, segurando: string[]): PessoaDoFio => ({
    id,
    nome: id,
    personStatus: status,
    elos: ELOS_DO_FIO.map((e) => ({
      chave: e.chave,
      estado: !eloSeAplica(e, status) ? ("nao_se_aplica" as const) : segurando.includes(e.chave) ? ("segura" as const) : ("aberto" as const),
    })),
  });

  it("todos os elos aplicáveis segurando = o fio atravessa", () => {
    const todos = ELOS_DO_FIO.map((e) => e.chave);
    const s = saudeDoFio([pessoa("Requerente", "subject", todos)]);
    expect(s.atravessa).toBe(true);
    expect(resumoDoFio(s)).toContain("O fio atravessa");
  });

  it("um elo aberto já derruba, e o resumo diz NÃO atravessa", () => {
    const quase = ELOS_DO_FIO.map((e) => e.chave).filter((c) => c !== "perfil_para_cliente");
    const s = saudeDoFio([pessoa("Requerente", "subject", quase)]);
    expect(s.atravessa).toBe(false);
    expect(s.abertosDeIdentidade).toBe(1);
    expect(resumoDoFio(s)).toContain("NÃO atravessa");
  });

  it("separa o que é religável do que depende de decisão", () => {
    const s = saudeDoFio([pessoa("Ascendente", "ancestor", [])]);
    expect(s.abertosMecanicos).toBe(1); // pesquisa_para_perfil (o do membro não se aplica a histórica)
    expect(s.abertosDeIdentidade).toBe(3); // evidência, achado, App
    expect(resumoDoFio(s)).toContain("religável sem decisão");
    expect(resumoDoFio(s)).toContain("decisão de identidade");
  });

  it("sem pessoa nenhuma não finge: diz que o fio não tem por onde passar", () => {
    const s = saudeDoFio([]);
    expect(s.atravessa).toBe(false);
    expect(resumoDoFio(s)).toContain("não tem por onde passar");
  });

  it("a fila agrupa por rota e põe o mecânico primeiro", () => {
    const fila = filaDeResolucao([pessoa("A", "ancestor", []), pessoa("B", "ancestor", [])]);
    expect(fila[0]!.natureza).toBe("mecanico");
    expect(fila[0]!.pessoas).toEqual(["A", "B"]);
    for (const f of fila) expect(f.coluna).toMatch(/^[a-z_]+\.[a-z_]+$/);
  });
});

describe("Pesquisa é onde o fio se verifica — o painel está montado no hub", () => {
  it("o hub monta o painel com o research_case_id que já carrega", () => {
    expect(HUB).toContain("<FioPessoaUnificada");
    expect(HUB).toContain("researchCaseId={String(c.pesquisa.id)}");
  });

  it("o painel chama o leitor e o escritor, e nenhum outro", () => {
    expect(PAINEL).toContain("useServerFn(medirFioDaPessoaUnificada)");
    expect(PAINEL).toContain("useServerFn(religarElosMecanicosDoFio)");
  });

  it("mostra as doze etapas e o resumo honesto, não um selo verde", () => {
    expect(PAINEL).toContain("data-fio-resumo");
    expect(PAINEL).toContain("ETAPAS_FIO.map");
    expect(PAINEL).toContain("data-fio-fila");
    expect(PAINEL).toContain("data-fio-por-pessoa");
  });

  it("religar exige motivo e passa por confirmação com capacidade", () => {
    expect(PAINEL).toContain("<AcaoOperacional");
    expect(PAINEL).toContain('capacidade="avancar_pesquisa_evidencia_microentrega"');
    expect(FN).toContain("Informe o motivo do religamento");
  });

  it("aponta a tela onde a equipe decide identidade, em vez de decidir sozinho", () => {
    expect(PAINEL).toContain("/pessoas-linhagens/$caseId");
    expect(PAINEL).toContain("Onde a equipe decide identidade");
  });

  it("nada aqui envia, assina, cobra, publica nem eleva estado de evidência", () => {
    expect(PAINEL).toContain("não eleva estado de evidência");
    for (const proibido of ["mudarEstadoEvidencia", "publicarNoApp", "enviarParaAssinatura", "emitirCobranca"]) {
      expect(PAINEL, proibido).not.toContain(proibido);
    }
  });
});

describe("o escritor é conservador e auditado", () => {
  it("grava por gravarComVerificacao e nunca sobrescreve ponteiro existente", () => {
    expect(FN).toContain("gravarComVerificacao");
    expect(FN).toContain('if (perfil && !pessoa["genealogical_person_profile_id"])');
    expect(FN).toContain('if (clienteDoPerfil && !pessoa["family_member_id"])');
    // Sem nada a fazer, não grava: releitura sem escrita é melhor que escrita vazia.
    expect(FN).toContain("if (Object.keys(payload).length === 0) continue;");
  });

  it("audita nomeando a regra e o que NÃO foi tocado", () => {
    expect(FN).toContain("elos_mecanicos_do_fio_religados");
    expect(FN).toContain("Nenhuma identidade foi inferida");
    expect(FN).toContain("nao_tocado");
  });

  it("exige papel que edita pesquisa", () => {
    expect(FN).toContain("exigirEdicao(podeEditar)");
  });

  it("o leitor não inventa elo: toda presença vem de coluna real consultada", () => {
    for (const tabela of [
      "research_people",
      "genealogical_person_profiles",
      "case_members",
      "nucleo_membros",
      "research_evidence_items",
      "research_evidence_links",
      "genealogical_findings",
      "contract_parties",
      "app_projections",
    ]) {
      expect(FN, tabela).toContain(`.from("${tabela}")`);
    }
  });
});

describe("nada do caso da Ana entrou no código", () => {
  it("nenhum nome, id ou localidade da família nos três arquivos", () => {
    for (const [nome, texto] of [
      ["módulo", FIO],
      ["escritor", FN],
      ["painel", PAINEL],
    ] as const) {
      for (const dado of ["Ana Luiza", "Adair", "Alice", "Felipe", "Friedmann", "Reimer", "Cleusa", "a11a0000", "c1a50000"]) {
        expect(texto, `${nome} contém ${dado}`).not.toContain(dado);
      }
    }
  });
});

describe("o fio se mantém sozinho: o vínculo do perfil propaga para a pesquisa", () => {
  const G02 = readFileSync("src/lib/pessoas-linhagens.functions.ts", "utf8");

  it("salvarRegistroG02 propaga o vínculo ao gravá-lo — não espera botão de diagnóstico", () => {
    expect(G02).toContain("propagarFioParaPesquisa");
    expect(G02).toContain("await propagarFioParaPesquisa(perfilId);");
  });

  it("propaga compondo as duas decisões registradas, e só quando é única", () => {
    expect(G02).toContain('.eq("cliente_id", novoCliente)');
    expect(G02).toContain("if (candidatos.length !== 1) {");
    expect(G02).toContain("composição do que alguém já decidiu");
  });

  it("desvincular limpa o ponteiro — não deixa apontando para quem saiu", () => {
    expect(G02).toContain("payload: { family_member_id: null }");
  });

  it("grava por gravarComVerificacao e não toca em mais nada da pesquisa", () => {
    const trecho = G02.slice(
      G02.indexOf("const propagarFioParaPesquisa"),
      G02.indexOf("const registrarVinculo"),
    );
    expect(trecho).toContain("gravarComVerificacao");
    expect(trecho).toContain('tabela: "research_people"');
    // Nenhuma outra tabela da pesquisa é escrita nesta propagação.
    for (const t of ["research_relationships", "research_evidence_items", "genealogical_findings"]) {
      expect(trecho, t).not.toContain(t);
    }
  });

  it("a regra de não fundir por nome continua valendo no escritor do vínculo", () => {
    const trecho = G02.slice(
      G02.indexOf("const propagarFioParaPesquisa"),
      G02.indexOf("const registrarVinculo"),
    );
    expect(trecho).not.toContain("canonical_name");
    expect(trecho).not.toContain("ilike");
  });
});

describe("limite do modelo não é lacuna da operação", () => {
  it("elo em limite estrutural não entra no denominador nem na fila de trabalho", () => {
    const comLimite: PessoaDoFio = {
      id: "x",
      nome: "Ascendente de 7ª geração",
      personStatus: "ancestor",
      elos: ELOS_DO_FIO.map((e) => ({
        chave: e.chave,
        estado: !eloSeAplica(e, "ancestor")
          ? ("nao_se_aplica" as const)
          : e.chave === "pessoa_para_app"
            ? ("limite_estrutural" as const)
            : ("segura" as const),
        motivo: e.chave === "pessoa_para_app" ? "A árvore do App comporta 1 a 5 gerações." : undefined,
      })),
    };
    const s = saudeDoFio([comLimite]);
    expect(s.limitesEstruturais).toBe(1);
    // Os demais aplicáveis seguram, então o fio atravessa: o limite não é dívida.
    expect(s.atravessa).toBe(true);
    expect(resumoDoFio(s)).toContain("decisão de produto, não lacuna da operação");
    expect(filaDeResolucao([comLimite])).toEqual([]);
  });

  it("o leitor deriva o limite da geração medida, não de uma lista fixa", () => {
    expect(FN).toContain("app_proj_geracao_cliente_ck");
    expect(FN).toContain("geracao < 1 || geracao > 5");
    expect(FN).toContain("Estender o modelo é decisão de produto");
  });

  it("o painel diz 'não cabe' em vez de 'aberto'", () => {
    expect(PAINEL).toContain('"não cabe"');
    expect(PAINEL).toContain("limite_estrutural");
  });

  it("pessoa cujo membro da ficha foi arquivado também é limite, não lacuna", () => {
    /*
      Medido no caso-piloto: o único case_members do dependente menor está
      ARQUIVADO — a reconciliação moveu a composição familiar para Núcleos.
      Como family_member_id é FK de case_members, esse elo não fecha por
      nenhum caminho. Mostrar "aberto" pediria à equipe algo impossível.
    */
    expect(FN).toContain('limites["pesquisa_para_membro"]');
    expect(FN).toContain("a composição dela vive no núcleo");
    expect(FN).toContain("FK de case_members");
  });

  it("o leitor só conta membro ATIVO: arquivado não finge composição", () => {
    const trecho = FN.slice(FN.indexOf('.from("case_members")'), FN.indexOf('.from("nucleo_membros")'));
    expect(trecho).toContain('.is("archived_at", null)');
  });
});

describe("silêncio é pior que lacuna: a propagação que não deriva fica registrada", () => {
  const G02 = readFileSync("src/lib/pessoas-linhagens.functions.ts", "utf8");

  it("sem composição única, audita em vez de retornar calado", () => {
    expect(G02).toContain("fio_membro_nao_derivado");
    expect(G02).toContain("Silêncio é pior que lacuna");
  });

  it("distingue zero (composição no núcleo) de mais de um (duplicidade)", () => {
    expect(G02).toContain("a composição dela vive no núcleo");
    expect(G02).toContain("duplicidade a resolver antes");
  });

  it("e continua não gravando nada nesses dois casos", () => {
    const i = G02.indexOf("if (candidatos.length !== 1) {");
    const trecho = G02.slice(i, G02.indexOf("if (alvo.family_member_id === candidatos[0]) return;"));
    expect(trecho).not.toContain("gravarComVerificacao");
    expect(trecho).toContain("return;");
  });

  it("a propagação também só olha membro ativo", () => {
    const trecho = G02.slice(
      G02.indexOf("const propagarFioParaPesquisa"),
      G02.indexOf("const registrarVinculo"),
    );
    expect(trecho).toContain('.eq("cliente_id", novoCliente)');
    expect(trecho).toContain('.is("archived_at", null)');
  });
});
