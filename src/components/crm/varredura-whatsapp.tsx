/**
 * Varredura de conversa do WhatsApp, no Painel de Calls.
 *
 * O Painel pedia campos estruturados; a vida entrega conversa. Esta tela fica
 * no meio: cola-se o dump, ela aponta o que parece responder a cada campo do
 * roteiro e mostra o trecho de onde tirou.
 *
 * A conversa em si (dump colado ou arquivo) é dado pessoal de terceiro: vive
 * nesta tela enquanto está aberta e some quando se sai — não vai para o
 * banco, não é enviada a lugar nenhum. Só o SINAL normalizado de um achado
 * (ex.: "bisavô ou bisavó", não o trecho onde a cliente escreveu isso) pode
 * virar rascunho do lead, e só quando a proprietária clica em "Usar no
 * lead" — nada é preenchido sozinho. Gravar de fato continua exigindo o
 * botão "Gravar registro da call" do Painel, como qualquer outro campo.
 */
import { useEffect, useMemo, useState } from "react";

import {
  ROTULO_CAMPO,
  codigoLeadDoAchado,
  formatoDaConversa,
  varrerConversa,
  type Achado,
  type CampoVarrido,
} from "@/lib/varredura-whatsapp";

/**
 * CA02-CRM-VIVO-PAINEL-CALLS (09/09/2026): `onAchadosMudaram` deixa o Painel
 * de Calls mostrar cada achado dentro do card da pergunta correspondente do
 * roteiro, com confirmar/corrigir/virar hipótese/ignorar — em vez de uma
 * lista solta sem ligação com o formulário.
 *
 * `leadNome` + `onAplicar` são o atalho “Usar no lead” da PR #48: só o sinal
 * normalizado entra no rascunho, nunca o trecho da conversa. Gravar de fato
 * continua no botão do Painel.
 */
export function VarreduraWhatsApp({
  onAchadosMudaram,
  leadNome,
  onAplicar,
  onRejeitar,
  decididos,
  bloqueio,
  autoresDaCasaPadrao,
}: {
  onAchadosMudaram?: (achados: Achado[], fonte: "whatsapp" | "transcricao") => void;
  leadNome?: string | null;
  /** Mesa Discovery viva: aceitar grava na hora, com a origem (fonte, autor, trecho, data). */
  onAplicar?: (achado: Achado, codigo: string, fonte: "whatsapp" | "transcricao") => void;
  onRejeitar?: (achado: Achado, fonte: "whatsapp" | "transcricao") => void;
  /** Decisões já gravadas no lead (`campoVarrido::valor` → decisão), relidas do servidor. */
  decididos?: ReadonlyMap<string, string>;
  /** Consentimento/lead ausente: a varredura não roda. */
  bloqueio?: string | null;
  /** Nomes da equipe já conhecidos (responsável do lead, quem está logado). */
  autoresDaCasaPadrao?: readonly string[];
}) {
  const [bruto, setBruto] = useState("");
  const [casa, setCasa] = useState("");
  const [avisoArquivo, setAvisoArquivo] = useState<string | null>(null);
  // Trocar de lead zera a conversa colada: o texto de um lead nunca vaza para outro.
  useEffect(() => setBruto(""), [leadNome]);
  useEffect(() => {
    if (!casa.trim() && autoresDaCasaPadrao?.length) setCasa(autoresDaCasaPadrao.join(", "));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoresDaCasaPadrao?.join(",")]);
  const fonte = useMemo(() => formatoDaConversa(bruto), [bruto]);

  const carregarArquivo = (arquivo: File | undefined) => {
    if (!arquivo) return;
    setAvisoArquivo(null);
    const nome = arquivo.name.toLowerCase();
    if (nome.endsWith(".zip")) {
      setAvisoArquivo(
        "Arquivo .zip ainda não é lido direto aqui — é o export \"com mídia\" do WhatsApp. Exporte a conversa de novo escolhendo \"sem mídia\" (vira um .txt direto) ou abra o .zip e envie só o arquivo _chat.txt de dentro dele.",
      );
      return;
    }
    if (!nome.endsWith(".txt")) {
      setAvisoArquivo("Formato não reconhecido — envie o .txt exportado do WhatsApp.");
      return;
    }
    const leitor = new FileReader();
    leitor.onload = () => setBruto(String(leitor.result ?? ""));
    leitor.onerror = () => setAvisoArquivo("Não consegui ler o arquivo. Tenta colar o texto direto abaixo.");
    leitor.readAsText(arquivo);
  };

  const resultado = useMemo(() => {
    if (!bruto.trim()) return null;
    const autoresDaCasa = casa
      .split(/[,;]/)
      .map((s) => s.trim())
      .filter(Boolean);
    return varrerConversa(bruto, { autoresDaCasa });
  }, [bruto, casa]);

  const porCampo = useMemo(() => {
    const mapa = new Map<CampoVarrido, NonNullable<typeof resultado>["achados"]>();
    for (const a of resultado?.achados ?? []) {
      const atual = mapa.get(a.campo) ?? [];
      atual.push(a);
      mapa.set(a.campo, atual);
    }
    return mapa;
  }, [resultado]);

  useEffect(() => {
    onAchadosMudaram?.(resultado?.achados ?? [], fonte);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resultado]);

  return (
    <section className="rounded-xl border border-navy/10 bg-cream/40 p-5">
      <h2 className="font-serif text-lg text-navy">Varredura de conversa</h2>
      <p className="mt-0.5 text-xs text-navy/55">
        Cole o dump do WhatsApp do prospect. A varredura aponta o que parece responder ao roteiro e
        mostra o trecho de onde veio.
        {leadNome ? (
          <> Achados com de-para confiável podem ser usados no rascunho de <strong>{leadNome}</strong>.</>
        ) : (
          " Selecione um lead no Painel de Calls para poder usar um achado no rascunho."
        )}{" "}
        Aceitar grava só o sinal no lead, com a origem (quem disse, trecho e data); rejeitar também fica
        registrado. A conversa inteira nunca é gravada.
      </p>

      {bloqueio ? (
        <p role="alert" data-varredura-bloqueada className="mt-3 rounded-lg border border-terracotta/30 bg-terracotta/10 px-3 py-2 text-xs text-terracotta">
          {bloqueio}
        </p>
      ) : (
      <div className="mt-4 grid gap-3">
        <label className="block">
          <span className="text-[11px] font-medium uppercase tracking-wide text-navy/50">
            Quem é da casa (separe por vírgula)
          </span>
          <input
            value={casa}
            onChange={(e) => setCasa(e.target.value)}
            placeholder="Tatiana"
            className="mt-1 w-full rounded-lg border border-navy/20 bg-cream/40 px-3 py-2 text-sm text-navy outline-none focus:border-gold"
          />
          <span className="mt-1 block text-[11px] text-navy/45">
            As mensagens da equipe ficam de fora: pergunta não é resposta. Falas marcadas como Consultor,
            Atendente ou Equipe são sempre da casa.
          </span>
        </label>

        <label className="block">
          <span className="text-[11px] font-medium uppercase tracking-wide text-navy/50">
            Arquivo exportado do WhatsApp (.txt)
          </span>
          <input
            type="file"
            accept=".txt,.zip,text/plain,application/zip"
            onChange={(e) => carregarArquivo(e.target.files?.[0])}
            className="mt-1 block w-full text-xs text-navy/70 file:mr-3 file:rounded-lg file:border file:border-navy/20 file:bg-cream/40 file:px-3 file:py-1.5 file:text-xs file:text-navy"
          />
          {avisoArquivo ? (
            <span className="mt-1 block text-[11px] text-terracotta">{avisoArquivo}</span>
          ) : (
            <span className="mt-1 block text-[11px] text-navy/45">
              Nada é enviado — o arquivo é lido só no seu navegador e some ao sair da tela.
            </span>
          )}
        </label>

        <label className="block">
          <span className="text-[11px] font-medium uppercase tracking-wide text-navy/50">
            Ou cole a conversa direto
          </span>
          <textarea
            value={bruto}
            onChange={(e) => setBruto(e.target.value)}
            rows={8}
            placeholder={"[10/08/2026, 14:35] Nome da pessoa: meu bisavô era italiano…"}
            className="mt-1 w-full rounded-lg border border-navy/20 bg-cream/40 px-3 py-2 font-mono text-xs text-navy outline-none focus:border-gold"
          />
        </label>
      </div>
      )}

      {resultado && !bloqueio ? (
        resultado.mensagens === 0 ? (
          <p className="mt-4 rounded-lg bg-cream/60 px-3 py-2 text-sm text-navy/70">
            Não reconheci nenhuma mensagem nesse texto. O dump costuma vir como{" "}
            <span className="font-mono text-xs">[data, hora] Nome: mensagem</span> ou{" "}
            <span className="font-mono text-xs">data hora - Nome: mensagem</span>.
          </p>
        ) : (
          <div className="mt-5 space-y-4">
            <p className="text-xs text-navy/55">
              {resultado.mensagens} mensagem(ns)
              {resultado.autores.length ? ` · ${resultado.autores.join(", ")}` : ""}
              {resultado.de ? ` · desde ${formatarDia(resultado.de)}` : ""}
            </p>

            {resultado.achados.length === 0 ? (
              <p className="rounded-lg bg-cream/60 px-3 py-2 text-sm text-navy/70">
                Li a conversa e não encontrei nada que responda ao roteiro. Isso pode significar que
                a conversa foi só de agendamento — ou que o assunto ainda não apareceu.
              </p>
            ) : (
              [...porCampo.entries()].map(([campo, achados]) => (
                <div key={campo}>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-navy/50">
                    {ROTULO_CAMPO[campo]}
                  </p>
                  <ul className="mt-1.5 space-y-1.5">
                    {achados.map((a) => {
                      const codigo = codigoLeadDoAchado(a);
                      const chave = `${a.campo}::${a.valor}`;
                      const decisao = decididos?.get(chave) ?? null;
                      return (
                        <li
                          key={chave}
                          className="rounded-lg border border-navy/12 bg-cream/25 p-3"
                        >
                          <div className="flex flex-wrap items-baseline gap-x-2">
                            <p className="text-sm font-medium text-navy">{a.valor}</p>
                            {a.ocorrencias > 1 ? (
                              <span className="text-[11px] text-navy/50">
                                citado {a.ocorrencias}×
                              </span>
                            ) : null}
                            {decisao ? (
                              <span data-decisao-sugestao={decisao} className="ml-auto text-[11px] text-navy/60">
                                {decisao === "aceita" ? "Aceita ✓" : decisao === "rejeitada" ? "Rejeitada" : "Hipótese"}
                              </span>
                            ) : leadNome && !bloqueio ? (
                              <span className="ml-auto flex gap-1">
                                {codigo && onAplicar ? (
                                  <button
                                    type="button"
                                    onClick={() => onAplicar(a, codigo, fonte)}
                                    className="rounded-md border border-gold/50 bg-gold/10 px-2 py-0.5 text-[11px] text-navy hover:bg-gold/20"
                                  >
                                    Aceitar
                                  </button>
                                ) : null}
                                {onRejeitar ? (
                                  <button
                                    type="button"
                                    onClick={() => onRejeitar(a, fonte)}
                                    className="rounded-md border border-navy/20 px-2 py-0.5 text-[11px] text-navy/70 hover:bg-navy/5"
                                  >
                                    Rejeitar
                                  </button>
                                ) : null}
                              </span>
                            ) : null}
                          </div>
                          {/* A evidência viaja junto: sem trecho, é palpite. */}
                          <p className="mt-1 border-l-2 border-navy/15 pl-2 text-xs italic text-navy/65">
                            “{a.trecho}”
                          </p>
                          <p className="mt-1 text-[11px] text-navy/45">
                            {[a.autor, a.quando ? formatarDia(a.quando) : null]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))
            )}

            {resultado.camposSemAchado.length > 0 ? (
              <div className="rounded-lg border border-navy/12 bg-cream/40 p-3">
                <p className="text-[11px] font-medium uppercase tracking-wide text-navy/50">
                  A conversa não respondeu
                </p>
                <p className="mt-1 text-xs text-navy/65">
                  {resultado.camposSemAchado.map((c) => ROTULO_CAMPO[c]).join(" · ")}
                </p>
                <p className="mt-1 text-[11px] text-navy/45">
                  São as perguntas que continuam abertas para a próxima conversa.
                </p>
              </div>
            ) : null}

            <p className="text-[11px] text-navy/45">
              Tudo acima é candidato, não conclusão. Só o que você aceita ou rejeita é gravado no lead;
              a varredura não cria caso, pesquisa, hipótese jurídica, produto, preço nem proposta.
            </p>
          </div>
        )
      ) : null}
    </section>
  );
}

function formatarDia(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", timeZone: "UTC" });
}
