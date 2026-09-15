/**
 * Atendimento do lead: Discovery e call em um formulário só.
 *
 * Grava no lead que já existe, com listas fechadas de situação da call e de
 * resultado do Discovery. Nada é enviado para fora e nada é inferido.
 */
import { Acao, Acoes } from "@/components/golive/acoes";
import { RESULTADOS_DISCOVERY, SITUACOES_CALL } from "@/lib/golive-comercial";

export function AcaoAtendimento({
  leadId,
  aoConfirmar,
}: {
  leadId: string;
  aoConfirmar: (v: Record<string, string>) => Promise<unknown>;
}) {
  return (
    <Acoes>
      <Acao
        rotulo="Registrar atendimento"
        titulo="Discovery e call do lead"
        variante="outline"
        campos={[
          {
            nome: "situacaoCall",
            rotulo: "Situação da call",
            tipo: "escolha",
            obrigatorio: true,
            opcoes: SITUACOES_CALL.map((s) => ({ valor: s.valor, rotulo: s.rotulo })),
          },
          { nome: "callEm", rotulo: "Data da call", tipo: "data" },
          {
            nome: "resultado",
            rotulo: "Resultado do Discovery",
            tipo: "escolha",
            opcoes: RESULTADOS_DISCOVERY.map((r) => ({ valor: r.valor, rotulo: r.rotulo })),
            ajuda: "Sem resultado escolhido, a etapa do lead não muda.",
          },
          { nome: "resumo", rotulo: "Resumo interno", tipo: "area", obrigatorio: true },
          { nome: "proximoPasso", rotulo: "Próxima ação", obrigatorio: true },
          { nome: "proximoPassoEm", rotulo: "Próxima ação em", tipo: "data" },
          { nome: "responsavel", rotulo: "Responsável" },
        ]}
        aoConfirmar={(v) =>
          aoConfirmar({
            leadId,
            situacaoCall: v["situacaoCall"] ?? "",
            callEm: v["callEm"] ?? "",
            resultado: v["resultado"] ?? "",
            resumo: v["resumo"] ?? "",
            proximoPasso: v["proximoPasso"] ?? "",
            proximoPassoEm: v["proximoPassoEm"] ?? "",
            responsavel: v["responsavel"] ?? "",
          })
        }
        confirmacao="Atendimento registrado. O lead já aparece atualizado no funil e no kanban."
      />
    </Acoes>
  );
}
