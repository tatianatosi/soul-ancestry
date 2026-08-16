/**
 * Gerador de relatório interno de andamento da pesquisa.
 *
 * Uso interno: nunca envia nada ao cliente automaticamente e nunca afirma
 * resultado jurídico ou promessa de cidadania — apenas status de pesquisa,
 * evidências, pendências e riscos.
 */

export type LinhaPesquisa = Record<string, unknown>;

export type DossiePesquisa = {
  caso: LinhaPesquisa;
  pessoas: LinhaPesquisa[];
  hipoteses: LinhaPesquisa[];
  evidencias: LinhaPesquisa[];
  eventos: LinhaPesquisa[];
  pendencias: LinhaPesquisa[];
};

const t = (v: unknown) => (v === null || v === undefined || v === "" ? "não informado" : String(v));

function contar(linhas: LinhaPesquisa[], chave: string) {
  const mapa = new Map<string, number>();
  for (const l of linhas) mapa.set(t(l[chave]), (mapa.get(t(l[chave])) ?? 0) + 1);
  return [...mapa.entries()].sort((a, b) => b[1] - a[1]);
}

export function periodoEvento(l: LinhaPesquisa) {
  if (l["periodo_texto"]) return String(l["periodo_texto"]);
  const i = l["data_inicio"] ? String(l["data_inicio"]) : "";
  const f = l["data_fim"] ? String(l["data_fim"]) : "";
  if (i && f && i !== f) return `${i} a ${f}`;
  return i || f || "data não informada";
}

export function gerarRelatorioPesquisa(d: DossiePesquisa) {
  const validadas = d.evidencias.filter((e) => e["status"] === "validada");
  const inconclusivas = d.evidencias.filter((e) => e["status"] === "inconclusiva");
  const emRevisao = d.evidencias.filter((e) => e["status"] === "em_revisao" || e["status"] === "coletada");
  const abertas = d.hipoteses.filter((h) => h["status"] !== "confirmada" && h["status"] !== "descartada");
  const confirmadas = d.hipoteses.filter((h) => h["status"] === "confirmada");
  const pendentes = d.pendencias.filter((p) => p["status"] !== "concluida" && p["status"] !== "cancelada");

  const linhas: string[] = [];
  const push = (s = "") => linhas.push(s);

  push(`RELATÓRIO INTERNO DE ANDAMENTO DA PESQUISA`);
  push(`Caso: ${t(d.caso["codigo"])} — ${t(d.caso["titulo"])}`);
  push(`Status do caso: ${t(d.caso["status"])} | País: ${t(d.caso["pais"])} | Via: ${t(d.caso["via"])}`);
  push(`Gerado em: ${new Date().toLocaleString("pt-BR")}`);
  push(`Documento de uso interno. Não constitui parecer nem previsão de resultado.`);
  push();

  push(`1. PANORAMA`);
  push(`- Pessoas mapeadas na linha familiar: ${d.pessoas.length}`);
  push(`- Hipóteses de parentesco: ${d.hipoteses.length} (confirmadas: ${confirmadas.length}, em aberto: ${abertas.length})`);
  push(`- Evidências: ${d.evidencias.length} (validadas: ${validadas.length}, em análise: ${emRevisao.length}, inconclusivas: ${inconclusivas.length})`);
  push(`- Eventos na linha do tempo: ${d.eventos.length}`);
  push(`- Pendências de pesquisa em aberto: ${pendentes.length}`);
  push();

  push(`2. ACHADOS COM EVIDÊNCIA VALIDADA`);
  if (validadas.length === 0) push(`- Nenhuma evidência validada até o momento.`);
  validadas.forEach((e) =>
    push(`- ${t(e["titulo"])} | fonte: ${t(e["fonte"])} | local: ${t(e["local_relacionado"])} | período: ${periodoEvento(e)} | confiança: ${t(e["grau_confianca"])}`),
  );
  push();

  push(`3. HIPÓTESES EM ABERTO`);
  if (abertas.length === 0) push(`- Nenhuma hipótese em aberto.`);
  abertas.forEach((h) =>
    push(`- [${t(h["status"])}] ${t(h["titulo"])} | confiança: ${t(h["grau_confianca"])} | ${t(h["descricao"])}`),
  );
  push();

  push(`4. ITENS INCONCLUSIVOS E RISCOS`);
  if (inconclusivas.length === 0) push(`- Nenhum item inconclusivo registrado.`);
  inconclusivas.forEach((e) => push(`- ${t(e["titulo"])} | ${t(e["justificativa"] ?? e["descricao"])}`));
  if (abertas.length > 0 && validadas.length === 0) {
    push(`- Risco: nenhuma evidência validada sustenta as hipóteses atuais.`);
  }
  const semFonte = d.evidencias.filter((e) => !e["fonte"]);
  if (semFonte.length > 0) push(`- Risco: ${semFonte.length} evidência(s) sem fonte registrada.`);
  push();

  push(`5. LINHA DO TEMPO`);
  if (d.eventos.length === 0) push(`- Sem eventos registrados.`);
  [...d.eventos]
    .sort((a, b) => String(a["data_inicio"] ?? "").localeCompare(String(b["data_inicio"] ?? "")))
    .forEach((ev) => push(`- ${periodoEvento(ev)} | ${t(ev["titulo"])} | ${t(ev["local"])}`));
  push();

  push(`6. PRÓXIMOS PASSOS (PENDÊNCIAS)`);
  if (pendentes.length === 0) push(`- Sem pendências em aberto.`);
  pendentes.forEach((p) =>
    push(`- [${t(p["status"])}] ${t(p["titulo"])} | prioridade: ${t(p["prioridade"])} | prazo: ${t(p["prazo"])}`),
  );
  push();

  push(`7. DISTRIBUIÇÃO DE EVIDÊNCIAS POR STATUS`);
  contar(d.evidencias, "status").forEach(([k, v]) => push(`- ${k}: ${v}`));

  return linhas.join("\n");
}
