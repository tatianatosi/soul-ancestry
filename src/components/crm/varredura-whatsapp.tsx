/**
 * Varredura de conversa do WhatsApp, no Painel de Calls.
 *
 * O Painel pedia campos estruturados; a vida entrega conversa. Esta tela fica
 * no meio: cola-se o dump, ela aponta o que parece responder a cada campo do
 * roteiro e mostra o trecho de onde tirou.
 *
 * Nada é preenchido sozinho e nada é gravado. A conversa é dado pessoal de
 * terceiro: ela vive nesta tela enquanto está aberta e some quando se sai —
 * não vai para o banco, não vira rascunho, não é enviada a lugar nenhum.
 */
import { useMemo, useState } from "react";

import { ROTULO_CAMPO, varrerConversa, type CampoVarrido } from "@/lib/varredura-whatsapp";

export function VarreduraWhatsApp() {
  const [bruto, setBruto] = useState("");
  const [casa, setCasa] = useState("");

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

  return (
    <section className="rounded-xl border border-navy/10 bg-white p-5">
      <h2 className="font-serif text-lg text-navy">Varredura de conversa</h2>
      <p className="mt-0.5 text-xs text-navy/55">
        Cole o dump do WhatsApp do prospect. A varredura aponta o que parece responder ao roteiro e
        mostra o trecho de onde veio — nada é preenchido nem gravado.
      </p>

      <div className="mt-4 grid gap-3">
        <label className="block">
          <span className="text-[11px] font-medium uppercase tracking-wide text-navy/50">
            Quem é da casa (separe por vírgula)
          </span>
          <input
            value={casa}
            onChange={(e) => setCasa(e.target.value)}
            placeholder="Tatiana"
            className="mt-1 w-full rounded-lg border border-navy/20 bg-white px-3 py-2 text-sm text-navy outline-none focus:border-gold"
          />
          <span className="mt-1 block text-[11px] text-navy/45">
            As mensagens da equipe ficam de fora: pergunta não é resposta.
          </span>
        </label>

        <label className="block">
          <span className="text-[11px] font-medium uppercase tracking-wide text-navy/50">
            Conversa
          </span>
          <textarea
            value={bruto}
            onChange={(e) => setBruto(e.target.value)}
            rows={8}
            placeholder={"[10/08/2026, 14:35] Ana Luiza: meu bisavô era italiano…"}
            className="mt-1 w-full rounded-lg border border-navy/20 bg-white px-3 py-2 font-mono text-xs text-navy outline-none focus:border-gold"
          />
        </label>
      </div>

      {resultado ? (
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
                    {achados.map((a) => (
                      <li
                        key={`${a.campo}-${a.valor}`}
                        className="rounded-lg border border-navy/12 bg-cream/25 p-3"
                      >
                        <div className="flex flex-wrap items-baseline gap-x-2">
                          <p className="text-sm font-medium text-navy">{a.valor}</p>
                          {a.ocorrencias > 1 ? (
                            <span className="text-[11px] text-navy/50">
                              citado {a.ocorrencias}×
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
                    ))}
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
              Tudo acima é candidato, não conclusão. Nada foi gravado, e a varredura não conclui
              elegibilidade, via jurídica, prazo nem preço.
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
