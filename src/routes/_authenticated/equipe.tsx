import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { Link } from "@tanstack/react-router";

import { EstadoVazio, PAPEL_LABEL, SaasShell } from "@/components/saas/shell";
import { useAutoridade } from "@/components/saas/autoridade";
import { AcaoOperacional } from "@/components/saas/acao-operacional";
import { EstadoDados } from "@/components/saas/estado-dados";
import { StatusEnvioRecuperacao } from "@/components/equipe/status-envio-recuperacao";
import { ConferenciaMembro } from "@/components/equipe/conferencia-membro";
import { type PapelRegistrado } from "@/lib/conferencia-acesso";
import {
  alterarPapelMembro,
  alterarStatusMembro,
  arquivarMembroEquipe,
  convidarMembroEquipe,
  listarEquipe,
} from "@/lib/equipe.functions";
import { KitBadge, KitCard, KpiCard } from "@/components/clube-ancestral-kit";
import { CaCard } from "@/components/ui/ca-card";
import { Etiqueta, type Tom } from "@/components/prancha-v4/kit";
import { CAPACIDADES_PROPRIETARIA, ROTULO_CAPACIDADE } from "@/lib/modo-proprietaria";
import { AvisoCampo, motivoCampoInvalido } from "@/components/campos/aviso-campo";

export const Route = createFileRoute("/_authenticated/equipe")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Usuários e papéis — Clube Ancestral" },
      { name: "description", content: "Gestão de acessos internos, papéis e status da equipe Clube Ancestral." },
      { property: "og:title", content: "Usuários e papéis — Clube Ancestral" },
      { property: "og:description", content: "Convites internos, papéis e suspensão de acessos da equipe." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: EquipePage,
});

// V4-05: tom do chip de estado do membro (mesmo vocabulário de STATUS_LABEL).
const TOM_STATUS: Record<string, Tom> = { active: "sucesso", invited: "atencao", suspended: "critico", revoked: "critico" };

const STATUS_LABEL: Record<string, string> = {
  invited: "Convidado",
  active: "Ativo",
  suspended: "Suspenso",
  revoked: "Revogado",
};

const PAPEIS = ["admin", "operacoes", "pesquisador", "comercial", "financeiro", "leitura"] as const;

type MembroEquipe = {
  id: string;
  organization_id: string;
  auth_user_id: string | null;
  role: string;
  status: string;
  full_name?: string | null;
  demo?: boolean;
  email?: string | null;
  last_login_at?: string | null;
  reason?: string | null;
};

/**
 * MOTOR-UNIVERSAL-ACAO-HISTORICO-FILA (Lote 2): trocar papel (inclusive
 * admin) e suspender/revogar/arquivar exigiam só um clique ou um
 * window.prompt com motivo opcional. Agora tudo passa por AcaoOperacional
 * (motivo obrigatório, efeito explícito) — mesmo padrão do resto do Desk.
 */
function LinhaMembro({
  m,
  papeis,
  executar,
  mudarPapel,
  mudarStatus,
  arquivar,
}: {
  m: MembroEquipe;
  papeis: readonly PapelRegistrado[];
  executar: (fn: () => Promise<unknown>) => Promise<void>;
  mudarPapel: (args: { data: { id: string; papel: string; motivo: string } }) => Promise<unknown>;
  mudarStatus: (args: { data: { id: string; status: "active" | "suspended" | "revoked"; motivo?: string } }) => Promise<unknown>;
  arquivar: (args: { data: { id: string; motivo: string } }) => Promise<unknown>;
}) {
  const [papelEscolhido, setPapelEscolhido] = useState(m.role);

  return (
    <div className="rounded-xl border border-navy/10 bg-cream/40 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2 font-medium">
            {m.full_name ?? "—"}
            <Etiqueta texto={STATUS_LABEL[m.status] ?? m.status} tom={TOM_STATUS[m.status] ?? "neutro"} />
            {m.demo ? <Etiqueta texto="DEMO" tom="atencao" /> : null}
          </p>
          <p className="break-words text-sm text-navy/60">{m.email}</p>
          <p className="mt-1 text-xs uppercase tracking-wide text-navy/50">
            {PAPEL_LABEL[m.role as keyof typeof PAPEL_LABEL]}
            {m.last_login_at ? ` · último acesso ${new Date(m.last_login_at).toLocaleString("pt-BR")}` : ""}
          </p>
          {m.reason ? <p className="mt-1 text-xs text-navy/50">Motivo: {m.reason}</p> : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={papelEscolhido}
            onChange={(e) => setPapelEscolhido(e.target.value)}
            className="rounded-lg border border-navy/20 px-2 py-1.5 text-xs"
          >
            {PAPEIS.map((p) => (
              <option key={p} value={p}>
                {PAPEL_LABEL[p]}
              </option>
            ))}
          </select>
          <AcaoOperacional
            rotulo="Aplicar papel"
            size="sm"
            className="rounded-lg border border-navy/20 px-3 py-1.5 text-xs"
            acaoExterna="alterar_papel_membro"
            validacaoFormulario={papelEscolhido === m.role ? "Escolha um papel diferente do atual antes de aplicar." : null}
            efeito={`Altera o papel deste membro de ${PAPEL_LABEL[m.role as keyof typeof PAPEL_LABEL]} para ${PAPEL_LABEL[papelEscolhido as keyof typeof PAPEL_LABEL]} — inclui acesso administrativo quando aplicável.`}
            onConfirmar={(motivo) => executar(() => mudarPapel({ data: { id: m.id, papel: papelEscolhido, motivo } }))}
          />
          {m.status !== "active" ? (
            <AcaoOperacional
              rotulo="Reativar"
              size="sm"
              className="rounded-lg border border-navy/20 px-3 py-1.5 text-xs"
              acaoExterna="reativar_membro_equipe"
              efeito="Reativa o acesso deste membro à organização."
              onConfirmar={(motivo) => executar(() => mudarStatus({ data: { id: m.id, status: "active", motivo } }))}
            />
          ) : (
            <AcaoOperacional
              rotulo="Suspender"
              size="sm"
              className="rounded-lg border border-navy/20 px-3 py-1.5 text-xs"
              acaoExterna="suspender_membro_equipe"
              efeito="Suspende o acesso deste membro até ser reativado."
              onConfirmar={(motivo) => executar(() => mudarStatus({ data: { id: m.id, status: "suspended", motivo } }))}
            />
          )}
          <AcaoOperacional
            rotulo="Revogar"
            size="sm"
            className="rounded-lg border border-terracotta/40 px-3 py-1.5 text-xs text-terracotta"
            acaoExterna="revogar_membro_equipe"
            efeito="Revoga o acesso deste membro à organização."
            onConfirmar={(motivo) => executar(() => mudarStatus({ data: { id: m.id, status: "revoked", motivo } }))}
          />
          <AcaoOperacional
            rotulo="Arquivar"
            size="sm"
            className="rounded-lg border border-navy/20 px-3 py-1.5 text-xs"
            acaoExterna="arquivar_membro_equipe"
            efeito="Arquiva este membro — acesso revogado e registro preservado com motivo e responsável."
            onConfirmar={(motivo) => executar(() => arquivar({ data: { id: m.id, motivo } }))}
          />
        </div>
      </div>
      <ConferenciaMembro membro={m} papeis={papeis} />
    </div>
  );
}

function EquipePage() {
  const autoridade = useAutoridade();
  // Antes: `ehAdmin` escondia a tela inteira. Agora só falta de papel/organização bloqueia.
  const decisao = autoridade.decidir({ capacidade: "editar_fila_responsavel_prazo" });
  const liberado = decisao.decisao !== "bloquear";
  const queryClient = useQueryClient();
  const listar = useServerFn(listarEquipe);
  const convidar = useServerFn(convidarMembroEquipe);
  const mudarPapel = useServerFn(alterarPapelMembro);
  const mudarStatus = useServerFn(alterarStatusMembro);
  const arquivar = useServerFn(arquivarMembroEquipe);

  const q = useQuery({ queryKey: ["equipe"], queryFn: () => listar({}) });
  const invalidar = () => queryClient.invalidateQueries({ queryKey: ["equipe"] });

  const [email, setEmail] = useState("");
  const [nome, setNome] = useState("");
  const [papel, setPapel] = useState<string>("leitura");
  const [dias, setDias] = useState(7);
  const [msg, setMsg] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const mConvite = useMutation({
    mutationFn: () => convidar({ data: { email, nome, papel, diasValidade: dias } }),
    onSuccess: () => {
      setMsg("Convite criado. Enviamos um link temporário para definição da senha inicial.");
      setErro(null);
      setEmail("");
      setNome("");
      invalidar();
    },
    onError: (e: Error) => {
      setErro(e.message);
      setMsg(null);
    },
  });

  async function executar(fn: () => Promise<unknown>) {
    try {
      await fn();
      setErro(null);
      invalidar();
    } catch (e) {
      setErro((e as Error).message);
    }
  }

  // Cartões de decisão do grupo Administração — contam só o que já está
  // carregado por listarEquipe; sem fonte real, "Sem dados suficientes".
  const membros = (q.data?.membros ?? []).filter(m => !m.demo);
  const usuariosAtivos = q.data ? membros.filter((m) => m.status === "active").length : null;
  const convitesPendentes = q.data ? membros.filter((m) => m.status === "invited").length : null;
  const suspensosOuRevogados = q.data
    ? membros.filter((m) => m.status === "suspended" || m.status === "revoked").length
    : null;
  const papeisNaoReconhecidos = q.data
    ? membros.filter((m) => m.status === "active" && !(PAPEIS as readonly string[]).includes(m.role)).length
    : null;

  return (
    <SaasShell
      titulo="Usuários e papéis"
      descricao="Equipe interna acessa por e-mail e senha. Não existe autocadastro."
      visualKit="pantone"
    >
      {!liberado ? (
        <EstadoVazio mensagem={decisao.motivo} />
      ) : (
        <div className="space-y-8">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard label="Usuários ativos" value={usuariosAtivos} detail="Status ativo" tone="success" />
            <KpiCard label="Convites pendentes" value={convitesPendentes} detail="Aguardando definição de senha" tone="attention" />
            <KpiCard label="Suspensos ou revogados" value={suspensosOuRevogados} detail="Sem acesso ativo" tone="critical" />
            <KpiCard label="Papéis não reconhecidos" value={papeisNaoReconhecidos} detail="Fora da lista padrão" tone="critical" />
          </div>

          <StatusEnvioRecuperacao />

          <KitCard eyebrow="Acesso Master" title="Convidar membro" action={<KitBadge tone="gold">Equipe interna</KitBadge>}>
            <h2 className="font-serif text-xl">Convidar membro</h2>
            <p className="mt-1 text-sm text-navy/60">
              O convite envia um link temporário apenas para definir a senha inicial. Papel e organização são
              gravados no servidor.
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="text-sm">
                E-mail
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-navy/20 px-3 py-2"
                  placeholder="pessoa@clubeancestral.com"
                  aria-invalid={Boolean(motivoCampoInvalido("E-mail", "email", email))}
                />
                <AvisoCampo motivo={motivoCampoInvalido("E-mail", "email", email)} />
              </label>
              <label className="text-sm">
                Nome
                <input
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-navy/20 px-3 py-2"
                />
              </label>
              <label className="text-sm">
                Papel
                <select
                  value={papel}
                  onChange={(e) => setPapel(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-navy/20 px-3 py-2"
                >
                  {PAPEIS.map((p) => (
                    <option key={p} value={p}>
                      {PAPEL_LABEL[p]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                Validade do convite (dias)
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={dias}
                  onChange={(e) => setDias(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-navy/20 px-3 py-2"
                />
              </label>
            </div>
            <button
              onClick={() => mConvite.mutate()}
              disabled={!email || mConvite.isPending}
              className="mt-4 rounded-lg bg-navy px-4 py-2 text-sm font-medium text-cream disabled:opacity-50"
            >
              {mConvite.isPending ? "Enviando…" : "Convidar"}
            </button>
            {msg ? <p className="mt-3 text-sm text-green-700">{msg}</p> : null}
            {erro ? <p className="mt-3 text-sm text-terracotta">{erro}</p> : null}
          </KitCard>

          {/*
            §23 do De-Para (Desk — Configuração & Acesso): 5 zonas.
            "Usuários" já existia (cards acima + lista de membros). As
            outras 4 são adicionadas aqui, ligando para a superfície
            canônica real de cada uma em vez de duplicar estado (regra do
            próprio §23, "Legado": "Configurações duplicadas que alteram o
            mesmo estado em lugares diferentes" — /acessos-portal,
            /configuracoes e /integracoes já são essas fontes; não crio uma
            segunda tela para o mesmo dado).
          */}
          <div className="grid gap-4 lg:grid-cols-2">
            <CaCard titulo="Papéis" eyebrow="Configuração & Acesso · Permissões" data-config-papeis>
              <p className="text-sm text-navy/70">
                {PAPEIS.length} papéis internos reais: {PAPEIS.map((p) => PAPEL_LABEL[p]).join(", ")}.
              </p>
              {/*
                DIVERGÊNCIA REGISTRADA (§29): o wireframe pede uma matriz de
                permissões por domínio (leitura/edição/publicação/
                administração) por papel. O único conjunto de permissões
                documentado em código hoje é binário — admin (Modo
                Proprietária Administradora) tem as capacidades abaixo; os
                outros 5 papéis são verificados caso a caso, espalhados em
                cada tela (`autoridade.decidir`), sem matriz central. Listar
                um "sim/não" por domínio para cada papel aqui seria inventar
                dado que o código não garante — mostro a fonte real e
                declaro a lacuna, não finjo a matriz.
              */}
              <p className="mt-3 text-xs uppercase tracking-wide text-navy/50">
                Capacidades exclusivas do papel admin ({CAPACIDADES_PROPRIETARIA.length})
              </p>
              <ul className="mt-1 space-y-1 text-xs text-navy/70">
                {CAPACIDADES_PROPRIETARIA.slice(0, 6).map((c) => (
                  <li key={c}>• {ROTULO_CAPACIDADE[c]}</li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-navy/50">
                Sem matriz central por domínio para os outros 5 papéis ainda — cada tela do Desk decide por
                capacidade própria (`autoridade.decidir`), não por uma tabela de permissões versionada.
              </p>
            </CaCard>

            <CaCard titulo="Acessos por família/caso" eyebrow="Configuração & Acesso · Escopo e validade" data-config-acessos>
              <p className="text-sm text-navy/70">
                Acesso do cliente ao App (link mágico, caso autorizado, revogação) é gerido em Acessos ao portal —
                mesma fonte usada pelo Caso 360, sem duplicar aqui.
              </p>
              <Link
                to="/acessos-portal"
                className="mt-3 inline-block text-sm text-navy underline decoration-gold underline-offset-4"
              >
                Abrir Acessos ao portal →
              </Link>
            </CaCard>

            <CaCard titulo="Parâmetros" eyebrow="Configuração & Acesso · Taxonomias e cadências" data-config-parametros>
              <p className="text-sm text-navy/70">
                Taxonomias, estados e regras de alerta são versionados em Configurações — mesma fonte, sem cópia
                paralela aqui.
              </p>
              <Link
                to="/configuracoes"
                className="mt-3 inline-block text-sm text-navy underline decoration-gold underline-offset-4"
              >
                Abrir Configurações →
              </Link>
            </CaCard>

            <CaCard titulo="Integrações/auditoria" eyebrow="Configuração & Acesso · Saúde e registro" data-config-integracoes>
              <p className="text-sm text-navy/70">
                Integrações habilitadas, saúde e última sincronização vivem no Centro de Integrações; eventos
                críticos e ações administrativas entram em audit_logs.
              </p>
              <Link
                to="/integracoes"
                className="mt-3 inline-block text-sm text-navy underline decoration-gold underline-offset-4"
              >
                Abrir Integrações →
              </Link>
            </CaCard>
          </div>

          <CaCard titulo="Membros">
            <EstadoDados
              carregando={q.isLoading}
              erro={q.error}
              dados={q.data ? membros : null}
              aoTentarNovamente={() => void q.refetch()}
              recurso="a equipe"
              vazio="Nenhum acesso interno cadastrado."
            >
              {(listaMembros) => (
              <div className="mt-3 space-y-3">
                {listaMembros.map((m) => (
                  <LinhaMembro
                    key={m.id}
                    m={m}
                    papeis={q.data?.papeisRegistrados ?? []}
                    executar={executar}
                    mudarPapel={mudarPapel}
                    mudarStatus={mudarStatus}
                    arquivar={arquivar}
                  />
                ))}
              </div>
              )}
            </EstadoDados>
            <p className="mt-4 text-xs text-navy/50">
              Acessos internos nunca são excluídos fisicamente: são arquivados com motivo e responsável, e toda
              alteração entra na auditoria.
            </p>
          </CaCard>
        </div>
      )}
    </SaasShell>
  );
}
