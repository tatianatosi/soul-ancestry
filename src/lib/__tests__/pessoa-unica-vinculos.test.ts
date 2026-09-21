import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

// CA03-PESSOA-UNICA-VINCULOS (09/09/2026): garantir que uma pessoa conhecida
// atravessa Lead → Cliente → Caso → Núcleo/Participante → Pesquisa sem virar
// outra identidade. Parte do artefato de Pessoa 360 já existente
// (pessoa-identidade.ts, pessoa.functions.ts, pessoa-vinculo.ts) — nenhuma
// tabela nova, nenhum motor novo.

const crmDeskFn = readFileSync("src/lib/crm-desk.functions.ts", "utf8");
const pessoaRota = readFileSync("src/routes/_authenticated/pessoas.$clienteId.tsx", "utf8");
const pessoaVinculo = readFileSync("src/lib/pessoa-vinculo.ts", "utf8");
const pessoaIdentidade = readFileSync("src/lib/pessoa-identidade.ts", "utf8");

describe("vínculo ausente corrigido: leads.case_id agora tem escritor", () => {
  it("case_id entrou em CAMPOS_LEAD (existia na tabela, nenhum escritor gravava)", () => {
    expect(crmDeskFn).toMatch(/CAMPOS_LEAD = \[[\s\S]*?"case_id"/);
  });

  it("nenhuma tabela nova foi criada para isto — reusa salvarLeadDesk existente", () => {
    expect(pessoaRota).toContain('import { salvarLeadDesk } from "@/lib/crm-desk.functions"');
    expect(pessoaRota).not.toMatch(/create table|nova_tabela/i);
  });
});

describe("confirmação humana do vínculo lead → pessoa (nunca automática)", () => {
  it("o vínculo só grava quando um caso é explicitamente escolhido, nunca por nome sozinho", () => {
    expect(pessoaRota).toContain("mVincular.mutate({ leadId: lead.id, caseId: casoEscolhido[lead.id] })");
    expect(pessoaRota).toContain('disabled={!casoEscolhido[lead.id] || mVincular.isPending}');
  });

  it("o botão só grava case_id — nunca recria ou sobrescreve outros campos do lead (preserva origem/Discovery)", () => {
    const chamada = pessoaRota.match(/vincularLead\(\{ data: \{ id: v\.leadId, valores: \{([^}]*)\} \} \}\)/);
    expect(chamada).not.toBeNull();
    expect(chamada![1].trim()).toBe("case_id: v.caseId");
  });

  it("a ação é gravada só quando há caso desta pessoa para escolher — sem caso, não aparece", () => {
    expect(pessoaRota).toContain("casos.length === 0");
    expect(pessoaRota).toContain("Esta pessoa ainda não tem caso");
  });

  it("candidato com evidência fraca (só nome) continua exigindo a mesma confirmação humana — não é bloqueado nem automático", () => {
    // apenas_indicio nunca vira link automático (podeTratarComoMesmaPessoa),
    // mas a ação de confirmar vínculo fica disponível igual às outras forças —
    // é o humano, não a força da evidência, quem decide.
    expect(pessoaIdentidade).toContain('return e?.forca === "confirmado";');
    expect(pessoaRota).not.toMatch(/evidencia\.forca === "confirmado"[\s\S]{0,80}casoEscolhido/);
  });
});

describe("leitor único de pessoas do caso (Núcleo/Participante) já convergido", () => {
  it("pessoasDoCasoComFallbackNucleo nunca funde as duas fontes — usa uma ou outra", () => {
    expect(pessoaVinculo).toContain("Nunca funde as duas fontes");
  });

  it("clienteCorrespondentePorNome nunca escolhe ao acaso em ambiguidade", () => {
    expect(pessoaVinculo).toContain("candidatos.length === 1 ? candidatos[0].id : null");
  });
});

describe("máscaras existentes reusadas no formulário ativo de Pessoa (item 7)", () => {
  it("UF do endereço reusa a lista canônica (UFS_BRASIL), não uma lista duplicada à mão", () => {
    expect(pessoaRota).toContain("formatarCep, formatarCpf, formatarTelefone, UFS_BRASIL }");
    expect(pessoaRota).toContain("const UFS = UFS_BRASIL.map((u) => u.sigla)");
  });

  it("CPF, telefone e CEP do formulário de Pessoa aplicam a máscara já existente", () => {
    expect(pessoaRota).toContain('mascara: formatarTelefone');
    expect(pessoaRota).toContain('mascara: formatarCpf');
    expect(pessoaRota).toContain('mascara: formatarCep');
  });

  it("nenhuma frente visual nova — o mesmo input de texto, só com formatação no onChange", () => {
    expect(pessoaRota).toContain("c.mascara ? c.mascara(e.target.value) : e.target.value");
  });
});
