import { useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Archive, ShieldCheck, Users } from "lucide-react";

import { SaasShell, EstadoVazio, useSaas } from "@/components/saas/shell";
import { useAutoridade } from "@/components/saas/autoridade";
import { AcaoOperacional } from "@/components/saas/acao-operacional";
import { EstadoDados } from "@/components/saas/estado-dados";
import { arquivarRegistro, criarRegistro } from "@/lib/saas.functions";
import {
  ativarCliente,
  listarPessoasCliente,
  reclassificarPessoa,
  verificarDuplicidadeCliente,
  type PossivelDuplicidadeCliente,
} from "@/lib/clientes.functions";
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
import { formatarCpf, formatarTelefone } from "@/lib/validacao-pessoa";

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
    ativo: "bg-navy/10 text-navy border-navy/30",
    pre: "bg-cream/60 text-navy/65 border-navy/15",
    caso: "bg-gold/15 text-navy border-navy/15",
    nucleo: "bg-cream text-navy border-gold/40",
    demo: "bg-terracotta/10 text-terracotta border-terracotta/30",
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
  const autoridade = useAutoridade();
  const { podeEscrever: podeEscreverVinculo } = useSaas();
  // Autoridade operacional: vínculo somente leitura vira pendência declarada,
  // nunca botão desabilitado. Só falta de papel ou de organização bloqueia.
  const podeEscrever = !autoridade.bloqueado({ capacidade: "corrigir_pessoas_dependentes_representacao" });
  const pendenciaVinculo = podeEscreverVinculo
    ? null
    : "Seu vínculo de equipe está marcado como somente leitura — a gravação segue disponível por decisão sua e é revalidada no servidor.";
  const queryClient = useQueryClient();
  const carregar = useServerFn(listarPessoasCliente);
  const ativar = useServerFn(ativarCliente);
  const reclassificar = useServerFn(reclassificarPessoa);
  const arquivar = useServerFn(arquivarRegistro);
  const criar = useServerFn(criarRegistro);
  const verificarDuplicidade = useServerFn(verificarDuplicidadeCliente);

  const [filtros, setFiltros] = useState<Filtros>(FILTROS_PADRAO);
  const [erro, setErro] = useState<string | null>(null);
  const [ativando, setAtivando] = useState<{
    pessoa: PessoaLista;
    justificativa: string;
    pendencias: string[];
  } | null>(null);
  const [arquivando, setArquivando] = useState<{ pessoa: PessoaLista; motivo: string } | null>(
    null,
  );
  const [novo, setNovo] = useState<Record<string, string> | null>(null);
  const [duplicidadesNovo, setDuplicidadesNovo] = useState<PossivelDuplicidadeCliente[]>([]);
  const [verificandoDuplicidade, setVerificandoDuplicidade] = useState(false);

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
      {pendenciaVinculo || !podeEscrever ? (
        <p className="mb-4 rounded-lg border border-navy/15 bg-navy/5 px-3 py-2 text-xs text-navy/70">
          Pendência registrada:{" "}
          {pendenciaVinculo ??
            "Contexto de acesso ainda não confirmado — a gravação é revalidada no servidor."}
        </p>
      ) : null}
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
                ? "border-navy bg-navy/10 text-navy"
                : "border-navy/15 text-navy/65",
            )}
          >
            {a.rotulo}
          </button>
        ))}
        <label className="ml-2 flex items-center gap-2 text-sm text-navy/65">
          <input
            type="checkbox"
            checked={filtros.incluirPreClientes}
            onChange={(e) => setFiltros((f) => ({ ...f, incluirPreClientes: e.target.checked }))}
          />
          Incluir pré-clientes
        </label>
        <label className="flex items-center gap-2 text-sm text-navy/65">
          <input
            type="checkbox"
            checked={filtros.incluirParticipantes}
            onChange={(e) => setFiltros((f) => ({ ...f, incluirParticipantes: e.target.checked }))}
          />
          Incluir participantes de núcleo
        </label>
        <label className="flex items-center gap-2 text-sm text-navy/65">
          <input
            type="checkbox"
            checked={filtros.incluirDemonstracoes}
            onChange={(e) => setFiltros((f) => ({ ...f, incluirDemonstracoes: e.target.checked }))}
          />
          Incluir demonstrações
        </label>

        <button
          type="button"
          className="ml-auto rounded-md bg-navy px-3 py-1.5 text-sm text-cream"
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
      </div>

      <section className="mb-4 rounded-lg border border-navy/15 bg-cream/60/30 px-4 py-3">
        <h2 className="text-sm font-medium">Camadas do registro</h2>
        <ul className="mt-2 grid gap-1 text-xs text-navy/65 sm:grid-cols-2">
          {CAMADAS.map((c) => (
            <li key={c.valor}>
              <span className="font-medium text-foreground">{c.rotulo}:</span> {c.descricao}
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-navy/65">
          A promoção a cliente ativo fica bloqueada automaticamente enquanto o registro estiver em
          formalização ou em qualquer estágio de pré-cliente, e para membros de núcleo familiar e
          cadastros sem caso.
        </p>
      </section>

      <section className="rounded-lg border border-navy/15">
        <header className="border-b border-navy/15 px-4 py-3 text-sm font-medium">
          Perfis de cliente ({lista.length})
        </header>
        <EstadoDados
          carregando={q.isLoading}
          erro={q.error}
          dados={q.data}
          aoTentarNovamente={() => void q.refetch()}
          recurso="os perfis de cliente"
          vazio="Nenhuma pessoa cadastrada ainda."
        >
          {() =>
          lista.length === 0 ? (
          <EstadoVazio mensagem="Nenhum perfil elegível neste filtro. Casos em formalização permanecem como pré-cliente." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-navy/65">
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
                    <tr key={p.id} className="border-t border-navy/15 align-top">
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
                        <p className="text-xs text-navy/65">{p.email ?? "—"}</p>
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
                        <p className="mt-1 max-w-[16rem] text-[11px] text-navy/65">
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
                          <span className="text-xs text-navy/65">
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
                                title={
                                  eleg.apto
                                    ? "Registrar decisão humana de ativação"
                                    : eleg.pendencias.join(" ")
                                }
                                onClick={() =>
                                  setAtivando({
                                    pessoa: p,
                                    justificativa: "",
                                    pendencias: eleg.apto ? [] : eleg.pendencias,
                                  })
                                }
                                className="inline-flex items-center gap-1 rounded-md border border-navy/15 px-2 py-1 text-xs"
                              >
                                <ShieldCheck className="h-3.5 w-3.5" /> Ativar
                              </button>
                            ) : null}
                            <button
                              type="button"
                              onClick={() => setArquivando({ pessoa: p, motivo: "" })}
                              className="inline-flex items-center gap-1 rounded-md border border-navy/15 px-2 py-1 text-xs"
                            >
                              <Archive className="h-3.5 w-3.5" /> Arquivar
                            </button>
                          </div>
                        )}
                        {!p.archived_at && !eleg.apto && p.classificacao !== "cliente_ativo" ? (
                          <ul className="mt-1 text-[11px] text-navy/65">
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
        )
          }
        </EstadoDados>
      </section>

      <section className="mt-6 rounded-lg border border-navy/15">
        <header className="flex flex-wrap items-center gap-2 border-b border-navy/15 px-4 py-3 text-sm font-medium">
          <Users className="h-4 w-4" /> Participantes de núcleo familiar ({participantes.length})
          <Link to="/nucleos" className="ml-auto text-xs font-normal text-navy underline">
            Abrir Núcleos e dossiês
          </Link>
        </header>
        {!filtros.incluirParticipantes ? (
          <p className="px-4 py-4 text-sm text-navy/65">
            Beneficiários e membros do núcleo não são clientes independentes. Os dados pessoais
            deles são tratados em Núcleos e dossiês; marque “Incluir participantes de núcleo” para
            conferir o vínculo aqui.
          </p>
        ) : (
          <EstadoDados
            carregando={q.isLoading}
            erro={q.error}
            dados={q.data}
            aoTentarNovamente={() => void q.refetch()}
            recurso="os participantes de núcleo"
            vazio="Nenhum participante registrado."
          >
            {() =>
          participantes.length === 0 ? (
          <p className="px-4 py-4 text-sm text-navy/65">Nenhum participante registrado.</p>
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
                  <p className="text-xs text-navy/65">
                    {p.participacoes.length
                      ? p.participacoes
                          .map((v) => `${v.nucleo ?? "Núcleo"} — ${v.papel ?? "participante"}`)
                          .join(" · ")
                      : "Vínculo registrado no dossiê do caso."}
                  </p>
                  <p className="text-[11px] text-navy/65">{destinoDoRegistro(p)}</p>
                </div>
                <AcaoOperacional
                  rotulo="Contratação individual"
                  variant="outline"
                  size="sm"
                  capacidade="corrigir_pessoas_dependentes_representacao"
                  efeito="Reclassifica o participante de núcleo como pré-cliente com contratação individual documentada."
                  onConfirmar={async (motivo) => {
                    await executar(() =>
                      reclassificar({ data: { id: p.id, classificacao: "pre_cliente", motivo } }),
                    );
                  }}
                />
              </li>
            ))}
          </ul>
        )
            }
          </EstadoDados>
        )}
      </section>

      <section className="mt-6 rounded-lg border border-navy/15">
        <header className="flex flex-wrap items-center gap-2 border-b border-navy/15 px-4 py-3 text-sm font-medium">
          Pré-clientes e casos em formalização ({preClientes.length})
          <Link to="/casos" className="ml-auto text-xs font-normal text-navy underline">
            Abrir Casos 360
          </Link>
        </header>
        {!filtros.incluirPreClientes ? (
          <p className="px-4 py-4 text-sm text-navy/65">
            Pré-onboarding é estado interno do caso: esses registros seguem como lead, oportunidade
            e caso em formalização até contrato assinado, pagamento inicial confirmado e decisão
            humana de ativação. Marque “Incluir pré-clientes” para vê-los aqui.
          </p>
        ) : (
          <EstadoDados
            carregando={q.isLoading}
            erro={q.error}
            dados={q.data}
            aoTentarNovamente={() => void q.refetch()}
            recurso="os pré-clientes"
            vazio="Nenhum pré-cliente."
          >
            {() => (
          <ul className="divide-y divide-border">
            {preClientes.map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"
              >
                <span>
                  {p.nome} {p.is_demo ? <Etiqueta tom="demo">Demonstração</Etiqueta> : null}
                  <span className="block text-[11px] text-navy/65">
                    {destinoDoRegistro(p)}
                  </span>
                </span>
                <span className="text-xs text-navy/65">
                  {rotuloDe(STATUS_COMERCIAL, p.status_comercial)} ·{" "}
                  {p.contratoAssinado ? "contrato assinado" : "sem contrato assinado"} ·{" "}
                  {p.pagamentoConfirmado ? "pagamento confirmado" : "sem pagamento inicial"}
                </span>
              </li>
            ))}
            {preClientes.length === 0 ? (
              <li className="px-4 py-4 text-sm text-navy/65">Nenhum pré-cliente.</li>
            ) : null}
          </ul>
            )}
          </EstadoDados>
        )}
      </section>

      {ativando ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-4">
          <div className="w-full max-w-md rounded-lg border border-navy/15 bg-cream/50 p-4">
            <h2 className="text-sm font-semibold">Ativar {ativando.pessoa.nome}</h2>
            <p className="mt-1 text-xs text-navy/65">
              A ativação é decisão humana registrada. O servidor confere contrato assinado e
              pagamento inicial confirmado.
            </p>
            <textarea
              className="mt-3 w-full rounded-md border border-navy/15 bg-background p-2 text-sm"
              rows={3}
              placeholder="Justificativa da ativação"
              value={ativando.justificativa}
              onChange={(e) => setAtivando({ ...ativando, justificativa: e.target.value })}
            />
            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-md border border-navy/15 px-3 py-1.5 text-sm"
                onClick={() => setAtivando(null)}
              >
                Cancelar
              </button>
              <AcaoOperacional
                rotulo="Registrar ativação"
                capacidade="avancar_caso_planejador_tarefa"
                pendenciaGate={ativando.pendencias.length ? ativando.pendencias.join("; ") : null}
                efeito={`Marca ${ativando.pessoa.nome} como cliente ativo, com autoria e justificativa registradas.`}
                onConfirmar={async () => {
                  await mAtivar.mutateAsync({
                    id: ativando.pessoa.id,
                    justificativa: ativando.justificativa,
                  });
                }}
              />
            </div>
          </div>
        </div>
      ) : null}

      {arquivando ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-4">
          <div className="w-full max-w-md rounded-lg border border-navy/15 bg-cream/50 p-4">
            <h2 className="text-sm font-semibold">Arquivar {arquivando.pessoa.nome}</h2>
            <p className="mt-1 text-xs text-navy/65">
              Não há exclusão física: o histórico é preservado com motivo, autor e data.
            </p>
            <textarea
              className="mt-3 w-full rounded-md border border-navy/15 bg-background p-2 text-sm"
              rows={3}
              placeholder="Motivo do arquivamento"
              value={arquivando.motivo}
              onChange={(e) => setArquivando({ ...arquivando, motivo: e.target.value })}
            />
            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-md border border-navy/15 px-3 py-1.5 text-sm"
                onClick={() => setArquivando(null)}
              >
                Cancelar
              </button>
              <AcaoOperacional
                rotulo="Arquivar"
                capacidade="editar_rascunho"
                efeito={`Arquiva ${arquivando.pessoa.nome} preservando histórico, motivo, autor e data. Não há exclusão física.`}
                onConfirmar={async () => {
                  const alvo = arquivando;
                  await executar(() =>
                    arquivar({
                      data: { entidade: "clientes", id: alvo.pessoa.id, motivo: alvo.motivo },
                    }),
                  );
                  setArquivando(null);
                }}
              />
            </div>
          </div>
        </div>
      ) : null}

      {novo ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-4">
          <div className="w-full max-w-md rounded-lg border border-navy/15 bg-cream/50 p-4">
            <h2 className="text-sm font-semibold">Novo cadastro de pessoa</h2>
            <p className="mt-1 text-xs text-navy/65">
              Todo cadastro entra como pré-cliente. Ativação exige contrato, pagamento e decisão
              humana.
            </p>
            <div className="mt-3 space-y-2">
              {[
                { chave: "nome", rotulo: "Nome", tipo: "text" },
                { chave: "email", rotulo: "E-mail", tipo: "email" },
                { chave: "telefone", rotulo: "Telefone", tipo: "tel" },
                { chave: "cpf", rotulo: "CPF (opcional)", tipo: "text" },
              ].map((c) => (
                <label key={c.chave} className="block text-xs text-navy/65">
                  {c.rotulo}
                  <input
                    type={c.tipo}
                    className="mt-1 w-full rounded-md border border-navy/15 bg-background p-2 text-sm text-foreground"
                    value={novo[c.chave] ?? ""}
                    onChange={(e) =>
                      setNovo({
                        ...novo,
                        [c.chave]:
                          c.chave === "telefone"
                            ? formatarTelefone(e.target.value)
                            : c.chave === "cpf"
                              ? formatarCpf(e.target.value)
                              : e.target.value,
                      })
                    }
                  />
                </label>
              ))}
              <label className="block text-xs text-navy/65">
                Origem do relacionamento
                <select
                  className="mt-1 w-full rounded-md border border-navy/15 bg-background p-2 text-sm text-foreground"
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
              <label className="block text-xs text-navy/65">
                Status comercial
                <select
                  className="mt-1 w-full rounded-md border border-navy/15 bg-background p-2 text-sm text-foreground"
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
              <label className="block text-xs text-navy/65">
                País de interesse
                <select
                  className="mt-1 w-full rounded-md border border-navy/15 bg-background p-2 text-sm text-foreground"
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
              <label className="block text-xs text-navy/65">
                Classificação inicial
                <select
                  className="mt-1 w-full rounded-md border border-navy/15 bg-background p-2 text-sm text-foreground"
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

            {duplicidadesNovo.length ? (
              <div className="mt-3 rounded-lg border border-terracotta/40 bg-terracotta/5 p-3">
                <p className="text-xs font-medium text-terracotta">Possíveis duplicidades</p>
                <ul className="mt-2 space-y-1 text-xs text-navy/70">
                  {duplicidadesNovo.map((d) => (
                    <li key={d.id}>
                      <strong>{d.nome}</strong> · {d.email ?? "sem e-mail"} · {d.telefone ?? "sem telefone"}
                      {d.cpf ? ` · CPF ${d.cpf}` : ""} — {d.motivo}
                      <Link
                        to="/pessoas/$clienteId"
                        params={{ clienteId: d.id }}
                        className="ml-2 underline"
                        onClick={() => {
                          setNovo(null);
                          setDuplicidadesNovo([]);
                        }}
                      >
                        abrir ficha existente
                      </Link>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-[11px] text-navy/50">
                  Cadastrar de novo grava mesmo assim, como pessoa diferente.
                </p>
              </div>
            ) : null}

            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-md border border-navy/15 px-3 py-1.5 text-sm"
                onClick={() => {
                  setNovo(null);
                  setDuplicidadesNovo([]);
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={verificandoDuplicidade}
                className="rounded-md bg-navy px-3 py-1.5 text-sm text-cream disabled:opacity-60"
                onClick={async () => {
                  if (!novo) return;
                  const dados = {
                    ...novo,
                    status: "pre_onboarding",
                    classificacao: novo["classificacao"] ?? "pre_cliente",
                  };
                  if (!duplicidadesNovo.length) {
                    setVerificandoDuplicidade(true);
                    try {
                      const { duplicidades } = await verificarDuplicidade({
                        data: {
                          nome: novo.nome ?? "",
                          email: novo.email,
                          telefone: novo.telefone,
                          cpf: novo.cpf,
                        },
                      });
                      if (duplicidades.length) {
                        setDuplicidadesNovo(duplicidades);
                        return;
                      }
                    } finally {
                      setVerificandoDuplicidade(false);
                    }
                  }
                  void executar(() => criar({ data: { entidade: "clientes", dados } })).then(() => {
                    setNovo(null);
                    setDuplicidadesNovo([]);
                  });
                }}
              >
                {duplicidadesNovo.length ? "Cadastrar mesmo assim" : "Cadastrar"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </SaasShell>
  );
}
