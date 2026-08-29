import { useMemo, useState } from "react";

import {
  MODULOS_HISTORICOS,
  PRECISAO_DATA,
  STATUS_MODULO,
  VISIBILIDADE_CLIENTE,
  lacunasDosModulos,
  validarRegistroModulo,
  type RegistroModulo,
} from "@/lib/genealogia-modulos";
import { rotuloDe, type Opcao } from "@/lib/pessoas-linhagens";

const inputCls =
  "w-full rounded-lg border border-navy/15 bg-cream px-3 py-2 text-sm text-navy outline-none focus:border-gold";
const btnCls = "rounded-lg bg-navy px-3 py-2 text-xs font-semibold text-cream hover:bg-navy/90 disabled:opacity-50";

function Selo({ texto, tom = "neutro" }: { texto: string; tom?: "neutro" | "ok" | "alerta" }) {
  const cor =
    tom === "ok"
      ? "bg-gold/20 text-navy"
      : tom === "alerta"
        ? "bg-terracotta/15 text-terracotta"
        : "bg-navy/10 text-navy/70";
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${cor}`}>{texto}</span>;
}

export type AbaModulosProps = {
  modulos: Record<string, RegistroModulo[]>;
  pessoas: Opcao[];
  evidencias: Opcao[];
  fontes: Opcao[];
  podeEditar: boolean;
  onSalvar: (tabela: string, valores: Record<string, unknown>) => void;
  onArquivar: (tabela: string, id: string, motivo: string) => void;
};

/**
 * Módulos históricos complementares da ficha piloto. Registro puramente interno:
 * nada aqui pede certidão, contata instituição, cria pasta ou publica ao cliente.
 */
export function AbaModulos({ modulos, pessoas, evidencias, fontes, podeEditar, onSalvar, onArquivar }: AbaModulosProps) {
  const [tabela, setTabela] = useState(MODULOS_HISTORICOS[0]!.tabela);
  const modulo = MODULOS_HISTORICOS.find((m) => m.tabela === tabela)!;
  const registros = (modulos[tabela] ?? []).filter((r) => !r.archived_at);

  const [form, setForm] = useState<Record<string, string>>({
    titulo: "",
    subtipo: "",
    person_id: "",
    periodo_inicio: "",
    periodo_fim: "",
    data_precisao: "desconhecida",
    localidade: "",
    descricao_interna: "",
    evidence_id: "",
    source_id: "",
    status_verificacao: "pendente",
    client_visibility: "interna",
  });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const erros = validarRegistroModulo({
    ...(form as unknown as Partial<RegistroModulo>),
    evidence_id: form["evidence_id"] || null,
    source_id: form["source_id"] || null,
    periodo_inicio: form["periodo_inicio"] || null,
    periodo_fim: form["periodo_fim"] || null,
  });

  const nomePorPessoa = useMemo(() => new Map(pessoas.map((p) => [p.id, p.rotulo])), [pessoas]);
  const lacunas = useMemo(
    () =>
      lacunasDosModulos(
        Object.entries(modulos).flatMap(([t, lista]) => lista.map((registro) => ({ tabela: t, registro }))),
        nomePorPessoa,
      ),
    [modulos, nomePorPessoa],
  );

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {MODULOS_HISTORICOS.map((m) => (
          <button
            key={m.tabela}
            type="button"
            onClick={() => setTabela(m.tabela)}
            className={`rounded-full px-3 py-1 text-[11px] font-medium ${
              tabela === m.tabela ? "bg-gold text-navy" : "bg-navy/10 text-navy/70"
            }`}
          >
            {m.rotulo} ({(modulos[m.tabela] ?? []).filter((r) => !r.archived_at).length})
          </button>
        ))}
      </div>

      <p className="text-xs text-navy/60">{modulo.descricao} Registro interno, sem ação externa.</p>

      {podeEditar ? (
        <form
          className="grid gap-3 rounded-xl border border-navy/10 bg-cream p-4 md:grid-cols-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (erros.length > 0) return;
            onSalvar(tabela, {
              titulo: form["titulo"],
              subtipo: form["subtipo"],
              person_id: form["person_id"] || null,
              periodo_inicio: form["periodo_inicio"] || null,
              periodo_fim: form["periodo_fim"] || null,
              data_precisao: form["data_precisao"],
              localidade: form["localidade"],
              descricao_interna: form["descricao_interna"],
              evidence_id: form["evidence_id"] || null,
              source_id: form["source_id"] || null,
              status_verificacao: form["status_verificacao"],
              client_visibility: form["client_visibility"],
            });
            setForm((f) => ({ ...f, titulo: "", subtipo: "", localidade: "", descricao_interna: "" }));
          }}
        >
          <input className={inputCls} placeholder="Título do registro" value={form["titulo"]} onChange={(e) => set("titulo", e.target.value)} />
          <select className={inputCls} value={form["subtipo"]} onChange={(e) => set("subtipo", e.target.value)}>
            <option value="">Subtipo (opcional)</option>
            {modulo.subtipos.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select className={inputCls} value={form["person_id"]} onChange={(e) => set("person_id", e.target.value)}>
            <option value="">Pessoa (opcional)</option>
            {pessoas.map((p) => (
              <option key={p.id} value={p.id}>{p.rotulo}</option>
            ))}
          </select>
          <input type="date" className={inputCls} value={form["periodo_inicio"]} onChange={(e) => set("periodo_inicio", e.target.value)} />
          <input type="date" className={inputCls} value={form["periodo_fim"]} onChange={(e) => set("periodo_fim", e.target.value)} />
          <select className={inputCls} value={form["data_precisao"]} onChange={(e) => set("data_precisao", e.target.value)}>
            {PRECISAO_DATA.map((o) => (
              <option key={o.id} value={o.id}>Precisão: {o.rotulo}</option>
            ))}
          </select>
          <input className={inputCls} placeholder="Localidade" value={form["localidade"]} onChange={(e) => set("localidade", e.target.value)} />
          <select className={inputCls} value={form["evidence_id"]} onChange={(e) => set("evidence_id", e.target.value)}>
            <option value="">Evidência (opcional)</option>
            {evidencias.map((o) => (
              <option key={o.id} value={o.id}>{o.rotulo}</option>
            ))}
          </select>
          <select className={inputCls} value={form["source_id"]} onChange={(e) => set("source_id", e.target.value)}>
            <option value="">Fonte (opcional)</option>
            {fontes.map((o) => (
              <option key={o.id} value={o.id}>{o.rotulo}</option>
            ))}
          </select>
          <select className={inputCls} value={form["status_verificacao"]} onChange={(e) => set("status_verificacao", e.target.value)}>
            {STATUS_MODULO.map((o) => (
              <option key={o.id} value={o.id}>{o.rotulo}</option>
            ))}
          </select>
          <select className={inputCls} value={form["client_visibility"]} onChange={(e) => set("client_visibility", e.target.value)}>
            {VISIBILIDADE_CLIENTE.map((o) => (
              <option key={o.id} value={o.id}>{o.rotulo}</option>
            ))}
          </select>
          <textarea
            className={`${inputCls} md:col-span-3`}
            rows={2}
            placeholder="Descrição interna (não projeta ao cliente)"
            value={form["descricao_interna"]}
            onChange={(e) => set("descricao_interna", e.target.value)}
          />
          <div className="md:col-span-3">
            {erros.map((e) => (
              <p key={e} className="text-xs text-terracotta">{e}</p>
            ))}
            <button type="submit" className={`${btnCls} mt-2`} disabled={erros.length > 0}>
              Gravar registro histórico
            </button>
          </div>
        </form>
      ) : null}

      <ul className="space-y-2">
        {registros.map((r) => (
          <li key={r.id} className="rounded-xl border border-navy/10 bg-cream p-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-navy">{r.titulo}</span>
              {r.subtipo ? <Selo texto={r.subtipo} /> : null}
              <Selo texto={rotuloDe(STATUS_MODULO, r.status_verificacao)} tom={r.status_verificacao === "confirmado" ? "ok" : "neutro"} />
              <Selo
                texto={r.evidence_id || r.source_id ? "Com suporte" : "Sem evidência"}
                tom={r.evidence_id || r.source_id ? "ok" : "alerta"}
              />
              <Selo texto={rotuloDe(VISIBILIDADE_CLIENTE, r.client_visibility)} />
            </div>
            <p className="mt-1 text-xs text-navy/60">
              {(r.periodo_inicio ?? "período não informado")}
              {r.periodo_fim ? ` até ${r.periodo_fim}` : ""} · precisão {rotuloDe(PRECISAO_DATA, r.data_precisao)}
              {r.localidade ? ` · ${r.localidade}` : ""}
            </p>
            {r.descricao_interna ? <p className="mt-1 text-xs text-navy/70">{r.descricao_interna}</p> : null}
            {podeEditar ? (
              <button
                type="button"
                className="mt-2 text-[11px] text-terracotta underline"
                onClick={() => {
                  const motivo = window.prompt("Motivo do arquivamento (opcional):");
                  if (motivo !== null) onArquivar(tabela, r.id, motivo);
                }}
              >
                Arquivar (sem exclusão física)
              </button>
            ) : null}
          </li>
        ))}
        {registros.length === 0 ? <p className="text-sm text-navy/60">Nenhum registro neste módulo.</p> : null}
      </ul>

      {lacunas.length > 0 ? (
        <div className="rounded-xl border border-navy/10 bg-cream p-3">
          <p className="text-xs font-semibold text-navy">Lacunas dos módulos históricos</p>
          <ul className="mt-1 space-y-1">
            {lacunas.map((l) => (
              <li key={l.chave} className="text-xs text-navy/70">
                {l.pessoa ? `${l.pessoa} — ` : ""}
                {l.descricao}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
