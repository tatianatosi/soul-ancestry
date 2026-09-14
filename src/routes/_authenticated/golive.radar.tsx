/**
 * Radar interno do shell de go-live.
 *
 * Só apresentação: lê o que o motor aprovado (`carregarGoLive`) já devolve
 * para o caso canônico do piloto (Ana Luiza). Não cria dado, não infere
 * número, não grava e não mostra histórico, teste, catálogo ou auditoria.
 *
 * Matriz: urgência × prontidão, com o caso identificado pelo nome.
 * Radar individual: quatro eixos, rótulos fora do desenho para não sobrepor.
 */
import { createFileRoute, Link } from "@tanstack/react-router";

import { Bloco, GoLiveShell, Vazio } from "@/components/golive/shell";
import { FaixaIdentidade } from "@/components/golive/identidade";
import { useGoLive } from "@/components/golive/dados";
import { Button } from "@/components/ui/button";
import { dataHumana, humano } from "@/lib/rotulos-golive";

export const Route = createFileRoute("/_authenticated/golive/radar")({
  head: () => ({
    meta: [
      { title: "Radar interno — Go-live Clube Ancestral" },
      { name: "description", content: "Matriz de urgência e prontidão e radar individual do caso do piloto." },
      { property: "og:title", content: "Radar interno — Go-live Clube Ancestral" },
      { property: "og:description", content: "Matriz de urgência e prontidão e radar individual do caso." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RadarGoLive,
});

function diasAte(prazo: string | null): number | null {
  if (!prazo) return null;
  const alvo = new Date(prazo);
  if (Number.isNaN(alvo.getTime())) return null;
  return Math.round((alvo.getTime() - Date.now()) / 86_400_000);
}

function RadarGoLive() {
  const { data, isPending, error } = useGoLive();
  const caso = data?.encontrado ? data : null;

  return (
    <GoLiveShell titulo="Radar interno" descricao="Quem precisa de atenção primeiro — e por quê.">
      {isPending ? <p className="text-sm text-navy/60">Carregando…</p> : null}
      {error ? <p className="text-sm text-[var(--terracota,#9A3A2F)]">Não foi possível carregar agora.</p> : null}

      {data && !data.encontrado ? (
        <Bloco titulo="Matriz de atenção">
          <Vazio
            cta={
              <Link to="/golive/caso">
                <Button size="sm">Abrir Caso 360</Button>
              </Link>
            }
          />
        </Bloco>
      ) : null}

      {caso ? (
        <>
          <FaixaIdentidade dados={caso} />
          <Matriz caso={caso} />
          <Individual caso={caso} />
        </>
      ) : null}
    </GoLiveShell>
  );
}

type Caso = NonNullable<ReturnType<typeof useGoLive>["data"] & { encontrado: true }>;

function prontidao(caso: Caso) {
  const marcos = [caso.caso.contratoAssinado, caso.caso.pagamentoConfirmado, caso.caso.documentosMinimosOk];
  return marcos.filter(Boolean).length / marcos.length;
}

function urgencia(caso: Caso) {
  const dias = diasAte(caso.caso.prazo);
  if (dias === null) return caso.caso.proximaAcao ? 0.5 : 0.2;
  if (dias < 0) return 1;
  if (dias <= 3) return 0.85;
  if (dias <= 7) return 0.65;
  if (dias <= 30) return 0.4;
  return 0.2;
}

function Matriz({ caso }: { caso: Caso }) {
  const u = urgencia(caso);
  const p = prontidao(caso);
  const nome = caso.identidade.pessoaPrincipal ?? "Caso do piloto";
  const dias = diasAte(caso.caso.prazo);

  // Margem interna para o ponto não encostar nas bordas da matriz.
  const MARGEM = 18;
  const x = 60 + MARGEM + p * (210 - 2 * MARGEM);
  const y = 220 - MARGEM - u * (190 - 2 * MARGEM);

  return (
    <Bloco titulo="Matriz de atenção — urgência × prontidão">
      <div className="min-w-0 overflow-x-auto">
        <svg viewBox="0 0 340 260" role="img" aria-label={`Matriz de atenção. ${nome} com urgência ${Math.round(u * 100)}% e prontidão ${Math.round(p * 100)}%.`} className="mx-auto h-auto w-full min-w-[300px] max-w-[420px]">
          <rect x="60" y="30" width="210" height="190" fill="#fff" stroke="#2F4B6E" strokeOpacity="0.18" />
          <line x1="165" y1="30" x2="165" y2="220" stroke="#2F4B6E" strokeOpacity="0.12" />
          <line x1="60" y1="125" x2="270" y2="125" stroke="#2F4B6E" strokeOpacity="0.12" />

          <text x="112" y="48" textAnchor="middle" fontSize="9" fill="#2F4B6E" fillOpacity="0.55">Urgente, pouco pronto</text>
          <text x="218" y="48" textAnchor="middle" fontSize="9" fill="#2F4B6E" fillOpacity="0.55">Urgente e pronto</text>
          <text x="112" y="212" textAnchor="middle" fontSize="9" fill="#2F4B6E" fillOpacity="0.4">Acompanhar</text>
          <text x="218" y="212" textAnchor="middle" fontSize="9" fill="#2F4B6E" fillOpacity="0.4">Pronto, sem pressa</text>

          <text x="14" y="125" fontSize="10" fill="#2F4B6E" transform="rotate(-90 14 125)" textAnchor="middle">Urgência</text>
          <text x="165" y="246" fontSize="10" fill="#2F4B6E" textAnchor="middle">Prontidão do caso</text>

          <circle cx={x} cy={y} r="8" fill="#9A3A2F" />
          <text x={x} y={y + 3} textAnchor="middle" fontSize="8" fill="#fff" fontWeight="bold">1</text>
          <text
            x={x > 200 ? x - 12 : x + 12}
            y={y - 12}
            textAnchor={x > 200 ? "end" : "start"}
            fontSize="10"
            fill="#2F4B6E"
            fontWeight="600"
          >
            1. {nome}
          </text>
        </svg>
      </div>

      <ol className="space-y-1 text-sm text-navy">
        <li className="break-words">
          <span className="font-semibold">1. {nome}</span>
          {caso.caso.proximaAcao ? <> — {humano(caso.caso.proximaAcao)}</> : <> — Sem próxima ação registrada</>}
          {dias !== null ? (
            <span className="text-navy/55">
              {" "}
              · prazo {dataHumana(caso.caso.prazo)}
              {dias < 0 ? " (vencido)" : dias === 0 ? " (hoje)" : ` (em ${dias} dias)`}
            </span>
          ) : (
            <span className="text-navy/55"> · sem prazo registrado</span>
          )}
        </li>
      </ol>
    </Bloco>
  );
}

function Individual({ caso }: { caso: Caso }) {
  const eixos = [
    { rotulo: "Formalização", valor: caso.caso.contratoAssinado ? 1 : 0 },
    { rotulo: "Pagamento", valor: caso.caso.pagamentoConfirmado ? 1 : 0 },
    { rotulo: "Documentos", valor: caso.caso.documentosMinimosOk ? 1 : 0 },
    { rotulo: "Próxima ação", valor: caso.caso.proximaAcao ? 1 : 0 },
  ];

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
    <Bloco titulo="Radar individual do caso">
      <div className="min-w-0 overflow-x-auto">
        <svg viewBox="0 0 340 250" role="img" aria-label={`Radar do caso: ${eixos.map((e) => `${e.rotulo} ${e.valor ? "concluído" : "pendente"}`).join(", ")}.`} className="mx-auto h-auto w-full min-w-[300px] max-w-[420px]">
          <polygon points={grade} fill="none" stroke="#2F4B6E" strokeOpacity="0.15" />
          <polygon
            points={eixos.map((_, i) => ponto(i, 0.5).join(",")).join(" ")}
            fill="none"
            stroke="#2F4B6E"
            strokeOpacity="0.1"
          />
          {eixos.map((_, i) => {
            const [px, py] = ponto(i, 1);
            return <line key={i} x1={cx} y1={cy} x2={px} y2={py} stroke="#2F4B6E" strokeOpacity="0.12" />;
          })}
          <polygon points={area} fill="#C9A84C" fillOpacity="0.35" stroke="#C9A84C" strokeWidth="2" />

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
              {e.valor ? "concluído" : "pendente"}
            </span>
          </li>
        ))}
      </ul>

      <div className="pt-1">
        <Link to="/golive/caso" className="text-sm text-navy underline decoration-gold underline-offset-4">
          Abrir Caso 360
        </Link>
      </div>
    </Bloco>
  );
}
