import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { CaCard } from "@/components/ui/ca-card";
import { Selo } from "@/components/comercial/base";
import { CarregandoDesk } from "@/components/desk/ui-desk";
import { listarErrosERecusas } from "@/lib/qualidade.functions";

/**
 * A09 (04/11/2026) — erros do app e recusas do servidor, legíveis para a proprietária.
 * Só leitura de `audit_logs`; nada é apagado nem reclassificado no banco.
 */
export function ErrosERecusas() {
  const carregar = useServerFn(listarErrosERecusas);
  const [mostrarTeste, setMostrarTeste] = useState(false);
  const q = useQuery({ queryKey: ["qualidade", "erros-e-recusas"], queryFn: () => carregar() });

  if (q.isLoading) {
    return (
      <CaCard titulo="Erros do app e recusas" eyebrow="Últimos 7 dias" className="mb-6">
        <CarregandoDesk linhas={3} rotulo="Carregando os registros" />
      </CaCard>
    );
  }

  if (q.isError) {
    return (
      <CaCard titulo="Erros do app e recusas" eyebrow="Últimos 7 dias" className="mb-6">
        <p className="text-sm text-terracotta">{(q.error as Error).message}</p>
        <button
          type="button"
          onClick={() => void q.refetch()}
          className="mt-2 min-h-11 rounded-lg border border-navy/20 px-3 text-sm text-navy"
        >
          Tentar de novo
        </button>
      </CaCard>
    );
  }

  const dados = q.data;
  if (!dados?.permitido) {
    return (
      <CaCard titulo="Erros do app e recusas" eyebrow="Últimos 7 dias" className="mb-6">
        <p className="text-sm text-navy/70">Leitura reservada à administração da organização.</p>
      </CaCard>
    );
  }

  const deTeste = dados.registros.filter((r) => r.deTeste).length;
  const visiveis = dados.registros.filter((r) => mostrarTeste || !r.deTeste);
  const erros = visiveis.filter((r) => r.tipo === "erro").length;
  const recusas = visiveis.length - erros;

  return (
    <CaCard titulo="Erros do app e recusas" eyebrow="Últimos 7 dias · leitura interna" className="mb-6">
      <p className="text-xs text-navy/60">
        Erros registrados pelo app e ações que o servidor recusou, com o motivo gravado. Até 100 registros mais recentes.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Selo texto={`${erros} erro(s)`} tom={erros ? "alerta" : "neutro"} />
        <Selo texto={`${recusas} recusa(s)`} tom="neutro" />
        {deTeste > 0 ? (
          <label className="ml-auto flex min-h-11 items-center gap-2 text-xs text-navy/70">
            <input type="checkbox" checked={mostrarTeste} onChange={(e) => setMostrarTeste(e.target.checked)} />
            Mostrar {deTeste} registro(s) gravado(s) por testes
          </label>
        ) : null}
      </div>

      {visiveis.length === 0 ? (
        <p className="mt-3 text-sm text-navy/70">Nenhum erro nem recusa registrado nos últimos 7 dias.</p>
      ) : (
        <ul className="mt-3 divide-y divide-navy/10">
          {visiveis.map((r) => (
            <li key={r.id} className="min-w-0 py-2 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <Selo texto={r.rotulo} tom={r.tipo === "erro" ? "alerta" : "neutro"} />
                {r.deTeste ? <Selo texto="Registro de teste, não é erro do app" tom="neutro" /> : null}
                <span className="text-xs text-navy/60">{new Date(r.em).toLocaleString("pt-BR")}</span>
              </div>
              <p className="mt-1 break-words text-navy">{r.motivo}</p>
              <p className="mt-0.5 break-words text-xs text-navy/60">
                Onde: {r.onde}
                {r.origem ? ` · origem: ${r.origem}` : ""}
                {r.quem ? "" : " · sem usuário identificado"}
              </p>
            </li>
          ))}
        </ul>
      )}
    </CaCard>
  );
}
