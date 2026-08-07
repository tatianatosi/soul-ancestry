/**
 * Ancestral Canvas — Entrega Consultiva (Etapa 01 → Etapa 02).
 *
 * Todos os conteúdos derivam do objeto do caso (src/data/entrega-consultiva.ts):
 * nenhum país, preço, produto ou link de pagamento fixo aqui.
 */

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { Caso } from "@/data/casos";
import {
  CASO_MODELO,
  CHECKLIST_LABEL,
  ESTADOS_ENTREGA,
  ESTADO_ENTREGA_LABEL,
  VIA_LABEL,
  entregaByCaso,
  money,
  textoWhatsapp,
  type EntregaConsultiva,
  type EstadoEntrega,
  type PaymentStatus,
} from "@/data/entrega-consultiva";
import { track, type TrackingPayload } from "@/lib/tracking";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  CircleAlert,
  Clock,
  Copy,
  CreditCard,
  Download,
  FileText,
  Info,
  Lock,
  MessageCircle,
  Scale,
  Sparkles,
  X,
} from "lucide-react";

/** Seletores de caso-modelo só existem no ambiente interno/demonstração. */
const MODO_DEMO = import.meta.env.DEV;

const payloadOf = (e: EntregaConsultiva, estado: EstadoEntrega): TrackingPayload => ({
  caseId: e.caseId,
  clientId: e.clientId,
  country: e.country,
  suggestedRoute: e.suggestedRoute,
  offerId: e.stage2Offer.offerId,
  sku: e.stage2Offer.sku,
  price: e.stage2Offer.price,
  paymentStatus: estadoParaPagamento(estado),
});

function estadoParaPagamento(estado: EstadoEntrega): PaymentStatus {
  if (estado === "ETAPA_02_LINK_ACESSADO") return "link_acessado";
  if (estado === "ETAPA_02_PAGA" || estado === "ETAPA_02_EM_ANDAMENTO" || estado === "ETAPA_02_CONCLUIDA")
    return "confirmado";
  return "pendente";
}

export function EntregaConsultivaTab({ caso }: { caso: Caso }) {
  const [modelo, setModelo] = useState(false);
  const base = modelo && MODO_DEMO ? CASO_MODELO : entregaByCaso(caso);
  const [estadoOverride, setEstadoOverride] = useState<EstadoEntrega | null>(null);
  const estado: EstadoEntrega = estadoOverride ?? base.stage1Status;
  const entrega: EntregaConsultiva = {
    ...base,
    stage1Status: estado,
    stage2Offer: { ...base.stage2Offer, paymentStatus: estadoParaPagamento(estado) },
  };
  const oferta = entrega.stage2Offer;

  const [checkout, setCheckout] = useState(false);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    track("delivery_viewed", payloadOf(entrega, estado));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entrega.caseId, estado]);

  const pago = estado === "ETAPA_02_PAGA" || estado === "ETAPA_02_EM_ANDAMENTO" || estado === "ETAPA_02_CONCLUIDA";

  const mudarEstado = (novo: EstadoEntrega) => {
    setEstadoOverride(novo);
    track("payment_status_updated", payloadOf(entrega, novo));
  };

  return (
    <div className="space-y-4 p-5 lg:mx-auto lg:max-w-5xl" data-print-area>
      {/* uso interno da demonstração — nunca visível para clientes reais */}
      {MODO_DEMO && (
        <div data-print-hide className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-white p-3">
          <span className="text-[11px] uppercase tracking-widest text-navy/60">Visualizar (interno)</span>
          <button
            onClick={() => {
              setModelo((m) => !m);
              setEstadoOverride(null);
            }}
            className={cn(
              "rounded-full border px-3 py-1 text-[11px] font-semibold transition",
              modelo ? "border-navy bg-navy text-cream" : "border-navy/25 text-navy hover:bg-navy/5",
            )}
          >
            Caso modelo (Sophi Piccoli)
          </button>
          {ESTADOS_ENTREGA.map((e) => (
            <button
              key={e}
              onClick={() => setEstadoOverride(e)}
              className={cn(
                "rounded-full border px-3 py-1 text-[11px] font-semibold transition",
                estado === e ? "border-gold bg-gold text-navy" : "border-navy/25 text-navy hover:bg-navy/5",
              )}
            >
              {ESTADO_ENTREGA_LABEL[e]}
            </button>
          ))}
        </div>
      )}

      {/* cabeçalho institucional (também usado na versão impressa) */}
      <section className="rounded-2xl bg-gradient-to-br from-navy to-navy-soft p-5 text-cream shadow-lg">
        <div className="text-[11px] uppercase tracking-widest text-gold/80">
          Clube Ancestral · Entrega 1 — Leitura inicial do seu caso
        </div>
        <h2 className="mt-1 font-serif text-2xl italic">{entrega.clientName}</h2>
        <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
          <Tag>{entrega.country}</Tag>
          <Tag>{entrega.citizenshipType}</Tag>
          <Tag>{VIA_LABEL[entrega.suggestedRoute]} (preliminar)</Tag>
          <Tag tone="gold">{ESTADO_ENTREGA_LABEL[estado]}</Tag>
          {entrega.isDemo && <Tag tone="gold">dados ilustrativos</Tag>}
        </div>
        <p className="mt-3 text-[12px] text-cream/80">
          Gerado em {entrega.report.generatedAt} · {entrega.stage1DeliveredAt}. O aprofundamento e o desenho do caminho são a
          Etapa 02, logo abaixo.
        </p>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card icon={<Sparkles className="h-4 w-4" />} titulo="Leitura inicial da sua linha">
          <ol className="space-y-2">
            {entrega.lineage.map((l, i) => (
              <li key={l + i} className="flex items-start gap-3">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gold/20 text-[11px] font-semibold text-navy">
                  {i + 1}
                </span>
                <span className="text-sm text-navy">{l}</span>
              </li>
            ))}
          </ol>
          <p className="mt-3 border-l-2 border-gold pl-3 text-[13px] leading-relaxed text-navy/80">{entrega.initialReading}</p>
        </Card>

        <Card icon={<Scale className="h-4 w-4" />} titulo="Elegibilidade — em linguagem simples">
          <div
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold",
              entrega.eligibilitySummary.viable ? "bg-sage/15 text-sage" : "bg-terracotta/15 text-terracotta",
            )}
          >
            <BadgeCheck className="h-3.5 w-3.5" />
            {entrega.eligibilitySummary.viable ? "Há viabilidade" : "Requer análise adicional"}
          </div>
          <div className="mt-3 text-sm font-medium text-navy">{entrega.eligibilitySummary.scenario}</div>
          <p className="mt-2 text-[13px] leading-relaxed text-navy/80">{entrega.eligibilitySummary.text}</p>
          <p className="mt-3 inline-flex items-start gap-2 rounded-lg bg-cream p-3 text-[11px] leading-relaxed text-navy/70">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {entrega.routeDisclaimer}
          </p>
        </Card>

        <Card icon={<FileText className="h-4 w-4" />} titulo="Checklist mínimo de documentos" className="lg:col-span-2">
          <ul className="grid gap-2 sm:grid-cols-2">
            {entrega.documentChecklist.map((c) => (
              <li key={c.item} className="flex items-start gap-3 rounded-xl border border-border bg-cream/60 p-3">
                <span
                  className={cn(
                    "mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full",
                    c.situacao === "tem" && "bg-sage/20 text-sage",
                    c.situacao === "falta" && "bg-gold/25 text-navy",
                    c.situacao === "critico" && "bg-terracotta/15 text-terracotta",
                  )}
                >
                  {c.situacao === "tem" ? <Check className="h-3.5 w-3.5" /> : <CircleAlert className="h-3.5 w-3.5" />}
                </span>
                <div className="min-w-0">
                  <div className="text-sm text-navy">{c.item}</div>
                  <div className="text-[11px] uppercase tracking-wide text-navy/60">{CHECKLIST_LABEL[c.situacao]}</div>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Próximo passo */}
      <section className="rounded-2xl border-2 border-gold bg-white p-5 shadow-lg">
        <div className="text-[11px] uppercase tracking-widest text-navy/60">Etapa 02 · Aprofundar e desenhar seu caminho</div>
        <h3 className="mt-1 font-serif text-xl text-navy">{oferta.productName}</h3>
        <p className="mt-2 text-[13px] leading-relaxed text-navy/80">{oferta.description}</p>
        <p className="mt-2 border-l-2 border-gold pl-3 text-[13px] font-medium text-navy">{oferta.benefit}</p>

        <div className="mt-4 flex flex-wrap items-end justify-between gap-3 rounded-xl bg-cream p-4">
          <div>
            <div className="text-[11px] uppercase tracking-wide text-navy/60">Investimento</div>
            <div className="font-serif text-2xl text-navy">{money(oferta.currency, oferta.price)}</div>
            <div className="mt-1 inline-flex items-center gap-1 text-[11px] text-navy/70">
              <Clock className="h-3.5 w-3.5" /> Entrega em até {oferta.deliveryTime}
            </div>
          </div>

          {!pago ? (
            <button
              data-print-hide
              onClick={() => {
                track("stage2_cta_clicked", payloadOf(entrega, estado));
                track("stage2_modal_opened", payloadOf(entrega, estado));
                setCheckout(true);
              }}
              className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-navy transition hover:bg-gold/90"
            >
              Quero avançar para a Etapa 02 <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 rounded-full bg-sage px-4 py-2 text-xs font-semibold text-cream">
              <Check className="h-4 w-4" /> Pagamento recebido
            </div>
          )}
        </div>

        <EstadoMensagem estado={estado} entrega={entrega} />
      </section>

      {/* Exportação */}
      <section data-print-hide className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-white p-5">
        <div>
          <h3 className="font-serif text-lg text-navy">Exportar entrega em PDF</h3>
          <p className="text-[12px] text-navy/70">
            Versão institucional e limpa para compartilhar · relatório {entrega.report.reportVersion}
          </p>
        </div>
        <button
          onClick={() => {
            track("report_exported", payloadOf(entrega, estado));
            window.print();
          }}
          className="inline-flex items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-cream transition hover:bg-navy-soft"
        >
          <Download className="h-4 w-4" /> Exportar entrega em PDF
        </button>
      </section>

      {/* Mensagem de WhatsApp (envio manual pela equipe) */}
      {MODO_DEMO && (
        <section data-print-hide className="rounded-2xl border border-border bg-white p-5">
          <div className="mb-2 flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-navy" />
            <h3 className="font-serif text-lg text-navy">Mensagem de WhatsApp (envio manual)</h3>
          </div>
          <pre className="whitespace-pre-wrap rounded-xl bg-cream p-4 text-[12px] leading-relaxed text-navy/85">
            {textoWhatsapp(entrega)}
          </pre>
          <button
            onClick={() => {
              void navigator.clipboard?.writeText(textoWhatsapp(entrega));
              track("whatsapp_message_copied", payloadOf(entrega, estado));
              setCopiado(true);
              window.setTimeout(() => setCopiado(false), 1800);
            }}
            className="mt-3 inline-flex items-center gap-2 rounded-full border border-navy/25 px-4 py-1.5 text-[12px] font-semibold text-navy transition hover:bg-navy/5"
          >
            <Copy className="h-3.5 w-3.5" /> {copiado ? "Copiado!" : "Copiar mensagem para WhatsApp"}
          </button>
        </section>
      )}

      {/* rodapé institucional (visível também na impressão) */}
      <footer className="pt-2 text-center text-[10px] uppercase tracking-widest text-navy/45">
        Clube Ancestral · {entrega.report.reportId} · {entrega.report.reportVersion} · gerado em {entrega.report.generatedAt}
        {entrega.isDemo ? " · dados ilustrativos" : ""}
      </footer>

      {checkout && (
        <CheckoutModal
          entrega={entrega}
          onClose={() => setCheckout(false)}
          onPagar={() => {
            track("payment_link_clicked", payloadOf(entrega, estado));
            window.open(oferta.paymentUrl, "_blank", "noopener,noreferrer");
            mudarEstado("ETAPA_02_LINK_ACESSADO");
            setCheckout(false);
          }}
        />
      )}
    </div>
  );
}

function EstadoMensagem({ estado, entrega }: { estado: EstadoEntrega; entrega: EntregaConsultiva }) {
  const box = "mt-3 rounded-xl bg-cream p-3 text-[12px] leading-relaxed text-navy/75";
  if (estado === "ETAPA_02_LINK_ACESSADO")
    return (
      <p className={box}>
        Você já acessou as condições da Etapa 02. Quando decidir avançar, conclua o pagamento pelo link seguro.
      </p>
    );
  if (estado === "ETAPA_02_PAGA")
    return <p className={box}>Pagamento confirmado. Sua Etapa 02 será iniciada pela equipe Clube Ancestral.</p>;
  if (estado === "ETAPA_02_EM_ANDAMENTO")
    return (
      <p className={box}>
        Etapa 02 em execução pela equipe Clube Ancestral · previsão de entrega em até {entrega.stage2Offer.deliveryTime}.
      </p>
    );
  if (estado === "ETAPA_02_CONCLUIDA")
    return (
      <p className={box}>
        Etapa 02 concluída: a entrega aprofundada e o relatório final já estão liberados na sua Biblioteca do Legado.
      </p>
    );
  return (
    <p className="mt-3 text-[11px] text-navy/60">
      Sem reunião obrigatória: você avança pelo app e recebe a entrega por aqui e no WhatsApp.
    </p>
  );
}

function CheckoutModal({
  entrega,
  onClose,
  onPagar,
}: {
  entrega: EntregaConsultiva;
  onClose: () => void;
  onPagar: () => void;
}) {
  const o = entrega.stage2Offer;
  return (
    <div
      data-print-hide
      className="fixed inset-0 z-50 grid place-items-end bg-navy/50 p-0 sm:place-items-center sm:p-6"
      onClick={onClose}
    >
      <div className="w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-widest text-navy/60">Produto recomendado</div>
            <h3 className="mt-1 font-serif text-xl text-navy">{o.productName}</h3>
          </div>
          <button onClick={onClose} aria-label="Fechar" className="rounded-full p-1 text-navy/60 hover:bg-navy/5">
            <X className="h-5 w-5" />
          </button>
        </div>

        <ul className="mt-4 space-y-2 text-[13px] text-navy/80">
          <li className="flex gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-sage" /> Análise completa da linha ({entrega.country})
          </li>
          <li className="flex gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-sage" /> Verificação documento a documento
          </li>
          <li className="flex gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-sage" /> Desenho da {VIA_LABEL[entrega.suggestedRoute]} com prazos e
            custos
          </li>
          <li className="flex gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-sage" /> Entrega em até {o.deliveryTime}
          </li>
        </ul>

        <div className="mt-4 flex items-center justify-between rounded-xl bg-cream p-4">
          <span className="text-[12px] text-navy/70">Total</span>
          <span className="font-serif text-2xl text-navy">{money(o.currency, o.price)}</span>
        </div>

        <p className="mt-3 inline-flex items-start gap-2 text-[11px] leading-relaxed text-navy/65">
          <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" /> O pagamento é processado em ambiente seguro do parceiro financeiro.
          O Clube Ancestral não armazena dados do seu cartão.
        </p>

        <button
          onClick={onPagar}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-navy py-3 text-sm font-semibold text-cream transition hover:bg-navy-soft"
        >
          <CreditCard className="h-4 w-4" /> Ir para pagamento seguro
        </button>
      </div>
    </div>
  );
}

function Tag({ children, tone }: { children: React.ReactNode; tone?: "gold" }) {
  return (
    <span className={cn("rounded-full px-3 py-1 font-semibold", tone === "gold" ? "bg-gold text-navy" : "bg-cream/15 text-cream")}>
      {children}
    </span>
  );
}

function Card({
  icon,
  titulo,
  children,
  className,
}: {
  icon: React.ReactNode;
  titulo: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-2xl border border-border bg-white p-5 shadow-sm", className)}>
      <div className="mb-3 flex items-center gap-2 text-navy">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-navy/5">{icon}</span>
        <h3 className="font-serif text-lg">{titulo}</h3>
      </div>
      {children}
    </section>
  );
}
