/**
 * Verificador rápido de acesso administrativo máximo no Painel Hoje.
 *
 * Apenas leitura: consulta o retrato real do banco (conta única, organização
 * ativa, vínculo, papel admin e cadastro de equipe) para a proprietária
 * canônica. Não altera dados, não repara nada e não aciona nada externo.
 */
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { diagnosticoAcessoProprietaria } from "@/lib/reconfirmacao-proprietaria.functions";
import { EMAIL_PROPRIETARIA } from "@/lib/verificacao-acesso-proprietaria";

export function VerificadorAdminProprietaria() {
  const carregar = useServerFn(diagnosticoAcessoProprietaria);
  const [verificarEm, setVerificarEm] = useState<number | null>(null);

  const q = useQuery({
    queryKey: ["verificador-admin-proprietaria", verificarEm],
    queryFn: () => carregar(),
    enabled: verificarEm !== null,
    retry: false,
    staleTime: 0,
  });

  const d = q.data;

  return (
    <section className="rounded-xl border border-gold/40 bg-cream/40 p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="font-serif text-lg text-navy">Verificação de acesso administrativo</h2>
          <p className="mt-0.5 break-words text-xs text-navy/60">
            Confirma se <span className="font-medium">{EMAIL_PROPRIETARIA}</span> continua como admin máximo da
            organização Clube Ancestral. Somente leitura — nada é alterado.
          </p>
        </div>
        <button
          onClick={() => setVerificarEm(Date.now())}
          disabled={q.isFetching}
          className="shrink-0 rounded-md bg-navy px-3 py-1.5 text-xs text-cream disabled:opacity-50"
        >
          {q.isFetching ? "Verificando…" : "Verificar agora"}
        </button>
      </div>

      {q.isError ? (
        <p className="mt-3 text-xs text-terracotta">
          Não foi possível verificar agora: {String((q.error as any)?.message ?? "erro na leitura")}
        </p>
      ) : null}

      {d ? (
        <div className="mt-3 space-y-2">
          <p
            className={`inline-block rounded-md px-2 py-1 text-xs ${
              d.aprovado ? "bg-navy/10 text-navy" : "bg-terracotta/10 text-terracotta"
            }`}
          >
            {d.aprovado
              ? "Acesso íntegro: admin máximo confirmado na organização canônica."
              : d.elegivel
                ? "Divergência encontrada no acesso administrativo."
                : "Conta autenticada não é a proprietária administradora canônica."}
          </p>

          <ul className="space-y-1 text-xs">
            {d.itens.map((i) => (
              <li key={i.chave} className="flex min-w-0 items-baseline gap-2">
                <span className={i.aprovado ? "text-navy" : "text-terracotta"}>{i.aprovado ? "OK" : "!"}</span>
                <span className="min-w-0 break-words text-navy/75">
                  {i.titulo} — <span className="text-navy/55">{i.detalhe}</span>
                </span>
              </li>
            ))}
          </ul>

          <p className="text-[11px] text-navy/50">
            Conta verificada: {d.email || "não identificada"}
            {d.organizacao ? ` · organização ${d.organizacao.slug}` : ""}
            {d.userId ? ` · identificador ${d.userId}` : ""}
          </p>

          {!d.aprovado && d.elegivel ? (
            <Link to="/modo-proprietaria" className="inline-block text-xs text-navy underline underline-offset-2">
              Abrir Modo Proprietária para reconfirmar a propriedade
            </Link>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
