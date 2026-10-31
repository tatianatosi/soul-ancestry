import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import {
  textoLeadOrigem,
  textoPaisVia,
  textoPesquisa,
  textoProximoPasso,
} from "@/lib/estado-integrado-caso";

/**
 * Ordem P0 "Sistema Único Transversal" (reaberta em 24/09/2026): o Estado
 * Integrado do Caso passa a cobrir os 8 itens pedidos — pessoa/núcleo,
 * lead/origem, pesquisa, produto-pai/país/via/etapa/marco, próximo
 * passo/bloqueio, onboarding/microentrega, contrato/OS e acesso ao App —
 * lendo, sem copiar, e apontando para a superfície que grava.
 */

const componente = readFileSync("src/components/caso/estado-integrado.tsx", "utf8");
const rota = readFileSync("src/routes/_authenticated/casos.$caseId.index.tsx", "utf8");
const ficha = readFileSync("src/lib/caso-ficha.functions.ts", "utf8");

describe("composição — os 8 itens da ordem, cada um com link para a fonte", () => {
  it("todas as linhas pedidas existem no bloco", () => {
    for (const rotulo of [
      "Pessoa / origem",
      "Lead / origem",
      "Família / núcleo",
      "Pesquisa e evidências",
      "Produto-pai / trilha",
      "País / via",
      "Etapa / rota da jornada",
      "Marcos do planejador",
      "Próximo passo / bloqueio",
      "Onboarding",
      "Última microentrega",
      "Contrato / OS",
      "Acesso ao App",
    ]) {
      expect(componente, rotulo).toContain(`rotulo="${rotulo}"`);
    }
  });
  it("as linhas novas apontam para a superfície que grava, nunca para formulário local", () => {
    expect(componente).toContain('linkTo="/pesquisa-evidencias/$caseId"');
    expect(componente).toContain('linkTo={leadOrigem ? "/leads" : undefined}');
    expect(componente).not.toMatch(/useMutation|useQuery|useServerFn|onChange/);
  });
  it("a rota passa ao bloco só dados que ela mesma já leu para este caseId", () => {
    expect(rota).toContain("leadOrigem={((q.data as any)?.leadOrigem ?? null)");
    expect(rota).toContain("qPesquisa.data");
    expect(rota).toContain("confirmadas: estadoDossieDoCaso(");
    expect(rota).toContain("bloqueios: bloqueiosReais.length");
    expect(rota).toContain("acao: canonica.acao ?? null");
    expect(rota).toContain('queryKey: ["ficha-caso-pesquisa", id]');
  });
});

describe("textos — ausência é dita, nada é inventado", () => {
  it("lead ausente e presente", () => {
    expect(textoLeadOrigem(null)).toBe("Sem lead vinculado ao caso");
    expect(textoLeadOrigem({ nome: "Ana", origem: "indicacao", estagio: "handoff" })).toBe(
      "Ana · origem indicacao · handoff",
    );
    expect(textoLeadOrigem({ nome: "Ana" })).toContain("origem não informada");
  });
  it("país/via prefere o dado de trilha e cai para o do caso", () => {
    expect(
      textoPaisVia({ pais_linha_prioritaria: "Itália", via_juridica_preliminar: "materna" }),
    ).toBe("Itália · materna");
    expect(textoPaisVia({ pais: "Portugal", via: "neto" })).toBe("Portugal · neto");
    expect(textoPaisVia({})).toBe("País não definido · via não definida");
  });
  it("pesquisa resume contagens reais ou diz que não foi lida", () => {
    expect(textoPesquisa(null)).toBe("Pesquisa não iniciada ou não lida");
    expect(
      textoPesquisa({ pessoas: 4, relacoes: 1, evidencias: 2, confirmadas: 0, achados: 1 }),
    ).toBe("4 pessoa(s) · 1 relação(ões) · 2 evidência(s), 0 aprovada(s) · 1 achado(s)");
  });
  it("próximo passo sempre diz responsável, prazo e bloqueio — nunca vazio", () => {
    expect(textoProximoPasso(null)).toBe("Próxima ação ainda não calculada");
    expect(
      textoProximoPasso({
        acao: "Pedir certidão",
        responsavel: null,
        prazo: null,
        bloqueios: 0,
        primeiroBloqueio: null,
      }),
    ).toBe("Pedir certidão · sem responsável · sem prazo — sem bloqueio real");
    expect(
      textoProximoPasso({
        acao: "Assinar contrato",
        responsavel: "Equipe",
        prazo: "2026-10-01T00:00:00Z",
        bloqueios: 2,
        primeiroBloqueio: "Pagamento inicial pendente",
      }),
    ).toBe(
      "Assinar contrato · Equipe · até 2026-10-01 — 2 bloqueio(s), primeiro: Pagamento inicial pendente",
    );
  });
});

describe("isolamento por organização e caso", () => {
  const trecho = ficha.slice(
    ficha.indexOf("const { data: leadOrigem }"),
    ficha.indexOf("nucleo_completude"),
  );
  it("o lead de origem é lido só da organização e do caso da ficha", () => {
    expect(trecho).toContain('.from("leads")');
    expect(trecho).toContain('.eq("organization_id", organizationId)');
    expect(trecho).toContain('.eq("case_id", data.id)');
    expect(trecho).toContain('.is("archived_at", null)');
    expect(trecho).not.toMatch(/\.(insert|update|upsert|delete)\(/);
  });
  it("a ficha só carrega caso da organização do usuário (caso de outra org = não encontrado)", () => {
    const carregar = ficha.slice(ficha.indexOf("export const carregarFichaCaso"));
    expect(carregar).toMatch(
      /\.from\("crm_casos"\)[\s\S]{0,200}\.eq\("organization_id", organizationId\)/,
    );
  });
  it("a pesquisa do caso também filtra por organização", () => {
    const cadeia = readFileSync("src/lib/pesquisa-cadeia.functions.ts", "utf8");
    expect(
      cadeia.match(/\.eq\("organization_id", organizationId\)/g)!.length,
    ).toBeGreaterThanOrEqual(10);
  });
});

describe("releitura após atualização na superfície fonte", () => {
  it("as leituras do bloco não usam cache (reload mostra o persistido)", () => {
    expect(ficha).toContain("semCache();");
    expect(readFileSync("src/lib/pesquisa-cadeia.functions.ts", "utf8")).toContain("semCache();");
    expect(readFileSync("src/lib/cadeia-operacional.functions.ts", "utf8")).toContain(
      "semCache();",
    );
  });
  it("o bloco não guarda estado próprio: tudo vem das queries da rota", () => {
    expect(componente).not.toMatch(/useState|useEffect|localStorage/);
  });
  it("o histórico do caso continua vindo da mesma leitura (case_timeline_events)", () => {
    expect(ficha).toContain('.from("case_timeline_events")');
    // Prettier pode quebrar a prop timelineUltimoEvento em múltiplas linhas.
    expect(rota).toMatch(/timelineUltimoEvento=\{[\s\S]{0,40}\(q\.data\?\.timeline \?\? \[\]\)/);
  });
});
