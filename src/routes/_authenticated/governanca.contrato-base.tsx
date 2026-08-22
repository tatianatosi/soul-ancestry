import { createFileRoute } from "@tanstack/react-router";

import { SaasShell } from "@/components/saas/shell";
import { ContratoBaseTexto } from "@/components/contrato/contrato-base-texto";
import { CorpoContratualVersionado } from "@/components/contrato/corpo-contratual";
import { SECOES_DOCUMENTO_PUBLICADO, clausulasSemSecaoPublicada } from "@/lib/contrato-base-consolidado";
import {
  BLOQUEIOS_CANONICOS,
  CONTRATO_BASE_DATA,
  DESTINOS_APOS_APROVACAO,
  ESTRUTURA_CASO_FAMILIAR,
  FONTES_SEM_VALIDACAO_AUTOMATICA,
  ITENS_REVISAO_JURIDICA,
  ORDEM_PRECEDENCIA_FONTES,
  PROIBICOES_IDENTIFICACAO,
  REGRAS_RASCUNHO_E_VERSAO,
  ROTULO_TIPO_RENDER,
  VARIAVEIS_PERMITIDAS,
} from "@/lib/contrato-base-consolidado";
import {
  MARCA_PREVIA_TESTE,
  OBSERVACAO_TERCEIROS_PREVIA,
  ROTULO_ESTADO_PARAMETRO,
  ROTULO_ORIGEM,
  VARIAVEIS_TESTE,
  anexosDaPreviaTeste,
  bloqueiosDaPreviaTeste,
  matrizRenderizacaoPreviaTeste,
  criteriosAceiteTeste,
} from "@/lib/contrato-base-previa";
import { ROTULO_ESTADO_ANEXO } from "@/lib/anexos-dicionario";
import { AnexosIaV, PainelPendenciasContratuais } from "@/components/contrato/anexos-i-v";
import { MARCA_RASCUNHO } from "@/lib/anexos-i-v";
import { ENTRADA_TESTE_ANEXOS } from "@/lib/contrato-base-previa";
import {
  CONFLITOS_TESTE,
  anexosIaVTeste,
  estruturaFamiliarTeste,
  gatesTeste,
  matrizClausulasTeste,
  previaFinalTeste,
} from "@/lib/contrato-base-previa";
import { MatrizClausulas, PerfilInstitucionalBloco } from "@/components/contrato/matriz-clausulas";
import {
  ANEXOS_FAMILIARES,
  FONTES_APENAS_APOIO,
  GATES_BLOQUEANTES,
  MATRIZ_ACEITE_VERSAO,
  ORDEM_FONTES,
  REGRAS_RASCUNHO_VERSAO,
  aceiteConcluido,
} from "@/lib/matriz-aceite";
import { perfilInstitucionalRenderizado } from "@/lib/perfil-institucional";

const TITULO = "Contrato-base consolidado v1.0 | Clube Ancestral";
const DESCRICAO =
  "Fonte canônica do contrato-base MODELO-ESTUDO + BASE-GEN-V2: cláusulas fixas, variáveis permitidas, anexos derivados, bloqueios e prévia TESTE sem dados reais.";

export const Route = createFileRoute("/_authenticated/governanca/contrato-base")({
  head: () => ({
    meta: [
      { title: TITULO },
      { name: "description", content: DESCRICAO },
      { property: "og:title", content: TITULO },
      { property: "og:description", content: DESCRICAO },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Pagina,
});

function Bloco({ titulo, children, nota }: { titulo: string; nota?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-navy/10 bg-white p-5">
      <h2 className="font-serif text-lg text-navy">{titulo}</h2>
      {nota && <p className="mt-1 text-xs text-navy/55">{nota}</p>}
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Lista({ itens }: { itens: readonly string[] }) {
  return (
    <ul className="space-y-1 text-xs text-navy/70">
      {itens.map((i) => (
        <li key={i}>• {i}</li>
      ))}
    </ul>
  );
}

function Pagina() {
  const anexos = anexosDaPreviaTeste();
  const bloqueios = bloqueiosDaPreviaTeste(anexos);
  const matriz = matrizRenderizacaoPreviaTeste(anexos);
  const anexosIV = anexosIaVTeste();
  const perfil = perfilInstitucionalRenderizado();
  const clausulas = matrizClausulasTeste();
  const criterios = criteriosAceiteTeste();
  const previaFinal = previaFinalTeste();
  const familia = estruturaFamiliarTeste();
  const gates = gatesTeste();

  return (
    <SaasShell titulo="Contrato-base consolidado" descricao={`Resgate v1.0 · ${CONTRATO_BASE_DATA} · não vigente`}>
      <div className="space-y-4">
        <ContratoBaseTexto />

        <CorpoContratualVersionado />

        <Bloco
          titulo="Equivalência com o documento consolidado publicado"
          nota="O documento publicado numera 14 seções a partir do Perfil institucional. Internamente o perfil é fonte própria. Nada é renumerado à mão."
        >
          <table className="w-full text-left text-[11px]">
            <thead className="text-navy/55">
              <tr>
                <th className="py-1 pr-2 font-medium">Seção publicada</th>
                <th className="py-1 pr-2 font-medium">Título</th>
                <th className="py-1 pr-2 font-medium">Cláusula interna</th>
                <th className="py-1 font-medium">Fonte versionada</th>
              </tr>
            </thead>
            <tbody>
              {SECOES_DOCUMENTO_PUBLICADO.map((sec) => (
                <tr key={sec.secao} className="border-t border-navy/10 text-navy/75">
                  <td className="py-1 pr-2">{sec.secao}</td>
                  <td className="py-1 pr-2">{sec.titulo}</td>
                  <td className="py-1 pr-2">{sec.clausulaInterna ? `Cláusula ${sec.clausulaInterna}` : "Perfil Institucional"}</td>
                  <td className="py-1">{sec.fonte}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {clausulasSemSecaoPublicada().length > 0 && (
            <p className="mt-2 text-[11px] text-terracotta">
              Cláusulas internas sem seção publicada: {clausulasSemSecaoPublicada().join(", ")} — revisão humana necessária.
            </p>
          )}
        </Bloco>

        <Bloco titulo="Proibições de identificação da contratada" nota="Nunca podem aparecer em contrato, prévia, log, App ou prompt.">
          <Lista itens={PROIBICOES_IDENTIFICACAO} />
        </Bloco>

        <Bloco titulo="Variáveis permitidas no motor" nota="Cláusulas fixas não são texto livre. Só estas variáveis podem ser preenchidas por caso.">
          <div className="overflow-x-auto">
            <table className="min-w-[900px] text-left text-xs">
              <thead className="text-[10px] uppercase tracking-wide text-navy/45">
                <tr>
                  <th className="py-1 pr-3">Grupo</th>
                  <th className="py-1 pr-3">Variáveis permitidas</th>
                  <th className="py-1">Fonte prioritária</th>
                </tr>
              </thead>
              <tbody className="text-navy/75">
                {VARIAVEIS_PERMITIDAS.map((g) => (
                  <tr key={g.grupo} className="border-t border-navy/10 align-top">
                    <td className="py-1.5 pr-3 font-medium text-navy">{g.grupo}</td>
                    <td className="py-1.5 pr-3">{g.variaveis.join(", ")}</td>
                    <td className="py-1.5">{g.fontePrioritaria}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-navy/10 bg-cream/40 p-3">
              <p className="text-[11px] font-medium uppercase tracking-wide text-navy/60">Ordem de precedência</p>
              <ol className="mt-1 space-y-0.5 text-xs text-navy/70">
                {ORDEM_PRECEDENCIA_FONTES.map((f, i) => (
                  <li key={f}>
                    {i + 1}. {f}
                  </li>
                ))}
              </ol>
            </div>
            <div className="rounded-lg border border-terracotta/30 bg-terracotta/5 p-3">
              <p className="text-[11px] font-medium uppercase tracking-wide text-navy/60">Nunca validam parâmetro automaticamente</p>
              <Lista itens={FONTES_SEM_VALIDACAO_AUTOMATICA} />
            </div>
          </div>
        </Bloco>

        <Bloco titulo="Regras do motor" nota="Rascunho único por caso/modelo; snapshot só por evento de governança.">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-navy/60">Rascunho e versões</p>
              <Lista itens={REGRAS_RASCUNHO_E_VERSAO} />
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-navy/60">Bloqueios canônicos</p>
              <Lista itens={BLOQUEIOS_CANONICOS} />
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-navy/60">Estrutura do caso familiar</p>
              <Lista itens={ESTRUTURA_CASO_FAMILIAR} />
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-navy/60">Destinos após aprovação</p>
              <Lista itens={DESTINOS_APOS_APROVACAO} />
            </div>
          </div>
        </Bloco>

        {/* -------- Prévia TESTE -------- */}
        <section className="rounded-xl border-2 border-dashed border-terracotta/50 bg-terracotta/5 p-5">
          <h2 className="font-serif text-lg text-navy">Prévia TESTE do motor</h2>
          <p className="mt-1 text-xs font-medium uppercase tracking-wide text-terracotta">{MARCA_PREVIA_TESTE}</p>
          <p className="mt-2 text-xs text-navy/70">
            Núcleo fictício com dois requerentes adultos e um dependente menor. Nenhum dado real, nenhum caso vinculado. Nada é
            enviado, assinado, cobrado ou pesquisado externamente a partir desta tela.
          </p>

          <div className="mt-4 overflow-x-auto rounded-lg border border-navy/10 bg-white p-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-navy/60">Variáveis com origem, estado e versão</p>
            <table className="mt-2 min-w-[860px] text-left text-xs">
              <thead className="text-[10px] uppercase tracking-wide text-navy/45">
                <tr>
                  <th className="py-1 pr-3">Campo</th>
                  <th className="py-1 pr-3">Valor</th>
                  <th className="py-1 pr-3">Origem</th>
                  <th className="py-1 pr-3">Estado</th>
                  <th className="py-1">Versão da fonte</th>
                </tr>
              </thead>
              <tbody className="text-navy/75">
                {VARIAVEIS_TESTE.map((v) => (
                  <tr key={v.campo} className="border-t border-navy/10 align-top">
                    <td className="py-1.5 pr-3 font-medium text-navy">{v.rotulo}</td>
                    <td className="py-1.5 pr-3">{v.valor ?? <span className="text-terracotta">pendente — não inferido</span>}</td>
                    <td className="py-1.5 pr-3">{ROTULO_ORIGEM[v.origem]}</td>
                    <td className="py-1.5 pr-3">{ROTULO_ESTADO_PARAMETRO[v.estado]}</td>
                    <td className="py-1.5">{v.versaoFonte ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 rounded-lg border border-navy/10 bg-white p-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-navy/60">Anexos derivados por regra</p>
            <ul className="mt-2 space-y-2">
              {anexos.map((a) => (
                <li key={a.codigo} className="rounded border border-navy/10 p-2 text-xs">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="font-medium text-navy">
                      {a.codigo} — {a.titulo}
                    </span>
                    <span className="font-mono text-[10px] text-navy/50">{ROTULO_ESTADO_ANEXO[a.estado]}</span>
                  </div>
                  <p className="mt-1 text-navy/65">{a.motivo}</p>
                  {a.instancias.length > 0 && (
                    <p className="mt-1 text-navy/55">Instâncias: {a.instancias.map((i) => i.titulo).join(" · ")}</p>
                  )}
                  {a.pendencias.length > 0 && <p className="mt-1 text-terracotta">Pendências: {a.pendencias.join(" ")}</p>}
                </li>
              ))}
            </ul>
            <p className="mt-2 rounded border border-navy/10 bg-cream/40 p-2 text-[11px] text-navy/70">
              Cláusula institucional aplicada ao ANX-COMERCIAL: {OBSERVACAO_TERCEIROS_PREVIA}
            </p>
          </div>

          <div className="mt-3 rounded-lg border border-navy/10 bg-white p-3">
            <div className="mb-3">
              <PerfilInstitucionalBloco campos={perfil.campos} versao={perfil.versao} status={perfil.status} pendencias={perfil.pendencias} />
            </div>
            <div className="mb-3">
              <MatrizClausulas linhas={clausulas} />
            </div>
            <div className="mb-3 rounded-lg border border-navy/10 bg-cream/40 p-3 text-xs text-navy/70">
              <p className="text-[11px] font-medium uppercase tracking-wide text-navy/60">
                Prévia final — {previaFinal.liberada ? "liberada" : "bloqueada"}
              </p>
              <ul className="mt-1 space-y-1">
                {previaFinal.motivos.map((m) => (
                  <li key={m}>• {m}</li>
                ))}
              </ul>
              <p className="mt-2">
                Caso familiar (TESTE): signatários {familia.signatarios.join(", ") || "—"} · não signatários{" "}
                {familia.naoSignatarios.join(", ") || "—"} · ANX-INDIVIDUAL para {familia.anexosIndividuais.length}{" "}
                requerente(s) adulto(s) · ANX-REPRESENTACAO {familia.representacaoAplicavel ? "aplicável" : "não aplicável"} ·
                contratos paralelos: {familia.contratosParalelos}.
              </p>
            </div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-navy/60">Anexos I–V governados (TESTE)</p>
            <div className="mt-2">
              <AnexosIaV anexos={anexosIV} entrada={ENTRADA_TESTE_ANEXOS} />
            </div>
            <div className="mt-3">
              <PainelPendenciasContratuais anexos={anexosIV} conflitos={CONFLITOS_TESTE} gates={gates} />
            </div>
            <p className="mt-2 rounded border border-navy/10 bg-cream/40 p-2 text-[11px] uppercase tracking-wide text-navy/60">
              {MARCA_RASCUNHO}
            </p>
          </div>

          <div className="mt-3 rounded-lg border border-navy/10 bg-white p-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-navy/60">Bloqueios explicáveis com rota de resolução</p>
            <ul className="mt-2 space-y-1 text-xs">
              {bloqueios.map((b) => (
                <li key={b.titulo} className="rounded border border-terracotta/30 bg-terracotta/5 p-2">
                  <span className="font-medium text-navy">{b.titulo}</span>
                  <p className="text-navy/70">{b.motivo}</p>
                  <p className="text-navy/50">Resolver em: {b.rotaResolucao}</p>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-navy/60">
              Enquanto houver bloqueio, a prévia serve apenas para leitura interna: revisão final, assinatura, cobrança, portal e
              pesquisa externa permanecem indisponíveis.
            </p>
          </div>
        </section>

        <Bloco titulo="Matriz de renderização e aceite" nota="Situação de cada bloco na prévia TESTE acima.">
          <div className="overflow-x-auto">
            <table className="min-w-[1000px] text-left text-xs">
              <thead className="text-[10px] uppercase tracking-wide text-navy/45">
                <tr>
                  <th className="py-1 pr-3">Bloco/cláusula</th>
                  <th className="py-1 pr-3">Fonte exigida</th>
                  <th className="py-1 pr-3">Tipo</th>
                  <th className="py-1 pr-3">Cláusulas</th>
                  <th className="py-1 pr-3">Renderiza</th>
                  <th className="py-1 pr-3">Gate</th>
                  <th className="py-1">Situação na prévia TESTE</th>
                </tr>
              </thead>
              <tbody className="text-navy/75">
                {matriz.map((l) => (
                  <tr key={l.bloco} className="border-t border-navy/10 align-top">
                    <td className="py-1.5 pr-3 font-medium text-navy">{l.bloco}</td>
                    <td className="py-1.5 pr-3">{l.fonteExigida}</td>
                    <td className="py-1.5 pr-3">{ROTULO_TIPO_RENDER[l.tipo]}</td>
                    <td className="py-1.5 pr-3 font-mono text-[10px]">{l.clausulas.join(", ")}</td>
                    <td className="py-1.5 pr-3">{l.renderiza === "sempre" ? "Sim" : "Quando aplicável"}</td>
                    <td className="py-1.5 pr-3">{l.gate}</td>
                    <td className={`py-1.5 ${l.situacao === "renderizado" ? "text-navy/70" : "text-terracotta"}`}>
                      {l.situacao === "renderizado"
                        ? "Renderizado"
                        : l.situacao === "nao_aplicavel"
                          ? "Não aplicável"
                          : "Renderizado com pendência"}
                      <span className="block text-[10px] text-navy/50">{l.motivo}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Bloco>

        <Bloco
          titulo={`Ordem de fontes, anexos familiares e gates — ${MATRIZ_ACEITE_VERSAO}`}
          nota="Especificação técnica e de aceite do motor contratual. Nada é enviado, assinado, cobrado ou pesquisado a partir daqui."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-navy/10 bg-cream/40 p-3">
              <p className="text-[11px] font-medium uppercase tracking-wide text-navy/60">Ordem de fontes</p>
              <ol className="mt-1 space-y-0.5 text-xs text-navy/70">
                {ORDEM_FONTES.map((f) => (
                  <li key={f.ordem}>
                    {f.ordem}. {f.fonte}
                  </li>
                ))}
              </ol>
              <p className="mt-2 text-[11px] text-terracotta">{FONTES_APENAS_APOIO}</p>
            </div>
            <div className="rounded-lg border border-navy/10 bg-white p-3">
              <p className="text-[11px] font-medium uppercase tracking-wide text-navy/60">Anexos familiares</p>
              <table className="mt-1 w-full text-left text-[11px] text-navy/70">
                <tbody>
                  {ANEXOS_FAMILIARES.map((a) => (
                    <tr key={a.anexo} className="border-t border-navy/10 align-top">
                      <td className="py-1 pr-2 font-medium text-navy">{a.anexo}</td>
                      <td className="py-1">{a.regra}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-navy/60">Rascunho e versões</p>
              <Lista itens={REGRAS_RASCUNHO_VERSAO} />
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-navy/60">
                Gates bloqueantes (prévia final, revisão, assinatura, financeiro, portal, pesquisa externa)
              </p>
              <Lista itens={GATES_BLOQUEANTES} />
            </div>
          </div>
        </Bloco>

        <Bloco
          titulo={`Critérios de aceite — ${aceiteConcluido(criterios) ? "atendidos na prévia TESTE" : "pendentes"}`}
          nota="A implementação só está concluída quando a prévia interna de TESTE demonstra os oito critérios."
        >
          <table className="w-full text-left text-[11px]">
            <tbody className="text-navy/75">
              {criterios.map((c) => (
                <tr key={c.id} className="border-t border-navy/10 align-top">
                  <td className="py-1.5 pr-2 font-medium text-navy">{c.id}</td>
                  <td className="py-1.5 pr-2">{c.criterio}</td>
                  <td className={`py-1.5 pr-2 ${c.atendido ? "text-emerald-700" : "text-terracotta"}`}>
                    {c.atendido ? "Atendido" : "Pendente"}
                  </td>
                  <td className="py-1.5 text-navy/55">{c.observacao}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Bloco>

        <Bloco titulo="Itens a validar juridicamente" nota="Revisar antes de mudar o status para vigente ou permitir assinatura.">
          <Lista itens={ITENS_REVISAO_JURIDICA} />
        </Bloco>
      </div>
    </SaasShell>
  );
}
