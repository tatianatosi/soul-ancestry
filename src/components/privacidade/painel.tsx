import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { Campo, Gaveta, Selo, inputCls } from "@/components/comercial/base";
import { CaCard } from "@/components/ui/ca-card";
import { AcaoOperacional } from "@/components/saas/acao-operacional";
import { supabase } from "@/integrations/supabase/client";
import {
  arquivarDocumento,
  retirarDocumentoDoApp,
  baixarDocumento,
  listarClientesECasos,
  listarDocumentos,
  painelPrivacidade,
  prepararUploadDocumento,
  registrarConsentimento,
  registrarExcecaoConsentimento,
  resolverAlertaPrivacidade,
  revogarConsentimento,
  salvarDocumento,
} from "@/lib/documentos.functions";
import {
  CATEGORIAS,
  CATEGORIAS_SENSIVEIS,
  METODOS_COLETA,
  SENSIBILIDADES,
  STATUS_DOCUMENTO,
  TIPOS_CONSENTIMENTO,
  VISIBILIDADES,
} from "@/lib/documentos.server";
import { cn } from "@/lib/utils";
import { useAvisoEdicaoNaoSalva } from "@/lib/aviso-edicao-nao-salva";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Linha = Record<string, any>;

const ABAS = [
  { id: "documentos", rotulo: "Documentos" },
  { id: "consentimentos", rotulo: "Consentimentos" },
  { id: "matriz", rotulo: "Matriz de permissões" },
  { id: "eventos", rotulo: "Eventos recentes" },
] as const;

const MATRIZ: { visibilidade: string; interno: string; equipe: string; cliente: string }[] = [
  {
    visibilidade: "Interno restrito",
    interno: "Ver e baixar",
    equipe: "Ver e baixar",
    cliente: "Sem acesso",
  },
  {
    visibilidade: "Equipe do caso",
    interno: "Ver e baixar",
    equipe: "Ver e baixar",
    cliente: "Sem acesso",
  },
  {
    visibilidade: "Cliente quando liberado",
    interno: "Ver e baixar",
    equipe: "Ver e baixar",
    cliente: "Só depois do status “Liberado ao cliente”",
  },
];

function dataHora(v: unknown) {
  if (!v) return "—";
  const d = new Date(String(v));
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString("pt-BR");
}

export function PrivacidadeCaso({ casoId }: { casoId: string }) {
  const [aba, setAba] = useState<(typeof ABAS)[number]["id"]>("documentos");
  const [novoDoc, setNovoDoc] = useState(false);
  const [novoConsent, setNovoConsent] = useState(false);
  const [novaExcecao, setNovaExcecao] = useState(false);
  const [enviando, setEnviando] = useState(false);
  /*
   * F5 / sair da linha (09/10/2026) — última exceção da varredura, fechada.
   * Os três formulários desta tela são HTML não-controlado (leem por FormData
   * no submit), então não havia estado React para o guard ler. Em vez de
   * travar a saída de um painel só por estar aberto — falso bloqueio —, a
   * própria digitação marca o rascunho: `onInput` no <form>.
   */
  const [digitou, setDigitou] = useState(false);
  useAvisoEdicaoNaoSalva(digitou);
  const marcarDigitado = () => setDigitou(true);

  const qc = useQueryClient();
  const carregarPainel = useServerFn(painelPrivacidade);
  const carregarDocs = useServerFn(listarDocumentos);
  const carregarVinculos = useServerFn(listarClientesECasos);
  const preparar = useServerFn(prepararUploadDocumento);
  const salvarDoc = useServerFn(salvarDocumento);
  const baixar = useServerFn(baixarDocumento);
  const arquivar = useServerFn(arquivarDocumento);
  const retirarDoApp = useServerFn(retirarDocumentoDoApp);
  const registrar = useServerFn(registrarConsentimento);
  const revogar = useServerFn(revogarConsentimento);
  const excecao = useServerFn(registrarExcecaoConsentimento);
  const resolver = useServerFn(resolverAlertaPrivacidade);

  const painel = useQuery({ queryKey: ["privacidade", casoId], queryFn: () => carregarPainel({ data: { casoId } }) });
  const docs = useQuery({ queryKey: ["privacidade", casoId, "docs"], queryFn: () => carregarDocs({ data: { casoId } }) });
  const vinculos = useQuery({ queryKey: ["privacidade", "vinculos"], queryFn: () => carregarVinculos() });

  const atualizar = () => {
    qc.invalidateQueries({ queryKey: ["privacidade", casoId] });
    qc.invalidateQueries({ queryKey: ["privacidade", casoId, "docs"] });
  };

  const mutRevogar = useMutation({
    mutationFn: (v: { id: string; motivo: string }) => revogar({ data: v }),
    onSuccess: () => {
      toast.success("Consentimento revogado. Alerta criado para administração e operações.");
      atualizar();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const mutResolver = useMutation({
    mutationFn: (id: string) => resolver({ data: { id } }),
    onSuccess: () => {
      toast.success("Alerta tratado.");
      atualizar();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (painel.isLoading) return <p className="text-sm text-navy/60">Carregando privacidade do caso…</p>;
  if (painel.error) return <p className="text-sm text-terracotta">{(painel.error as Error).message}</p>;
  if (!painel.data)
    return (
      <p role="alert" className="flex flex-wrap items-center gap-3 rounded-lg border border-terracotta/40 bg-terracotta/10 px-3 py-2 text-sm text-terracotta">
        A consulta de privacidade do caso não retornou dado nem erro. Isto é falha de carga, não ausência de caso.
        <button
          type="button"
          onClick={() => void painel.refetch()}
          className="rounded-md border border-terracotta/50 px-2 py-1 text-xs font-medium text-terracotta hover:bg-terracotta/10"
        >
          Tentar novamente
        </button>
      </p>
    );

  const p = painel.data;
  const documentos = (docs.data ?? []) as Linha[];
  const clienteContratanteId = (p.caso["cliente_id"] as string | null) ?? undefined;
  const [categoriaForm, setCategoriaForm] = useState("interno");
  const categoriaSensivel = CATEGORIAS_SENSIVEIS.includes(categoriaForm);

  async function enviarDocumento(form: HTMLFormElement) {
    const fd = new FormData(form);
    const arquivo = fd.get("arquivo") as File | null;
    // Decisão da Proprietária (09/09/2026) — documento é individual por
    // padrão: para categoria sensível, o titular é sempre quem foi
    // escolhido no formulário, nunca o contratante do caso por padrão. O
    // banco recusa a gravação sem titular explícito nessas categorias.
    const clienteIdEscolhido = String(fd.get("clienteId") ?? "").trim() || undefined;
    setEnviando(true);
    try {
      let storagePath: string | undefined;
      if (arquivo && arquivo.size > 0) {
        if (arquivo.size > 25 * 1024 * 1024) throw new Error("Arquivo acima de 25 MB.");
        const alvo = await preparar({ data: { casoId, nomeArquivo: arquivo.name } });
        const up = await supabase.storage.from("documentos").uploadToSignedUrl(alvo.path, alvo.token, arquivo);
        if (up.error) throw new Error(up.error.message);
        storagePath = alvo.path;
      }
      await salvarDoc({
        data: {
          casoId,
          clienteId: clienteIdEscolhido,
          titulo: String(fd.get("titulo") ?? ""),
          categoria: String(fd.get("categoria") ?? "interno"),
          sensibilidade: String(fd.get("sensibilidade") ?? "normal"),
          visibilidade: String(fd.get("visibilidade") ?? "interno_restrito"),
          status: String(fd.get("status") ?? "pendente"),
          observacoes: String(fd.get("observacoes") ?? ""),
          finalidade: String(fd.get("finalidade") ?? ""),
          storagePath,
          nomeArquivo: arquivo?.name,
          mimeType: arquivo?.type,
          tamanhoBytes: arquivo?.size,
        },
      });
      toast.success("Documento registrado no acervo privado.");
      setNovoDoc(false);
      atualizar();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setEnviando(false);
      setDigitou(false);
    }
  }

  return (
    <div className="space-y-4">
      <header className="rounded-xl border border-navy/10 bg-cream/40 p-4">
        <p className="text-xs uppercase tracking-wide text-navy/50">Privacidade e acesso</p>
        <h1 className="font-serif text-2xl">
          {p.caso["codigo"]} — {p.caso["titulo"]}
        </h1>
        <div className="mt-2 flex flex-wrap gap-2">
          <Selo
            texto={p.consentimentoAtivo ? "Consentimento ativo" : "Sem consentimento ativo"}
            tom={p.consentimentoAtivo ? "ok" : "erro"}
          />
          {p.excecaoVigente && <Selo texto="Exceção formal vigente" tom="alerta" />}
          <Selo texto={`Documentos visíveis: ${documentos.length}`} />
          <Selo texto={`Seu papel: ${p.papel}`} />
        </div>
        {!p.consentimentoAtivo && !p.excecaoVigente && (
          <p className="mt-2 text-xs text-terracotta">
            Sem consentimento ativo o caso não pode ser ativado nem receber documentos de categorias sensíveis.
          </p>
        )}
      </header>

      {p.alertas.length > 0 && (
        <div className="rounded-xl border border-terracotta/40 bg-terracotta/5 p-4">
          <h2 className="font-serif text-lg">Alertas de privacidade</h2>
          <ul className="mt-2 space-y-2">
            {p.alertas.map((a: Linha) => (
              <li key={a["id"]} className="flex flex-wrap items-center gap-2 text-sm">
                <span>{a["mensagem"]}</span>
                <button
                  onClick={() => mutResolver.mutate(a["id"])}
                  className="rounded-lg border border-navy/20 px-2 py-1 text-[11px]"
                >
                  Marcar como tratado
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <nav className="flex flex-wrap gap-2">
        {ABAS.map((a) => (
          <button
            key={a.id}
            onClick={() => setAba(a.id)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs",
              aba === a.id ? "border-navy bg-navy text-cream" : "border-navy/15 text-navy/70 hover:bg-navy/5",
            )}
          >
            {a.rotulo}
          </button>
        ))}
      </nav>

      {aba === "documentos" && (
        <CaCard variante="compacto" titulo="Documentos do caso">
          <div className="mb-3 flex flex-wrap gap-2">
            <button onClick={() => setNovoDoc(true)} className="rounded-lg bg-navy px-3 py-1.5 text-xs text-cream">
              Enviar documento
            </button>
            <span className="text-xs text-navy/50">
              Arquivos ficam em acervo privado; o acesso é sempre por link temporário e auditado.
            </span>
          </div>
          <div className="space-y-2">
            {docs.isError ? (
              <p role="alert" className="flex flex-wrap items-center gap-3 rounded-lg border border-terracotta/40 bg-terracotta/10 px-3 py-2 text-sm text-terracotta">
                Não foi possível carregar os documentos. Isto é falha de leitura, não ausência de documento.
                <button
                  type="button"
                  onClick={() => void docs.refetch()}
                  className="rounded-md border border-terracotta/50 px-2 py-1 text-xs font-medium text-terracotta hover:bg-terracotta/10"
                >
                  Tentar novamente
                </button>
              </p>
            ) : null}
            {!docs.isError && documentos.length === 0 && <p className="text-sm text-navy/60">Nenhum documento visível para o seu papel.</p>}
            {documentos.map((d) => (
              <div
                key={d["id"]}
                className={cn(
                  "rounded-xl border p-3",
                  d["visibilidade"] === "interno_restrito" && "border-navy/40 bg-navy/5",
                  d["visibilidade"] === "equipe_do_caso" && "border-navy/15 bg-cream/40",
                  d["visibilidade"] === "cliente_quando_liberado" && "border-gold bg-gold/10",
                )}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <strong className="text-sm">{d["titulo"]}</strong>
                  <Selo texto={CATEGORIAS[d["categoria"]] ?? d["categoria"]} />
                  <Selo texto={SENSIBILIDADES[d["sensibilidade"]] ?? d["sensibilidade"]} tom={d["sensibilidade"] === "normal" ? "neutro" : "alerta"} />
                  <Selo texto={VISIBILIDADES[d["visibilidade"]] ?? d["visibilidade"]} />
                  <Selo
                    texto={STATUS_DOCUMENTO[d["status"]] ?? d["status"]}
                    tom={d["status"] === "liberado" ? "ok" : "neutro"}
                  />
                  <Selo texto={`v${d["versao"] ?? 1}`} />
                </div>
                <p className="mt-1 text-xs text-navy/50">
                  Carregado em {dataHora(d["carregado_em"] ?? d["created_at"])}
                  {d["nome_arquivo"] ? ` · ${d["nome_arquivo"]}` : " · sem arquivo anexado"}
                </p>
                {d["observacoes"] && <p className="mt-1 text-xs text-navy/60">{d["observacoes"]}</p>}
                <div className="mt-2 flex flex-wrap gap-2">
                  {d["storage_path"] && d["pode_baixar"] && (
                    <button
                      onClick={async () => {
                        try {
                          const r = await baixar({ data: { documentoId: d["id"] } });
                          window.open(r.url, "_blank", "noreferrer");
                        } catch (e) {
                          toast.error((e as Error).message);
                        }
                      }}
                      className="rounded-lg border border-navy/20 px-2 py-1 text-[11px]"
                    >
                      Baixar (registra auditoria)
                    </button>
                  )}
                  {d["liberado_cliente"] === true && (
                    <AcaoOperacional
                      rotulo="Retirar do App"
                      className="rounded-lg border border-navy/30 px-2 py-1 text-[11px] text-navy"
                      acaoExterna="retirar_documento_do_app"
                      efeito="O documento deixa de aparecer no App Cliente e volta a pendente de revisão. Nada é apagado; pode ser liberado de novo depois."
                      onConfirmar={async (motivo) => {
                        try {
                          await retirarDoApp({ data: { id: d["id"], motivo } });
                          toast.success("Documento retirado do App; segue guardado e pendente de revisão.");
                          atualizar();
                        } catch (e) {
                          toast.error((e as Error).message);
                        }
                      }}
                    />
                  )}
                  <AcaoOperacional
                    rotulo="Arquivar"
                    className="rounded-lg border border-terracotta/40 px-2 py-1 text-[11px] text-terracotta"
                    acaoExterna="arquivar_documento"
                    efeito="Arquiva o documento com motivo — não há exclusão física, o histórico é preservado."
                    onConfirmar={async (motivo) => {
                      try {
                        await arquivar({ data: { id: d["id"], motivo } });
                        toast.success("Documento arquivado; histórico preservado.");
                        atualizar();
                      } catch (e) {
                        toast.error((e as Error).message);
                      }
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CaCard>
      )}

      {aba === "consentimentos" && (
        <div className="space-y-4">
          <CaCard variante="compacto" titulo="Consentimentos registrados">
            <div className="mb-3 flex flex-wrap gap-2">
              <button onClick={() => setNovoConsent(true)} className="rounded-lg bg-navy px-3 py-1.5 text-xs text-cream">
                Registrar consentimento
              </button>
              <button
                onClick={() => setNovaExcecao(true)}
                className="rounded-lg border border-navy/20 px-3 py-1.5 text-xs"
              >
                Registrar exceção formal (admin)
              </button>
            </div>
            <div className="space-y-2">
              {p.consentimentos.length === 0 && <p className="text-sm text-navy/60">Nenhum consentimento registrado.</p>}
              {p.consentimentos.map((c: Linha) => (
                <div
                  key={c["id"]}
                  className={cn(
                    "rounded-xl border p-3",
                    c["status"] === "revogado" ? "border-terracotta/40 bg-terracotta/5" : "border-gold bg-gold/10",
                  )}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <strong className="text-sm">{TIPOS_CONSENTIMENTO[c["tipo_consentimento"]] ?? c["tipo_consentimento"]}</strong>
                    <Selo texto={c["status"]} tom={c["status"] === "revogado" ? "erro" : "ok"} />
                    <Selo texto={`Texto ${c["versao_texto"]}`} />
                  </div>
                  <p className="mt-1 text-xs text-navy/60">
                    Coletado em {dataHora(c["coletado_em"])} · método:{" "}
                    {METODOS_COLETA[c["metodo_coleta"]] ?? c["metodo_coleta"] ?? "não informado"} · evidência:{" "}
                    {c["evidencia_consentimento"] ?? "—"}
                  </p>
                  {c["escopo_compartilhamento"] && (
                    <p className="text-xs text-navy/60">Compartilhamento: {c["escopo_compartilhamento"]}</p>
                  )}
                  {c["status"] === "revogado" ? (
                    <p className="mt-1 text-xs text-terracotta">
                      Revogado em {dataHora(c["revogado_em"])} · motivo: {c["revogacao_motivo"] ?? "—"}
                    </p>
                  ) : (
                    <AcaoOperacional
                      rotulo="Revogar consentimento"
                      className="mt-2 rounded-lg border border-terracotta/40 px-2 py-1 text-[11px] text-terracotta"
                      acaoExterna="revogar_consentimento"
                      efeito="Revoga o consentimento com motivo registrado."
                      onConfirmar={(motivo) => mutRevogar.mutate({ id: c["id"], motivo })}
                    />
                  )}
                </div>
              ))}
            </div>
          </CaCard>

          <CaCard variante="compacto" titulo="Exceções formais">
            {p.excecoes.length === 0 && <p className="text-sm text-navy/60">Nenhuma exceção registrada.</p>}
            <ul className="space-y-2">
              {p.excecoes.map((e: Linha) => (
                <li key={e["id"]} className="rounded-xl border border-navy/15 bg-cream/40 p-3 text-sm">
                  {e["motivo"]}
                  <span className="block text-xs text-navy/50">
                    Aprovada em {dataHora(e["aprovado_em"])} · válida até {e["valido_ate"] ?? "sem prazo"}
                  </span>
                </li>
              ))}
            </ul>
          </CaCard>
        </div>
      )}

      {aba === "matriz" && (
        <CaCard variante="compacto" titulo="Matriz de permissões deste caso">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-navy/50">
                  <th className="py-2">Visibilidade</th>
                  <th>Admin / Operações</th>
                  <th>Equipe do caso</th>
                  <th>Cliente no portal</th>
                </tr>
              </thead>
              <tbody>
                {MATRIZ.map((l) => (
                  <tr key={l.visibilidade} className="border-t border-navy/10">
                    <td className="py-2 font-medium">{l.visibilidade}</td>
                    <td>{l.interno}</td>
                    <td>{l.equipe}</td>
                    <td>{l.cliente}</td>
                  </tr>
                ))}
                <tr className="border-t border-navy/10">
                  <td className="py-2 font-medium">Papel leitura</td>
                  <td colSpan={3}>Não vê nem baixa documentos internos restritos.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-navy/60">
            Categorias sensíveis ({CATEGORIAS_SENSIVEIS.map((c) => CATEGORIAS[c]).join(", ")}) só podem ser enviadas com
            consentimento ativo ou exceção formal aprovada pela administração.
          </p>
          <p className="mt-2 text-xs text-navy/60">
            Acessos do cliente ao caso pelo portal: {p.acessosCliente.length} registro(s).
          </p>
        </CaCard>
      )}

      {aba === "eventos" && (
        <CaCard variante="compacto" titulo="Eventos recentes de documentos e consentimentos">
          <ol className="space-y-2 border-l border-navy/15 pl-4">
            {p.eventos.length === 0 && <p className="text-sm text-navy/60">Sem eventos registrados.</p>}
            {p.eventos.map((ev: Linha) => (
              <li key={ev["id"]} className="text-sm">
                <span className="text-navy/50">{dataHora(ev["created_at"])}</span> — {ev["acao"]} em {ev["entidade"]}
              </li>
            ))}
          </ol>
        </CaCard>
      )}

      {novoDoc && (
        <Gaveta titulo="Enviar documento" aoFechar={() => setNovoDoc(false)}>
          <form
            onInput={marcarDigitado}
            onSubmit={(ev) => {
              ev.preventDefault();
              void enviarDocumento(ev.currentTarget);
            }}
            className="space-y-3"
          >
            <Campo rotulo="Título">
              <input name="titulo" required maxLength={200} className={inputCls} />
            </Campo>
            <Campo rotulo="Categoria">
              <select
                name="categoria"
                className={inputCls}
                defaultValue="interno"
                onChange={(e) => setCategoriaForm(e.target.value)}
              >
                {Object.entries(CATEGORIAS).map(([v, r]) => (
                  <option key={v} value={v}>
                    {r}
                  </option>
                ))}
              </select>
            </Campo>
            <Campo rotulo="Titular (pessoa a quem o documento pertence)">
              <select name="clienteId" required={categoriaSensivel} defaultValue="" className={inputCls}>
                <option value="">{categoriaSensivel ? "Selecione a pessoa…" : "Contratante do caso (padrão)"}</option>
                {(vinculos.data?.clientes ?? []).map((c: Linha) => (
                  <option key={c["id"]} value={c["id"]}>
                    {c["nome"]}
                  </option>
                ))}
              </select>
              <span className="mt-1 block text-xs text-navy/50">
                {categoriaSensivel
                  ? "Documento é individual por padrão: sem titular, o banco recusa a gravação."
                  : "Opcional para esta categoria — sem escolha, fica associado ao contratante do caso."}
              </span>
            </Campo>
            <Campo rotulo="Classificação de sensibilidade">
              <select name="sensibilidade" className={inputCls} defaultValue="normal">
                {Object.entries(SENSIBILIDADES).map(([v, r]) => (
                  <option key={v} value={v}>
                    {r}
                  </option>
                ))}
              </select>
            </Campo>
            <Campo rotulo="Visibilidade">
              <select name="visibilidade" className={inputCls} defaultValue="interno_restrito">
                {Object.entries(VISIBILIDADES).map(([v, r]) => (
                  <option key={v} value={v}>
                    {r}
                  </option>
                ))}
              </select>
            </Campo>
            <Campo rotulo="Status">
              <select name="status" className={inputCls} defaultValue="pendente">
                {Object.entries(STATUS_DOCUMENTO)
                  .filter(([v]) => v !== "arquivado")
                  .map(([v, r]) => (
                    <option key={v} value={v}>
                      {r}
                    </option>
                  ))}
              </select>
            </Campo>
            <Campo rotulo="Arquivo (acervo privado, até 25 MB)">
              <input type="file" name="arquivo" className={inputCls} />
            </Campo>
            <Campo rotulo="Finalidade (para que este documento foi recebido)">
              <input
                name="finalidade"
                required={categoriaSensivel}
                maxLength={500}
                placeholder="Ex.: instrução do processo de cidadania"
                className={inputCls}
              />
            </Campo>
            <Campo rotulo="Observações">
              <textarea name="observacoes" maxLength={2000} className={cn(inputCls, "h-24")} />
            </Campo>
            <button
              type="submit"
              disabled={enviando}
              className="rounded-lg bg-navy px-4 py-2 text-sm text-cream disabled:opacity-60"
            >
              {enviando ? "Enviando…" : "Salvar documento"}
            </button>
          </form>
        </Gaveta>
      )}

      {novoConsent && (
        <Gaveta titulo="Registrar consentimento" aoFechar={() => setNovoConsent(false)}>
          <form
            onInput={marcarDigitado}
            onSubmit={async (ev) => {
              ev.preventDefault();
              const fd = new FormData(ev.currentTarget);
              try {
                await registrar({
                  data: {
                    clienteId: String(fd.get("clienteId") ?? ""),
                    casoId,
                    tipo: String(fd.get("tipo") ?? "tratamento_dados"),
                    versaoTexto: String(fd.get("versaoTexto") ?? ""),
                    textoAceito: String(fd.get("textoAceito") ?? ""),
                    metodoColeta: String(fd.get("metodoColeta") ?? ""),
                    escopoCompartilhamento: String(fd.get("escopo") ?? ""),
                    evidenciaConsentimento: String(fd.get("evidencia") ?? ""),
                    coletadoEm: String(fd.get("coletadoEm") ?? ""),
                  },
                });
                toast.success("Consentimento registrado.");
                setNovoConsent(false);
                setDigitou(false);
                atualizar();
              } catch (e) {
                toast.error((e as Error).message);
              }
            }}
            className="space-y-3"
          >
            <Campo rotulo="Cliente">
              <select name="clienteId" required defaultValue={clienteContratanteId ?? ""} className={inputCls}>
                <option value="">Selecione…</option>
                {(vinculos.data?.clientes ?? []).map((c: Linha) => (
                  <option key={c["id"]} value={c["id"]}>
                    {c["nome"]}
                  </option>
                ))}
              </select>
            </Campo>
            <Campo rotulo="Tipo">
              <select name="tipo" className={inputCls} defaultValue="tratamento_dados">
                {Object.entries(TIPOS_CONSENTIMENTO).map(([v, r]) => (
                  <option key={v} value={v}>
                    {r}
                  </option>
                ))}
              </select>
            </Campo>
            <Campo rotulo="Versão do texto aceito">
              <input name="versaoTexto" required maxLength={120} placeholder="v1.0 — 2026-08" className={inputCls} />
            </Campo>
            <Campo rotulo="Método de coleta">
              <select name="metodoColeta" required className={inputCls} defaultValue="portal">
                {Object.entries(METODOS_COLETA).map(([v, r]) => (
                  <option key={v} value={v}>
                    {r}
                  </option>
                ))}
              </select>
            </Campo>
            <Campo rotulo="Data e hora da coleta">
              <input type="datetime-local" name="coletadoEm" className={inputCls} />
            </Campo>
            <Campo rotulo="Escopo de compartilhamento (quando aplicável)">
              <textarea name="escopo" maxLength={2000} className={cn(inputCls, "h-20")} />
            </Campo>
            <Campo rotulo="Evidência associada (referência do registro)">
              <input name="evidencia" maxLength={500} className={inputCls} />
            </Campo>
            <Campo rotulo="Texto aceito">
              <textarea name="textoAceito" maxLength={8000} className={cn(inputCls, "h-32")} />
            </Campo>
            <button type="submit" className="rounded-lg bg-navy px-4 py-2 text-sm text-cream">
              Registrar
            </button>
          </form>
        </Gaveta>
      )}

      {novaExcecao && (
        <Gaveta titulo="Exceção formal de consentimento" aoFechar={() => setNovaExcecao(false)}>
          <form
            onInput={marcarDigitado}
            onSubmit={async (ev) => {
              ev.preventDefault();
              const fd = new FormData(ev.currentTarget);
              try {
                await excecao({
                  data: {
                    casoId,
                    clienteId: clienteContratanteId,
                    motivo: String(fd.get("motivo") ?? ""),
                    validoAte: String(fd.get("validoAte") ?? ""),
                  },
                });
                toast.success("Exceção formal registrada e auditada.");
                setNovaExcecao(false);
                setDigitou(false);
                atualizar();
              } catch (e) {
                toast.error((e as Error).message);
              }
            }}
            className="space-y-3"
          >
            <p className="text-xs text-navy/60">
              Apenas administração pode registrar exceções. O registro fica auditado e não substitui o consentimento.
            </p>
            <Campo rotulo="Motivo formal">
              <textarea name="motivo" required minLength={10} maxLength={1000} className={cn(inputCls, "h-28")} />
            </Campo>
            <Campo rotulo="Válida até">
              <input type="date" name="validoAte" className={inputCls} />
            </Campo>
            <button type="submit" className="rounded-lg bg-navy px-4 py-2 text-sm text-cream">
              Registrar exceção
            </button>
          </form>
        </Gaveta>
      )}
    </div>
  );
}
