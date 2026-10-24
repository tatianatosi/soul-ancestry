/**
 * Radar interno do shell de go-live.
 *
 * Só apresentação: lê a carteira autorizada que o motor aprovado
 * (`carregarGoLive`) já devolve por organização, sem criar dado, sem inferir
 * elegibilidade e sem percentual jurídico. Registros arquivados, demo e de
 * teste ficam fora da leitura.
 *
 * Três blocos: matriz urgência × prontidão (um ponto por caso, com legenda
 * numerada fora do desenho), radar individual de quatro eixos do caso
 * selecionado e ordem de atendimento com a regra escrita na tela.
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { Bloco, FaixaKpis, GoLiveShell, GradeDesk } from "@/components/golive/shell";
import { FaixaIdentidade } from "@/components/golive/identidade";
import { useGoLive, buscaGoLive } from "@/components/golive/dados";
import { Button } from "@/components/ui/button";
import {
  diasAte,
  eixosDoCaso,
  leadsNoRadar,
  ordemDeAtendimento,
  pontosDaMatriz,
  type CasoRadar,
  type LeadRadar,
} from "@/lib/golive-radar";
import { impactoNaArvore } from "@/lib/golive-pesquisa";
import { dataHumana, humano } from "@/lib/rotulos-golive";

export const Route = createFileRoute("/_authenticated/golive/radar")({
  validateSearch: buscaGoLive,
  head: () => ({
    meta: [
      { title: "Radar interno — Go-live Clube Ancestral" },
      { name: "description", content: "Matriz de urgência e prontidão, radar de quatro eixos e ordem de atendimento." },
      { property: "og:title", content: "Radar interno — Go-live Clube Ancestral" },
      { property: "og:description", content: "Matriz de atenção e ordem de atendimento da carteira." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RadarGoLive,
});

const SEM_DADO = "Dados insuficientes para radar.";

function SemDado() {
  return (
    <div className="space-y-3">
      <p className="text-sm text-navy/60">{SEM_DADO}</p>
      <Link search={true} to="/golive/caso">
        <Button size="sm">Abrir Caso 360</Button>
      </Link>
    </div>
  );
}

function RadarGoLive() {
  const { data, isPending, error } = useGoLive();
  const caso = data?.encontrado ? data : null;
  const carteira = useMemo<CasoRadar[]>(() => (caso?.carteira ?? []) as CasoRadar[], [caso]);
  const [selecionadoId, setSelecionadoId] = useState<string | null>(null);

  const pontos = useMemo(() => pontosDaMatriz(carteira), [carteira]);
  const ordem = useMemo(() => ordemDeAtendimento(carteira), [carteira]);
  /** Mesma fonte do Comercial: leads já gravados da organização. */
  const leads = useMemo(
    () => leadsNoRadar((caso?.leadsComerciais ?? []) as LeadRadar[]),
    [caso],
  );

  const selecionado =
    carteira.find((c) => c.id === selecionadoId) ??
    carteira.find((c) => c.id === caso?.caso.id) ??
    ordem[0]?.caso ??
    null;
  const vencidos = ordem.filter((linha) => linha.dias !== null && linha.dias < 0).length;
  const semProxima = carteira.filter((item) => !item.proximaAcao).length;
  const externos = carteira.filter((item) => item.aguardandoExterno).length;

  return (
    <GoLiveShell titulo="Radar interno" descricao="Quem precisa de atenção primeiro — e por quê.">
      {isPending ? <p className="text-sm text-navy/60">Carregando…</p> : null}
      {error ? <p className="text-sm text-[var(--terracota,#9A3A2F)]">Não foi possível carregar agora.</p> : null}

      {caso ? <FaixaIdentidade dados={caso} /> : null}

      <FaixaKpis itens={[
        { rotulo: "Carteira", valor: carteira.length, tom: carteira.length ? "azul" : "cinza" },
        { rotulo: "Vencidos", valor: vencidos, tom: vencidos ? "terracota" : "cinza" },
        { rotulo: "Sem próxima ação", valor: semProxima, tom: semProxima ? "terracota" : "cinza" },
        { rotulo: "Aguardando externo", valor: externos, tom: externos ? "dourado" : "cinza" },
      ]} />

      <GradeDesk>
      <Bloco titulo="1. Matriz de atenção — urgência × prontidão">
        {pontos.length ? (
          <Matriz pontos={pontos} selecionadoId={selecionado?.id ?? null} aoSelecionar={setSelecionadoId} />
        ) : (
          <SemDado />
        )}
      </Bloco>

      <Bloco titulo="2. Radar do caso selecionado">
        {selecionado ? <Individual caso={selecionado} /> : <SemDado />}
      </Bloco>
      </GradeDesk>

      <GradeDesk>
      <Bloco titulo="3. Pesquisa aprovada no caso">
        {(() => {
          const impacto = impactoNaArvore(caso?.achados ?? []);
          if (!caso) return <SemDado />;
          return impacto.validados ? (
            <p className="text-sm text-navy">
              {impacto.validados} achado(s) aprovado(s) internamente · {impacto.aplicados} aplicado(s) e{" "}
              {impacto.propostos} proposto(s) na árvore. Aprovação interna não altera prazo nem publica para a família.
            </p>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-navy/60">Nenhum achado aprovado internamente ainda.</p>
              <Link search={true} to="/golive/pesquisa">
                <Button size="sm">Abrir Pesquisa</Button>
              </Link>
            </div>
          );
        })()}
      </Bloco>

      <Bloco titulo="4. Ordem de atendimento">
        {ordem.length ? (
          <>
            <p className="text-xs text-navy/55">
              Regra: prazo vencido primeiro, depois prioridade registrada, depois caso sem próxima ação e, por fim,
              espera externa.
            </p>
            <ol className="space-y-2 text-sm text-navy">
              {ordem.map((linha, i) => (
                <li key={linha.caso.id} className="min-w-0 rounded-xl border border-navy/10 bg-cream/60 p-3">
                  <p className="break-words font-medium">
                    {i + 1}. {linha.caso.titulo ?? linha.caso.codigo ?? "Caso sem título"}
                  </p>
                  <p className="text-navy/70">{linha.motivo}</p>
                  <p className="break-words text-xs text-navy/55">
                    {linha.caso.responsavel ? `Responsável: ${linha.caso.responsavel}` : "Sem responsável registrado"}
                    {" · "}
                    {linha.caso.prazoProximaAcao
                      ? `prazo ${dataHumana(linha.caso.prazoProximaAcao)}${
                          linha.dias === null ? "" : linha.dias < 0 ? " (vencido)" : linha.dias === 0 ? " (hoje)" : ` (em ${linha.dias} dias)`
                        }`
                      : "sem prazo registrado"}
                    {" · "}
                    {linha.caso.proximaAcao ? humano(linha.caso.proximaAcao) : "sem próxima ação"}
                    {linha.caso.alertasAbertos
                      ? ` · ${linha.caso.alertasAbertos} alerta${linha.caso.alertasAbertos === 1 ? "" : "s"} aberto${linha.caso.alertasAbertos === 1 ? "" : "s"}`
                      : ""}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => setSelecionadoId(linha.caso.id)}>
                      Ver no radar
                    </Button>
                    <Link search={true} to="/golive/caso">
                      <Button size="sm">Abrir Caso 360</Button>
                    </Link>
                  </div>
                </li>
              ))}
            </ol>
          </>
        ) : (
          <SemDado />
        )}
      </Bloco>
      </GradeDesk>

      <Bloco titulo="5. Leads em atenção">
        {leads.length ? (
          <ul className="space-y-2 text-sm text-navy">
            {leads.map((l) => (
              <li key={l.id} className="min-w-0 rounded-xl border border-navy/10 bg-cream/60 p-3">
                <p className="break-words font-medium">{l.nome}</p>
                <p className="break-words text-navy/70">
                  Etapa: {humano(l.etapa)} · Marco: {l.marco}
                </p>
                <p className="break-words text-xs text-navy/55">
                  {l.prazo
                    ? `Prazo ${dataHumana(l.prazo)}${
                        l.dias === null ? "" : l.dias < 0 ? " (vencido)" : l.dias === 0 ? " (hoje)" : ` (em ${l.dias} dias)`
                      }`
                    : "sem prazo registrado"}
                </p>
                {l.alerta ? (
                  <p className="mt-1 break-words text-xs text-[var(--terracota,#9A3A2F)]">{l.alerta}</p>
                ) : null}
                <div className="mt-2 flex flex-wrap gap-2">
                  <Link search={true} to="/golive/leads">
                    <Button size="sm" variant="outline">Abrir lead</Button>
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-navy/60">Sem itens nesta etapa.</p>
            <Link search={true} to="/golive/leads">
              <Button size="sm">Registrar lead</Button>
            </Link>
          </div>
        )}
      </Bloco>
    </GoLiveShell>
  );
}

function Matriz({
  pontos,
  selecionadoId,
  aoSelecionar,
}: {
  pontos: ReturnType<typeof pontosDaMatriz>;
  selecionadoId: string | null;
  aoSelecionar: (id: string) => void;
}) {
  // Margem interna para o ponto não encostar nas bordas da matriz.
  const MARGEM = 30;
  const posicao = (x: number, y: number) => ({
    cx: 60 + MARGEM + x * (210 - 2 * MARGEM),
    cy: 220 - MARGEM - y * (190 - 2 * MARGEM),
  });

  return (
    <>
      <div className="min-w-0 overflow-x-auto">
        <svg
          viewBox="0 0 340 260"
          role="img"
          aria-label={`Matriz de atenção com ${pontos.length} caso${pontos.length === 1 ? "" : "s"}.`}
          className="mx-auto h-auto w-full min-w-[300px] max-w-[440px]"
        >
          <rect x="60" y="30" width="210" height="190" fill="#fff" stroke="#2F4B6E" strokeOpacity="0.18" />
          <line x1="165" y1="30" x2="165" y2="220" stroke="#2F4B6E" strokeOpacity="0.12" />
          <line x1="60" y1="125" x2="270" y2="125" stroke="#2F4B6E" strokeOpacity="0.12" />

          <text x="112" y="48" textAnchor="middle" fontSize="9" fill="#2F4B6E" fillOpacity="0.55">Urgente, pouco pronto</text>
          <text x="218" y="48" textAnchor="middle" fontSize="9" fill="#2F4B6E" fillOpacity="0.55">Urgente e pronto</text>
          <text x="112" y="212" textAnchor="middle" fontSize="9" fill="#2F4B6E" fillOpacity="0.4">Acompanhar</text>
          <text x="218" y="212" textAnchor="middle" fontSize="9" fill="#2F4B6E" fillOpacity="0.4">Pronto, sem pressa</text>

          <text x="14" y="125" fontSize="10" fill="#2F4B6E" transform="rotate(-90 14 125)" textAnchor="middle">Urgência</text>
          <text x="165" y="246" fontSize="10" fill="#2F4B6E" textAnchor="middle">Prontidão do caso</text>

          {pontos.map((p) => {
            const { cx, cy } = posicao(p.x, p.y);
            const ativo = p.id === selecionadoId;
            return (
              <g key={p.id} onClick={() => aoSelecionar(p.id)} style={{ cursor: "pointer" }}>
                <circle cx={cx} cy={cy} r={ativo ? 9 : 7} fill={ativo ? "#9A3A2F" : "#2F4B6E"} />
                <text x={cx} y={cy + 3} textAnchor="middle" fontSize="8" fill="#fff" fontWeight="bold">
                  {p.indice}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Nome fora do desenho: numeração no ponto, identificação na legenda. */}
      <ol className="space-y-1 text-sm text-navy">
        {pontos.map((p) => (
          <li key={p.id}>
            <button
              type="button"
              onClick={() => aoSelecionar(p.id)}
              className={`break-words text-left ${p.id === selecionadoId ? "font-semibold text-navy" : "text-navy/75"}`}
            >
              {p.indice}. {p.rotulo}
            </button>
          </li>
        ))}
      </ol>
    </>
  );
}

function Individual({ caso }: { caso: CasoRadar }) {
  const eixos = eixosDoCaso(caso);
  const dias = diasAte(caso.prazoProximaAcao);

  const cx = 170;
  const cy = 120;
  const r = 72;
  const ponto = (i: number, fator: number) => {
    const ang = (Math.PI * 2 * i) / eixos.length - Math.PI / 2;
    return [cx + Math.cos(ang) * r * fator, cy + Math.sin(ang) * r * fator] as const;
  };

  const area = eixos.map((e, i) => ponto(i, Math.max(e.valor, 0.08)).join(",")).join(" ");
  const grade = eixos.map((_, i) => ponto(i, 1).join(",")).join(" ");

  return (
    <div className="space-y-3">
      <p className="break-words text-sm font-medium text-navy">{caso.titulo ?? caso.codigo ?? "Caso sem título"}</p>

      <div className="min-w-0 overflow-x-auto">
        <svg
          viewBox="0 0 340 250"
          role="img"
          aria-label={`Radar do caso: ${eixos.map((e) => `${e.rotulo} ${e.valor ? "concluído" : "pendente"}`).join(", ")}.`}
          className="mx-auto h-auto w-full min-w-[300px] max-w-[420px]"
        >
          <polygon points={grade} fill="none" stroke="#2F4B6E" strokeOpacity="0.15" />
          <polygon points={eixos.map((_, i) => ponto(i, 0.5).join(",")).join(" ")} fill="none" stroke="#2F4B6E" strokeOpacity="0.1" />
          {eixos.map((_, i) => {
            const [px, py] = ponto(i, 1);
            return <line key={i} x1={cx} y1={cy} x2={px} y2={py} stroke="#2F4B6E" strokeOpacity="0.12" />;
          })}
          <polygon points={area} fill="var(--gold)" fillOpacity="0.35" stroke="var(--gold)" strokeWidth="2" />

          {eixos.map((e, i) => {
            const [px, py] = ponto(i, 1.22);
            const anchor = Math.abs(px - cx) < 4 ? "middle" : px > cx ? "start" : "end";
            const dy = py < cy ? -2 : 12;
            return (
              <text key={e.rotulo} x={px} y={py + dy} textAnchor={anchor} fontSize="11" fill="#2F4B6E">
                {e.rotulo}
              </text>
            );
          })}
        </svg>
      </div>

      <ul className="space-y-1 text-sm text-navy">
        {eixos.map((e) => (
          <li key={e.rotulo}>
            <span className="font-medium">{e.rotulo}:</span>{" "}
            <span className={e.valor ? "text-navy/70" : "text-[var(--terracota,#9A3A2F)]"}>
              {e.valor ? (e.rotulo === "Próxima ação" ? "registrada" : "concluído") : "pendente"}
            </span>
          </li>
        ))}
      </ul>

      <p className="break-words text-xs text-navy/55">
        {caso.responsavel ? `Responsável: ${caso.responsavel}` : "Sem responsável registrado"}
        {" · "}
        {caso.prazoProximaAcao
          ? `prazo ${dataHumana(caso.prazoProximaAcao)}${dias === null ? "" : dias < 0 ? " (vencido)" : dias === 0 ? " (hoje)" : ` (em ${dias} dias)`}`
          : "sem prazo registrado"}
        {caso.aguardandoExterno ? " · aguardando instituição externa" : ""}
      </p>

      <div className="pt-1">
        <Link search={true} to="/golive/caso" className="text-sm text-navy underline decoration-gold underline-offset-4">
          Abrir Caso 360
        </Link>
      </div>
    </div>
  );
}
