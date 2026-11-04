import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { semCache } from "@/lib/no-store";
import { prepararHtmlContratoCliente } from "@/lib/contrato-liberacao";

type Sb = { from: (t: string) => any };

/**
 * Libera no App Cliente (Documentos) a versão ATUAL e APROVADA do contrato,
 * como arquivo privado do caso. Só admin. Não aprova, não envia e-mail, não
 * assina, não cobra. Idempotente: a mesma versão nunca vira dois arquivos.
 */
export const liberarVersaoAprovadaNoApp = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { contract_id: string }) => data)
  .handler(async ({ context, data }) => {
    semCache();
    const supabase = context.supabase as unknown as Sb;
    const userId = context.userId as string;

    const { data: staff, error: eStaff } = await supabase
      .from("staff_access").select("organization_id,role,status")
      .eq("auth_user_id", userId).is("archived_at", null).maybeSingle();
    if (eStaff) throw new Error(eStaff.message);
    if (!staff || staff.status !== "active" || staff.role !== "admin")
      throw new Error("Somente admin libera o contrato aprovado no App Cliente.");
    const org = staff.organization_id as string;

    const { data: contrato, error: eC } = await supabase
      .from("contracts").select("id,case_id,client_id,current_version_id,status")
      .eq("organization_id", org).eq("id", data.contract_id).maybeSingle();
    if (eC) throw new Error(eC.message);
    if (!contrato?.case_id || !contrato.current_version_id) throw new Error("Contrato sem caso ou versão atual.");

    const { data: versao, error: eV } = await supabase
      .from("contract_versions").select("id,version_number,status,generated_content,rendered_file_hash")
      .eq("organization_id", org).eq("id", contrato.current_version_id).maybeSingle();
    if (eV) throw new Error(eV.message);
    if (!versao || versao.status !== "approved_for_send")
      throw new Error("A versão atual ainda não está aprovada para envio.");
    const html = (versao.generated_content as { html?: unknown } | null)?.html;
    if (typeof html !== "string" || !html.trim()) throw new Error("A versão aprovada não tem conteúdo gravado.");

    const caminho = `${org}/${contrato.case_id}/contratos/contrato-v${versao.version_number}-aprovado.html`;
    const { data: existente, error: eE } = await supabase
      .from("documents").select("id").eq("organization_id", org)
      .eq("storage_path", caminho).is("archived_at", null).maybeSingle();
    if (eE) throw new Error(eE.message);
    if (existente?.id) return { documentoId: existente.id as string, jaLiberado: true, versao: versao.version_number as number };

    let clientId = contrato.client_id as string | null;
    if (!clientId) {
      const { data: caso, error: eC } = await supabase
        .from("crm_casos").select("cliente_id").eq("id", contrato.case_id).maybeSingle();
      if (eC) throw new Error(`Não foi possível ler o caso do contrato: ${eC.message}`);
      clientId = (caso?.cliente_id as string | null) ?? null;
    }

    const conteudo = prepararHtmlContratoCliente(html, versao.version_number as number);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const up = await (supabaseAdmin as any).storage.from("documentos")
      .upload(caminho, new Blob([conteudo], { type: "text/html;charset=utf-8" }), {
        contentType: "text/html;charset=utf-8", upsert: true,
      });
    if (up.error) throw new Error(`Falha ao gravar o arquivo privado: ${up.error.message}`);

    const agora = new Date().toISOString();
    const nome = `Contrato-v${versao.version_number}-aprovado.html`;
    const { data: doc, error: eD } = await supabase.from("documents").insert({
      organization_id: org,
      case_id: contrato.case_id,
      client_id: clientId,
      titulo: `Contrato aprovado — versão ${versao.version_number}`,
      tipo: "contrato",
      categoria: "contrato",
      sensibilidade: "normal",
      visibilidade: "cliente_quando_liberado",
      origem: "interno",
      status: "liberado",
      storage_path: caminho,
      nome_arquivo: nome,
      mime_type: "text/html",
      tamanho_bytes: new TextEncoder().encode(conteudo).length,
      file_hash: versao.rendered_file_hash ?? null,
      liberado_cliente: true,
      liberado_em: agora,
      liberado_por: userId,
      entrega_cliente: true,
      entrega_versao: `v${versao.version_number}`,
      created_by: userId,
    }).select("id").maybeSingle();
    if (eD) throw new Error(`Falha ao registrar o arquivo no caso: ${eD.message}`);
    if (!doc?.id) throw new Error("NENHUMA_LINHA_AFETADA: arquivo não registrado.");

    const { error: eEv } = await supabase.from("contract_review_events").insert({
      organization_id: org, contract_id: contrato.id, contract_version_id: versao.id,
      event_type: "document_downloaded",
      metadata: { tipo_original: "liberado_no_app_cliente", document_id: doc.id },
    });
    if (eEv) throw new Error(`Arquivo liberado, mas o histórico falhou: ${eEv.message}`);

    return { documentoId: doc.id as string, jaLiberado: false, versao: versao.version_number as number };
  });
