import { semCache } from "@/lib/no-store";
import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  avaliarFilaDrive,
  podeTransicionar,
  ESTRUTURA_PADRAO_DOSSIE,
  type StatusFilaDrive,
} from "@/lib/drive-provisioning";
import { registrarTimelineCaso } from "@/lib/timeline-operacional.server";
import {
  ordemDoContratantePrincipal,
  pessoaDoCasoAPartirDoNucleo,
  pessoasDoCasoComFallbackNucleo,
  type MembroNucleoBruto,
} from "@/lib/pessoa-vinculo";
import { coberturaPorGeracao } from "@/lib/golive-pessoas";
import { inserirComVerificacao } from "@/lib/persistencia.server";
import { motivosDossieMaeNaoAtivavel, nucleoComMesmoDossieAtivo } from "@/lib/nucleo-completude";
import { PAPEIS_PESSOA } from "@/lib/caso-ficha";

/* eslint-disable @typescript-eslint/no-explicit-any */

const UUID = /^[0-9a-f-]{36}$/i;

export const NUCLEO_AMBIENTES = [
  "drive_clube_ancestral",
  "desk_intelligence",
  "acervo_interno",
] as const;

export const NUCLEO_NIVEIS_ACESSO = ["restrito", "equipe", "coordenacao"] as const;

export const NUCLEO_DOSSIE_STATUS = ["nao_iniciado", "em_preparacao", "ativo", "arquivado"] as const;

/** Papéis que o CHECK de `nucleo_membros.papel` aceita gravar. */
export const PAPEIS_GRAVAVEIS_MEMBRO = ["contratante_signatario", "dependente"] as const;

export const NUCLEO_PAPEIS = [
  "contratante_signatario",
  "requerente",
  "dependente",
  "referencia_genealogica",
] as const;

/**
 * P32c/Fase 2 (27/09/2026) — `PAPEIS_PESSOA` (caso-ficha.ts) inclui
 * "interlocutor" como variante LEGADA (nunca invalidar linha já gravada),
 * mas o CHECK real de `nucleo_membros.papel_no_caso`
 * (migration 20260821135341) só aceita 5 valores — sem "interlocutor". Uma
 * gravação nova com esse valor passaria na validação do app e quebraria no
 * banco com um erro cru. Lista de gravação nova = PAPEIS_PESSOA sem a
 * variante legada; leitura/exibição continua usando PAPEIS_PESSOA inteiro
 * (uma linha antiga com "interlocutor" nunca fica sem rótulo).
 */
export const PAPEIS_NO_CASO_GRAVAVEIS_NUCLEO = PAPEIS_PESSOA.filter((o) => o.valor !== "interlocutor");

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
            .select("id,nucleo_id,nome,papel,papel_no_caso,vinculo,processo,ordem,cliente_id")
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

    /*
      §21 do De-Para (Pessoas & Famílias, "gerações reais") — achado real:
      case_members.pai_id/mae_id (migration 20260816201830) já grava
      parentesco administrativo do caso, e coberturaPorGeracao
      (golive-pessoas.ts) já sabe contar G1-G5 a partir daí. Não é dado de
      pesquisa nem estimativa: quando o caso não tem pai_id/mae_id gravado
      (ou já migrou para Núcleos, que não tem esse conceito), a cobertura
      fica vazia — nunca inventada.
    */
    const membrosPorCaso = await Promise.all(
      caseIds.map(async (caseId) => {
        const membros = await pessoasDoCasoComFallbackNucleo(supabase, String(caseId));
        return [
          caseId,
          membros.map((m) => ({
            id: m.id,
            nome: m.nome,
            origem: m.origem,
            paiId: m.pai_id,
            maeId: m.mae_id,
            titular: m.titular,
            requerente: m.requerente,
            contratante: m.contratante,
            representacaoNecessaria: m.representacao_necessaria,
            representacaoDocumentada: m.representacao_documentada,
          })),
        ] as const;
      }),
    );
    const coberturaPorCaso = new Map(
      membrosPorCaso.map(([caseId, membros]) => [caseId, coberturaPorGeracao(membros)]),
    );
    /*
     * Fase 2 (27/09/2026) — "representação de menor... como leitura/vínculo
     * ao membro/caso existente, sem criar ficha paralela": `nucleo_membros`
     * não grava representacao_necessaria/documentada (só case_members
     * grava). Quando o caso ainda tem case_members ativo (fonte real,
     * `origem === "case_members"`), a mesma pessoa aparece aqui por nome
     * normalizado — nunca inventa dado quando a fonte é o fallback de
     * núcleo (representação continua nula, como já era).
     */
    const normalizarNome = (s: string) => s.trim().toLowerCase();
    const representacaoPorCaso = new Map(
      membrosPorCaso.map(([caseId, membros]) => {
        const porNome = new Map<string, { necessaria: boolean | null; documentada: boolean | null }>();
        for (const m of membros) {
          if (m.origem !== "case_members") continue;
          porNome.set(normalizarNome(m.nome), {
            necessaria: m.representacaoNecessaria,
            documentada: m.representacaoDocumentada,
          });
        }
        return [caseId, porNome] as const;
      }),
    );

    return (nucleos ?? []).map((n: any) => {
      // P32c (26/09/2026) — "a mesma pessoa não pode aparecer com rótulo
      // diferente em telas diferentes": esta tela lia `nucleo_membros.papel`
      // cru (contratante_signatario/dependente/referencia_genealogica/
      // requerente — vocabulário de escrita), enquanto Caso 360 já tinha um
      // rótulo próprio (PessoasDoNucleo) e `case_members.papel_no_caso` já
      // é a coluna real e canônica (CHECK de 5 valores, R4 21/09/2026:
      // contratante/titular/dependente/representante/interlocutor_externo).
      // `pessoaDoCasoAPartirDoNucleo` agora prefere o `papel_no_caso` real
      // de `nucleo_membros` quando gravado, com a mesma função usada aqui,
      // em Caso 360 e em Pessoa 360 — nunca mais um rótulo próprio por tela.
      const membrosDoNucleo = ((membros ?? []) as MembroNucleoBruto[]).filter((m) => m.nucleo_id === n.id);
      const ordemMinima = ordemDoContratantePrincipal(membrosDoNucleo);
      const representacaoDoCaso = n.case_id ? representacaoPorCaso.get(n.case_id) : undefined;
      return {
        ...n,
        caso: n.case_id ? (porCaso.get(n.case_id) ?? null) : null,
        filaDrive: porFila.get(n.id) ?? null,
        coberturaGeracoes: n.case_id ? (coberturaPorCaso.get(n.case_id) ?? []) : [],
        membros: membrosDoNucleo.map((m) => {
          const rep = representacaoDoCaso?.get(normalizarNome(m.nome));
          return {
            ...m,
            ...pessoaDoCasoAPartirDoNucleo(m, ordemMinima),
            representacaoNecessaria: rep?.necessaria ?? null,
            representacaoDocumentada: rep?.documentada ?? null,
          };
        }),
      };
    });
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

async function orgDoUsuario(supabase: any, userId: string) {
  const { data } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();
  if (!data?.organization_id) throw new Error("Usuário sem organização ativa.");
  return data.organization_id as string;
}

/**
 * Cria um núcleo familiar novo. Só o nome é obrigatório — o resto do cadastro
 * (dossiê-mãe, ambiente, responsável) se completa depois pelo mesmo formulário
 * de edição que já existia. 06/09/2026: a tela não tinha nenhum caminho de
 * criação — só dava para editar o único núcleo já existente.
 */
export const criarNucleo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { nome: string; caseId?: string | null }) => {
    if (!data?.nome?.trim()) throw new Error("Informe o nome do núcleo.");
    if (data.caseId && !UUID.test(data.caseId)) throw new Error("Caso inválido.");
    return data;
  })
  .handler(async ({ data, context }) => {
    const supabase = (context as any).supabase;
    const userId = (context as any).userId as string;
    const organization_id = await orgDoUsuario(supabase, userId);

    const { data: criado, error } = await supabase
      .from("nucleos_familiares")
      .insert({
        organization_id,
        nome: data.nome.trim(),
        case_id: data.caseId || null,
        created_by: userId,
        updated_by: userId,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    if (data.caseId) {
      await registrarTimelineCaso(supabase, {
        organizationId: organization_id,
        caseId: data.caseId,
        eventType: "caso",
        title: "Núcleo familiar criado",
        summaryInternal: data.nome.trim(),
        sourceEntityType: "nucleos_familiares",
        sourceEntityId: criado.id as string,
        userId,
      });
    }
    return criado;
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
    const organization_id = await orgDoUsuario(supabase, (context as any).userId as string);

    // Dossiê-mãe é do núcleo e é único: "ativo" exige os metadados e nenhum
    // outro núcleo com a mesma referência ativa (regra canônica, servidor).
    const faltas = motivosDossieMaeNaoAtivavel(data);
    if (faltas.length > 0) {
      throw new Error(`Dossiê-mãe só fica ativo com: ${faltas.join(", ")}. Salve como "em preparação" até completar.`);
    }
    if (data.dossie_status === "ativo") {
      const { data: outros, error: erroOutros } = await supabase
        .from("nucleos_familiares")
        .select("id,nome,dossie_mae,dossie_status,archived_at")
        .eq("organization_id", organization_id)
        .eq("dossie_status", "ativo")
        .is("archived_at", null);
      if (erroOutros) throw new Error(erroOutros.message);
      const conflito = nucleoComMesmoDossieAtivo(data.nucleoId, data, (outros ?? []) as any[]);
      if (conflito) {
        throw new Error(
          `A referência "${data.dossie_mae.trim()}" já é o dossiê-mãe ativo do núcleo "${conflito.nome ?? conflito.id}". Um dossiê-mãe pertence a um único núcleo — use a unificação de núcleos se for a mesma família.`,
        );
      }
    }

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
      .eq("organization_id", organization_id)
      .select("id,dossie_mae,ambiente,nivel_acesso,link_interno,responsavel_nome,dossie_status,case_id,organization_id")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!salvo) throw new Error("Núcleo não encontrado ou sem permissão de escrita.");

    // Verificação pós-gravação: o dado precisa estar realmente persistido.
    for (const [campo, valor] of Object.entries(patch)) {
      if ((salvo as any)[campo] !== valor) {
        throw new Error(`O campo ${campo} não foi persistido. Nenhuma alteração foi confirmada.`);
      }
    }
    if (salvo.case_id) {
      await registrarTimelineCaso(supabase, {
        organizationId: salvo.organization_id,
        caseId: salvo.case_id,
        eventType: "caso",
        title: "Dossiê do núcleo familiar atualizado",
        sourceEntityType: "nucleos_familiares",
        sourceEntityId: data.nucleoId,
        userId: (context as any).userId as string,
      });
    }
    return salvo;
  });

/**
 * Edita os dados de um requerente/membro já cadastrado no núcleo (nome, vínculo, processo,
 * papel no caso).
 *
 * Existia leitura (`listarNucleos`) e criação (só via materialização do piloto), mas nenhuma
 * edição: a ficha do Caso linkava para cá dizendo "Editar em Núcleos e dossiês", e esta tela
 * só editava o dossiê-mãe — nunca a pessoa em si. Resultado real, confirmado em produção:
 * dado digitado para editar um requerente não tinha para onde ir.
 *
 * P32c (26/09/2026) — o papel de ESCRITA original (`papel`, contratante_signatario/dependente)
 * continua imutável aqui (é o que sustenta a aproximação de titular/contratante por ordem em
 * `pessoaDoCasoAPartirDoNucleo`). O que passa a ser editável é `papel_no_caso` — a coluna
 * canônica e já fechada por CHECK (R4, 21/09/2026: contratante/titular/dependente/
 * representante/interlocutor_externo, mesmo vocabulário de `case_members.papel_no_caso` e de
 * `PAPEIS_PESSOA`) — o mesmo rótulo que Caso 360 e Pessoa 360 já usam para a pessoa canônica.
 */
export const salvarMembroNucleo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
      membroId: string;
      nome: string;
      vinculo: string;
      processo: string;
      clienteId?: string | null;
      papelNoCaso?: string | null;
    }) => {
      if (!UUID.test(data?.membroId ?? "")) throw new Error("Requerente inválido.");
      if (data.clienteId && !UUID.test(data.clienteId)) throw new Error("Pessoa vinculada inválida.");
      if (data.papelNoCaso && !PAPEIS_PESSOA.some((o) => o.valor === data.papelNoCaso)) {
        throw new Error("Papel no caso fora da lista controlada.");
      }
      return data;
    },
  )
  .handler(async ({ data, context }) => {
    const supabase = (context as any).supabase;
    // Corte 1 (27/09/2026): escrita sempre restrita à organização da sessão.
    const organization_id = await orgDoUsuario(supabase, (context as any).userId as string);

    // P32c/Fase 2 (27/09/2026) — "interlocutor" é variante legada: só pode
    // permanecer numa linha que já a tinha, nunca ser escolhida de novo
    // (o CHECK real do banco só aceita 5 valores, sem "interlocutor" — ver
    // PAPEIS_NO_CASO_GRAVAVEIS_NUCLEO). Checa o valor atual antes de gravar
    // para dar um erro claro em vez do erro cru do banco.
    if (data.papelNoCaso === "interlocutor") {
      const { data: atual } = await supabase
        .from("nucleo_membros")
        .select("papel_no_caso")
        .eq("id", data.membroId)
        .eq("organization_id", organization_id)
        .maybeSingle();
      if (atual?.papel_no_caso !== "interlocutor") {
        throw new Error(
          'Papel "Interlocutor (variante legada)" só permanece em linhas que já o tinham — use "Interlocutor externo" para uma escolha nova.',
        );
      }
    }

    const patch = {
      nome: data.nome.trim(),
      vinculo: data.vinculo?.trim() || null,
      processo: data.processo?.trim() || null,
      cliente_id: data.clienteId || null,
      papel_no_caso: data.papelNoCaso || null,
    };

    const { data: salvo, error } = await supabase
      .from("nucleo_membros")
      .update(patch)
      .eq("id", data.membroId)
      .eq("organization_id", organization_id)
      .select("id,nome,vinculo,processo,cliente_id,papel_no_caso,nucleo_id,organization_id")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!salvo) throw new Error("Requerente não encontrado ou sem permissão de escrita.");

    for (const [campo, valor] of Object.entries(patch)) {
      if ((salvo as any)[campo] !== valor) {
        throw new Error(`O campo ${campo} não foi persistido. Nenhuma alteração foi confirmada.`);
      }
    }

    const { data: nucleo } = await supabase
      .from("nucleos_familiares")
      .select("case_id")
      .eq("id", salvo.nucleo_id)
      .maybeSingle();
    if (nucleo?.case_id) {
      await registrarTimelineCaso(supabase, {
        organizationId: salvo.organization_id,
        caseId: nucleo.case_id,
        eventType: "caso",
        title: "Requerente do núcleo familiar atualizado",
        summaryInternal: patch.nome,
        sourceEntityType: "nucleo_membros",
        sourceEntityId: data.membroId,
        userId: (context as any).userId as string,
      });
    }
    return salvo;
  });

/**
 * Adiciona um membro/requerente ao núcleo. Até 24/09/2026 só existia edição
 * de membro já cadastrado (ou criação via piloto) — a Proprietária não tinha
 * como incluir uma pessoa na família pela tela. Papel dentro do CHECK real
 * (`contratante_signatario`/`dependente`); vínculo à Pessoa Canônica é
 * opcional e só por escolha humana — nunca por correspondência de nome.
 */
export const adicionarMembroNucleo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: { nucleoId: string; nome: string; papel: string; vinculo?: string; clienteId?: string | null }) => {
      if (!UUID.test(data?.nucleoId ?? "")) throw new Error("Núcleo inválido.");
      if (!data.nome?.trim()) throw new Error("Informe o nome do membro.");
      if (!PAPEIS_GRAVAVEIS_MEMBRO.includes(data.papel as (typeof PAPEIS_GRAVAVEIS_MEMBRO)[number])) {
        throw new Error("Papel fora da lista aceita pelo banco (contratante/signatário ou dependente).");
      }
      if (data.clienteId && !UUID.test(data.clienteId)) throw new Error("Pessoa vinculada inválida.");
      return data;
    },
  )
  .handler(async ({ data, context }) => {
    const supabase = (context as any).supabase;
    const userId = (context as any).userId as string;
    const organization_id = await orgDoUsuario(supabase, userId);

    const { data: nucleo, error: erroNucleo } = await supabase
      .from("nucleos_familiares")
      .select("id,case_id")
      .eq("id", data.nucleoId)
      .eq("organization_id", organization_id)
      .is("archived_at", null)
      .maybeSingle();
    if (erroNucleo) throw new Error(erroNucleo.message);
    if (!nucleo) throw new Error("Núcleo não encontrado nesta organização.");

    const { data: membros } = await supabase
      .from("nucleo_membros")
      .select("nome,ordem")
      .eq("nucleo_id", data.nucleoId)
      .is("archived_at", null);
    const nome = data.nome.trim();
    if (((membros ?? []) as any[]).some((m) => String(m.nome).trim().toLowerCase() === nome.toLowerCase())) {
      throw new Error(`"${nome}" já é membro deste núcleo — edite o registro existente em vez de duplicar a pessoa.`);
    }
    const ordem = Math.max(0, ...((membros ?? []) as any[]).map((m) => Number(m.ordem) || 0)) + 1;

    const r = await inserirComVerificacao({
      supabase,
      tabela: "nucleo_membros",
      organizationId: organization_id,
      userId,
      payload: {
        nucleo_id: data.nucleoId,
        nome,
        papel: data.papel,
        vinculo: data.vinculo?.trim() || null,
        cliente_id: data.clienteId || null,
        ordem,
      },
    });

    if (nucleo.case_id) {
      await registrarTimelineCaso(supabase, {
        organizationId: organization_id,
        caseId: nucleo.case_id,
        eventType: "caso",
        title: "Membro adicionado ao núcleo familiar",
        summaryInternal: nome,
        sourceEntityType: "nucleo_membros",
        sourceEntityId: r.id,
        userId,
      });
    }
    return { id: r.id, salvoEm: r.salvoEm };
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
      await registrarTimelineCaso(supabase, {
        organizationId: caso.organization_id,
        caseId: caso.id,
        eventType: "caso",
        title: `Núcleo encaminhado à fila do Drive (${criado?.status ?? avaliacao.status})`,
        summaryInternal: avaliacao.motivos.join(" "),
        sourceEntityType: "drive_provisioning_queue",
        sourceEntityId: criado?.id as string,
        userId: (context as any).userId as string,
      });
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
    await registrarTimelineCaso(supabase, {
      organizationId: caso.organization_id,
      caseId: caso.id,
      eventType: "caso",
      title: `Núcleo saiu da fila do Drive: ${existente.status} → ${atualizado?.status ?? avaliacao.status}`,
      summaryInternal: avaliacao.motivos.join(" "),
      sourceEntityType: "drive_provisioning_queue",
      sourceEntityId: existente.id as string,
      userId: (context as any).userId as string,
    });
    return { status: (atualizado?.status ?? avaliacao.status) as StatusFilaDrive, motivos: avaliacao.motivos };
  });
