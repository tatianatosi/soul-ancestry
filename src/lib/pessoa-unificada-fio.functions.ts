import { semCache } from "@/lib/no-store";
import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { contextoRg, pesquisaAutorizada, exigirEdicao, type Sb } from "@/lib/pesquisa-modulo.server";
import { gravarComVerificacao } from "@/lib/persistencia.server";
import { registrarTimelineCaso } from "@/lib/timeline-operacional.server";
import {
  ELOS_DO_FIO,
  eloSeAplica,
  elosMecanicos,
  filaDeResolucao,
  resumoDoFio,
  saudeDoFio,
  type EloMedido,
  type PessoaDoFio,
} from "@/lib/pessoa-unificada-fio";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Mede o fio da Pessoa Unificada no caso, e religa SÓ o elo mecânico.
 *
 * O leitor existe porque a pergunta "a mesma pessoa atravessa a jornada?" não
 * tinha onde ser respondida: cada tela via o seu pedaço. Pesquisa é o centro
 * de inteligência operacional, então é aqui que o fio se verifica de ponta a
 * ponta — Lead até App Cliente.
 *
 * O escritor religa um elo só: `research_people.genealogical_person_profile_id`,
 * copiado de `genealogical_person_profiles.research_person_id`, que já existe e
 * foi registrado por decisão humana. Não é inferência: é o mesmo vínculo
 * escrito no sentido que faltava. Qualquer elo de identidade — dizer que a
 * pessoa de pesquisa é a pessoa canônica — fica fora deste escritor por
 * desenho, e o leitor devolve a rota onde a equipe decide.
 */

type Linha = Record<string, any>;

function medir(
  pessoa: Linha,
  presenca: Record<string, boolean>,
  limites: Record<string, string> = {},
): PessoaDoFio {
  const personStatus = String(pessoa["person_status"] ?? "unknown_person");
  const elos: EloMedido[] = ELOS_DO_FIO.map((def) => {
    if (!eloSeAplica(def, personStatus)) {
      return {
        chave: def.chave,
        estado: "nao_se_aplica" as const,
        motivo:
          "Pessoa histórica da pesquisa: não tem pessoa canônica, membro de caso nem parte no contrato — e isso não é lacuna.",
      };
    }
    if (presenca[def.chave]) return { chave: def.chave, estado: "segura" as const };
    // Limite do modelo não é trabalho esquecido: diz por que não cabe.
    if (limites[def.chave]) {
      return { chave: def.chave, estado: "limite_estrutural" as const, motivo: limites[def.chave] };
    }
    return { chave: def.chave, estado: "aberto" as const };
  });
  return {
    id: String(pessoa["id"]),
    nome: String(pessoa["preferred_display_name"] || pessoa["canonical_name"] || "—"),
    personStatus,
    elos,
  };
}

export const medirFioDaPessoaUnificada = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { researchCaseId: string }) => {
    if (!data?.researchCaseId) throw new Error("Informe a pesquisa do caso.");
    return data;
  })
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = context.supabase as unknown as Sb;
    const userId = context.userId as string;
    const { organizationId, papel } = await contextoRg(supabase, userId);
    const { pesquisa } = await pesquisaAutorizada(supabase, organizationId, papel, userId, data.researchCaseId);
    const caseId = (pesquisa as Linha)?.["case_id"] as string | null;

    const [pessoas, perfis, caso, membros, nucleoMembros, evidencias, vinculos, achados, partes, projecoes] =
      await Promise.all([
        supabase
          .from("research_people")
          .select("id,canonical_name,preferred_display_name,person_status,family_member_id,genealogical_person_profile_id,geracao")
          .eq("organization_id", organizationId)
          .eq("research_case_id", data.researchCaseId)
          .is("archived_at", null),
        supabase
          .from("genealogical_person_profiles")
          .select("id,research_person_id,client_id")
          .eq("organization_id", organizationId)
          .eq("case_id", caseId ?? "00000000-0000-0000-0000-000000000000")
          .is("archived_at", null),
        caseId
          ? supabase
              .from("crm_casos")
              .select("id,cliente_id,lead_id")
              .eq("organization_id", organizationId)
              .eq("id", caseId)
              .maybeSingle()
          : Promise.resolve({ data: null } as any),
        supabase
          .from("case_members")
          .select("id,cliente_id")
          .eq("organization_id", organizationId)
          .eq("case_id", caseId ?? "00000000-0000-0000-0000-000000000000")
          .is("archived_at", null),
        supabase
          .from("nucleo_membros")
          .select("id,cliente_id,nucleo_id")
          .eq("organization_id", organizationId),
        supabase
          .from("research_evidence_items")
          .select("id,person_id")
          .eq("organization_id", organizationId)
          .eq("research_case_id", data.researchCaseId)
          .is("archived_at", null),
        supabase
          .from("research_evidence_links")
          .select("entity_type,entity_id")
          .eq("organization_id", organizationId)
          .eq("entity_type", "person")
          .is("archived_at", null),
        supabase
          .from("genealogical_findings")
          .select("id,primary_research_person_id")
          .eq("organization_id", organizationId)
          .eq("case_id", caseId ?? "00000000-0000-0000-0000-000000000000")
          .is("archived_at", null),
        supabase
          .from("contract_parties")
          .select("id,client_id,contract_id")
          .eq("organization_id", organizationId),
        supabase
          .from("app_projections")
          .select("id,pessoa_id")
          .eq("organization_id", organizationId)
          .eq("case_id", caseId ?? "00000000-0000-0000-0000-000000000000"),
      ]);

    const listaPessoas = (pessoas.data ?? []) as Linha[];
    const listaPerfis = (perfis.data ?? []) as Linha[];

    // Índices por pessoa de pesquisa.
    const perfilPorPesquisa = new Map<string, Linha>();
    for (const p of listaPerfis) {
      if (p["research_person_id"]) perfilPorPesquisa.set(String(p["research_person_id"]), p);
    }
    const membroPorId = new Map<string, Linha>();
    for (const m of (membros.data ?? []) as Linha[]) membroPorId.set(String(m["id"]), m);

    const clientesComMembro = new Set(
      ((membros.data ?? []) as Linha[]).map((m) => String(m["cliente_id"] ?? "")).filter(Boolean),
    );
    const clientesComNucleo = new Set(
      ((nucleoMembros.data ?? []) as Linha[]).map((m) => String(m["cliente_id"] ?? "")).filter(Boolean),
    );
    const clientesComParte = new Set(
      ((partes.data ?? []) as Linha[]).map((p) => String(p["client_id"] ?? "")).filter(Boolean),
    );
    const pessoasComEvidencia = new Set(
      ((evidencias.data ?? []) as Linha[]).map((e) => String(e["person_id"] ?? "")).filter(Boolean),
    );
    for (const v of (vinculos.data ?? []) as Linha[]) pessoasComEvidencia.add(String(v["entity_id"] ?? ""));
    const pessoasComAchado = new Set(
      ((achados.data ?? []) as Linha[]).map((a) => String(a["primary_research_person_id"] ?? "")).filter(Boolean),
    );
    const pessoasComProjecao = new Set(
      ((projecoes.data ?? []) as Linha[]).map((p) => String(p["pessoa_id"] ?? "")).filter(Boolean),
    );

    const c = (caso as any)?.data as Linha | null;

    const membrosPorClienteLeitura = new Map<string, number>();
    for (const m of (membros.data ?? []) as Linha[]) {
      const cm = m["cliente_id"] ? String(m["cliente_id"]) : null;
      if (!cm) continue;
      membrosPorClienteLeitura.set(cm, (membrosPorClienteLeitura.get(cm) ?? 0) + 1);
    }

    const medidas = listaPessoas.map((pessoa) => {
      const id = String(pessoa["id"]);
      const perfil = perfilPorPesquisa.get(id) ?? null;
      const clienteVinculado = perfil?.["client_id"] ? String(perfil["client_id"]) : null;
      const membro = pessoa["family_member_id"] ? membroPorId.get(String(pessoa["family_member_id"])) : null;
      const clienteDoMembro = membro?.["cliente_id"] ? String(membro["cliente_id"]) : null;
      const cliente = clienteVinculado ?? clienteDoMembro;

      /*
       * A árvore do App é um modelo de cinco gerações: o CHECK
       * `app_proj_geracao_cliente_ck` só aceita 1 a 5. Ascendente medido em
       * geração 6 ou 7 não cabe — e chamar isso de "aberto" cobraria da equipe
       * uma decisão de produto que não é dela.
       */
      const geracao = Number.parseInt(String(pessoa["geracao"] ?? ""), 10);
      const limites: Record<string, string> = {};
      /*
       * Ampliado de 5 para 10 gerações em 05/10/2026: decisão explícita da
       * Proprietária ("expandir a árvore até a 10a geração"), depois de medir
       * ascendentes documentados em geração 6 e 7 que o modelo anterior não
       * comportava. Migration 20261005160000 ampliou o CHECK no mesmo sentido.
       */
      if (Number.isFinite(geracao) && (geracao < 1 || geracao > 10)) {
        limites["pessoa_para_app"] =
          `Geração ${geracao}: a árvore do App comporta 1 a 10 gerações (CHECK app_proj_geracao_cliente_ck). Estender além disso é nova decisão de produto.`;
      }
      /*
       * `research_people.family_member_id` é FK de `case_members`. Quando a
       * pessoa já está vinculada a uma pessoa cadastrada e o caso NÃO tem
       * membro ativo para ela, o elo não fecha por nenhum caminho: a
       * composição dela vive no núcleo, por decisão de reconciliação
       * registrada (membros duplicados na ficha do caso foram arquivados).
       * Chamar isso de "aberto" faria a tela pedir à equipe algo impossível —
       * e a propagação automática falharia calada.
       */
      if (clienteVinculado && (membrosPorClienteLeitura.get(clienteVinculado) ?? 0) === 0) {
        limites["pesquisa_para_membro"] =
          "Esta pessoa não tem membro ativo na ficha do caso: a composição dela vive no núcleo, por decisão de reconciliação registrada. A coluna é FK de case_members, então o elo só fecha restaurando o membro ou estendendo a referência — decisão de dado, não de operação.";
      }

      return medir(pessoa, {
        // Elos de caso: valem para o caso, logo iguais para todas as pessoas dele.
        lead_para_cliente: cliente !== null && clientesComMembro.has(cliente) && Boolean(c?.["lead_id"]),
        lead_para_caso: Boolean(c?.["lead_id"]),
        cliente_para_caso: Boolean(c?.["cliente_id"]),
        // Elos por pessoa.
        caso_para_membro: Boolean(clienteDoMembro) || (cliente !== null && clientesComMembro.has(cliente)),
        caso_para_nucleo: cliente !== null && clientesComNucleo.has(cliente),
        perfil_para_cliente: Boolean(clienteVinculado),
        pesquisa_para_perfil: Boolean(pessoa["genealogical_person_profile_id"]),
        pesquisa_para_membro: Boolean(pessoa["family_member_id"]),
        evidencia_para_pessoa: pessoasComEvidencia.has(id),
        achado_para_pessoa: pessoasComAchado.has(id),
        cliente_para_contrato: cliente !== null && clientesComParte.has(cliente),
        pessoa_para_app: pessoasComProjecao.has(id),
      }, limites);
    });

    const saude = saudeDoFio(medidas);

    /*
     * Quantos elos mecânicos poderiam ser religados agora: pessoa de pesquisa
     * com perfil apontando para ela e sem o ponteiro de volta. Nenhuma
     * inferência — é o mesmo vínculo, no sentido que falta.
     */
    const religaveis = listaPessoas.filter((p) => {
      const perfil = perfilPorPesquisa.get(String(p["id"]));
      if (!perfil) return false;
      // Elo 1: ponteiro de volta ainda em falta.
      if (!p["genealogical_person_profile_id"]) return true;
      // Elo 2: composição única disponível e membro ainda não ligado.
      const cliente = perfil["client_id"] ? String(perfil["client_id"]) : null;
      return Boolean(cliente) && !p["family_member_id"] && membrosPorClienteLeitura.get(cliente!) === 1;
    }).length;

    return {
      researchCaseId: data.researchCaseId,
      caseId,
      pessoas: medidas,
      saude,
      resumo: resumoDoFio(saude),
      fila: filaDeResolucao(medidas),
      religaveis,
      elosMecanicos: elosMecanicos().map((e) => e.chave),
    };
  });

export const religarElosMecanicosDoFio = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { researchCaseId: string; motivo: string }) => {
    if (!data?.researchCaseId) throw new Error("Informe a pesquisa do caso.");
    if (!data.motivo || data.motivo.trim().length < 5) {
      throw new Error("Informe o motivo do religamento (mínimo de 5 caracteres).");
    }
    return { researchCaseId: data.researchCaseId, motivo: data.motivo.trim() };
  })
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const userId = context.userId as string;
    const { organizationId, papel } = await contextoRg(supabase, userId);
    const { podeEditar, pesquisa } = await pesquisaAutorizada(
      supabase,
      organizationId,
      papel,
      userId,
      data.researchCaseId,
    );
    exigirEdicao(podeEditar);
    const caseId = (pesquisa as Linha)?.["case_id"] as string | null;

    const [{ data: pessoas }, { data: perfis }, { data: membros }] = await Promise.all([
      supabase
        .from("research_people")
        .select("id,canonical_name,genealogical_person_profile_id,family_member_id")
        .eq("organization_id", organizationId)
        .eq("research_case_id", data.researchCaseId)
        .is("archived_at", null),
      supabase
        .from("genealogical_person_profiles")
        .select("id,research_person_id,client_id")
        .eq("organization_id", organizationId)
        .eq("case_id", caseId ?? "00000000-0000-0000-0000-000000000000")
        .is("archived_at", null),
      supabase
        .from("case_members")
        .select("id,cliente_id")
        .eq("organization_id", organizationId)
        .eq("case_id", caseId ?? "00000000-0000-0000-0000-000000000000"),
    ]);

    const perfilPorPesquisa = new Map<string, Linha>();
    for (const p of (perfis ?? []) as Linha[]) {
      if (p["research_person_id"]) perfilPorPesquisa.set(String(p["research_person_id"]), p);
    }
    const membrosPorCliente = new Map<string, string[]>();
    for (const m of (membros ?? []) as Linha[]) {
      const c = m["cliente_id"] ? String(m["cliente_id"]) : null;
      if (!c) continue;
      membrosPorCliente.set(c, [...(membrosPorCliente.get(c) ?? []), String(m["id"])]);
    }

    const religados: string[] = [];
    const membrosLigados: string[] = [];
    const ambiguos: string[] = [];
    for (const pessoa of (pessoas ?? []) as Linha[]) {
      const id = String(pessoa["id"]);
      const perfil = perfilPorPesquisa.get(id);
      const payload: Record<string, unknown> = {};

      // Elo 1 — ponteiro de volta: copia o vínculo que já existe.
      // Nunca sobrescreve ponteiro gravado, nem inventa quando não há perfil.
      if (perfil && !pessoa["genealogical_person_profile_id"]) {
        payload["genealogical_person_profile_id"] = String(perfil["id"]);
      }

      /*
       * Elo 2 — composição de duas decisões humanas já registradas: o perfil
       * diz que esta pessoa de pesquisa é a pessoa canônica X, e `case_members`
       * diz que X é membro deste caso. Logo o membro desta pessoa é derivável.
       * Não é inferência por nome: ambos os lados foram decididos por alguém e
       * estão auditados. Com zero ou mais de um membro para a mesma pessoa
       * canônica, não se grava nada — ambiguidade é declarada, não resolvida
       * por conta própria.
       */
      const clienteDoPerfil = perfil?.["client_id"] ? String(perfil["client_id"]) : null;
      if (clienteDoPerfil && !pessoa["family_member_id"]) {
        const candidatos = membrosPorCliente.get(clienteDoPerfil) ?? [];
        if (candidatos.length === 1) {
          payload["family_member_id"] = candidatos[0];
          membrosLigados.push(String(pessoa["canonical_name"] ?? id));
        } else if (candidatos.length > 1) {
          ambiguos.push(
            `${String(pessoa["canonical_name"] ?? id)}: ${candidatos.length} membros do caso para a mesma pessoa cadastrada`,
          );
        }
      }

      if (Object.keys(payload).length === 0) continue;
      await gravarComVerificacao({
        supabase: supabase as never,
        tabela: "research_people",
        id,
        organizationId,
        userId,
        payload,
      });
      religados.push(String(pessoa["canonical_name"] ?? id));
    }

    await supabase.from("audit_logs").insert({
      organization_id: organizationId,
      user_id: userId,
      acao: "elos_mecanicos_do_fio_religados",
      entidade: "research_people",
      entidade_id: data.researchCaseId,
      valores_posteriores: {
        religados,
        quantidade: religados.length,
        membrosLigados,
        ambiguosNaoGravados: ambiguos,
      },
      metadados: {
        motivo: data.motivo,
        regra:
          "Dois elos mecânicos. (1) genealogical_person_profile_id copiado de genealogical_person_profiles.research_person_id. (2) family_member_id derivado da composição de duas decisões humanas registradas: o perfil diz qual é a pessoa canônica e case_members diz qual é o membro dela neste caso. Composição ambígua não é gravada. Nenhuma identidade foi inferida por nome, endereço, profissão ou filiação.",
        nao_tocado:
          "Elos de identidade (perfil→cliente, evidência→pessoa, achado→pessoa, pessoa→App) ficam para a equipe decidir na tela que o leitor aponta.",
      },
    });

    if (caseId && religados.length > 0) {
      await registrarTimelineCaso(supabase as never, {
        organizationId,
        caseId,
        eventType: "caso",
        title: "Fio da Pessoa Unificada: elos mecânicos religados",
        summaryInternal: `${religados.length} pessoa(s) de pesquisa passaram a apontar para o perfil genealógico que já apontava para elas. Motivo: ${data.motivo}`,
        sourceEntityType: "research_people",
        sourceEntityId: data.researchCaseId,
        userId,
      });
    }

    return { religados, quantidade: religados.length, membrosLigados, ambiguos };
  });
