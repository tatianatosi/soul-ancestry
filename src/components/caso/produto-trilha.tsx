import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { AcaoDeEscrita, Secao, Selecao, Texto, Rotulo, inputCls } from "@/components/caso/campos";
import { salvarCaseService } from "@/lib/caso-canonico.functions";
import { STATUS_CASE_SERVICE, rotulo } from "@/lib/caso-ficha";

type Linha = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

const ROTULO_RECONCILIACAO: Record<string, string> = {
  ATIVO_HOMOLOGADO: "ativo e homologado",
  ATIVO_SEM_PRECO_HOMOLOGADO: "ativo, sem preço homologado",
  ESPECIFICACAO_PENDENTE: "especificação pendente",
  CONDICIONAL_POR_CASO: "condicional por caso",
  LEGADO_RECONCILIAR: "legado — ainda pede reconciliação",
  DUPLICADO_A_CONSOLIDAR: "duplicado a consolidar",
};

/**
 * Produto-pai + trilha técnica (case service).
 * Preço nunca é digitado aqui: vem do catálogo homologado.
 */
export function AbaProdutoTrilha({
  caseId,
  produtos,
  trilhas,
  servicos,
  bloqueado: _bloqueado,
  onMudou,
}: {
  caseId: string;
  produtos: Linha[];
  trilhas: Linha[];
  servicos: Linha[];
  /**
   * Mantida apenas por compatibilidade com quem chama em `src/routes/`.
   * Ignorada: a decisão de escrita é da autoridade operacional.
   */
  bloqueado?: boolean;
  onMudou: () => void;
}) {
  const salvar = useServerFn(salvarCaseService);
  const servico = servicos[0] ?? null;
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [erro, setErro] = useState<string | null>(null);
  const [salvoEm, setSalvoEm] = useState<string | null>(null);
  const sujo = Object.keys(form).length > 0;

  const v = (k: string) => {
    const atual = k in form ? form[k] : servico?.[k];
    return atual === null || atual === undefined ? "" : String(atual);
  };
  const set = (k: string, valor: unknown) => setForm((f) => ({ ...f, [k]: valor }));

  // 07/09/2026 — o produto-pai (planner_catalog_feed, reconciliação de 04/09)
  // vira grupo do select em vez de lista crua de SKU; NAO_USAR_NO_MOTOR e
  // ARQUIVADO_DECISAO_PROPRIETARIA saem da lista porque essas duas situações
  // significam, por definição, "não oferecer este item".
  const grupos = useMemo(() => {
    const naoOferecer = new Set(["NAO_USAR_NO_MOTOR", "ARQUIVADO_DECISAO_PROPRIETARIA"]);
    const porProdutoPai = new Map<string, Linha[]>();
    for (const p of produtos) {
      if (p.ativo === false) continue;
      if (naoOferecer.has(String(p.status_reconciliacao))) continue;
      const grupo = String(p.produto_pai || "Sem produto-pai definido");
      if (!porProdutoPai.has(grupo)) porProdutoPai.set(grupo, []);
      porProdutoPai.get(grupo)!.push(p);
    }
    return [...porProdutoPai.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([grupo, itens]) => ({
        grupo,
        itens: itens.sort((a, b) => String(a.nome_comercial).localeCompare(String(b.nome_comercial))),
      }));
  }, [produtos]);
  const opcoesTrilha = useMemo(
    () => trilhas.map((t) => ({ valor: String(t.id), rotulo: `${t.pais} — ${t.code}` })),
    [trilhas],
  );

  const produto = produtos.find((p) => String(p.id) === v("product_catalog_id"));
  const trilha = trilhas.find((t) => String(t.id) === v("citizenship_track_id"));

  const m = useMutation({
    mutationFn: () => salvar({ data: { caseId, id: servico?.id, dados: form } }),
    onSuccess: () => {
      setForm({});
      setErro(null);
      setSalvoEm(new Date().toLocaleTimeString("pt-BR"));
      onMudou();
    },
    onError: (e: unknown) => setErro(e instanceof Error ? e.message : "Falha ao salvar o serviço do caso."),
  });

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Secao
        titulo="Produto-pai e trilha técnica"
        descricao="O produto define escopo e preço homologados. A trilha técnica é sempre preliminar e revisável."
      >
        {erro ? <p className="mb-3 text-sm text-terracotta">{erro}</p> : null}
        <div className="grid gap-4">
          <label className="block">
            <Rotulo>Produto-pai (catálogo)</Rotulo>
            <select
              className={inputCls}
              value={v("product_catalog_id")}
              onChange={(e) => set("product_catalog_id", e.target.value)}
            >
              <option value="">— selecionar —</option>
              {grupos.map(({ grupo, itens }) => (
                <optgroup key={grupo} label={grupo}>
                  {itens.map((p) => (
                    <option key={p.id} value={String(p.id)}>
                      {p.nome_comercial} ({p.code})
                      {p.status_reconciliacao && p.status_reconciliacao !== "ATIVO_HOMOLOGADO"
                        ? ` — ${ROTULO_RECONCILIACAO[p.status_reconciliacao] ?? p.status_reconciliacao}`
                        : p.status_homologacao === "homologado"
                          ? " — homologado"
                          : " — não homologado"}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <p className="mt-1 text-xs text-navy/50">
              Preço e escopo vêm do catálogo; não são editáveis nesta tela. Agrupado pelo
              produto-pai da reconciliação canônica de 04/09.
            </p>
          </label>
          <Selecao
            label="Trilha técnica (país/via)"
            valor={v("citizenship_track_id")}
            opcoes={opcoesTrilha}
            onChange={(x) => set("citizenship_track_id", x)}
           
          />
          <Selecao
            label="Status do serviço"
            valor={v("status") || "draft"}
            opcoes={STATUS_CASE_SERVICE}
            onChange={(x) => set("status", x)}
           
          />
          <Texto
            label="Composição familiar considerada"
            valor={v("composicao_familiar")}
            onChange={(x) => set("composicao_familiar", x)}
           
            area
            ajuda="Quem entra no serviço: signatários e dependentes representados."
          />
          <Texto
            label="Condição comercial aprovada (referência interna)"
            valor={v("condicao_comercial_aprovada")}
            onChange={(x) => set("condicao_comercial_aprovada", x)}
           
          />
          <Texto
            label="Referência interna do contrato"
            valor={v("contrato_referencia_interna")}
            onChange={(x) => set("contrato_referencia_interna", x)}
           
          />
          <Texto label="Observação interna" valor={v("observacao_interna")} onChange={(x) => set("observacao_interna", x)} area />
        </div>
        <div className="mt-4 flex items-center gap-3">
          <AcaoDeEscrita
            rotulo={
              m.isPending ? "Salvando…" : servico ? "Salvar serviço do caso" : "Criar serviço do caso"
            }
            faltando={sujo ? null : "Nenhuma alteração para salvar."}
            capacidade="corrigir_proposta_escopo_preco"
            pendenciaGate={
              produto && produto.status_homologacao !== "homologado"
                ? "Produto-pai selecionado ainda não está homologado no catálogo."
                : null
            }
            efeito="Grava o serviço do caso com o produto-pai e a trilha técnica escolhidos."
            className="rounded-lg bg-navy px-4 py-2 text-sm text-cream disabled:opacity-40"
            onConfirmar={() => {
              if (m.isPending) return;
              m.mutate();
            }}
          />
          <span className="text-xs text-navy/55">
            {m.isPending ? "Salvando…" : sujo ? "Alterações não salvas" : salvoEm ? `Salvo às ${salvoEm}` : ""}
          </span>
        </div>
      </Secao>

      <Secao titulo="Escopo e preço homologados" descricao="Somente leitura: refletem o catálogo e a trilha selecionados.">
        <div className="space-y-4 text-sm text-navy/80">
          <div>
            <Rotulo>Produto</Rotulo>
            <p>{produto ? `${produto.nome_comercial} · ${produto.tipo_oferta}` : "Nenhum produto selecionado."}</p>
          </div>
          <div>
            <Rotulo>Preço comercial vigente</Rotulo>
            <p>
              {produto?.preco_comercial_vigente != null
                ? Number(produto.preco_comercial_vigente).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                : "Sem preço homologado — fechamento humano obrigatório."}
            </p>
          </div>
          <div>
            <Rotulo>Escopo aprovado</Rotulo>
            <p className="whitespace-pre-line">{produto?.escopo_aprovado ?? "—"}</p>
          </div>
          <div>
            <Rotulo>Condição comercial padrão</Rotulo>
            <p>{produto?.condicao_comercial_padrao ?? "—"}</p>
          </div>
          <div className="border-t border-navy/10 pt-4">
            <Rotulo>Trilha técnica</Rotulo>
            <p>{trilha ? `${trilha.pais} · ${trilha.via_preliminar ?? "via a definir"}` : "Nenhuma trilha selecionada."}</p>
            {trilha ? (
              <ul className="mt-2 space-y-1 text-xs text-navy/60">
                <li>Status da via: {trilha.status_via}</li>
                <li>Revisão humana jurídica: {trilha.revisao_humana_juridica}</li>
                <li>Autorização de pesquisa necessária: {trilha.autorizacao_pesquisa_necessaria ? "sim" : "não"}</li>
                <li>Riscos internos: {trilha.riscos_internos ?? "—"}</li>
              </ul>
            ) : null}
          </div>
          {servico ? (
            <p className="text-xs text-navy/50">Status atual do serviço: {rotulo(STATUS_CASE_SERVICE, servico.status)}.</p>
          ) : null}
        </div>
      </Secao>
    </div>
  );
}
