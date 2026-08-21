/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { Painel, Selo, inputCls } from "@/components/comercial/base";
import { SaasShell } from "@/components/saas/shell";
import {
  criarPesquisaPiloto,
  liberarPortalPiloto,
  painelPiloto,
  resolverBloqueioPiloto,
  salvarDadoPiloto,
  verificarDadoPiloto,
} from "@/lib/piloto.functions";
import { FASES_CICLO_PILOTO, NOTA_CICLO } from "@/lib/ciclo-piloto-ana";
import {
  agruparBloqueiosPorGate,
  estadoDoCampo,
  primeiroGatePendente,
  type RequisitoBloqueio,
} from "@/lib/gates-piloto";



const TITULO = "Piloto real — conferir dados | Clube Ancestral";
const DESCRICAO =
  "Conferência controlada dos dados do piloto real: origem obrigatória, pendências visíveis e bloqueios críticos.";

const ORIGENS: { valor: string; rotulo: string }[] = [
  { valor: "proposta_aprovada", rotulo: "Proposta aprovada" },
  { valor: "whatsapp_confirmado", rotulo: "WhatsApp confirmado" },
  { valor: "reuniao_transcricao", rotulo: "Reunião / transcrição (não verificado)" },
  { valor: "documento", rotulo: "Documento" },
  { valor: "formulario", rotulo: "Formulário" },
  { valor: "preenchimento_humano", rotulo: "Preenchimento humano" },
];

export const Route = createFileRoute("/_authenticated/piloto")({
  head: () => ({
    meta: [
      { title: TITULO },
      { name: "description", content: DESCRICAO },
      { property: "og:title", content: TITULO },
      { property: "og:description", content: DESCRICAO },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Pagina,
});

function Pagina() {
  const carregar = useServerFn(painelPiloto);
  const q = useQuery({ queryKey: ["piloto", "painel"], queryFn: () => carregar() });

  return (
    <SaasShell titulo="Piloto real — Ana Luiza">
      {q.isLoading && <p className="text-sm text-navy/60">Carregando conferência do piloto…</p>}
      {q.error && <p className="text-sm text-terracotta">{(q.error as Error).message}</p>}
      {q.data && !q.data.caso && (
        <Painel titulo="Piloto real">
          <p className="text-sm text-navy/70">
            Nenhum caso piloto real encontrado nesta organização. Nenhum caso de demonstração é usado como
            substituto.
          </p>
        </Painel>
      )}
      {q.data?.caso && <Conteudo dados={q.data as any} />}
      <Painel titulo="Ciclo completo — fases 1 a 4">
        <p className="text-sm text-navy/70">{NOTA_CICLO}</p>
        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          {FASES_CICLO_PILOTO.map((f) => (
            <div key={f.codigo} className="rounded-lg border border-navy/10 p-3">
              <p className="font-serif text-base text-navy">
                Fase {f.numero} — {f.nome}
              </p>
              <p className="text-xs text-navy/60">{f.objetivo}</p>
              <p className="mt-1 text-[11px] uppercase tracking-wide text-navy/40">{f.condicao_entrada}</p>
              <ul className="mt-2 space-y-1 text-xs text-navy/70">
                {f.itens.map((i) => (
                  <li key={i.item}>
                    • {i.item}
                    {i.detalhe && <span className="block pl-3 text-[11px] text-navy/45">{i.detalhe}</span>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Painel>
    </SaasShell>
  );
}

function Conteudo({ dados }: { dados: any }) {
  const qc = useQueryClient();
  const invalidar = () => qc.invalidateQueries({ queryKey: ["piloto", "painel"] });
  const caso = dados.caso as Record<string, any>;
  const campos = dados.campos as Record<string, any>[];
  const bloqueios = dados.bloqueios as Record<string, any>[];

  const criarPesquisa = useServerFn(criarPesquisaPiloto);
  const liberarPortal = useServerFn(liberarPortalPiloto);

  const mPesquisa = useMutation({
    mutationFn: () => criarPesquisa(),
    onSuccess: (r: any) => {
      toast.success(r.jaExistia ? "Pesquisa já existia para este caso." : "Pesquisa criada para o caso canônico.");
      invalidar();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const mPortal = useMutation({
    mutationFn: (liberar: boolean) => liberarPortal({ data: { liberar } }),
    onSuccess: () => {
      toast.success("Estado do portal atualizado.");
      invalidar();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const pendentes = campos.filter((c) => c["obrigatorio"] && !c["valor"]);
  const naoVerificados = campos.filter((c) => c["valor"] && !c["verificado"]);
  const criticosAbertos = bloqueios.filter((b) => b["status"] === "aberto" && b["criticidade"] === "critico");
  const agrupados = agruparBloqueiosPorGate(bloqueios);
  const gatePendente = primeiroGatePendente(agrupados);
  const secoes = [...new Set(campos.map((c) => c["secao"] as string))];


  return (
    <div className="space-y-4">
      <div className="rounded-xl border-2 border-gold bg-navy p-4 text-cream">
        <p className="text-xs font-semibold tracking-wide text-gold">{caso["selo_interno"]}</p>
        <h2 className="mt-1 text-lg font-semibold">
          {caso["codigo"]} — {dados.cliente?.nome ?? "Cliente não vinculado"}
        </h2>
        <p className="mt-0.5 font-mono text-[11px] text-cream/70">case_id: {caso["id"]}</p>
        <Link
          to="/casos/$caseId/contrato/preparar"
          params={{ caseId: String(caso["id"]) }}
          className="mt-2 inline-block rounded-lg bg-gold px-3 py-1.5 text-xs font-semibold text-navy"
        >
          Abrir ficha e prévia contratual
        </Link>
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          <Selo texto={`Aceite comercial: ${caso["aceite_comercial_em"] ?? "não registrado"}`} tom="ok" />
          <Selo texto={`Preparação: ${caso["preparacao_status"]}`} tom="alerta" />
          <Selo texto={`Ativação operacional: ${caso["ativacao_operacional"]}`} tom="erro" />
          <Selo
            texto={`Portal: ${caso["app_access_status"] === "liberado" ? "liberado" : "bloqueado"}`}
            tom={caso["app_access_status"] === "liberado" ? "ok" : "erro"}
          />
        </div>
        {dados.duplicatas > 0 && (
          <p className="mt-2 text-xs text-terracotta">
            Atenção: existe mais de um caso marcado como piloto. Consolide em um único case_id.
          </p>
        )}
      </div>

      <Painel titulo="Situação da conferência">
        <ul className="space-y-1 text-sm text-navy/80">
          <li>
            Campos obrigatórios pendentes: <strong>{pendentes.length}</strong> (mostrados como pendência, nunca
            preenchidos automaticamente)
          </li>
          <li>
            Dados aguardando verificação humana: <strong>{naoVerificados.length}</strong>
          </li>
          <li>
            Bloqueios críticos abertos: <strong>{criticosAbertos.length}</strong> — a ativação operacional permanece
            NO_GO enquanto houver qualquer um deles.
          </li>
          {gatePendente && (
            <li>
              Primeiro gate não atendido: <strong>{gatePendente.gate.nome}</strong> ({gatePendente.abertos} item(ns)
              aberto(s)). Evidências exigidas listadas abaixo, no bloco do gate.
            </li>
          )}
        </ul>
        <p className="mt-2 text-xs text-navy/60">
          A importação de dados não cria cobranças, pesquisa externa, solicitações institucionais, entregas nem
          acessos ampliados. Transcrições, WhatsApp e relatos são fontes brutas e não validam parentesco,
          elegibilidade ou rota jurídica.
        </p>
      </Painel>

      {secoes.map((secao) => (
        <Painel key={secao} titulo={`Conferir dados — ${secao}`}>
          <div className="space-y-3">
            {campos.filter((c) => c["secao"] === secao).map((c) => (
              <LinhaCampo key={c["id"]} campo={c} aoSalvar={invalidar} />
            ))}
          </div>
        </Painel>
      ))}

      <Painel titulo="Bloqueios críticos por gate">
        <p className="text-sm text-navy/70">
          Os bloqueios são resolvidos em sequência (A a H). Um gate posterior só deve ser trabalhado depois que o
          anterior estiver concluído. “Resolver” apenas abre o registro da evidência: nenhum status de gate muda
          automaticamente.
        </p>
        <div className="mt-3 space-y-4">
          {agrupados.map((g) => (
            <div key={g.gate.codigo} className="rounded-lg border border-navy/10 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-serif text-base text-navy">
                  Gate {g.gate.nome}: {g.total - g.abertos}/{g.total}
                </p>

                <Selo
                  texto={g.abertos === 0 ? "Concluído" : g.liberado ? "Em trabalho" : "Aguardando gate anterior"}
                  tom={g.abertos === 0 ? "ok" : g.liberado ? "alerta" : "erro"}
                />
              </div>
              <p className="text-xs text-navy/60">{g.gate.objetivo}</p>
              <div className="mt-2 space-y-3">
                {g.itens.map((i) => (
                  <LinhaBloqueio
                    key={i.bloqueio["id"]}
                    bloqueio={i.bloqueio}
                    requisito={i.requisito}
                    dependenciaPendente={!g.liberado}
                    aoSalvar={invalidar}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Painel>


      <Painel titulo="Contrato aplicável">
        <p className="text-sm text-navy/80">
          Versão contratual aplicável: <strong>MODELO ESTUDO</strong> com a <strong>base contratual genérica v2</strong>{" "}
          e os anexos aplicáveis. Modelo Simples e Modelo 2024 são recusados neste caso.
        </p>
        <p className="mt-1 text-xs text-navy/60">
          O contrato só chega a “assinado” com data, origem externa da assinatura, referência de assinatura, partes
          qualificadas e aprovação humana registradas. O valor comercial aprovado permanece sujeito à revisão humana e
          não é recalculado automaticamente.
        </p>
      </Painel>

      <Painel titulo="Pesquisa e portal">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => mPesquisa.mutate()}
            className="rounded-lg bg-navy px-4 py-2 text-sm text-cream disabled:opacity-60"
            disabled={mPesquisa.isPending}
          >
            {dados.pesquisa ? "Abrir/garantir pesquisa do caso" : "Criar pesquisa deste caso"}
          </button>
          <button
            onClick={() => mPortal.mutate(caso["app_access_status"] !== "liberado")}
            className="rounded-lg border border-navy/20 px-4 py-2 text-sm text-navy/80"
            disabled={mPortal.isPending}
          >
            {caso["app_access_status"] === "liberado" ? "Bloquear portal do cliente" : "Liberar portal do cliente"}
          </button>
        </div>
        <p className="mt-2 text-xs text-navy/60">
          Pesquisa externa permanece bloqueada até contrato assinado, condição financeira aplicável, autorização e
          qualidade elegível. O portal usa apenas as views seguras: o cliente vê o próprio cadastro permitido, seus
          uploads, documentos/entregas liberados e mensagens cliente-facing — nunca contrato interno, transcrições,
          anotações, hipóteses, fontes, riscos, tarefas, auditoria, pagamentos ou decisões internas.
        </p>
      </Painel>
    </div>
  );
}

function LinhaCampo({ campo, aoSalvar }: { campo: Record<string, any>; aoSalvar: () => void }) {
  const salvar = useServerFn(salvarDadoPiloto);
  const verificar = useServerFn(verificarDadoPiloto);
  const [valor, setValor] = useState((campo["valor"] as string) ?? "");
  const [origem, setOrigem] = useState((campo["origem"] as string) ?? "preenchimento_humano");
  const [detalhe, setDetalhe] = useState((campo["origem_detalhe"] as string) ?? "");

  const mSalvar = useMutation({
    mutationFn: () => salvar({ data: { id: campo["id"], valor, origem, origemDetalhe: detalhe } }),
    onSuccess: () => {
      toast.success("Dado registrado com origem e auditoria.");
      aoSalvar();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const mVerificar = useMutation({
    mutationFn: (v: boolean) => verificar({ data: { id: campo["id"], verificado: v } }),
    onSuccess: () => {
      toast.success("Verificação atualizada.");
      aoSalvar();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const estado = estadoDoCampo(campo);
  const origemAtual = ORIGENS.find((o) => o.valor === campo["origem"])?.rotulo ?? "sem origem declarada";
  const fmt = (v: string | null) => (v ? new Date(v).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }) : "—");

  return (
    <div className="rounded-lg border border-navy/15 bg-white p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-navy">
          {campo["label"]} {campo["obrigatorio"] ? <span className="text-terracotta">*</span> : null}
        </p>
        <Selo texto={estado.rotulo} tom={estado.tom} />
      </div>
      <dl className="mt-1 grid gap-x-4 gap-y-0.5 text-[11px] text-navy/60 md:grid-cols-3">
        <div>
          <dt className="inline font-semibold">Origem: </dt>
          <dd className="inline">{campo["valor"] ? origemAtual : "—"}</dd>
        </div>
        <div>
          <dt className="inline font-semibold">Referência: </dt>
          <dd className="inline">{campo["origem_detalhe"] ?? "—"}</dd>
        </div>
        <div>
          <dt className="inline font-semibold">Captura: </dt>
          <dd className="inline">{campo["valor"] ? fmt(campo["updated_at"]) : "—"}</dd>
        </div>
        <div>
          <dt className="inline font-semibold">Verificação: </dt>
          <dd className="inline">{campo["verificado"] ? fmt(campo["verificado_em"]) : "pendente de revisão humana"}</dd>
        </div>
      </dl>
      {estado.nota && <p className="mt-1 text-[11px] text-terracotta">{estado.nota}</p>}

      <div className="mt-2 grid gap-2 md:grid-cols-3">
        <input
          className={inputCls}
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          placeholder="Deixe vazio se não houver dado real"
        />
        <select className={inputCls} value={origem} onChange={(e) => setOrigem(e.target.value)}>
          {ORIGENS.map((o) => (
            <option key={o.valor} value={o.valor}>
              {o.rotulo}
            </option>
          ))}
        </select>
        <input
          className={inputCls}
          value={detalhe}
          onChange={(e) => setDetalhe(e.target.value)}
          placeholder="Referência da origem (nº da proposta, data da reunião…)"
        />
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          onClick={() => mSalvar.mutate()}
          className="rounded-lg bg-navy px-3 py-1.5 text-xs text-cream"
          disabled={mSalvar.isPending}
        >
          Salvar com origem
        </button>
        {campo["valor"] && (
          <button
            onClick={() => mVerificar.mutate(!campo["verificado"])}
            className="rounded-lg border border-navy/20 px-3 py-1.5 text-xs text-navy/80"
            disabled={mVerificar.isPending}
          >
            {campo["verificado"] ? "Marcar como não verificado" : "Marcar como verificado"}
          </button>
        )}
      </div>
    </div>
  );
}

function LinhaBloqueio({
  bloqueio,
  requisito,
  dependenciaPendente,
  aoSalvar,
}: {
  bloqueio: Record<string, any>;
  requisito: RequisitoBloqueio;
  dependenciaPendente: boolean;
  aoSalvar: () => void;
}) {
  const resolver = useServerFn(resolverBloqueioPiloto);
  const [justificativa, setJustificativa] = useState("");
  const [formAberto, setFormAberto] = useState(false);
  const aberto = bloqueio["status"] === "aberto";

  const m = useMutation({
    mutationFn: (status: "resolvido" | "nao_aplicavel") =>
      resolver({ data: { id: bloqueio["id"], status, justificativa } }),
    onSuccess: () => {
      toast.success("Bloqueio atualizado.");
      setFormAberto(false);
      aoSalvar();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="rounded-lg border border-navy/15 bg-white p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-navy">{bloqueio["descricao"]}</p>
        <Selo texto={aberto ? "Aberto" : bloqueio["status"] === "resolvido" ? "Resolvido" : "Não aplicável"} tom={aberto ? "erro" : "ok"} />
      </div>
      <dl className="mt-1 grid gap-x-4 gap-y-0.5 text-[11px] text-navy/60 md:grid-cols-3">
        <div>
          <dt className="inline font-semibold">Responsável: </dt>
          <dd className="inline">{requisito.responsavel}</dd>
        </div>
        <div>
          <dt className="inline font-semibold">Origem permitida: </dt>
          <dd className="inline">{requisito.origem}</dd>
        </div>
        <div className="md:col-span-3">
          <dt className="inline font-semibold">Evidência mínima: </dt>
          <dd className="inline">{requisito.evidencia}</dd>
        </div>
      </dl>
      {aberto ? (
        dependenciaPendente ? (
          <p className="mt-2 text-xs text-terracotta">
            Aguardando conclusão do gate anterior. Resolver este item fora de ordem não libera o gate.
          </p>
        ) : !formAberto ? (
          <button
            onClick={() => setFormAberto(true)}
            className="mt-2 rounded-lg border border-navy/20 px-3 py-1.5 text-xs text-navy/80"
          >
            Resolver — registrar evidência
          </button>
        ) : (
          <div className="mt-2 space-y-2">
            <input
              className={`${inputCls} md:w-2/3`}
              value={justificativa}
              onChange={(e) => setJustificativa(e.target.value)}
              placeholder="Evidência e justificativa (mín. 10 caracteres)"
            />
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => m.mutate("resolvido")}
                className="rounded-lg bg-navy px-3 py-1.5 text-xs text-cream disabled:opacity-60"
                disabled={m.isPending || justificativa.trim().length < 10}
              >
                Confirmar resolução com evidência
              </button>
              <button
                onClick={() => m.mutate("nao_aplicavel")}
                className="rounded-lg border border-navy/20 px-3 py-1.5 text-xs text-navy/80 disabled:opacity-60"
                disabled={m.isPending || justificativa.trim().length < 10}
              >
                Não aplicável
              </button>
              <button
                onClick={() => setFormAberto(false)}
                className="rounded-lg px-3 py-1.5 text-xs text-navy/60"
              >
                Cancelar
              </button>
            </div>
            <p className="text-[11px] text-navy/50">
              O registro é auditado com ator, data/hora e justificativa. O status do gate só muda quando todos os
              itens do gate estiverem concluídos.
            </p>
          </div>
        )
      ) : (
        <p className="mt-1 text-xs text-navy/60">
          Resultado: {bloqueio["status"] === "resolvido" ? "resolvido" : "não aplicável"} em{" "}
          {bloqueio["resolvido_em"]
            ? new Date(bloqueio["resolvido_em"]).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })
            : "—"}
          . Justificativa: {bloqueio["justificativa"]}
        </p>

      )}

    </div>
  );
}
