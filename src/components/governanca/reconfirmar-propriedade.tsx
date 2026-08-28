/**
 * Reconfirmação de propriedade e recuperação de acesso administrativo.
 *
 * Mostra o checklist real de integridade do acesso e permite à proprietária
 * reconfirmar a propriedade digitando o e-mail canônico e um motivo. A
 * restauração é interna (organização, vínculo, papel e cadastro de equipe) e
 * fica registrada em auditoria.
 */
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AlertTriangle, CheckCircle2, KeyRound, ShieldCheck, XCircle } from "lucide-react";

import {
  MOTIVO_MINIMO_RECONFIRMACAO,
  diagnosticoAcessoProprietaria,
  reconfirmarPropriedade,
} from "@/lib/reconfirmacao-proprietaria.functions";

export function ReconfirmarPropriedade() {
  const carregarDiagnostico = useServerFn(diagnosticoAcessoProprietaria);
  const executarReconfirmacao = useServerFn(reconfirmarPropriedade);
  const queryClient = useQueryClient();

  const [emailConfirmado, setEmailConfirmado] = useState("");
  const [motivo, setMotivo] = useState("");

  const diagnostico = useQuery({
    queryKey: ["diagnostico-acesso-proprietaria"],
    queryFn: () => carregarDiagnostico(),
  });

  const reconfirmar = useMutation({
    mutationFn: () => executarReconfirmacao({ data: { emailConfirmado, motivo } }),
    onSuccess: () => {
      setMotivo("");
      void queryClient.invalidateQueries({ queryKey: ["diagnostico-acesso-proprietaria"] });
    },
  });

  const dados = diagnostico.data;
  const podeEnviar =
    !!dados?.elegivel && emailConfirmado.trim().length > 3 && motivo.trim().length >= MOTIVO_MINIMO_RECONFIRMACAO;

  return (
    <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <header className="flex items-start gap-3">
        <ShieldCheck className="mt-0.5 h-5 w-5 text-primary" aria-hidden />
        <div>
          <h2 className="text-lg font-semibold text-foreground">Reconfirmar propriedade e recuperar acesso</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Verificação do estado real no banco e restauração interna do acesso administrativo integral. Nenhuma ação
            externa é disparada; a decisão fica registrada em auditoria.
          </p>
        </div>
      </header>

      <div className="mt-6 space-y-3">
        {diagnostico.isLoading ? (
          <p className="text-sm text-muted-foreground">Lendo estado do acesso…</p>
        ) : diagnostico.isError ? (
          <p className="text-sm text-destructive">Não foi possível ler o estado do acesso agora.</p>
        ) : (
          dados?.itens.map((item) => (
            <div key={item.chave} className="flex items-start gap-3 rounded-md border border-border/60 p-3">
              {item.aprovado ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" aria-hidden />
              ) : (
                <XCircle className="mt-0.5 h-4 w-4 text-destructive" aria-hidden />
              )}
              <div>
                <p className="text-sm font-medium text-foreground">{item.titulo}</p>
                <p className="text-xs text-muted-foreground">{item.detalhe}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {dados?.servidor ? (
        <div
          className={`mt-6 rounded-md border p-3 text-sm ${
            dados.servidor.segredoPodeServir === "nao"
              ? "border-destructive/40 bg-destructive/5 text-destructive"
              : "border-border/60 bg-muted/30 text-muted-foreground"
          }`}
        >
          <p className="font-medium text-foreground">Chave de serviço do servidor</p>
          {dados.servidor.segredoPodeServir === "nao" ? (
            <p className="mt-1">
              A chave de serviço do ambiente é de um projeto diferente da URL em uso ({dados.servidor.refDoAmbiente}{" "}
              ≠ {dados.servidor.refEmUso}). Por isso todo item acima pode aparecer como inexistente mesmo existindo
              de verdade: quem lê é essa chave, e ela não autentica contra o projeto certo. Isto só se corrige
              trocando a variável de ambiente no servidor — nenhuma tela consegue consertar sozinha.
            </p>
          ) : (
            <p className="mt-1">
              Projeto em uso: {dados.servidor.refEmUso ?? "—"} · chave de serviço:{" "}
              {dados.servidor.formatoChaveSecreta} · pode servir: {dados.servidor.segredoPodeServir}.
            </p>
          )}
        </div>
      ) : null}

      {dados && !dados.elegivel ? (
        <p className="mt-6 flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertTriangle className="mt-0.5 h-4 w-4" aria-hidden />
          Esta conta não é a proprietária administradora canônica. Entre com a conta de proprietária para reconfirmar.
        </p>
      ) : null}

      {dados?.elegivel ? (
        <form
          className="mt-6 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (podeEnviar) reconfirmar.mutate();
          }}
        >
          <div>
            <label className="block text-sm font-medium text-foreground" htmlFor="email-proprietaria">
              Confirme o e-mail da proprietária
            </label>
            <input
              id="email-proprietaria"
              type="email"
              autoComplete="off"
              placeholder={dados.email}
              value={emailConfirmado}
              onChange={(event) => setEmailConfirmado(event.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground" htmlFor="motivo-reconfirmacao">
              Motivo da reconfirmação
            </label>
            <textarea
              id="motivo-reconfirmacao"
              rows={3}
              value={motivo}
              onChange={(event) => setMotivo(event.target.value)}
              placeholder="Ex.: recuperação de acesso administrativo após bloqueio de vínculo"
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Mínimo de {MOTIVO_MINIMO_RECONFIRMACAO} caracteres. O motivo é gravado na auditoria.
            </p>
          </div>

          <button
            type="submit"
            disabled={!podeEnviar || reconfirmar.isPending}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            <KeyRound className="h-4 w-4" aria-hidden />
            {reconfirmar.isPending ? "Reconfirmando…" : "Reconfirmar propriedade e restaurar acesso"}
          </button>

          {reconfirmar.isError ? (
            <p className="text-sm text-destructive">{(reconfirmar.error as Error).message}</p>
          ) : null}

          {reconfirmar.data ? (
            <div className="rounded-md border border-primary/40 bg-primary/5 p-3 text-sm">
              <p className="font-medium text-foreground">
                {reconfirmar.data.diagnostico.aprovado
                  ? "Propriedade reconfirmada: acesso administrativo integral ativo."
                  : "Reconfirmação registrada, mas ainda há itens pendentes acima."}
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
                {reconfirmar.data.reparos.length ? (
                  reconfirmar.data.reparos.map((reparo) => <li key={reparo}>{reparo}</li>)
                ) : (
                  <li>Nenhum reparo necessário: o acesso já estava íntegro.</li>
                )}
              </ul>
            </div>
          ) : null}
        </form>
      ) : null}
    </section>
  );
}
