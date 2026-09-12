import { PainelCatalogo } from "@/components/painel/painel-catalogo";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { SaasShell, useSaas } from "@/components/saas/shell";
import { useAutoridade } from "@/components/saas/autoridade";
import { EstadoDados } from "@/components/saas/estado-dados";
import { FilaRevisaoJuridica } from "@/components/contratos/fila-revisao-juridica";
import { criarInstrumento, listarContratos, painelContratual } from "@/lib/contratos.functions";
import { listarCasosFicha } from "@/lib/caso-ficha.functions";
import {
  ROTULO_GATE_FINANCEIRO,
  ROTULO_GATE_PESQUISA,
  ROTULO_STATUS_CONTRATO,
  ROTULO_TIPO_INSTRUMENTO,
  Selo,
  tomGateFinanceiro,
  tomGatePesquisa,
} from "@/components/contratos/rotulos";
import { INVENTARIO_DATA, ROTULO_DOMINIO, itensPorDominio } from "@/lib/inventario-patrimonial";

export const Route = createFileRoute("/_authenticated/contratos/")({
  head: () => ({
    meta: [
      { title: "Contratos — Clube Ancestral" },
      {
        name: "description",
        content:
          "Preparação interna de contratos-base, complementares, aditivos, anexos e ordens de serviço com revisão humana obrigatória.",
      },
      { property: "og:title", content: "Contratos — Clube Ancestral" },
      { property: "og:description", content: "Motor contratual interno com versionamento e revisão humana." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ContratosPage,
});

function ContratosPage() {
  const autoridade = useAutoridade();
  const { podeEscrever: podeEscreverVinculo } = useSaas();
  // Autoridade operacional: vínculo somente leitura vira pendência declarada,
  // nunca botão desabilitado. Só falta de papel ou de organização bloqueia.
  const podeEscrever = !autoridade.bloqueado({ capacidade: "corrigir_os_anexos_previa" });
  const pendenciaVinculo = podeEscreverVinculo
    ? null
    : "Seu vínculo de equipe está marcado como somente leitura — a gravação segue disponível por decisão sua e é revalidada no servidor.";
  const navigate = useNavigate();
  const listar = useServerFn(listarContratos);
  const painel = useServerFn(painelContratual);
  const criar = useServerFn(criarInstrumento);
  const carregarCasos = useServerFn(listarCasosFicha);

  const [tipo, setTipo] = useState("");
  const [status, setStatus] = useState("");
  const [busca, setBusca] = useState("");
  const [novo, setNovo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const qLista = useQuery({
    queryKey: ["contratos", tipo, status, busca],
    queryFn: () => listar({ data: { tipo: tipo || undefined, status: status || undefined, busca: busca || undefined } }),
  });
  const qPainel = useQuery({ queryKey: ["contratos-painel"], queryFn: () => painel({}) });
  const qCasos = useQuery({ queryKey: ["casos-ficha-picker"], queryFn: () => carregarCasos() });

  const bases = (qLista.data?.contratos ?? []).filter((c: any) => c.contract_type === "contract_base");
  const basesIndisponiveis = !qLista.isLoading && (Boolean(qLista.error) || qLista.data === undefined);

  const mCriar = useMutation({
    mutationFn: (dados: any) => criar({ data: dados }),
    onSuccess: (r) => navigate({ to: "/contratos/$id", params: { id: r.id } }),
    onError: (e: Error) => setErro(e.message),
  });

  return (
    <SaasShell
      titulo="Contratos"
      descricao="Instrumentos de trabalho interno. Nada aqui é enviado, cobrado ou assinado automaticamente."
      visualKit="pantone"
      acoes={
        (
          <button
            onClick={() => setNovo((v) => !v)}
            className="rounded-lg bg-navy px-3 py-2 text-sm font-medium text-cream hover:bg-navy/90"
          >
            Novo instrumento
          </button>
        )
      }
    >
      {pendenciaVinculo || !podeEscrever ? (
        <p className="mb-4 rounded-lg border border-navy/15 bg-navy/5 px-3 py-2 text-xs text-navy/70">
          Pendência registrada:{" "}
          {pendenciaVinculo ??
            "Contexto de acesso ainda não confirmado — a gravação é revalidada no servidor."}
        </p>
      ) : null}
      {qPainel.isError ? (
        <p className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-terracotta/40 bg-terracotta/10 px-3 py-2 text-sm text-terracotta">
          Não foi possível carregar os indicadores abaixo — os números não são zero, a leitura falhou.
          <button
            type="button"
            onClick={() => void qPainel.refetch()}
            className="rounded-md border border-terracotta/50 px-2 py-1 text-xs font-medium text-terracotta hover:bg-terracotta/10"
          >
            Tentar novamente
          </button>
        </p>
      ) : null}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Cartao titulo="Bloqueios abertos" valor={qPainel.data?.bloqueios.length ?? 0} />
        <Cartao titulo="Aguardando revisão humana" valor={qPainel.data?.revisaoPendente.length ?? 0} />
        <Cartao titulo="Anexos obrigatórios ausentes" valor={qPainel.data?.anexosAusentes.length ?? 0} />
        <Cartao titulo="OS impedidas por gate" valor={qPainel.data?.ordensImpedidas.length ?? 0} />
      </div>

      {qPainel.data?.excecoesExpiradas.length ? (
        <p className="mb-4 rounded-lg border border-terracotta/40 bg-terracotta/10 px-3 py-2 text-sm text-navy">
          {qPainel.data.excecoesExpiradas.length} exceção(ões) expirada(s) — os gates voltaram a bloquear.
        </p>
      ) : null}

      <section className="mb-6 rounded-xl border border-navy/10 bg-cream/40 p-4">
        <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-serif text-lg text-navy">Contrato de Estudo Genealógico v2 e anexos</h2>
          <span className="text-[11px] text-navy/50">Inventário patrimonial · leitura de {INVENTARIO_DATA}</span>
        </div>
        <p className="mb-3 text-xs text-navy/60">
          Ativos preservados: versão, situação e onde cada um realmente está. Somente leitura — nenhum texto
          jurídico é reescrito ou substituído aqui.{" "}
          <Link to="/governanca/contrato-base" className="text-terracotta underline">
            Ver texto do contrato-base
          </Link>
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-xs">
            <thead className="text-[10px] uppercase tracking-wide text-navy/45">
              <tr>
                <th className="py-1.5 pr-3">Ativo</th>
                <th className="py-1.5 pr-3">Domínio</th>
                <th className="py-1.5 pr-3">Versão</th>
                <th className="py-1.5 pr-3">Situação</th>
                <th className="py-1.5 pr-3">Fonte de verdade atual</th>
                <th className="py-1.5">Ação necessária</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy/10">
              {[...itensPorDominio("contrato_base"), ...itensPorDominio("anexos")].map((i) => (
                <tr key={i.id} className="align-top">
                  <td className="py-1.5 pr-3 font-medium text-navy">{i.nomeCanonico}</td>
                  <td className="py-1.5 pr-3 text-navy/60">{ROTULO_DOMINIO[i.dominio]}</td>
                  <td className="py-1.5 pr-3">{i.versao}</td>
                  <td className="py-1.5 pr-3">{i.status}</td>
                  <td className="py-1.5 pr-3 font-mono text-[11px] text-navy/60">{i.fonteDeVerdadeAtual}</td>
                  <td className="py-1.5 text-navy/60">{i.acaoNecessaria ?? "Nenhuma — manter como leitura."}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <FilaRevisaoJuridica />

      {novo ? (
        <FormNovo
          bases={bases}
          basesIndisponiveis={basesIndisponiveis}
          casos={(qCasos.data?.casos ?? []) as { id: string; codigo?: string; titulo?: string }[]}
          casosIndisponiveis={!qCasos.isLoading && (Boolean(qCasos.error) || qCasos.data === undefined)}
          erro={erro}
          onCancelar={() => setNovo(false)}
          onCriar={(dados) => mCriar.mutate(dados)}
          enviando={mCriar.isPending}
        />
      ) : null}

      <div className="mb-4 flex flex-wrap gap-2">
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por título"
          className="rounded-lg border border-navy/20 px-3 py-2 text-sm"
        />
        <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="rounded-lg border border-navy/20 px-3 py-2 text-sm">
          <option value="">Todos os tipos</option>
          {Object.entries(ROTULO_TIPO_INSTRUMENTO).map(([v, r]) => (
            <option key={v} value={v}>
              {r}
            </option>
          ))}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-navy/20 px-3 py-2 text-sm">
          <option value="">Todos os status</option>
          {Object.entries(ROTULO_STATUS_CONTRATO).map(([v, r]) => (
            <option key={v} value={v}>
              {r}
            </option>
          ))}
        </select>
      </div>

      <EstadoDados
        carregando={qLista.isLoading}
        erro={qLista.error}
        dados={qLista.data?.contratos}
        aoTentarNovamente={() => void qLista.refetch()}
        recurso="os instrumentos contratuais"
        vazio="Nenhum instrumento contratual nesta organização ainda."
      >
        {(contratos) => (
        <div className="overflow-x-auto rounded-xl border border-navy/10 bg-cream/40">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-navy/5 text-left text-xs uppercase tracking-wide text-navy/60">
              <tr>
                <th className="px-3 py-2">Número</th>
                <th className="px-3 py-2">Instrumento</th>
                <th className="px-3 py-2">Caso</th>
                <th className="px-3 py-2">Pessoa</th>
                <th className="px-3 py-2">Tipo</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Financeiro</th>
                <th className="px-3 py-2">Pesquisa</th>
              </tr>
            </thead>
            <tbody>
              {contratos.map((c: any) => (
                <tr key={c.id} className="border-t border-navy/10 hover:bg-cream/60">
                  <td className="px-3 py-2 font-mono text-xs">{c.contract_number}</td>
                  <td className="px-3 py-2">
                    <Link to="/contratos/$id" params={{ id: c.id }} className="font-medium text-navy underline-offset-2 hover:underline">
                      {c.title}
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-xs text-navy/70">
                    {c.case_id ? (
                      <Link
                        to="/casos/$caseId"
                        params={{ caseId: String(c.case_id) }}
                        className="underline underline-offset-2"
                      >
                        {((qCasos.data?.casos ?? []) as { id: string; codigo?: string }[]).find((x) => x.id === c.case_id)?.codigo ??
                          "Caso 360"}
                      </Link>
                    ) : (
                      "sem caso"
                    )}
                  </td>
                  <td className="px-3 py-2 text-xs">
                    {c.client_id ? (
                      <Link
                        to="/pessoas/$clienteId"
                        params={{ clienteId: String(c.client_id) }}
                        className="text-navy underline underline-offset-2"
                      >
                        Pessoa 360
                      </Link>
                    ) : (
                      <span className="text-navy/40">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2">{ROTULO_TIPO_INSTRUMENTO[c.contract_type] ?? c.contract_type}</td>
                  <td className="px-3 py-2">
                    <Selo texto={ROTULO_STATUS_CONTRATO[c.status] ?? c.status} />
                  </td>
                  <td className="px-3 py-2">
                    <Selo
                      texto={ROTULO_GATE_FINANCEIRO[c.financial_gate_status] ?? c.financial_gate_status}
                      tom={tomGateFinanceiro(c.financial_gate_status)}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Selo
                      texto={ROTULO_GATE_PESQUISA[c.research_gate_status] ?? c.research_gate_status}
                      tom={tomGatePesquisa(c.research_gate_status)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </EstadoDados>
      <PainelCatalogo />
    </SaasShell>
  );
}

function Cartao({ titulo, valor }: { titulo: string; valor: number }) {
  return (
    <div className="rounded-xl border border-navy/10 bg-cream/40 p-4">
      <p className="text-xs uppercase tracking-wide text-navy/60">{titulo}</p>
      <p className="mt-1 font-serif text-3xl text-navy">{valor}</p>
    </div>
  );
}

function FormNovo({
  bases,
  basesIndisponiveis,
  casos,
  casosIndisponiveis,
  erro,
  onCriar,
  onCancelar,
  enviando,
}: {
  bases: any[];
  basesIndisponiveis: boolean;
  casos: { id: string; codigo?: string; titulo?: string }[];
  casosIndisponiveis: boolean;
  erro: string | null;
  onCriar: (dados: any) => void;
  onCancelar: () => void;
  enviando: boolean;
}) {
  const [tipo, setTipo] = useState<"contract_base" | "contract_complement" | "amendment">("contract_base");
  const [title, setTitle] = useState("");
  const [purpose, setPurpose] = useState("");
  const [parent, setParent] = useState("");
  const [ref, setRef] = useState("");
  const [casoId, setCasoId] = useState("");
  const derivado = tipo !== "contract_base";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onCriar({
          contract_type: tipo,
          title,
          purpose_summary: purpose,
          parent_contract_id: derivado ? parent : null,
          base_contract_reference: derivado ? ref : null,
          case_id: tipo === "contract_base" ? casoId : null,
        });
      }}
      className="mb-6 grid gap-3 rounded-xl border border-gold/40 bg-cream/40 p-4 sm:grid-cols-2"
    >
      <label className="text-sm">
        Tipo de instrumento
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value as any)}
          className="mt-1 w-full rounded-lg border border-navy/20 px-3 py-2"
        >
          <option value="contract_base">Contrato-base</option>
          <option value="contract_complement">Contrato complementar</option>
          <option value="amendment">Aditivo</option>
        </select>
      </label>
      <label className="text-sm">
        Título
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 w-full rounded-lg border border-navy/20 px-3 py-2"
        />
      </label>
      {tipo === "contract_base" ? (
        <label className="text-sm sm:col-span-2">
          Caso operacional
          <select
            required
            value={casoId}
            onChange={(e) => setCasoId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-navy/20 px-3 py-2"
          >
            <option value="">Selecione o caso…</option>
            {casos.map((c) => (
              <option key={c.id} value={c.id}>
                {c.codigo} — {c.titulo}
              </option>
            ))}
          </select>
          {casosIndisponiveis ? (
            <span role="alert" className="mt-1 block text-xs text-terracotta">
              A lista de casos não pôde ser carregada. Sem caso o contrato-base não pode nascer ligado
              aos parâmetros do Planejador.
            </span>
          ) : null}
        </label>
      ) : null}
      {derivado ? (
        <>
          <label className="text-sm">
            Contrato-base (somente leitura, permanece íntegro)
            <select
              required
              value={parent}
              onChange={(e) => setParent(e.target.value)}
              className="mt-1 w-full rounded-lg border border-navy/20 px-3 py-2"
            >
              <option value="">Selecione…</option>
              {bases.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.contract_number} — {b.title}
                </option>
              ))}
            </select>
            {basesIndisponiveis ? (
              <span role="alert" className="mt-1 block text-xs text-terracotta">
                A lista de contratos-base não pôde ser carregada. Está vazia por falha de leitura, não por
                ausência de instrumentos.
              </span>
            ) : null}
          </label>
          <label className="text-sm">
            Referência do contrato-base
            <input
              required
              value={ref}
              onChange={(e) => setRef(e.target.value)}
              placeholder="Ex.: instrumento firmado em 00/00/0000"
              className="mt-1 w-full rounded-lg border border-navy/20 px-3 py-2"
            />
          </label>
        </>
      ) : null}
      <label className="text-sm sm:col-span-2">
        Finalidade
        <textarea
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          rows={2}
          className="mt-1 w-full rounded-lg border border-navy/20 px-3 py-2"
        />
      </label>
      {erro ? <p className="text-sm text-terracotta sm:col-span-2">{erro}</p> : null}
      <div className="flex gap-2 sm:col-span-2">
        <button disabled={enviando} className="rounded-lg bg-navy px-3 py-2 text-sm text-cream disabled:opacity-60">
          Criar rascunho
        </button>
        <button type="button" onClick={onCancelar} className="rounded-lg border border-navy/20 px-3 py-2 text-sm">
          Cancelar
        </button>
      </div>
    </form>
  );
}
