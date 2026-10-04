/**
 * Trazer o conteúdo do deck Canva para os parâmetros do caso (04/10/2026).
 *
 * Proprietária: "o Canva já está autorizado na proposta". Medido: as páginas
 * estavam extraídas e o conteúdo nunca chegava aos parâmetros do contrato —
 * `servicos_excluidos` vazio era a única pendência impeditiva de conteúdo.
 *
 * Esta tela mostra, antes de qualquer gravação, exatamente o que será
 * preenchido, o que divergiu (e por isso não será tocado) e o que o deck
 * realmente não traz.
 */
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { AcaoOperacional } from "@/components/saas/acao-operacional";
import { preencherParametrosDoCanva } from "@/lib/contrato-parametros.functions";

export type PlanoCanvaView = {
  registroId: string | null;
  plano: {
    campo: string;
    rotulo: string;
    acao: "preencher" | "divergente" | "ja_igual" | "sem_conteudo_no_canva";
    valorCanva: string | null;
    valorAtual: string | null;
    pagina: number | null;
    motivo: string;
  }[];
  aPreencher: string[];
  divergentes: string[];
  foraDoCanva: { campo: string; motivo: string }[];
  falsosNaoLocalizados: { pagina: number; campo: string }[];
};

export function TrazerDoCanva({ canva, aoConcluir }: { canva: PlanoCanvaView; aoConcluir: () => void }) {
  const preencher = useServerFn(preencherParametrosDoCanva);
  const m = useMutation({
    mutationFn: (motivo: string) => preencher({ data: { id: canva.registroId!, motivo } }),
    onSuccess: (r) => {
      toast.success(
        r.gravados.length
          ? `${r.gravados.length} campo(s) preenchido(s) do deck: ${r.gravados.join(", ")}. Nenhum campo existente foi sobrescrito.`
          : "Nada a preencher: todo campo que o deck traz já está gravado.",
      );
      aoConcluir();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const porAcao = (acao: PlanoCanvaView["plano"][number]["acao"]) => canva.plano.filter((i) => i.acao === acao);

  return (
    <section className="rounded-lg border border-navy/15 bg-card p-3" id="canva" data-trazer-do-canva>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-medium text-navy">Conteúdo do deck da proposta</h2>
        <span className="text-[11px] text-navy/55" data-canva-contagem>
          {canva.aPreencher.length} a preencher · {canva.divergentes.length} divergente(s)
        </span>
      </div>
      <p className="mt-1 text-[11px] text-navy/60">
        O deck está autorizado e extraído. Só campo vazio é preenchido, com origem na proposta e status a confirmar.
        Campo já preenchido e diferente nunca é sobrescrito: vira divergência para decisão humana.
      </p>

      {porAcao("preencher").length ? (
        <div className="mt-3">
          <p className="text-[11px] font-semibold text-navy">Será preenchido</p>
          <ul className="mt-1 space-y-0.5 text-[11px] text-navy/80" data-canva-preencher>
            {porAcao("preencher").map((i) => (
              <li key={i.campo}>
                <strong>{i.rotulo}</strong> (página {i.pagina}): {String(i.valorCanva).slice(0, 180)}
                {String(i.valorCanva).length > 180 ? "…" : ""}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {porAcao("divergente").length ? (
        <div className="mt-3">
          <p className="text-[11px] font-semibold text-terracotta">Divergente — nada será sobrescrito</p>
          <ul className="mt-1 space-y-0.5 text-[11px] text-navy/80" data-canva-divergente>
            {porAcao("divergente").map((i) => (
              <li key={i.campo}>
                <strong>{i.rotulo}</strong>: gravado “{String(i.valorAtual).slice(0, 90)}” · deck (p. {i.pagina}) “
                {String(i.valorCanva).slice(0, 90)}”
                <span className="block text-navy/55">{i.motivo}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {canva.foraDoCanva.length ? (
        <details className="mt-3">
          <summary className="cursor-pointer text-[11px] text-navy/60">
            Campos que o deck não traz ({canva.foraDoCanva.length}) — continuam pendentes por isso
          </summary>
          <ul className="mt-1 space-y-0.5 text-[11px] text-navy/70" data-canva-fora>
            {canva.foraDoCanva.map((c) => (
              <li key={c.campo}>
                <strong>{c.campo}</strong>: {c.motivo}
              </li>
            ))}
          </ul>
        </details>
      ) : null}

      {canva.falsosNaoLocalizados.length ? (
        <p className="mt-2 text-[11px] text-navy/60" data-canva-falsos>
          {canva.falsosNaoLocalizados.length} campo(s) estavam marcados como “não localizados” na extração, mas o texto
          está na própria página ({canva.falsosNaoLocalizados.map((f) => `p.${f.pagina} ${f.campo}`).join(", ")}).
        </p>
      ) : null}

      {canva.registroId ? (
        <AcaoOperacional
          rotulo="Trazer o conteúdo do deck para os parâmetros"
          capacidade="corrigir_proposta_escopo_preco"
          efeito="Preenche apenas os campos vazios com o texto do deck já extraído, como origem proposta e status a confirmar. Não sobrescreve campo preenchido, não envia, não assina e não cobra."
          onConfirmar={(motivo) => m.mutate(motivo)}
        />
      ) : null}
    </section>
  );
}
