import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { lerNucleoCaso } from "@/lib/nucleo-caso.functions";
import { listarMarcosJornada } from "@/lib/marcos-jornada.functions";
import { lerEtapasCaso } from "@/lib/casos-ativacao.functions";
import { ROTULO_ESTADO_ETAPA } from "@/lib/etapas-caso";
import { supabase } from "@/integrations/supabase/client";
import { WHATSAPP_ESPECIALISTA } from "@/lib/contato-especialista";

const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function Cartao({ titulo, children, acao }: { titulo: string; children: React.ReactNode; acao?: React.ReactNode }) {
  return (
    <section className="min-w-0 rounded-xl border border-navy/10 bg-card p-4 shadow-[0_4px_16px_color-mix(in_srgb,var(--navy)_5%,transparent)]">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="font-serif text-lg text-navy">{titulo}</h3>
        {acao}
      </div>
      {children}
    </section>
  );
}

function Selo({ texto, tom = "neutro" }: { texto: string; tom?: "ouro" | "neutro" | "navy" }) {
  const cls =
    tom === "ouro"
      ? "border-gold/50 bg-gold/15 text-navy"
      : tom === "navy"
        ? "border-navy bg-navy text-cream"
        : "border-navy/15 bg-cream text-navy/70";
  return <span className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[11px] ${cls}`}>{texto}</span>;
}

function iniciais(nome: string) {
  const p = nome.trim().split(/\s+/);
  return ((p[0]?.[0] ?? "") + (p.length > 1 ? p[p.length - 1][0] : "")).toUpperCase();
}

/** Primeira leitura do Caso 360 (seção Visão) em 3 colunas — só dados reais; vazios honestos. */
export function PainelVisaoCaso360({
  caseId,
  codigo,
  documentos,
  aoAbrirSecao,
}: {
  caseId: string;
  codigo: string | null;
  documentos: Record<string, any>[] | null;
  aoAbrirSecao: (secao: string) => void;
}) {
  const nucleoFn = useServerFn(lerNucleoCaso);
  const marcosFn = useServerFn(listarMarcosJornada);
  const etapasFn = useServerFn(lerEtapasCaso);
  const qNucleo = useQuery({ queryKey: ["visao360-nucleo", caseId], queryFn: () => nucleoFn({ data: { caseId } }) });
  const qMarcos = useQuery({ queryKey: ["marcos-jornada", caseId], queryFn: () => marcosFn({ data: { caseId } }) });
  const qEtapas = useQuery({ queryKey: ["etapas-caso", caseId], queryFn: () => etapasFn({ data: { caseId } }) });
  const qCond = useQuery({
    queryKey: ["etapas-caso", "condicao", caseId],
    queryFn: async () => {
      const { data } = await supabase
        .from("commercial_conditions")
        .select("valor_total_referencia,status")
        .eq("case_id", caseId)
        .is("archived_at", null)
        .eq("dados_teste", false)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
  });

  const pessoas = qNucleo.data ?? [];
  const titular = pessoas.find((p) => p.titular) ?? null;
  const demais = pessoas.filter((p) => p !== titular);
  const docs = documentos ?? [];

  return (
    <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-3" data-painel-visao-360>
      {/* Esquerda — perfil e família */}
      <div className="flex min-w-0 flex-col gap-4">
        <Cartao titulo="Titular">
          {titular ? (
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-navy font-medium text-gold">{iniciais(titular.nome)}</span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-navy">{titular.nome}</p>
                <p className="text-xs text-navy/60">{codigo ?? "Código não registrado"}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-navy/60">{qNucleo.isLoading ? "Carregando…" : "Titular não registrada."}</p>
          )}
        </Cartao>
        <Cartao
          titulo="Núcleo familiar"
          acao={
            <button type="button" onClick={() => aoAbrirSecao("pessoas")} className="min-h-11 text-xs text-navy/70 underline-offset-2 hover:underline">
              Ver Árvore Completa
            </button>
          }
        >
          {demais.length ? (
            <ul className="space-y-2.5">
              {demais.map((p) => (
                <li key={p.id} className="flex min-w-0 items-center gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-navy text-xs text-gold">{iniciais(p.nome || "?")}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-navy">{p.nome || "Nome não registrado"}</span>
                    <span className="block truncate text-[11px] text-navy/60" title={p.parentesco || p.papel || ""}>{p.parentesco || p.papel || "Vínculo não registrado"}</span>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-navy/60">{qNucleo.isLoading ? "Carregando…" : "Nenhum outro membro registrado."}</p>
          )}
        </Cartao>
      </div>

      {/* Centro — jornada e linha do tempo */}
      <div className="min-w-0">
        <Cartao
          titulo="Linha do tempo"
          acao={
            <button type="button" onClick={() => aoAbrirSecao("jornada")} className="min-h-11 text-xs text-navy/70 underline-offset-2 hover:underline">
              Abrir Jornada
            </button>
          }
        >
          {(qMarcos.data ?? []).length ? (
            <ol className="relative ml-2 border-l-2 border-gold/70">
              {(qMarcos.data ?? []).map((m) => {
                const [data, ...resto] = String(m.texto ?? "").split(" — ");
                return (
                  <li key={m.id} className="relative pb-4 pl-5 last:pb-0">
                    <span className="absolute -left-[7px] top-1 h-3 w-3 rounded-full border-2 border-card bg-gold" aria-hidden="true" />
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-medium text-navy">{resto.length ? data : ""}</span>
                      <Selo texto={m.estado === "publicado" ? "Publicado" : "Em curadoria"} tom={m.estado === "publicado" ? "ouro" : "neutro"} />
                    </div>
                    <p className="mt-1 text-sm text-navy/80">{resto.length ? resto.join(" — ") : data}</p>
                  </li>
                );
              })}
            </ol>
          ) : (
            <p className="text-sm text-navy/60">{qMarcos.isLoading ? "Carregando…" : "Marcos em preparação."}</p>
          )}
        </Cartao>
      </div>

      {/* Direita — prontidão, documentos e financeiro */}
      <div className="flex min-w-0 flex-col gap-4">
        <Cartao titulo="Prontidão Go-Live">
          <ul className="space-y-1.5">
            {(qEtapas.data ?? []).map((e) => (
              <li key={e.id}>
                <button type="button" onClick={() => aoAbrirSecao(e.secao)} className="flex min-h-11 w-full items-center justify-between gap-2 rounded-md px-2 text-left hover:bg-navy/5">
                  <span className="text-sm text-navy">{e.rotulo}</span>
                  <Selo texto={ROTULO_ESTADO_ETAPA[e.estado]} tom={e.estado === "concluido" ? "ouro" : e.estado === "andamento" ? "navy" : "neutro"} />
                </button>
              </li>
            ))}
          </ul>
          <a href={WHATSAPP_ESPECIALISTA.url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-emerald-700 px-4 text-xs font-medium text-white hover:bg-emerald-800">
            WhatsApp da especialista · {WHATSAPP_ESPECIALISTA.rotulo}
          </a>
        </Cartao>
        <Cartao titulo="Cofre de documentos">
          {docs.length ? (
            <ul className="space-y-2">
              {docs.slice(0, 5).map((d) => (
                <li key={d.id} className="flex min-w-0 items-center justify-between gap-2">
                  <span className="min-w-0 truncate text-sm text-navy">{d.titulo ?? d.nome_arquivo ?? "Documento"}</span>
                  <Selo texto={String(d.status ?? "Em curadoria")} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-navy/60">Acervo em curadoria — nenhum arquivo enviado ainda.</p>
          )}
          <button type="button" onClick={() => aoAbrirSecao("documentos")} className="mt-2 min-h-11 text-xs text-navy/70 underline-offset-2 hover:underline">
            Abrir Documentos
          </button>
        </Cartao>
        <Cartao titulo="Financeiro">
          {qCond.data?.valor_total_referencia != null ? (
            <>
              <p className="font-serif text-2xl text-navy">{BRL.format(Number(qCond.data.valor_total_referencia))}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <Selo texto="Previsão familiar · sem cobrança" tom="ouro" />
              </div>
            </>
          ) : (
            <p className="text-sm text-navy/60">Condição comercial não registrada.</p>
          )}
          <button type="button" onClick={() => aoAbrirSecao("financeiro")} className="mt-2 min-h-11 text-xs text-navy/70 underline-offset-2 hover:underline">
            Abrir Financeiro
          </button>
        </Cartao>
      </div>
    </div>
  );
}
