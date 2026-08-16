/**
 * Helpers server-only do motor contratual parametrizável.
 * A prévia é montada exclusivamente a partir dos parâmetros do registro mestre.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

export const SELO_RASCUNHO_PARAM = "PRÉVIA DE RASCUNHO — GERADA DOS PARÂMETROS — NÃO ENVIAR";
export const SELO_FINAL_PARAM = "VERSÃO FINAL PARAMETRIZADA — REVISÃO HUMANA REGISTRADA";

export const GRUPOS: { chave: string; titulo: string }[] = [
  { chave: "partes", titulo: "Partes e qualificação" },
  { chave: "membros", titulo: "Membros, beneficiários e vínculos" },
  { chave: "objeto", titulo: "Objeto, produto/SKU, país e rota" },
  { chave: "servicos", titulo: "Serviços, fases, entregas e anexos" },
  { chave: "comerciais", titulo: "Condições comerciais e exceções" },
  { chave: "assinatura", titulo: "Assinatura, revisão e auditoria" },
];

export const ORIGENS_PARAM = [
  "crm",
  "proposta",
  "formulario",
  "whatsapp",
  "transcricao",
  "documento",
  "preenchimento_humano",
  "calculo_aprovado",
] as const;
export type OrigemParam = (typeof ORIGENS_PARAM)[number];

const CONFIANCA: Record<string, number> = {
  documento: 5,
  crm: 4,
  proposta: 4,
  preenchimento_humano: 4,
  calculo_aprovado: 4,
  formulario: 3,
  whatsapp: 2,
  transcricao: 1,
};

export function confianca(origem?: string | null) {
  return CONFIANCA[origem ?? ""] ?? 0;
}

export const PLACEHOLDER_PARAM = /(\[ex\.|lorem ipsum|preencher|placeholder|xxxx|a definir|tbd|<[^>]*>)/i;

/** Anexos exigidos pela regra de produto/escopo — nunca escolhidos manualmente. */
export function anexosPorRegra(input: { produto?: string | null; pais?: string | null; membros?: string | null }) {
  const anexos: { codigo: string; titulo: string; motivo: string }[] = [
    { codigo: "ANX-ESCOPO", titulo: "Anexo de escopo e entregas", motivo: "Obrigatório em todo MODELO ESTUDO" },
    { codigo: "ANX-PRIVACIDADE", titulo: "Anexo de privacidade e tratamento de dados", motivo: "Obrigatório em todo MODELO ESTUDO" },
    { codigo: "ANX-COMERCIAL", titulo: "Anexo de condições comerciais", motivo: "Há condições comerciais parametrizadas" },
  ];
  const produto = (input.produto ?? "").toLowerCase();
  const pais = (input.pais ?? "").toLowerCase();
  if (produto.includes("estudo")) {
    anexos.push({ codigo: "ANX-ESTUDO", titulo: "Anexo de estudo de viabilidade documental", motivo: "Produto do tipo estudo" });
  }
  if (pais.includes("ital")) {
    anexos.push({ codigo: "ANX-IT", titulo: "Anexo de rota italiana", motivo: "País/rota declarada: Itália" });
  }
  if (pais.includes("portug")) {
    anexos.push({ codigo: "ANX-PT", titulo: "Anexo de rota portuguesa", motivo: "País/rota declarada: Portugal" });
  }
  if ((input.membros ?? "").trim()) {
    anexos.push({ codigo: "ANX-MEMBROS", titulo: "Anexo de membros e beneficiários", motivo: "Há beneficiários parametrizados" });
  }
  return anexos;
}

function esc(v: unknown) {
  return String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export type ValorParam = {
  grupo: string;
  campo: string;
  label: string;
  obrigatorio: boolean;
  valor: string | null;
  origem: string | null;
  origem_detalhe?: string | null;
  status: string;
};

/** Monta a prévia versionada. Placeholders só existem em rascunho. */
export function montarPrevia(input: {
  tipo: "rascunho" | "final";
  caso: any;
  cliente: any;
  templateCode: string;
  templateVersion: number | null;
  valores: ValorParam[];
}) {
  const { tipo, caso, cliente, templateCode, templateVersion, valores } = input;
  const porCampo = new Map(valores.map((v) => [v.campo, v]));
  const pegar = (campo: string) => porCampo.get(campo)?.valor ?? null;

  const placeholdersPendentes = valores
    .filter((v) => v.obrigatorio && (!v.valor || v.status !== "validado"))
    .map((v) => ({ grupo: v.grupo, campo: v.campo, label: v.label, status: v.status }));

  const anexos = anexosPorRegra({
    produto: pegar("produto_sku"),
    pais: pegar("pais_rota"),
    membros: pegar("beneficiarios"),
  });

  const selo = tipo === "final" ? SELO_FINAL_PARAM : SELO_RASCUNHO_PARAM;

  const linha = (v: ValorParam) => {
    const conteudo = v.valor
      ? `${esc(v.valor)} <span class="orig">[origem: ${esc(v.origem)}${
          v.origem_detalhe ? ` · ${esc(v.origem_detalhe)}` : ""
        } · ${esc(v.status)}]</span>`
      : tipo === "rascunho"
        ? `<span class="pend">[[${esc(v.campo)}]] — pendente</span>`
        : `<span class="pend">campo obrigatório ausente</span>`;
    return `<li><strong>${esc(v.label)}:</strong> ${conteudo}</li>`;
  };

  const secoes = GRUPOS.map((g) => {
    const itens = valores.filter((v) => v.grupo === g.chave);
    return `<section><h2>${esc(g.titulo)}</h2><ul>${itens.map(linha).join("")}</ul></section>`;
  }).join("");

  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"/><meta name="robots" content="noindex,nofollow"/>
<title>${esc(caso?.codigo)} — prévia parametrizada</title>
<style>body{font-family:Georgia,serif;color:#1B2B4B;max-width:820px;margin:32px auto;padding:0 24px;line-height:1.6}
.selo{border:2px solid #8B4513;color:#8B4513;padding:8px 12px;margin:6px 0;font-family:system-ui;font-size:12px;letter-spacing:.08em;text-transform:uppercase}
h1{font-size:21px}h2{font-size:14px;text-transform:uppercase;letter-spacing:.06em;border-bottom:1px solid #C9A84C;padding-bottom:4px;margin-top:24px}
.orig{font-family:system-ui;font-size:11px;color:#1B2B4B99}.pend{color:#8B4513;font-style:italic}</style></head><body>
<div class="selo">${esc(selo)}</div>
<h1>${esc(caso?.titulo ?? "Instrumento contratual")}</h1>
<p><strong>Caso:</strong> ${esc(caso?.codigo)} · <strong>Cliente:</strong> ${esc(cliente?.nome ?? "não vinculado")}</p>
<p><strong>Modelo:</strong> ${esc(templateCode)}${templateVersion ? ` v${templateVersion}` : ""}</p>
${secoes}
<section><h2>Anexos aplicáveis por regra de produto/escopo</h2><ul>${anexos
    .map((a) => `<li><strong>${esc(a.codigo)}</strong> — ${esc(a.titulo)} <span class="orig">(${esc(a.motivo)})</span></li>`)
    .join("")}</ul></section>
</body></html>`;

  return {
    html,
    anexos,
    placeholdersPendentes,
    conteudo: {
      tipo,
      caso_id: caso?.id,
      caso_codigo: caso?.codigo,
      template: templateCode,
      template_version: templateVersion,
      valores: valores.map((v) => ({
        grupo: v.grupo,
        campo: v.campo,
        valor: v.valor,
        origem: v.origem,
        status: v.status,
      })),
    },
  };
}
