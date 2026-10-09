/**
 * Ações do shell de go-live.
 *
 * Um formulário curto por ação, sempre disparado por pessoa: nada acontece
 * sozinho, nada é enviado para fora e nada é apagado. Ao salvar, a tela
 * recarrega os dados do caso para a Proprietária conferir na hora.
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { emailValido, formatarTelefone, telefoneValido } from "@/lib/validacao-pessoa";
import { useAvisoEdicaoNaoSalva } from "@/lib/aviso-edicao-nao-salva";

export type CampoAcao = {
  nome: string;
  rotulo: string;
  tipo?: "texto" | "area" | "numero" | "data" | "escolha" | "telefone" | "email";
  obrigatorio?: boolean;
  opcoes?: { valor: string; rotulo: string }[];
  ajuda?: string;
  padrao?: string;
};

export type ValoresAcao = Record<string, string>;

export function Acao({
  rotulo,
  titulo,
  campos,
  aoConfirmar,
  confirmacao = "Salvo e conferido no servidor.",
  variante = "default",
}: {
  rotulo: string;
  titulo?: string;
  campos: CampoAcao[];
  aoConfirmar: (valores: ValoresAcao) => Promise<unknown>;
  confirmacao?: string;
  variante?: "default" | "outline";
}) {
  const [aberto, setAberto] = useState(false);
  const [valores, setValores] = useState<ValoresAcao>(() =>
    Object.fromEntries(campos.map((c) => [c.nome, c.padrao ?? ""])),
  );
  const [mensagem, setMensagem] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);
  /* F5 / sair da linha (09/10/2026): trava a saída com edição pendente. */
  useAvisoEdicaoNaoSalva(
    campos.some((c) => String(valores[c.nome] ?? "") !== String(c.padrao ?? "")),
  );
  const queryClient = useQueryClient();

  /*
   * 16/09/2026 — a confirmação aparecia antes da releitura, e pedia
   * "recarregue para conferir". Agora a tela só diz que salvou depois de
   * reler o caso no servidor; se a releitura falhar, isso é dito em vez de
   * fingir sucesso.
   */
  const mutacao = useMutation({
    mutationFn: aoConfirmar,
    onSuccess: async () => {
      setValores(Object.fromEntries(campos.map((c) => [c.nome, c.padrao ?? ""])));
      setAberto(false);
      try {
        await queryClient.refetchQueries({ queryKey: ["go-live"] });
        setMensagem({ tipo: "ok", texto: confirmacao });
      } catch {
        setMensagem({
          tipo: "erro",
          texto: "Salvamos, mas não foi possível reler agora. Atualize a página para conferir.",
        });
      }
    },
    onError: (e: unknown) => {
      const texto = e instanceof Error ? e.message : "Não foi possível salvar agora.";
      setMensagem({ tipo: "erro", texto });
    },
  });

  return (
    <div className="min-w-0">
      <Button
        size="sm"
        variant={variante}
        onClick={() => {
          setMensagem(null);
          setAberto((v) => !v);
        }}
        aria-expanded={aberto}
      >
        {rotulo}
      </Button>

      {aberto ? (
        <form
          className="mt-3 min-w-0 space-y-3 rounded-xl border border-navy/10 bg-white/80 p-3"
          onSubmit={(e) => {
            e.preventDefault();
            setMensagem(null);
            mutacao.mutate(valores);
          }}
        >
          {titulo ? <p className="font-serif text-sm text-navy">{titulo}</p> : null}
          {campos.map((campo) => {
            const id = `acao-${campo.nome}`;
            const valorAtual = valores[campo.nome] ?? "";
            // Telefone/e-mail (02/10/2026, Corte MÁSCARAS): este formulário
            // genérico alimenta vários campos de pessoa (golive.leads.tsx,
            // golive.comercial.tsx) — mascarar/validar aqui cobre todos de
            // uma vez, em vez de repetir por tela.
            const invalido =
              (campo.tipo === "telefone" && valorAtual.trim() !== "" && !telefoneValido(valorAtual)) ||
              (campo.tipo === "email" && valorAtual.trim() !== "" && !emailValido(valorAtual));
            const comum = {
              id,
              required: campo.obrigatorio,
              value: valorAtual,
              onChange: (
                e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
              ) =>
                setValores((v) => ({
                  ...v,
                  [campo.nome]: campo.tipo === "telefone" ? formatarTelefone(e.target.value) : e.target.value,
                })),
              className: `w-full min-w-0 rounded-lg border bg-white px-3 py-2 text-sm text-navy outline-none focus:border-navy/40 ${
                invalido ? "border-terracota/60" : "border-navy/15"
              }`,
            };
            return (
              <div key={campo.nome} className="min-w-0">
                <label htmlFor={id} className="mb-1 block text-xs uppercase tracking-wide text-navy/55">
                  {campo.rotulo}
                </label>
                {campo.tipo === "area" ? (
                  <textarea rows={3} {...comum} />
                ) : campo.tipo === "escolha" ? (
                  <select {...comum}>
                    <option value="">Selecione</option>
                    {(campo.opcoes ?? []).map((o) => (
                      <option key={o.valor} value={o.valor}>
                        {o.rotulo}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={
                      campo.tipo === "numero"
                        ? "number"
                        : campo.tipo === "data"
                          ? "date"
                          : campo.tipo === "telefone"
                            ? "tel"
                            : campo.tipo === "email"
                              ? "email"
                              : "text"
                    }
                    step={campo.tipo === "numero" ? "0.01" : undefined}
                    {...comum}
                  />
                )}
                {invalido ? (
                  <p className="mt-1 text-[11px] text-terracota">
                    {campo.tipo === "telefone" ? "Telefone inválido." : "E-mail inválido."}
                  </p>
                ) : null}
                {campo.ajuda ? <p className="mt-1 text-[11px] text-navy/50">{campo.ajuda}</p> : null}
              </div>
            );
          })}

          <div className="flex flex-wrap gap-2">
            <Button size="sm" type="submit" disabled={mutacao.isPending}>
              {mutacao.isPending ? "Salvando…" : "Salvar"}
            </Button>
            <Button size="sm" type="button" variant="outline" onClick={() => setAberto(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      ) : null}

      {mensagem ? (
        <p
          role="status"
          className={`mt-2 text-xs ${mensagem.tipo === "ok" ? "text-navy/70" : "text-[var(--terracota,#9A3A2F)]"}`}
        >
          {mensagem.texto}
        </p>
      ) : null}
    </div>
  );
}

/** Linha de ações, sempre dentro do cartão. */
export function Acoes({ children }: { children: ReactNode }) {
  return <div className="flex min-w-0 flex-col gap-3">{children}</div>;
}
