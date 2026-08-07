/**
 * Ancestral Canvas — Entrega Consultiva (Etapa 01 → Etapa 02).
 *
 * Tela de "primeira entrega" com CTA direto para o próximo passo pago.
 * Template reaproveitável para qualquer caso de cidadania europeia.
 */

import { useState } from "react";
import { cn } from "@/lib/utils";
import { brl, type Caso } from "@/data/casos";
import {
  CASO_MODELO,
  CHECKLIST_LABEL,
  ESTADO_ENTREGA_LABEL,
  VIA_LABEL,
  entregaByCaso,
  textoWhatsapp,
  type EntregaConsultiva,
  type EstadoEntrega,
} from "@/data/entrega-consultiva";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  CircleAlert,
  Clock,
  Copy,
  CreditCard,
  FileText,
  MessageCircle,
  Scale,
  Sparkles,
  X,
} from "lucide-react";

const ESTADOS: EstadoEntrega[] = ["etapa-01-entregue", "etapa-02-pendente", "etapa-02-andamento", "etapa-02-concluida"];

export function EntregaConsultivaTab({ caso }: { caso: Caso }) {
  const [modelo, setModelo] = useState(false);
  const base = modelo ? CASO_MODELO : entregaByCaso(caso);
  const [estado, setEstado] = useState<EstadoEntrega | null>(null);
  const entrega: EntregaConsultiva = { ...base, estado: estado ?? base.estado };
  const [checkout, setCheckout] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const pago = entrega.estado === "etapa-02-andamento" || entrega.estado === "etapa-02-concluida";

  return (
    <div className="space-y-4 p-5 lg:mx-auto lg:max-w-5xl">
      {/* alternador de exemplo / estados (uso interno da demonstração) */}
      <div data-print-hide className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-white p-3">
        <span className="text-[11px] uppercase tracking-widest text-navy/60">Visualizar</span>
        <button
          onClick={() => {
            setModelo((m) => !m);
            setEstado(null);
          }}
          className={cn(
            "rounded-full border px-3 py-1 text-[11px] font-semibold transition",
            modelo ? "border-navy bg-navy text-cream" : "border-navy/25 text-navy hover:bg-navy/5",
          )}
        >
          Caso modelo (Sophi Piccoli)
        </button>
        {ESTADOS.map((e) => (
          <button
            key={e}
            onClick={() => setEstado(e)}
            className={cn(
              "rounded-full border px-3 py-1 text-[11px] font-semibold transition",
              entrega.estado === e ? "border-gold bg-gold text-navy" : "border-navy/25 text-navy hover:bg-navy/5",
            )}
          >
            {ESTADO_ENTREGA_LABEL[e]}
          </button>
        ))}
      </div>

      {/* Cabeçalho do caso */}
      <section className="rounded-2xl bg-gradient-to-br from-navy to-navy-soft p-5 text-cream shadow-lg">
        <div className="text-[11px] uppercase tracking-widest text-gold/80">Entrega 1 · Leitura inicial do seu caso</div>
        <h2 className="mt-1 font-serif text-2xl italic">{entrega.pessoa}</h2>
        <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
          <Tag>{entrega.paisPrincipal}</Tag>
          <Tag>{VIA_LABEL[entrega.via]}</Tag>
          <Tag tone="gold">{ESTADO_ENTREGA_LABEL[entrega.estado]}</Tag>
        </div>
        <p className="mt-3 text-[12px] text-cream/80">
          Esta é a sua primeira entrega: um diagnóstico sintético com checklist. O aprofundamento e o desenho do caminho
          são a Etapa 02, logo abaixo.
        </p>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Bloco 1 — leitura inicial */}
        <Card icon={<Sparkles className="h-4 w-4" />} titulo="Leitura inicial da sua linha">
          <ol className="space-y-2">
            {entrega.leituraInicial.linha.map((l, i) => (
              <li key={l + i} className="flex items-start gap-3">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gold/20 text-[11px] font-semibold text-navy">
                  {i + 1}
                </span>
                <span className="text-sm text-navy">{l}</span>
              </li>
            ))}
          </ol>
          <p className="mt-3 border-l-2 border-gold pl-3 text-[13px] leading-relaxed text-navy/80">
            {entrega.leituraInicial.resumo}
          </p>
        </Card>

        {/* Bloco 2 — elegibilidade sintética */}
        <Card icon={<Scale className="h-4 w-4" />} titulo="Elegibilidade — em linguagem simples">
          <div
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold",
              entrega.elegibilidade.viavel ? "bg-sage/15 text-sage" : "bg-terracotta/15 text-terracotta",
            )}
          >
            <BadgeCheck className="h-3.5 w-3.5" />
            {entrega.elegibilidade.viavel ? "Há viabilidade" : "Requer análise adicional"}
          </div>
          <div className="mt-3 text-sm font-medium text-navy">{entrega.elegibilidade.cenario}</div>
          <p className="mt-2 text-[13px] leading-relaxed text-navy/80">{entrega.elegibilidade.texto}</p>
        </Card>

        {/* Bloco 3 — checklist mínimo */}
        <Card icon={<FileText className="h-4 w-4" />} titulo="Checklist mínimo de documentos" className="lg:col-span-2">
          <ul className="grid gap-2 sm:grid-cols-2">
            {entrega.checklist.map((c) => (
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

      {/* Bloco 4 — próximo passo pago */}
      <section className="rounded-2xl border-2 border-gold bg-white p-5 shadow-lg">
        <div className="text-[11px] uppercase tracking-widest text-navy/60">Etapa 02 · Aprofundar e desenhar seu caminho</div>
        <h3 className="mt-1 font-serif text-xl text-navy">{entrega.proximoPasso.servico}</h3>
        <p className="mt-2 text-[13px] leading-relaxed text-navy/80">{entrega.proximoPasso.descricao}</p>
        <p className="mt-2 border-l-2 border-gold pl-3 text-[13px] font-medium text-navy">{entrega.proximoPasso.beneficio}</p>

        <div className="mt-4 flex flex-wrap items-end justify-between gap-3 rounded-xl bg-cream p-4">
          <div>
            <div className="text-[11px] uppercase tracking-wide text-navy/60">Investimento</div>
            <div className="font-serif text-2xl text-navy">
              {brl(entrega.proximoPasso.valor)}
              {entrega.proximoPasso.valorAte ? ` – ${brl(entrega.proximoPasso.valorAte)}` : ""}
            </div>
            <div className="mt-1 inline-flex items-center gap-1 text-[11px] text-navy/70">
              <Clock className="h-3.5 w-3.5" /> {entrega.proximoPasso.prazo}
            </div>
          </div>
          {pago ? (
            <div className="inline-flex items-center gap-2 rounded-full bg-sage px-4 py-2 text-xs font-semibold text-cream">
              <Check className="h-4 w-4" /> Etapa 02 confirmada
            </div>
          ) : (
            <button
              onClick={() => setCheckout(true)}
              className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-navy transition hover:bg-gold/90"
            >
              Quero avançar para a Etapa 02 <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
        <p className="mt-3 text-[11px] text-navy/60">
          Sem reunião obrigatória: você avança pelo app e recebe a entrega por aqui e no WhatsApp.
        </p>
      </section>

      {/* Texto-base de WhatsApp */}
      <section data-print-hide className="rounded-2xl border border-border bg-white p-5">
        <div className="mb-2 flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-navy" />
          <h3 className="font-serif text-lg text-navy">Mensagem de WhatsApp (modelo)</h3>
        </div>
        <pre className="whitespace-pre-wrap rounded-xl bg-cream p-4 text-[12px] leading-relaxed text-navy/85">
          {textoWhatsapp(entrega)}
        </pre>
        <button
          onClick={() => {
            void navigator.clipboard?.writeText(textoWhatsapp(entrega));
            setCopiado(true);
            window.setTimeout(() => setCopiado(false), 1800);
          }}
          className="mt-3 inline-flex items-center gap-2 rounded-full border border-navy/25 px-4 py-1.5 text-[12px] font-semibold text-navy transition hover:bg-navy/5"
        >
          <Copy className="h-3.5 w-3.5" /> {copiado ? "Copiado!" : "Copiar mensagem"}
        </button>
      </section>

      {checkout && (
        <CheckoutModal
          entrega={entrega}
          onClose={() => setCheckout(false)}
          onConfirmar={() => {
            setEstado("etapa-02-andamento");
            setCheckout(false);
          }}
        />
      )}
    </div>
  );
}

function CheckoutModal({
  entrega,
  onClose,
  onConfirmar,
}: {
  entrega: EntregaConsultiva;
  onClose: () => void;
  onConfirmar: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-navy/50 p-0 sm:place-items-center sm:p-6" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-widest text-navy/60">Resumo da Etapa 02</div>
            <h3 className="mt-1 font-serif text-xl text-navy">{entrega.proximoPasso.servico}</h3>
          </div>
          <button onClick={onClose} aria-label="Fechar" className="rounded-full p-1 text-navy/60 hover:bg-navy/5">
            <X className="h-5 w-5" />
          </button>
        </div>

        <ul className="mt-4 space-y-2 text-[13px] text-navy/80">
          <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-sage" /> Análise completa da linha ({entrega.paisPrincipal})</li>
          <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-sage" /> Verificação documento a documento</li>
          <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-sage" /> Desenho da via ({VIA_LABEL[entrega.via].toLowerCase()}) com prazos e custos</li>
          <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-sage" /> {entrega.proximoPasso.prazo}</li>
        </ul>

        <div className="mt-4 flex items-center justify-between rounded-xl bg-cream p-4">
          <span className="text-[12px] text-navy/70">Total</span>
          <span className="font-serif text-2xl text-navy">{brl(entrega.proximoPasso.valor)}</span>
        </div>

        <button
          onClick={onConfirmar}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-navy py-3 text-sm font-semibold text-cream transition hover:bg-navy-soft"
        >
          <CreditCard className="h-4 w-4" /> Ir para o pagamento
        </button>
        <div className="mt-2 truncate text-center text-[11px] text-navy/50">{entrega.proximoPasso.linkPagamento}</div>
      </div>
    </div>
  );
}

function Tag({ children, tone }: { children: React.ReactNode; tone?: "gold" }) {
  return (
    <span
      className={cn(
        "rounded-full px-3 py-1 font-semibold",
        tone === "gold" ? "bg-gold text-navy" : "bg-cream/15 text-cream",
      )}
    >
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
