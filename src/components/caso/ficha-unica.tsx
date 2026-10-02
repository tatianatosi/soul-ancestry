import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";

import { carregarFichaPiloto } from "@/lib/ficha-piloto-genealogica.functions";
import { obterFichaMasterReal } from "@/lib/ficha-master.functions";
import {
  STATUS_AUTORIZACAO,
  STATUS_FONTE,
  STATUS_GATE_PESQUISA,
  STATUS_IDENTIDADE,
  STATUS_PESQUISA,
  STATUS_PESSOA,
  STATUS_SOLICITACAO,
  STATUS_VINCULO,
} from "@/lib/ficha-piloto-genealogica";
import { montarBlocosFichaUnica, type BlocoFichaUnica } from "@/lib/ficha-unica-caso";

/**
 * Ficha Única progressiva do caso (02/10/2026) — único painel da aba
 * "Pesquisa" do Caso 360 que mostra dado real, do mais macro (visão do
 * caso, dono Planejador) ao mais granular (pessoas/vínculos/hipóteses/
 * lacunas/fontes/documentos/plano de ação, dono Pesquisa do caso).
 *
 * Substitui `PainelFichaPiloto` + `PainelFichaMaster`, que viviam lado a
 * lado sem nenhuma marcação visual distinguindo-os (achado real de
 * findability, 02/10/2026) — eram duas fichas concorrentes, não uma só.
 * Cada bloco aqui declara dono, origem (tabela real) e, quando existe,
 * a rota onde aquele dado é de fato editado — nunca um formulário novo.
 */
export function PainelFichaUnica({ caseId }: { caseId: string }) {
  const carregarMaster = useServerFn(obterFichaMasterReal);
  const carregarPiloto = useServerFn(carregarFichaPiloto);

  const qMaster = useQuery({
    queryKey: ["ficha-master-real", caseId],
    queryFn: () => carregarMaster({ data: { caseId } }),
  });
  const qPiloto = useQuery({
    queryKey: ["ficha-piloto", caseId],
    queryFn: () => carregarPiloto({ data: { caseId } }),
  });

  const carregando = qMaster.isLoading || qPiloto.isLoading;
  const erro = qMaster.error || qPiloto.error;

  const blocos = montarBlocosFichaUnica({
    caseId,
    ficha: qMaster.data?.ficha,
    piloto: qPiloto.data ?? null,
    rotulos: {
      statusPesquisa: STATUS_PESQUISA,
      statusAutorizacao: STATUS_AUTORIZACAO,
      statusGatePesquisa: STATUS_GATE_PESQUISA,
      statusPessoa: STATUS_PESSOA,
      statusIdentidade: STATUS_IDENTIDADE,
      statusVinculo: STATUS_VINCULO,
      statusFonte: STATUS_FONTE,
      statusSolicitacao: STATUS_SOLICITACAO,
    },
  });

  return (
    <section id="ficha-unica" className="scroll-mt-24 rounded-xl border-2 border-gold/40 bg-cream/60 p-5 lg:col-span-2">
      <h2 className="font-serif text-xl text-navy">Ficha Única do Caso</h2>
      <p className="mb-4 mt-1 text-xs text-navy/60">
        Dado real, do mais macro (visão do caso) ao mais granular (preparação de pesquisa). Cada bloco mostra dono,
        origem e, quando existe, onde editar — nenhuma fonte consultada, nenhum documento solicitado, nenhum arquivo
        contatado, nenhuma árvore ou relatório publicado a partir daqui.
      </p>

      {carregando ? <p className="text-sm text-navy/55">Carregando a Ficha Única do caso…</p> : null}
      {erro ? (
        <div role="alert" className="space-y-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm">
          <p className="font-medium text-destructive">Não foi possível carregar a Ficha Única do caso.</p>
          <p className="text-navy/80">
            {erro instanceof Error ? erro.message : "A consulta não retornou resultado nem erro. Isso é falha de carga, não ficha ausente."}
          </p>
          <button
            type="button"
            onClick={() => {
              void qMaster.refetch();
              void qPiloto.refetch();
            }}
            className="rounded-lg border border-navy/20 px-3 py-1.5 text-xs text-navy"
          >
            Tentar novamente
          </button>
        </div>
      ) : null}

      {!carregando && !erro && blocos.length === 0 ? (
        <p className="text-sm text-navy/55">Nenhuma ficha preparada para este caso ainda.</p>
      ) : null}

      {qPiloto.data?.bloqueios && qPiloto.data.bloqueios.length > 0 ? (
        <ul className="mb-4 space-y-1 text-xs text-terracotta">
          {qPiloto.data.bloqueios.map((b: string) => (
            <li key={b}>○ {b}</li>
          ))}
        </ul>
      ) : null}

      <div className="space-y-4">
        {blocos.map((bloco) => (
          <BlocoFichaUnicaView key={bloco.id} bloco={bloco} />
        ))}
      </div>
    </section>
  );
}

function BlocoFichaUnicaView({ bloco }: { bloco: BlocoFichaUnica }) {
  return (
    <div className="rounded-lg border border-navy/10 bg-white/60 p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-serif text-base text-navy">{bloco.titulo}</h3>
        <span className="text-[11px] uppercase tracking-wide text-navy/45">
          dono: {bloco.dono} · origem: {bloco.origem}
        </span>
      </div>
      {bloco.descricao ? <p className="mt-1 text-xs text-navy/55">{bloco.descricao}</p> : null}

      {bloco.campos ? (
        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          {bloco.campos.map((c) => (
            <div key={c.rotulo} className="flex items-baseline justify-between gap-3 border-b border-navy/5 py-1">
              <dt className="text-navy/55">{c.rotulo}</dt>
              <dd className="text-right text-navy/85">{c.valor === null || c.valor === undefined || c.valor === "" ? "—" : c.valor}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {bloco.linhas ? (
        bloco.linhas.length === 0 ? (
          <p className="mt-3 text-sm text-navy/55">{bloco.vazio ?? "Nenhum registro."}</p>
        ) : (
          <ul className="mt-3 space-y-1 text-sm text-navy/80">
            {bloco.linhas.map((l, i) => (
              <li key={i}>• {l}</li>
            ))}
          </ul>
        )
      ) : null}

      {bloco.rotaEdicao ? (
        <p className="mt-3 text-xs">
          <Link
            to={bloco.rotaEdicao.to}
            params={bloco.rotaEdicao.params as never}
            className="font-medium text-navy underline decoration-gold underline-offset-4"
          >
            {bloco.rotaEdicao.label} →
          </Link>
        </p>
      ) : null}
    </div>
  );
}
