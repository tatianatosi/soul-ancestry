import { createFileRoute } from "@tanstack/react-router";

import { SaasShell } from "@/components/saas/shell";
import { CaCard } from "@/components/ui/ca-card";
import { Button } from "@/components/ui/button";
import {
  CA06_DATA,
  CA06_STATUS_PROPOSTA,
  CA06_USO_PADRAO,
  CA06_USO_PENDENTE,
  CA06_VERSAO,
  CATALOGO_OPERACIONAL_30,
  DECISOES_BLOQUEADORAS,
  DECISOES_NECESSARIAS_CA06,
  ENTRADAS_CA07,
  FORA_DO_CATALOGO_30,
  INVARIANTES_CA06,
  MATRIZ_CICLO_VIDA,
  REGRAS_ARQUITETURA_CA06,
  RISCOS_CA06,
  csvCatalogo30,
  resumoCatalogo30,
  resumoForaCatalogo,
} from "@/lib/ca06-catalogo-operacional";

export const Route = createFileRoute("/_authenticated/governanca/catalogo-operacional-30")({
  head: () => ({
    meta: [
      { title: "Catálogo Operacional 30 (CA-06) — Clube Ancestral" },
      {
        name: "description",
        content:
          "Registro interno somente leitura do Catálogo Operacional 30, destino dos itens fora do catálogo, matriz de ciclo de vida e decisões bloqueadoras.",
      },
      { property: "og:title", content: "Catálogo Operacional 30 (CA-06) — Clube Ancestral" },
      {
        property: "og:description",
        content: "Proposta pendente de validação humana: 30 SKUs, 61 destinos, ciclo de vida e decisões bloqueadoras.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CatalogoOperacional30,
});

// V4-05: bloco local vira o CaCard canônico (mesmo conteúdo).
const Bloco = ({ titulo, children }: { titulo: string; children: React.ReactNode }) => (
  <CaCard titulo={titulo}>
    <div className="text-sm text-navy/70">{children}</div>
  </CaCard>
);

const Lista = ({ itens }: { itens: readonly string[] }) => (
  <ul className="list-disc space-y-1 pl-5">
    {itens.map((t) => (
      <li key={t}>{t}</li>
    ))}
  </ul>
);

function baixarCsv() {
  const blob = new Blob([`\uFEFF${csvCatalogo30()}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "CA-06_Catalogo_Operacional_30.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function CatalogoOperacional30() {
  const resumo = resumoCatalogo30();
  const destinos = resumoForaCatalogo();

  return (
    <SaasShell
      titulo="Catálogo Operacional 30 (CA-06)"
      descricao="Registro interno somente leitura. Nenhum preço, link, cobrança, contrato ou sistema externo é alterado por esta tela."
      acoes={
        <Button variant="outline" size="sm" onClick={baixarCsv}>
          Exportar CSV
        </Button>
      }
    >
      <div className="grid gap-4">
        <div className="rounded-xl border border-gold/40 bg-cream/60 p-4 text-sm text-navy/80">
          <p className="font-medium text-navy">{CA06_STATUS_PROPOSTA}</p>
          <p className="mt-1">
            Versão {CA06_VERSAO} · {CA06_DATA}. Consolidação derivada da Planilha Mestre e das decisões já aprovadas
            (Auditoria-Mãe, Arquitetura de Oferta e Jornada, Top SKUs Fase 3). Não substitui a Planilha Mestre:
            preço, link e escopo homologado continuam sendo lidos apenas de lá.
          </p>
        </div>

        <Bloco titulo="Entrega A — Catálogo Operacional 30">
          <p className="mb-3 text-xs text-navy/60">
            {CATALOGO_OPERACIONAL_30.length} itens · ATIVO {resumo.ATIVO} · PILOTO {resumo.PILOTO} · CONDICIONAL{" "}
            {resumo.CONDICIONAL} · PENDENTE {resumo.PENDENTE}. Uso operacional padrão: {CA06_USO_PADRAO.uso_planejador};{" "}
            {CA06_USO_PADRAO.uso_crm}; {CA06_USO_PADRAO.uso_desk}. Itens pendentes: {CA06_USO_PENDENTE.uso_planejador}.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] uppercase text-navy/50">
                <tr>
                  <th className="py-1 pr-3">SKU</th>
                  <th className="py-1 pr-3">Produto oficial</th>
                  <th className="py-1 pr-3">Categoria</th>
                  <th className="py-1 pr-3">Papel</th>
                  <th className="py-1 pr-3">Status</th>
                  <th className="py-1 pr-3">Decisão</th>
                  <th className="py-1 pr-3">Ciclo de vida</th>
                  <th className="py-1 pr-3">Visibilidade no App</th>
                  <th className="py-1">Condição de uso</th>
                </tr>
              </thead>
              <tbody>
                {CATALOGO_OPERACIONAL_30.map((i) => (
                  <tr key={i.sku_id} className="border-t border-navy/5 align-top">
                    <td className="py-1 pr-3 font-mono text-[11px]">{i.sku_id}</td>
                    <td className="py-1 pr-3">{i.produto_oficial}</td>
                    <td className="py-1 pr-3">{i.categoria}</td>
                    <td className="py-1 pr-3">{i.papel_no_portfolio}</td>
                    <td className="py-1 pr-3">{i.status_catalogo_30}</td>
                    <td className="py-1 pr-3">{i.decisao}</td>
                    <td className="py-1 pr-3">{i.ciclo_de_vida}</td>
                    <td className="py-1 pr-3">{i.visibilidade_app}</td>
                    <td className="py-1">{i.condicao_de_uso}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Bloco>

        <Bloco titulo="Entrega B — Destino dos itens fora do Catálogo 30">
          <p className="mb-3 text-xs text-navy/60">
            {FORA_DO_CATALOGO_30.length} itens · ARQUIVAR_HISTÓRICO {destinos["ARQUIVAR_HISTÓRICO"]} · FASE_2{" "}
            {destinos.FASE_2} · PENDENTE_DE_VALIDAÇÃO {destinos["PENDENTE_DE_VALIDAÇÃO"]} · FUNDIR {destinos.FUNDIR}.
            Nenhum item foi apagado, renomeado ou desativado — a tabela apenas registra a decisão recomendada.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] uppercase text-navy/50">
                <tr>
                  <th className="py-1 pr-3">SKU</th>
                  <th className="py-1 pr-3">Produto</th>
                  <th className="py-1 pr-3">Destino</th>
                  <th className="py-1 pr-3">Referência mãe</th>
                  <th className="py-1 pr-3">Justificativa</th>
                  <th className="py-1">Ação futura</th>
                </tr>
              </thead>
              <tbody>
                {FORA_DO_CATALOGO_30.map((i) => (
                  <tr key={i.sku_id} className="border-t border-navy/5 align-top">
                    <td className="py-1 pr-3 font-mono text-[11px]">{i.sku_id}</td>
                    <td className="py-1 pr-3">{i.produto}</td>
                    <td className="py-1 pr-3">{i.destino}</td>
                    <td className="py-1 pr-3">{i.produto_mae_referencia}</td>
                    <td className="py-1 pr-3">{i.justificativa_curta}</td>
                    <td className="py-1">{i.acao_futura}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Bloco>

        <Bloco titulo="Entrega C — Matriz mínima de ciclo de vida">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] uppercase text-navy/50">
                <tr>
                  <th className="py-1 pr-3">Etapa da jornada</th>
                  <th className="py-1 pr-3">Microentrega existente</th>
                  <th className="py-1 pr-3">SKUs elegíveis</th>
                  <th className="py-1 pr-3">Regra país/via</th>
                  <th className="py-1 pr-3">Sistema principal</th>
                  <th className="py-1">Cliente vê</th>
                </tr>
              </thead>
              <tbody>
                {MATRIZ_CICLO_VIDA.map((e) => (
                  <tr key={`${e.etapa_da_jornada}-${e.skus_elegiveis[0]}`} className="border-t border-navy/5 align-top">
                    <td className="py-1 pr-3">{e.etapa_da_jornada}</td>
                    <td className="py-1 pr-3">{e.microentrega_existente}</td>
                    <td className="py-1 pr-3 font-mono text-[11px]">{e.skus_elegiveis.join(", ")}</td>
                    <td className="py-1 pr-3">{e.regra_pais_via}</td>
                    <td className="py-1 pr-3">{e.sistema_principal}</td>
                    <td className="py-1">{e.cliente_ve}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Bloco>

        <Bloco titulo="Entrega D — Decisões bloqueadoras">
          <ul className="space-y-3">
            {DECISOES_BLOQUEADORAS.map((d) => (
              <li key={d.decisao} className="rounded-lg border border-navy/10 p-3">
                <p className="font-medium text-navy">{d.decisao}</p>
                <p className="mt-1">
                  <span className="text-navy/50">Origem:</span> {d.origem_do_conflito}
                </p>
                <p>
                  <span className="text-navy/50">Impacto:</span> {d.impacto}
                </p>
                <p>
                  <span className="text-navy/50">Opções já existentes:</span> {d.opcoes_ja_existentes}
                </p>
                <p>
                  <span className="text-navy/50">Responsável sugerido:</span> {d.responsavel_sugerido}
                </p>
              </li>
            ))}
          </ul>
        </Bloco>

        <Bloco titulo="Regras obrigatórias de arquitetura">
          <Lista itens={REGRAS_ARQUITETURA_CA06} />
          <div className="mt-3">
            <Lista itens={INVARIANTES_CA06} />
          </div>
        </Bloco>

        <Bloco titulo="Riscos e pendências críticas">
          <Lista itens={RISCOS_CA06} />
        </Bloco>

        <Bloco titulo="Decisões necessárias e entradas para o CA-07">
          <Lista itens={DECISOES_NECESSARIAS_CA06} />
          <p className="mt-3 text-navy/50">Entradas para CA-07</p>
          <Lista itens={ENTRADAS_CA07} />
        </Bloco>
      </div>
    </SaasShell>
  );
}
