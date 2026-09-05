import { semCache } from "@/lib/no-store";
import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  avaliarFilaDrive,
  podeTransicionar,
  ESTRUTURA_PADRAO_DOSSIE,
  type StatusFilaDrive,
} from "@/lib/drive-provisioning";

/* eslint-disable @typescript-eslint/no-explicit-any */

const UUID = /^[0-9a-f-]{36}$/i;

export const NUCLEO_AMBIENTES = [
  "drive_clube_ancestral",
  "desk_intelligence",
  "acervo_interno",
] as const;

export const NUCLEO_NIVEIS_ACESSO = ["restrito", "equipe", "coordenacao"] as const;

export const NUCLEO_DOSSIE_STATUS = ["nao_iniciado", "em_preparacao", "ativo", "arquivado"] as const;

export const NUCLEO_PAPEIS = [
  "contratante_signatario",
  "requerente",
  "dependente",
  "referencia_genealogica",
] as const;

/** Lista os núcleos familiares da organização com requerentes vinculados. */
export const listarNucleos = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    semCache();
    const supabase = (context as any).supabase;

    const { data: nucleos, error } = await supabase
      .from("nucleos_familiares")
      .select(
        "id,case_id,nome,descricao,dossie_mae,contratante_nome,ambiente,nivel_acesso,link_interno,responsavel_nome,dossie_status,created_at",
      )
      .is("archived_at", null)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);

    const ids = (nucleos ?? []).map((n: any) => n.id);
    const caseIds = Array.from(new Set((nucleos ?? []).map((n: any) => n.case_id).filter(Boolean)));

    const [{ data: membros }, { data: casos }, { data: filas }] = await Promise.all([
      ids.length
        ? supabase
            .from("nucleo_membros")
            .select("id,nucleo_id,nome,papel,vinculo,processo,ordem,cliente_id")
            .in("nucleo_id", ids)
            .is("archived_at", null)
            .order("ordem")
        : Promise.resolve({ data: [] }),
      caseIds.length
        ? supabase
            .from("crm_casos")
            .select("id,codigo,titulo,demo,contrato_assinado,pagamento_confirmado,ativado_em")
            .in("id", caseIds)
        : Promise.resolve({ data: [] }),
      // Fila real de provisionamento do Drive (governada em drive-provisioning.ts),
      // para não deixar /nucleos exibir dossiê-mãe como texto livre desconectado
      // do estado real de encaminhamento (CA-P0-EXEC-001, critério C).
      ids.length
        ? supabase
            .from("drive_provisioning_queue")
            .select("id,family_id,status,stage_trigger,observacao_interna,updated_at")
            .in("family_id", ids)
            .is("archived_at", null)
            .order("updated_at", { ascending: false })
        : Promise.resolve({ data: [] }),
    ]);

    const porCaso = new Map((casos ?? []).map((c: any) => [c.id, c]));
    const porFila = new Map<string, any>();
    for (const f of (filas ?? []) as any[]) {
      if (!porFila.has(f.family_id)) porFila.set(f.family_id, f);
    }

    return (nucleos ?? []).map((n: any) => ({
      ...n,
      caso: n.case_id ? (porCaso.get(n.case_id) ?? null) : null,
      filaDrive: porFila.get(n.id) ?? null,
      membros: (membros ?? []).filter((m: any) => m.nucleo_id === n.id),
    }));
  });

/**
 * Lista leve de pessoas cadastradas (Pessoa Canônica), para o seletor "vincular a pessoa"
 * no formulário de requerente do núcleo — evita fragmentar a mesma pessoa entre `clientes`
 * e `nucleo_membros` sem vínculo (achado: piloto-ana.functions.ts cria membro sem cliente_id).
 */
export const listarClientesParaVinculo = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    semCache();
    const supabase = (context as any).supabase;
    const { data, error } = await supabase
      .from("clientes")
      .select("id,nome")
      .is("archived_at", null)
      .order("nome");
    if (error) throw new Error(error.message);
    return (data ?? []) as { id: string; nome: string }[];
  });

/** Atualiza o cadastro do dossiê-mãe de um núcleo. Campos classificatórios são listas fechadas. */
export const salvarDossieNucleo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: {
    nucleoId: string;
    dossie_mae: string;
    ambiente: string;
    nivel_acesso: string;
    link_interno: string;
    responsavel_nome: string;
    dossie_status: string;
  }) => {
    if (!UUID.test(data?.nucleoId ?? "")) throw new Error("Núcleo inválido.");
    if (data.ambiente && !(NUCLEO_AMBIENTES as readonly string[]).includes(data.ambiente)) {
      throw new Error("Ambiente autorizado fora da lista controlada.");
    }
    if (data.nivel_acesso && !(NUCLEO_NIVEIS_ACESSO as readonly string[]).includes(data.nivel_acesso)) {
      throw new Error("Nível de acesso fora da lista controlada.");
    }
    if (!(NUCLEO_DOSSIE_STATUS as readonly string[]).includes(data.dossie_status)) {
      throw new Error("Situação do dossiê fora da lista controlada.");
    }
    if (data.link_interno && !/^https?:\/\//i.test(data.link_interno)) {
      throw new Error("O link interno deve ser uma URL válida.");
    }
    return data;
  })
  .handler(async ({ data, context }) => {
    const supabase = (context as any).supabase;

    const patch = {
      dossie_mae: data.dossie_mae?.trim() || null,
      ambiente: data.ambiente || null,
      nivel_acesso: data.nivel_acesso || null,
      link_interno: data.link_interno?.trim() || null,
      responsavel_nome: data.responsavel_nome?.trim() || null,
      dossie_status: data.dossie_status,
    };

    const { data: salvo, error } = await supabase
      .from("nucleos_familiares")
      .update(patch)
      .eq("id", data.nucleoId)
      .select("id,dossie_mae,ambiente,nivel_acesso,link_interno,responsavel_nome,dossie_status")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!salvo) throw new Error("Núcleo não encontrado ou sem permissão de escrita.");

    // Verificação pós-gravação: o dado precisa estar realmente persistido.
    for (const [campo, valor] of Object.entries(patch)) {
      if ((salvo as any)[campo] !== valor) {
        throw new Error(`O campo ${campo} não foi persistido. Nenhuma alteração foi confirmada.`);
      }
    }
    return salvo;
  });

/**
 * Edita os dados de um requerente/membro já cadastrado no núcleo (nome, vínculo, processo).
 *
 * Existia leitura (`listarNucleos`) e criação (só via materialização do piloto), mas nenhuma
 * edição: a ficha do Caso linkava para cá dizendo "Editar em Núcleos e dossiês", e esta tela
 * só editava o dossiê-mãe — nunca a pessoa em si. Resultado real, confirmado em produção:
 * dado digitado para editar um requerente não tinha para onde ir.
 *
 * O papel não é editável aqui: a constraint do banco só aceita
 * `contratante_signatario`/`dependente`, mais estreita que a lista usada na tela — mudar de
 * papel é decisão que merece tela própria, não um campo de texto livre.
 */
export const salvarMembroNucleo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { membroId: string; nome: string; vinculo: string; processo: string; clienteId?: string | null }) => {
    if (!UUID.test(data?.membroId ?? "")) throw new Error("Requerente inválido.");
    if (!data.nome?.trim()) throw new Error("Nome é obrigatório.");
    if (data.clienteId && !UUID.test(data.clienteId)) throw new Error("Pessoa vinculada inválida.");
    return data;
  })
  .handler(async ({ data, context }) => {
    const supabase = (context as any).supabase;

    const patch = {
      nome: data.nome.trim(),
      vinculo: data.vinculo?.trim() || null,
      processo: data.processo?.trim() || null,
      cliente_id: data.clienteId || null,
    };

    const { data: salvo, error } = await supabase
      .from("nucleo_membros")
      .update(patch)
      .eq("id", data.membroId)
      .select("id,nome,vinculo,processo,cliente_id")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!salvo) throw new Error("Requerente não encontrado ou sem permissão de escrita.");

    for (const [campo, valor] of Object.entries(patch)) {
      if ((salvo as any)[campo] !== valor) {
        throw new Error(`O campo ${campo} não foi persistido. Nenhuma alteração foi confirmada.`);
      }
    }
    return salvo;
  });

/**
 * Encaminha o núcleo para a fila real de provisionamento do Drive
 * (drive_provisioning_queue / drive-provisioning.ts), sem nunca criar pasta:
 * apenas avalia os gates reais do caso (contrato, pagamento, ativação) e, se
 * elegível, move o item de "blocked" para "ready_for_review" — nunca além
 * disso a partir daqui. "Aprovar"/"Executar" exigem decisão humana registrada
 * em outro fluxo. Ação idempotente: repetir o clique não duplica item nem
 * avança um item que já saiu de "blocked" (CA-P0-EXEC-001, critério C).
 */
export const encaminharFilaDrive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { nucleoId: string }) => {
    if (!UUID.test(data?.nucleoId ?? "")) throw new Error("Núcleo inválido.");
    return data;
  })
  .handler(async ({ data, context }) => {
    const supabase = (context as any).supabase;

    const { data: nucleo, error: nucleoErr } = await supabase
      .from("nucleos_familiares")
      .select("id,case_id")
      .eq("id", data.nucleoId)
      .maybeSingle();
    if (nucleoErr) throw new Error(nucleoErr.message);
    if (!nucleo) throw new Error("Núcleo não encontrado ou sem permissão de leitura.");
    if (!nucleo.case_id) {
      throw new Error(
        "Este núcleo não tem caso operacional vinculado — sem caso não há gates para avaliar nem fila para encaminhar.",
      );
    }

    const { data: caso, error: casoErr } = await supabase
      .from("crm_casos")
      .select("id,organization_id,contrato_assinado,pagamento_confirmado,ativado_em")
      .eq("id", nucleo.case_id)
      .maybeSingle();
    if (casoErr) throw new Error(casoErr.message);
    if (!caso) throw new Error("Caso vinculado ao núcleo não encontrado.");

    const gates = {
      contrato_assinado: Boolean(caso.contrato_assinado),
      pagamento_confirmado: Boolean(caso.pagamento_confirmado),
      onboarding_aprovado: Boolean(caso.ativado_em),
    };
    const avaliacao = avaliarFilaDrive("onboarding_aprovado", gates);

    const { data: existente, error: exErr } = await supabase
      .from("drive_provisioning_queue")
      .select("id,status")
      .eq("family_id", data.nucleoId)
      .is("archived_at", null)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (exErr) throw new Error(exErr.message);

    if (!existente) {
      const { data: criado, error: insErr } = await supabase
        .from("drive_provisioning_queue")
        .insert({
          organization_id: caso.organization_id,
          case_id: caso.id,
          family_id: data.nucleoId,
          stage_trigger: "onboarding_aprovado",
          requested_structure: ESTRUTURA_PADRAO_DOSSIE,
          required_gates: gates,
          status: avaliacao.status,
          observacao_interna: avaliacao.motivos.join(" "),
        })
        .select("id,status")
        .maybeSingle();
      if (insErr) throw new Error(insErr.message);
      return { status: (criado?.status ?? avaliacao.status) as StatusFilaDrive, motivos: avaliacao.motivos };
    }

    if (existente.status !== "blocked") {
      // Já saiu do estágio inicial: nada a fazer aqui, nunca avançamos além de
      // "ready_for_review" a partir deste botão nem duplicamos item de fila.
      return { status: existente.status as StatusFilaDrive, motivos: avaliacao.motivos };
    }

    const transicao = podeTransicionar(existente.status as StatusFilaDrive, avaliacao.status);
    if (!transicao.ok) {
      return { status: existente.status as StatusFilaDrive, motivos: avaliacao.motivos };
    }

    const { data: atualizado, error: updErr } = await supabase
      .from("drive_provisioning_queue")
      .update({ status: avaliacao.status, required_gates: gates, observacao_interna: avaliacao.motivos.join(" ") })
      .eq("id", existente.id)
      .select("id,status")
      .maybeSingle();
    if (updErr) throw new Error(updErr.message);
    return { status: (atualizado?.status ?? avaliacao.status) as StatusFilaDrive, motivos: avaliacao.motivos };
  });
