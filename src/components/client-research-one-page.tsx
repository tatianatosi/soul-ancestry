import { useRef, useState } from "react";
import { X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandLogo } from "./brand";
import { limparCopy, limparLista } from "@/lib/client-copy";
import type { ClientOnePageData, OnePageStatus } from "@/data/client-one-page";

/**
 * ClientResearchOnePage — devolutiva inicial cliente-facing, vertical.
 * Template puro: todo conteúdo vem de `data` (ver `src/data/client-one-page.ts`).
 */

/** Badges simplificados (rótulos curtos aprovados). */
const STATUS_BADGE: Record<string, string> = {
  "informação compartilhada pela família": "Informação familiar",
  "dado de pesquisa inicial": "Pesquisa inicial",
  "em validação documental": "Em validação documental",
  "em confirmação": "Em validação documental",
};

const STATUS_TOM: Record<string, string> = {
  "Informação familiar": "border-sage/40 bg-sage/10 text-sage",
  "Pesquisa inicial": "border-plum/40 bg-plum/10 text-plum",
  "Em validação documental": "border-gold/50 bg-gold/15 text-navy",
};

const statusLabel = (s?: OnePageStatus) => {
  const bruto = limparCopy(s).toLowerCase();
  return STATUS_BADGE[bruto] ?? "Em validação documental";
};

export type OnePageFormato = "whatsapp" | "pdf";

export function ClientResearchOnePage({
  data,
  className,
  formato = "whatsapp",
  exportMode = false,
}: {
  data: ClientOnePageData;
  className?: string;
  /** whatsapp: vertical completo · pdf: condensado (3 achados / 3 pendências) */
  formato?: OnePageFormato;
  /** Sem CTA interativo e sem qualquer elemento de navegação. */
  exportMode?: boolean;
}) {
  const [modal, setModal] = useState(false);

  const nome = limparCopy(data.displayName);
  if (!nome) return null;

  const titulo = limparCopy(data.title);
  const subtitulo = limparCopy(data.subtitle);
  const intro = limparCopy(data.readingIntro);
  const relevancia = limparCopy(data.relevanceText);
  const rodape = limparCopy(data.footer);

  const achados = (data.findings ?? [])
    .map((f) => ({
      title: limparCopy(f.title),
      detail: limparCopy(f.detail),
      status: statusLabel(f.status),
    }))
    .filter((f) => f.title || f.detail)
    .slice(0, formato === "pdf" ? 3 : 5);

  const pendencias = limparLista(data.confirmations ?? []).slice(0, formato === "pdf" ? 3 : 5);

  const etapa = data.recommendedNextStep;
  const etapaTitulo = limparCopy(etapa?.title);
  const etapaDesc = limparCopy(etapa?.description);
  const etapaItens = limparLista(etapa?.items ?? []);

  return (
    <div className={cn("mx-auto w-full max-w-md bg-cream", className)}>
      <div className="flex flex-col gap-7 px-6 py-8">
        {/* 1. Cabeçalho */}
        <header className="flex items-center justify-between gap-3">
          <BrandLogo size={34} showText={false} />
          <span className="rounded-full border border-navy/20 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-navy/70">
            Leitura inicial
          </span>
        </header>

        {/* 2. Título */}
        <div className="border-l-2 border-gold pl-4">
          {titulo && <h1 className="font-serif text-2xl italic leading-tight text-navy">{titulo}</h1>}
          {subtitulo && <p className="mt-2 text-sm leading-relaxed text-navy/70">{subtitulo}</p>}
        </div>

        {/* 3. Leitura inicial */}
        {intro && (
          <section className="rounded-2xl border border-navy/10 bg-areia/60 p-5">
            <p className="text-[13.5px] leading-relaxed text-navy/85">{intro}</p>
          </section>
        )}

        {/* 4. O que já identificamos */}
        {achados.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-navy/60">
              O que já identificamos
            </h2>
            {achados.map((f, i) => (
              <article
                key={i}
                className="rounded-2xl border border-navy/10 bg-white/70 p-4 shadow-[0_1px_0_rgba(27,43,75,0.04)]"
              >
                {f.title && (
                  <h3 className="font-serif text-base italic leading-snug text-navy">{f.title}</h3>
                )}
                {f.detail && (
                  <p className="mt-1.5 text-[13px] leading-relaxed text-navy/75">{f.detail}</p>
                )}
                <span
                  className={cn(
                    "mt-3 inline-block rounded-full border px-2.5 py-1 text-[10.5px] font-medium",
                    STATUS_TOM[f.status] ?? STATUS_TOM["em confirmação"],
                  )}
                >
                  {f.status}
                </span>
              </article>
            ))}
          </section>
        )}

        {/* 5. O que ainda precisamos confirmar */}
        {pendencias.length > 0 && (
          <section>
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-navy/60">
              O que ainda precisamos confirmar
            </h2>
            <ol className="mt-3 flex flex-col gap-2.5">
              {pendencias.map((p, i) => (
                <li key={i} className="flex gap-3 text-[13px] leading-relaxed text-navy/80">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border border-gold/60 text-[11px] font-semibold text-navy">
                    {i + 1}
                  </span>
                  <span>{p}</span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* 6. Por que isso é relevante */}
        {relevancia && (
          <section className="rounded-2xl border border-gold/40 bg-gold/10 p-5">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-navy/70">
              Por que isso é relevante
            </h2>
            <p className="mt-2 text-[13.5px] leading-relaxed text-navy/85">{relevancia}</p>
          </section>
        )}

        {/* 7. Próxima etapa recomendada */}
        {(etapaTitulo || etapaDesc || etapaItens.length > 0) && (
          <section className="rounded-2xl bg-navy p-5 text-cream">
            <div className="text-[10.5px] uppercase tracking-[0.18em] text-gold/80">
              Próxima etapa recomendada
            </div>
            {etapaTitulo && (
              <h2 className="mt-2 font-serif text-lg italic leading-snug text-cream">{etapaTitulo}</h2>
            )}
            {etapaDesc && (
              <p className="mt-2 text-[13px] leading-relaxed text-cream/80">{etapaDesc}</p>
            )}
            {etapaItens.length > 0 && (
              <ul className="mt-4 flex flex-col gap-2">
                {etapaItens.map((it, i) => (
                  <li key={i} className="flex gap-2.5 text-[13px] leading-relaxed text-cream/90">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {/* 8. CTA neutro */}
        <section className="text-center">
          <p className="text-[13.5px] leading-relaxed text-navy/80">
            Se fizer sentido, posso te explicar como funcionaria esta próxima etapa.
          </p>
          {!exportMode && (
            <button
              type="button"
              onClick={() => setModal(true)}
              className="mt-4 w-full rounded-full bg-gold px-5 py-3 text-sm font-semibold text-navy transition hover:bg-gold/90"
            >
              Quero entender a próxima etapa
            </button>
          )}
        </section>

        {/* 9. Rodapé */}
        {rodape && (
          <footer className="border-t border-navy/10 pt-5">
            <p className="text-[11.5px] leading-relaxed text-navy/60">{rodape}</p>
          </footer>
        )}
      </div>

      {!exportMode && modal && (
        <div
          className="fixed inset-0 z-[70] grid place-items-center bg-navy/60 p-6"
          role="dialog"
          aria-modal="true"
          onClick={() => setModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-cream p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm leading-relaxed text-navy">
              Fale com sua consultoria para receber o escopo da próxima etapa.
            </p>
            <button
              type="button"
              onClick={() => setModal(false)}
              className="mt-5 rounded-full border border-navy/20 px-5 py-2 text-sm text-navy"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/** Texto plano para envio manual no WhatsApp (sem link, preço ou código). */
function textoWhatsapp(data: ClientOnePageData, formato: OnePageFormato): string {
  const lim = formato === "pdf" ? 3 : 5;
  const linhas: string[] = [];
  const intro = limparCopy(data.whatsappIntro) || limparCopy(data.readingIntro);
  if (intro) linhas.push(intro, "");
  const achados = (data.findings ?? [])
    .map((f) => `• ${limparCopy(f.title)}${limparCopy(f.detail) ? ` — ${limparCopy(f.detail)}` : ""}`)
    .filter((l) => l.length > 2)
    .slice(0, lim);
  if (achados.length) linhas.push("O que já identificamos:", ...achados, "");
  const pend = limparLista(data.confirmations ?? []).slice(0, lim);
  if (pend.length) linhas.push("O que ainda precisamos confirmar:", ...pend.map((p) => `• ${p}`), "");
  const seg = limparCopy(data.whatsappFollowUp);
  if (seg) linhas.push(seg, "");
  const rodape = limparCopy(data.footer);
  if (rodape) linhas.push(rodape);
  return linhas.join("\n").trim();
}

/** Render limpo para captura/exportação: sem barra, sem título, sem X, sem moldura. */
export function ClientResearchOnePageExport({
  data,
  formato = "whatsapp",
  className,
}: {
  data: ClientOnePageData;
  formato?: OnePageFormato;
  className?: string;
}) {
  return (
    <div data-export-area data-formato={formato} className={cn("bg-cream", className)}>
      <ClientResearchOnePage data={data} formato={formato} exportMode />
    </div>
  );
}

/** Preview interno em modal — usado pelo botão “Ver devolutiva inicial”. */
export function ClientResearchOnePageModal({
  data,
  onClose,
}: {
  data: ClientOnePageData;
  onClose: () => void;
}) {
  const [formato, setFormato] = useState<OnePageFormato>("whatsapp");
  const [aviso, setAviso] = useState<string>("");
  const [ocupado, setOcupado] = useState(false);
  const areaRef = useRef<HTMLDivElement>(null);

  const notificar = (msg: string) => {
    setAviso(msg);
    window.setTimeout(() => setAviso(""), 3200);
  };

  const nomeArquivo = (ext: string) =>
    `devolutiva-inicial-${limparCopy(data.displayName).toLowerCase().replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "")}-${formato}.${ext}`;

  const baixar = (href: string, nome: string) => {
    const a = document.createElement("a");
    a.href = href;
    a.download = nome;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const capturar = async () => {
    const node = areaRef.current;
    if (!node) throw new Error("sem area");
    const { toPng } = await import("html-to-image");
    return toPng(node, {
      pixelRatio: 2,
      cacheBust: true,
      backgroundColor: "#F5F0E8",
      width: node.offsetWidth,
      height: node.offsetHeight,
    });
  };

  const exportarPng = async () => {
    if (ocupado) return;
    setOcupado(true);
    try {
      const url = await capturar();
      baixar(url, nomeArquivo("png"));
      notificar("Imagem PNG baixada.");
    } catch {
      notificar("Não foi possível gerar a imagem.");
    } finally {
      setOcupado(false);
    }
  };

  const exportarPdf = async () => {
    if (ocupado) return;
    setOcupado(true);
    try {
      const url = await capturar();
      const img = new Image();
      img.src = url;
      await new Promise((res, rej) => {
        img.onload = res;
        img.onerror = rej;
      });
      const { jsPDF } = await import("jspdf");
      const largura = 420;
      const altura = (img.height / img.width) * largura;
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: [largura, altura],
      });
      pdf.addImage(url, "PNG", 0, 0, largura, altura);
      pdf.save(nomeArquivo("pdf"));
      notificar("PDF baixado.");
    } catch {
      notificar("Não foi possível gerar o PDF.");
    } finally {
      setOcupado(false);
    }
  };

  const copiarWhatsapp = async () => {
    const texto = textoWhatsapp(data, formato);
    try {
      await navigator.clipboard.writeText(texto);
      notificar("Texto copiado para a área de transferência.");
    } catch {
      notificar("Não foi possível copiar automaticamente.");
    }
  };

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-navy/70 p-0 sm:p-6">
      <div className="mx-auto w-full max-w-md overflow-hidden rounded-none bg-cream sm:rounded-3xl">
        {/* Barra e ações: uso interno, nunca entram na exportação */}
        <div
          data-print-hide
          className="sticky top-0 z-10 border-b border-navy/10 bg-cream/95 px-5 py-3 backdrop-blur"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-[0.16em] text-navy/60">
              Devolutiva inicial
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar devolutiva"
              className="grid h-8 w-8 place-items-center rounded-full border border-navy/15 text-navy"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-3 flex gap-1 rounded-full border border-navy/15 bg-white/60 p-1">
            {(["whatsapp", "pdf"] as OnePageFormato[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFormato(f)}
                className={cn(
                  "flex-1 rounded-full px-3 py-1.5 text-[11px] font-medium transition",
                  formato === f ? "bg-navy text-cream" : "text-navy/70 hover:bg-navy/5",
                )}
              >
                {f === "whatsapp" ? "WhatsApp vertical" : "PDF condensado"}
              </button>
            ))}
          </div>

          <div className="mt-2 grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={copiarWhatsapp}
              className="rounded-full border border-navy/20 px-2 py-1.5 text-[10.5px] font-medium text-navy transition hover:bg-navy/5"
            >
              Copiar texto WhatsApp
            </button>
            <button
              type="button"
              disabled={ocupado}
              onClick={exportarPng}
              className="rounded-full border border-navy/20 px-2 py-1.5 text-[10.5px] font-medium text-navy transition hover:bg-navy/5 disabled:opacity-50"
            >
              {ocupado ? "Gerando…" : "Baixar PNG"}
            </button>
            <button
              type="button"
              disabled={ocupado}
              onClick={exportarPdf}
              className="rounded-full border border-navy/20 px-2 py-1.5 text-[10.5px] font-medium text-navy transition hover:bg-navy/5 disabled:opacity-50"
            >
              {ocupado ? "Gerando…" : "Baixar PDF"}
            </button>
          </div>

          {aviso && (
            <p className="mt-2 flex items-center gap-1.5 text-[11px] text-sage">
              <Check className="h-3.5 w-3.5" />
              {aviso}
            </p>
          )}
        </div>

        <div ref={areaRef}>
          <ClientResearchOnePageExport data={data} formato={formato} />
        </div>
      </div>

    </div>
  );
}

