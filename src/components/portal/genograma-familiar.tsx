import { useEffect, useMemo, useRef, useState } from "react";
import { Minus, Plus, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { iniciais } from "@/components/portal/elementos-mockup";
import type { PessoaNaArvore } from "@/lib/arvore-publicacao";
import type { VinculoArvoreCliente } from "@/lib/portal-dados-vivos.functions";

/** Only published people and explicit relationships are drawn. */
export function GenogramaFamiliar({ pessoas, vinculos }: { pessoas: PessoaNaArvore[]; vinculos: readonly VinculoArvoreCliente[] }) {
  const [zoom, setZoom] = useState(1);
  const [selecionada, setSelecionada] = useState<string | null>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const gesto = useRef<{ x: number; y: number; left: number; top: number } | null>(null);
  const layout = useMemo(() => {
    const geracoes = [...new Set(pessoas.map((p) => p.geracao ?? 1))].sort((a, b) => b - a);
    const largura = Math.max(540, ...geracoes.map((g) => pessoas.filter((p) => p.geracao === g).length * 190 + 80));
    const nos = geracoes.flatMap((g, linha) => {
      const grupo = pessoas.filter((p) => (p.geracao ?? 1) === g);
      return grupo.map((p, coluna) => ({ pessoa: p, x: largura / 2 + (coluna - (grupo.length - 1) / 2) * 190, y: 90 + linha * 230 }));
    });
    return { nos, largura, altura: Math.max(340, geracoes.length * 230 + 10) };
  }, [pessoas]);
  const porId = new Map(layout.nos.map((n) => [n.pessoa.chave, n]));
  const pessoa = pessoas.find((p) => p.chave === selecionada);
  useEffect(() => {
    const el = viewport.current;
    if (!el) return;
    setZoom(Math.min(1, Math.max(0.4, el.clientWidth / layout.largura)));
  }, [layout.largura]);
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
          <Button variant="ghost" size="icon" title="Restaurar visão" aria-label="Restaurar visão da árvore" onClick={() => { setZoom(1); setSelecionada(null); viewport.current?.scrollTo({ left: 0, top: 0 }); }}><RotateCcw /></Button>
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
            const saida = sup.y + 102, chegada = inf.y - 44, meio = (saida + chegada) / 2;
            const [esq, dir] = a.x <= b.x ? [a, b] : [b, a];
            return <path key={`${v.de}-${v.para}-${i}`} className={v.tipo === "conjuge" ? "app-genograma-uniao" : "app-genograma-filiacao"} d={v.tipo === "conjuge" ? `M${esq.x + 40} ${esq.y} L${dir.x - 40} ${dir.y}` : `M${sup.x} ${saida} V${meio} H${inf.x} V${chegada}`}><title>{a.pessoa.nome} · {v.tipo === "conjuge" ? "União" : "Filiação"} · {b.pessoa.nome}</title></path>;
          })}
          {layout.nos.map(({ pessoa: p, x, y }) => (
            <g key={p.chave} transform={`translate(${x} ${y})`} role="button" tabIndex={0} aria-label={`Abrir ${p.nome}`} aria-pressed={p.chave === selecionada} data-genograma-no data-raiz={p.nome.trim().toLocaleLowerCase("pt-BR") === "otto reimer" || undefined} onClick={() => setSelecionada(p.chave)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelecionada(p.chave); } }}>
              <circle r={36} className="app-genograma-circulo" />
              <text textAnchor="middle" dominantBaseline="central" className="app-genograma-iniciais">{iniciais(p.nome)}</text>
              <text textAnchor="middle" y={56} className="app-genograma-nome">{p.nome.split(/\s+/).slice(0, 2).join(" ")}<tspan x={0} dy={17}>{p.nome.split(/\s+/).slice(2).join(" ")}</tspan></text>
              <text textAnchor="middle" y={91} className="app-genograma-geracao">G{p.geracao}{p.geracao === 1 ? " · Você" : ""}</text>
            </g>
          ))}
        </svg>
      </div>
      <div className="mt-3 flex flex-wrap gap-4 text-xs text-navy/70"><span className="app-genograma-legenda" data-tipo="filiacao">Filiação</span><span className="app-genograma-legenda" data-tipo="uniao">União</span></div>
      {pessoa ? <section className="app-genograma-detalhe" aria-live="polite"><div className="flex items-center justify-between gap-3"><h3 className="font-serif text-xl text-navy">{pessoa.nome}</h3><Button size="icon" variant="ghost" aria-label="Fechar pessoa" onClick={() => setSelecionada(null)}><X /></Button></div><p className="mt-2 text-sm text-navy/75">{pessoa.vinculo ?? "O vínculo será apresentado quando for compartilhado pela equipe."}</p></section> : null}
    </div>
  );
}