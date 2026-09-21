/**
 * Estado de dados explícito — fim da falha silenciosa.
 *
 * Diagnóstico de 05/09/2026: dezenas de telas escreviam `?? []` ou `|| []`
 * sobre o resultado da consulta. Quando a leitura falhava por rede, token ou
 * política do banco, a tela mostrava "nenhum registro" — indistinguível de uma
 * base realmente vazia. É o que se sentia como "o app não funciona".
 *
 * Regra: ou mostra dado, ou mostra erro com causa e caminho de correção.
 * Nunca vazio silencioso.
 */

import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { mensagemDeFalha } from "@/lib/portal-linguagem-viva";

export type EstadoDadosProps<T> = {
  /** Consulta em andamento. */
  carregando?: boolean;
  /** Erro da consulta, se houver. */
  erro?: unknown;
  /** Dados carregados. `undefined` com `carregando=false` e sem erro é tratado como erro de contrato. */
  dados?: T[] | null;
  /** Nova tentativa. */
  aoTentarNovamente?: () => void;
  /** Texto do estado vazio legítimo. */
  vazio?: string;
  /** Nome legível do que se está carregando, usado nas mensagens. */
  recurso?: string;
  /**
   * Em qual superfície o estado é renderizado.
   *
   * 21/09/2026 — este componente é usado nas duas superfícies, e no App
   * Cliente ele vazava dois tipos de texto interno: a mensagem crua do erro
   * (nome de policy, tabela e coluna do Postgres) e o caminho de correção
   * "Administração → Equipe", que é rota do Desk. O cliente nunca deve ver
   * nenhum dos dois. Com `"app"`, o erro vira a mensagem neutra de cliente e
   * o caminho de correção é omitido. O padrão continua `"desk"`, então
   * nenhuma tela interna muda de comportamento.
   */
  superficie?: "desk" | "app";
  children: (dados: T[]) => ReactNode;
};

function mensagemDeErro(erro: unknown): string {
  if (!erro) return "Erro desconhecido.";
  if (typeof erro === "string") return erro;
  if (erro instanceof Error) return erro.message;
  const m = (erro as { message?: unknown }).message;
  return typeof m === "string" ? m : "Erro desconhecido.";
}

/** Traduz causas frequentes em caminho de correção concreto. */
export function caminhoDeCorrecao(erro: unknown): string | null {
  const texto = mensagemDeErro(erro).toLowerCase();
  if (texto.includes("row-level security") || texto.includes("permission denied")) {
    return "A política do banco recusou a leitura para a sua conta. Confira o vínculo de equipe em Administração → Equipe.";
  }
  if (texto.includes("jwt") || texto.includes("token")) {
    return "Sua sessão expirou. Recarregue a página para renovar o acesso.";
  }
  if (texto.includes("fetch") || texto.includes("network")) {
    return "Falha de rede ao consultar o servidor. Tente novamente.";
  }
  return null;
}

export function EstadoDados<T>({
  carregando,
  erro,
  dados,
  aoTentarNovamente,
  vazio,
  recurso = "os dados",
  superficie = "desk",
  children,
}: EstadoDadosProps<T>) {
  if (carregando) {
    return (
      <p className="py-6 text-sm text-navy/60" role="status">
        Carregando {recurso}…
      </p>
    );
  }

  const semContrato = !erro && (dados === undefined || dados === null);

  if (erro || semContrato) {
    const noApp = superficie === "app";
    const detalhe = noApp
      ? mensagemDeFalha(erro)
      : erro
        ? mensagemDeErro(erro)
        : `A consulta de ${recurso} não retornou resultado nem erro. Isso é uma falha de carga, não uma base vazia.`;
    const correcao = noApp ? null : caminhoDeCorrecao(erro);
    return (
      <div
        role="alert"
        className="space-y-2 rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm"
      >
        <p className="font-medium text-destructive">Não foi possível carregar {recurso}.</p>
        <p className="text-navy/80">{detalhe}</p>
        {correcao ? <p className="text-navy/70">{correcao}</p> : null}
        {aoTentarNovamente ? (
          <Button type="button" variant="outline" size="sm" onClick={aoTentarNovamente}>
            Tentar novamente
          </Button>
        ) : null}
      </div>
    );
  }

  const lista = dados as T[];
  if (lista.length === 0) {
    return (
      <p className="py-6 text-sm text-navy/60">
        {vazio ?? `Nenhum registro em ${recurso}. A consulta foi concluída com sucesso.`}
      </p>
    );
  }

  return <>{children(lista)}</>;
}
