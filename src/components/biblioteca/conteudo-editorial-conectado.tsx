import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { CardIndicador, CarregandoDesk, VazioDesk } from "@/components/desk/ui-desk";
import { AcaoOperacional } from "@/components/saas/acao-operacional";
import {
  aprovarProjecao,
  arquivarRegistroG03,
  despublicarProjecao,
  listarFilaMicroentregas,
} from "@/lib/biblioteca-evidencias.functions";
import { APROVACOES } from "@/lib/biblioteca-evidencias";
import { PRATELEIRAS, prateleiraDe, type PrateleiraId } from "@/lib/projecoes-cliente";
import { rotuloTipoProjecao } from "@/lib/projecoes-cliente";

function rotuloStatus(status: string) {
  return APROVACOES.find((i) => i.id === status)?.rotulo ?? status;
}

function dataBr(v: string | null) {
  if (!v) return "—";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("pt-BR");
}

/**
 * §18 do De-Para (Desk, Biblioteca Mestre) — zonas "Coleções", "Lista de
 * conteúdo" e "Ações". A fonte é a mesma de `FilaPublicacaoReal`
 * (`listarFilaMicroentregas`, app_projections org-wide já com caso, autor e
 * status resolvidos) — mesma queryKey, sem busca duplicada. O que faltava
 * era classificar por coleção (mesma função `prateleiraDe` que o App usa em
 * `/portal/legado`, para as duas telas nunca divergirem) e listar/agir sobre
 * os itens, não só contar por status.
 *
 * DIVERGÊNCIA REGISTRADA (§29): app_projections não tem coluna de "versão" —
 * mostro a última atualização real em vez de inventar um número de versão.
 * "Título" também não existe como campo próprio: uso o tipo da projeção
 * (já rotulado para leitura humana), que é o que a tela tem de mais
 * específico sobre o item.
 */
export function ConteudoEditorialConectado() {
  const carregar = useServerFn(listarFilaMicroentregas);
  const q = useQuery({ queryKey: ["fila-microentregas"], queryFn: () => carregar() });
  const qc = useQueryClient();

  const [prateleiraAtiva, setPrateleiraAtiva] = useState<PrateleiraId | "todas">("todas");

  const aprovarProj = useServerFn(aprovarProjecao);
  const despublicarProj = useServerFn(despublicarProjecao);
  const arquivar = useServerFn(arquivarRegistroG03);

  const invalidar = () => qc.invalidateQueries({ queryKey: ["fila-microentregas"] });
  const mAprovar = useMutation({
    mutationFn: (v: { id: string; publicar: boolean }) => aprovarProj({ data: v }),
    onSuccess: invalidar,
  });
  const mDespublicar = useMutation({
    mutationFn: (v: { id: string }) => despublicarProj({ data: v }),
    onSuccess: invalidar,
  });
  const mArquivar = useMutation({
    mutationFn: (v: { id: string; motivo: string }) =>
      arquivar({ data: { tabela: "app_projections" as const, id: v.id, motivo: v.motivo } }),
    onSuccess: invalidar,
  });

  const itens = useMemo(() => {
    return (q.data ?? []).map((item) => {
      const tipoRotulo = rotuloTipoProjecao(item.tipo);
      return { ...item, tipoRotulo, prateleira: prateleiraDe({ conteudo: item.descricao, tipoRotulo }) };
    });
  }, [q.data]);

  const contagemPorColecao = useMemo(() => {
    const mapa = new Map<PrateleiraId, number>();
    for (const p of PRATELEIRAS) mapa.set(p.id, 0);
    for (const item of itens) mapa.set(item.prateleira, (mapa.get(item.prateleira) ?? 0) + 1);
    return mapa;
  }, [itens]);

  const itensFiltrados =
    prateleiraAtiva === "todas" ? itens : itens.filter((i) => i.prateleira === prateleiraAtiva);

  return (
    <section className="rounded-xl border border-navy/10 bg-cream/50 p-4" aria-label="Conteúdo editorial do App Cliente" data-biblioteca-conteudo-editorial>
      <div className="mb-3">
        <h2 className="font-serif text-lg text-navy">Conteúdo editorial (App Cliente)</h2>
        <p className="mt-1 text-sm text-navy/65">
          Coleções, itens e ações reais sobre o que pode ser publicado no App — distinto das referências internas
          abaixo.
        </p>
      </div>

      {q.isLoading ? <CarregandoDesk linhas={1} rotulo="Carregando conteúdo editorial" /> : null}
      {q.isError ? (
        <div role="alert" className="rounded-lg border border-terracotta/40 bg-terracotta/5 p-3 text-sm text-terracotta">
          <p>Não foi possível ler o conteúdo editorial. Isto é falha de leitura, não ausência de conteúdo.</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => void q.refetch()}>
            Tentar novamente
          </Button>
        </div>
      ) : null}

      {!q.isLoading && !q.isError ? (
        itens.length === 0 ? (
          <VazioDesk
            titulo="Nenhum item editorial registrado"
            descricao="Quando uma projeção for criada a partir de evidência ou entrega, ela aparece aqui, classificada por coleção."
          />
        ) : (
          <>
            <div data-biblioteca-colecoes className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {PRATELEIRAS.map((p) => (
                <button key={p.id} type="button" onClick={() => setPrateleiraAtiva(p.id)} className="text-left">
                  <CardIndicador
                    rotulo={p.rotulo}
                    valor={contagemPorColecao.get(p.id) ?? 0}
                    apoio={p.dica}
                    tom={prateleiraAtiva === p.id ? "sucesso" : "neutro"}
                  />
                </button>
              ))}
            </div>
            {prateleiraAtiva !== "todas" ? (
              <button
                type="button"
                onClick={() => setPrateleiraAtiva("todas")}
                className="mt-2 text-xs text-navy underline underline-offset-4"
              >
                Ver todas as coleções
              </button>
            ) : null}

            <ul className="mt-4 space-y-2" data-biblioteca-lista-conteudo>
              {itensFiltrados.map((item) => (
                <li key={item.id} className="rounded-lg border border-navy/10 bg-cream/25 p-3 text-xs text-navy/75">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-navy">{item.tipoRotulo}</p>
                      <p className="text-navy/55">
                        {PRATELEIRAS.find((p) => p.id === item.prateleira)?.rotulo} ·{" "}
                        {item.casoCodigo ?? item.casoTitulo ?? "Sem caso vinculado"}
                        {item.responsavel ? ` · ${item.responsavel}` : ""} · {dataBr(item.atualizadoEm)}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-md border border-navy/15 bg-cream px-2 py-0.5 text-[11px] text-navy/70">
                      {rotuloStatus(item.status)}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <Link
                      to="/biblioteca-evidencias/$caseId"
                      params={{ caseId: item.caseId }}
                      className="underline decoration-navy/30 hover:decoration-navy"
                    >
                      Abrir no caso
                    </Link>
                    {["draft", "in_review"].includes(item.status) ? (
                      <AcaoOperacional
                        rotulo="Aprovar e publicar"
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-[11px]"
                        capacidade="aprovar_projecao_app_cliente"
                        acaoExterna="publicar_no_app_cliente"
                        efeito="Aprova e publica esta projeção no App Cliente. Ação voltada ao cliente: exige confirmação com motivo registrado."
                        onConfirmar={() => mAprovar.mutate({ id: item.id, publicar: true })}
                      />
                    ) : null}
                    {item.status === "published" ? (
                      <AcaoOperacional
                        rotulo="Despublicar"
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-[11px]"
                        capacidade="aprovar_projecao_app_cliente"
                        acaoExterna="despublicar_no_app_cliente"
                        efeito="Remove a projeção do App Cliente imediatamente. Continua aprovada, editável e pode ser republicada."
                        onConfirmar={() => mDespublicar.mutate({ id: item.id })}
                      />
                    ) : null}
                    <AcaoOperacional
                      rotulo="Arquivar"
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-[11px] text-terracotta"
                      acaoExterna="arquivar_projecao_app_cliente"
                      efeito="Arquiva o item com motivo — não há exclusão física."
                      onConfirmar={(motivo) => mArquivar.mutate({ id: item.id, motivo })}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </>
        )
      ) : null}
    </section>
  );
}
