/**
 * Bloco somente-leitura que prova qual instância documental salva do caso
 * está por trás dos anexos exibidos na tela autenticada.
 */

import { DetalhesTecnicos } from "@/components/ui/detalhes-tecnicos";
import { acaoSeguinteAnexo, rotuloStatusAnexoSalvo, type ConteudoAnexoSalvo } from "@/lib/anexos-conteudo";
import {
  ROTULO_ESTADO_INSTANCIA,
  resumoInstancias,
  type LinhaInstancia,
} from "@/lib/anexos-instancia";

const COR: Record<string, string> = {
  canonica: "border-navy/20 bg-cream/40 text-navy/70",
  desatualizada: "border-gold/50 bg-gold/10 text-navy/80",
  nao_materializada: "border-terracotta/40 bg-terracotta/10 text-terracotta",
  somente_persistida: "border-navy/20 bg-cream/40 text-navy/60",
};

function dataCurta(v: string | null) {
  if (!v) return "—";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("pt-BR");
}

/**
 * Conteúdo salvo do anexo — é isto que está sendo aprovado. Renderizado a
 * partir de `structured_data`, nunca injetando o HTML gravado no banco.
 */
function ConteudoSalvoDoAnexo({ codigo, conteudo }: { codigo: string; conteudo: ConteudoAnexoSalvo }) {
  return (
    <details className="mt-1 rounded border border-navy/10 bg-cream/60 p-2" data-conteudo-anexo={codigo}>
      <summary className="cursor-pointer text-[11px] font-medium text-navy/70">Ver o conteúdo salvo deste anexo</summary>
      {conteudo.finalidade && <p className="mt-1 text-[11px] text-navy/70">{conteudo.finalidade}</p>}
      {conteudo.motivo && <p className="mt-0.5 text-[11px] text-navy/55">Motivo da seleção: {conteudo.motivo}</p>}
      {conteudo.overrideManual && (
        <p className="mt-1 rounded border border-terracotta/30 bg-terracotta/5 p-1.5 text-[11px] text-navy/75">
          Dispensa manual registrada por decisão humana.
        </p>
      )}
      {conteudo.campos.length > 0 ? (
        <dl className="mt-1.5 divide-y divide-navy/5 rounded border border-navy/10 bg-cream/40">
          {conteudo.campos.map((c, i) => (
            <div key={`${c.rotulo}-${i}`} className="grid gap-0.5 p-2 sm:grid-cols-[200px_1fr]">
              <dt className="text-[11px] text-navy/50">
                {c.rotulo}
                {c.fonte && <span className="block text-[10px] text-navy/35">{c.fonte}</span>}
              </dt>
              <dd className="text-[11px] text-navy/80">
                {c.valor ?? (
                  <span className="text-terracotta">{c.observacaoAusencia ?? "Pendente — não inferido."}</span>
                )}
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="mt-1.5 text-[11px] text-navy/55">
          Esta instância não tem campos gravados — só a regra de aplicabilidade. Materialize o anexo depois de
          preencher a ficha do caso para o conteúdo aparecer aqui.
        </p>
      )}
      {conteudo.pendencias.length > 0 && (
        <ul className="mt-1.5 space-y-0.5 text-[11px] text-terracotta">
          {conteudo.pendencias.map((x) => (
            <li key={x}>• {x}</li>
          ))}
        </ul>
      )}
      {conteudo.impactoAusencia && (
        <p className="mt-1 text-[11px] text-navy/50">Impacto da ausência: {conteudo.impactoAusencia}</p>
      )}
    </details>
  );
}

export function InstanciaDocumental({
  linhas,
  carregando,
}: {
  linhas: LinhaInstancia[];
  carregando?: boolean;
}) {
  const resumo = resumoInstancias(linhas);

  return (
    <section className="rounded-lg border border-navy/15 bg-cream/40 p-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-medium text-navy">Documento oficial do caso</h3>
        <span className="text-[11px] text-navy/55">
          {carregando ? "verificando…" : `${resumo.canonicas} de ${resumo.total} conferem com o documento salvo`}
        </span>
      </div>
      <p className="mt-1 text-xs text-navy/65">{carregando ? "Conferindo o que está salvo neste caso." : resumo.mensagem}</p>

      {!carregando && linhas.length > 0 && (
        <ul className="mt-2 space-y-1.5">
          {linhas.map((l) => (
            <li key={l.codigo} className={`rounded border p-2 ${COR[l.estado]}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-xs font-medium">{l.titulo}</p>
                <span className="text-[10px] uppercase tracking-wide">
                  {ROTULO_ESTADO_INSTANCIA[l.estado]}
                  {l.versao ? ` · versão ${l.versao}` : ""}
                </span>
              </div>
              <p className="mt-0.5 text-[11px] opacity-80">{l.observacao}</p>
              <p className="mt-0.5 text-[11px] opacity-70" data-estado-salvo={l.codigo}>
                Estado salvo: {rotuloStatusAnexoSalvo(l.statusPersistido)} · última materialização{" "}
                {dataCurta(l.atualizadoEm)}
                {l.temConteudo ? " · conteúdo salvo" : " · sem conteúdo salvo"}
              </p>
              {acaoSeguinteAnexo(l.statusPersistido) && (
                <p className="mt-0.5 text-[11px] opacity-75" data-acao-seguinte={l.codigo}>
                  Próximo passo: {acaoSeguinteAnexo(l.statusPersistido)}
                </p>
              )}
              {l.conteudo ? (
                <ConteudoSalvoDoAnexo codigo={l.codigo} conteudo={l.conteudo} />
              ) : (
                <p className="mt-1 text-[11px] opacity-70">
                  Nenhum conteúdo salvo para ler nesta instância.
                </p>
              )}
            </li>
          ))}
        </ul>
      )}

      {!carregando && (
        <DetalhesTecnicos titulo="Detalhes técnicos">
          <table className="min-w-[520px] text-left text-[11px]">
            <thead className="uppercase tracking-wide text-navy/45">
              <tr>
                {["annex_code", "annex_version", "model_version", "status salvo", "status na tela", "file_hash"].map((c) => (
                  <th key={c} className="py-1 pr-3 font-normal">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-navy/70">
              {linhas.map((l) => (
                <tr key={l.codigo} className="border-t border-navy/10">
                  <td className="py-1 pr-3 font-mono">{l.codigo}</td>
                  <td className="py-1 pr-3">{l.versao ?? "—"}</td>
                  <td className="py-1 pr-3">{l.modelo ?? "—"}</td>
                  <td className="py-1 pr-3">{l.statusPersistido ?? "—"}</td>
                  <td className="py-1 pr-3">{l.statusTela ?? "—"}</td>
                  <td className="py-1 pr-3 font-mono">{l.hash ? `${l.hash.slice(0, 12)}…` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </DetalhesTecnicos>
      )}
    </section>
  );
}
