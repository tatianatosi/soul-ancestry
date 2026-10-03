/**
 * Conteúdo salvo de um anexo contratual — o que de fato está sendo aprovado.
 *
 * Achado de 03/10/2026 (Proprietária: "os anexos não estão lá vivos, não
 * consegue se ver o que está sendo aprovado"): as 19 instâncias de
 * `contract_annexes` do caso da Ana tinham `rendered_html` com apenas três
 * linhas (código, título, finalidade, regra) — os campos realmente levados ao
 * instrumento viviam só em `structured_data`, e nenhuma tela lia isso. O chip
 * "drafting" aparecia sem rótulo humano e sem ação seguinte.
 *
 * Este módulo é puro e somente-leitura: traduz o que está gravado, nunca
 * inventa campo, valor, versão ou estado. Nada aqui assina, envia ou cobra.
 */

export type StatusAnexoSalvo =
  | "missing"
  | "drafting"
  | "ready_for_review"
  | "approved"
  | "attached"
  | "signed_with_contract"
  | "not_applicable"
  | "archived";

export const STATUS_ANEXO_SALVO: StatusAnexoSalvo[] = [
  "missing",
  "drafting",
  "ready_for_review",
  "approved",
  "attached",
  "signed_with_contract",
  "not_applicable",
  "archived",
];

/** Rótulo humano do domínio real de `contract_annexes.status`. */
export const ROTULO_STATUS_ANEXO_SALVO: Record<StatusAnexoSalvo, string> = {
  missing: "Falta conteúdo",
  drafting: "Em preparação",
  ready_for_review: "Pronto para revisão",
  approved: "Aprovado",
  attached: "Anexado ao instrumento",
  signed_with_contract: "Assinado com o contrato",
  not_applicable: "Não aplicável",
  archived: "Arquivado",
};

/**
 * Ação humana seguinte por estado salvo. Nenhum estado fica como selo inerte:
 * "Não usar chips 'drafting' sem função" (diretriz da Proprietária, 03/10).
 */
export const ACAO_SEGUINTE_ANEXO: Record<StatusAnexoSalvo, string> = {
  missing: "Preencher os campos pendentes na ficha do caso e materializar de novo.",
  drafting: "Revisar o conteúdo salvo e encaminhar para revisão humana.",
  ready_for_review: "Revisar e aprovar o conteúdo, ou devolver com motivo.",
  approved: "Anexar ao instrumento na preparação do contrato.",
  attached: "Nenhuma ação: segue o contrato até a assinatura.",
  signed_with_contract: "Nenhuma ação: instância congelada pela assinatura.",
  not_applicable: "Nenhuma ação, ou reativar a regra se a dispensa não valer mais.",
  archived: "Nenhuma ação: versão histórica preservada.",
};

export function rotuloStatusAnexoSalvo(status: string | null | undefined): string {
  if (!status) return "Sem instância salva";
  return ROTULO_STATUS_ANEXO_SALVO[status as StatusAnexoSalvo] ?? status;
}

export function acaoSeguinteAnexo(status: string | null | undefined): string | null {
  if (!status) return "Materializar a instância do caso para que exista conteúdo salvo.";
  return ACAO_SEGUINTE_ANEXO[status as StatusAnexoSalvo] ?? null;
}

export type CampoAnexoSalvo = {
  rotulo: string;
  fonte: string | null;
  valor: string | null;
  observacaoAusencia: string | null;
};

export type ConteudoAnexoSalvo = {
  natureza: "governado" | "interno" | null;
  finalidade: string | null;
  motivo: string | null;
  campos: CampoAnexoSalvo[];
  pendencias: string[];
  impactoAusencia: string | null;
  /** Dispensa manual registrada por decisão humana. */
  overrideManual: boolean;
};

function texto(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length ? t : null;
}

function listaDeTexto(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((x) => texto(x)).filter((x): x is string => x !== null);
}

/**
 * Lê o conteúdo gravado em `contract_annexes.structured_data`.
 * Devolve `null` quando não há nada legível — estado vazio é declarado, nunca
 * preenchido com texto genérico.
 */
export function conteudoDoAnexoSalvo(structuredData: unknown): ConteudoAnexoSalvo | null {
  if (!structuredData || typeof structuredData !== "object" || Array.isArray(structuredData)) return null;
  const d = structuredData as Record<string, unknown>;

  const campos: CampoAnexoSalvo[] = Array.isArray(d.campos)
    ? (d.campos as unknown[])
        .filter((c): c is Record<string, unknown> => Boolean(c) && typeof c === "object" && !Array.isArray(c))
        .map((c) => ({
          rotulo: texto(c.rotulo) ?? "(campo sem rótulo)",
          fonte: texto(c.fonte),
          valor: texto(c.valor),
          observacaoAusencia: texto(c.observacaoAusencia),
        }))
    : [];

  const naturezaCrua = texto(d.natureza);
  const conteudo: ConteudoAnexoSalvo = {
    natureza: naturezaCrua === "interno" ? "interno" : naturezaCrua === "governado" ? "governado" : null,
    finalidade: texto(d.finalidade),
    motivo: texto(d.motivo),
    campos,
    pendencias: listaDeTexto(d.pendencias),
    impactoAusencia: texto(d.impactoAusencia),
    overrideManual: d.overrideManual === true,
  };

  const vazio =
    !conteudo.finalidade &&
    !conteudo.motivo &&
    !conteudo.impactoAusencia &&
    !conteudo.campos.length &&
    !conteudo.pendencias.length &&
    !conteudo.overrideManual;
  return vazio ? null : conteudo;
}

/** Escapa texto do caso antes de entrar no HTML salvo da instância. */
export function escaparHtml(v: string): string {
  return v
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Corpo renderizado da instância salva: inclui os CAMPOS que o anexo leva ao
 * instrumento, com fonte e pendência explícita — e não só título/finalidade.
 * Campo sem valor nunca recebe valor fictício: entra como pendência nomeada.
 */
export function corpoRenderizadoDoAnexo(a: {
  codigo: string;
  titulo: string;
  finalidade?: string | null;
  regra?: string | null;
  motivo?: string | null;
  campos?: { rotulo: string; valor: string | null; fonte?: string | null; observacaoAusencia?: string | null }[];
  pendencias?: string[];
  impactoAusencia?: string | null;
}): string {
  const partes: string[] = [`<h3>${escaparHtml(a.codigo)} — ${escaparHtml(a.titulo)}</h3>`];
  if (texto(a.finalidade)) partes.push(`<p>${escaparHtml(a.finalidade as string)}</p>`);
  if (texto(a.regra)) partes.push(`<p><strong>Regra de aplicabilidade:</strong> ${escaparHtml(a.regra as string)}</p>`);
  if (texto(a.motivo)) partes.push(`<p><strong>Motivo da seleção:</strong> ${escaparHtml(a.motivo as string)}</p>`);

  const campos = a.campos ?? [];
  if (campos.length) {
    const linhas = campos
      .map((c) => {
        const valor = texto(c.valor);
        const conteudo = valor
          ? escaparHtml(valor)
          : `<em>${escaparHtml(texto(c.observacaoAusencia) ?? "Pendente — não inferido.")}</em>`;
        const fonte = texto(c.fonte) ? `<td>${escaparHtml(c.fonte as string)}</td>` : "<td>—</td>";
        return `<tr><th scope="row">${escaparHtml(c.rotulo)}</th><td>${conteudo}</td>${fonte}</tr>`;
      })
      .join("");
    partes.push(
      `<table><caption>Campos do anexo</caption><thead><tr><th scope="col">Campo</th><th scope="col">Conteúdo</th><th scope="col">Fonte</th></tr></thead><tbody>${linhas}</tbody></table>`,
    );
  }

  const pendencias = (a.pendencias ?? []).map((p) => texto(p)).filter((p): p is string => p !== null);
  if (pendencias.length) {
    partes.push(
      `<p><strong>Pendências:</strong></p><ul>${pendencias.map((p) => `<li>${escaparHtml(p)}</li>`).join("")}</ul>`,
    );
  }
  if (texto(a.impactoAusencia))
    partes.push(`<p><strong>Impacto da ausência:</strong> ${escaparHtml(a.impactoAusencia as string)}</p>`);

  return partes.join("");
}
