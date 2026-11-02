import { useState } from "react";

import { MotoresPrimordiais } from "@/components/biblioteca/motores-primordiais";
import { Selo } from "@/components/comercial/base";
import { CaCard } from "@/components/ui/ca-card";
import { runCanvasAudit, type CanvasAuditReport } from "@/lib/canvas-audit";
import { CRITERIOS_ACEITE, ESTADO_CRITERIO_LABEL, contarPorEstado as contarCriterios, criteriosPendentes } from "@/lib/criterios-aceite";
import { INDICADORES } from "@/lib/indicadores-governanca";
import { INVENTARIO_CAMPOS_ABAS, totalDeCampos } from "@/lib/inventario-campos-abas";
import { MATRIZ_CAPACIDADES, elosSemCobertura } from "@/lib/matriz-capacidades-jornada";
import {
  ESTADOS_CONFORMIDADE,
  MATRIZ_CONFORMIDADE,
  contarPorEstado as contarConformidade,
  pendentesDeRevisaoHumana,
} from "@/lib/matriz-conformidade";
import {
  ESTADO_EQUIVALENCIA_LABEL,
  contarEstados as contarEquivalencia,
  gruposComLacuna,
  totalLinhas as totalEquivalencia,
} from "@/lib/matriz-equivalencia";
import { PASSOS_ACEITE_E2E } from "@/lib/aceite-e2e-passos";
import {
  ENTIDADES_VERTICAIS,
  EVENTOS_CONVERSAO_CANONICOS,
  FONTES_CANONICAS,
  FORA_DO_PRIMEIRO_RELEASE,
} from "@/lib/corte-vertical";
import {
  ATIVOS,
  DUPLICIDADES,
  ORFAOS as ORFAOS_RECUPERACAO,
  SNAPSHOT as SNAPSHOT_RECUPERACAO,
} from "@/lib/inventario-recuperacao";
import {
  ANEXOS_VARREDURA,
  REGRA_ANEXOS_NAO_LOCALIZADOS,
  ROTULO_ESTADO_ANEXO_VARREDURA,
  VARREDURA_COMPLETUDE_DATA,
  anexosNaoLocalizados,
  type EstadoAnexoVarredura,
} from "@/lib/varredura-completude";

/**
 * Inventários de governança do Desk (só leitura).
 *
 * Reúne, num único bloco recolhido, os inventários que antes não tinham tela: indicadores, capacidades
 * da jornada, conformidade, equivalência, critérios de aceite, campos por aba, roteiro de aceite e motores.
 * Nada aqui grava; cada número vem do próprio módulo. Religado em 01/11/2026.
 */
function Linha({ rotulo, valor }: { rotulo: string; valor: string | number }) {
  return (
    <li className="flex items-baseline justify-between gap-3 border-t border-navy/5 py-1 text-xs first:border-t-0">
      <span className="text-navy/70">{rotulo}</span>
      <span className="font-medium tabular-nums text-navy">{valor}</span>
    </li>
  );
}

/**
 * Registros históricos de auditoria: retratos datados, rotulados como NÃO ao vivo (trilha de legado).
 * Mostram só o que é do produto (anexos, ativos, entidades); a leitura atual está nos blocos acima.
 */
export function RegistrosHistoricosDeAuditoria() {
  const porEstado = ANEXOS_VARREDURA.reduce<Partial<Record<EstadoAnexoVarredura, number>>>((acc, a) => {
    acc[a.estado] = (acc[a.estado] ?? 0) + 1;
    return acc;
  }, {});
  const porStatus = ATIVOS.reduce<Record<string, number>>((acc, a) => {
    acc[a.status] = (acc[a.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <CaCard titulo="Registros históricos de auditoria" eyebrow="Retratos datados · não ao vivo">
      <p className="text-xs text-navy/60">
        Cada retrato abaixo vale na data indicada. Servem de registro; o estado atual vem dos blocos acima e do banco.
      </p>
      <div className="mt-3 grid gap-4 md:grid-cols-2">
        <section aria-label="Varredura de anexos">
          <h3 className="text-sm font-medium text-navy">Varredura de anexos · {VARREDURA_COMPLETUDE_DATA}</h3>
          <ul className="mt-1">
            {(Object.keys(porEstado) as EstadoAnexoVarredura[]).map((e) => (
              <Linha key={e} rotulo={ROTULO_ESTADO_ANEXO_VARREDURA[e]} valor={porEstado[e] ?? 0} />
            ))}
            <Linha rotulo="Anexos não localizados" valor={anexosNaoLocalizados().length} />
          </ul>
          <p className="mt-1 text-xs text-navy/60">{REGRA_ANEXOS_NAO_LOCALIZADOS}</p>
        </section>

        <section aria-label="Inventário de recuperação">
          <h3 className="text-sm font-medium text-navy">Inventário de recuperação · {SNAPSHOT_RECUPERACAO.data}</h3>
          <ul className="mt-1">
            <Linha rotulo="Tabelas / funções / policies" valor={`${SNAPSHOT_RECUPERACAO.totais.tabelas} / ${SNAPSHOT_RECUPERACAO.totais.funcoes} / ${SNAPSHOT_RECUPERACAO.totais.policies}`} />
            {Object.entries(porStatus).map(([s, n]) => (
              <Linha key={s} rotulo={`Ativos ${s}`} valor={n} />
            ))}
            <Linha rotulo="Duplicidades registradas" valor={DUPLICIDADES.length} />
            <Linha rotulo="Órfãos registrados" valor={ORFAOS_RECUPERACAO.length} />
          </ul>
        </section>

        <section aria-label="Corte vertical">
          <h3 className="text-sm font-medium text-navy">Corte vertical do primeiro release</h3>
          <ul className="mt-1">
            <Linha rotulo="Fontes canônicas" valor={FONTES_CANONICAS.length} />
            <Linha rotulo="Entidades verticais" valor={ENTIDADES_VERTICAIS.length} />
            <Linha rotulo="Eventos de conversão" valor={EVENTOS_CONVERSAO_CANONICOS.length} />
            <Linha rotulo="Fora do primeiro release" valor={FORA_DO_PRIMEIRO_RELEASE.length} />
          </ul>
        </section>
      </div>
    </CaCard>
  );
}

export function InventariosDeGovernanca() {
  const [auditoria, setAuditoria] = useState<CanvasAuditReport | null | "indisponivel">(null);
  const conformidade = contarConformidade();
  const equivalencia = contarEquivalencia();
  const criterios = contarCriterios();
  const pendentes = criteriosPendentes();
  const semCobertura = elosSemCobertura();
  const lacunas = gruposComLacuna();
  const revisaoHumana = pendentesDeRevisaoHumana();

  return (
    <div data-inventarios-governanca className="space-y-4">
      <CaCard titulo="Inventários de governança" eyebrow="Governança · só leitura">
        <p className="text-xs text-navy/60">
          Cada bloco lê o seu próprio módulo. Nada aqui altera dado; o que não está registrado aparece como zero,
          nunca preenchido por dedução.
        </p>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          <section aria-label="Indicadores">
            <h3 className="text-sm font-medium text-navy">Indicadores ({INDICADORES.length})</h3>
            <ul className="mt-1">
              {INDICADORES.slice(0, 8).map((i) => (
                <Linha key={i.codigo} rotulo={`${i.codigo} · ${i.nome}`} valor={i.fonte_canonica} />
              ))}
            </ul>
          </section>

          <section aria-label="Capacidades da jornada">
            <h3 className="text-sm font-medium text-navy">Capacidades × cadeia ({MATRIZ_CAPACIDADES.length})</h3>
            <ul className="mt-1">
              <Linha rotulo="Elos sem cobertura" valor={semCobertura.length} />
            </ul>
            {semCobertura.length > 0 ? <p className="text-xs text-navy/60">{semCobertura.join(", ")}</p> : null}
          </section>

          <section aria-label="Conformidade">
            <h3 className="text-sm font-medium text-navy">Conformidade ({MATRIZ_CONFORMIDADE.length})</h3>
            <ul className="mt-1">
              {ESTADOS_CONFORMIDADE.map((e) => (
                <Linha key={e.valor} rotulo={e.rotulo} valor={conformidade[e.valor] ?? 0} />
              ))}
              <Linha rotulo="Aguardam revisão humana" valor={revisaoHumana.length} />
            </ul>
          </section>

          <section aria-label="Equivalência">
            <h3 className="text-sm font-medium text-navy">Equivalência ({totalEquivalencia()})</h3>
            <ul className="mt-1">
              {Object.entries(equivalencia).map(([estado, n]) => (
                <Linha
                  key={estado}
                  rotulo={ESTADO_EQUIVALENCIA_LABEL[estado as keyof typeof ESTADO_EQUIVALENCIA_LABEL] ?? estado}
                  valor={n}
                />
              ))}
              <Linha rotulo="Grupos com lacuna" valor={lacunas.length} />
            </ul>
          </section>

          <section aria-label="Critérios de aceite">
            <h3 className="text-sm font-medium text-navy">Critérios de aceite ({CRITERIOS_ACEITE.length})</h3>
            <ul className="mt-1">
              {Object.entries(criterios).map(([estado, n]) => (
                <Linha key={estado} rotulo={ESTADO_CRITERIO_LABEL[estado as keyof typeof ESTADO_CRITERIO_LABEL] ?? estado} valor={n} />
              ))}
            </ul>
            {pendentes.length > 0 ? (
              <details className="mt-1 text-xs text-navy/70">
                <summary className="cursor-pointer">Pendentes ({pendentes.length})</summary>
                <ul className="mt-1 list-disc pl-4">
                  {pendentes.map((c) => (
                    <li key={c.id}>{c.criterio}</li>
                  ))}
                </ul>
              </details>
            ) : null}
          </section>

          <section aria-label="Roteiro de aceite">
            <h3 className="text-sm font-medium text-navy">Roteiro de aceite ponta a ponta ({PASSOS_ACEITE_E2E.length} passos)</h3>
            <ol className="mt-1 list-decimal pl-4 text-xs text-navy/70">
              {PASSOS_ACEITE_E2E.map((p) => (
                <li key={p.id}>
                  {p.titulo} <span className="text-navy/45">· {p.rota}</span>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </CaCard>

      <CaCard titulo="Campos por aba" eyebrow={`${INVENTARIO_CAMPOS_ABAS.length} abas · ${totalDeCampos()} campos`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-navy/50">
                <th className="py-1 pr-3 font-medium">Aba</th>
                <th className="py-1 pr-3 font-medium">Tabela</th>
                <th className="py-1 pr-3 font-medium">Campos</th>
                <th className="py-1 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {INVENTARIO_CAMPOS_ABAS.map((a) => (
                <tr key={`${a.aba}-${a.tabela}`} className="border-t border-navy/5 align-top">
                  <td className="py-1.5 pr-3 text-navy">{a.aba}</td>
                  <td className="py-1.5 pr-3 text-navy/70">{a.tabela}</td>
                  <td className="py-1.5 pr-3 tabular-nums">{a.campos}</td>
                  <td className="py-1.5">
                    <Selo texto={a.estado} tom={a.estado === "vivo" ? "ok" : "neutro"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CaCard>

      <CaCard titulo="Auditoria visual do Canvas" eyebrow="Roda na tela aberta">
        <button
          type="button"
          data-rodar-auditoria-canvas
          className="rounded-lg border border-navy/20 px-3 py-1.5 text-xs text-navy hover:bg-navy/5"
          onClick={() => setAuditoria(runCanvasAudit() ?? "indisponivel")}
        >
          Rodar auditoria
        </button>
        {auditoria === "indisponivel" ? (
          <p className="mt-2 text-xs text-navy/60">Auditoria indisponível fora do navegador.</p>
        ) : auditoria ? (
          <p className="mt-2 text-xs text-navy/80" role="status">
            {auditoria.ok ? "Sem falhas de fonte ou contraste nesta tela." : `Falhas: ${[...auditoria.falhas.fonte, ...auditoria.falhas.contraste, ...auditoria.erros].join("; ") || "ver detalhes"}`}
          </p>
        ) : null}
      </CaCard>

      <RegistrosHistoricosDeAuditoria />

      <MotoresPrimordiais />
    </div>
  );
}
