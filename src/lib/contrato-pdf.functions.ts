/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Baixar PDF do contrato — corte urgente PP-03/PDF (07/10/2026).
 *
 * Lê exatamente o `html` já persistido em `contract_parameter_previews`
 * (mesma fonte da prévia da tela, nunca texto novo), gera um PDF real
 * (binário, jsPDF) e devolve em base64 para o botão do Desk baixar como
 * arquivo. Nunca grava, nunca assina, nunca envia, nunca altera a prévia.
 *
 * Isolamento entre famílias: a leitura é sempre filtrada por
 * `organization_id` resolvido da sessão autenticada — nunca aceita a
 * organização vinda do cliente.
 */
import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { organizacaoDo } from "@/lib/caso-canonico.server";
import { semCache } from "@/lib/no-store";
import { htmlParaBlocos, nomeArquivoPdf } from "@/lib/contrato-pdf";
import { gerarPdfContrato } from "@/lib/contrato-pdf-gerador";
import { motivoBloqueioSaida } from "@/lib/previa-vigente";

function paraBase64(bytes: Uint8Array): string {
  let binario = "";
  for (let i = 0; i < bytes.length; i++) binario += String.fromCharCode(bytes[i]!);
  // btoa é Web API padrão — disponível tanto no navegador quanto no runtime de borda (Workers).
  return btoa(binario);
}

export const baixarPdfContrato = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { previaId: string }) => {
    if (!data?.previaId) throw new Error("Prévia não informada.");
    return data;
  })
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase, context.userId as string);

    const { data: previa, error } = await supabase
      .from("contract_parameter_previews")
      .select("id,versao,tipo,estado,html,congelado_em,created_at,updated_at,parameters_id,corpo_contratual,legado_sem_corpo")
      .eq("id", data.previaId)
      .eq("organization_id", organizationId)
      .is("archived_at", null)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!previa) throw new Error("Prévia não encontrada nesta organização.");
    if (!previa.html) throw new Error("Esta prévia ainda não tem conteúdo gerado — gere a prévia antes de baixar o PDF.");

    /*
     * 08/10/2026 — a tela avisa, o servidor recusa. Medido no caso da Ana:
     * seis prévias congeladas nasceram SEM corpo contratual, e o botão de PDF
     * aceitava qualquer uma delas: saía um "contrato" sem o contrato dentro.
     * Defasagem idem — documento não pode ser mais novo que o dado que o
     * originou.
     */
    const { data: ultimoValor } = await supabase
      .from("contract_parameter_values")
      .select("atualizado_em")
      .eq("parameters_id", previa.parameters_id)
      /*
       * 09/10/2026: só parâmetro COM valor conta para defasagem. Semear uma
       * linha nova e vazia (foi o que a migration de `modo_anexos` fez em
       * 08/10) não mudou o documento — não pode marcar a prévia como velha
       * nem travar o PDF.
       */
      .not("valor", "is", null)
      .is("archived_at", null)
      .order("atualizado_em", { ascending: false })
      .limit(1)
      .maybeSingle();
    const bloqueio = motivoBloqueioSaida(previa, ultimoValor?.atualizado_em ?? null);
    if (bloqueio) throw new Error(bloqueio);

    const { data: parametros } = await supabase
      .from("contract_case_parameters")
      .select("case_id")
      .eq("id", previa.parameters_id)
      .eq("organization_id", organizationId)
      .maybeSingle();
    const { data: caso } = parametros?.case_id
      ? await supabase.from("crm_casos").select("codigo").eq("id", parametros.case_id).eq("organization_id", organizationId).maybeSingle()
      : { data: null };

    const rascunho = previa.estado === "rascunho_editavel" || !previa.congelado_em;
    const identificacao = {
      caso: (caso?.codigo as string | undefined) ?? "caso",
      instrumento: "Contrato de Estudo Genealógico v2",
      versao: rascunho ? `rascunho de trabalho (v${previa.versao})` : `versão v${previa.versao} (congelada)`,
      revisao: previa.tipo === "final" ? "prévia final" : "rascunho",
      geradoEm: new Date().toLocaleString("pt-BR"),
      rascunho,
    };

    const blocos = htmlParaBlocos(previa.html as string);
    const bytes = gerarPdfContrato(blocos, identificacao);

    return {
      nomeArquivo: nomeArquivoPdf(identificacao),
      base64: paraBase64(bytes),
    };
  });
