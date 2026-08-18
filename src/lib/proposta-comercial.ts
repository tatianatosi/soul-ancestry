/**
 * Leitura comercial de uma proposta aprovada, para pré-carga controlada do caso.
 *
 * Só extrai o que está explicitamente escrito no conteúdo estruturado da
 * proposta. Nada é inferido: se a aritmética não fecha (assinaturas × valor ×
 * meses = total) ou a informação não aparece, o campo simplesmente não é
 * pré-carregado e permanece pendente na ficha.
 *
 * Datas de vencimento NUNCA são derivadas daqui — dependem de condição formal
 * registrada no contrato ou no financeiro.
 */

/** Campos comerciais que a proposta aprovada pode pré-carregar. Lista fechada. */
export const CAMPOS_COMERCIAIS_PROPOSTA = ["valor_total", "forma_pagamento", "parcelas", "despesas_externas"] as const;

export type PropostaComercial = {
  id: string;
  versao: number | null;
  status: string | null;
  archived_at: string | null;
  valor: string | number | null;
  moeda?: string | null;
  forma_pagamento?: string | null;
  escopo?: string | null;
  exclusoes?: string | null;
};

export type CandidatoComercial = { campo: string; valor: string; detalhe: string };

/** Proposta apta a pré-carregar: vinculada, não arquivada, não substituída e aprovada. */
export function propostaAptaParaPrecarga(p?: PropostaComercial | null): boolean {
  if (!p) return false;
  if (p.archived_at) return false;
  return p.status === "aprovada" || p.status === "aceita";
}

function numero(txt: string): number | null {
  const limpo = txt.replace(/\./g, "").replace(",", ".");
  const n = Number(limpo);
  return Number.isFinite(n) ? n : null;
}

/**
 * Deriva os candidatos comerciais da proposta. Retorna lista vazia quando a
 * proposta não está apta ou quando o conteúdo não sustenta os valores.
 */
export function candidatosComerciaisDaProposta(p?: PropostaComercial | null): CandidatoComercial[] {
  if (!propostaAptaParaPrecarga(p)) return [];
  const prop = p as PropostaComercial;
  const ref = `Proposta ${prop.id} v${prop.versao ?? 1} (aprovada)`;
  const texto = [prop.forma_pagamento, prop.escopo, prop.exclusoes].filter(Boolean).join("\n");
  const out: CandidatoComercial[] = [];

  const total = typeof prop.valor === "number" ? prop.valor : numero(String(prop.valor ?? ""));
  if (total && total > 0) {
    out.push({ campo: "valor_total", valor: String(Math.round(total * 100) / 100).replace(/\.00$/, ""), detalhe: `${ref} — valor total aprovado` });
  }

  const mAssin = texto.match(/(\d+)\s*assinaturas?\s+mensa/i);
  const mValor = texto.match(/de\s*R?\$?\s*([\d.,]+)\s*por\s+respons[áa]vel/i);
  const mMeses = texto.match(/durante\s+(\d+)\s*(?:meses|m[êe]s)/i);

  if (/assinaturas?\s+mensa/i.test(texto)) {
    out.push({ campo: "forma_pagamento", valor: "assinatura_mensal", detalhe: `${ref} — forma de pagamento declarada` });
  }

  if (mAssin && mValor && mMeses) {
    const assinaturas = Number(mAssin[1]);
    const porAssinatura = numero(mValor[1]);
    const meses = Number(mMeses[1]);
    const fecha = porAssinatura !== null && total !== null && Math.abs(assinaturas * porAssinatura * meses - total) < 0.01;
    if (fecha) {
      const mensalTotal = assinaturas * (porAssinatura as number);
      out.push({
        campo: "parcelas",
        valor: `${assinaturas} assinaturas mensais de ${porAssinatura} por responsável, durante ${meses} meses (total mensal ${mensalTotal})`,
        detalhe: `${ref} — ${assinaturas} × ${porAssinatura} × ${meses} = ${total}`,
      });
    }
  }

  if (/despesas?[^.\n]{0,120}(pagas?\s+diretamente\s+pelo\s+cliente|cliente\s+paga\s+diretamente)/i.test(texto)) {
    out.push({ campo: "despesas_externas", valor: "paga_direto", detalhe: `${ref} — despesas de terceiros pagas diretamente pelo cliente` });
  }

  return out.filter((c) => (CAMPOS_COMERCIAIS_PROPOSTA as readonly string[]).includes(c.campo));
}
