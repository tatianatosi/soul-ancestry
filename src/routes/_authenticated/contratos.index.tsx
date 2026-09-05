import { PainelCatalogo } from "@/components/painel/painel-catalogo";
import { PainelTop30 } from "@/components/painel/painel-top30";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { SaasShell } from "@/components/saas/shell";
import { EstadoDados } from "@/components/saas/estado-dados";
import { FilaRevisaoJuridica } from "@/components/contratos/fila-revisao-juridica";
import { criarInstrumento, listarContratos, painelContratual } from "@/lib/contratos.functions";
import {
  ROTULO_GATE_FINANCEIRO,
  ROTULO_GATE_PESQUISA,
  ROTULO_STATUS_CONTRATO,
  ROTULO_TIPO_INSTRUMENTO,
  Selo,
  tomGateFinanceiro,
  tomGatePesquisa,
} from "@/components/contratos/rotulos";

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
  const navigate = useNavigate();
  const listar = useServerFn(listarContratos);
  const painel = useServerFn(painelContratual);
  const criar = useServerFn(criarInstrumento);

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

      <FilaRevisaoJuridica />

      {novo ? (
        <FormNovo
          bases={bases}
          basesIndisponiveis={basesIndisponiveis}
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
        <div className="overflow-x-auto rounded-xl border border-navy/10 bg-white">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-navy/5 text-left text-xs uppercase tracking-wide text-navy/60">
              <tr>
                <th className="px-3 py-2">Número</th>
                <th className="px-3 py-2">Instrumento</th>
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
      <PainelTop30 />
    </SaasShell>
  );
}

function Cartao({ titulo, valor }: { titulo: string; valor: number }) {
  return (
    <div className="rounded-xl border border-navy/10 bg-white p-4">
      <p className="text-xs uppercase tracking-wide text-navy/60">{titulo}</p>
      <p className="mt-1 font-serif text-3xl text-navy">{valor}</p>
    </div>
  );
}

function FormNovo({
  bases,
  basesIndisponiveis,
  erro,
  onCriar,
  onCancelar,
  enviando,
}: {
  bases: any[];
  basesIndisponiveis: boolean;
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
        });
      }}
      className="mb-6 grid gap-3 rounded-xl border border-gold/40 bg-white p-4 sm:grid-cols-2"
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
