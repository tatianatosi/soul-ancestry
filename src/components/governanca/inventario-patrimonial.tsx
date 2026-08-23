/**
 * Apresentação somente-leitura do inventário patrimonial do Clube Ancestral.
 * Nenhuma ação é executada aqui.
 */

import { useState } from "react";
import { baixarCsvInventario, filtrarInventario, previaCsvInventario, tamanhoLegivel } from "@/lib/inventario-csv";
import {
  ACOES_DEPENDENTES_DE_TERCEIROS,
  ACOES_SO_DA_PROPRIETARIA,
  CHECKLIST_MIGRACAO_BACKUP,
  CONFIRMACAO_LITERAL,
  DOMINIOS,
  INVENTARIO,
  INVENTARIO_DATA,
  INVENTARIO_VERSAO,
  MAPA_DE_PARA,
  MATRIZ_FONTES,
  MATRIZ_LACUNAS,
  ROTULO_DOMINIO,
  STATUS_INVENTARIO,
  camadasFaltantes,
  contarPorStatus,
  itensPorDominio,
  type Dominio,
  type ItemInventario,
  type Severidade,
  type StatusInventario,
} from "@/lib/inventario-patrimonial";

function Bloco({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-navy/10 bg-white p-4">
      <h2 className="text-sm font-medium text-navy">{titulo}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function corSeveridade(s: Severidade) {
  if (s === "critica") return "bg-terracotta/15 text-terracotta";
  if (s === "alta") return "bg-gold/25 text-navy";
  if (s === "media") return "bg-cream text-navy/80";
  return "bg-navy/5 text-navy/60";
}

function Camadas({ item }: { item: ItemInventario }) {
  const k = item.camadas;
  const lista: Array<[string, boolean]> = [
    ["1 fonte", k.fonteDocumental],
    ["2 homologado", k.conteudoHomologado],
    ["3 app", k.estruturaNoApp],
    ["4 instância", k.instanciaDeCaso],
    ["5 autenticado", k.validacaoAutenticada],
  ];
  return (
    <div className="flex flex-wrap gap-1">
      {lista.map(([rotulo, ok]) => (
        <span
          key={rotulo}
          className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide ${
            ok ? "bg-navy/10 text-navy" : "bg-terracotta/10 text-terracotta"
          }`}
        >
          {rotulo}
          {ok ? " ✓" : " ✕"}
        </span>
      ))}
    </div>
  );
}

function Cartao({ item }: { item: ItemInventario }) {
  return (
    <article className="rounded-lg border border-navy/10 bg-cream/40 p-3">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-medium text-navy">
          {item.id} · {item.nomeCanonico}
        </h3>
        <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide ${corSeveridade(item.severidade)}`}>
          {item.status}
        </span>
      </header>
      <p className="mt-1 text-xs text-navy/70">{item.finalidade}</p>
      <dl className="mt-2 grid gap-1 text-[11px] text-navy/70 sm:grid-cols-2">
        <div>
          <dt className="font-medium text-navy/80">Origem</dt>
          <dd>{item.origem.join(", ")}</dd>
        </div>
        <div>
          <dt className="font-medium text-navy/80">Fonte de verdade atual</dt>
          <dd>{item.fonteDeVerdadeAtual}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="font-medium text-navy/80">Localização</dt>
          <dd>{item.localizacao}</dd>
        </div>
        <div>
          <dt className="font-medium text-navy/80">Versão / data / responsável</dt>
          <dd>
            {item.versao} · {item.data} · {item.responsavel}
          </dd>
        </div>
        <div>
          <dt className="font-medium text-navy/80">Vínculos / dependências</dt>
          <dd>
            {item.vinculos.join(", ") || "—"} / {item.dependencias.join(", ") || "—"}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="font-medium text-navy/80">Risco</dt>
          <dd>{item.risco}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="font-medium text-navy/80">Ação necessária</dt>
          <dd>{item.acaoNecessaria ?? "Nenhuma nesta etapa."}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="font-medium text-navy/80">Autonomia</dt>
          <dd>
            {item.proprietariaPodeAgirInternamente
              ? "Proprietária pode agir internamente"
              : "Proprietária não pode concluir sozinha"}{" "}
            · depende de: {item.dependeDe.join(", ")}
          </dd>
        </div>
      </dl>
      <div className="mt-2 space-y-1">
        <Camadas item={item} />
        <p className="text-[11px] text-navy/60">
          Camadas ausentes: {camadasFaltantes(item).join(" · ") || "nenhuma"}
        </p>
      </div>
    </article>
  );
}

export function InventarioPatrimonial() {
  const contagem = contarPorStatus();
  const [dominioCsv, setDominioCsv] = useState<Dominio | "todos">("todos");
  const [statusCsv, setStatusCsv] = useState<StatusInventario | "todos">("todos");
  const [verAmostra, setVerAmostra] = useState(false);

  const filtro = { dominio: dominioCsv, status: statusCsv };
  const totalFiltrado = filtrarInventario(filtro).length;
  const previa = previaCsvInventario(filtro, 5);

  return (
    <div className="space-y-4">
      <Bloco titulo={`Inventário ${INVENTARIO_VERSAO} — ${INVENTARIO_DATA}`}>
        <p className="text-xs text-navy/70">{CONFIRMACAO_LITERAL}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {Object.entries(contagem)
            .filter(([, n]) => n > 0)
            .map(([status, n]) => (
              <span key={status} className="rounded-full bg-navy/5 px-2 py-0.5 text-[10px] uppercase tracking-wide text-navy/70">
                {status}: {n}
              </span>
            ))}
        </div>
      </Bloco>

      <Bloco titulo="Exportar inventário em CSV (leitura e auditoria)">
        <div className="flex flex-wrap items-end gap-3">
          <label className="text-[11px] text-navy/70">
            <span className="block font-medium text-navy/80">Domínio</span>
            <select
              value={dominioCsv}
              onChange={(e) => setDominioCsv(e.target.value as Dominio | "todos")}
              className="mt-1 rounded-md border border-navy/15 bg-white px-2 py-1 text-xs text-navy"
            >
              <option value="todos">Todos os domínios</option>
              {DOMINIOS.map((d) => (
                <option key={d} value={d}>
                  {ROTULO_DOMINIO[d]}
                </option>
              ))}
            </select>
          </label>
          <label className="text-[11px] text-navy/70">
            <span className="block font-medium text-navy/80">Status</span>
            <select
              value={statusCsv}
              onChange={(e) => setStatusCsv(e.target.value as StatusInventario | "todos")}
              className="mt-1 rounded-md border border-navy/15 bg-white px-2 py-1 text-xs text-navy"
            >
              <option value="todos">Todos os status</option>
              {STATUS_INVENTARIO.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() => baixarCsvInventario(filtro)}
            disabled={totalFiltrado === 0}
            className="rounded-md bg-navy px-3 py-1.5 text-xs font-medium text-cream disabled:opacity-40"
          >
            Baixar CSV ({totalFiltrado} {totalFiltrado === 1 ? "item" : "itens"})
          </button>
        </div>

        <div className="mt-3 rounded-lg border border-navy/10 bg-cream/40 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] font-medium text-navy/80">
              Antes de baixar: {previa.totalLinhas} {previa.totalLinhas === 1 ? "linha" : "linhas"} de dado ·{" "}
              {previa.colunas.length} colunas · cerca de {tamanhoLegivel(previa.tamanhoAproximadoBytes)}
            </p>
            {previa.totalLinhas > 0 ? (
              <button
                type="button"
                onClick={() => setVerAmostra((v) => !v)}
                className="rounded-md border border-navy/20 px-2 py-1 text-[11px] text-navy/70"
              >
                {verAmostra ? "Ocultar amostra" : "Ver amostra das primeiras linhas"}
              </button>
            ) : null}
          </div>
          <p className="mt-1 text-[11px] text-navy/60">
            Arquivo: {previa.nomeArquivo}
          </p>

          {previa.totalLinhas === 0 ? (
            <p className="mt-2 text-[11px] text-terracotta">
              Nenhum item atende aos filtros escolhidos. Ajuste domínio ou status para gerar o arquivo.
            </p>
          ) : verAmostra ? (
            <div className="mt-2 overflow-x-auto">
              <table className="w-max text-left text-[10px] text-navy/75">
                <thead className="text-navy/55">
                  <tr>
                    {previa.colunas.map((coluna) => (
                      <th key={coluna} className="whitespace-nowrap border-b border-navy/10 px-2 py-1 font-medium">
                        {coluna}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previa.amostra.map((linha, i) => (
                    <tr key={`${linha[0]}-${i}`} className="border-b border-navy/5 align-top">
                      {linha.map((celulaTexto, j) => (
                        <td key={`${previa.colunas[j]}-${j}`} className="max-w-[220px] truncate px-2 py-1" title={celulaTexto}>
                          {celulaTexto}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-1 text-[11px] text-navy/55">
                Amostra de {previa.linhasNaAmostra} de {previa.totalLinhas} linhas. O arquivo baixado traz todas as linhas
                e todas as colunas, sem corte de texto.
              </p>
            </div>
          ) : null}
        </div>

        <p className="mt-2 text-[11px] text-navy/60">
          O arquivo é gerado no próprio navegador, com as cinco camadas, severidade, risco e ação necessária de cada item.
          Nenhum dado é alterado e nenhuma ação externa é executada.
        </p>
      </Bloco>

      {DOMINIOS.map((dominio) => {
        const itens = itensPorDominio(dominio);
        if (itens.length === 0) return null;
        return (
          <Bloco key={dominio} titulo={ROTULO_DOMINIO[dominio]}>
            <div className="grid gap-3">
              {itens.map((item) => (
                <Cartao key={item.id} item={item} />
              ))}
            </div>
          </Bloco>
        );
      })}

      <Bloco titulo="Mapa de-para — 2025/18-08-2026 → app, banco e repositório">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px] text-navy/75">
            <thead className="text-navy/60">
              <tr>
                <th className="py-1 pr-3">Origem legada</th>
                <th className="py-1 pr-3">Onde vivia</th>
                <th className="py-1 pr-3">Destino atual</th>
                <th className="py-1 pr-3">Item</th>
                <th className="py-1">Observação</th>
              </tr>
            </thead>
            <tbody>
              {MAPA_DE_PARA.map((linha) => (
                <tr key={linha.origemLegado} className="border-t border-navy/5">
                  <td className="py-1 pr-3">{linha.origemLegado}</td>
                  <td className="py-1 pr-3">{linha.ondeVivia}</td>
                  <td className="py-1 pr-3">{linha.destinoAtual}</td>
                  <td className="py-1 pr-3">{linha.itemInventario}</td>
                  <td className="py-1">{linha.observacao}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Bloco>

      <Bloco titulo="Matriz de lacunas por severidade">
        <ul className="space-y-2">
          {MATRIZ_LACUNAS.map((l) => (
            <li key={l.item} className="text-[11px] text-navy/75">
              <span className={`mr-2 rounded-full px-2 py-0.5 text-[10px] uppercase ${corSeveridade(l.severidade)}`}>
                {l.severidade}
              </span>
              <strong className="text-navy">{l.item}</strong> — camada ausente: {l.camadaAusente}. {l.impacto}
            </li>
          ))}
        </ul>
      </Bloco>

      <Bloco titulo="Fontes a preservar ou importar">
        <ul className="space-y-1 text-[11px] text-navy/75">
          {MATRIZ_FONTES.map((f) => (
            <li key={f.fonte}>
              <span className={`mr-2 rounded-full px-2 py-0.5 text-[10px] uppercase ${corSeveridade(f.prioridade)}`}>
                {f.acao}
              </span>
              {f.fonte} — {f.ondeEsta}
            </li>
          ))}
        </ul>
      </Bloco>

      <Bloco titulo="Checklist único de migração e backup">
        <ol className="list-decimal space-y-1 pl-5 text-[11px] text-navy/75">
          {CHECKLIST_MIGRACAO_BACKUP.map((linha) => (
            <li key={linha}>{linha}</li>
          ))}
        </ol>
      </Bloco>

      <div className="grid gap-4 md:grid-cols-2">
        <Bloco titulo="Ações exclusivas da Proprietária">
          <ul className="list-disc space-y-1 pl-5 text-[11px] text-navy/75">
            {ACOES_SO_DA_PROPRIETARIA.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </Bloco>
        <Bloco titulo="Ações dependentes de terceiros">
          <ul className="list-disc space-y-1 pl-5 text-[11px] text-navy/75">
            {ACOES_DEPENDENTES_DE_TERCEIROS.map((a) => (
              <li key={a.acao}>
                {a.acao} — <span className="text-navy/60">{a.dependeDe}</span>
              </li>
            ))}
          </ul>
        </Bloco>
      </div>

      <p className="text-[11px] text-navy/60">
        Total de itens inventariados: {INVENTARIO.length}. Tela somente leitura: nenhum item é criado, alterado,
        homologado, aprovado, arquivado, enviado, assinado, publicado, cobrado, migrado, integrado, movido ou excluído.
      </p>
    </div>
  );
}
