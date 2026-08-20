import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import {
  CONFIDENCIALIDADE,
  EXTENSOES_ACEITAS,
  ORIGENS_DOCUMENTO,
  QUALIDADE_ORIGEM,
  STATUS_FONTE,
  TIPOS_DOCUMENTO,
  extensaoDe,
  filtrarLista,
  linhaDaLista,
  MIMES_ACEITOS,
  rotulo,
  validarFormularioFonte,
} from "@/lib/fontes-documentos";
import {
  arquivarFonteDocumento,
  criarUploadFonte,
  editarMetadadosFonte,
  listarFontesDocumentos,
  registrarFonteDocumento,
  verFonteDocumento,
} from "@/lib/fontes-documentos.functions";

/* eslint-disable @typescript-eslint/no-explicit-any */

const inputCls =
  "w-full rounded-lg border border-navy/15 bg-white px-3 py-2 text-sm text-navy outline-none focus:border-gold";

const VAZIO: Record<string, unknown> = {
  tipo_documento: "",
  origem_documento: "",
  pessoa_ref_id: "",
  pessoa_nao_identificada: false,
  qualidade_origem: "origem_a_confirmar",
  confidencialidade: "equipe_do_caso",
};

export function SecaoFontesDocumentos({ caseId }: { caseId: string }) {
  const qc = useQueryClient();
  const [form, setForm] = useState<Record<string, unknown>>({ ...VAZIO });
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [abrirForm, setAbrirForm] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [detalheId, setDetalheId] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [filtros, setFiltros] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);

  const painel = useQuery({
    queryKey: ["g08-fontes", caseId],
    queryFn: () => listarFontesDocumentos({ data: { caseId } }),
  });

  const d = painel.data as any;
  const pessoas: { id: string; nome: string }[] = d?.pessoas ?? [];
  const equipe: { id: string; nome: string }[] = d?.equipe ?? [];
  const documentos: Record<string, any>[] = d?.documentos ?? [];

  const linhas = useMemo(
    () => documentos.map((doc) => linhaDaLista(doc, pessoas, equipe)),
    [documentos, pessoas, equipe],
  );
  const visiveis = useMemo(
    () =>
      filtrarLista(linhas, {
        busca,
        status: filtros["status"] ?? "",
        tipo: filtros["tipo"] ?? "",
        pessoa: filtros["pessoa"] ?? "",
        origem: filtros["origem"] ?? "",
        local: filtros["local"] ?? "",
      }),
    [linhas, busca, filtros],
  );

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const recarregar = () => void qc.invalidateQueries({ queryKey: ["g08-fontes", caseId] });

  function limpar() {
    setForm({ ...VAZIO });
    setArquivo(null);
    setEditandoId(null);
    setAbrirForm(false);
  }

  const salvarMetadados = useMutation({
    mutationFn: (v: { id: string; valores: Record<string, unknown> }) =>
      editarMetadadosFonte({ data: { id: v.id, caseId, valores: v.valores } }),
    onSuccess: () => {
      toast.success("Metadados atualizados e auditados.");
      limpar();
      recarregar();
    },
    onError: (e: any) => toast.error(String(e?.message ?? e)),
  });

  const arquivar = useMutation({
    mutationFn: (v: { id: string; motivo: string }) =>
      arquivarFonteDocumento({ data: { id: v.id, caseId, motivo: v.motivo } }),
    onSuccess: () => {
      toast.success("Documento arquivado (sem exclusão física).");
      recarregar();
    },
    onError: (e: any) => toast.error(String(e?.message ?? e)),
  });

  function valoresDoForm() {
    return {
      tipo_documento: form["tipo_documento"],
      origem_documento: form["origem_documento"],
      pessoa_ref_id: form["pessoa_nao_identificada"] ? null : form["pessoa_ref_id"] || null,
      pessoa_nao_identificada: Boolean(form["pessoa_nao_identificada"]),
      qualidade_origem: form["qualidade_origem"],
      confidencialidade: form["confidencialidade"],
      titulo_interno: form["titulo_interno"] ?? null,
      data_documento: form["data_documento"] ?? null,
      pais: form["pais"] ?? null,
      estado_provincia: form["estado_provincia"] ?? null,
      cidade: form["cidade"] ?? null,
      instituicao_emissora: form["instituicao_emissora"] ?? null,
      referencia_origem: form["referencia_origem"] ?? null,
      idioma: form["idioma"] ?? null,
      observacoes: form["observacoes"] ?? null,
    } as Record<string, unknown>;
  }

  async function enviar() {
    const check = validarFormularioFonte({ ...(form as any), arquivo }, editandoId === null);
    if (!check.ok) {
      toast.error(`Verifique o formulário: ${check.erros.join(", ")}`);
      return;
    }
    if (editandoId) {
      salvarMetadados.mutate({ id: editandoId, valores: valoresDoForm() });
      return;
    }
    if (!arquivo) return;
    setEnviando(true);
    try {
      const upload = await criarUploadFonte({
        data: { caseId, nomeArquivo: arquivo.name, tamanhoBytes: arquivo.size },
      });
      const envio = await supabase.storage.from("documentos").uploadToSignedUrl(upload.path, upload.token, arquivo);
      if (envio.error) throw new Error(`FALHA_NO_UPLOAD: ${envio.error.message}`);
      await registrarFonteDocumento({
        data: {
          caseId,
          storagePath: upload.path,
          nomeArquivo: arquivo.name,
          mimeType: arquivo.type || MIMES_ACEITOS[extensaoDe(arquivo.name)] || undefined,
          tamanhoBytes: arquivo.size,
          valores: valoresDoForm(),
        },
      });
      toast.success("Documento registrado como fonte, em pendente de revisão.");
      limpar();
      recarregar();
    } catch (e: any) {
      toast.error(String(e?.message ?? e));
    } finally {
      setEnviando(false);
    }
  }

  async function abrirArquivo(id: string) {
    try {
      const r = await verFonteDocumento({ data: { id, caseId } });
      window.open(r.url, "_blank", "noopener,noreferrer");
    } catch (e: any) {
      toast.error(String(e?.message ?? e));
    }
  }

  function editar(doc: Record<string, any>) {
    setEditandoId(String(doc["id"]));
    setAbrirForm(true);
    setArquivo(null);
    setForm({
      tipo_documento: doc["tipo_documento"] ?? "",
      origem_documento: doc["origem_documento"] ?? "",
      pessoa_ref_id: doc["pessoa_ref_id"] ?? "",
      pessoa_nao_identificada: Boolean(doc["pessoa_nao_identificada"]),
      qualidade_origem: doc["qualidade_origem"] ?? "origem_a_confirmar",
      confidencialidade: doc["confidencialidade"] ?? "equipe_do_caso",
      titulo_interno: doc["titulo_interno"] ?? "",
      data_documento: doc["data_documento"] ?? "",
      pais: doc["pais"] ?? "",
      estado_provincia: doc["estado_provincia"] ?? "",
      cidade: doc["cidade"] ?? "",
      instituicao_emissora: doc["instituicao_emissora"] ?? "",
      referencia_origem: doc["referencia_origem"] ?? "",
      idioma: doc["idioma"] ?? "",
      observacoes: doc["observacoes"] ?? "",
    });
  }

  const detalhe = documentos.find((doc) => String(doc["id"]) === detalheId) ?? null;
  const ativos = documentos.filter((doc) => !doc["archived_at"]).length;

  return (
    <section className="space-y-4 rounded-xl border border-navy/10 bg-white p-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-serif text-lg text-navy">Fontes e documentos</h2>
          <p className="text-xs text-navy/60">
            Material bruto do caso. Documento/Fonte não é evidência, achado, pessoa, relação, evento ou linhagem, e
            nunca é publicado no App Cliente.
          </p>
          <p className="mt-1 text-xs text-navy/70">{ativos} documento(s) ativo(s) neste caso.</p>
        </div>
        {d?.podeEditar && (
          <button
            type="button"
            onClick={() => (abrirForm && !editandoId ? limpar() : (setEditandoId(null), setForm({ ...VAZIO }), setArquivo(null), setAbrirForm(true)))}
            className="rounded-full border border-gold bg-navy px-4 py-2 text-xs text-cream"
          >
            {abrirForm && !editandoId ? "Fechar" : "Adicionar documento"}
          </button>
        )}
      </header>

      {painel.isLoading && <p className="text-sm text-navy/60">Carregando fontes e documentos…</p>}
      {painel.error && <p className="text-sm text-terracotta">{String((painel.error as any).message)}</p>}

      {abrirForm && (
        <div className="space-y-3 rounded-lg border border-navy/10 bg-cream/40 p-4">
          <p className="text-xs uppercase tracking-wide text-navy/60">
            {editandoId ? "Editar metadados" : "Adicionar documento"}
          </p>

          {!editandoId && (
            <label className="block">
              <span className="mb-1 block text-[11px] uppercase tracking-wide text-navy/50">Arquivo (obrigatório)</span>
              <input
                type="file"
                className={inputCls}
                accept={EXTENSOES_ACEITAS.map((e) => `.${e}`).join(",")}
                onChange={(e) => setArquivo(e.target.files?.[0] ?? null)}
              />
              <span className="mt-1 block text-[11px] text-navy/45">
                PDF, JPG, JPEG, PNG ou TIFF. Acervo privado, sem endereço público.
              </span>
            </label>
          )}

          <div className="grid gap-3 md:grid-cols-2">
            <Selecao label="Tipo de documento" valor={form["tipo_documento"]} opcoes={TIPOS_DOCUMENTO} onChange={(v) => set("tipo_documento", v)} />
            <Selecao label="Origem do documento" valor={form["origem_documento"]} opcoes={ORIGENS_DOCUMENTO} onChange={(v) => set("origem_documento", v)} />
            <label className="block">
              <span className="mb-1 block text-[11px] uppercase tracking-wide text-navy/50">Pessoa relacionada</span>
              <select
                className={inputCls}
                value={form["pessoa_nao_identificada"] ? "__nao_identificada" : String(form["pessoa_ref_id"] ?? "")}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "__nao_identificada") {
                    set("pessoa_nao_identificada", true);
                    set("pessoa_ref_id", "");
                  } else {
                    set("pessoa_nao_identificada", false);
                    set("pessoa_ref_id", v);
                  }
                }}
              >
                <option value="">— selecionar —</option>
                {pessoas.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
                <option value="__nao_identificada">Pessoa ainda não identificada</option>
              </select>
              <span className="mt-1 block text-[11px] text-navy/45">
                Não é possível criar pessoa nova a partir deste formulário.
              </span>
            </label>
            <Selecao label="Qualidade/origem" valor={form["qualidade_origem"]} opcoes={QUALIDADE_ORIGEM} onChange={(v) => set("qualidade_origem", v)} />
            <Selecao label="Confidencialidade" valor={form["confidencialidade"]} opcoes={CONFIDENCIALIDADE} onChange={(v) => set("confidencialidade", v)} />
            <Texto label="Título interno" valor={form["titulo_interno"]} onChange={(v) => set("titulo_interno", v)} />
            <Texto label="Data do documento" tipo="date" valor={form["data_documento"]} onChange={(v) => set("data_documento", v)} />
            <Texto label="País" valor={form["pais"]} onChange={(v) => set("pais", v)} />
            <Texto label="Estado/província" valor={form["estado_provincia"]} onChange={(v) => set("estado_provincia", v)} />
            <Texto label="Cidade/localidade" valor={form["cidade"]} onChange={(v) => set("cidade", v)} />
            <Texto label="Instituição emissora" valor={form["instituicao_emissora"]} onChange={(v) => set("instituicao_emissora", v)} />
            <Texto label="Livro/folha/termo/matrícula ou URL de origem" valor={form["referencia_origem"]} onChange={(v) => set("referencia_origem", v)} />
            <Texto label="Idioma" valor={form["idioma"]} onChange={(v) => set("idioma", v)} />
          </div>

          <label className="block">
            <span className="mb-1 block text-[11px] uppercase tracking-wide text-navy/50">Observações descritivas</span>
            <textarea className={inputCls} rows={3} value={String(form["observacoes"] ?? "")} onChange={(e) => set("observacoes", e.target.value)} />
          </label>

          <p className="text-[11px] text-navy/55">
            O registro nasce em <strong>pendente de revisão</strong>. Nenhuma leitura automática, extração, evidência,
            pessoa, relação, achado, relatório ou publicação é criada.
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={enviando || salvarMetadados.isPending}
              onClick={() => void enviar()}
              className="rounded-full border border-gold bg-navy px-4 py-2 text-xs text-cream disabled:opacity-50"
            >
              {enviando ? "Enviando…" : editandoId ? "Salvar metadados" : "Registrar documento"}
            </button>
            <button type="button" onClick={limpar} className="rounded-full border border-navy/20 px-4 py-2 text-xs text-navy/70">
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-2 md:grid-cols-4">
        <input className={inputCls} placeholder="Buscar por título, pessoa, tipo ou origem" value={busca} onChange={(e) => setBusca(e.target.value)} />
        <FiltroSimples rotuloCampo="Status" opcoes={STATUS_FONTE.map((s) => s.rotulo)} valor={filtros["status"] ?? ""} onChange={(v) => setFiltros((f) => ({ ...f, status: v }))} />
        <FiltroSimples rotuloCampo="Tipo" opcoes={TIPOS_DOCUMENTO.map((t) => t.rotulo)} valor={filtros["tipo"] ?? ""} onChange={(v) => setFiltros((f) => ({ ...f, tipo: v }))} />
        <FiltroSimples rotuloCampo="Pessoa" opcoes={[...pessoas.map((p) => p.nome), "Pessoa ainda não identificada"]} valor={filtros["pessoa"] ?? ""} onChange={(v) => setFiltros((f) => ({ ...f, pessoa: v }))} />
        <FiltroSimples rotuloCampo="Origem" opcoes={ORIGENS_DOCUMENTO.map((o) => o.rotulo)} valor={filtros["origem"] ?? ""} onChange={(v) => setFiltros((f) => ({ ...f, origem: v }))} />
        <input className={inputCls} placeholder="Filtrar por local" value={filtros["local"] ?? ""} onChange={(e) => setFiltros((f) => ({ ...f, local: e.target.value }))} />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-xs">
          <thead className="text-navy/50">
            <tr>
              {["Título", "Tipo", "Pessoa", "Origem/emissor", "Data", "Local", "Status", "Qualidade", "Inclusão", "Autor", "Ações"].map((h) => (
                <th key={h} className="py-2 pr-3 font-medium uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visiveis.length === 0 && (
              <tr>
                <td colSpan={11} className="py-3 text-sm text-navy/60">
                  Nenhum documento catalogado neste caso.
                </td>
              </tr>
            )}
            {visiveis.map((l) => (
              <tr key={l.id} className="border-t border-navy/10 text-navy">
                <td className="py-2 pr-3">{l.titulo}</td>
                <td className="py-2 pr-3">{l.tipo}</td>
                <td className="py-2 pr-3">{l.pessoa}</td>
                <td className="py-2 pr-3">{l.origem}</td>
                <td className="py-2 pr-3">{l.data_documento}</td>
                <td className="py-2 pr-3">{l.local}</td>
                <td className="py-2 pr-3">{l.status}</td>
                <td className="py-2 pr-3">{l.qualidade}</td>
                <td className="py-2 pr-3">{l.incluido_em}</td>
                <td className="py-2 pr-3">{l.autor}</td>
                <td className="py-2 pr-3">
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className="text-navy underline" onClick={() => setDetalheId(l.id)}>
                      Ver detalhes
                    </button>
                    {d?.podeEditar && !l.arquivado && (
                      <>
                        <button
                          type="button"
                          className="text-navy underline"
                          onClick={() => editar(documentos.find((doc) => String(doc["id"]) === l.id) as any)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="text-terracotta underline"
                          onClick={() => {
                            const motivo = window.prompt("Motivo do arquivamento (obrigatório):") ?? "";
                            if (motivo.trim().length < 5) {
                              toast.error("Informe um motivo com pelo menos 5 caracteres.");
                              return;
                            }
                            arquivar.mutate({ id: l.id, motivo });
                          }}
                        >
                          Arquivar
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {detalhe && (
        <div className="space-y-2 rounded-lg border border-navy/10 bg-cream/30 p-4 text-sm text-navy">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-base">{String(detalhe["titulo_interno"] || detalhe["nome_arquivo"])}</h3>
            <button type="button" className="text-xs text-navy/60 underline" onClick={() => setDetalheId(null)}>
              Fechar
            </button>
          </div>
          <p className="text-xs text-navy/70">
            {rotulo(TIPOS_DOCUMENTO, detalhe["tipo_documento"])} · {rotulo(ORIGENS_DOCUMENTO, detalhe["origem_documento"])} ·{" "}
            {rotulo(STATUS_FONTE, detalhe["status"])} · {rotulo(QUALIDADE_ORIGEM, detalhe["qualidade_origem"])} ·{" "}
            {rotulo(CONFIDENCIALIDADE, detalhe["confidencialidade"])}
          </p>
          {detalhe["referencia_origem"] ? (
            <p className="text-xs text-navy/70">Referência: {String(detalhe["referencia_origem"])}</p>
          ) : null}
          {detalhe["observacoes"] ? <p className="text-xs text-navy/70">{String(detalhe["observacoes"])}</p> : null}
          {detalhe["archive_motivo"] ? (
            <p className="text-xs text-terracotta">Arquivado — motivo: {String(detalhe["archive_motivo"])}</p>
          ) : null}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="rounded-full border border-navy/20 px-3 py-1 text-xs text-navy"
              onClick={() => void abrirArquivo(String(detalhe["id"]))}
            >
              Abrir arquivo (link temporário)
            </button>
            <span className="rounded-full border border-navy/10 px-3 py-1 text-[11px] text-navy/40" aria-disabled="true">
              Preparar para extração assistida — em breve
            </span>
          </div>
        </div>
      )}
    </section>
  );
}

function Selecao({
  label,
  valor,
  opcoes,
  onChange,
}: {
  label: string;
  valor: unknown;
  opcoes: { id: string; rotulo: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] uppercase tracking-wide text-navy/50">{label}</span>
      <select className={inputCls} value={String(valor ?? "")} onChange={(e) => onChange(e.target.value)}>
        <option value="">— selecionar —</option>
        {opcoes.map((o) => (
          <option key={o.id} value={o.id}>
            {o.rotulo}
          </option>
        ))}
      </select>
    </label>
  );
}

function Texto({
  label,
  valor,
  onChange,
  tipo = "text",
}: {
  label: string;
  valor: unknown;
  onChange: (v: string) => void;
  tipo?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] uppercase tracking-wide text-navy/50">{label}</span>
      <input className={inputCls} type={tipo} value={String(valor ?? "")} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function FiltroSimples({
  rotuloCampo,
  opcoes,
  valor,
  onChange,
}: {
  rotuloCampo: string;
  opcoes: string[];
  valor: string;
  onChange: (v: string) => void;
}) {
  return (
    <select className={inputCls} value={valor} onChange={(e) => onChange(e.target.value)}>
      <option value="">{rotuloCampo}: todos</option>
      {opcoes.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}
