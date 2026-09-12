import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { referenciasNormativasDoCaso } from "@/lib/referencias-normativas.functions";
import {
  SITUACAO_ROTULO,
  VAZIO_BASES,
  VAZIO_BIBLIOTECA,
  VAZIO_DECISOES,
  type ReferenciaNormativa,
} from "@/lib/referencias-normativas";

/**
 * Ponte contextual, somente leitura, entre Governança (Biblioteca Mestre,
 * Bases Genealógicas, Log de decisões) e a pesquisa do caso.
 * Não cadastra, não edita, não homologa, não ativa fonte e não consulta nada externo.
 */

function useReferencias(caseId: string) {
  return useQuery({
    queryKey: ["referencias-normativas", caseId],
    queryFn: () => referenciasNormativasDoCaso({ data: { caseId } }),
  });
}

function Selo({ situacao }: { situacao: ReferenciaNormativa["situacao"] }) {
  const tom =
    situacao === "homologada"
      ? "border-sage/50 bg-sage/10 text-navy"
      : situacao === "arquivada"
        ? "border-navy/20 bg-navy/5 text-navy/60"
        : "border-gold/50 bg-gold/10 text-navy";
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[10.5px] font-medium ${tom}`}>
      {SITUACAO_ROTULO[situacao]}
    </span>
  );
}

function Lista({ itens, vazio, limite }: { itens: ReferenciaNormativa[]; vazio: string; limite?: number }) {
  if (itens.length === 0) return <p className="text-sm text-navy/60">{vazio}</p>;
  const visiveis = limite ? itens.slice(0, limite) : itens;
  return (
    <>
      <ul className="space-y-2">
        {visiveis.map((r) => (
          <li key={`${r.origem}-${r.id}`} className="rounded border border-navy/10 bg-cream/40 p-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-navy">{r.titulo}</span>
              <Selo situacao={r.situacao} />
            </div>
            <p className="mt-1 text-[11.5px] text-navy/60">
              {[r.subarea, r.tipo, r.escopo, r.versao ? `versão ${r.versao}` : null, r.responsavel]
                .filter(Boolean)
                .join(" · ")}
            </p>
            <p className="text-[11px] text-navy/50">
              {r.motivoAplicabilidade}
              {r.apenasCatalogada
                ? " · apenas referência catalogada — não é fonte ativa e não autoriza consulta externa"
                : ""}
            </p>
          </li>
        ))}
      </ul>
      {limite && itens.length > limite && (
        <p className="mt-2 text-[11px] text-navy/50">
          Exibindo {limite} de {itens.length} referências aplicáveis.
        </p>
      )}
    </>
  );
}

function Catalogos() {
  return (
    <div className="mt-3 flex flex-wrap gap-3 text-xs font-medium text-navy">
      <Link to="/biblioteca" className="underline decoration-gold underline-offset-4">
        Ver catálogo completo — Biblioteca Mestre →
      </Link>
      <Link to="/fontes-genealogicas" className="underline decoration-gold underline-offset-4">
        Ver catálogo completo — Bases Genealógicas →
      </Link>
    </div>
  );
}

/** Bloco “Referências normativas aplicáveis” — seção Visão de pesquisa. */
export function ReferenciasNormativasAplicaveis({ caseId }: { caseId: string }) {
  const q = useReferencias(caseId);
  const d = q.data;

  return (
    <section className="rounded border border-navy/15 bg-cream/40 p-4">
      <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-navy">
        Referências normativas aplicáveis
      </h2>
      <p className="mb-3 text-xs text-navy/60">
        Leitura de Governança e biblioteca aplicada ao contexto do caso. Cadastro, homologação e ativação continuam
        exclusivos de Governança. Nada aqui inicia consulta externa, solicitação, upload, OCR, IA, mensagem, contrato,
        cobrança ou publicação.
      </p>

      {q.isLoading && <p className="text-sm text-navy/60">Carregando referências…</p>}
      {q.isError && (
        <p role="alert" className="flex flex-wrap items-center gap-3 text-sm text-terracotta">
          Não foi possível carregar referências normativas — a lista está vazia por falha de consulta, não por ausência de registro.
          <button
            type="button"
            onClick={() => void q.refetch()}
            className="rounded-md border border-terracotta/50 px-2 py-1 text-xs font-medium text-terracotta hover:bg-terracotta/10"
          >
            Tentar novamente
          </button>
        </p>
      )}
      {q.error && <p className="text-sm text-navy/60">Referências indisponíveis para o seu acesso.</p>}

      {d && (
        <>
          <p className="mb-3 rounded border border-navy/10 bg-cream/40 p-2.5 text-xs text-navy/70">
            Trilha/escopo registrado no caso:{" "}
            <strong>{d.contexto.pais ?? "não registrado"}</strong>
            {d.contexto.trilhaId ? " · trilha vinculada" : " · sem trilha vinculada"}
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-navy/70">Biblioteca Mestre</h3>
              <Lista itens={d.biblioteca} vazio={VAZIO_BIBLIOTECA} limite={5} />
            </div>
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-navy/70">Bases Genealógicas</h3>
              <Lista itens={d.bases} vazio={VAZIO_BASES} limite={5} />
            </div>
          </div>
          <p className="mt-3 text-[11px] text-navy/55">
            Cadeia normativa: bases, dicionários e trilhas → pesquisa e evidências → ficha, fontes, evidências e
            validação → achados internos → relatórios F1/F2 ou microentregas sanitizadas → App Cliente autorizado e
            publicado. Nenhum elo é pulado por esta ponte.
          </p>
          <Catalogos />
        </>
      )}
    </section>
  );
}

/** Atalho expansível — seção Fontes e consultas. */
export function ConsultaBasesHomologadas({ caseId }: { caseId: string }) {
  const [aberto, setAberto] = useState(false);
  const q = useReferencias(caseId);
  const d = q.data;

  return (
    <section className="rounded border border-navy/15 bg-cream/40 p-4">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-expanded={aberto}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <span className="text-sm font-semibold uppercase tracking-wide text-navy">
          Consultar Bases Genealógicas e referências homologadas
        </span>
        <span className="text-xs text-navy/60">{aberto ? "fechar" : "abrir"}</span>
      </button>
      <p className="mt-1 text-xs text-navy/60">
        Consulta interna em modo leitura do catálogo já homologado. Estar catalogada não torna a base ativa: nenhuma
        consulta externa, contato com instituição ou aquisição é disparada aqui.
      </p>
      {aberto && (
        <div className="mt-3 space-y-4">
          {q.isLoading && <p className="text-sm text-navy/60">Carregando catálogo…</p>}
      {q.isError && (
        <p role="alert" className="flex flex-wrap items-center gap-3 text-sm text-terracotta">
          Não foi possível carregar catálogo de fontes — a lista está vazia por falha de consulta, não por ausência de registro.
          <button
            type="button"
            onClick={() => void q.refetch()}
            className="rounded-md border border-terracotta/50 px-2 py-1 text-xs font-medium text-terracotta hover:bg-terracotta/10"
          >
            Tentar novamente
          </button>
        </p>
      )}
          {q.error && <p className="text-sm text-navy/60">Catálogo indisponível para o seu acesso.</p>}
          {d && (
            <>
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-navy/70">Bases Genealógicas</h3>
                <Lista itens={d.bases} vazio={VAZIO_BASES} />
              </div>
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-navy/70">
                  Referências da Biblioteca Mestre
                </h3>
                <Lista itens={d.biblioteca} vazio={VAZIO_BIBLIOTECA} />
              </div>
              <Catalogos />
            </>
          )}
        </div>
      )}
    </section>
  );
}

/** Decisões normativas vinculadas — seção Alertas e histórico. */
export function DecisoesNormativasDoCaso({ caseId }: { caseId: string }) {
  const q = useReferencias(caseId);
  const d = q.data;

  return (
    <section className="rounded border border-navy/15 bg-cream/40 p-4">
      <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-navy">
        Decisões normativas vinculadas
      </h2>
      <p className="mb-3 text-xs text-navy/60">
        Somente vínculos já existentes. Nenhuma decisão é criada, editada ou vinculada automaticamente por esta tela.
      </p>
      {q.isLoading && <p className="text-sm text-navy/60">Carregando decisões…</p>}
      {q.isError && (
        <p role="alert" className="flex flex-wrap items-center gap-3 text-sm text-terracotta">
          Não foi possível carregar log de decisões — a lista está vazia por falha de consulta, não por ausência de registro.
          <button
            type="button"
            onClick={() => void q.refetch()}
            className="rounded-md border border-terracotta/50 px-2 py-1 text-xs font-medium text-terracotta hover:bg-terracotta/10"
          >
            Tentar novamente
          </button>
        </p>
      )}
      {q.error && <p className="text-sm text-navy/60">Decisões indisponíveis para o seu acesso.</p>}
      {d && <Lista itens={d.decisoes} vazio={VAZIO_DECISOES} />}
      <Link
        to="/governanca/decisoes"
        className="mt-3 inline-block text-xs font-medium text-navy underline decoration-gold underline-offset-4"
      >
        Abrir Log de decisões em Governança →
      </Link>
    </section>
  );
}
