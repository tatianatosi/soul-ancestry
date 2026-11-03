import { bloqueioDaPessoa, NIVEL_LABEL, type AutorizacaoEmail, type CasoPortal, type PessoaPortal, type PropostaPortal } from "@/lib/portal-elegibilidade";
import { conferirCasoDoAcesso, type AcessoConferencia, type VinculoConferencia } from "@/lib/conferencia-acesso";
import { rotuloTipoProjecao } from "@/lib/projecoes-cliente";

type Projecao = { id: string; case_id: string | null; approval_status: string | null; archived_at: string | null; destination?: string | null; projection_type?: string | null; effective_from?: string | null; approved_by?: string | null; approved_at?: string | null; titular_client_id?: string | null };
const data = (valor?: string | null) => valor ? new Date(valor).toLocaleString("pt-BR") : "Não registrado";

export function ConferenciaPortal({ acesso, pessoa, vinculos, casos, autorizacoes, propostas, projecoes }: {
  acesso: AcessoConferencia; pessoa?: PessoaPortal; vinculos: VinculoConferencia[]; casos: CasoPortal[];
  autorizacoes: AutorizacaoEmail[]; propostas: PropostaPortal[]; projecoes: Projecao[];
}) {
  const nivel = acesso.access_level === "client_workspace" ? "client_workspace" : "proposal_portal";
  const email = autorizacoes.find(a => a.id === acesso.authorized_email_id && a.client_id === acesso.client_id);
  const elegibilidade = pessoa ? bloqueioDaPessoa(pessoa, nivel, autorizacoes, casos, propostas) : null;
  return <details className="mt-4 border-t border-border pt-3" data-conferencia-portal>
    <summary className="cursor-pointer text-sm font-medium">Conferir identidade e conteúdo autorizado</summary>
    <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
      <div><dt className="text-muted-foreground">Pessoa vinculada</dt><dd>{pessoa?.nome ?? "Pessoa não encontrada"}</dd></div>
      <div><dt className="text-muted-foreground">Identidade de entrada</dt><dd>{acesso.auth_user_id ? "Vinculada" : "Não vinculada"}</dd></div>
      <div><dt className="text-muted-foreground">Ambiente</dt><dd>{NIVEL_LABEL[nivel]} · sem papel interno ou Desk</dd></div>
      <div><dt className="text-muted-foreground">Autorização do e-mail</dt><dd>{email?.status === "aprovado" ? "Aprovada para esta pessoa" : "Não confirmada para este acesso"}</dd></div>
      <div><dt className="text-muted-foreground">Convite registrado</dt><dd>{data(acesso.invited_at)}</dd></div>
      <div><dt className="text-muted-foreground">Validade do convite</dt><dd>{data(acesso.invitation_expires_at)}</dd></div>
      <div><dt className="text-muted-foreground">Primeiro acesso registrado</dt><dd>{data(acesso.first_authenticated_at)}</dd></div>
      <div><dt className="text-muted-foreground">Último acesso registrado</dt><dd>{data(acesso.last_authenticated_at)}</dd></div>
    </dl>
    {acesso.access_status === "invited" ? <p className="mt-3 text-sm text-muted-foreground">Convite pendente de utilização; não comprova entrada concluída.</p> : null}
    <p className="mt-3 text-xs text-muted-foreground">Financeiro depende da autorização específica do contratante, validada ao abrir a informação. Aprovação para envio do contrato não significa entrega no App; a entrega privada permanece pendente.</p>
    {elegibilidade?.motivos.length ? <details className="mt-3 text-xs"><summary className="cursor-pointer">Pendências de elegibilidade para concessão</summary><ul className="mt-2 space-y-1">{elegibilidade.motivos.map(m => <li key={m}>{m}</li>)}</ul></details> : null}
    <ul className="mt-3 divide-y divide-border">
      {vinculos.length === 0 ? <li className="py-2 text-sm">Nenhum vínculo de caso registrado.</li> : vinculos.map(v => {
        const caso = casos.find(c => c.id === v.case_id && !c.demo);
        const c = conferirCasoDoAcesso(acesso, v, caso);
        const publicadas = caso ? projecoes.filter(p => p.case_id === v.case_id && p.approval_status === "published" && !p.archived_at && p.destination === "app" && p.approved_at && p.approved_by && p.effective_from && new Date(p.effective_from).getTime() <= Date.now() && (!p.titular_client_id || p.titular_client_id === acesso.client_id) && !["contrato", "proposta"].includes(p.projection_type ?? "")) : [];
        return <li key={v.id ?? v.case_id} className="py-3 text-sm">
          <p className="font-medium">{caso ? `${caso.codigo ?? ""} — ${caso.titulo ?? "Caso"}` : "Caso ausente nesta leitura"}</p>
          <p className="mt-1 text-muted-foreground">{c.escopoAtivo ? "Vínculo e liberação registrados; leitura do cliente ainda exige validação de acesso." : c.motivos.join(" · ")}</p>
          <p className="mt-2 text-xs text-muted-foreground">Itens aprovados e publicados no caso para este titular: {publicadas.length}. Acesso e sanitização são revalidados pelo leitor do App.</p>
          <ul className="mt-1 space-y-1 text-xs">{publicadas.map(p => <li key={p.id}>{rotuloTipoProjecao(p.projection_type)} · {data(p.effective_from ?? p.approved_at)}</li>)}</ul>
        </li>;
      })}
    </ul>
    <details className="mt-2 text-xs text-muted-foreground"><summary className="cursor-pointer">Detalhes técnicos da identidade</summary><p className="mt-2 break-all">Pessoa: {acesso.client_id ?? "Não vinculada"}</p><p className="break-all">Usuário: {acesso.auth_user_id ?? "Não vinculado"}</p></details>
  </details>;
}