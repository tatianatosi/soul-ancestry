import { describe, expect, it } from "vitest";
import { lerBasePessoasCliente, projetarPessoasCliente } from "@/lib/clientes-lista-projecao";
import { seguro } from "@/lib/clientes.functions";

describe("projetarPessoasCliente — mesma projeção do GET listarPessoasCliente", () => {
  it("projeta todos os campos, casos, núcleos e padrões de ausência", () => {
    const r = projetarPessoasCliente({
      pessoas: [
        { id: "p1", nome: "Pessoa Um", classificacao: "cliente", is_demo: false, email: "a@x.org" },
        { id: "p2", nome: "Pessoa Dois", demo: true },
      ],
      casos: [
        { cliente_id: "p1", contrato_assinado: true, pagamento_confirmado: false },
        { cliente_id: "p1", contrato_assinado: false, pagamento_confirmado: true },
      ],
      membros: [
        { cliente_id: "p1", nucleo_id: "n1", papel: "titular" },
        { cliente_id: "p2", nucleo_id: "n-arquivado", vinculo: "filha" },
      ],
      nucleos: [{ id: "n1", nome: null }],
    });
    expect(r[0]).toEqual({
      id: "p1", nome: "Pessoa Um", nome_social: null, email: "a@x.org", telefone: null, origem: null,
      status_comercial: null, pais_interesse: null, status: "pre_onboarding", classificacao: "cliente",
      is_demo: false, archived_at: null, archive_motivo: null, ativacao_decidida_em: null,
      ativacao_justificativa: null, contratoAssinado: true, pagamentoConfirmado: true, casosVinculados: 2,
      participacoes: [{ nucleo: "Núcleo familiar", papel: "titular" }],
    });
    expect(r[1]).toMatchObject({
      classificacao: "pre_cliente", is_demo: true, casosVinculados: 0,
      contratoAssinado: false, pagamentoConfirmado: false,
      participacoes: [{ nucleo: null, papel: "filha" }],
    });
  });
});

describe("lerBasePessoasCliente — consultas escopadas por organização", () => {
  function fake(erroEm?: string) {
    const chamadas: string[] = [];
    const supabase = {
      from(t: string) {
        const q: any = {
          select: (c: string) => (chamadas.push(`${t}.select(${c})`), q),
          eq: (k: string, v: string) => (chamadas.push(`${t}.eq(${k},${v})`), q),
          order: (k: string) => (chamadas.push(`${t}.order(${k})`), q),
          is: (k: string, v: null) => (chamadas.push(`${t}.is(${k},${v})`), q),
          then: (res: any) => res(erroEm === t ? { data: null, error: { message: "RLS negou" } } : { data: [], error: null }),
        };
        return q;
      },
    };
    return { supabase, chamadas };
  }

  it("filtra as quatro tabelas pela organização, ordena por nome e exclui arquivados", async () => {
    const { supabase, chamadas } = fake();
    await lerBasePessoasCliente(supabase, "org-1", seguro);
    for (const t of ["clientes", "crm_casos", "nucleo_membros", "nucleos_familiares"]) {
      expect(chamadas).toContain(`${t}.eq(organization_id,org-1)`);
    }
    expect(chamadas).toContain("clientes.order(nome)");
    expect(chamadas).toContain("crm_casos.is(archived_at,null)");
    expect(chamadas).toContain("nucleos_familiares.is(archived_at,null)");
    expect(chamadas).not.toContain("nucleo_membros.is(archived_at,null)");
  });

  it("propaga erro de leitura em vez de devolver lista vazia", async () => {
    const { supabase } = fake("crm_casos");
    await expect(lerBasePessoasCliente(supabase, "org-1", seguro)).rejects.toThrow("RLS negou");
  });
});
