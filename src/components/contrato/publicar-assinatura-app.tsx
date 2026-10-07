/**
 * A7 (03/10/2026) — campo editável da assinatura e do upsell no Desk.
 *
 * "o preço no app da Ana ... somente devemos mostrar sua assinatura e
 * possibilidade de upsell com preço também precisa de um campo para editar se
 * não tiver no app e no desk".
 *
 * Este é o campo no **Desk**. O valor é digitado num campo próprio (aceita
 * "R$ 320", "320,00" ou "320"), nunca escrito dentro do nome do plano — o
 * servidor recusa preço em texto livre.
 *
 * 07/10/2026 — correção da Proprietária: o upsell é só Desk, nunca chega ao
 * App. A assinatura continua indo para a Conta do cliente; o upsell fica
 * como registro interno (ver `assinatura-app.ts` e `TIPOS_FORA_DO_APP`).
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { Selecao, Texto } from "@/components/caso/campos";
import { AcaoOperacional } from "@/components/saas/acao-operacional";
import { EstadoDados } from "@/components/saas/estado-dados";
import { A7_AUTORIZACAO, formatarValor, PERIODICIDADES, TIPO_ASSINATURA, TIPO_UPSELL, valorEmCentavos, validarAssinatura } from "@/lib/assinatura-app";
import {
  despublicarAssinaturaDoApp,
  listarAssinaturaDoCaso,
  publicarAssinaturaNoApp,
} from "@/lib/assinatura-app.functions";

export function PublicarAssinaturaApp({ caseId }: { caseId: string }) {
  const carregar = useServerFn(listarAssinaturaDoCaso);
  const publicar = useServerFn(publicarAssinaturaNoApp);
  const despublicar = useServerFn(despublicarAssinaturaDoApp);
  const qc = useQueryClient();
  const chave = ["assinatura-app", caseId];
  const q = useQuery({ queryKey: chave, queryFn: () => carregar({ data: { caseId } }), retry: false });

  const [tipo, setTipo] = useState<string>(TIPO_ASSINATURA);
  const [nome, setNome] = useState("");
  const [valor, setValor] = useState("");
  const [periodicidade, setPeriodicidade] = useState("mensal");
  const [situacao, setSituacao] = useState("");

  const centavos = valorEmCentavos(valor);
  const erros = validarAssinatura({ nome, valorCentavos: centavos ?? 0, periodicidade, situacao });

  const m = useMutation({
    mutationFn: () =>
      publicar({ data: { caseId, tipo, nome, valorCentavos: centavos ?? 0, periodicidade, situacao } }),
    onSuccess: () => {
      toast.success(tipo === TIPO_ASSINATURA ? "Assinatura publicada no App." : "Upsell registrado no Desk (não aparece no App).");
      setNome("");
      setValor("");
      setSituacao("");
      void qc.invalidateQueries({ queryKey: chave });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const mRemover = useMutation({
    mutationFn: (projecaoId: string) =>
      despublicar({ data: { caseId, projecaoId, motivo: "Retirado do App pela equipe no Desk." } }),
    onSuccess: () => {
      toast.success("Retirado.");
      void qc.invalidateQueries({ queryKey: chave });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <section className="rounded-xl border border-navy/10 bg-cream/40 p-4" data-publicar-assinatura>
      <h3 className="font-serif text-base text-navy">Assinatura no App + upsell (só Desk)</h3>
      <p className="mt-1 text-[11px] text-navy/50">
        Autorizado em {A7_AUTORIZACAO.data}: {A7_AUTORIZACAO.escopo} O valor vai no campo de valor — preço dentro do
        nome do plano é recusado pelo servidor. Correção de 07/10/2026: a assinatura vai para a Conta do cliente; o
        upsell fica só aqui no Desk, nunca aparece no App.
      </p>

      <EstadoDados
        carregando={q.isLoading}
        erro={q.error}
        dados={q.data ? [q.data] : undefined}
        aoTentarNovamente={() => void q.refetch()}
        recurso="a assinatura publicada"
      >
        {([atual]) => (
          <div className="mt-3 space-y-3">
            <div className="rounded-lg border border-navy/10 bg-white/60 p-3">
              <p className="text-[10px] uppercase tracking-wide text-navy/40">No App hoje</p>
              {atual.assinatura ? (
                <p className="mt-1 text-xs text-navy">
                  {atual.assinatura.nome} · {atual.assinatura.valor} {atual.assinatura.periodicidadeRotulo}
                  {atual.assinatura.situacao ? ` · ${atual.assinatura.situacao}` : ""}{" "}
                  <button
                    type="button"
                    className="ml-1 underline decoration-gold text-[10px] text-navy/50"
                    onClick={() => mRemover.mutate(atual.assinatura!.id)}
                  >
                    retirar do App
                  </button>
                </p>
              ) : (
                <p className="mt-1 text-xs text-navy/55">
                  Nenhuma assinatura publicada. O cliente vê o estado vazio — nada é inventado.
                </p>
              )}
              {atual.upsells.length > 0 ? (
                <div className="mt-2 border-t border-navy/10 pt-2">
                  <p className="text-[10px] uppercase tracking-wide text-navy/40">
                    Registrado só no Desk (não aparece no App)
                  </p>
                  <ul className="mt-1 space-y-0.5">
                    {atual.upsells.map((u) => (
                      <li key={u.id} className="text-xs text-navy/70">
                        Próximo nível: {u.nome} · {u.valor} {u.periodicidadeRotulo}{" "}
                        <button
                          type="button"
                          className="ml-1 underline decoration-gold text-[10px] text-navy/50"
                          onClick={() => mRemover.mutate(u.id)}
                        >
                          retirar
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <Selecao
                label="O que publicar"
                valor={tipo}
                opcoes={[
                  { valor: TIPO_ASSINATURA, rotulo: "Assinatura do cliente (vai para o App)" },
                  { valor: TIPO_UPSELL, rotulo: "Upsell — próximo nível (só Desk)" },
                ]}
                onChange={setTipo}
              />
              <Texto label="Nome do plano (como o cliente lê)" valor={nome} onChange={setNome} />
              <Texto
                label="Valor"
                valor={valor}
                onChange={setValor}
                ajuda={centavos ? `Será publicado como ${formatarValor(centavos)}` : "Aceita R$ 320, 320,00 ou 320"}
              />
              <Selecao
                label="Periodicidade"
                valor={periodicidade}
                opcoes={PERIODICIDADES.map((p) => ({ valor: p.valor, rotulo: p.rotulo }))}
                onChange={setPeriodicidade}
              />
              <Texto label="Situação (opcional)" valor={situacao} onChange={setSituacao} />
            </div>

            <AcaoOperacional
              rotulo={tipo === TIPO_ASSINATURA ? "Publicar assinatura no App" : "Registrar upsell no Desk"}
              capacidade="aprovar_projecao_app_cliente"
              validacaoFormulario={erros[0] ?? null}
              efeito={
                tipo === TIPO_ASSINATURA
                  ? "Publica na aba Conta do App do cliente, com o valor. Grava com releitura, auditoria e timeline. Não gera cobrança, link de pagamento nem contrato."
                  : "Registra o próximo nível só no Desk — o cliente não vê isto no App. Grava com releitura, auditoria e timeline. Não gera cobrança, link de pagamento nem contrato."
              }
              onConfirmar={() => m.mutate()}
            />
          </div>
        )}
      </EstadoDados>
    </section>
  );
}
