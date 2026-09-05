import { useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Archive, ShieldCheck, Users } from "lucide-react";

import { SaasShell, EstadoVazio, BotaoTentarNovamente, useSaas } from "@/components/saas/shell";
import { arquivarRegistro, criarRegistro } from "@/lib/saas.functions";
import { ativarCliente, listarPessoasCliente, reclassificarPessoa } from "@/lib/clientes.functions";
import {
  CAMADAS,
  CLASSIFICACOES,
  descricaoCamada,
  rotuloCamada,
  FILTROS_PADRAO,
  ORIGENS,
  PAISES,
  STATUS_COMERCIAL,
  destinoDoRegistro,
  elegibilidadeAtivacao,
  filtrarClientes,
  normalizarPais,
  participantesDeNucleo,
  rotuloClassificacao,
  rotuloDe,
  type Filtros,
  type PessoaLista,
} from "@/lib/clientes-lista";

import { rotuloEstado } from "@/lib/estados";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/clientes")({
  head: () => ({
    meta: [
      { title: "Clientes — Clube Ancestral" },
      {
        name: "description",
        content:
          "Perfis de cliente elegíveis, pré-clientes e participantes de núcleo familiar, com arquivamento e trilha de auditoria.",
      },
      { property: "og:title", content: "Clientes — Clube Ancestral" },
      {
        property: "og:description",
        content: "Clientes ativos, pré-clientes e participantes de núcleo familiar.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ClientesPage,
});

const ABAS: { valor: Filtros["estado"]; rotulo: string }[] = [
  { valor: "ativos", rotulo: "Ativos" },
  { valor: "suspensos", rotulo: "Suspensos" },
  { valor: "encerrados", rotulo: "Encerrados" },
  { valor: "arquivados", rotulo: "Arquivados" },
];

function Etiqueta({
  tom,
  children,
}: {
  tom: "ativo" | "pre" | "nucleo" | "demo" | "caso";
  children: React.ReactNode;
}) {
  const tons: Record<string, string> = {
    ativo: "bg-primary/10 text-primary border-primary/30",
    pre: "bg-muted text-muted-foreground border-border",
    caso: "bg-secondary/20 text-foreground border-border",
    nucleo: "bg-accent/15 text-accent-foreground border-accent/30",
    demo: "bg-destructive/10 text-destructive border-destructive/30",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium",
        tons[tom],
      )}
    >
      {children}
    </span>
  );
}

function ClientesPage() {
  const { podeEscrever, somenteLeitura } = useSaas();
  const queryClient = useQueryClient();
  const carregar = useServerFn(listarPessoasCliente);
  const ativar = useServerFn(ativarCliente);
  const reclassificar = useServerFn(reclassificarPessoa);
  const arquivar = useServerFn(arquivarRegistro);
  const criar = useServerFn(criarRegistro);

  const [filtros, setFiltros] = useState<Filtros>(FILTROS_PADRAO);
  const [erro, setErro] = useState<string | null>(null);
  const [ativando, setAtivando] = useState<{ pessoa: PessoaLista; justificativa: string } | null>(
    null,
  );
  const [arquivando, setArquivando] = useState<{ pessoa: PessoaLista; motivo: string } | null>(
    null,
  );
  const [novo, setNovo] = useState<Record<string, string> | null>(null);

  const q = useQuery({ queryKey: ["clientes-pessoas"], queryFn: () => carregar() });
  const pessoas = q.data ?? [];
  const recarregar = () => void queryClient.invalidateQueries({ queryKey: ["clientes-pessoas"] });

  const executar = <T,>(fn: () => Promise<T>) =>
    fn()
      .then(() => {
        setErro(null);
        recarregar();
      })
      .catch((e: Error) => setErro(e.message));

  const mAtivar = useMutation({
    mutationFn: (v: { id: string; justificativa: string }) => ativar({ data: v }),
    onSuccess: () => {
      setAtivando(null);
      setErro(null);
      recarregar();
    },
    onError: (e: Error) => setErro(e.message),
  });

  const lista = filtrarClientes(pessoas, filtros);
  const participantes = participantesDeNucleo(pessoas, filtros.incluirDemonstracoes);
  const preClientes = pessoas.filter(
    (p) =>
      !p.archived_at &&
      p.classificacao === "pre_cliente" &&
      (filtros.incluirDemonstracoes || !p.is_demo),
  );

  return (
    <SaasShell
      titulo="Clientes"
      descricao="Perfil de cliente só existe após ativação elegível. Pré-clientes, participantes de núcleo e demonstrações ficam fora da lista principal."
    >
      {erro ? (
        <p className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {erro}
        </p>
      ) : null}

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {ABAS.map((a) => (
          <button
            key={a.valor}
            type="button"
            onClick={() => setFiltros((f) => ({ ...f, estado: a.valor }))}
            className={cn(
              "rounded-full border px-3 py-1 text-sm",
              filtros.estado === a.valor
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground",
            )}
          >
            {a.rotulo}
          </button>
        ))}
        <label className="ml-2 flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={filtros.incluirPreClientes}
            onChange={(e) => setFiltros((f) => ({ ...f, incluirPreClientes: e.target.checked }))}
          />
          Incluir pré-clientes
        </label>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={filtros.incluirParticipantes}
            onChange={(e) => setFiltros((f) => ({ ...f, incluirParticipantes: e.target.checked }))}
          />
          Incluir participantes de núcleo
        </label>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={filtros.incluirDemonstracoes}
            onChange={(e) => setFiltros((f) => ({ ...f, incluirDemonstracoes: e.target.checked }))}
          />
          Incluir demonstrações
        </label>

        {podeEscrever && !somenteLeitura ? (
          <button
            type="button"
            className="ml-auto rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground"
            onClick={() =>
              setNovo({
                nome: "",
                email: "",
                telefone: "",
                origem: "planejador",
                pais_interesse: "Áustria",
                status_comercial: "lead",
              })
            }
          >
            Novo cadastro
          </button>
        ) : null}
      </div>

      <section className="mb-4 rounded-lg border border-border bg-muted/30 px-4 py-3">
        <h2 className="text-sm font-medium">Camadas do registro</h2>
        <ul className="mt-2 grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
          {CAMADAS.map((c) => (
            <li key={c.valor}>
              <span className="font-medium text-foreground">{c.rotulo}:</span> {c.descricao}
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-muted-foreground">
          A promoção a cliente ativo fica bloqueada automaticamente enquanto o registro estiver em
          formalização ou em qualquer estágio de pré-cliente, e para membros de núcleo familiar e
          cadastros sem caso.
        </p>
      </section>

      <section className="rounded-lg border border-border">
        <header className="border-b border-border px-4 py-3 text-sm font-medium">
          Perfis de cliente ({lista.length})
        </header>
        {q.isLoading ? (
          <p className="px-4 py-6 text-sm text-muted-foreground">Carregando…</p>
        ) : q.isError ? (
          <EstadoVazio
            mensagem="Não foi possível carregar os perfis de cliente."
            acao={<BotaoTentarNovamente aoClicar={() => void q.refetch()} />}
          />
        ) : lista.length === 0 ? (
          <EstadoVazio mensagem="Nenhum perfil elegível neste filtro. Casos em formalização permanecem como pré-cliente." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-2">Pessoa</th>
                  <th className="px-4 py-2">Camada do registro</th>
                  <th className="px-4 py-2">Classificação</th>
                  <th className="px-4 py-2">Origem</th>
                  <th className="px-4 py-2">Status comercial</th>
                  <th className="px-4 py-2">País</th>
                  <th className="px-4 py-2">Estado</th>
                  <th className="px-4 py-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                {lista.map((p) => {
                  const eleg = elegibilidadeAtivacao(p);
                  return (
                    <tr key={p.id} className="border-t border-border align-top">
                      <td className="px-4 py-2">
                        <div className="flex flex-wrap items-center gap-2">
                          {/*
                            O nome vira porta. Antes esta lista era o fim do
                            caminho: dava para ver que a pessoa existe e não
                            dava para abrir a pessoa.
                          */}
                          <Link
                            to="/pessoas/$clienteId"
                            params={{ clienteId: p.id }}
                            className="font-medium underline decoration-transparent underline-offset-4 transition-colors hover:decoration-current"
                          >
                            {p.nome_social || p.nome}
                          </Link>
                          {p.is_demo ? <Etiqueta tom="demo">Demonstração</Etiqueta> : null}
                        </div>
                        <p className="text-xs text-muted-foreground">{p.email ?? "—"}</p>
                      </td>
                      <td className="px-4 py-2">
                        <Etiqueta
                          tom={
                            eleg.camada === "client_profile"
                              ? "ativo"
                              : eleg.camada === "family_nucleus"
                                ? "nucleo"
                                : eleg.camada === "case_member"
                                  ? "caso"
                                  : "pre"
                          }
                        >
                          {rotuloCamada(eleg.camada)}
                        </Etiqueta>
                        <p className="mt-1 max-w-[16rem] text-[11px] text-muted-foreground">
                          {descricaoCamada(eleg.camada)}
                        </p>
                      </td>
                      <td className="px-4 py-2">
                        <Etiqueta tom={p.classificacao === "cliente_ativo" ? "ativo" : "pre"}>
                          {rotuloClassificacao(p.classificacao)}
                        </Etiqueta>
                      </td>
                      <td className="px-4 py-2">{rotuloDe(ORIGENS, p.origem)}</td>
                      <td className="px-4 py-2">
                        {rotuloDe(STATUS_COMERCIAL, p.status_comercial)}
                      </td>
                      <td className="px-4 py-2">{normalizarPais(p.pais_interesse) ?? "—"}</td>
                      <td className="px-4 py-2">
                        {p.archived_at ? "Arquivado" : rotuloEstado("cliente", p.status)}
                      </td>
                      <td className="px-4 py-2">
                        {p.archived_at ? (
                          <span className="text-xs text-muted-foreground">
                            {p.archive_motivo ?? "—"}
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            <Link
                              to="/pessoas/$clienteId"
                              params={{ clienteId: p.id }}
                              className="inline-flex items-center gap-1 rounded-md border border-gold/50 bg-gold/10 px-2 py-1 text-xs text-navy hover:bg-gold/20"
                            >
                              Ver pessoa 360
                            </Link>
                            {p.classificacao !== "cliente_ativo" ? (
                              <button
                                type="button"
                                disabled={!podeEscrever || somenteLeitura || !eleg.apto}
                                title={
                                  eleg.apto
                                    ? "Registrar decisão humana de ativação"
                                    : eleg.pendencias.join(" ")
                                }
                                onClick={() => setAtivando({ pessoa: p, justificativa: "" })}
                                className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs disabled:opacity-40"
                              >
                                <ShieldCheck className="h-3.5 w-3.5" /> Ativar
                              </button>
                            ) : null}
                            <button
                              type="button"
                              disabled={!podeEscrever || somenteLeitura}
                              onClick={() => setArquivando({ pessoa: p, motivo: "" })}
                              className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs disabled:opacity-40"
                            >
                              <Archive className="h-3.5 w-3.5" /> Arquivar
                            </button>
                          </div>
                        )}
                        {!p.archived_at && !eleg.apto && p.classificacao !== "cliente_ativo" ? (
                          <ul className="mt-1 text-[11px] text-muted-foreground">
                            {eleg.pendencias.map((m) => (
                              <li key={m}>• {m}</li>
                            ))}
                          </ul>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-6 rounded-lg border border-border">
        <header className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3 text-sm font-medium">
          <Users className="h-4 w-4" /> Participantes de núcleo familiar ({participantes.length})
          <Link to="/nucleos" className="ml-auto text-xs font-normal text-primary underline">
            Abrir Núcleos e dossiês
          </Link>
        </header>
        {!filtros.incluirParticipantes ? (
          <p className="px-4 py-4 text-sm text-muted-foreground">
            Beneficiários e membros do núcleo não são clientes independentes. Os dados pessoais
            deles são tratados em Núcleos e dossiês; marque “Incluir participantes de núcleo” para
            conferir o vínculo aqui.
          </p>
        ) : participantes.length === 0 ? (
          <p className="px-4 py-4 text-sm text-muted-foreground">Nenhum participante registrado.</p>
        ) : (
          <ul className="divide-y divide-border">
            {participantes.map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"
              >
                <div>
                  <span className="font-medium">{p.nome}</span>{" "}
                  <Etiqueta tom="nucleo">Participante do núcleo</Etiqueta>
                  {p.is_demo ? <Etiqueta tom="demo">Demonstração</Etiqueta> : null}
                  <p className="text-xs text-muted-foreground">
                    {p.participacoes.length
                      ? p.participacoes
                          .map((v) => `${v.nucleo ?? "Núcleo"} — ${v.papel ?? "participante"}`)
                          .join(" · ")
                      : "Vínculo registrado no dossiê do caso."}
                  </p>
                  <p className="text-[11px] text-muted-foreground">{destinoDoRegistro(p)}</p>
                </div>
                <button
                  type="button"
                  disabled={!podeEscrever || somenteLeitura}
                  onClick={() => {
                    const motivo = window.prompt("Motivo da contratação individual documentada (opcional):");
                    if (motivo !== null) {
                      void executar(() =>
                        reclassificar({ data: { id: p.id, classificacao: "pre_cliente", motivo } }),
                      );
                    }
                  }}
                  className="rounded-md border border-border px-2 py-1 text-xs disabled:opacity-40"
                >
                  Contratação individual
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6 rounded-lg border border-border">
        <header className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3 text-sm font-medium">
          Pré-clientes e casos em formalização ({preClientes.length})
          <Link to="/casos" className="ml-auto text-xs font-normal text-primary underline">
            Abrir Casos 360
          </Link>
        </header>
        {!filtros.incluirPreClientes ? (
          <p className="px-4 py-4 text-sm text-muted-foreground">
            Pré-onboarding é estado interno do caso: esses registros seguem como lead, oportunidade
            e caso em formalização até contrato assinado, pagamento inicial confirmado e decisão
            humana de ativação. Marque “Incluir pré-clientes” para vê-los aqui.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {preClientes.map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"
              >
                <span>
                  {p.nome} {p.is_demo ? <Etiqueta tom="demo">Demonstração</Etiqueta> : null}
                  <span className="block text-[11px] text-muted-foreground">
                    {destinoDoRegistro(p)}
                  </span>
                </span>
                <span className="text-xs text-muted-foreground">
                  {rotuloDe(STATUS_COMERCIAL, p.status_comercial)} ·{" "}
                  {p.contratoAssinado ? "contrato assinado" : "sem contrato assinado"} ·{" "}
                  {p.pagamentoConfirmado ? "pagamento confirmado" : "sem pagamento inicial"}
                </span>
              </li>
            ))}
            {preClientes.length === 0 ? (
              <li className="px-4 py-4 text-sm text-muted-foreground">Nenhum pré-cliente.</li>
            ) : null}
          </ul>
        )}
      </section>

      {ativando ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-4">
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-4">
            <h2 className="text-sm font-semibold">Ativar {ativando.pessoa.nome}</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              A ativação é decisão humana registrada. O servidor confere contrato assinado e
              pagamento inicial confirmado.
            </p>
            <textarea
              className="mt-3 w-full rounded-md border border-border bg-background p-2 text-sm"
              rows={3}
              placeholder="Justificativa da ativação"
              value={ativando.justificativa}
              onChange={(e) => setAtivando({ ...ativando, justificativa: e.target.value })}
            />
            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-md border border-border px-3 py-1.5 text-sm"
                onClick={() => setAtivando(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground"
                onClick={() =>
                  mAtivar.mutate({ id: ativando.pessoa.id, justificativa: ativando.justificativa })
                }
              >
                Registrar ativação
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {arquivando ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-4">
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-4">
            <h2 className="text-sm font-semibold">Arquivar {arquivando.pessoa.nome}</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Não há exclusão física: o histórico é preservado com motivo, autor e data.
            </p>
            <textarea
              className="mt-3 w-full rounded-md border border-border bg-background p-2 text-sm"
              rows={3}
              placeholder="Motivo do arquivamento"
              value={arquivando.motivo}
              onChange={(e) => setArquivando({ ...arquivando, motivo: e.target.value })}
            />
            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-md border border-border px-3 py-1.5 text-sm"
                onClick={() => setArquivando(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground"
                onClick={() => {
                  const alvo = arquivando;
                  void executar(() =>
                    arquivar({
                      data: { entidade: "clientes", id: alvo.pessoa.id, motivo: alvo.motivo },
                    }),
                  ).then(() => setArquivando(null));
                }}
              >
                Arquivar
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {novo ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-4">
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-4">
            <h2 className="text-sm font-semibold">Novo cadastro de pessoa</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Todo cadastro entra como pré-cliente. Ativação exige contrato, pagamento e decisão
              humana.
            </p>
            <div className="mt-3 space-y-2">
              {[
                { chave: "nome", rotulo: "Nome" },
                { chave: "email", rotulo: "E-mail" },
                { chave: "telefone", rotulo: "Telefone" },
              ].map((c) => (
                <label key={c.chave} className="block text-xs text-muted-foreground">
                  {c.rotulo}
                  <input
                    className="mt-1 w-full rounded-md border border-border bg-background p-2 text-sm text-foreground"
                    value={novo[c.chave] ?? ""}
                    onChange={(e) => setNovo({ ...novo, [c.chave]: e.target.value })}
                  />
                </label>
              ))}
              <label className="block text-xs text-muted-foreground">
                Origem do relacionamento
                <select
                  className="mt-1 w-full rounded-md border border-border bg-background p-2 text-sm text-foreground"
                  value={novo["origem"] ?? ""}
                  onChange={(e) => setNovo({ ...novo, origem: e.target.value })}
                >
                  {ORIGENS.map((o) => (
                    <option key={o.valor} value={o.valor}>
                      {o.rotulo}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs text-muted-foreground">
                Status comercial
                <select
                  className="mt-1 w-full rounded-md border border-border bg-background p-2 text-sm text-foreground"
                  value={novo["status_comercial"] ?? ""}
                  onChange={(e) => setNovo({ ...novo, status_comercial: e.target.value })}
                >
                  {STATUS_COMERCIAL.map((o) => (
                    <option key={o.valor} value={o.valor}>
                      {o.rotulo}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs text-muted-foreground">
                País de interesse
                <select
                  className="mt-1 w-full rounded-md border border-border bg-background p-2 text-sm text-foreground"
                  value={novo["pais_interesse"] ?? ""}
                  onChange={(e) => setNovo({ ...novo, pais_interesse: e.target.value })}
                >
                  {PAISES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs text-muted-foreground">
                Classificação inicial
                <select
                  className="mt-1 w-full rounded-md border border-border bg-background p-2 text-sm text-foreground"
                  value={novo["classificacao"] ?? "pre_cliente"}
                  onChange={(e) => setNovo({ ...novo, classificacao: e.target.value })}
                >
                  {CLASSIFICACOES.filter((c) => c.valor !== "cliente_ativo").map((c) => (
                    <option key={c.valor} value={c.valor}>
                      {c.rotulo}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-md border border-border px-3 py-1.5 text-sm"
                onClick={() => setNovo(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground"
                onClick={() => {
                  const dados = {
                    ...novo,
                    status: "pre_onboarding",
                    classificacao: novo["classificacao"] ?? "pre_cliente",
                  };
                  void executar(() => criar({ data: { entidade: "clientes", dados } })).then(() =>
                    setNovo(null),
                  );
                }}
              >
                Cadastrar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </SaasShell>
  );
}
