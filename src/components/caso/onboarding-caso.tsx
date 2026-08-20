import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { Secao, Selecao, inputCls } from "@/components/caso/campos";
import { PainelPlanoOnboarding } from "@/components/caso/onboarding-plano";
import { atualizarItemOnboarding } from "@/lib/caso-canonico.functions";
import { STATUS_ONBOARDING_ITEM, gatesClienteAtivo, rotulo } from "@/lib/caso-ficha";


type Linha = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

/** Onboarding e gates de "cliente ativo" — App do cliente só abre com onboarding em curso. */
export function AbaOnboarding({
  caso,
  itens,
  nucleos,
  membrosNucleo,
  planoInicialOk,
  bloqueado,
  onMudou,
}: {
  caso: Linha;
  itens: Linha[];
  nucleos: Linha[];
  membrosNucleo: Linha[];
  planoInicialOk: boolean;
  bloqueado: boolean;
  onMudou: () => void;
}) {
  const nucleo = nucleos[0] ?? null;
  const gates = gatesClienteAtivo({
    contrato_assinado: caso["contrato_assinado"],
    pagamento_confirmado: caso["pagamento_confirmado"],
    responsavel_principal: caso["responsavel_principal"],
    nucleo_ok: Boolean(nucleo),
    dossie_mae: nucleo?.dossie_mae_referencia ?? null,
    plano_inicial_ok: planoInicialOk,
  });
  const pendentes = gates.filter((g) => !g.ok);

  return (
    <div className="space-y-5">
      <PainelPlanoOnboarding caseId={String(caso.id)} />

      <Secao titulo="Gates de cliente ativo" descricao="Nenhum caso é considerado ativo com gate pendente.">

        <ul className="grid gap-2 sm:grid-cols-2">
          {gates.map((g) => (
            <li key={g.chave} className="flex items-center gap-2 rounded-lg border border-navy/10 px-3 py-2 text-sm">
              <span className={g.ok ? "text-gold" : "text-terracotta"}>{g.ok ? "●" : "○"}</span>
              <span className="text-navy/80">{g.rotulo}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-navy/55">
          {pendentes.length === 0
            ? "Todos os gates atendidos: o caso pode ser tratado como ativo."
            : `${pendentes.length} gate(s) pendente(s): ${pendentes.map((g) => g.rotulo).join(", ")}.`}
        </p>
      </Secao>

      <Secao titulo="Núcleo familiar" descricao="Família é registro distinto do caso e da pessoa.">
        {!nucleo ? (
          <p className="text-sm text-navy/55">Nenhum núcleo familiar vinculado a este caso.</p>
        ) : (
          <div className="space-y-3 text-sm text-navy/80">
            <p className="font-medium text-navy">{nucleo.nome ?? "Núcleo familiar"}</p>
            <p className="text-xs text-navy/55">Dossiê-mãe: {nucleo.dossie_mae_referencia ?? "pendente"}</p>
            <ul className="space-y-1 text-xs text-navy/70">
              {membrosNucleo.map((m) => (
                <li key={m.id}>
                  {m.nome} — {m.papel}
                  {m.vinculo ? ` · ${m.vinculo}` : ""}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Secao>

      <Secao titulo="Checklist de onboarding" descricao="Itens obrigatórios não podem ser marcados como não aplicáveis sem observação.">
        {itens.length === 0 ? (
          <p className="text-sm text-navy/55">Checklist ainda não gerado para este caso.</p>
        ) : (
          <ul className="space-y-3">
            {itens.map((i) => (
              <ItemOnboarding key={i.id} item={i} bloqueado={bloqueado} onMudou={onMudou} />
            ))}
          </ul>
        )}
      </Secao>
    </div>
  );
}

function ItemOnboarding({ item, bloqueado, onMudou }: { item: Linha; bloqueado: boolean; onMudou: () => void }) {
  const atualizar = useServerFn(atualizarItemOnboarding);
  const [status, setStatus] = useState(String(item.status ?? "pendente"));
  const [obs, setObs] = useState(String(item.observacao ?? ""));
  const [erro, setErro] = useState<string | null>(null);
  const sujo = status !== String(item.status ?? "pendente") || obs !== String(item.observacao ?? "");

  const m = useMutation({
    mutationFn: () => {
      if (item.obrigatorio && status === "nao_aplicavel" && obs.trim().length < 5) {
        throw new Error("Item obrigatório exige observação para ser marcado como não aplicável.");
      }
      return atualizar({ data: { id: String(item.id), status, observacao: obs } });
    },
    onSuccess: () => {
      setErro(null);
      onMudou();
    },
    onError: (e: unknown) => setErro(e instanceof Error ? e.message : "Falha ao salvar o item."),
  });

  return (
    <li className="rounded-lg border border-navy/10 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-navy">
          {item.label}
          {item.obrigatorio ? <span className="ml-2 text-[11px] uppercase text-terracotta">obrigatório</span> : null}
        </p>
        <span className="text-[11px] uppercase tracking-wide text-navy/50">{rotulo(STATUS_ONBOARDING_ITEM, item.status)}</span>
      </div>
      {erro ? <p className="mt-2 text-xs text-terracotta">{erro}</p> : null}
      <div className="mt-2 grid gap-3 sm:grid-cols-2">
        <Selecao label="Status" valor={status} opcoes={STATUS_ONBOARDING_ITEM} onChange={setStatus} desabilitado={bloqueado} />
        <label className="block">
          <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-navy/50">Observação interna</span>
          <input className={inputCls} value={obs} disabled={bloqueado} onChange={(e) => setObs(e.target.value)} />
        </label>
      </div>
      <button
        onClick={() => m.mutate()}
        disabled={bloqueado || !sujo || m.isPending}
        className="mt-2 rounded-lg border border-navy/15 px-3 py-1.5 text-xs text-navy disabled:opacity-40"
      >
        Salvar item
      </button>
    </li>
  );
}
