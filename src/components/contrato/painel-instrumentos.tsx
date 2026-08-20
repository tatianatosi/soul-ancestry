/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { Painel, Selo } from "@/components/comercial/base";
import { lerPreparacaoInstrumentos } from "@/lib/instrumentos-preparacao.functions";
import type { LinhaRequisito, ResultadoPreparacao } from "@/lib/instrumentos-preparacao";

const TOM: Record<string, "ok" | "alerta" | "erro" | "neutro"> = {
  pronto_para_previa_interna: "ok",
  requer_revisao: "alerta",
  bloqueado: "erro",
  atendido: "ok",
  pendente: "alerta",
  nao_aplicavel: "neutro",
};

const ROTULO_STATUS: Record<string, string> = {
  pronto_para_previa_interna: "Pronto para prévia interna",
  requer_revisao: "Requer revisão humana",
  bloqueado: "Bloqueado",
};

function Requisito({ r }: { r: LinhaRequisito }) {
  return (
    <li className="border-t border-navy/10 py-2">
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium text-navy">{r.rotulo}</span>
        <Selo tom={TOM[r.estado] ?? "neutro"} texto={r.estado === "atendido" ? "Atendido" : r.estado === "pendente" ? "Pendente" : "Não aplicável"} />
      </div>
      {r.detalhes.length ? (
        <ul className="mt-1 list-disc pl-4 text-navy/70">
          {r.detalhes.map((d, i) => (
            <li key={i}>{d}</li>
          ))}
        </ul>
      ) : null}
      {r.campos_faltantes.length ? <p className="mt-1 text-navy/60">Campos faltantes: {r.campos_faltantes.join(", ")}</p> : null}
    </li>
  );
}

/** ANA-D-01 — painel de preparação interna de instrumentos. Somente diagnóstico. */
export function PainelInstrumentos({ caseId }: { caseId: string }) {
  const carregar = useServerFn(lerPreparacaoInstrumentos);
  const q = useQuery({
    queryKey: ["preparacao-instrumentos", caseId],
    queryFn: () => carregar({ data: { caseId } }),
    retry: false,
  });

  if (q.isLoading) return <Painel titulo="Preparação de instrumentos">Carregando diagnóstico…</Painel>;
  if (q.error) return <Painel titulo="Preparação de instrumentos">{(q.error as any)?.message}</Painel>;

  const d = q.data as any;
  const r = d.resultado as ResultadoPreparacao;
  const e = d.entrada;

  return (
    <Painel titulo="Preparação de instrumentos (interna)">
      <div className="space-y-3 text-xs text-navy/80">
        <div className="flex flex-wrap items-center gap-2">
          <Selo tom={TOM[r.status] ?? "neutro"} texto={ROTULO_STATUS[r.status] ?? r.status} />
          <span>{r.proxima_acao}</span>
        </div>

        <p className="rounded border border-navy/15 bg-cream/40 p-2">
          Nenhum contrato, ordem de serviço, anexo, cláusula, assinatura, cobrança, link, pasta, documento externo, mensagem ou publicação é
          criado nesta tela. Preço só de catálogo homologado ou exceção aprovada; a proposta Canva fornece apenas escopo extraído.
        </p>

        <section>
          <h4 className="text-sm font-semibold text-navy">Pré-requisitos A–E</h4>
          <ul className="mt-1">
            {r.requisitos.map((x) => (
              <Requisito key={x.codigo} r={x} />
            ))}
          </ul>
        </section>

        <div className="grid gap-3 md:grid-cols-2">
          <section>
            <h4 className="text-sm font-semibold text-navy">Dependentes</h4>
            {e.dependentes.length ? (
              <ul className="mt-1 list-disc pl-4">
                {e.dependentes.map((x: any, i: number) => (
                  <li key={i}>
                    {x.nome} — {x.participa_do_contrato ? "participa do contrato" : "não participa"} · representação:{" "}
                    {x.status_representacao ?? "não registrada"}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1">Nenhum dependente registrado.</p>
            )}
          </section>

          <section>
            <h4 className="text-sm font-semibold text-navy">Condição comercial</h4>
            <p className="mt-1">
              Estado: {e.condicao.existe ? (e.condicao.status ?? "—") : "não registrada"}
              {e.condicao.homologado_em ? ` · homologada em ${new Date(e.condicao.homologado_em).toLocaleDateString("pt-BR")}` : ""}
            </p>
            {e.condicao.campos_faltantes.length ? <p>Campos faltantes: {e.condicao.campos_faltantes.join(", ")}</p> : null}
          </section>

          <section>
            <h4 className="text-sm font-semibold text-navy">Matriz jurídica</h4>
            {r.versoes_juridicas_aplicaveis.length ? (
              <ul className="mt-1 list-disc pl-4">
                {r.versoes_juridicas_aplicaveis.map((v, i) => (
                  <li key={i}>
                    {v.tema}: versão aprovada {v.versao}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1">Nenhuma versão jurídica aprovada aplicável. Nenhum texto jurídico é gerado aqui.</p>
            )}
          </section>

          <section>
            <h4 className="text-sm font-semibold text-navy">Anexos condicionais</h4>
            {r.anexos_condicionais.length ? (
              <ul className="mt-1 list-disc pl-4">
                {r.anexos_condicionais.map((a, i) => (
                  <li key={i}>
                    {a.codigo} — {a.motivo}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1">Nenhum anexo condicional indicado.</p>
            )}
          </section>
        </div>

        <section>
          <h4 className="text-sm font-semibold text-navy">Conflitos</h4>
          {r.conflitos.length ? (
            <ul className="mt-1 list-disc pl-4">
              {r.conflitos.map((c, i) => (
                <li key={i}>
                  <span className="uppercase text-navy/60">{c.origem}</span> — {c.detalhe}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1">Nenhum conflito detectado.</p>
          )}
        </section>

        <section>
          <h4 className="text-sm font-semibold text-navy">Bloqueios</h4>
          {r.codigos_bloqueio.length ? (
            <p className="mt-1">
              {r.codigos_bloqueio.join(" · ")} — versão final, assinatura, financeiro e onboarding permanecem indisponíveis.
            </p>
          ) : (
            <p className="mt-1">Nenhum bloqueio ativo.</p>
          )}
        </section>
      </div>
    </Painel>
  );
}
