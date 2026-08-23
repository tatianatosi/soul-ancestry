/**
 * Apresentação somente-leitura da reconciliação dos Anexos I–V.
 * Nenhuma ação é executada aqui: apenas classificação em três camadas.
 */

import {
  ANEXOS_TRES_CAMADAS,
  ANEXOS_TRES_CAMADAS_DATA,
  ANEXOS_TRES_CAMADAS_VERSAO,
  CAUSA_CONTRADICAO,
  CONFIRMACAO_RECONCILIACAO_ANEXOS,
  CORRECOES_AFIRMACOES,
  EVIDENCIA_CONTRACT_ANNEXES,
  QUADRO_ANA,
  ROTULO_ESTADO_RECONCILIACAO,
} from "@/lib/anexos-tres-camadas";

function Bloco({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-navy/10 bg-white p-4">
      <h2 className="text-sm font-medium text-navy">{titulo}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Etiqueta({ estado }: { estado: keyof typeof ROTULO_ESTADO_RECONCILIACAO }) {
  const critico = estado === "MODELO_JURIDICO_NAO_LOCALIZADO" || estado === "AGUARDA_MATERIALIZACAO";
  const ausente = estado === "INSTANCIA_DO_CASO_AUSENTE" || estado === "INSTANCIA_DO_CASO_PARCIAL";
  const cor = critico
    ? "bg-terracotta/15 text-terracotta"
    : ausente
      ? "bg-gold/20 text-navy"
      : "bg-cream text-navy/70";
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide ${cor}`}>
      {ROTULO_ESTADO_RECONCILIACAO[estado]}
    </span>
  );
}

export function AnexosTresCamadasPainel() {
  return (
    <div className="space-y-4">
      <Bloco titulo={`Reconciliação Anexos I–V (${ANEXOS_TRES_CAMADAS_VERSAO} · ${ANEXOS_TRES_CAMADAS_DATA})`}>
        <p className="text-[11px] leading-relaxed text-navy/70">{CAUSA_CONTRADICAO}</p>
        <p className="mt-2 text-[11px] text-navy/50">
          Consulta direta a contract_annexes; metadados apenas, sem exposição de conteúdo sensível. Nenhum dado,
          documento, contrato ou integração foi alterado.
        </p>
      </Bloco>

      <Bloco titulo="Tabela única — três camadas independentes">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-[11px] text-navy/70">
            <thead className="text-navy/45">
              <tr>
                {[
                  "Anexo",
                  "A. Instância técnica no app",
                  "B. Conteúdo jurídico homologado",
                  "C. Instância do caso (Ana Luiza)",
                  "Estados",
                  "Leitura única",
                ].map((h) => (
                  <th key={h} className="px-2 py-1 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-navy/5">
              {ANEXOS_TRES_CAMADAS.map((a) => (
                <tr key={a.codigo} className="align-top">
                  <td className="px-2 py-2 font-medium text-navy">
                    {a.nome}
                    <span className="block text-navy/40">{a.annexCode}</span>
                  </td>
                  <td className="px-2 py-2">
                    {a.tecnica.presente ? "Existe e persiste" : "Não existe"}
                    <span className="block text-navy/45">
                      {a.tecnica.registrosAtivos} ativo(s) · {a.tecnica.registrosArquivados} arquivado(s) ·{" "}
                      {a.tecnica.modelVersion ?? "sem modelo"}
                    </span>
                    <span className="block text-navy/45">
                      structured_data {a.tecnica.temStructuredData ? "sim" : "não"} · hash{" "}
                      {a.tecnica.temHash ? "sim" : "não"} · html {a.tecnica.tamanhoRenderedHtml} car.
                    </span>
                    <span className="block text-navy/40">{a.tecnica.vinculoCanonico}</span>
                    <span className="block text-navy/40">{a.tecnica.rlsProprietaria}</span>
                  </td>
                  <td className="px-2 py-2">
                    {a.juridica.presente ? "Localizado" : "Não localizado"}
                    <span className="block text-navy/45">
                      {a.juridica.fonteAprovada ?? "sem fonte aprovada"} · {a.juridica.versao ?? "sem versão"} ·{" "}
                      {a.juridica.responsavel ?? "sem responsável"}
                    </span>
                    <span className="block text-navy/40">{a.juridica.observacao}</span>
                  </td>
                  <td className="px-2 py-2">
                    {a.caso.presente ? (a.caso.parcial ? "Parcial" : "Presente") : "Ausente"}
                    <span className="block text-navy/45">{a.caso.estado}</span>
                    <span className="block text-navy/40">
                      Parâmetros ausentes: {a.caso.parametrosAusentes.join(", ") || "—"}
                    </span>
                  </td>
                  <td className="px-2 py-2">
                    <div className="flex flex-wrap gap-1">
                      {a.estados.map((e) => (
                        <Etiqueta key={e} estado={e} />
                      ))}
                    </div>
                  </td>
                  <td className="px-2 py-2">{a.frasePadrao}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Bloco>

      <Bloco titulo={`Caso ${QUADRO_ANA.casoCodigo}`}>
        <ul className="space-y-1 text-[11px] text-navy/70">
          <li>• Anexos com vínculo de caso: {QUADRO_ANA.anexosComVinculoDeCaso.join(", ") || "nenhum"}</li>
          <li>
            • Anexos apenas vinculados ao contrato: {QUADRO_ANA.anexosApenasVinculadosAoContrato.join(", ") || "nenhum"}
          </li>
          <li>• Anexos com parâmetros ausentes: {QUADRO_ANA.anexosComParametrosAusentes.join(", ")}</li>
          <li>• Anexos com conteúdo placeholder: {QUADRO_ANA.anexosComConteudoPlaceholder.join(", ")}</li>
          <li>• Anexos que abrem prévia interna: {QUADRO_ANA.anexosComPreviaInterna.join(", ")}</li>
          <li>
            • Anexos que exigem fonte jurídica antes de uso externo: {QUADRO_ANA.anexosQueExigemFonteJuridica.join(", ")}
          </li>
          <li className="text-navy/55">
            • Contrato do caso: {QUADRO_ANA.contratoId} · {QUADRO_ANA.contratoStatus}
          </li>
          <li className="text-navy/55">{QUADRO_ANA.observacao}</li>
        </ul>
      </Bloco>

      <Bloco titulo="Afirmações anteriores corrigidas">
        <ul className="space-y-2 text-[11px] text-navy/70">
          {CORRECOES_AFIRMACOES.map((c) => (
            <li key={c.id} className="rounded-lg border border-navy/10 p-3">
              <span className="font-medium text-navy">{c.id}</span>
              <span className="ml-2 rounded-full border border-navy/15 px-2 py-0.5 text-[10px] uppercase tracking-wide">
                {c.origem === "auditoria_de_realidade" ? "Auditoria de realidade" : "Varredura de completude"}
              </span>
              <p className="mt-1 text-navy/55">Antes: {c.afirmacaoAnterior}</p>
              <p className="text-navy/75">Agora: {c.correcao}</p>
            </li>
          ))}
        </ul>
      </Bloco>

      <Bloco titulo="Evidência da consulta (metadados)">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-[11px] text-navy/70">
            <thead className="text-navy/45">
              <tr>
                {["annex_code", "case_id / contract_id", "versão / modelo", "status", "structured_data", "html", "hash"].map(
                  (h) => (
                    <th key={h} className="px-2 py-1 font-medium">
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-navy/5">
              {EVIDENCIA_CONTRACT_ANNEXES.map((e) => (
                <tr key={e.registroId} className="align-top">
                  <td className="px-2 py-2 text-navy">
                    {e.annexCode}
                    {e.arquivado && <span className="ml-1 text-terracotta">(arquivado)</span>}
                  </td>
                  <td className="px-2 py-2">
                    {e.casoCodigo ?? (e.caseId ? e.caseId : "case_id nulo")}
                    <span className="block text-navy/40">{e.contractId ?? "sem contract_id"}</span>
                  </td>
                  <td className="px-2 py-2">
                    v{e.annexVersion} · {e.modelVersion ?? "sem modelo"}
                  </td>
                  <td className="px-2 py-2">{e.status}</td>
                  <td className="px-2 py-2">{e.temStructuredData ? "sim" : "não"}</td>
                  <td className="px-2 py-2">{e.tamanhoRenderedHtml}</td>
                  <td className="px-2 py-2">{e.temHash ? "sim" : "não"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Bloco>

      <p className="rounded-xl border border-gold/40 bg-cream p-3 text-[11px] text-navy/80">
        {CONFIRMACAO_RECONCILIACAO_ANEXOS}
      </p>
    </div>
  );
}
