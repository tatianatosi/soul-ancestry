import { PAPEL_LABEL } from "@/components/saas/shell";
import { ROTULO_CAPACIDADE } from "@/lib/modo-proprietaria";
import { conferirMembro, type MembroConferencia, type PapelRegistrado } from "@/lib/conferencia-acesso";

const papel = (valor: string) => PAPEL_LABEL[valor as keyof typeof PAPEL_LABEL] ?? valor;

export function ConferenciaMembro({ membro, papeis }: { membro: MembroConferencia; papeis: readonly PapelRegistrado[] }) {
  const c = conferirMembro(membro, papeis);
  return (
    <details className="mt-4 border-t border-border pt-3" data-conferencia-membro>
      <summary className="cursor-pointer text-sm font-medium text-foreground">Conferir acesso deste membro</summary>
      <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
        <div><dt className="text-muted-foreground">Papel cadastrado</dt><dd>{papel(membro.role)}</dd></div>
        <div><dt className="text-muted-foreground">Papéis registrados na organização</dt><dd>{c.registrados.map(papel).join(" · ") || "Nenhum registrado"}</dd></div>
        <div><dt className="text-muted-foreground">Identidade de entrada</dt><dd>{membro.auth_user_id ? "Vinculada" : "Não vinculada"}</dd></div>
        <div><dt className="text-muted-foreground">Contexto efetivo</dt><dd>{c.efetivos.map(papel).join(" · ") || "Sem papéis efetivos"}</dd></div>
      </dl>
      <p className="mt-3 text-xs text-muted-foreground">Conferência operacional da própria organização, sem entrar como este membro. A autorização de cada leitura e gravação continua sendo validada no servidor e nas políticas de acesso.</p>
      <ul className="mt-3 divide-y divide-border text-xs">
        {c.operacoes.map(o => <li key={o.capacidade} className="flex flex-wrap justify-between gap-2 py-2">
          <span className="min-w-0 flex-1">{ROTULO_CAPACIDADE[o.capacidade]}</span>
          <span>{o.decisao === "permitir" ? "Permitida no avaliador operacional" : o.decisao === "confirmar" ? "Exige confirmação" : "Indisponível no avaliador operacional"}</span>
        </li>)}
      </ul>
      <details className="mt-3 text-xs text-muted-foreground"><summary className="cursor-pointer">Detalhes técnicos da identidade</summary>
        <p className="mt-2 break-all">Usuário: {membro.auth_user_id ?? "Não vinculado"}</p>
        <p className="break-all">Organização do cadastro: {membro.organization_id}</p>
        <p className="break-all">Organização efetiva: {c.organizationId ?? "Não ativa"}</p>
      </details>
    </details>
  );
}