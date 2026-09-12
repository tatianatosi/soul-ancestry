import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { CalendarClock, Download, MessageSquare, Upload } from "lucide-react";

import { PortalVazio } from "@/components/portal/portal-shell";
import {
  abrirTicket,
  baixarEntrega,
  confirmarEnvioDocumento,
  meuCaso,
  prepararEnvioDocumento,
} from "@/lib/portal-cliente.functions";
import { AVISO_PUBLICACAO_CLIENTE } from "@/lib/projecoes-cliente";

const CATEGORIAS = [
  { valor: "duvida", rotulo: "Dúvida" },
  { valor: "documento", rotulo: "Documento" },
  { valor: "prazo", rotulo: "Prazo" },
  { valor: "financeiro", rotulo: "Financeiro" },
  { valor: "outro", rotulo: "Outro" },
];

function Cartao({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl border border-navy/10 bg-cream/50 p-4">{children}</div>;
}

function Selo({ texto }: { texto: string }) {
  return (
    <span className="rounded-full border border-navy/15 bg-cream px-2.5 py-0.5 text-[11px] font-medium text-navy/70">
      {texto}
    </span>
  );
}

function moeda(valor: number, m: string) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: m || "BRL" }).format(valor);
}

function data(iso?: string | null) {
  return iso ? new Date(iso).toLocaleDateString("pt-BR") : "—";
}

export function PortalCasoDetalhe({ casoId }: { casoId: string }) {
  const queryClient = useQueryClient();
  const carregar = useServerFn(meuCaso);
  const preparar = useServerFn(prepararEnvioDocumento);
  const confirmar = useServerFn(confirmarEnvioDocumento);
  const baixar = useServerFn(baixarEntrega);
  const abrir = useServerFn(abrirTicket);

  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState<string | null>(null);
  const [assunto, setAssunto] = useState("");
  const [categoria, setCategoria] = useState("duvida");
  const [mensagem, setMensagem] = useState("");
  const inputs = useRef<Record<string, HTMLInputElement | null>>({});

  const {
    data: painel,
    isLoading,
    isError: falhaLeitura,
    refetch: recarregarPainel,
  } = useQuery({
    queryKey: ["portal-caso-detalhe", casoId],
    queryFn: () => carregar({ data: { casoId } }),
  });

  const enviarArquivo = useMutation({
    mutationFn: async (params: { arquivo: File; solicitacaoId?: string | null; titulo: string }) => {
      const pronto = await preparar({
        data: { casoId, nome: params.arquivo.name, tamanho: params.arquivo.size },
      });
      const resposta = await fetch(pronto.url, { method: "PUT", body: params.arquivo });
      if (!resposta.ok) throw new Error("Falha no envio do arquivo. Tente novamente.");
      await confirmar({
        data: {
          casoId,
          solicitacaoId: params.solicitacaoId ?? null,
          titulo: params.titulo,
          caminho: pronto.caminho,
          nomeArquivo: params.arquivo.name,
          tamanho: params.arquivo.size,
        },
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["portal-caso-detalhe", casoId] }),
    onError: (e: Error) => setErro(e.message),
    onSettled: () => setEnviando(null),
  });

  const novoTicket = useMutation({
    mutationFn: () => abrir({ data: { casoId, assunto, categoria, mensagem } }),
    onSuccess: () => {
      setAssunto("");
      setMensagem("");
      queryClient.invalidateQueries({ queryKey: ["portal-caso-detalhe", casoId] });
    },
    onError: (e: Error) => setErro(e.message),
  });

  async function baixarDocumento(id: string) {
    setErro(null);
    try {
      const r = await baixar({ data: { documentoId: id } });
      window.open(r.url, "_blank", "noopener");
    } catch (e) {
      setErro((e as Error).message);
    }
  }

  if (isLoading) return <PortalVazio mensagem="Carregando…" />;
  if (falhaLeitura)
    return (
      <p className="flex flex-wrap items-center gap-2 rounded-lg border border-terracotta/40 bg-terracotta/10 px-3 py-2 text-sm text-terracotta">
        Não conseguimos abrir o seu acompanhamento agora. Nada foi perdido.
        <button
          type="button"
          onClick={() => void recarregarPainel()}
          className="rounded-md border border-terracotta/50 px-2 py-0.5 text-xs font-medium text-terracotta"
        >
          Tentar novamente
        </button>
      </p>
    );
  if (!painel) return <PortalVazio mensagem="Este caso não está disponível para o seu acesso." />;

  return (
    <div className="space-y-8">
      {erro ? (
        <p className="rounded-lg border border-terracotta/40 bg-terracotta/10 px-3 py-2 text-sm text-terracotta">
          {erro}
        </p>
      ) : null}

      <Cartao>
        <p className="text-xs uppercase tracking-wide text-navy/50">Situação</p>
        <p className="mt-1 font-serif text-xl">{painel.caso.statusRotulo}</p>
        <p className="mt-1 text-sm text-navy/70">{painel.caso.statusTexto}</p>
        {painel.caso.proximoPasso ? (
          <p className="mt-3 text-sm text-navy">
            Próximo passo: {painel.caso.proximoPasso}{" "}
            {painel.caso.proximoPassoDestino ? (
              <Link to={painel.caso.proximoPassoDestino} className="font-medium text-terracotta underline-offset-2 hover:underline">
                Abrir
              </Link>
            ) : null}
          </p>
        ) : null}
        <p className="mt-3 text-xs text-navy/50">Última atualização em {data(painel.caso.atualizadoEm)}</p>
      </Cartao>

      <section>
        <h2 className="font-serif text-xl">Documentos solicitados</h2>
        <p className="text-sm text-navy/60">Envie apenas o que a equipe pediu aqui. Todo envio passa por revisão.</p>
        {painel.solicitacoes.length === 0 ? (
          <div className="mt-3">
            <PortalVazio mensagem="Nenhum documento pendente no momento." />
          </div>
        ) : (
          <ul className="mt-3 space-y-3">
            {painel.solicitacoes.map((s) => (
              <li key={s.id} className="rounded-xl border border-navy/10 bg-cream/50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">{s.titulo}</p>
                  <Selo texto={s.statusRotulo} />
                </div>
                {s.descricao ? <p className="mt-1 text-sm text-navy/70">{s.descricao}</p> : null}
                {s.prazo ? (
                  <p className="mt-1 flex items-center gap-1 text-xs text-navy/50">
                    <CalendarClock className="h-3.5 w-3.5" /> Até {data(s.prazo)}
                  </p>
                ) : null}
                {s.motivo_recusa && s.status === "recusado" ? (
                  <p className="mt-2 rounded-lg bg-cream px-3 py-2 text-sm text-navy/70">{s.motivo_recusa}</p>
                ) : null}

                {["aguardando", "recusado"].includes(s.status) ? (
                  <>
                    <input
                      ref={(el) => {
                        inputs.current[s.id] = el;
                      }}
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const arquivo = e.target.files?.[0];
                        e.target.value = "";
                        if (!arquivo) return;
                        setErro(null);
                        setEnviando(s.id);
                        enviarArquivo.mutate({ arquivo, solicitacaoId: s.id, titulo: s.titulo });
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => inputs.current[s.id]?.click()}
                      disabled={enviando === s.id}
                      className="mt-3 inline-flex items-center gap-2 rounded-lg bg-navy px-3 py-2 text-sm text-cream disabled:opacity-60"
                    >
                      <Upload className="h-4 w-4" />
                      {enviando === s.id ? "Enviando…" : "Enviar documento"}
                    </button>
                  </>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      {painel.meusEnvios.length > 0 ? (
        <section>
          <h2 className="font-serif text-xl">Meus envios</h2>
          <ul className="mt-3 space-y-2">
            {painel.meusEnvios.map((d) => (
              <li key={d.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-navy/10 bg-cream/50 p-4">
                <div>
                  <p className="font-medium">{d.titulo}</p>
                  <p className="text-xs text-navy/50">Enviado em {data(d.enviadoEm)}</p>
                  {d.motivo ? <p className="mt-1 text-sm text-navy/70">{d.motivo}</p> : null}
                </div>
                <Selo texto={d.statusRotulo} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section>
        <h2 className="font-serif text-xl">Publicado pela equipe</h2>
        <p className="text-sm text-navy/60">{AVISO_PUBLICACAO_CLIENTE}</p>
        {painel.publicacoes.length === 0 ? (
          <div className="mt-3">
            <PortalVazio mensagem="A equipe ainda não publicou conteúdo do seu caso aqui." />
          </div>
        ) : (
          <ul className="mt-3 space-y-2">
            {painel.publicacoes.map((p) => (
              <li key={p.id} className="rounded-xl border border-navy/10 bg-cream/50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">{p.tipoRotulo}</p>
                  <Selo texto={`Publicado em ${data(p.publicadoEm)}`} />
                </div>
                <p className="mt-1 whitespace-pre-line text-sm text-navy/80">{p.conteudo}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="font-serif text-xl">Entregas liberadas</h2>
        <p className="text-sm text-navy/60">Aparecem aqui apenas os arquivos liberados pela equipe.</p>

        {painel.entregas.length === 0 ? (
          <div className="mt-3">
            <PortalVazio mensagem="Nenhuma entrega liberada até o momento." />
          </div>
        ) : (
          <ul className="mt-3 space-y-2">
            {painel.entregas.map((d) => (
              <li key={d.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-navy/10 bg-cream/50 p-4">
                <div>
                  <p className="font-medium">{d.titulo}</p>
                  <p className="text-xs text-navy/50">Liberado em {data(d.liberadoEm)}</p>
                </div>
                <button
                  onClick={() => baixarDocumento(d.id)}
                  className="inline-flex items-center gap-2 rounded-lg border border-navy/20 px-3 py-2 text-sm"
                >
                  <Download className="h-4 w-4" /> Baixar
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="font-serif text-xl">Faturas</h2>
        {painel.faturas.length === 0 ? (
          <div className="mt-3">
            <PortalVazio mensagem="Nenhuma fatura liberada para visualização." />
          </div>
        ) : (
          <ul className="mt-3 space-y-2">
            {painel.faturas.map((f) => (
              <li key={f.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-navy/10 bg-cream/50 p-4">
                <div>
                  <p className="font-medium">{f.descricao ?? f.numero ?? "Fatura"}</p>
                  <p className="text-xs text-navy/50">Vencimento {data(f.vencimento)}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{moeda(f.valor, f.moeda)}</p>
                  <Selo texto={f.statusRotulo} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="font-serif text-xl">Mensagens</h2>
        <p className="text-sm text-navy/60">
          Sua mensagem abre um atendimento com a equipe. A resposta chega aqui no portal.
        </p>

        {painel.tickets.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {painel.tickets.map((t) => (
              <li key={t.id}>
                <Link
                  to="/portal/mensagens/$id"
                  params={{ id: t.id }}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-navy/10 bg-cream/50 p-4 hover:border-gold"
                >
                  <div>
                    <p className="font-medium">{t.assunto}</p>
                    <p className="text-xs text-navy/50">
                      {t.categoriaRotulo} · atualizado em {data(t.ultima_mensagem_em)}
                    </p>
                  </div>
                  <Selo texto={t.statusRotulo} />
                </Link>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-4 rounded-xl border border-navy/10 bg-cream/50 p-4">
          <p className="flex items-center gap-2 font-medium">
            <MessageSquare className="h-4 w-4" /> Nova mensagem
          </p>
          <input
            value={assunto}
            onChange={(e) => setAssunto(e.target.value)}
            placeholder="Assunto"
            className="mt-3 w-full rounded-lg border border-navy/15 px-3 py-2 text-sm"
          />
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="mt-2 w-full rounded-lg border border-navy/15 px-3 py-2 text-sm"
          >
            {CATEGORIAS.map((c) => (
              <option key={c.valor} value={c.valor}>
                {c.rotulo}
              </option>
            ))}
          </select>
          <textarea
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            rows={4}
            placeholder="Escreva sua mensagem"
            className="mt-2 w-full rounded-lg border border-navy/15 px-3 py-2 text-sm"
          />
          <button
            onClick={() => novoTicket.mutate()}
            disabled={novoTicket.isPending || !assunto.trim() || !mensagem.trim()}
            className="mt-3 rounded-lg bg-navy px-4 py-2 text-sm text-cream disabled:opacity-60"
          >
            {novoTicket.isPending ? "Enviando…" : "Enviar mensagem"}
          </button>
        </div>
      </section>
    </div>
  );
}
