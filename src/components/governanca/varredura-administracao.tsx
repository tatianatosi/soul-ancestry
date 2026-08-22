"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import {
  BLOQUEIOS_REMANESCENTES,
  CONFIRMACOES_EXTERNAS,
  MAPA_ADMINISTRADORAS,
  REGRAS_ADMINISTRACAO,
  REGRA_AUTONOMIA,
  PACOTE_APROVACOES,
  ROTULO_GRUPO_APROVACAO,
  ROTULO_REVERSIBILIDADE,
  confirmacaoExternaObrigatoria,
  derivarAcaoPacote,
  resumoConfirmacaoPacote,
  type LinhaAprovacao,
} from "@/lib/varredura-administracao";
import { registrarDecisaoProprietaria, confirmarAcaoExterna } from "@/lib/modo-proprietaria.functions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AVISO_IRREVERSIVEL } from "@/lib/modo-proprietaria";

export function VarreduraAdministracao() {
  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-navy/10 bg-white p-4">
        <h2 className="font-serif text-lg text-navy">Regra de autonomia interna</h2>
        <p className="mt-1 text-sm text-navy/70">{REGRA_AUTONOMIA.enunciado}</p>
        <ul className="mt-3 grid gap-1 text-xs text-navy/60 sm:grid-cols-2">
          {REGRA_AUTONOMIA.acoesInternas.map((a) => (
            <li key={a}>• {a}</li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-navy/50">
          Todo override registra: {REGRA_AUTONOMIA.camposObrigatoriosDoOverride.join(" · ")}. Estado preparatório máximo:{" "}
          <span className="font-medium text-navy">{REGRA_AUTONOMIA.estadoPreparatorio}</span>.
        </p>
      </section>

      <section>
        <h2 className="mb-2 font-serif text-lg text-navy">Bloqueios remanescentes mapeados</h2>
        <div className="grid gap-3 lg:grid-cols-2">
          {BLOQUEIOS_REMANESCENTES.map((b) => (
            <article key={b.id} className="rounded-xl border border-navy/10 bg-white p-4 text-xs text-navy/70">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-medium text-navy">
                  {b.id} · {b.modulo}
                </p>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide ${
                    b.natureza === "interno"
                      ? "border-navy/20 text-navy/60"
                      : "border-terracotta/40 text-terracotta"
                  }`}
                >
                  {b.natureza === "interno" ? "bloqueio interno" : "efeito externo irreversível"}
                </span>
              </div>
              <dl className="mt-2 space-y-1">
                <p>
                  <span className="text-navy/45">Rota:</span> {b.rota} · <span className="text-navy/45">Entidade:</span>{" "}
                  {b.entidade}
                </p>
                <p>
                  <span className="text-navy/45">Ação:</span> {b.acao}
                </p>
                <p>
                  <span className="text-navy/45">Regra/gate:</span> {b.regra}
                </p>
                <p>
                  <span className="text-navy/45">Superável por decisão auditada:</span>{" "}
                  {b.superavelPorDecisao ? "sim" : "não"}
                </p>
                <p>
                  <span className="text-navy/45">Estado máximo interno:</span> {b.estadoMaximoInterno}
                </p>
                <p>
                  <span className="text-navy/45">Confirmação externa:</span> {b.confirmacaoExterna ?? "não aplicável"}
                </p>
                <p>
                  <span className="text-navy/45">Arquivo:</span> {b.arquivo}
                </p>
                <p>
                  <span className="text-navy/45">Risco:</span> {b.risco}
                </p>
                <p>
                  <span className="text-navy/45">Teste:</span> {b.teste}
                </p>
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-terracotta/30 bg-terracotta/5 p-4">
        <h2 className="font-serif text-lg text-navy">Confirmação externa obrigatória</h2>
        <ul className="mt-2 space-y-1 text-xs text-navy/70">
          {CONFIRMACOES_EXTERNAS.map((c) => (
            <li key={c.id}>• {c.rotulo}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-2 font-serif text-lg text-navy">Mapa de administradoras (proposto, não aplicado)</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {MAPA_ADMINISTRADORAS.map((a) => (
            <div key={a.email} className="rounded-xl border border-navy/10 bg-white p-4 text-xs text-navy/70">
              <p className="font-medium text-navy">{a.email}</p>
              <p className="mt-1">Papel: {a.papel}</p>
              <p>Tipo: {a.tipo}</p>
              <p>Escopo: {a.escopo}</p>
              <p className="mt-1 text-navy/60">{a.descricao}</p>
              <p className="mt-2 rounded border border-navy/15 px-2 py-0.5 text-[10px] uppercase tracking-wide text-navy/55">
                estado: {a.estado}
              </p>
            </div>
          ))}
        </div>
        <ul className="mt-3 space-y-1 text-xs text-navy/60">
          {REGRAS_ADMINISTRACAO.map((r) => (
            <li key={r}>• {r}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-2 font-serif text-lg text-navy">Tabela única de aprovações pendentes</h2>
        <p className="mb-3 text-xs text-navy/60">
          Cada linha exibe a prévia, a reversibilidade e a confirmação necessária. Aprovar aqui apenas registra a decisão
          auditada; nenhuma ação externa, envio, cobrança, migration ou publicação é executada por esta tela.
        </p>
        <TabelaAprovacoesPendentes />
      </section>
    </div>
  );
}

function TabelaAprovacoesPendentes() {
  const registrar = useServerFn(registrarDecisaoProprietaria);
  const confirmar = useServerFn(confirmarAcaoExterna);

  const [linhaPrevia, setLinhaPrevia] = useState<LinhaAprovacao | null>(null);
  const [linhaConfirmacao, setLinhaConfirmacao] = useState<LinhaAprovacao | null>(null);
  const [motivo, setMotivo] = useState("");
  const [erros, setErros] = useState<string[]>([]);
  const [ok, setOk] = useState<string | null>(null);

  const mInterna = useMutation({
    mutationFn: async (linha: LinhaAprovacao) => {
      const { acao, entidade, modulo } = resumoConfirmacaoPacote(linha, motivo);
      return registrar({
        data: {
          acao,
          entidade,
          entidade_id: linha.id,
          modulo,
          motivo,
          impacto: linha.impacto,
          fonte: "tabela_unica_aprovacoes_pendentes",
          dados_teste: false,
        },
      });
    },
    onSuccess: (r: any) => {
      setErros(r?.erros ?? []);
      if (r?.registrado) {
        setOk("Aprovação interna registrada com auditoria.");
        setLinhaConfirmacao(null);
        setMotivo("");
      }
    },
    onError: (e: any) => setErros([String(e?.message ?? "Não foi possível registrar a aprovação.")]),
  });

  const mExterna = useMutation({
    mutationFn: async (linha: LinhaAprovacao) => {
      const resumo = resumoConfirmacaoPacote(linha, motivo);
      return confirmar({
        data: {
          acao: resumo.acao,
          modulo: resumo.modulo,
          entidade: resumo.entidade,
          entidade_id: resumo.entidade_id,
          destinatario: resumo.destinatario,
          conteudo: resumo.conteudo,
          valor: null,
          caso: resumo.caso,
          anexos: resumo.anexos,
          impacto: resumo.impacto,
          dados_enviados: resumo.dados_enviados,
          motivo,
          confirmacao_manual: true,
          dados_teste: false,
        },
      });
    },
    onSuccess: (r: any) => {
      setErros([]);
      if (r?.confirmada) {
        setOk("Confirmação externa/irreversível registrada. A execução real ocorre fora desta tela, com confirmação manual.");
        setLinhaConfirmacao(null);
        setMotivo("");
      }
    },
    onError: (e: any) => setErros([String(e?.message ?? "Não foi possível registrar a confirmação.")]),
  });

  const abrirConfirmacao = (linha: LinhaAprovacao) => {
    setLinhaConfirmacao(linha);
    setLinhaPrevia(null);
    setMotivo("");
    setErros([]);
    setOk(null);
  };

  const submit = () => {
    setErros([]);
    setOk(null);
    if (!linhaConfirmacao) return;
    if (motivo.trim().length < 10) {
      setErros(["Motivo obrigatório com pelo menos 10 caracteres."])
      return;
    }
    if (confirmacaoExternaObrigatoria(linhaConfirmacao)) {
      mExterna.mutate(linhaConfirmacao);
    } else {
      mInterna.mutate(linhaConfirmacao);
    }
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-navy/10 bg-white p-4">
      <table className="w-full min-w-[1100px] text-left text-xs text-navy/70">
        <thead className="text-navy/45">
          <tr>
            <th className="py-2 pr-3">ID</th>
            <th className="py-2 pr-3">Grupo</th>
            <th className="py-2 pr-3">Alvo</th>
            <th className="py-2 pr-3">Impacto</th>
            <th className="py-2 pr-3">Dados envolvidos</th>
            <th className="py-2 pr-3">Reversibilidade</th>
            <th className="py-2 pr-3">Prévia</th>
            <th className="py-2 pr-3">Motivo</th>
            <th className="py-2 pr-3">Confirmação necessária</th>
            <th className="py-2">Ação</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-navy/5">
          {PACOTE_APROVACOES.map((l) => (
            <tr key={l.id}>
              <td className="py-2 pr-3 font-medium text-navy">{l.id}</td>
              <td className="py-2 pr-3">{ROTULO_GRUPO_APROVACAO[l.grupo]}</td>
              <td className="py-2 pr-3 text-navy">{l.alvo}</td>
              <td className="py-2 pr-3">{l.impacto}</td>
              <td className="py-2 pr-3">{l.dadosEnvolvidos}</td>
              <td className="py-2 pr-3">
                <ReversibilidadeBadge valor={l.reversibilidade} />
              </td>
              <td className="py-2 pr-3">
                <div className="max-w-[220px]">
                  <p className="truncate" title={l.previa}>
                    {l.previa}
                  </p>
                  <button
                    onClick={() => setLinhaPrevia(l)}
                    className="mt-1 text-gold underline hover:text-gold/80"
                  >
                    Ver prévia
                  </button>
                </div>
              </td>
              <td className="py-2 pr-3">
                <div className="max-w-[200px] truncate" title={l.motivo}>
                  {l.motivo}
                </div>
              </td>
              <td className="py-2 pr-3">
                <div className="max-w-[200px] truncate" title={l.confirmacao}>
                  {l.confirmacao}
                </div>
              </td>
              <td className="py-2">
                <Button size="sm" variant={confirmacaoExternaObrigatoria(l) ? "destructive" : "default"} onClick={() => abrirConfirmacao(l)}>
                  {confirmacaoExternaObrigatoria(l) ? "Confirmar" : "Assumir"}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Dialog open={!!linhaConfirmacao} onOpenChange={(open) => !open && setLinhaConfirmacao(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-navy">
              {linhaConfirmacao ? derivarAcaoPacote(linhaConfirmacao).rotulo : "Aprovação"}
            </DialogTitle>
            <DialogDescription>
              {linhaConfirmacao ? `${linhaConfirmacao.id} · ${linhaConfirmacao.alvo}` : ""}
            </DialogDescription>
          </DialogHeader>
          {linhaConfirmacao ? (
            <div className="space-y-4 text-sm text-navy/70">
              <div className="rounded-lg border border-navy/10 bg-cream/30 p-3">
                <p>
                  <span className="text-navy/45">Impacto:</span> {linhaConfirmacao.impacto}
                </p>
                <p>
                  <span className="text-navy/45">Reversibilidade:</span>{" "}
                  {ROTULO_REVERSIBILIDADE[linhaConfirmacao.reversibilidade]}
                </p>
                <p>
                  <span className="text-navy/45">Prévia:</span> {linhaConfirmacao.previa}
                </p>
                <p>
                  <span className="text-navy/45">Confirmação necessária:</span> {linhaConfirmacao.confirmacao}
                </p>
              </div>
              {confirmacaoExternaObrigatoria(linhaConfirmacao) ? (
                <div className="rounded-lg border border-terracotta/30 bg-terracotta/5 p-3 text-terracotta">
                  <p className="font-medium">Ação externa ou irreversível</p>
                  <p className="mt-1">{AVISO_IRREVERSIVEL}</p>
                </div>
              ) : null}
              <label className="block space-y-1">
                <span className="text-navy/80">Motivo da decisão (mínimo 10 caracteres)</span>
                <Textarea
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Descreva por que esta aprovação é necessária e qual a fonte da decisão."
                />
              </label>
              {erros.length > 0 ? (
                <ul className="space-y-1 text-terracotta">
                  {erros.map((e) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              ) : null}
              {ok ? <p className="text-navy/70">{ok}</p> : null}
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinhaConfirmacao(null)}>
              Cancelar
            </Button>
            <Button
              onClick={submit}
              disabled={
                !linhaConfirmacao ||
                motivo.trim().length < 10 ||
                mInterna.isPending ||
                mExterna.isPending
              }
              variant={linhaConfirmacao && confirmacaoExternaObrigatoria(linhaConfirmacao) ? "destructive" : "default"}
            >
              {mInterna.isPending || mExterna.isPending
                ? "Registrando…"
                : linhaConfirmacao && confirmacaoExternaObrigatoria(linhaConfirmacao)
                  ? "Confirmar aprovação externa"
                  : "Assumir aprovação interna"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!linhaPrevia} onOpenChange={(open) => !open && setLinhaPrevia(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-navy">Prévia — {linhaPrevia?.id}</DialogTitle>
            <DialogDescription>{linhaPrevia?.alvo}</DialogDescription>
          </DialogHeader>
          {linhaPrevia ? (
            <div className="space-y-3 text-sm text-navy/70">
              <p>
                <span className="text-navy/45">Grupo:</span> {ROTULO_GRUPO_APROVACAO[linhaPrevia.grupo]}
              </p>
              <p>
                <span className="text-navy/45">Prévia:</span> {linhaPrevia.previa}
              </p>
              <p>
                <span className="text-navy/45">Dados envolvidos:</span> {linhaPrevia.dadosEnvolvidos}
              </p>
              <p>
                <span className="text-navy/45">Reversibilidade:</span>{" "}
                {ROTULO_REVERSIBILIDADE[linhaPrevia.reversibilidade]}
              </p>
              <p>
                <span className="text-navy/45">Confirmação necessária:</span> {linhaPrevia.confirmacao}
              </p>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinhaPrevia(null)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ReversibilidadeBadge({ valor }: { valor: "reversivel" | "parcialmente_reversivel" | "irreversivel" }) {
  const variant =
    valor === "reversivel" ? "secondary" : valor === "parcialmente_reversivel" ? "outline" : "destructive";
  return <Badge variant={variant}>{ROTULO_REVERSIBILIDADE[valor]}</Badge>;
}
