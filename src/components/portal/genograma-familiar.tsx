import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Minus, Plus, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { iniciais } from "@/components/portal/elementos-mockup";
import type { PessoaNaArvore } from "@/lib/arvore-publicacao";
import type { VinculoArvoreCliente } from "@/lib/portal-dados-vivos.functions";
import { enquadramentoGenograma, layoutGenograma } from "./genograma-layout";

/** Only published people and explicit relationships are drawn. */
export function GenogramaFamiliar({ pessoas, vinculos, raizId }: { pessoas: PessoaNaArvore[]; vinculos: readonly VinculoArvoreCliente[]; raizId?: string }) {
  const [zoom, setZoom] = useState(1);
  const [selecionada, setSelecionada] = useState<string | null>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const gesto = useRef<{ x: number; y: number; left: number; top: number } | null>(null);
  const layout = useMemo(() => layoutGenograma(pessoas), [pessoas]);
  const porId = new Map(layout.nos.map((n) => [n.pessoa.chave, n]));
  const pessoa = pessoas.find((p) => p.chave === selecionada);
  const enquadrar = useCallback(() => {
    const el = viewport.current;
    if (!el) return;
    const quadro = enquadramentoGenograma(layout.largura, el.clientWidth);
    setSelecionada(null);
    setZoom(quadro.zoom);
    requestAnimationFrame(() => el.scrollTo({ left: quadro.left, top: quadro.top }));
  }, [layout.largura]);
  useEffect(() => { enquadrar(); }, [enquadrar]);
  useEffect(() => {
    const no = layout.nos.find((n) => n.pessoa.chave === selecionada);
    const el = viewport.current;
    if (!no || !el) return;
    el.scrollTo({ left: no.x * zoom - el.clientWidth / 2, top: no.y * zoom - el.clientHeight / 2, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }, [selecionada, zoom, layout.nos]);
  return (
    <div data-genograma-familiar>
      <div className="app-genograma-toolbar">
        <label className="text-sm text-navy">Pessoa <select aria-label="Focar pessoa" value={selecionada ?? ""} onChange={(e) => setSelecionada(e.target.value || null)}><option value="">Toda a família</option>{pessoas.map((p) => <option key={p.chave} value={p.chave}>{p.nome}</option>)}</select></label>
        <div className="flex items-center gap-1" role="group" aria-label="Ampliação da árvore">
          <Button variant="ghost" size="icon" title="Diminuir" aria-label="Diminuir árvore" disabled={zoom <= 0.4} onClick={() => setZoom((z) => Math.max(0.4, z - 0.2))}><Minus /></Button>
          <span className="w-12 text-center text-xs text-navy" aria-live="polite">{Math.round(zoom * 100)}%</span>
          <Button variant="ghost" size="icon" title="Ampliar" aria-label="Ampliar árvore" disabled={zoom >= 2} onClick={() => setZoom((z) => Math.min(2, z + 0.2))}><Plus /></Button>
          <Button variant="ghost" size="icon" title="Restaurar visão" aria-label="Restaurar visão da árvore" onClick={enquadrar}><RotateCcw /></Button>
        </div>
      </div>
      <div className="app-genograma-viewport" ref={viewport} tabIndex={0} aria-label="Genograma da família" onPointerDown={(e) => {
        if ((e.target as Element).closest('[role="button"]')) return;
        const el = e.currentTarget;
        gesto.current = { x: e.clientX, y: e.clientY, left: el.scrollLeft, top: el.scrollTop };
        el.setPointerCapture(e.pointerId);
      }} onPointerMove={(e) => {
        const g = gesto.current;
        if (!g) return;
        e.currentTarget.scrollLeft = g.left + g.x - e.clientX;
        e.currentTarget.scrollTop = g.top + g.y - e.clientY;
      }} onPointerUp={() => { gesto.current = null; }} onPointerCancel={() => { gesto.current = null; }}>
        <svg style={{ display: "block", margin: "0 auto" }} width={layout.largura * zoom} height={layout.altura * zoom} viewBox={`0 0 ${layout.largura} ${layout.altura}`} role="group" aria-label="Pessoas e relações publicadas">
          {vinculos.map((v, i) => {
            const a = porId.get(v.de), b = porId.get(v.para);
            if (!a || !b) return null;
            // Saída abaixo do rótulo (nome + geração) e chegada acima do círculo: nenhuma linha cruza nomes.
            const [sup, inf] = a.y <= b.y ? [a, b] : [b, a];
            const saida = sup.y + sup.geracaoY + 12, chegada = inf.y - 44, meio = (saida + chegada) / 2;
            const [esq, dir] = a.x <= b.x ? [a, b] : [b, a];
            const interposto = layout.nos.some((n) => n.y === esq.y && n.x > esq.x && n.x < dir.x);
            const uniao = interposto || esq.y !== dir.y
              ? `M${esq.x} ${esq.y - 40} V${Math.min(esq.y, dir.y) - 60} H${dir.x} V${dir.y - 40}`
              : `M${esq.x + 40} ${esq.y} L${dir.x - 40} ${dir.y}`;
            // Skipped generations use an outside lane, not intermediate people's labels.
            const intermediario = layout.nos.some((n) => n.y > sup.y && n.y < inf.y);
            const corredor = layout.largura - 20 - (i % 4) * 6;
            const filiacao = a.y === b.y
              ? `M${a.x} ${a.y - 40} V${a.y - 74} H${b.x} V${b.y - 40}`
              : intermediario
                ? `M${sup.x} ${saida} V${saida + 18} H${corredor} V${chegada - 18} H${inf.x} V${chegada}`
                : `M${sup.x} ${saida} V${meio} H${inf.x} V${chegada}`;
            return <path key={`${v.de}-${v.para}-${i}`} data-de={v.de} data-para={v.para} className={v.tipo === "conjuge" ? "app-genograma-uniao" : "app-genograma-filiacao"} d={v.tipo === "conjuge" ? uniao : filiacao}><title>{a.pessoa.nome} · {v.tipo === "conjuge" ? "União" : "Filiação"} · {b.pessoa.nome}</title></path>;
          })}
          {layout.nos.map(({ pessoa: p, x, y, linhas, geracaoY }) => (
            <g key={p.chave} transform={`translate(${x} ${y})`} role="button" tabIndex={0} aria-label={`Abrir ${p.nome}`} aria-pressed={p.chave === selecionada} data-genograma-no data-raiz={p.chave === raizId || undefined} onClick={() => setSelecionada(p.chave)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelecionada(p.chave); } }}>
              <circle r={36} className="app-genograma-circulo" />
              <text textAnchor="middle" dominantBaseline="central" className="app-genograma-iniciais">{iniciais(p.nome)}</text>
              <text textAnchor="middle" y={56} className="app-genograma-nome">{linhas.map((linha, i) => <tspan key={i} x={0} dy={i === 0 ? 0 : 17}>{linha}</tspan>)}</text>
              <text textAnchor="middle" y={geracaoY} className="app-genograma-geracao">G{p.geracao}{p.geracao === 1 ? " · Você" : ""}</text>
            </g>
          ))}
        </svg>
      </div>
      <div className="mt-3 flex flex-wrap gap-4 text-xs text-navy/70"><span className="app-genograma-legenda" data-tipo="filiacao">Filiação</span><span className="app-genograma-legenda" data-tipo="uniao">União</span></div>
      {pessoa ? <section className="app-genograma-detalhe" aria-live="polite"><div className="flex items-center justify-between gap-3"><h3 className="font-serif text-xl text-navy">{pessoa.nome}</h3><Button size="icon" variant="ghost" aria-label="Fechar pessoa" onClick={() => setSelecionada(null)}><X /></Button></div><p className="mt-2 text-sm text-navy/75">{pessoa.vinculo ?? "O vínculo será apresentado quando for compartilhado pela equipe."}</p></section> : null}
    </div>
  );
}