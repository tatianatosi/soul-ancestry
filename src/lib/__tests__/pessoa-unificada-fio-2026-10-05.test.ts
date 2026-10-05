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
      expect(e.inversoDe, e.chave).toMatch(/^[a-z_]+\.[a-z_]+$/);
    }
  });

  it("o elo mecânico é o inverso exato de um vínculo que já existe", () => {
    const e = eloPor("pesquisa_para_perfil")!;
    expect(e.natureza).toBe("mecanico");
    expect(e.coluna).toBe("research_people.genealogical_person_profile_id");
    expect(e.inversoDe).toBe("genealogical_person_profiles.research_person_id");
  });

  it("ligar pessoa de pesquisa a pessoa canônica NUNCA é mecânico", () => {
    for (const chave of ["perfil_para_cliente", "pesquisa_para_membro", "caso_para_membro"]) {
      expect(eloPor(chave)!.natureza, chave).toBe("decisao_de_identidade");
    }
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
    // E o escritor grava uma coluna só.
    const gravadas = [...FN.matchAll(/payload: \{ ([a-z_]+):/g)].map((m) => m[1]);
    expect(gravadas).toEqual(["genealogical_person_profile_id"]);
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
    expect(s.abertosMecanicos).toBe(1); // pesquisa_para_perfil
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
    expect(FN).toContain('if (!perfilId || pessoa["genealogical_person_profile_id"]) continue;');
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
