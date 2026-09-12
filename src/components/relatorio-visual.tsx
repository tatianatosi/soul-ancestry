import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { Caso } from "@/data/casos";
import { relatorioByCaso, FASE1_STATUS_LABEL } from "@/data/relatorio-visual";
import { limparCopy, limparLista } from "@/lib/client-copy";
import { runPhase1ContentAudit } from "@/lib/phase1-content-audit";
import { BrandLogo } from "./brand";
import {
  Compass,
  Users,
  FileText,
  HelpCircle,
  ArrowRight,
  MapPin,
  X,
  Sparkles,
  Clock,
  BadgeCheck,
  Printer,
  MessageCircle,
} from "lucide-react";

function CardShell({
  icon: Icon,
  eyebrow,
  titulo,
  className,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  eyebrow: string;
  titulo: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "break-inside-avoid rounded-2xl border border-navy/25 bg-cream/40 p-5 shadow-sm",
        className,
      )}
    >
      <div className="mb-3 flex items-start gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gold/20 text-navy">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-widest text-terracotta">{eyebrow}</div>
          <h3 className="font-serif text-xl leading-tight text-navy">{titulo}</h3>
        </div>
      </div>
      {children}
    </section>
  );
}

const STATUS_TONE: Record<string, string> = {
  em_elaboracao: "border-terracotta/40 bg-terracotta/10 text-terracotta",
  em_revisao: "border-gold/50 bg-gold/15 text-navy",
  entregue: "border-sage/50 bg-sage/15 text-sage",
  arquivado: "border-navy/25 bg-navy/5 text-navy/70",
};

export function RelatorioVisualTab({ caso }: { caso: Caso }) {
  const r = relatorioByCaso(caso);
  const [modal, setModal] = useState(false);

  const linhaPrincipal = r.linhaPrincipal
    .map((g) => ({ nome: limparCopy(g.nome), eventos: limparCopy(g.eventos) }))
    .filter((g) => g.nome);
  const documentos = r.documentos
    .map((d) => ({
      pessoa: limparCopy(d.pessoa),
      tipo: limparCopy(d.tipo),
      local: limparCopy(d.local),
      observacao: limparCopy(d.observacao),
    }))
    .filter((d) => d.tipo);
  const lacunas = limparLista(r.lacunas);
  const pontosConfirmar = limparLista(r.pontosConfirmar);
  const possibilidades = limparLista(r.proximaEtapa.possibilidades);

  const resumo = (
    [
      ["Pessoa acompanhada", limparCopy(r.pessoaFoco)],
      ["Ancestral mais antigo identificado", limparCopy(r.ancestralMaisAntigo)],
      ["Gerações mapeadas até aqui", limparCopy(r.numeroGeracoes)],
      ["Localidades principais", limparCopy(r.localidadesPrincipais)],
    ] as [string, string][]
  ).filter(([, v]) => v);

  useEffect(() => {
    const t = setTimeout(() => runPhase1ContentAudit(), 300);
    return () => clearTimeout(t);
  }, [caso.id]);

  return (
    <div className="space-y-5 p-5 print:p-0" data-tab="relatorio" data-print-area>
      {/* Cabeçalho de impressão (só aparece no PDF) */}
      <div className="hidden items-center gap-3 border-b border-navy/20 pb-4 print:flex">
        <BrandLogo size={40} showText={false} />
        <div>
          <div className="font-serif text-lg italic text-navy">Clube Ancestral</div>
          <div className="text-[11px] uppercase tracking-widest text-navy/60">
            Diagnóstico inicial
          </div>
        </div>
      </div>

      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-widest text-navy/60">
            Primeira etapa da sua jornada
          </div>
          <h2 className="font-serif text-2xl text-navy lg:text-3xl">Diagnóstico inicial</h2>
          <p className="mt-1 text-[13px] italic text-navy/70">
            Organizamos os primeiros sinais da sua história familiar e os próximos passos
            possíveis.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-full border border-navy/25 px-3.5 py-2 text-[12px] font-semibold text-navy transition hover:bg-navy hover:text-cream print:hidden"
        >
          <Printer className="h-3.5 w-3.5" /> Salvar em PDF
        </button>
      </header>

      {/* Microbloco — relatório como ativo vivo */}
      <section className="break-inside-avoid rounded-2xl border border-gold/40 bg-areia p-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <div className="text-[11px] uppercase tracking-widest text-terracotta">Etapa atual</div>
            <div className="mt-0.5 text-[13px] font-semibold text-navy">{r.meta.etapaAtual}</div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-widest text-terracotta">
              Última atualização
            </div>
            <div className="mt-0.5 flex items-center gap-1.5 text-[13px] font-semibold text-navy">
              <Clock className="h-3.5 w-3.5 shrink-0 text-navy/50" />
              {r.meta.ultimaAtualizacao}
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-widest text-terracotta">
              Status desta etapa
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
                  STATUS_TONE[r.meta.status],
                )}
              >
                <BadgeCheck className="h-3 w-3" />
                {FASE1_STATUS_LABEL[r.meta.status]}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-3 border-t border-navy/10 pt-2.5 text-[11px] text-navy/60">
          Acompanhamento: {r.meta.responsavel} · Próxima revisão: {r.meta.proximaRevisao}
        </div>
      </section>


      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-6">
        {/* Card 1 */}
        <CardShell
          icon={Compass}
          eyebrow="Visão geral"
          titulo="O que já identificamos"
          className="md:col-span-2 xl:col-span-3"
        >
          <p className="text-[13px] leading-relaxed text-navy/80">
            Esta primeira leitura organizou os sinais já reunidos sobre a família{" "}
            <strong className="text-navy">{r.sobrenomeFamilia}</strong>: as pessoas conectadas até
            aqui e as referências documentais disponíveis para seguir pesquisando.
          </p>
          {resumo.length > 0 && (
            <div className="mt-4 rounded-xl bg-areia p-4">
              <div className="mb-2 text-[11px] uppercase tracking-widest text-navy/70">
                Resumo rápido
              </div>
              <dl className="space-y-2">
                {resumo.map(([k, v]) => (
                  <div
                    key={k}
                    className="flex items-start justify-between gap-3 border-b border-navy/10 pb-2 last:border-0 last:pb-0"
                  >
                    <dt className="text-[12px] text-navy/70">{k}</dt>
                    <dd className="text-right text-[13px] font-medium text-navy">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </CardShell>

        {/* Card 2 */}
        {linhaPrincipal.length > 0 && (
          <CardShell
            icon={Users}
            eyebrow="Pessoas conectadas"
            titulo="Linha familiar identificada"
            className="xl:col-span-3"
          >
            <ol className="relative space-y-4 border-l-2 border-gold/40 pl-5">
              {linhaPrincipal.map((g, i) => (
                <li key={i} className="relative">
                  <span className="absolute -left-[27px] top-1 grid h-3.5 w-3.5 place-items-center rounded-full border-2 border-gold bg-cream" />
                  <div className="text-[13px] font-semibold text-navy">{g.nome}</div>
                  {g.eventos && <div className="text-[12px] text-navy/70">{g.eventos}</div>}
                </li>
              ))}
            </ol>
            <p className="mt-4 text-[12px] italic text-navy/60">
              Esta visualização mostra a espinha dorsal inicial da família, sem avançar ainda para
              todos os ramos e contextos possíveis nesta etapa.
            </p>
          </CardShell>
        )}

        {/* Card 3 */}
        <CardShell
          icon={FileText}
          eyebrow="Referências documentais"
          titulo="Registros já reunidos"
          className="xl:col-span-3"
        >
          {documentos.length > 0 ? (
            <>
              <div className="space-y-2.5">
                {documentos.map((d, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-border border-l-4 border-l-gold bg-cream/40 p-3.5"
                  >
                    {d.pessoa && (
                      <div className="text-[13px] font-semibold text-navy">{d.pessoa}</div>
                    )}
                    <div className="text-[12px] text-navy/80">{d.tipo}</div>
                    {d.local && (
                      <div className="mt-1 flex items-center gap-1.5 text-[11px] text-navy/60">
                        <MapPin className="h-3 w-3 shrink-0 text-sage" />
                        <span className="truncate">{d.local}</span>
                      </div>
                    )}
                    {d.observacao && (
                      <>
                        <div className="mt-1 text-[11px] uppercase tracking-widest text-terracotta">
                          Leitura da consultoria
                        </div>
                        <div className="text-[12px] text-navy/70">{d.observacao}</div>
                      </>
                    )}
                  </div>
                ))}
              </div>
              {r.quantidadeRegistros && (
                <div className="mt-4 rounded-xl bg-areia px-4 py-3 text-[12px] text-navy">
                  Registros reunidos até aqui: <strong>{r.quantidadeRegistros}</strong>
                </div>
              )}
            </>
          ) : (
            <p className="text-[13px] leading-relaxed text-navy/70">
              A busca por registros está em andamento. Assim que os primeiros documentos forem
              reunidos, eles aparecem aqui com a leitura da consultoria.
            </p>
          )}
        </CardShell>

        {/* Card 4 */}
        <CardShell
          icon={HelpCircle}
          eyebrow="Pendências"
          titulo="O que ainda precisamos confirmar"
          className="xl:col-span-3"
        >
          {lacunas.length > 0 || pontosConfirmar.length > 0 ? (
            <>
              {lacunas.length > 0 && (
                <ul className="space-y-2">
                  {lacunas.map((l, i) => (
                    <li key={i} className="flex items-start gap-2 text-[13px] text-navy/80">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-terracotta" />
                      <span>{l}</span>
                    </li>
                  ))}
                </ul>
              )}
              {pontosConfirmar.length > 0 && (
                <div className="mt-4 rounded-xl bg-areia p-4">
                  <div className="mb-2 text-[11px] uppercase tracking-widest text-navy/70">
                    Em conferência
                  </div>
                  <ul className="space-y-2">
                    {pontosConfirmar.map((p, i) => (
                      <li key={i} className="flex items-start gap-2 text-[12px] text-navy/80">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sage" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <p className="text-[13px] leading-relaxed text-navy/70">
              No momento não há pendências registradas. Novos pontos a confirmar aparecem aqui
              conforme a pesquisa avança.
            </p>
          )}
          <p className="mt-4 text-[12px] italic text-navy/60">
            Nesta etapa o foco é clareza e organização: cada ponto em aberto é tratado com calma,
            sem antecipar conclusões sobre o caminho da família.
          </p>
        </CardShell>


        {/* Card 5 — próxima etapa */}
        <section className="break-inside-avoid rounded-2xl bg-gradient-to-br from-navy to-navy-soft p-5 text-cream shadow-lg md:col-span-2 xl:col-span-6 xl:p-7">
          <div className="grid gap-5 xl:grid-cols-[1.15fr_1fr] xl:items-center">
            <div>
              <div className="text-[11px] uppercase tracking-widest text-gold/80">Continuidade</div>
              <h3 className="font-serif text-xl italic xl:text-2xl">
                {limparCopy(r.proximaEtapa.titulo) || "Próximo passo recomendado"}
              </h3>
              <p className="mt-3 text-[13px] leading-relaxed text-cream/85">
                {limparCopy(r.proximaEtapa.resumo)}
              </p>
              <p className="mt-3 text-[12px] italic text-cream/70">
                O passo seguinte é uma análise de estratégia e documentação, desenhada a partir do
                que esta primeira leitura mostrou — no seu tempo, sem pressa e sem etapas
                desnecessárias.
              </p>
            </div>
            <div>
              <div className="rounded-xl bg-navy-soft/60 p-4">
                <div className="mb-2 text-[11px] uppercase tracking-widest text-gold/80">
                  O que pode ser aprofundado
                </div>
                <ul className="space-y-1.5">
                  {possibilidades.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-[13px] text-cream/85">
                      <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => setModal(true)}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-gold px-4 py-3 text-[13px] font-semibold text-navy transition hover:bg-gold/90 print:hidden"
              >
                {limparCopy(r.proximaEtapa.ctaPrimaria) || "Ver proposta da próxima etapa"}
                <ArrowRight className="h-4 w-4" />
              </button>
              <div className="mt-2 text-center text-[11px] text-cream/60 print:hidden">
                Sem compromisso — você recebe o escopo antes de decidir.
              </div>
            </div>
          </div>
        </section>
      </div>

      {modal && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-navy/60 p-4 sm:items-center print:hidden"
          onClick={() => setModal(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-gold/40 bg-cream/40 p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[11px] uppercase tracking-widest text-terracotta">
                  Próxima etapa
                </div>
                <h4 className="font-serif text-xl text-navy">Receber proposta personalizada</h4>
              </div>
              <button
                onClick={() => setModal(false)}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-muted text-navy"
                aria-label="Fechar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-3 text-[13px] leading-relaxed text-navy/80">
              Sua consultora do Clube Ancestral vai preparar a proposta da próxima etapa a partir
              deste relatório — com escopo, prazos e investimento sob medida para a família{" "}
              {r.sobrenomeFamilia}.
            </p>
            <ul className="mt-3 space-y-1.5">
              {[
                "Leitura conjunta dos achados desta etapa",
                "Escopo sugerido para o aprofundamento",
                "Prazos, investimento e formas de acompanhamento",
              ].map((i) => (
                <li key={i} className="flex items-start gap-2 text-[12px] text-navy/75">
                  <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-gold" />
                  <span>{i}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 rounded-xl bg-areia p-3 text-[12px] text-navy/75">
              Você recebe o escopo antes de decidir qualquer continuidade — sem compromisso e sem
              promessa de resultado.
            </div>

            <button
              onClick={() => setModal(false)}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-navy px-4 py-2.5 text-[13px] font-semibold text-cream transition hover:bg-navy-soft"
            >
              <MessageCircle className="h-4 w-4" /> Falar com minha consultora
            </button>
            <button
              onClick={() => setModal(false)}
              className="mt-2 w-full rounded-full px-4 py-2 text-[12px] font-medium text-navy/60 transition hover:text-navy"
            >
              Agora não
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
