/**
 * Adaptador único: payload de `abrirPreparacaoContrato` → entrada dos cinco
 * cartões. As duas superfícies (go-live e Formalização do caso) passam pelo
 * mesmo adaptador, então só existe uma leitura dos fatos.
 */

import { coberturaDoModelo, type ClausulaAlterada } from "@/lib/aprovacao-modelo";
import { regraDoAnexo } from "@/lib/contrato-blocos-incorporados";
import { previaDefasada, previaVigente } from "@/lib/previa-vigente";
import type { AnexoCartao, EntradaCartoes, RegistroPersistido } from "@/lib/formalizacao-cartoes";

/* eslint-disable @typescript-eslint/no-explicit-any */

const lista = <T = any>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);
const preenchido = (v: unknown) => String(v ?? "").trim() !== "";

const ROTULO_ANEXO: Record<string, string> = {
  ANEXO_I_ORDEM_SERVICO: "Anexo I — Ordem de Serviço",
  ANEXO_II_DESPESAS_EXTERNAS: "Anexo II — Despesas externas",
  ANEXO_III_AUTORIZACAO_PESQUISA: "Anexo III — Autorização de pesquisa específica",
  ANEXO_IV_PROCURACAO: "Anexo IV — Procuração",
  ANEXO_V_ALTERACAO_ESCOPO: "Anexo V — Alteração de escopo",
};

export function entradaCartoesDePreparacao(
  d: any,
  extra: {
    persistidos: Record<string, RegistroPersistido>;
    clausulasAlteradas: readonly ClausulaAlterada[];
    templateCode?: string | null;
    responsavelNome?: string | null;
    bloqueiosImpeditivos?: string[];
  },
): EntradaCartoes {
  const cob = d?.coberturaContratual ?? {};
  const pessoas = lista(cob.pessoas);
  const valores = lista(d?.valores);
  const valor = (campo: string) => valores.find((v: any) => v.campo === campo)?.valor;
  const previas = lista(d?.previas);
  const vigente = previaVigente(previas);

  const menores = pessoas.filter((p: any) => lista(p.papeis).includes("dependente_representado"));
  const impeditivas = lista(cob.impeditivas).map(
    (x: any) => `${x.pessoa ? `${x.pessoa} — ` : ""}${x.campo}: ${x.texto}`,
  );

  const anexos: AnexoCartao[] = lista(cob.anexos).map((a: any) => ({
    codigo: String(a.codigo),
    rotulo: ROTULO_ANEXO[String(a.codigo)] ?? String(a.titulo ?? a.codigo),
    aplicavel: Boolean(a.aplicavel),
    justificativa: regraDoAnexo(String(a.codigo))?.motivoNaoAplicavel ?? String(a.motivo ?? "Não aplicável."),
    pendencia: lista<string>(a.pendencias)[0] ?? null,
  }));

  const blocos = lista(cob.blocos);
  const blocoOk = (chave: string) => blocos.some((b: any) => b.chave === chave && lista(b.pendencias).length === 0);
  const assinadoEm = (d?.contrato?.signed_at as string | null) ?? null;

  const todosBloqueios = extra.bloqueiosImpeditivos ?? [];
  const prontoParaAssinatura = Boolean(cob.completa) && todosBloqueios.length === 0 && Boolean(vigente);

  return {
    caseId: String(d?.caso?.id ?? ""),
    responsavelNome: extra.responsavelNome ?? null,
    partes: {
      pendencias: pessoas.flatMap((p: any) => lista<string>(p.pendencias).map((t) => `${p.nome}: ${t}`)),
      papeisDefinidos: pessoas.length > 0 && pessoas.every((p: any) => lista(p.papeis).length > 0),
      possuiMenor: menores.length > 0,
      representacaoRegistrada: menores.length > 0 && menores.every((p: any) => Boolean(p.representacaoConfirmada)),
      contratadaQualificada: preenchido(valor("contratada_qualificacao")),
    },
    escopo: {
      propostaAprovada: d?.proposta?.status === "aprovada",
      propostaReferencia: (d?.proposta?.origem_referencia as string | null) ?? (d?.proposta?.id ? `proposta ${d.proposta.id}` : null),
      escopoPreenchido: preenchido(valor("escopo_resumo")),
      servicosDefinidos: blocoOk("servicos"),
      entregasDefinidas: blocoOk("entregas"),
      valorTotal: (d?.condicaoParticular?.valor as number | null) ?? null,
      pagamentoDefinido: blocoOk("pagamento"),
      prazoDefinido: preenchido(valor("prazos_referencia")) || blocoOk("prazo"),
      pendenciasImpeditivas: impeditivas,
      pendenciasPosteriores: lista(cob.posteriores).map(
        (x: any) => `${x.pessoa ? `${x.pessoa} — ` : ""}${x.campo}: ${x.texto}`,
      ),
    },
    contrato: {
      cobertura: coberturaDoModelo({
        templateCode: extra.templateCode ?? d?.modelo?.code ?? null,
        clausulasAlteradas: extra.clausulasAlteradas,
      }),
      coberturaCompleta: Boolean(cob.completa),
      anexoIIncorporado: Boolean(cob.anexoIIncorporadoNoCorpo),
      anexos,
      previaGerada: Boolean(vigente),
      previaAtual: Boolean(vigente) && !previaDefasada(vigente, d?.parametroAlteradoEm),
      previaReferencia: vigente
        ? vigente.estado === "rascunho_editavel"
          ? "rascunho de trabalho"
          : `versão v${vigente?.versao} (congelada)`
        : null,
    },
    formalizacao: {
      prontoParaAssinatura,
      assinaturaRegistradaEm: assinadoEm,
      bloqueiosImpeditivos: todosBloqueios,
      proximoPasso: null,
    },
    persistidos: extra.persistidos,
  };
}
