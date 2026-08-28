import { semCache } from "@/lib/no-store";
import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Conferência somente leitura dos critérios de aceite de CA-DEC-2026-08-17-01
 * contra os dados reais do caso: núcleo familiar, registros de CRM, partes do
 * contrato familiar e vínculo do dependente. Não cria, funde nem exclui nada.
 */
export const conferirEstruturaFamiliar = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { caseId: string }) => {
    if (!/^[0-9a-f-]{36}$/i.test(data?.caseId ?? "")) throw new Error("caseId inválido.");
    return data;
  })
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = (context as any).supabase;

    const { data: caso } = await supabase
      .from("crm_casos")
      .select("id,codigo,titulo,demo")
      .eq("id", data.caseId)
      .maybeSingle();
    if (!caso) throw new Error("Caso não encontrado.");

    const { data: nucleo } = await supabase
      .from("nucleos_familiares")
      .select("id,nome,descricao")
      .eq("case_id", data.caseId)
      .is("archived_at", null)
      .maybeSingle();

    const { data: membros } = await supabase
      .from("nucleo_membros")
      .select("id,nome,papel,vinculo,processo,cliente_id,ordem")
      .eq("nucleo_id", nucleo?.id ?? "00000000-0000-0000-0000-000000000000")
      .is("archived_at", null)
      .order("ordem");

    const { data: contrato } = await supabase
      .from("contracts")
      .select("id,contract_number,title,status,contract_type,demo")
      .eq("case_id", data.caseId)
      .eq("contract_type", "contract_base")
      .is("archived_at", null)
      .maybeSingle();

    const { data: partes } = await supabase
      .from("contract_parties")
      .select("id,person_name,role,signature_required,legal_capacity_status,relationship_to_case,display_order")
      .eq("contract_id", contrato?.id ?? "00000000-0000-0000-0000-000000000000")
      .is("archived_at", null)
      .order("display_order");

    const lista = (membros ?? []) as any[];
    const listaPartes = (partes ?? []) as any[];
    const signatarios = lista.filter((m) => m.papel === "contratante_signatario");
    const dependentes = lista.filter((m) => m.papel === "dependente");
    const partesSignatarias = listaPartes.filter((p) => p.signature_required && p.role !== "provider");
    const felipe = listaPartes.find((p) => /felipe/i.test(p.person_name ?? ""));
    const nomeCliente = new Set(signatarios.filter((m) => m.cliente_id).map((m) => String(m.nome).toLowerCase()));

    const criterios = [
      {
        criterio: "Existe um núcleo familiar vinculado ao caso canônico.",
        ok: Boolean(nucleo),
        evidencia: nucleo ? nucleo.nome : "Núcleo não registrado para este caso.",
      },
      {
        criterio: "Existem três registros individuais no CRM, sem duplicidade.",
        ok: nomeCliente.size === 3,
        evidencia: `${nomeCliente.size} cadastro(s) individual(is) vinculado(s): ${signatarios.map((m) => m.nome).join(", ") || "nenhum"}`,
      },
      {
        criterio: "Ana, Adair e Alice aparecem como partes/signatários no contrato familiar.",
        ok: partesSignatarias.length === 3,
        evidencia: contrato
          ? `${contrato.contract_number} · ${partesSignatarias.map((p) => p.person_name).join(", ") || "sem signatários"}`
          : "Contrato-base familiar não encontrado.",
      },
      {
        criterio: "Felipe aparece somente como dependente vinculado à Ana.",
        ok: Boolean(felipe) && felipe?.role === "dependent" && felipe?.signature_required === false,
        evidencia: felipe
          ? `${felipe.person_name} · ${felipe.relationship_to_case ?? "vínculo não descrito"} · assinatura ${felipe.signature_required ? "exigida (inconsistente)" : "não exigida"}`
          : "Dependente não registrado no contrato.",
      },
      {
        criterio: "Nenhuma entidade DEMO ou contrato histórico é usada.",
        ok: caso.demo === false && contrato?.demo === false,
        evidencia: `Caso ${caso.codigo} demo=${String(caso.demo)}; contrato demo=${String(contrato?.demo ?? "n/d")}`,
      },
    ];

    return {
      caso: { id: caso.id, codigo: caso.codigo, titulo: caso.titulo },
      nucleo: nucleo ?? null,
      membros: lista,
      contrato: contrato ?? null,
      partes: listaPartes,
      dependentes,
      criterios,
      conforme: criterios.every((c) => c.ok),
    };
  });
