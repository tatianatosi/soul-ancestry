import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { AcaoOperacional } from "@/components/saas/acao-operacional";
import {
  agruparBloqueiosPorGate,
  estadoDoCampo,
  primeiroGatePendente,
  requisitoDoBloqueio,
} from "@/lib/gates-piloto";
import {
  criarPesquisaPiloto,
  liberarPortalPiloto,
  painelPiloto,
  salvarDadoPiloto,
  verificarDadoPiloto,
} from "@/lib/piloto.functions";
import {
  carregarPilotoAna,
  definirIdCanonicoPiloto,
  materializarPilotoAna,
} from "@/lib/piloto-ana.functions";
import { ativarCaso } from "@/lib/saas.functions";
import { useAvisoEdicaoNaoSalva } from "@/lib/aviso-edicao-nao-salva";

/* eslint-disable @typescript-eslint/no-explicit-any */

const ORIGENS: { id: string; rotulo: string }[] = [
  { id: "documento", rotulo: "Documento" },
  { id: "proposta_aprovada", rotulo: "Proposta aprovada" },
  { id: "formulario", rotulo: "Formulário validado" },
  { id: "preenchimento_humano", rotulo: "Preenchimento humano" },
  { id: "whatsapp_confirmado", rotulo: "WhatsApp (fonte bruta)" },
  { id: "reuniao_transcricao", rotulo: "Reunião/transcrição (fonte bruta)" },
];

const TOM: Record<string, string> = {
  ok: "text-emerald-700",
  alerta: "text-amber-700",
  erro: "text-terracotta",
};

/**
 * Conferência do caso (antigo "piloto"), dentro do Caso 360 (religação de
 * 31/10/2026). O piloto deixou de ser uma tela e uma camada de ativação à
 * parte: aqui ele é um cartão do caso ESCOLHIDO, que mostra e grava no
 * próprio caso — pendências derivadas, gates, dados conferidos com origem,
 * núcleo, ID canônico, pesquisa, liberação do portal e ativação. Bloqueio do
 * piloto não vira trava de ativação: a ativação segue só o caminho único
 * `ativarCasoComChecks`.
 */
export function ConferenciaPilotoCaso({ caseId }: { caseId: string }) {
  const qc = useQueryClient();
  const lerPainel = useServerFn(painelPiloto);
  const lerAna = useServerFn(carregarPilotoAna);
  const salvarDado = useServerFn(salvarDadoPiloto);
  const verificarDado = useServerFn(verificarDadoPiloto);
  const criarPesquisa = useServerFn(criarPesquisaPiloto);
  const liberarPortal = useServerFn(liberarPortalPiloto);
  const materializar = useServerFn(materializarPilotoAna);
  const definirCanonico = useServerFn(definirIdCanonicoPiloto);
  const ativar = useServerFn(ativarCaso);

  const painel = useQuery({
    queryKey: ["painel-piloto", caseId],
    queryFn: () => lerPainel({ data: { caseId } }),
  });
  const ana = useQuery({
    queryKey: ["piloto-ana", caseId],
    queryFn: () => lerAna({ data: { caseId } }),
  });

  const recarregar = () => {
    void qc.invalidateQueries({ queryKey: ["painel-piloto", caseId] });
    void qc.invalidateQueries({ queryKey: ["piloto-ana", caseId] });
  };
  const aoFalhar = (e: unknown) =>
    toast.error(e instanceof Error ? e.message : "Não foi possível concluir.");

  const [edicao, setEdicao] = useState<Record<string, { valor: string; origem: string }>>({});
  const [idCanonico, setIdCanonico] = useState("");
  const [decididoPor, setDecididoPor] = useState("");
  const [pendenciasAtivacao, setPendenciasAtivacao] = useState<string[]>([]);
  /* F5 / sair da linha: trava a saída com edição pendente. */
  useAvisoEdicaoNaoSalva(Object.keys(edicao).length > 0 || idCanonico !== "" || decididoPor.trim() !== "");

  const gravarDado = useMutation({
    mutationFn: (v: { id: string; valor: string; origem: string }) => salvarDado({ data: v }),
    onSuccess: () => {
      toast.success("Dado conferido registrado com origem.");
      recarregar();
    },
    onError: aoFalhar,
  });
  const verificar = useMutation({
    mutationFn: (v: { id: string; verificado: boolean }) => verificarDado({ data: v }),
    onSuccess: recarregar,
    onError: aoFalhar,
  });
  const gerarPesquisa = useMutation({
    mutationFn: () => criarPesquisa({ data: { caseId } }),
    onSuccess: (r) => {
      toast.success(r.jaExistia ? "A pesquisa deste caso já existia." : "Pesquisa do caso criada.");
      recarregar();
    },
    onError: aoFalhar,
  });
  const portal = useMutation({
    mutationFn: (liberar: boolean) => liberarPortal({ data: { caseId, liberar } }),
    onSuccess: (_r, liberar) => {
      toast.success(
        liberar ? "Portal liberado para este caso." : "Portal bloqueado para este caso.",
      );
      recarregar();
    },
    onError: aoFalhar,
  });
  const criarNucleo = useMutation({
    mutationFn: () => materializar({ data: { caseId } }),
    onSuccess: () => {
      toast.success("Núcleo do caso materializado internamente.");
      recarregar();
    },
    onError: aoFalhar,
  });
  const decidirCanonico = useMutation({
    mutationFn: () =>
      definirCanonico({ data: { caseId, idCanonico, decididoPor: decididoPor.trim() } }),
    onSuccess: () => {
      toast.success("ID canônico decidido.");
      setIdCanonico("");
      setDecididoPor("");
      recarregar();
      void qc.invalidateQueries({ queryKey: ["caso", caseId] });
    },
    onError: aoFalhar,
  });
  const ativarOCaso = useMutation({
    mutationFn: (motivo: string) =>
      ativar({ data: { id: caseId, motivoOverride: motivo || null } }),
    onSuccess: (r: any) => {
      setPendenciasAtivacao(r.pendencias ?? []);
      if (r.ok) {
        toast.success("Caso ativado.");
        recarregar();
        void qc.invalidateQueries({ queryKey: ["caso", caseId] });
      } else {
        toast.error("A ativação foi recusada — veja as pendências.");
      }
    },
    onError: aoFalhar,
  });

  const caso = (painel.data?.caso ?? null) as Record<string, any> | null;
  const campos = (painel.data?.campos ?? []) as Record<string, any>[];
  const grupos = agruparBloqueiosPorGate((painel.data?.bloqueios ?? []) as Record<string, any>[]);
  const gatePendente = primeiroGatePendente(grupos);
  const pendencias = ana.data?.pendencias ?? [];
  const membros = (ana.data?.membros ?? []) as Record<string, any>[];
  const identificadores = caso
    ? [
        String(caso["codigo"] ?? ""),
        ...(((caso["ids_historicos"] as string[] | null) ?? []) as string[]),
      ].filter(Boolean)
    : [];
  const acesso = String(caso?.["app_access_status"] ?? "bloqueado");

  if (painel.isLoading || ana.isLoading) {
    return <p className="text-xs text-navy/60">Carregando a conferência do caso…</p>;
  }
  if (painel.error || ana.error) {
    const e = (painel.error ?? ana.error) as unknown;
    return (
      <p className="text-xs text-terracotta">
        Não foi possível ler a conferência do caso:{" "}
        {e instanceof Error ? e.message : "erro desconhecido"}
      </p>
    );
  }
  if (!caso) {
    return <p className="text-xs text-navy/60">Caso não encontrado nesta organização.</p>;
  }

  return (
    <section
      data-conferencia-piloto
      className="space-y-4 rounded-lg border border-navy/10 bg-white p-4"
    >
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-serif text-lg text-navy">Conferência do caso</h3>
        <p className="text-xs text-navy/60">
          {gatePendente
            ? `Próximo gate: ${gatePendente.gate.nome}`
            : "Nenhum bloqueio aberto nos gates"}
        </p>
      </header>

      <div data-piloto-pendencias>
        <p className="text-[11px] font-medium uppercase tracking-wide text-navy/60">
          Pendências derivadas do caso
        </p>
        {pendencias.length === 0 ? (
          <p className="mt-1 text-xs text-navy/60">Nenhuma pendência derivada.</p>
        ) : (
          <ul className="mt-1 space-y-1 text-xs text-navy">
            {pendencias.map((p) => (
              <li key={p.codigo}>
                {p.descricao} <span className="text-navy/50">({p.estadoAtual})</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div data-piloto-gates>
        <p className="text-[11px] font-medium uppercase tracking-wide text-navy/60">
          Gates e bloqueios
        </p>
        {grupos.every((g) => g.total === 0) ? (
          <p className="mt-1 text-xs text-navy/60">Nenhum bloqueio registrado para este caso.</p>
        ) : (
          <ul className="mt-1 space-y-1.5 text-xs text-navy">
            {grupos
              .filter((g) => g.total > 0)
              .map((g) => (
                <li key={g.gate.codigo}>
                  <strong>{g.gate.nome}</strong> — {g.abertos} aberto(s) de {g.total}
                  {!g.liberado ? (
                    <span className="text-navy/50"> · aguarda o gate anterior</span>
                  ) : null}
                  <ul className="ml-4 list-disc text-navy/70">
                    {g.itens
                      .filter((i) => i.bloqueio["status"] === "aberto")
                      .map((i) => (
                        <li key={String(i.bloqueio["id"])}>
                          {String(i.bloqueio["chave"])} —{" "}
                          {requisitoDoBloqueio(String(i.bloqueio["chave"])).evidencia}
                        </li>
                      ))}
                  </ul>
                </li>
              ))}
          </ul>
        )}
      </div>

      <div data-piloto-campos>
        <p className="text-[11px] font-medium uppercase tracking-wide text-navy/60">
          Dados conferidos (com origem)
        </p>
        {campos.length === 0 ? (
          <p className="mt-1 text-xs text-navy/60">
            Nenhum dado de conferência registrado para este caso.
          </p>
        ) : (
          <ul className="mt-1 space-y-2">
            {campos.map((c) => {
              const id = String(c["id"]);
              const estado = estadoDoCampo(c);
              const atual = edicao[id] ?? {
                valor: String(c["valor"] ?? ""),
                origem: String(c["origem"] ?? "documento"),
              };
              return (
                <li key={id} className="rounded border border-navy/10 p-2 text-xs">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-navy">
                      <strong>{String(c["campo"])}</strong>{" "}
                      <span className="text-navy/50">· {String(c["secao"])}</span>
                    </span>
                    <span className={TOM[estado.tom]}>{estado.rotulo}</span>
                  </div>
                  {estado.nota ? <p className="mt-1 text-navy/60">{estado.nota}</p> : null}
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    <input
                      aria-label={`Valor de ${String(c["campo"])}`}
                      value={atual.valor}
                      onChange={(e) =>
                        setEdicao((s) => ({ ...s, [id]: { ...atual, valor: e.target.value } }))
                      }
                      className="min-w-[10rem] flex-1 rounded border border-navy/20 px-2 py-1"
                    />
                    <select
                      aria-label={`Origem de ${String(c["campo"])}`}
                      value={atual.origem}
                      onChange={(e) =>
                        setEdicao((s) => ({ ...s, [id]: { ...atual, origem: e.target.value } }))
                      }
                      className="rounded border border-navy/20 px-2 py-1"
                    >
                      {ORIGENS.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.rotulo}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      disabled={gravarDado.isPending}
                      onClick={() =>
                        gravarDado.mutate({ id, valor: atual.valor, origem: atual.origem })
                      }
                      className="rounded border border-navy/20 px-2 py-1 text-navy hover:bg-cream/60 disabled:opacity-40"
                    >
                      Salvar
                    </button>
                    <button
                      type="button"
                      disabled={verificar.isPending || !c["valor"]}
                      onClick={() => verificar.mutate({ id, verificado: !c["verificado"] })}
                      className="rounded border border-navy/20 px-2 py-1 text-navy hover:bg-cream/60 disabled:opacity-40"
                    >
                      {c["verificado"] ? "Desfazer verificação" : "Marcar como verificado"}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div data-piloto-nucleo className="text-xs text-navy">
        <p className="text-[11px] font-medium uppercase tracking-wide text-navy/60">
          Núcleo do caso
        </p>
        <p className="mt-1">
          {membros.length === 0
            ? "Nenhum participante no núcleo deste caso."
            : membros.map((m) => String(m["nome"])).join(" · ")}
        </p>
        <button
          type="button"
          disabled={criarNucleo.isPending}
          onClick={() => criarNucleo.mutate()}
          className="mt-1.5 rounded border border-navy/20 px-2 py-1 text-navy hover:bg-cream/60 disabled:opacity-40"
        >
          {ana.data?.nucleos?.length ? "Completar núcleo do caso" : "Materializar núcleo do caso"}
        </button>
      </div>

      <div data-piloto-canonico className="text-xs text-navy">
        <p className="text-[11px] font-medium uppercase tracking-wide text-navy/60">
          Identificador canônico
        </p>
        {caso["id_canonico_decidido"] ? (
          <p className="mt-1">
            Decidido: <strong>{String(caso["id_canonico_decidido"])}</strong>
          </p>
        ) : (
          <div className="mt-1.5 flex flex-wrap gap-2">
            <select
              aria-label="Identificador canônico"
              value={idCanonico}
              onChange={(e) => setIdCanonico(e.target.value)}
              className="rounded border border-navy/20 px-2 py-1"
            >
              <option value="">Escolher entre os identificadores do caso</option>
              {identificadores.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
            <input
              aria-label="Decidido por"
              placeholder="Decidido por"
              value={decididoPor}
              onChange={(e) => setDecididoPor(e.target.value)}
              className="rounded border border-navy/20 px-2 py-1"
            />
            <button
              type="button"
              disabled={!idCanonico || decididoPor.trim().length < 3 || decidirCanonico.isPending}
              onClick={() => decidirCanonico.mutate()}
              className="rounded border border-navy/20 px-2 py-1 text-navy hover:bg-cream/60 disabled:opacity-40"
            >
              Decidir
            </button>
          </div>
        )}
      </div>

      <div data-piloto-pesquisa className="text-xs text-navy">
        <p className="text-[11px] font-medium uppercase tracking-wide text-navy/60">
          Pesquisa do caso
        </p>
        {painel.data?.pesquisa ? (
          <p className="mt-1">
            Pesquisa criada · situação {String((painel.data.pesquisa as any).status)}.
          </p>
        ) : (
          <button
            type="button"
            disabled={gerarPesquisa.isPending}
            onClick={() => gerarPesquisa.mutate()}
            className="mt-1.5 rounded border border-navy/20 px-2 py-1 text-navy hover:bg-cream/60 disabled:opacity-40"
          >
            Criar pesquisa do caso
          </button>
        )}
      </div>

      <div data-piloto-portal className="text-xs text-navy">
        <p className="text-[11px] font-medium uppercase tracking-wide text-navy/60">
          Portal do cliente
        </p>
        <p className="mt-1">
          Acesso do cliente a este caso: <strong>{acesso}</strong>.
        </p>
        <AcaoOperacional
          rotulo={acesso === "liberado" ? "Bloquear portal" : "Liberar portal"}
          acaoExterna="publicar_no_app_cliente"
          efeito={
            acesso === "liberado"
              ? "Bloqueia o acesso do cliente ao App deste caso."
              : "Libera o acesso do cliente ao App deste caso. Ação humana explícita."
          }
          className="mt-1.5"
          onConfirmar={() => portal.mutate(acesso !== "liberado")}
        />
      </div>

      <div data-piloto-ativacao className="text-xs text-navy">
        <p className="text-[11px] font-medium uppercase tracking-wide text-navy/60">
          Ativação do caso
        </p>
        <p className="mt-1">
          A ativação segue o caminho único de checagens reais (papel, bloqueios por trilha e decisão
          da proprietária).
        </p>
        {pendenciasAtivacao.length > 0 ? (
          <ul className="mt-1 list-disc pl-4 text-terracotta">
            {pendenciasAtivacao.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        ) : null}
        <AcaoOperacional
          rotulo="Ativar caso"
          efeito="Leva o caso até o estado ativo se as checagens reais permitirem; recusa e lista as pendências se não."
          className="mt-1.5"
          onConfirmar={(motivo) => ativarOCaso.mutate(motivo)}
        />
      </div>
    </section>
  );
}
