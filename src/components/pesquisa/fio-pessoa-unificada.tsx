/**
 * O fio da Pessoa Unificada, no hub de Pesquisa (05/10/2026).
 *
 * Diretriz da Proprietária: Pesquisa é o centro de inteligência operacional, e
 * Pessoa Unificada é o fio permanente que atravessa Lead → Contato/Discovery →
 * Cliente → Caso → Núcleo → Ficha Piloto → Ficha Genealógica → Pessoas e
 * Relações → Fontes e Evidências → Hipóteses, Lacunas e Achados → Contrato →
 * Portal/App Cliente.
 *
 * Antes deste painel a pergunta "a mesma pessoa atravessa a jornada?" não tinha
 * onde ser respondida: cada tela via o seu pedaço e nenhuma via a cadeia. Aqui
 * ela é respondida com número, por pessoa, e cada elo aberto diz a rota onde se
 * resolve — não "verificar".
 *
 * Só uma coisa é gravável a partir daqui: o elo mecânico, que é copiar um
 * vínculo que já existe no sentido que falta. Dizer que a pessoa de pesquisa é
 * a pessoa canônica é decisão de identidade e fica com a equipe, na tela que o
 * painel aponta — nunca inferida por nome.
 */

import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { CaCard } from "@/components/ui/ca-card";
import { EstadoDados } from "@/components/saas/estado-dados";
import { Selo } from "@/components/comercial/base";
import { AcaoOperacional } from "@/components/saas/acao-operacional";
import {
  ELOS_DO_FIO,
  ETAPAS_FIO,
  ROTULO_ETAPA,
  eloPor,
  type NaturezaElo,
  type PessoaDoFio,
} from "@/lib/pessoa-unificada-fio";
import {
  medirFioDaPessoaUnificada,
  religarElosMecanicosDoFio,
} from "@/lib/pessoa-unificada-fio.functions";

/* eslint-disable @typescript-eslint/no-explicit-any */

type Medida = {
  caseId: string | null;
  pessoas: PessoaDoFio[];
  saude: {
    pessoas: number;
    segurando: number;
    aplicaveis: number;
    abertosMecanicos: number;
    abertosDeIdentidade: number;
    atravessa: boolean;
  };
  resumo: string;
  fila: { ondeResolver: string; coluna: string; natureza: NaturezaElo; pessoas: string[] }[];
  religaveis: number;
};

const ROTULO_STATUS: Record<string, string> = {
  subject: "Requerente",
  family_member: "Familiar",
  descendant: "Descendente",
  ancestor: "Ascendente",
  related_person: "Pessoa relacionada",
  unknown_person: "Pessoa não identificada",
};

export function FioPessoaUnificada({ researchCaseId }: { researchCaseId: string }) {
  const qc = useQueryClient();
  const medir = useServerFn(medirFioDaPessoaUnificada);
  const religar = useServerFn(religarElosMecanicosDoFio);
  const [abertoDetalhe, setAbertoDetalhe] = useState(false);

  const chave = ["fio-pessoa-unificada", researchCaseId];
  const q = useQuery({ queryKey: chave, queryFn: () => medir({ data: { researchCaseId } }) });

  const m = useMutation({
    mutationFn: (motivo: string) => religar({ data: { researchCaseId, motivo } }),
    onSuccess: (r: { quantidade: number }) => {
      toast.success(
        r.quantidade === 0
          ? "Nenhum elo mecânico pendente: o ponteiro de volta já estava gravado."
          : `${r.quantidade} elo(s) mecânico(s) religado(s). Nenhuma identidade foi inferida.`,
      );
      void qc.invalidateQueries({ queryKey: chave });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <CaCard
      variante="compacto"
      titulo="Fio da Pessoa Unificada — Lead até App Cliente"
      data-fio-pessoa-unificada
    >
      <EstadoDados
        carregando={q.isLoading}
        erro={q.error}
        dados={q.data ? [q.data as unknown as Medida] : undefined}
        aoTentarNovamente={() => void q.refetch()}
        recurso="o fio da Pessoa Unificada"
        vazio="Esta pesquisa ainda não tem pessoas: o fio não tem por onde passar."
      >
        {([d]) => (
          <div className="space-y-3">
            <p
              data-fio-resumo
              className={
                d.saude.atravessa
                  ? "rounded-lg border border-gold/60 bg-gold/10 px-3 py-2 text-sm text-navy"
                  : "rounded-lg border border-terracotta/40 bg-terracotta/10 px-3 py-2 text-sm text-terracotta"
              }
            >
              {d.resumo}
            </p>

            <p className="text-xs text-navy/60">
              As doze etapas do fio:{" "}
              {ETAPAS_FIO.map((e, i) => (
                <span key={e}>
                  {i > 0 ? " → " : ""}
                  {ROTULO_ETAPA[e]}
                </span>
              ))}
              . Pessoa histórica da pesquisa não tem pessoa canônica, membro de caso nem parte no contrato — esses
              elos não contam como lacuna dela.
            </p>

            {d.fila.length > 0 ? (
              <div data-fio-fila className="space-y-2">
                <h3 className="text-sm font-medium">O que está aberto, e onde se resolve</h3>
                {d.fila.map((f) => (
                  <div
                    key={f.coluna}
                    className={
                      f.natureza === "mecanico"
                        ? "rounded-xl border border-gold/60 bg-gold/10 p-3"
                        : "rounded-xl border border-navy/15 bg-cream/50 p-3"
                    }
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Selo
                        texto={f.natureza === "mecanico" ? "religável sem decisão" : "decisão de identidade"}
                        tom={f.natureza === "mecanico" ? "ok" : "alerta"}
                      />
                      <code className="text-[11px] text-navy/70">{f.coluna}</code>
                    </div>
                    <p className="mt-1 text-xs text-navy/70">{f.ondeResolver}</p>
                    <p className="text-[11px] text-navy/55">
                      {f.pessoas.length} pessoa(s): {f.pessoas.slice(0, 6).join(" · ")}
                      {f.pessoas.length > 6 ? ` · +${f.pessoas.length - 6}` : ""}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}

            {d.religaveis > 0 ? (
              <div className="rounded-xl border border-gold/60 bg-gold/10 p-3">
                <p className="text-xs text-navy/75">
                  {d.religaveis} pessoa(s) de pesquisa com elo mecânico em falta. Religar faz duas coisas, e nenhuma
                  delas decide quem é quem: copia o ponteiro do perfil genealógico que já aponta para a pessoa, e
                  deriva o membro do caso compondo duas decisões já registradas — o perfil diz qual é a pessoa
                  cadastrada, e a lista de membros diz qual é o membro dela aqui. Composição ambígua não é gravada.{" "}
                  <strong>Nenhuma identidade é inferida por nome, endereço, profissão ou filiação.</strong>
                </p>
                <AcaoOperacional
                  rotulo="Religar os elos mecânicos"
                  className="mt-2 rounded-lg bg-navy px-3 py-1.5 text-xs text-cream"
                  capacidade="avancar_pesquisa_evidencia_microentrega"
                  efeito="Copia o ponteiro do perfil genealógico e deriva o membro do caso da composição de duas decisões já registradas. Nunca sobrescreve ponteiro gravado, não grava composição ambígua e não decide identidade de ninguém."
                  onConfirmar={(motivo) => m.mutate(motivo)}
                />
              </div>
            ) : null}

            {d.caseId ? (
              <p className="text-xs text-navy/60">
                Onde a equipe decide identidade:{" "}
                <Link
                  to="/pessoas-linhagens/$caseId"
                  params={{ caseId: d.caseId }}
                  className="font-medium text-navy underline underline-offset-2"
                >
                  Ficha Genealógica — Perfil 360°
                </Link>
                {" · "}
                <Link
                  to="/casos/$caseId"
                  params={{ caseId: d.caseId }}
                  className="font-medium text-navy underline underline-offset-2"
                >
                  Caso 360 — Pessoas e família
                </Link>
              </p>
            ) : null}

            <button
              type="button"
              onClick={() => setAbertoDetalhe((v) => !v)}
              className="text-xs text-navy/60 underline"
            >
              {abertoDetalhe ? "Fechar o detalhe por pessoa" : "Ver o fio pessoa por pessoa"}
            </button>

            {abertoDetalhe ? (
              <div data-fio-por-pessoa className="overflow-x-auto">
                <table className="w-full text-[11px]" style={{ minWidth: "900px" }}>
                  <thead className="bg-navy/5 text-left uppercase tracking-wide text-navy/60">
                    <tr>
                      <th className="px-2 py-2 font-medium">Pessoa</th>
                      {ELOS_DO_FIO.map((e) => (
                        <th key={e.chave} className="px-2 py-2 font-medium" title={e.coluna}>
                          {e.chave.replace(/_/g, " ")}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {d.pessoas.map((p) => (
                      <tr key={p.id} className="border-t border-navy/5">
                        <td className="px-2 py-2 align-top">
                          <strong>{p.nome}</strong>
                          <span className="block text-navy/50">
                            {ROTULO_STATUS[p.personStatus] ?? p.personStatus}
                          </span>
                        </td>
                        {ELOS_DO_FIO.map((def) => {
                          const e = p.elos.find((x) => x.chave === def.chave);
                          const estado = e?.estado ?? "aberto";
                          return (
                            <td
                              key={def.chave}
                              className={
                                estado === "segura"
                                  ? "px-2 py-2 text-center text-navy"
                                  : estado === "nao_se_aplica"
                                    ? "px-2 py-2 text-center text-navy/30"
                                    : "px-2 py-2 text-center text-terracotta"
                              }
                              title={
                                e?.motivo ??
                                `${eloPor(def.chave)?.coluna ?? def.chave} — ${
                                  estado === "segura" ? "segura" : "aberto"
                                }`
                              }
                            >
                              {estado === "segura" ? "sim" : estado === "nao_se_aplica" ? "—" : "aberto"}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}

            <p className="text-[11px] text-navy/55">
              Este painel mede e religa só o que já está decidido. Não funde pessoa por nome, endereço, profissão ou
              filiação; não eleva estado de evidência; não envia, assina, cobra nem publica nada.
            </p>
          </div>
        )}
      </EstadoDados>
    </CaCard>
  );
}
