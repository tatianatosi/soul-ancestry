/**
 * Tela somente-leitura da varredura final de completude.
 * Nenhuma ação é executada aqui: apenas consolidação e leitura.
 */

import {
  ANEXOS_VARREDURA,
  CONFIRMACAO_VARREDURA_COMPLETUDE,
  CONSOLIDADO_ANA,
  COBERTURA_TESTES,
  CRITICIDADES,
  FONTES_VARREDURA,
  LACUNAS_DEPENDENTES_DE_TERCEIROS,
  REGRA_ANEXOS_NAO_LOCALIZADOS,
  ROTULO_ACAO_PROPRIETARIA,
  ROTULO_AREA_PENDENCIA,
  ROTULO_CLASSE_TESTE,
  ROTULO_CRITICIDADE,
  ROTULO_ESTADO_ANEXO_VARREDURA,
  VARREDURA_COMPLETUDE_DATA,
  VARREDURA_COMPLETUDE_VERSAO,
  acoesDisponiveis,
  aguardandoConfirmacaoExterna,
  pendenciasPorArea,
  pendenciasPorCriticidade,
  pendenciasSuperaveis,
  type LinhaPendencia,
} from "@/lib/varredura-completude";
import { AnexosTresCamadasPainel } from "@/components/governanca/anexos-tres-camadas";


function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-navy/10 bg-cream/40 p-4">
      <h2 className="text-sm font-medium text-navy">{titulo}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function corCriticidade(c: string) {
  if (c === "critico") return "bg-terracotta/15 text-terracotta";
  if (c === "alto") return "bg-gold/20 text-navy";
  if (c === "medio") return "bg-navy/10 text-navy/70";
  return "bg-cream text-navy/60";
}

function LinhaMatriz({ l }: { l: LinhaPendencia }) {
  return (
    <li className="rounded-lg border border-navy/10 p-3 text-[11px] text-navy/70">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium text-navy">{l.id}</span>
        <span className="rounded-full border border-navy/15 px-2 py-0.5 uppercase tracking-wide">{l.status}</span>
        <span className={`rounded-full px-2 py-0.5 ${corCriticidade(l.criticidade)}`}>
          {ROTULO_CRITICIDADE[l.criticidade]}
        </span>
        <span className="text-navy/45">{l.entidade}</span>
        {l.caso && <span className="text-navy/45">· caso {l.caso}</span>}
      </div>
      <p className="mt-1">{l.evidencia}</p>
      <p className="text-navy/55">Risco: {l.risco}</p>
      <p className="text-navy/55">
        Interno: {l.efeitoInterno} · Externo: {l.efeitoExterno}
      </p>
      <p className="text-navy/55">
        Responsável: {l.responsavel} · Próxima ação: {l.proximaAcao}
      </p>
      <p className="text-navy/45">
        Superável por decisão auditada: {l.superavelPorDecisaoAuditada ? "sim" : "não"}
        {l.dependencias.length > 0 && ` · Depende de: ${l.dependencias.join(", ")}`}
        {l.prazo && ` · Prazo: ${l.prazo}`}
      </p>
      <p className="text-navy/45">Encerramento: {l.criterioEncerramento}</p>
      <p className="mt-1 text-navy/45">
        Ações internas: {acoesDisponiveis(l).map((a) => ROTULO_ACAO_PROPRIETARIA[a]).join(" · ")}
      </p>
    </li>
  );
}

export function VarreduraCompletude() {
  const porArea = pendenciasPorArea();
  const superaveis = pendenciasSuperaveis();
  const externas = aguardandoConfirmacaoExterna();

  return (
    <div className="space-y-4">
      <Secao titulo={`Escopo da varredura (${VARREDURA_COMPLETUDE_VERSAO} · ${VARREDURA_COMPLETUDE_DATA})`}>
        <ul className="space-y-0.5 text-[11px] text-navy/65">
          {FONTES_VARREDURA.map((f) => (
            <li key={f}>• {f}</li>
          ))}
        </ul>
      </Secao>

      <Secao titulo="1. Anexos I–V — reconciliação em três camadas">
        <AnexosTresCamadasPainel />
      </Secao>

      <Secao titulo="1.1 Anexos I–V — leitura original da varredura (histórico)">
        <p className="mb-2 text-[11px] text-navy/55">{REGRA_ANEXOS_NAO_LOCALIZADOS}</p>
        <p className="mb-2 text-[11px] text-navy/45">
          Mantido como histórico. A leitura vigente é a reconciliação em três camadas acima.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left text-[11px] text-navy/70">
            <thead className="text-navy/45">
              <tr>
                {[
                  "Anexo",
                  "Existe",
                  "Localização / ID / versão",
                  "Estado",
                  "Verificação",
                  "Integridade",
                  "Gatilho e dependências",
                  "Impacto se ausente",
                  "Prévia",
                  "Ação interna",
                  "Ação externa",
                ].map((h) => (
                  <th key={h} className="px-2 py-1 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-navy/5">
              {ANEXOS_VARREDURA.map((a) => (
                <tr key={a.codigo} className="align-top">
                  <td className="px-2 py-2 font-medium text-navy">{a.nome}</td>
                  <td className="px-2 py-2">{a.existe ? "Sim" : "Não"}</td>
                  <td className="px-2 py-2">
                    {a.localizacao}
                    <span className="block text-navy/45">
                      {a.id} · {a.versao ?? "sem versão"}
                    </span>
                    <span className="block text-navy/40">
                      Busca: {a.fonteBusca} ({a.dataBusca})
                    </span>
                  </td>
                  <td className="px-2 py-2">{ROTULO_ESTADO_ANEXO_VARREDURA[a.estado]}</td>
                  <td className="px-2 py-2">
                    {a.verificacao === "verificado_diretamente" ? "Verificado diretamente" : "Apenas citado em relatório"}
                  </td>
                  <td className="px-2 py-2">
                    {a.integridade}
                    <span className="block text-navy/45">{a.relacaoContratoBase}</span>
                  </td>
                  <td className="px-2 py-2">
                    {a.gatilhoUso}
                    <span className="block text-navy/45">{a.dependencias.join(", ")}</span>
                  </td>
                  <td className="px-2 py-2">{a.impactoAusencia}</td>
                  <td className="px-2 py-2">{a.permitePreviaInterna ? "Sim, com marca de rascunho" : "Não"}</td>
                  <td className="px-2 py-2">{a.acaoInternaProprietaria}</td>
                  <td className="px-2 py-2">{a.acaoExternaComConfirmacao}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Secao>

      <Secao titulo="2. Matriz única de pendências">
        <div className="space-y-3">
          {Object.entries(porArea)
            .filter(([, linhas]) => linhas.length > 0)
            .map(([area, linhas]) => (
              <div key={area}>
                <p className="text-[11px] font-medium uppercase tracking-wide text-navy/55">
                  {ROTULO_AREA_PENDENCIA[area as keyof typeof ROTULO_AREA_PENDENCIA]}
                </p>
                <ul className="mt-1 space-y-2">
                  {linhas.map((l) => (
                    <LinhaMatriz key={l.id} l={l} />
                  ))}
                </ul>
              </div>
            ))}
        </div>
      </Secao>

      <Secao titulo="Itens por criticidade">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {CRITICIDADES.map((c) => (
            <div key={c} className="rounded-lg border border-navy/10 p-2">
              <p className={`inline-block rounded-full px-2 py-0.5 text-[10px] ${corCriticidade(c)}`}>
                {ROTULO_CRITICIDADE[c]}
              </p>
              <ul className="mt-1 space-y-0.5 text-[11px] text-navy/65">
                {pendenciasPorCriticidade(c).map((l) => (
                  <li key={l.id}>
                    {l.id} — {l.entidade}
                  </li>
                ))}
                {pendenciasPorCriticidade(c).length === 0 && <li className="text-navy/40">Nenhum.</li>}
              </ul>
            </div>
          ))}
        </div>
      </Secao>

      <Secao titulo="3. Caso Ana Luiza">
        <p className="text-[11px] text-navy/70">
          ID canônico recomendado: <span className="font-medium text-navy">{CONSOLIDADO_ANA.idCanonicoRecomendado}</span>{" "}
          · alias histórico: {CONSOLIDADO_ANA.idAlternativo}
        </p>
        <p className="text-[11px] text-navy/50">{CONSOLIDADO_ANA.justificativaId}</p>
        <ul className="mt-2 space-y-0.5 text-[11px] text-navy/70">
          {CONSOLIDADO_ANA.itens.map((i) => (
            <li key={i.rotulo}>
              <span className="font-medium text-navy">{i.rotulo}:</span> {i.situacao}
            </li>
          ))}
        </ul>
      </Secao>

      <Secao titulo="4. Ações internas disponíveis e atos que aguardam confirmação externa">
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-navy/55">
              Superáveis por decisão interna auditada
            </p>
            <ul className="mt-1 space-y-0.5 text-[11px] text-navy/70">
              {superaveis.map((l) => (
                <li key={l.id}>
                  {l.id} — {l.proximaAcao}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-navy/55">
              Só avançam com confirmação externa explícita
            </p>
            <ul className="mt-1 space-y-0.5 text-[11px] text-navy/70">
              {externas.map((l) => (
                <li key={l.id}>
                  {l.id} — {l.efeitoExterno}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Secao>

      <Secao titulo="5. Cobertura de testes">
        <ul className="space-y-1 text-[11px] text-navy/70">
          {COBERTURA_TESTES.map((t) => (
            <li key={t.tema} className="rounded border border-navy/10 p-2">
              <span className="font-medium text-navy">{t.tema}</span> — {ROTULO_CLASSE_TESTE[t.classe]}
              <span className="block text-navy/45">{t.arquivo ?? "sem arquivo"}</span>
              <span className="block text-navy/55">{t.observacao}</span>
            </li>
          ))}
        </ul>
      </Secao>

      <Secao titulo="Lacunas que dependem de fonte, advogado ou dado fornecido">
        <ul className="space-y-0.5 text-[11px] text-navy/70">
          {LACUNAS_DEPENDENTES_DE_TERCEIROS.map((l) => (
            <li key={l}>• {l}</li>
          ))}
        </ul>
      </Secao>

      <p className="rounded-xl border border-navy/10 bg-cream/60 p-3 text-[11px] text-navy/70">
        {CONFIRMACAO_VARREDURA_COMPLETUDE}
      </p>
    </div>
  );
}
