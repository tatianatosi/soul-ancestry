/**
 * Leads do go-live: uma leitura por lead, com o gráfico de etapas do fluxo
 * já mapeado (Lead -> Discovery -> Call -> Proposta -> Handoff).
 *
 * Discovery e Call gravam de verdade, nos escritores que já existem.
 * Proposta navega para a ação dona; Handoff é etapa informativa até o motor
 * de vínculo estar ligado. Nenhuma tabela nova, nenhum lead de exemplo.
 */
import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";

import { Bloco, GoLiveShell, Vazio } from "@/components/golive/shell";
import { Barras, Escada } from "@/components/golive/graficos";
import { Acao, Acoes } from "@/components/golive/acoes";
import { useGoLive } from "@/components/golive/dados";
import { dataHumana, humano } from "@/lib/rotulos-golive";
import {
  COLUNAS_FUNIL,
  colunaDoLead,
  funil,
  type LeadComercial,
} from "@/lib/golive-comercial";
import { registrarCallGoLive, registrarDiscoveryGoLive } from "@/lib/golive-escritores.functions";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/golive/leads")({
  head: () => ({
    meta: [
      { title: "Leads — Go-live Clube Ancestral" },
      {
        name: "description",
        content: "Leads por etapa do fluxo, com registro de Discovery e de call sobre os dados reais.",
      },
      { property: "og:title", content: "Leads — Go-live Clube Ancestral" },
      { property: "og:description", content: "Etapas do lead até o handoff, com ações que gravam de verdade." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LeadsGoLive,
});

function LeadsGoLive() {
  const { data, isPending, error } = useGoLive();
  const discovery = useServerFn(registrarDiscoveryGoLive);
  const call = useServerFn(registrarCallGoLive);
  const [escolhido, setEscolhido] = useState<string | null>(null);

  const leads = useMemo<LeadComercial[]>(() => (data?.leadsComerciais ?? []) as LeadComercial[], [data]);
  const emFoco = leads.find((l) => l.id === escolhido) ?? leads[0] ?? null;
  const etapaAtual = emFoco ? colunaDoLead(emFoco) : null;

  const ctaCadastro = (
    <Link to="/golive/comercial">
      <Button size="sm">Cadastrar lead no Comercial</Button>
    </Link>
  );

  return (
    <GoLiveShell titulo="Leads" descricao="Do primeiro contato ao handoff, com as ações que já gravam.">
      {isPending ? <p className="text-sm text-navy/60">Carregando…</p> : null}
      {error ? <p className="text-sm text-[var(--terracota,#9A3A2F)]">Não foi possível carregar agora.</p> : null}

      <Bloco titulo="Leads por etapa">
        {leads.length ? (
          <Barras titulo="Etapas do fluxo comercial" dados={funil(leads)} />
        ) : (
          <>
            <Vazio cta={ctaCadastro} />
            <p className="text-xs text-navy/55">Nenhum lead nesta etapa.</p>
          </>
        )}
      </Bloco>

      <Bloco titulo="Leads registrados">
        {leads.length ? (
          <ul className="space-y-2">
            {leads.map((lead) => {
              const ativo = lead.id === emFoco?.id;
              return (
                <li key={lead.id}>
                  <button
                    type="button"
                    onClick={() => setEscolhido(lead.id)}
                    className={`w-full rounded-lg p-3 text-left text-sm text-navy ${
                      ativo ? "bg-gold/20" : "bg-creme/60 hover:bg-navy/5"
                    }`}
                  >
                    <span className="block font-medium">{lead.nome}</span>
                    <span className="block text-xs text-navy/65">
                      Etapa: {colunaDoLead(lead)} · Origem: {humano(lead.origem, "não registrada")}
                    </span>
                    <span className="block text-xs text-navy/65">
                      Responsável: {humano(lead.responsavel, "sem responsável")} · Próximo passo:{" "}
                      {humano(lead.proximoPasso, "não registrado")}
                    </span>
                    <span className="block text-xs text-navy/55">
                      Último toque: {dataHumana(lead.ultimoToque ?? lead.callRealizada, "sem registro")}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <>
            <Vazio cta={ctaCadastro} />
            <p className="text-xs text-navy/55">Nenhum lead nesta etapa.</p>
          </>
        )}
      </Bloco>

      <Bloco titulo={emFoco ? `Etapas de ${emFoco.nome}` : "Etapas do lead"}>
        {emFoco ? (
          <>
            <Escada
              etapas={COLUNAS_FUNIL.map((coluna, i) => ({
                rotulo: coluna,
                feito: i <= COLUNAS_FUNIL.indexOf(etapaAtual ?? "Lead"),
              }))}
            />
            <Acoes>
              <Acao
                rotulo="Registrar Discovery"
                titulo="Resultado da Mesa de Discovery"
                variante="outline"
                campos={[
                  {
                    nome: "resultado",
                    rotulo: "Resultado",
                    tipo: "escolha",
                    obrigatorio: true,
                    opcoes: [
                      { valor: "segue_para_proposta", rotulo: "Segue para proposta" },
                      { valor: "em_avaliacao", rotulo: "Em avaliação" },
                      { valor: "nao_elegivel", rotulo: "Não elegível" },
                    ],
                  },
                  { nome: "resumo", rotulo: "Resumo interno", tipo: "area", obrigatorio: true },
                ]}
                aoConfirmar={(v) =>
                  discovery({
                    data: { leadId: emFoco.id, resultado: v["resultado"] ?? "", resumo: v["resumo"] ?? "" },
                  })
                }
                confirmacao="Discovery registrado no histórico do lead."
              />
              <Acao
                rotulo="Registrar call"
                titulo="Call com a pessoa"
                variante="outline"
                campos={[
                  { nome: "ocorridoEm", rotulo: "Data", tipo: "data" },
                  { nome: "resumo", rotulo: "Resumo interno", tipo: "area", obrigatorio: true },
                ]}
                aoConfirmar={(v) =>
                  call({ data: { leadId: emFoco.id, resumo: v["resumo"] ?? "", ocorridoEm: v["ocorridoEm"] ?? "" } })
                }
                confirmacao="Call registrada no histórico do lead."
              />
            </Acoes>
            <div className="flex flex-wrap gap-2 pt-1">
              <Link to="/golive/formalizacao">
                <Button size="sm" variant="outline">
                  Proposta
                </Button>
              </Link>
              <Button size="sm" variant="outline" disabled>
                Handoff para o caso — aguardando vínculo da equipe
              </Button>
            </div>
            <p className="text-xs text-navy/55">
              O handoff só vira ação quando o vínculo com o caso for liberado. Até lá, ele aparece como etapa.
            </p>
          </>
        ) : (
          <>
            <Vazio cta={ctaCadastro} />
            <p className="text-xs text-navy/55">Nenhum lead nesta etapa.</p>
          </>
        )}
      </Bloco>
    </GoLiveShell>
  );
}
