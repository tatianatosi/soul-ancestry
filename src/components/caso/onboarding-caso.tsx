import { Secao } from "@/components/caso/campos";
import { PainelJornadaPosGates } from "@/components/caso/jornada-pos-gates";
import { PainelPlanoOnboarding } from "@/components/caso/onboarding-plano";
import { gatesClienteAtivo } from "@/lib/caso-ficha";


type Linha = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

/** Onboarding e gates de "cliente ativo" — App do cliente só abre com onboarding em curso. */
export function AbaOnboarding({
  caso,
  nucleos,
  membrosNucleo,
  planoInicialOk,
  bloqueado: _bloqueado,
  onMudou: _onMudou,
}: {
  caso: Linha;
  nucleos: Linha[];
  membrosNucleo: Linha[];
  planoInicialOk: boolean;
  /**
   * Mantida apenas por compatibilidade com quem chama em `src/routes/`.
   * Ignorada: a decisão de escrita é da autoridade operacional.
   */
  bloqueado?: boolean;
  onMudou: () => void;
}) {
  const nucleo = nucleos[0] ?? null;
  const gates = gatesClienteAtivo({
    contrato_assinado: caso["contrato_assinado"],
    pagamento_confirmado: caso["pagamento_confirmado"],
    responsavel_principal: caso["responsavel_principal"],
    nucleo_ok: Boolean(nucleo),
    dossie_mae: nucleo?.dossie_mae_referencia ?? null,
    plano_inicial_ok: planoInicialOk,
  });
  const pendentes = gates.filter((g) => !g.ok);

  return (
    <div className="space-y-5">
      <PainelPlanoOnboarding caseId={String(caso.id)} />

      <PainelJornadaPosGates
        caseId={String(caso.id)}
        estadoBase={{
          contrato_assinado: Boolean(caso["contrato_assinado"]),
          pagamento_confirmado: Boolean(caso["pagamento_confirmado"]),
          responsavel_principal: caso["responsavel_principal"] ?? null,
          nucleo_ok: Boolean(nucleo),
          dossie_mae: nucleo?.dossie_mae_referencia ?? null,
          plano_acao_ok: planoInicialOk,
        }}
      />

      <Secao titulo="Gates de cliente ativo" descricao="Nenhum caso é considerado ativo com gate pendente.">

        <ul className="grid gap-2 sm:grid-cols-2">
          {gates.map((g) => (
            <li key={g.chave} className="flex items-center gap-2 rounded-lg border border-navy/10 px-3 py-2 text-sm">
              <span className={g.ok ? "text-gold" : "text-terracotta"}>{g.ok ? "●" : "○"}</span>
              <span className="text-navy/80">{g.rotulo}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-navy/55">
          {pendentes.length === 0
            ? "Todos os gates atendidos: o caso pode ser tratado como ativo."
            : `${pendentes.length} gate(s) pendente(s): ${pendentes.map((g) => g.rotulo).join(", ")}.`}
        </p>
      </Secao>

      <Secao titulo="Núcleo familiar" descricao="Família é registro distinto do caso e da pessoa.">
        {!nucleo ? (
          <p className="text-sm text-navy/55">Nenhum núcleo familiar vinculado a este caso.</p>
        ) : (
          <div className="space-y-3 text-sm text-navy/80">
            <p className="font-medium text-navy">{nucleo.nome ?? "Núcleo familiar"}</p>
            <p className="text-xs text-navy/55">Dossiê-mãe: {nucleo.dossie_mae_referencia ?? "pendente"}</p>
            <ul className="space-y-1 text-xs text-navy/70">
              {membrosNucleo.map((m) => (
                <li key={m.id}>
                  {m.nome} — {m.papel}
                  {m.vinculo ? ` · ${m.vinculo}` : ""}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Secao>

    </div>
  );
}
