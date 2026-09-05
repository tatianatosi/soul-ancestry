import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { Secao } from "@/components/caso/campos";
import { carregarFichaPiloto } from "@/lib/ficha-piloto-genealogica.functions";
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

/* eslint-disable @typescript-eslint/no-explicit-any */
type Linha = Record<string, any>;

/**
 * Ficha piloto genealógica e preparação de pesquisa.
 * Somente preparação: nenhuma consulta a fonte, pedido de documento, contato com
 * arquivo, árvore publicada ou relatório gerado.
 */
export function PainelFichaPiloto({ caseId }: { caseId: string }) {
  const carregar = useServerFn(carregarFichaPiloto);
  const q = useQuery({ queryKey: ["ficha-piloto", caseId], queryFn: () => carregar({ data: { caseId } }) });

  if (q.isLoading) return <p className="text-sm text-navy/55">Carregando ficha piloto genealógica…</p>;
  const p = q.data?.pesquisa ?? null;
  if (!p) {
    return (
      <Secao titulo="Ficha piloto genealógica" descricao="Preparação interna, sem consulta a fontes.">
        <p className="text-sm text-navy/55">Nenhuma ficha de pesquisa preparada para este caso.</p>
      </Secao>
    );
  }

  const pessoas = (q.data?.pessoas ?? []) as Linha[];
  const vinculos = (q.data?.vinculos ?? []) as Linha[];
  const hipoteses = (q.data?.hipoteses ?? []) as Linha[];
  const lacunas = (q.data?.lacunas ?? []) as Linha[];
  const fontes = (q.data?.fontes ?? []) as Linha[];
  const solicitacoes = (q.data?.solicitacoes ?? []) as Linha[];
  const bloqueios = (q.data?.bloqueios ?? []) as string[];
  const nomePessoa = (id?: string | null) => pessoas.find((x) => x.id === id)?.canonical_name ?? "—";

  return (
    <div className="space-y-5 lg:col-span-2">
      <Secao
        titulo="Ficha piloto genealógica"
        descricao="Preparação apenas: nenhuma fonte consultada, nenhum documento solicitado, nenhum arquivo contatado, nenhuma árvore ou relatório publicado."
      >
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <Campo rotulo="Linhagem" valor={p.country_context} />
          <Campo rotulo="Situação da pesquisa" valor={STATUS_PESQUISA[String(p.status)] ?? p.status} />
          <Campo rotulo="Autorização de pesquisa" valor={STATUS_AUTORIZACAO[String(p.external_research_authorization_status)]} />
          <Campo rotulo="Gate de pesquisa externa" valor={STATUS_GATE_PESQUISA[String(p.external_research_gate_status)]} />
        </dl>
        <p className="mt-3 text-xs text-navy/60">{p.family_line_summary_internal}</p>
        {bloqueios.length > 0 ? (
          <ul className="mt-3 space-y-1 text-xs text-terracotta">
            {bloqueios.map((b) => (
              <li key={b}>○ {b}</li>
            ))}
          </ul>
        ) : null}
      </Secao>

      <Secao titulo="Pessoas do núcleo e da pesquisa" descricao="Nenhum antepassado inferido. Identidade só é confirmada com evidência.">
        <ul className="space-y-1 text-sm text-navy/80">
          {pessoas.map((x) => (
            <li key={x.id}>
              • {x.canonical_name} — <span className="text-xs text-navy/55">
                {STATUS_PESSOA[String(x.person_status)]} · identidade {STATUS_IDENTIDADE[String(x.identity_status)]?.toLowerCase()}
                {x.is_minor ? " · menor" : ""}
              </span>
            </li>
          ))}
        </ul>
      </Secao>

      <Secao titulo="Vínculos familiares" descricao="Vínculo sem evidência permanece apenas afirmado, nunca confirmado.">
        {vinculos.length === 0 ? (
          <p className="text-sm text-navy/55">Nenhum vínculo registrado.</p>
        ) : (
          <ul className="space-y-1 text-sm text-navy/80">
            {vinculos.map((r) => (
              <li key={r.id}>
                • {nomePessoa(r.person_from_id)} → {nomePessoa(r.person_to_id)} ({r.relation_type}) —{" "}
                <span className="text-xs text-navy/55">
                  {STATUS_VINCULO[String(r.status)]} · {r.supporting_evidence_count} evidência(s)
                </span>
              </li>
            ))}
          </ul>
        )}
      </Secao>

      <Secao titulo="Hipóteses internas" descricao="Hipótese não é achado nem conclusão. Uso interno.">
        <ul className="space-y-1 text-sm text-navy/80">
          {hipoteses.map((h) => (
            <li key={h.id}>
              • {h.titulo} — <span className="text-xs text-navy/55">{h.status} · confiança {h.grau_confianca}</span>
            </li>
          ))}
        </ul>
      </Secao>

      <Secao titulo="Lacunas e pendências" descricao="Lacuna registrada não dispara consulta nem pedido.">
        <ul className="space-y-1 text-sm text-navy/80">
          {lacunas.map((l) => (
            <li key={l.id}>
              <span className={l.status === "blocked" ? "text-terracotta" : ""}>•</span> {l.title} —{" "}
              <span className="text-xs text-navy/55">{l.category} · {l.severity} · {l.status}</span>
            </li>
          ))}
        </ul>
      </Secao>

      <Secao titulo="Fontes e evidências existentes" descricao="Catalogadas apenas como referência interna; catalogar não dispara consulta.">
        <ul className="space-y-1 text-sm text-navy/80">
          {fontes.map((f) => (
            <li key={f.id}>
              • {f.title} — <span className="text-xs text-navy/55">{STATUS_FONTE[String(f.source_status)]} · {f.source_type}</span>
            </li>
          ))}
        </ul>
      </Secao>

      <Secao titulo="Documentos e solicitações" descricao="Todas as solicitações permanecem não solicitadas / a preparar.">
        <ul className="space-y-1 text-sm text-navy/80">
          {solicitacoes.map((s) => (
            <li key={s.id}>
              • {s.requested_document_type} — <span className="text-xs text-navy/55">
                {STATUS_SOLICITACAO[String(s.status)]} · {nomePessoa(s.person_id)}
              </span>
            </li>
          ))}
        </ul>
      </Secao>

      <Secao titulo="Plano de ação de pesquisa" descricao="Recebe ações somente após autorização de pesquisa registrada.">
        {q.data?.planoAberto ? (
          <p className="text-sm text-navy/70">Autorização registrada: o plano pode receber ações de pesquisa.</p>
        ) : (
          <p className="text-sm text-navy/55">
            Plano vazio e pronto. Nenhuma ação pode ser incluída enquanto a autorização de pesquisa estiver pendente.
          </p>
        )}
      </Secao>
    </div>
  );
}

function Campo({ rotulo, valor }: { rotulo: string; valor?: string | null }) {
  return (
    <div>
      <dt className="text-[11px] font-medium uppercase tracking-wide text-navy/50">{rotulo}</dt>
      <dd className="text-navy/80">{valor || "—"}</dd>
    </div>
  );
}
