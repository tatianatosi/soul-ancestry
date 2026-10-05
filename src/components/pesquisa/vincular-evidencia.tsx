/**
 * Vínculo da evidência a pessoa, relação, evento ou fonte (Corte F, 05/10/2026).
 *
 * Medido antes de montar: `research_evidence_links` é o que diz **o que** a
 * evidência prova — e seu único escritor, `vincularEvidencia`, não tinha
 * chamador. O vínculo só nascia por SQL, e a evidência ficava solta no caso:
 * registrada, sem dizer qual pessoa identifica, qual relação sustenta, qual
 * evento data ou qual fonte contextualiza.
 *
 * Vocabulário real dos CHECKs, nada inventado:
 *  - entity_type: person · relationship · event · source · research_case
 *  - link_role: supports · contradicts · identifies · dates · locates ·
 *    contextualizes · duplicate_reference · other
 *
 * `contradicts` existe de propósito: evidência que contradiz é registrada como
 * tal, nunca descartada em silêncio.
 */

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { AcaoOperacional } from "@/components/saas/acao-operacional";
import { vincularEvidencia } from "@/lib/pesquisa-modulo.functions";

export const TIPOS_ENTIDADE_EVIDENCIA = [
  { valor: "person", rotulo: "Pessoa" },
  { valor: "relationship", rotulo: "Relação" },
  { valor: "event", rotulo: "Evento" },
  { valor: "source", rotulo: "Fonte" },
] as const;

export const PAPEIS_VINCULO_EVIDENCIA = [
  { valor: "identifies", rotulo: "Identifica" },
  { valor: "supports", rotulo: "Sustenta" },
  { valor: "contradicts", rotulo: "Contradiz" },
  { valor: "dates", rotulo: "Data" },
  { valor: "locates", rotulo: "Localiza" },
  { valor: "contextualizes", rotulo: "Contextualiza" },
  { valor: "duplicate_reference", rotulo: "Referência duplicada" },
  { valor: "other", rotulo: "Outro" },
] as const;

type Opcao = { id: string; texto: string };

export function VincularEvidencia({
  researchCaseId,
  evidenciaId,
  pessoas,
  relacoes,
  eventos,
  fontes,
  aoConcluir,
}: {
  researchCaseId: string;
  evidenciaId: string;
  pessoas: Opcao[];
  relacoes: Opcao[];
  eventos: Opcao[];
  fontes: Opcao[];
  aoConcluir?: () => void;
}) {
  const vincular = useServerFn(vincularEvidencia);
  const [aberto, setAberto] = useState(false);
  const [tipo, setTipo] = useState<string>("person");
  const [entidadeId, setEntidadeId] = useState("");
  const [papel, setPapel] = useState<string>("identifies");

  const opcoes: Opcao[] =
    tipo === "person" ? pessoas : tipo === "relationship" ? relacoes : tipo === "event" ? eventos : fontes;

  const m = useMutation({
    mutationFn: () =>
      vincular({
        data: { researchCaseId, evidenciaId, entityType: tipo, entityId: entidadeId, linkRole: papel },
      }),
    onSuccess: () => {
      toast.success("Vínculo registrado: a evidência agora diz o que prova.");
      setEntidadeId("");
      setAberto(false);
      aoConcluir?.();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!aberto) {
    return (
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="text-[11px] text-navy/60 underline"
        data-abrir-vinculo-evidencia
      >
        Vincular a pessoa, relação, evento ou fonte
      </button>
    );
  }

  return (
    <div data-vincular-evidencia className="mt-2 space-y-2 rounded-lg border border-navy/15 bg-cream/60 p-2">
      <div className="grid gap-2 sm:grid-cols-3">
        <select
          value={tipo}
          onChange={(e) => {
            setTipo(e.target.value);
            setEntidadeId("");
          }}
          aria-label="Tipo de entidade"
          className="rounded-lg border border-navy/20 px-2 py-1.5 text-xs"
        >
          {TIPOS_ENTIDADE_EVIDENCIA.map((t) => (
            <option key={t.valor} value={t.valor}>
              {t.rotulo}
            </option>
          ))}
        </select>
        <select
          value={entidadeId}
          onChange={(e) => setEntidadeId(e.target.value)}
          aria-label="Entidade a vincular"
          className="rounded-lg border border-navy/20 px-2 py-1.5 text-xs"
        >
          <option value="">Selecione…</option>
          {opcoes.map((o) => (
            <option key={o.id} value={o.id}>
              {o.texto}
            </option>
          ))}
        </select>
        <select
          value={papel}
          onChange={(e) => setPapel(e.target.value)}
          aria-label="Papel do vínculo"
          className="rounded-lg border border-navy/20 px-2 py-1.5 text-xs"
        >
          {PAPEIS_VINCULO_EVIDENCIA.map((p) => (
            <option key={p.valor} value={p.valor}>
              {p.rotulo}
            </option>
          ))}
        </select>
      </div>
      {opcoes.length === 0 ? (
        <p className="text-[11px] text-navy/60">
          Nenhum registro deste tipo no caso ainda. Registre a entidade primeiro — o vínculo não a cria.
        </p>
      ) : null}
      <div className="flex flex-wrap items-center gap-2">
        {entidadeId && !m.isPending ? (
          <AcaoOperacional
            rotulo="Registrar vínculo"
            className="h-auto rounded-lg bg-navy px-2 py-1 text-[11px] text-cream"
            capacidade="avancar_pesquisa_evidencia_microentrega"
            efeito="Registra o que esta evidência prova. Não eleva o estado da evidência nem conclui nada."
            onConfirmar={() => m.mutate()}
          />
        ) : (
          <span className="text-[11px] text-navy/50">
            {m.isPending ? "Registrando…" : "Escolha a entidade para registrar o vínculo."}
          </span>
        )}
        <button type="button" onClick={() => setAberto(false)} className="text-[11px] text-navy/60 underline">
          Fechar
        </button>
      </div>
      <p className="text-[11px] text-navy/50">
        Vincular não valida: o estado da evidência continua mudando só pelo grafo de transição, com revisor
        registrado.
      </p>
    </div>
  );
}
