import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { Secao, Selecao, Texto, Rotulo } from "@/components/caso/campos";
import { salvarCaseService } from "@/lib/caso-canonico.functions";
import { STATUS_CASE_SERVICE, rotulo } from "@/lib/caso-ficha";

type Linha = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

/**
 * Produto-pai + trilha técnica (case service).
 * Preço nunca é digitado aqui: vem do catálogo homologado.
 */
export function AbaProdutoTrilha({
  caseId,
  produtos,
  trilhas,
  servicos,
  bloqueado,
  onMudou,
}: {
  caseId: string;
  produtos: Linha[];
  trilhas: Linha[];
  servicos: Linha[];
  bloqueado: boolean;
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

  const opcoesProduto = useMemo(
    () =>
      produtos
        .filter((p) => p.ativo !== false)
        .map((p) => ({
          valor: String(p.id),
          rotulo: `${p.nome_comercial} (${p.code}) — ${p.status_homologacao === "homologado" ? "homologado" : "não homologado"}`,
        })),
    [produtos],
  );
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
          <Selecao
            label="Produto-pai (catálogo)"
            valor={v("product_catalog_id")}
            opcoes={opcoesProduto}
            onChange={(x) => set("product_catalog_id", x)}
            desabilitado={bloqueado}
            ajuda="Preço e escopo vêm do catálogo; não são editáveis nesta tela."
          />
          <Selecao
            label="Trilha técnica (país/via)"
            valor={v("citizenship_track_id")}
            opcoes={opcoesTrilha}
            onChange={(x) => set("citizenship_track_id", x)}
            desabilitado={bloqueado}
          />
          <Selecao
            label="Status do serviço"
            valor={v("status") || "draft"}
            opcoes={STATUS_CASE_SERVICE}
            onChange={(x) => set("status", x)}
            desabilitado={bloqueado}
          />
          <Texto
            label="Composição familiar considerada"
            valor={v("composicao_familiar")}
            onChange={(x) => set("composicao_familiar", x)}
            desabilitado={bloqueado}
            area
            ajuda="Quem entra no serviço: signatários e dependentes representados."
          />
          <Texto
            label="Condição comercial aprovada (referência interna)"
            valor={v("condicao_comercial_aprovada")}
            onChange={(x) => set("condicao_comercial_aprovada", x)}
            desabilitado={bloqueado}
          />
          <Texto
            label="Referência interna do contrato"
            valor={v("contrato_referencia_interna")}
            onChange={(x) => set("contrato_referencia_interna", x)}
            desabilitado={bloqueado}
          />
          <Texto label="Observação interna" valor={v("observacao_interna")} onChange={(x) => set("observacao_interna", x)} desabilitado={bloqueado} area />
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={() => m.mutate()}
            disabled={bloqueado || !sujo || m.isPending}
            className="rounded-lg bg-navy px-4 py-2 text-sm text-cream disabled:opacity-40"
          >
            {servico ? "Salvar serviço do caso" : "Criar serviço do caso"}
          </button>
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
