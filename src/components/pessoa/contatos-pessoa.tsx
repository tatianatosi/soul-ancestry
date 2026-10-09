import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { CaCard } from "@/components/ui/ca-card";
import { adicionarContatoPessoa, arquivarContatoPessoa } from "@/lib/pessoa.functions";
import { emailValido, formatarTelefone, nomeValido, telefoneValido } from "@/lib/validacao-pessoa";
import { useAvisoEdicaoNaoSalva } from "@/lib/aviso-edicao-nao-salva";

type Contato = {
  id: string;
  nome: string;
  relacao?: string | null;
  email?: string | null;
  telefone?: string | null;
  principal?: boolean | null;
  observacoes?: string | null;
};

const VAZIO = { nome: "", relacao: "", email: "", telefone: "", observacoes: "", principal: false };

/**
 * P2 CRM Vivo (24/09/2026): contatos são vínculos da Pessoa Canônica
 * (`client_contacts.client_id`), não um cadastro concorrente. Quem já é
 * pessoa canônica é aberto na própria Pessoa 360 — nada é copiado nem fundido.
 */
export function ContatosDaPessoa({
  clienteId,
  contatos,
  podeEscrever,
  pendencia,
}: {
  clienteId: string;
  contatos: Contato[];
  podeEscrever: boolean;
  pendencia: string | null;
}) {
  const adicionar = useServerFn(adicionarContatoPessoa);
  const arquivar = useServerFn(arquivarContatoPessoa);
  const qc = useQueryClient();
  const [aberto, setAberto] = useState(false);
  const [form, setForm] = useState(VAZIO);
  const [aviso, setAviso] = useState<{ texto: string; pessoaId?: string } | null>(null);
  const [arquivando, setArquivando] = useState<string | null>(null);
  const [motivo, setMotivo] = useState("");
  /* F5 / sair da linha (09/10/2026): trava a saída com edição pendente. */
  useAvisoEdicaoNaoSalva(
    JSON.stringify(form) !== JSON.stringify(VAZIO) ||
      (arquivando !== null && motivo.trim() !== ""),
  );

  const mAdicionar = useMutation({
    mutationFn: () => adicionar({ data: { clienteId, ...form } }),
    onSuccess: (r) => {
      if (!r.ok) {
        setAviso({ texto: r.motivo, pessoaId: "pessoaId" in r ? r.pessoaId : undefined });
        return;
      }
      setAviso({ texto: "Contato gravado e relido nesta pessoa." });
      setForm(VAZIO);
      setAberto(false);
      void qc.invalidateQueries({ queryKey: ["pessoa", clienteId] });
    },
    onError: (e: Error) => setAviso({ texto: e.message }),
  });

  const mArquivar = useMutation({
    mutationFn: (contatoId: string) => arquivar({ data: { contatoId, motivo } }),
    onSuccess: () => {
      setAviso({ texto: "Contato arquivado (sem exclusão física)." });
      setArquivando(null);
      setMotivo("");
      void qc.invalidateQueries({ queryKey: ["pessoa", clienteId] });
    },
    onError: (e: Error) => setAviso({ texto: e.message }),
  });

  const campo = (k: keyof typeof VAZIO, rotulo: string, tipo = "text") => {
    const valor = String(form[k] ?? "");
    const invalido =
      (k === "nome" && valor.trim() !== "" && !nomeValido(valor)) ||
      (k === "email" && valor.trim() !== "" && !emailValido(valor)) ||
      (k === "telefone" && valor.trim() !== "" && !telefoneValido(valor));
    return (
      <label className="flex flex-col gap-1 text-xs text-navy/70">
        {rotulo}
        <input
          type={tipo}
          value={valor}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              [k]: k === "telefone" ? formatarTelefone(e.target.value) : e.target.value,
            }))
          }
          className={`rounded-md border bg-cream px-2 py-1 text-sm text-navy ${
            invalido ? "border-terracotta/60" : "border-navy/20"
          }`}
        />
        {invalido ? (
          <span className="text-[11px] text-terracotta">
            {k === "nome" ? "Nome inválido." : k === "email" ? "E-mail inválido." : "Telefone inválido."}
          </span>
        ) : null}
      </label>
    );
  };

  const formValido =
    nomeValido(form.nome) &&
    (!form.email.trim() || emailValido(form.email)) &&
    (!form.telefone.trim() || telefoneValido(form.telefone));

  return (
    <CaCard
      titulo="Contatos"
      eyebrow="Vínculos desta pessoa — não são outra ficha"
      acao={<p className="text-xs text-navy/55">{contatos.length} contato(s)</p>}
    >
      <div data-contatos-pessoa className="space-y-3">
        {contatos.length ? (
          <ul className="space-y-2">
            {contatos.map((c) => (
              <li key={c.id} className="rounded-lg border border-navy/10 bg-cream/30 p-3 text-sm text-navy">
                <p className="font-medium">
                  {c.nome}
                  {c.relacao ? <span className="font-normal text-navy/60"> · {c.relacao}</span> : null}
                  {c.principal ? (
                    <span className="ml-2 rounded bg-gold/20 px-1.5 py-0.5 text-[11px]">principal</span>
                  ) : null}
                </p>
                <p className="text-xs text-navy/60">
                  {[c.email, c.telefone].filter(Boolean).join(" · ") || "Sem meio de contato"}
                </p>
                {c.observacoes ? <p className="mt-1 text-xs text-navy/55">{c.observacoes}</p> : null}
                {podeEscrever ? (
                  arquivando === c.id ? (
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <input
                        value={motivo}
                        onChange={(e) => setMotivo(e.target.value)}
                        placeholder="Motivo do arquivamento"
                        className="rounded-md border border-navy/20 bg-cream px-2 py-1 text-xs"
                      />
                      <button
                        type="button"
                        disabled={!motivo.trim() || mArquivar.isPending}
                        onClick={() => mArquivar.mutate(c.id)}
                        className="rounded-md border border-terracotta/50 px-2 py-1 text-xs text-terracotta disabled:opacity-40"
                      >
                        {mArquivar.isPending ? "Arquivando…" : "Confirmar arquivamento"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setArquivando(null);
                          setMotivo("");
                        }}
                        className="text-xs text-navy/60 underline"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setArquivando(c.id)}
                      className="mt-2 text-xs text-navy/60 underline"
                    >
                      Arquivar contato
                    </button>
                  )
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-navy/65">
            Nenhum contato vinculado. E-mail e telefone da própria pessoa ficam nos dados civis acima.
          </p>
        )}

        {!podeEscrever ? (
          <p className="text-[11px] text-navy/45">Pendência registrada: {pendencia ?? "sem permissão de escrita."}</p>
        ) : aberto ? (
          <div className="grid gap-2 rounded-lg border border-navy/10 p-3 sm:grid-cols-2">
            {campo("nome", "Nome do contato")}
            {campo("relacao", "Relação com a pessoa")}
            {campo("email", "E-mail", "email")}
            {campo("telefone", "Telefone", "tel")}
            <div className="sm:col-span-2">{campo("observacoes", "Observações")}</div>
            <label className="flex items-center gap-2 text-xs text-navy/70">
              <input
                type="checkbox"
                checked={form.principal}
                onChange={(e) => setForm((f) => ({ ...f, principal: e.target.checked }))}
              />
              Contato principal
            </label>
            <div className="flex flex-wrap items-center gap-2 sm:col-span-2">
              <button
                type="button"
                disabled={mAdicionar.isPending || !formValido}
                onClick={() => mAdicionar.mutate()}
                className="rounded-lg bg-navy px-3 py-1.5 text-xs text-cream disabled:opacity-40"
              >
                {mAdicionar.isPending ? "Gravando…" : "Gravar contato"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setAberto(false);
                  setForm(VAZIO);
                  setAviso(null);
                }}
                className="text-xs text-navy/60 underline"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAberto(true)}
            className="rounded-md border border-navy/20 px-3 py-1.5 text-xs text-navy hover:bg-navy/5"
          >
            Adicionar contato
          </button>
        )}

        {aviso ? (
          <p role="status" className="text-xs text-navy/70">
            {aviso.texto}{" "}
            {aviso.pessoaId && aviso.pessoaId !== clienteId ? (
              <Link
                to="/pessoas/$clienteId"
                params={{ clienteId: aviso.pessoaId }}
                className="underline decoration-gold underline-offset-2"
              >
                Abrir a Pessoa 360
              </Link>
            ) : null}
          </p>
        ) : null}
      </div>
    </CaCard>
  );
}
