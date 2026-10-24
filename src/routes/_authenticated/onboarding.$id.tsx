import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ITEM_CODE_D7 } from "@/lib/d7-microentrega";
import { useAutoridade } from "@/components/saas/autoridade";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { SaasShell } from "@/components/saas/shell";
import { CaCard } from "@/components/ui/ca-card";
import { Indicador } from "@/components/prancha-v4/kit";
import { AcaoOperacional } from "@/components/saas/acao-operacional";
import { useAvisoEdicaoNaoSalva } from "@/lib/aviso-edicao-nao-salva";
import {
  atualizarCheckAtivacao,
  atualizarItemChecklistOnboarding,
  ativarCasoComChecks,
  obterOnboarding,
  suspenderCaso,
} from "@/lib/onboarding.functions";
import {
  podeValidar,
  responsavelDoCheck,
  type CheckAtivacao,
  type Papel,
} from "@/lib/onboarding-regras";

export const Route = createFileRoute("/_authenticated/onboarding/$id")({
  head: () => ({
    meta: [
      { title: "Onboarding do caso — Clube Ancestral" },
      {
        name: "description",
        content:
          "Requisitos executáveis de ativação: validação, isenções autorizadas e linha do tempo do onboarding.",
      },
      { property: "og:title", content: "Onboarding do caso — Clube Ancestral" },
      {
        property: "og:description",
        content: "Painel de ativação de casos com travas de validação.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OnboardingPage,
});

const STATUS_LABEL: Record<string, string> = {
  pendente: "Pendente",
  validado: "Validado",
  isento: "Isento (admin)",
  nao_aplicavel: "Não aplicável",
};

function badge(status: string, expirada: boolean) {
  if (expirada) return "bg-terracotta/15 text-terracotta";
  if (status === "validado") return "bg-emerald-100 text-emerald-800";
  if (status === "isento") return "bg-gold/20 text-navy";
  if (status === "nao_aplicavel") return "bg-navy/10 text-navy/60";
  return "bg-terracotta/10 text-terracotta";
}

function OnboardingPage() {
  const { id } = useParams({ from: "/_authenticated/onboarding/$id" });
  const qc = useQueryClient();
  const carregar = useServerFn(obterOnboarding);
  const atualizar = useServerFn(atualizarCheckAtivacao);
  const atualizarItemOnboarding = useServerFn(atualizarItemChecklistOnboarding);
  const ativar = useServerFn(ativarCasoComChecks);
  const suspender = useServerFn(suspenderCaso);

  const [aviso, setAviso] = useState<string | null>(null);
  const [isencaoDe, setIsencaoDe] = useState<CheckAtivacao | null>(null);
  const [motivo, setMotivo] = useState("");
  const [expira, setExpira] = useState("");
  const [motivoSuspensao, setMotivoSuspensao] = useState("");
  const [suspendendo, setSuspendendo] = useState(false);
  /* F5 / sair da linha (09/10/2026): trava a saída com edição pendente. */
  useAvisoEdicaoNaoSalva(
    motivo.trim() !== "" || expira.trim() !== "" || motivoSuspensao.trim() !== "",
  );
  const [itemOnboardingDe, setItemOnboardingDe] = useState<{
    id: string;
    label: string;
    status: "concluido" | "nao_aplicavel";
  } | null>(null);
  const [evidenciaOnboarding, setEvidenciaOnboarding] = useState("");

  const q = useQuery({
    queryKey: ["onboarding", id],
    queryFn: () => carregar({ data: { casoId: id } }),
  });

  const recarregar = () => qc.invalidateQueries({ queryKey: ["onboarding", id] });

  const mAtualizar = useMutation({
    mutationFn: (v: Parameters<typeof atualizarCheckAtivacao>[0]["data"]) => atualizar({ data: v }),
    onSuccess: (r) => {
      setAviso(r.ok ? "Requisito atualizado e registrado em auditoria." : `Bloqueado: ${r.erro}`);
      recarregar();
    },
  });
  const mAtivar = useMutation({
    mutationFn: (motivo?: string) =>
      ativar({ data: { casoId: id, motivoOverride: motivo?.trim() || null } }),
    onSuccess: (r) => {
      setAviso(
        r.ok
          ? r.pendencias?.length
            ? `Caso ativado. Pendências preservadas: ${r.pendencias.join(" · ")}`
            : "Caso ativado. Data de ativação, usuário e evento de auditoria registrados."
          : `Ativação bloqueada: ${r.pendencias.join(" · ")}`,
      );
      recarregar();
    },
    // 24/10/2026: sem este onError, uma exceção do servidor (guard do banco,
    // RLS, rede) deixava a tela absolutamente muda — o clique não produzia
    // aviso nenhum. "Clico em ativar e não acontece nada" era isto.
    onError: (e) =>
      setAviso(
        `Ativação falhou antes de gravar: ${e instanceof Error ? e.message : String(e)}`,
      ),
  });
  const mAtualizarOnboarding = useMutation({
    mutationFn: (v: Parameters<typeof atualizarItemChecklistOnboarding>[0]["data"]) =>
      atualizarItemOnboarding({ data: v }),
    onSuccess: (r) => {
      setAviso(
        r.ok ? "Item de onboarding atualizado e registrado em auditoria." : `Bloqueado: ${r.erro}`,
      );
      recarregar();
    },
  });
  const mSuspender = useMutation({
    mutationFn: () => suspender({ data: { casoId: id, motivo: motivoSuspensao } }),
    onSuccess: (r) => {
      setAviso(
        r.ok
          ? "Caso suspenso. Tarefa de revisão criada para o responsável."
          : `Bloqueado: ${r.erro}`,
      );
      if (r.ok) {
        setSuspendendo(false);
        setMotivoSuspensao("");
      }
      recarregar();
    },
  });

  const autoridade = useAutoridade();
  const dados = q.data;
  const papeis = (dados?.papeis ?? []) as Papel[];
  // Autoridade operacional: papel "admin" do caso deixa de esconder as ações de
  // requisito. Só falta de papel ou de organização bloqueia; a diferença de
  // vínculo vira pendência declarada na tela.
  const ehAdmin = !autoridade.bloqueado({ capacidade: "avancar_caso_planejador_tarefa" });
  const pendenciaVinculo = papeis.includes("admin")
    ? null
    : "Seu vínculo neste caso não é de administrador — as validações de requisito seguem disponíveis por decisão sua.";
  const caso = (dados?.caso ?? {}) as Record<string, string | number | boolean | null>;
  const checks = dados?.checks ?? [];
  // 05/09/2026 — "pronto"/"Requisitos completos" não pode mais vir só do
  // checklist clicável (pendencias): o banco recusa a ativação por até 4
  // outras fontes reais que o checklist nunca leu. bloqueiosReais é a
  // mesma projeção usada pelo banco (ver migration
  // 20260905120000_case_ativacao_bloqueios_reais.sql); só quando ela vem
  // vazia é que a tela pode dizer "completo".
  const bloqueiosReais = dados?.bloqueiosReais ?? [];
  const checklistOnboarding = dados?.checklistOnboarding ?? [];
  const pronto = bloqueiosReais.length === 0;
  const ativo = Boolean(caso["ativo"]);

  return (
    <SaasShell
      titulo="Onboarding e ativação"
      descricao="Requisitos de ativação do caso, com quem valida cada um."
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-navy">
            {String(caso["codigo"] ?? "")} — {String(caso["titulo"] ?? "Caso")}
          </p>
          <p className="text-xs text-navy/60">
            Status atual: {String(caso["status"] ?? "—")}
            {caso["data_ativacao"]
              ? ` · ativado em ${new Date(String(caso["data_ativacao"])).toLocaleString("pt-BR")}`
              : ""}
          </p>
        </div>
        <Link
          to="/casos"
          className="rounded-md border border-navy/15 px-3 py-1.5 text-xs text-navy/70 hover:bg-navy/5"
        >
          Voltar aos casos
        </Link>
      </div>

      {aviso ? (
        <p className="mb-4 rounded-lg border border-gold/50 bg-gold/10 px-3 py-2 text-sm text-navy">
          {aviso}
        </p>
      ) : null}

      {q.isLoading ? <p className="text-sm text-navy/60">Carregando requisitos…</p> : null}
      {q.isError ? (
        <p role="alert" className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-terracotta/40 bg-terracotta/10 px-3 py-2 text-sm text-terracotta">
          Não foi possível carregar os requisitos de ativação deste caso.
          <button
            type="button"
            onClick={() => void q.refetch()}
            className="rounded-md border border-terracotta/50 px-2 py-1 text-xs font-medium text-terracotta hover:bg-terracotta/10"
          >
            Tentar novamente
          </button>
        </p>
      ) : null}
      {pendenciaVinculo ? (
        <p className="mb-4 rounded-lg border border-navy/15 bg-navy/5 px-3 py-2 text-xs text-navy/70">
          Pendência registrada: {pendenciaVinculo}
        </p>
      ) : null}

      {dados ? (
        // Casca V4: KPIs só com contagem real do que `obterOnboarding` devolveu.
        <div
          className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4"
          data-onboarding-kpis
        >
          <Indicador
            rotulo="Requisitos validados"
            valor={String(checks.filter((c) => c.status === "validado").length)}
            apoio={`de ${checks.length} requisito(s)`}
          />
          <Indicador
            rotulo="Pendências reais"
            valor={String(bloqueiosReais.length)}
            apoio="Mesma projeção usada pelo banco"
          />
          <Indicador
            rotulo="Checklist concluído"
            valor={String(checklistOnboarding.filter((i) => i.status === "concluido").length)}
            apoio={`de ${checklistOnboarding.length} item(ns)`}
          />
          <Indicador rotulo="Situação do caso" valor={ativo ? "Ativo" : "Não ativo"} apoio={String(caso["status"] ?? "—")} />
        </div>
      ) : null}

      {dados ? (
        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <CaCard>
            <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-serif text-lg text-navy">Requisitos de ativação</h2>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  ativo
                    ? "bg-emerald-100 text-emerald-800"
                    : pronto
                      ? "bg-gold/20 text-navy"
                      : "bg-terracotta/10 text-terracotta"
                }`}
              >
                {ativo
                  ? "Caso ativo"
                  : pronto
                    ? "Requisitos completos"
                    : `Ativação com ${bloqueiosReais.length} pendência(s) — informa, não impede a proprietária`}
              </span>
            </header>

            {!pronto ? (
              <div className="mb-4 rounded-lg border border-navy/15 bg-cream/40 p-3 text-sm text-navy">
                <p className="font-medium">
                  Pendências reais abaixo (startup: informam, não travam a proprietária). Resolver
                  na tela indicada melhora a qualidade; o botão de ativação permanece disponível
                  com decisão auditada.
                </p>
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full min-w-[640px] border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-terracotta/20 text-left text-navy/60">
                        <th className="py-1 pr-3 font-medium">Bloqueio</th>
                        <th className="py-1 pr-3 font-medium">Tabela/campo</th>
                        <th className="py-1 pr-3 font-medium">Valor atual</th>
                        <th className="py-1 font-medium">Tela para resolver</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bloqueiosReais.map((b, i) => (
                        <tr
                          key={`${b.regra}-${i}`}
                          className="border-b border-terracotta/10 align-top"
                        >
                          <td className="py-1.5 pr-3 text-navy/85">{b.motivo}</td>
                          <td className="py-1.5 pr-3 font-mono text-[11px] text-navy/50">
                            {b.tabela_campo}
                          </td>
                          <td className="py-1.5 pr-3 text-navy/70">{b.valor_atual}</td>
                          <td className="py-1.5 text-navy/70">
                            {b.cta_tela ? (
                              <a href={b.cta_tela} className="text-navy underline hover:text-gold">
                                Abrir
                              </a>
                            ) : (
                              "—"
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}

            <p className="mb-2 text-xs text-navy/50">
              Lista abaixo: quem confirma cada item e quando confirmou. Clicar em "Validar" registra
              a confirmação, mas não substitui o dado real — itens com fonte própria (consentimento,
              onboarding, contrato) só saem da lista de bloqueios acima quando o dado real existir.
            </p>
            <ul className="divide-y divide-navy/10">
              {checks.map((c) => {
                const expirada =
                  c.status === "isento" &&
                  !!c.isencao_expira_em &&
                  new Date(c.isencao_expira_em) < new Date();
                return (
                  <li key={c.id} className="flex flex-wrap items-start justify-between gap-3 py-3">
                    <div className="min-w-[220px]">
                      <p className="text-sm font-medium text-navy">{c.label}</p>
                      <p className="text-xs text-navy/55">
                        Responsável: {responsavelDoCheck(c.dominio)}
                        {c.validado_em
                          ? ` · ${new Date(c.validado_em).toLocaleString("pt-BR")}`
                          : ""}
                        {c.origem_validacao ? ` · origem: ${c.origem_validacao}` : ""}
                      </p>
                      {c.isencao_motivo ? (
                        <p className="text-xs text-navy/55">
                          Isenção: {c.isencao_motivo}
                          {c.isencao_expira_em
                            ? ` · expira em ${new Date(c.isencao_expira_em).toLocaleDateString("pt-BR")}`
                            : ""}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${badge(c.status, expirada)}`}
                      >
                        {expirada ? "Isenção expirada" : (STATUS_LABEL[c.status] ?? c.status)}
                      </span>
                      {c.status !== "validado" && podeValidar(papeis, c.dominio, "validado") ? (
                        <button
                          onClick={() => mAtualizar.mutate({ checkId: c.id, status: "validado" })}
                          className="rounded-md border border-navy/15 px-2 py-1 text-xs text-navy/70 hover:bg-navy/5"
                        >
                          Validar
                        </button>
                      ) : null}
                      {ehAdmin && c.status !== "isento" ? (
                        <button
                          onClick={() => {
                            setIsencaoDe(c);
                            setMotivo("");
                            setExpira("");
                          }}
                          className="rounded-md border border-gold/50 px-2 py-1 text-xs text-navy hover:bg-gold/10"
                        >
                          Autorizar isenção
                        </button>
                      ) : null}
                      {ehAdmin && c.status !== "pendente" ? (
                        <button
                          onClick={() => mAtualizar.mutate({ checkId: c.id, status: "pendente" })}
                          className="rounded-md border border-navy/15 px-2 py-1 text-xs text-navy/60 hover:bg-navy/5"
                        >
                          Reverter
                        </button>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>

            {(dados.bloqueiosPiloto ?? []).length > 0 && !ativo ? (
              <div
                data-portao-piloto
                className="mt-4 rounded-lg border-2 border-terracotta/40 bg-terracotta/5 p-4"
              >
                <p className="text-sm font-semibold text-terracotta">
                  O banco vai recusar a ativação deste caso: {(dados.bloqueiosPiloto ?? []).length}{" "}
                  bloqueio(s) crítico(s) do piloto em aberto.
                </p>
                <p className="mt-1 text-xs text-navy/70">
                  Este portão é do banco (<code>fn_piloto_caso_guard</code> sobre{" "}
                  <code>piloto_bloqueios</code>), não do checklist acima, e{" "}
                  <strong className="font-semibold">o override da proprietária não o vence</strong> —
                  ele é verificado depois. Enquanto houver item nesta lista, clicar em Ativar
                  devolve “Ativação operacional NO_GO” e nada é gravado. Cada item precisa ser
                  resolvido ou arquivado na trilha do piloto.
                </p>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-navy/80">
                  {(dados.bloqueiosPiloto ?? []).map((b: { id: string; descricao: string }) => (
                    <li key={b.id}>{b.descricao}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {dados.podeAtivar && !ativo ? (
                <AcaoOperacional
                  rotulo={pronto ? "Ativar caso" : "Ativar mesmo com pendências"}
                  capacidade="avancar_caso_planejador_tarefa"
                  pendenciaGate={
                    pronto
                      ? null
                      : `Checklist incompleto: ${(bloqueiosReais ?? []).map((b: { motivo: string }) => b.motivo).join("; ") || "requisitos pendentes"}`
                  }
                  efeito="Ativa o caso operacional. Pendências do checklist permanecem visíveis e auditadas."
                  onConfirmar={(motivo) => mAtivar.mutate(motivo)}
                />
              ) : null}
              {!ativo && !pronto && dados.podeAtivar ? (
                <p className="text-xs text-navy/55">
                  Pendências do checklist informam — para a proprietária não impedem. O botão acima
                  registra a decisão. Isso não vale para o portão do piloto acima, quando houver:
                  aquele é do banco e recusa a gravação.
                </p>
              ) : null}
              {dados.podeAtivar && ativo ? (
                <button
                  onClick={() => setSuspendendo(true)}
                  className="rounded-md border border-terracotta/40 px-3 py-1.5 text-sm text-terracotta hover:bg-terracotta/5"
                >
                  Suspender caso
                </button>
              ) : null}
              {!dados.podeAtivar ? (
                <p className="text-xs text-navy/55">
                  Seu papel não autoriza ativação. Apenas admin ou operações podem ativar um caso.
                </p>
              ) : null}
            </div>
          </CaCard>

          <CaCard>
            <h2 className="font-serif text-lg text-navy">Checklist de onboarding</h2>
            <p className="mb-3 mt-1 text-xs text-navy/50">
              Esta tabela existe há semanas e é lida pelo banco (trg_caso_ativo_guard) e pela lista
              de bloqueios acima, mas nenhuma tela permitia completá-la — os itens abaixo ficaram
              "pendente" desde a criação do caso, mesmo quando o dado real já existia. Concluir ou
              marcar não aplicável exige registrar a evidência real; não é um clique vazio.
            </p>
            <ul className="divide-y divide-navy/10">
              {checklistOnboarding.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-wrap items-start justify-between gap-3 py-2.5"
                >
                  <div className="min-w-[200px]">
                    <p className="text-sm font-medium text-navy">{item.label}</p>
                    {item.item_code === ITEM_CODE_D7 ? (
                      <p className="mt-0.5 text-xs text-navy/60" data-d7-derivado>
                        Segue a micro-entrega real do caso (Ops). Para criar ou reconciliar, use o
                        Caso 360, aba Onboarding — “Criar ou reconciliar micro-entrega D7”.
                      </p>
                    ) : null}
                    {item.observacao ? (
                      <p className="mt-0.5 whitespace-pre-line text-xs text-navy/55">
                        {item.observacao}
                      </p>
                    ) : null}
                    {item.concluido_em ? (
                      <p className="text-xs text-navy/50">
                        {new Date(item.concluido_em).toLocaleString("pt-BR")}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${
                        item.status === "concluido"
                          ? "bg-emerald-100 text-emerald-800"
                          : item.status === "nao_aplicavel"
                            ? "bg-navy/10 text-navy/60"
                            : "bg-terracotta/10 text-terracotta"
                      }`}
                    >
                      {item.status === "concluido"
                        ? "Concluído"
                        : item.status === "nao_aplicavel"
                          ? "Não aplicável"
                          : "Pendente"}
                    </span>
                    {item.status !== "concluido" && item.item_code !== ITEM_CODE_D7 ? (
                      <button
                        onClick={() => {
                          setItemOnboardingDe({
                            id: item.id,
                            label: item.label,
                            status: "concluido",
                          });
                          setEvidenciaOnboarding("");
                        }}
                        className="rounded-md border border-navy/15 px-2 py-1 text-xs text-navy/70 hover:bg-navy/5"
                      >
                        Concluir
                      </button>
                    ) : null}
                    {item.status !== "nao_aplicavel" ? (
                      <button
                        onClick={() => {
                          setItemOnboardingDe({
                            id: item.id,
                            label: item.label,
                            status: "nao_aplicavel",
                          });
                          setEvidenciaOnboarding("");
                        }}
                        className="rounded-md border border-navy/15 px-2 py-1 text-xs text-navy/60 hover:bg-navy/5"
                      >
                        Não aplicável
                      </button>
                    ) : null}
                    {item.status !== "pendente" && item.item_code !== ITEM_CODE_D7 ? (
                      <button
                        onClick={() =>
                          mAtualizarOnboarding.mutate({ itemId: item.id, status: "pendente" })
                        }
                        className="rounded-md border border-navy/15 px-2 py-1 text-xs text-navy/60 hover:bg-navy/5"
                      >
                        Reverter
                      </button>
                    ) : null}
                  </div>
                </li>
              ))}
              {!checklistOnboarding.length ? (
                <li className="py-2.5 text-sm text-navy/55">
                  Nenhum item de onboarding para este caso.
                </li>
              ) : null}
            </ul>
          </CaCard>

          <CaCard>
            <h2 className="mb-3 font-serif text-lg text-navy">Linha do tempo do onboarding</h2>
            <ol className="space-y-3">
              <li className="border-l-2 border-gold/60 pl-3">
                <p className="text-xs text-navy/55">
                  {caso["created_at"]
                    ? new Date(String(caso["created_at"])).toLocaleString("pt-BR")
                    : "—"}
                </p>
                <p className="text-sm text-navy">Caso criado</p>
              </li>
              {dados.timeline.map((e) => (
                <li key={e.id} className="border-l-2 border-navy/15 pl-3">
                  <p className="text-xs text-navy/55">
                    {new Date(e.quando).toLocaleString("pt-BR")}
                  </p>
                  <p className="text-sm text-navy">
                    {e.acao} — {e.detalhe}
                  </p>
                </li>
              ))}
            </ol>
          </CaCard>
        </div>
      ) : null}

      {isencaoDe ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-cream/40 p-4">
            <h3 className="text-sm font-semibold text-navy">
              Autorizar isenção — {isencaoDe.label}
            </h3>
            <p className="mt-1 text-xs text-navy/60">
              A isenção é registrada com motivo, admin autorizador, data/hora e expiração opcional.
            </p>
            <label className="mt-3 block text-xs text-navy/70">Motivo (opcional)</label>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="mt-1 w-full rounded-md border border-navy/15 px-2 py-1 text-sm"
              rows={3}
            />
            <label className="mt-3 block text-xs text-navy/70">Expiração (opcional)</label>
            <input
              type="date"
              value={expira}
              onChange={(e) => setExpira(e.target.value)}
              className="mt-1 w-full rounded-md border border-navy/15 px-2 py-1 text-sm"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setIsencaoDe(null)}
                className="rounded-md border border-navy/15 px-3 py-1.5 text-xs text-navy/70"
              >
                Cancelar
              </button>
              <button
                disabled={mAtualizar.isPending}
                onClick={() => {
                  mAtualizar.mutate({
                    checkId: isencaoDe.id,
                    status: "isento",
                    isencaoMotivo: motivo,
                    isencaoExpiraEm: expira || null,
                  });
                  setIsencaoDe(null);
                }}
                className="rounded-md bg-navy px-3 py-1.5 text-xs text-cream disabled:opacity-40"
              >
                Autorizar
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {itemOnboardingDe ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-cream/40 p-4">
            <h3 className="text-sm font-semibold text-navy">
              {itemOnboardingDe.status === "concluido" ? "Concluir" : "Marcar não aplicável"} —{" "}
              {itemOnboardingDe.label}
            </h3>
            <p className="mt-1 text-xs text-navy/60">
              Registre a evidência real que sustenta isto — o que foi verificado, onde e quando. Não
              é permitido marcar sem essa evidência.
            </p>
            <textarea
              value={evidenciaOnboarding}
              onChange={(e) => setEvidenciaOnboarding(e.target.value)}
              className="mt-3 w-full rounded-md border border-navy/15 px-2 py-1 text-sm"
              rows={3}
              placeholder="Ex.: contrato assinado em 05/09 (2026-CB-0001); responsável já definido em crm_casos.responsavel_id"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setItemOnboardingDe(null)}
                className="rounded-md border border-navy/15 px-3 py-1.5 text-xs text-navy/70"
              >
                Cancelar
              </button>
              <button
                disabled={mAtualizarOnboarding.isPending || !evidenciaOnboarding.trim()}
                onClick={() => {
                  mAtualizarOnboarding.mutate({
                    itemId: itemOnboardingDe.id,
                    status: itemOnboardingDe.status,
                    observacao: evidenciaOnboarding,
                  });
                  setItemOnboardingDe(null);
                }}
                className="rounded-md bg-navy px-3 py-1.5 text-xs text-cream disabled:opacity-40"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {suspendendo ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-cream/40 p-4">
            <h3 className="text-sm font-semibold text-navy">Suspender caso</h3>
            <p className="mt-1 text-xs text-navy/60">
              O motivo é obrigatório e uma tarefa de revisão será criada para o responsável.
            </p>
            <textarea
              value={motivoSuspensao}
              onChange={(e) => setMotivoSuspensao(e.target.value)}
              className="mt-3 w-full rounded-md border border-navy/15 px-2 py-1 text-sm"
              rows={3}
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setSuspendendo(false)}
                className="rounded-md border border-navy/15 px-3 py-1.5 text-xs text-navy/70"
              >
                Cancelar
              </button>
              <button
                disabled={mSuspender.isPending}
                onClick={() => mSuspender.mutate()}
                className="rounded-md bg-terracotta px-3 py-1.5 text-xs text-cream disabled:opacity-40"
              >
                Suspender
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </SaasShell>
  );
}
