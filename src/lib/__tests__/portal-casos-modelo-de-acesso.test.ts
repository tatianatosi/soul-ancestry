import { readFileSync, readdirSync } from "node:fs";

import { describe, expect, it } from "vitest";

/**
 * Contrato de acesso da view `portal_casos`.
 *
 * Prova ESTÁTICA (contra as migrations e o código), não prova autenticada:
 * sem credencial do projeto Supabase nesta sessão, nenhuma consulta com dois
 * logins reais foi executada. O que estes testes travam é o contrato — que a
 * configuração não volte a mudar por acidente, como já aconteceu duas vezes.
 */
const dir = "supabase/migrations";
const fixacao = readFileSync(`${dir}/20260922120000_portal_casos_fixar_modelo_de_acesso.sql`, "utf8");
const gate = readFileSync(`${dir}/20260816152446_d0ffdd66-abe6-405a-92a7-d79b1bdc0abf.sql`, "utf8");
const servidor = readFileSync("src/lib/portal-dados-vivos.functions.ts", "utf8");

describe("a) o gate autoriza por usuário, caso e liberação — no banco", () => {
  const fn = gate.slice(
    gate.indexOf("function public.portal_caso_permitido"),
    gate.indexOf("revoke all on function public.portal_meu_acesso"),
  );

  it("filtra pelo auth.uid() do próprio chamador", () => {
    expect(fn).toContain("a.auth_user_id = auth.uid()");
    expect(fn).toContain("security definer");
  });

  it("exige o caso pedido, do cliente do próprio acesso", () => {
    expect(fn).toContain("ca.case_id = _case");
    expect(fn).toContain("c.cliente_id = a.client_id");
  });

  it("b) e c) acesso inativo, revogado, expirado ou arquivado não passa", () => {
    expect(fn).toContain("ca.access_status = 'active'");
    expect(fn).toContain("ca.revoked_at is null");
    expect(fn).toContain("a.archived_at is null");
    expect(fn).toContain("a.access_status = 'active'");
    expect(fn).toContain("a.access_level = 'client_workspace'");
  });

  it("exige liberação editorial e consentimento do caso", () => {
    expect(fn).toContain("c.app_access_status = 'liberado'");
    expect(fn).toContain("c.consentimento_compartilhamento = true");
    expect(fn).toContain("c.info_cliente_liberada = true");
    expect(fn).toContain("c.archived_at is null");
  });
});

describe("a configuração da view é deliberada, não acidental", () => {
  it("declara as duas reloptions na mesma instrução", () => {
    expect(fixacao).toContain("with (security_barrier = true, security_invoker = false)");
  });

  it("o gate continua sendo a cláusula de autorização", () => {
    expect(fixacao).toContain("public.portal_caso_permitido(c.id)");
  });

  it("não cria, altera nem remove policy alguma", () => {
    expect(fixacao).not.toMatch(/create\s+policy/i);
    expect(fixacao).not.toMatch(/drop\s+policy/i);
    expect(fixacao).not.toMatch(/alter\s+policy/i);
    expect(fixacao).not.toMatch(/alter\s+table/i);
  });

  it("anon continua sem acesso", () => {
    expect(fixacao).toContain("revoke all on public.portal_casos from anon");
  });

  it("o motivo fica gravado na própria view, para o próximo a mexer", () => {
    expect(fixacao).toContain("comment on view public.portal_casos");
    expect(fixacao).toContain("DELIBERADO");
  });
});

describe("e) nenhum dado interno atravessa a view", () => {
  const proibidas = [
    "observacao_interna",
    "pendencias_internas",
    "responsavel_user_id",
    "status_saude",
    "marco_atual",
    "proxima_acao",
    "dias_sem_touchpoint",
    "prazo_proxima_acao",
    "checklist_aplicavel",
  ];

  it("só fase_jornada e composicao vêm de case_plans", () => {
    const lateral = fixacao.slice(fixacao.indexOf("left join lateral"), fixacao.indexOf(") p on true"));
    expect(lateral).toContain("cp.fase_jornada");
    expect(lateral).toContain("cp.composicao");
    for (const coluna of proibidas) expect(lateral, coluna).not.toContain(coluna);
  });

  it("nenhuma coluna interna aparece em lugar nenhum da migration", () => {
    for (const coluna of proibidas) expect(fixacao, coluna).not.toContain(`cp.${coluna}`);
  });
});

describe("d) não há agregação entre casos", () => {
  it("o servidor escolhe UM caso, nunca o conjunto", () => {
    expect(servidor).toContain("const alvo = [String(casoAtivo.id)];");
    expect(servidor).toContain("permitidos.find((c) => String(c.id) === data.casoId) ?? null");
  });

  it("c) caso não autorizado devolve vazio, nunca outro caso", () => {
    expect(servidor).toContain("casoAtivoId: null, etapa: null, composicao: null");
  });

  it("todas as consultas por caso usam o mesmo alvo de um caso só", () => {
    // REVERIFICACAO-ADVERSARIAL-GIOVANNA (27/09/2026): eram 4 (projeções,
    // documentos, pendências, faturas); ganhou uma 5ª (case_timeline_events,
    // para o Histórico da Conta) — a invariante que este teste trava
    // (nenhuma consulta some casos, todas usam `alvo`) continua valendo, só
    // a contagem cresceu.
    expect(servidor.match(/\.in\("case_id", alvo\)/g)?.length).toBe(5);
  });
});

describe("nenhuma migration posterior volta a ligar security_invoker nesta view", () => {
  it("a fixação é a última palavra sobre portal_casos", () => {
    const arquivos = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();
    const tocam = arquivos.filter((f) => readFileSync(`${dir}/${f}`, "utf8").includes("public.portal_casos"));
    // P3 (25/09/2026): 20260925120000 recria a view para projetar só a data da
    // próxima entrega. A regra continua: toda migration posterior à fixação
    // que toca a view repete as duas reloptions e nunca liga security_invoker.
    const fixacao = tocam.indexOf("20260922120000_portal_casos_fixar_modelo_de_acesso.sql");
    expect(fixacao).toBeGreaterThanOrEqual(0);
    for (const f of tocam.slice(fixacao + 1)) {
      const sql = readFileSync(`${dir}/${f}`, "utf8");
      expect(sql, f).toContain("with (security_barrier = true, security_invoker = false)");
      expect(sql, f).not.toMatch(/security_invoker\s*=\s*true/);
    }
  });
});
