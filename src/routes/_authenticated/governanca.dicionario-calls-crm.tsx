import { createFileRoute, Link } from "@tanstack/react-router";

import { SaasShell } from "@/components/saas/shell";
import {
  CAMPOS_DICIONARIO_CALLS,
  CRITERIOS_ACEITE_CALLS,
  DICIONARIO_CALLS_VERSAO,
  FORMATACAO_CONDICIONAL_CALLS,
  LISTAS_BASE_CALLS,
  LISTAS_DICIONARIO_CALLS,
  MAPEAMENTO_PAINEL_CALLS,
  PRINCIPIOS_GOVERNANCA_CALLS,
} from "@/lib/dicionario-calls-crm";
import {
  CHECKLIST_VALIDACAO_TERMINOLOGICA,
  D06_CRITERIO_ELEVACAO,
  D07_CHECKLIST_PDF,
  D11_GLOSSARIO_FINAL,
  GLOSSARIO_DATA,
  REGRA_APLICACAO_GLOSSARIO,
  REQUISITOS_TERMO_DESK,
  SUBSTITUICOES_OBRIGATORIAS,
  TERMOS_BLOQUEADOS_CLIENTE,
  TERMOS_PERMITIDOS_CLIENTE,
  VOCABULARIO_OFICIAL,
} from "@/lib/glossario-oficial";

export const Route = createFileRoute("/_authenticated/governanca/dicionario-calls-crm")({
  head: () => ({
    meta: [
      { title: "Dicionário de validações Calls → CRM — Clube Ancestral" },
      {
        name: "description",
        content:
          "Campos, listas controladas, regras de bloqueio e glossário oficial que padronizam a entrada de leads do Painel de Calls no CRM interno.",
      },
      { property: "og:title", content: "Dicionário de validações Calls → CRM — Clube Ancestral" },
      {
        property: "og:description",
        content: "Listas controladas, dependências obrigatórias e terminologia oficial para triagem comercial.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DicionarioCallsCrm,
});

const Bloco = ({ id, titulo, children }: { id?: string; titulo: string; children: React.ReactNode }) => (
  <section id={id} className="rounded-xl border border-navy/10 bg-white p-5">
    <h2 className="font-serif text-lg text-navy">{titulo}</h2>
    <div className="mt-3 text-sm text-navy/70">{children}</div>
  </section>
);

const Lista = ({ itens }: { itens: readonly string[] }) => (
  <ul className="list-disc space-y-1 pl-5">
    {itens.map((t) => (
      <li key={t}>{t}</li>
    ))}
  </ul>
);

const CORES: Record<string, string> = {
  verde: "text-emerald-700",
  amarelo: "text-amber-700",
  laranja: "text-orange-700",
  vermelho: "text-terracotta",
  neutro: "text-navy/60",
};

function DicionarioCallsCrm() {
  return (
    <SaasShell
      titulo="Dicionário de validações — Painel de Calls → CRM"
      descricao="Regras vivas do Painel de Calls e do CRM Vivo. Preço, SKU, condição e link vêm do catálogo homologado — a Planilha Mestre não é fonte viva; despesa de terceiro nunca é caixa do Clube."
    >
      <div className="grid gap-4">
        <div className="rounded-xl border border-gold/40 bg-cream/60 p-4 text-sm text-navy/80">
          Versão {DICIONARIO_CALLS_VERSAO}. Este dicionário avalia o lead canônico em{" "}
          <Link to="/calls" className="font-medium underline decoration-gold underline-offset-4">
            /calls
          </Link>
          . Pendência informa; não trava rascunho. Elegibilidade e via jurídica são triagem
          comercial/técnica preliminar, nunca decisão jurídica final. Mapa CA-04 em{" "}
          <Link to="/crm-mestre" className="font-medium underline decoration-gold underline-offset-4">
            CRM Mestre
          </Link>
          .
        </div>

        <Bloco titulo="1. Princípios de governança">
          <Lista itens={PRINCIPIOS_GOVERNANCA_CALLS} />
        </Bloco>

        <Bloco titulo="2. Campos do CRM e critérios de validação">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] uppercase text-navy/50">
                <tr>
                  <th className="py-1 pr-3">Campo</th>
                  <th className="py-1 pr-3">Tipo</th>
                  <th className="py-1 pr-3">Obrigatório na etapa</th>
                  <th className="py-1 pr-3">Lista controlada</th>
                  <th className="py-1">Regra</th>
                </tr>
              </thead>
              <tbody>
                {CAMPOS_DICIONARIO_CALLS.map((c) => (
                  <tr key={c.campo} className="border-t border-navy/5 align-top">
                    <td className="py-1 pr-3 font-medium text-navy">{c.campo}</td>
                    <td className="py-1 pr-3">{c.tipo}</td>
                    <td className="py-1 pr-3">{c.obrigatorio_na_etapa}</td>
                    <td className="py-1 pr-3">{c.lista ?? "—"}</td>
                    <td className="py-1">{c.regra}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Bloco>

        <Bloco titulo="3. Listas base">
          <p className="mb-3 text-xs text-navy/60">
            {Object.keys(LISTAS_BASE_CALLS).length} listas controladas disponíveis, sendo{" "}
            {Object.keys(LISTAS_DICIONARIO_CALLS).length} próprias deste dicionário e as demais herdadas do CRM Mestre.
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            {Object.entries(LISTAS_DICIONARIO_CALLS).map(([nome, valores]) => (
              <div key={nome} className="rounded-lg border border-navy/10 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-navy/60">{nome}</p>
                <p className="mt-1 text-xs">{(valores as readonly string[]).join(" · ")}</p>
              </div>
            ))}
          </div>
        </Bloco>

        <Bloco titulo="4. Regras de dependência e bloqueio">
          <Lista
            itens={[
              "SKU recomendado só após 'Produtos/serviços recomendados' e apenas com SKU ATIVO no catálogo homologado.",
              "Resultado comercial 'Convertido' exige contrato assinado, pagamento inicial confirmado e link do dossiê.",
              "Etapa 'Contrato assinado' exige contrato ou link correspondente.",
              "Etapa 'Onboarding' exige pagamento inicial confirmado.",
              "Resultado de perda exige motivo de perda.",
              "Call 'Realizada' exige resultado da Discovery e próxima ação.",
              "Elegibilidade 'Forte'/'Provável' exige via jurídica preliminar, geração do ascendente e estado documental inicial.",
              "Via 'Encerrada para novos pedidos' permite apenas diagnóstico, pesquisa de alternativas ou nutrição.",
              "Despesas 'Aprovadas' exigem estimativa e responsável pagador; nunca como desembolso do Clube.",
              "Sem consentimento de gravação, o link de gravação/transcrição fica bloqueado.",
              "Um dossiê-mãe por família; cada requerente tem registro individual com vínculo ao núcleo.",
            ]}
          />
        </Bloco>

        <Bloco titulo="5. Formatação condicional recomendada">
          <ul className="space-y-1">
            {FORMATACAO_CONDICIONAL_CALLS.map((f) => (
              <li key={f.condicao}>
                <span className={CORES[f.cor]}>■</span> {f.condicao} — {f.cor}
              </li>
            ))}
          </ul>
        </Bloco>

        <Bloco titulo="6. Mapeamento para o Painel de Calls atual">
          <Lista itens={MAPEAMENTO_PAINEL_CALLS} />
        </Bloco>

        <Bloco titulo="7. Critérios de aceite da implementação">
          <Lista itens={CRITERIOS_ACEITE_CALLS} />
        </Bloco>

        <Bloco id="glossario" titulo={`Adendo — Glossário oficial (${GLOSSARIO_DATA})`}>
          <p>{REGRA_APLICACAO_GLOSSARIO}</p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] uppercase text-navy/50">
                <tr>
                  <th className="py-1 pr-3">Termo oficial</th>
                  <th className="py-1 pr-3">Uso autorizado</th>
                  <th className="py-1">Restrição no caso</th>
                </tr>
              </thead>
              <tbody>
                {VOCABULARIO_OFICIAL.map((t) => (
                  <tr key={t.termo} className="border-t border-navy/5 align-top">
                    <td className="py-1 pr-3 font-medium text-navy">{t.termo}</td>
                    <td className="py-1 pr-3">{t.uso_autorizado}</td>
                    <td className="py-1">{t.restricao_no_caso}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Bloco>

        <Bloco titulo="Substituições obrigatórias">
          <ul className="space-y-1">
            {SUBSTITUICOES_OBRIGATORIAS.map((s) => (
              <li key={s.evitar}>
                <span className="text-terracotta">Evitar:</span> “{s.evitar}” → <span className="text-navy">{s.usar}</span>
              </li>
            ))}
          </ul>
        </Bloco>

        <Bloco titulo="Regra por destino">
          <p className="text-navy/50">One-page, WhatsApp e App Cliente podem usar</p>
          <Lista itens={TERMOS_PERMITIDOS_CLIENTE} />
          <p className="mt-3 text-navy/50">Não podem usar sem liberação específica</p>
          <Lista itens={TERMOS_BLOQUEADOS_CLIENTE} />
          <p className="mt-3 text-navy/50">Desk interno — cada menção precisa de</p>
          <Lista itens={REQUISITOS_TERMO_DESK} />
        </Bloco>

        <Bloco titulo="Atualização das decisões humanas">
          <p>
            <span className="text-navy/50">D-06 — Critério de elevação:</span> {D06_CRITERIO_ELEVACAO}
          </p>
          <p className="mt-3 text-navy/50">D-07 — Autorização de PDF</p>
          <Lista itens={D07_CHECKLIST_PDF} />
          <p className="mt-3">
            <span className="text-navy/50">D-11 — Glossário final:</span> {D11_GLOSSARIO_FINAL}
          </p>
        </Bloco>

        <Bloco titulo="Checklist de validação terminológica">
          <Lista itens={CHECKLIST_VALIDACAO_TERMINOLOGICA} />
        </Bloco>
      </div>
    </SaasShell>
  );
}
