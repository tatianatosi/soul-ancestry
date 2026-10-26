/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Documento do contrato renderizado NA HORA, a partir do dado atual.
 *
 * Decisão da Proprietária em 26/10/2026 (opção "b"), depois de medirmos o
 * impasse no contrato da Ana: a prévia foi regerada às 12:44:02 de 23/10 e o
 * parâmetro `contratante_documento` foi salvo às 12:44:37 — 35 segundos
 * depois. A regra `previaDefasada()` passou a recusar a prévia, e como PDF,
 * revisão e assinatura saíam exclusivamente da prévia congelada, o contrato
 * ficou trancado: editar um dado invalidava o documento, e o documento
 * invalidado bloqueava a conferência da própria edição.
 *
 * Aqui o documento passa a sair do dado atual, pelo MESMO renderizador que
 * monta a prévia (`montarDoRegistro`, leitura pura, sem escrita). A prévia
 * congelada continua existindo e continua sendo a fonte das versões
 * históricas — ela deixa de ser o único caminho para ler o contrato.
 *
 * O que NÃO muda: nada é gravado, congelado, assinado, enviado ou cobrado. O
 * documento sai marcado como rascunho de trabalho, porque é exatamente isso —
 * render ao vivo não é via assinada nem versão congelada.
 *
 * Isolamento entre famílias: o registro de parâmetros é resolvido sempre com
 * filtro de `organization_id` vindo da sessão autenticada, nunca do cliente.
 */
import { montarDoRegistro } from "@/lib/contrato-parametros.functions";
import type { IdentificacaoPdf } from "@/lib/contrato-pdf";

export type DocumentoAtual = { html: string; identificacao: IdentificacaoPdf };

export async function documentoAtualDoCaso(
  supabase: any,
  { caseId, organizationId }: { caseId: string; organizationId: string },
): Promise<DocumentoAtual> {
  const { data: registro, error } = await supabase
    .from("contract_case_parameters")
    .select("id,case_id")
    .eq("case_id", caseId)
    .eq("organization_id", organizationId)
    .is("archived_at", null)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!registro) {
    throw new Error(
      "Este caso ainda não tem matriz de parâmetros do contrato — abra a preparação do contrato antes de gerar o documento.",
    );
  }

  const { previa, registro: reg } = await montarDoRegistro(supabase, registro.id as string, "rascunho");
  if (!previa?.html) {
    throw new Error("O renderizador não produziu o corpo do contrato para este caso.");
  }

  const { data: caso } = await supabase
    .from("crm_casos")
    .select("codigo")
    .eq("id", (reg as any)?.case_id ?? caseId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  return {
    html: previa.html as string,
    identificacao: {
      caso: (caso?.codigo as string | undefined) ?? "caso",
      instrumento: "Contrato de Estudo Genealógico v2",
      versao: "documento atual",
      revisao: "gerado do dado atual",
      geradoEm: new Date().toLocaleString("pt-BR"),
      // Render ao vivo nunca se apresenta como versão congelada ou via assinada.
      rascunho: true,
    },
  };
}
