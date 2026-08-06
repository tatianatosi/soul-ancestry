import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Caso } from "@/data/casos";
import { relatorioByCaso, POSSIBILIDADES_APROFUNDAMENTO } from "@/data/relatorio-visual";
import {
  Compass,
  Users,
  FileText,
  HelpCircle,
  ArrowRight,
  MapPin,
  X,
  Sparkles,
} from "lucide-react";

function CardShell({
  icon: Icon,
  eyebrow,
  titulo,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  eyebrow: string;
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-navy/25 bg-card p-5 shadow-sm">
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

export function RelatorioVisualTab({ caso }: { caso: Caso }) {
  const r = relatorioByCaso(caso);
  const [modal, setModal] = useState(false);

  const resumo = [
    ["Pessoa-foco", r.pessoaFoco],
    ["Ancestral mais antigo localizado", r.ancestralMaisAntigo],
    ["Gerações identificadas", r.numeroGeracoes],
    ["Localidades principais", r.localidadesPrincipais],
  ] as const;

  return (
    <div className="space-y-5 p-5" data-tab="relatorio">
      <header>
        <div className="text-[11px] uppercase tracking-widest text-navy/60">
          Projeto Essencial · {caso.id}
        </div>
        <h2 className="font-serif text-2xl text-navy">Relatório da sua família</h2>
        <p className="mt-1 text-[13px] italic text-navy/70">
          Uma síntese viva da pesquisa base — leitura rápida, em cards.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Card 1 */}
        <div className="md:col-span-2">
          <CardShell icon={Compass} eyebrow="Visão geral" titulo="O que esta etapa revelou">
            <p className="text-[13px] leading-relaxed text-navy/80">
              A pesquisa base permitiu organizar os primeiros vínculos documentados da família{" "}
              <strong className="text-navy">{r.sobrenomeFamilia}</strong>, identificando a linha
              principal inicial e os registros mais importantes já localizados.
            </p>
            <div className="mt-4 rounded-xl bg-areia p-4">
              <div className="mb-2 text-[11px] uppercase tracking-widest text-navy/70">Resumo rápido</div>
              <dl className="space-y-2">
                {resumo.map(([k, v]) => (
                  <div key={k} className="flex items-start justify-between gap-3 border-b border-navy/10 pb-2 last:border-0 last:pb-0">
                    <dt className="text-[12px] text-navy/70">{k}</dt>
                    <dd className="text-right text-[13px] font-medium text-navy">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </CardShell>
        </div>

        {/* Card 2 */}
        <CardShell icon={Users} eyebrow="Linha principal" titulo="Linha familiar identificada">
          <ol className="relative space-y-4 border-l-2 border-gold/40 pl-5">
            {r.linhaPrincipal.map((g, i) => (
              <li key={i} className="relative">
                <span className="absolute -left-[27px] top-1 grid h-3.5 w-3.5 place-items-center rounded-full border-2 border-gold bg-cream" />
                <div className="text-[13px] font-semibold text-navy">{g.nome}</div>
                <div className="text-[12px] text-navy/70">{g.eventos}</div>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-[12px] italic text-navy/60">
            Esta visualização mostra a espinha dorsal inicial da família, sem avançar ainda para
            todos os ramos e contextos possíveis nesta etapa.
          </p>
        </CardShell>

        {/* Card 3 */}
        <CardShell icon={FileText} eyebrow="Documentos" titulo="Documentos essenciais encontrados">
          <div className="space-y-2.5">
            {r.documentos.map((d, i) => (
              <div key={i} className="rounded-xl border border-border border-l-4 border-l-gold bg-white p-3.5">
                <div className="text-[13px] font-semibold text-navy">{d.pessoa}</div>
                <div className="text-[12px] text-navy/80">{d.tipo}</div>
                <div className="mt-1 flex items-center gap-1.5 text-[11px] text-navy/60">
                  <MapPin className="h-3 w-3 shrink-0 text-sage" />
                  <span className="truncate">{d.local}</span>
                </div>
                <div className="mt-1 text-[11px] uppercase tracking-widest text-terracotta">
                  Valor genealógico
                </div>
                <div className="text-[12px] text-navy/70">{d.observacao}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-xl bg-areia px-4 py-3 text-[12px] text-navy">
            Quantidade total de registros localizados:{" "}
            <strong>{r.quantidadeRegistros}</strong>
          </div>
        </CardShell>

        {/* Card 4 */}
        <CardShell icon={HelpCircle} eyebrow="O que ainda falta" titulo="Pontos em aberto">
          <ul className="space-y-2">
            {r.lacunas.map((l, i) => (
              <li key={i} className="flex items-start gap-2 text-[13px] text-navy/80">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-terracotta" />
                <span>{l}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 rounded-xl bg-areia p-4">
            <div className="mb-2 text-[11px] uppercase tracking-widest text-navy/70">
              Pontos que ainda pedem confirmação
            </div>
            <ul className="space-y-2">
              {r.pontosConfirmar.map((p, i) => (
                <li key={i} className="flex items-start gap-2 text-[12px] text-navy/80">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sage" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-4 text-[12px] italic text-navy/60">
            Nesta fase, o foco é clareza e base documental, e não o esgotamento completo da
            história familiar.
          </p>
        </CardShell>

        {/* Card 5 */}
        <div className="md:col-span-2">
          <section className="rounded-2xl bg-gradient-to-br from-navy to-navy-soft p-5 text-cream shadow-lg">
            <div className="text-[11px] uppercase tracking-widest text-gold/80">Continuidade</div>
            <h3 className="font-serif text-xl italic">Próxima etapa recomendada</h3>
            <p className="mt-3 text-[13px] leading-relaxed text-cream/85">
              Com a base agora estruturada, a família {r.sobrenomeFamilia} já tem um ponto de
              partida seguro para um estudo mais profundo. Em uma etapa de aprofundamento, é
              possível ampliar gerações, esclarecer lacunas, investigar novos ramos e reconstruir
              com mais riqueza a trajetória da família ao longo do tempo.
            </p>
            <div className="mt-4 rounded-xl bg-navy-soft/60 p-4">
              <div className="mb-2 text-[11px] uppercase tracking-widest text-gold/80">
                Possibilidades de aprofundamento
              </div>
              <ul className="space-y-1.5">
                {POSSIBILIDADES_APROFUNDAMENTO.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-[13px] text-cream/85">
                    <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => setModal(true)}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-gold px-4 py-3 text-[13px] font-semibold text-navy transition hover:bg-gold/90"
            >
              Quero ver a proposta da próxima etapa
              <ArrowRight className="h-4 w-4" />
            </button>
          </section>
        </div>
      </div>

      {modal && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-navy/60 p-4 sm:items-center"
          onClick={() => setModal(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-gold/40 bg-card p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[11px] uppercase tracking-widest text-terracotta">
                  Próxima etapa
                </div>
                <h4 className="font-serif text-xl text-navy">Proposta de aprofundamento</h4>
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
            <div className="mt-4 rounded-xl bg-areia p-3 text-[12px] text-navy/75">
              Este é um espaço reservado para a integração futura com o Ancestral Blueprint
              (camada de propostas).
            </div>
            <button
              onClick={() => setModal(false)}
              className={cn(
                "mt-4 w-full rounded-full bg-navy px-4 py-2.5 text-[13px] font-semibold text-cream",
                "transition hover:bg-navy-soft",
              )}
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
