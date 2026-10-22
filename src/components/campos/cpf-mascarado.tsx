import { useState } from "react";

import { formatarCpf, mascararCpf } from "@/lib/validacao-pessoa";

/**
 * CPF em leitura, mascarado por padrão (22/10/2026, decisão da Proprietária).
 *
 * A Pessoa 360 mostrava o documento inteiro assim que a tela abria. Agora a
 * primeira leitura é `•••.•••.123-45`, e quem precisa do número completo clica
 * em "revelar" — uma escolha consciente, não o estado padrão de uma tela que a
 * equipe deixa aberta o dia todo.
 *
 * Nada é gravado nem enviado: o botão só troca o que a própria tela exibe. A
 * máscara é de apresentação, não de autorização — quem não pode ler a pessoa
 * não chega até aqui, porque a RLS decide isso no servidor.
 *
 * Fora de escopo de propósito: as telas de reconciliação de CPF
 * (`reconciliar-cpf-partes`, `reconciliar-cpf-membros-caso`) comparam dois
 * documentos lado a lado para achar divergência — mascarar ali inutilizaria a
 * ferramenta.
 */
export function CpfMascarado({ cpf }: { cpf: string }) {
  const [revelado, setRevelado] = useState(false);

  return (
    <span className="inline-flex flex-wrap items-center gap-2" data-cpf-mascarado={revelado ? "revelado" : "mascarado"}>
      <span className="tabular-nums">{revelado ? formatarCpf(cpf) : mascararCpf(cpf)}</span>
      <button
        type="button"
        onClick={() => setRevelado((v) => !v)}
        aria-pressed={revelado}
        className="rounded text-[11px] uppercase tracking-wide text-navy/45 underline-offset-2 transition-colors hover:text-navy hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
      >
        {revelado ? "ocultar" : "revelar"}
      </button>
    </span>
  );
}
