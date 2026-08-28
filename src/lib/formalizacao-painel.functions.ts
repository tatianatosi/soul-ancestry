import { semCache } from "@/lib/no-store";
import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { contextoOps, type Sb } from "@/lib/ops.server";
import { calcularCadencia } from "@/lib/jornada-cliente";

/* eslint-disable @typescript-eslint/no-explicit-any */

export type ItemFila = { id: string; rotulo: string; detalhe: string };
export type FilaFormalizacao = { chave: string; rotulo: string; itens: ItemFila[] };

const dias = (de: string | null, hoje: number) =>
  de ? Math.floor((hoje - new Date(de).getTime()) / 86_400_000) : null;

/**
 * Painel Hoje — camada de formalização, dossiê e cadência.
 * Somente leitura: nada aqui dispara cobrança, contrato ou comunicação.
 */
export const painelFormalizacao = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    semCache();
    const supabase = context.supabase as unknown as Sb;
    const ctx = await contextoOps(supabase, context.userId as string);
    const org = ctx.organizationId;

    const [{ data: casos }, { data: nucleos }, { data: entregas }, { data: docs }] = await Promise.all([
      supabase
        .from("crm_casos")
        .select(
          "id,codigo,titulo,contrato_assinado,pagamento_confirmado,ativo,onboarding_iniciado_em,dossie_mae_referencia,eixo_comercial,eixo_formalizacao,status_caso_derivado,ultimo_touchpoint_em,aguardando_instituicao_externa,motivo_espera_externa,proxima_acao,prazo_proxima_acao,created_at",
        )
        .eq("organization_id", org)
        .is("archived_at", null)
        .limit(500),
      supabase.from("nucleos_familiares").select("id,case_id,dossie_mae,dossie_status").eq("organization_id", org).is("archived_at", null).limit(500),
      supabase
        .from("client_deliverables")
        .select("id,case_id,title_client,approval_status")
        .eq("organization_id", org)
        .is("archived_at", null)
        .in("approval_status", ["rascunho", "em_revisao", "aprovado"])
        .limit(300),
      supabase
        .from("document_requests")
        .select("id,case_id,full_name_text,document_type,status,request_type")
        .eq("organization_id", org)
        .is("archived_at", null)
        .in("status", ["pendente", "solicitado", "aguardando_cliente"])
        .limit(300),
    ]);

    const hoje = Date.now();
    const lista = (casos ?? []) as any[];
    const nucleoPorCaso = new Set((nucleos ?? []).map((n: any) => n.case_id));
    const nome = (c: any) => c.codigo ?? c.titulo ?? c.id;

    const cadencias = lista.map((c) => ({
      caso: c,
      dias: dias(c.ultimo_touchpoint_em ?? c.created_at ?? null, hoje) ?? 0,
      cad: calcularCadencia({
        hoje: new Date(hoje).toISOString(),
        ultimoTouchpointEm: c.ultimo_touchpoint_em ?? c.created_at ?? null,
        aguardandoInstituicaoExterna: !!c.aguardando_instituicao_externa,
        motivoEsperaExterna: c.motivo_espera_externa ?? null,
      }),
    }));

    const fila = (chave: string, rotulo: string, itens: ItemFila[]): FilaFormalizacao => ({ chave, rotulo, itens });
    const hojeISO = new Date().toISOString().slice(0, 10);

    const filas: FilaFormalizacao[] = [
      fila(
        "formalizacao_pendente",
        "Formalização pendente",
        lista
          .filter((c) => !c.ativo && (!c.contrato_assinado || !c.pagamento_confirmado))
          .map((c) => ({ id: c.id, rotulo: nome(c), detalhe: "Aceite confirmado — formalização pendente" })),
      ),
      fila(
        "contratos",
        "Contratos a enviar/assinar",
        lista.filter((c) => !c.contrato_assinado).map((c) => ({ id: c.id, rotulo: nome(c), detalhe: "contrato não assinado" })),
      ),
      fila(
        "pagamentos",
        "Pagamentos iniciais aguardados",
        lista
          .filter((c) => c.contrato_assinado && !c.pagamento_confirmado)
          .map((c) => ({ id: c.id, rotulo: nome(c), detalhe: "aguardando confirmação transacional" })),
      ),
      fila(
        "onboarding_bloqueado",
        "Onboardings bloqueados",
        lista
          .filter((c) => !c.onboarding_iniciado_em && (!c.contrato_assinado || !c.pagamento_confirmado))
          .map((c) => ({ id: c.id, rotulo: nome(c), detalhe: "exige contrato assinado e pagamento inicial" })),
      ),
      fila(
        "sem_dossie",
        "Casos sem dossiê-mãe válido",
        lista
          .filter((c) => !c.dossie_mae_referencia)
          .map((c) => ({ id: c.id, rotulo: nome(c), detalhe: "dossiê-mãe não referenciado" })),
      ),
      fila(
        "sem_nucleo",
        "Casos sem núcleo familiar",
        lista.filter((c) => !nucleoPorCaso.has(c.id)).map((c) => ({ id: c.id, rotulo: nome(c), detalhe: "núcleo familiar não criado" })),
      ),
      fila(
        "sem_touchpoint_10",
        "Sem atualização ao cliente há 10+ dias",
        cadencias
          .filter((x) => x.dias >= 10 && x.dias < 14)
          .map((x) => ({ id: x.caso.id, rotulo: nome(x.caso), detalhe: `${x.dias} dias sem touchpoint` })),
      ),
      fila(
        "criticos_14",
        "Críticos: 14+ dias sem touchpoint",
        cadencias
          .filter((x) => x.dias >= 14)
          .map((x) => ({
            id: x.caso.id,
            rotulo: nome(x.caso),
            detalhe: x.caso.aguardando_instituicao_externa
              ? `${x.dias} dias — espera institucional comunicada`
              : `${x.dias} dias sem touchpoint`,
          })),
      ),
      fila(
        "documentos_cliente",
        "Documentos aguardados do cliente",
        (docs ?? []).map((d: any) => ({
          id: d.case_id ?? d.id,
          rotulo: d.document_type ?? "documento",
          detalhe: `${d.full_name_text ?? "titular"} · ${d.status}`,
        })),
      ),
      fila(
        "entregas_pendentes",
        "Micro-entregas aguardando aprovação/publicação",
        (entregas ?? []).map((e: any) => ({ id: e.case_id ?? e.id, rotulo: e.title_client ?? "entrega", detalhe: e.approval_status })),
      ),
      fila(
        "acoes_vencidas",
        "Próximas ações vencidas e de hoje",
        lista
          .filter((c) => c.prazo_proxima_acao && String(c.prazo_proxima_acao).slice(0, 10) <= hojeISO)
          .map((c) => ({
            id: c.id,
            rotulo: nome(c),
            detalhe: `${c.proxima_acao ?? "sem ação descrita"} · ${String(c.prazo_proxima_acao).slice(0, 10)}`,
          })),
      ),
    ];

    return {
      filas,
      resumo: {
        casos: lista.length,
        emFormalizacao: filas[0]?.itens.length ?? 0,
        criticos: cadencias.filter((x) => x.cad.status === "critico").length,
        atencao: cadencias.filter((x) => x.cad.status === "atencao").length,
      },
    };
  });
