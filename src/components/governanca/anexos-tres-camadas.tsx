/**
 * Anexos I–V em três camadas, para o caso aberto (31/10/2026).
 *
 * Somente leitura. A) instância técnica e C) instância do caso saem das linhas
 * reais de `contract_annexes` do caso; B) conteúdo jurídico homologado é fato do
 * repositório, igual para todo caso. Sem linha = "sem registro". Nenhuma ação
 * externa é executada aqui.
 */

import { EstadoDados } from "@/components/saas/estado-dados";
import type { InstanciaPersistida } from "@/lib/anexos-instancia";
import {
  ANEXOS_TRES_CAMADAS_VERSAO,
  CAUSA_CONTRADICAO,
  CONFIRMACAO_RECONCILIACAO_ANEXOS,
  ROTULO_ESTADO_RECONCILIACAO,
} from "@/lib/anexos-tres-camadas";
import { montarTresCamadasDoCaso } from "@/lib/anexos-tres-camadas-caso";

function Bloco({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-navy/10 bg-cream/40 p-4">
      <h3 className="text-sm font-medium text-navy">{titulo}</h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Etiqueta({ estado }: { estado: keyof typeof ROTULO_ESTADO_RECONCILIACAO }) {
  const critico =
    estado === "MODELO_JURIDICO_NAO_LOCALIZADO" || estado === "AGUARDA_MATERIALIZACAO";
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

const ROTULO_SITUACAO = {
  ausente: "Sem registro",
  parcial: "Parcial",
  presente: "Presente",
} as const;
const CABECALHOS = [
  "Anexo",
  "A. Instância técnica",
  "B. Conteúdo jurídico homologado",
  "C. Instância do caso",
  "Estados",
];

export function AnexosTresCamadasPainel({
  instancias,
  carregando,
  erro,
  aoTentarNovamente,
}: {
  instancias: InstanciaPersistida[] | undefined;
  carregando?: boolean;
  erro?: unknown;
  aoTentarNovamente?: () => void;
}) {
  return (
    <div className="space-y-4" data-anexos-tres-camadas>
      <EstadoDados
        carregando={carregando}
        erro={erro}
        dados={instancias ? [montarTresCamadasDoCaso(instancias)] : undefined}
        aoTentarNovamente={aoTentarNovamente}
        recurso="os anexos do caso"
      >
        {([painel]) => (
          <>
            <Bloco titulo={`Reconciliação Anexos I–V (${ANEXOS_TRES_CAMADAS_VERSAO})`}>
              <p className="text-[11px] leading-relaxed text-navy/70">{CAUSA_CONTRADICAO}</p>
              <p className="mt-2 text-[11px] text-navy/50">
                Lido de contract_annexes para este caso: {painel.totalInstancias} instância(s).
                Metadados apenas, sem expor conteúdo. Nada é alterado aqui.
              </p>
            </Bloco>
            <Bloco titulo="Três camadas independentes">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[860px] text-left text-[11px] text-navy/70">
                  <thead className="text-navy/45">
                    <tr>
                      {CABECALHOS.map((h) => (
                        <th key={h} className="px-2 py-1 font-medium">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy/5">
                    {painel.linhas.map((l) => (
                      <tr key={l.codigo} className="align-top" data-anexo-tres-camadas={l.codigo}>
                        <td className="px-2 py-2 font-medium text-navy">
                          {l.nome}
                          <span className="block text-navy/40">{l.annexCode}</span>
                        </td>
                        <td className="px-2 py-2">
                          {l.tecnica.presente ? `Existe · v${l.tecnica.versao}` : "Sem registro"}
                          {l.tecnica.presente ? (
                            <span className="block text-navy/45">
                              {l.tecnica.status} · {l.tecnica.modelVersion ?? "sem modelo"} ·
                              conteúdo {l.tecnica.temConteudo ? "sim" : "não"} · hash{" "}
                              {l.tecnica.temHash ? "sim" : "não"}
                              {l.tecnica.ehTeste ? " · instância de teste" : ""}
                            </span>
                          ) : null}
                        </td>
                        <td className="px-2 py-2">
                          {l.juridica.presente ? "Localizado" : "Não localizado"}
                          <span className="block text-navy/45">
                            {l.juridica.fonteAprovada ?? "sem fonte aprovada"} ·{" "}
                            {l.juridica.versao ?? "sem versão"}
                          </span>
                          <span className="block text-navy/40">{l.juridica.observacao}</span>
                        </td>
                        <td className="px-2 py-2">
                          {ROTULO_SITUACAO[l.situacaoDoCaso]}
                          {l.parametrosAusentes.length > 0 ? (
                            <span className="block text-navy/40">
                              Pendente: {l.parametrosAusentes.join(", ")}
                            </span>
                          ) : null}
                        </td>
                        <td className="px-2 py-2">
                          <div className="flex flex-wrap gap-1">
                            {l.estados.map((e) => (
                              <Etiqueta key={e} estado={e} />
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {painel.outrosAnexos.length > 0 ? (
                <p className="mt-3 text-[11px] text-navy/55">
                  Outros anexos deste caso:{" "}
                  {painel.outrosAnexos.map((o) => `${o.annexCode} (${o.status})`).join(", ")}.
                </p>
              ) : null}
            </Bloco>
          </>
        )}
      </EstadoDados>
      <p className="rounded-xl border border-gold/40 bg-cream p-3 text-[11px] text-navy/80">
        {CONFIRMACAO_RECONCILIACAO_ANEXOS}
      </p>
    </div>
  );
}
