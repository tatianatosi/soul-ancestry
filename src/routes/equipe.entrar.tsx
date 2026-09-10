import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import {
  confirmarSessaoEquipe,
  criarPrimeiroAdmin,
  precisaProvisionamento,
  prepararLoginEquipe,
  registrarFalhaLoginEquipe,
} from "@/lib/equipe.functions";

import { EquipeMoldura } from "@/components/equipe/moldura";
import { AvisoConfiguracao } from "@/components/equipe/aviso-configuracao";
import { useHydrated } from "@/hooks/use-hydrated";

export const Route = createFileRoute("/equipe/entrar")({
  head: () => ({
    meta: [
      { title: "Entrar — Equipe Clube Ancestral" },
      { name: "description", content: "Acesso restrito da equipe interna do Clube Ancestral." },
      { property: "og:title", content: "Entrar — Equipe Clube Ancestral" },
      { property: "og:description", content: "Área exclusiva da equipe Clube Ancestral." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: EntrarEquipe,
});

const ERRO_NEUTRO = "Não foi possível entrar. Verifique os dados e tente novamente.";

function EntrarEquipe() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const preparar = useServerFn(prepararLoginEquipe);
  const registrarFalha = useServerFn(registrarFalhaLoginEquipe);
  const confirmar = useServerFn(confirmarSessaoEquipe);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [espera, setEspera] = useState(0);
  const restauracaoIniciada = useRef(false);
  const pronto = useHydrated();

  // Se já existe uma sessão persistida válida (reload, retorno ao app ou nova
  // aba), restaura o Desk sem pedir senha e sem disparar um novo signIn.
  useEffect(() => {
    if (!pronto || restauracaoIniciada.current) return;
    restauracaoIniciada.current = true;
    let cancelado = false;
    void (async () => {
      const { data, error } = await supabase.auth.getUser();
      if (cancelado || error || !data.user) return;
      try {
        const resultado = await confirmar({});
        if (cancelado || !resultado.autorizado) return;
        await queryClient.invalidateQueries();
        navigate({ to: "/painel", replace: true });
      } catch {
        // Uma falha de rede não encerra nem substitui a sessão persistida.
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [confirmar, navigate, pronto, queryClient]);

  // Contagem regressiva do bloqueio por tentativas.
  useEffect(() => {
    if (espera <= 0) return;
    const t = setTimeout(() => setEspera((s) => Math.max(0, s - 1)), 1000);
    return () => clearTimeout(t);
  }, [espera]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pronto) return;
    // Trava contra envios duplicados (clique repetido, Enter múltiplo).
    if (carregando || espera > 0) return;
    setErro(null);
    setCarregando(true);
    // Fora do `try` de propósito: o `catch` precisa saber onde parou.
    let etapa: "limite" | "senha" | "confirmacao" = "limite";
    try {
      const limite = await preparar({ data: { email } });
      if (limite.bloqueado) {
        setEspera(limite.liberaEmSegundos || 60);
        setErro("Muitas tentativas. Aguarde o tempo indicado antes de tentar novamente.");
        return;
      }
      etapa = "senha";
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: senha,
      });
      if (error) {
        // Só a falha consome o limite de tentativas.
        try {
          await registrarFalha({ data: { email } });
        } catch {
          /* contabilização é best-effort */
        }
        // Categoria explícita do erro, sem expor dado sensível.
        const codigo = (error as { code?: string }).code ?? "";
        const status = (error as { status?: number }).status ?? 0;
        if (status === 429 || codigo === "over_request_rate_limit") {
          setEspera(60);
          setErro("Limite temporário de tentativas. Aguarde o tempo indicado.");
        } else if (codigo === "invalid_credentials" || status === 400) {
          setErro("Senha ou e-mail incorretos para esta conta interna.");
        } else if (codigo === "email_not_confirmed") {
          setErro("Esta conta ainda não teve o acesso interno confirmado.");
        } else {
          setErro("Falha temporária do serviço de autenticação. Tente novamente em instantes.");
        }
        return;
      }

      // A sessão mudou: descarta qualquer contexto de papel/organização em
      // cache (inclusive o retrato vazio lido antes do token existir), senão o
      // Desk abre como "Sem papel atribuído" mesmo para a admin.
      await queryClient.cancelQueries();
      queryClient.clear();
      etapa = "confirmacao";
      const r = await confirmar({});
      if (!r.autorizado) {
        setErro("Autenticação válida, mas esta conta não tem acesso interno ativo.");
        navigate({ to: "/equipe/sem-permissao", replace: true });
        return;
      }
      await queryClient.invalidateQueries();
      navigate({ to: "/painel", replace: true });
    } catch {
      /*
        26/08/2026 — este `catch` dizia só a frase neutra, para qualquer falha.
        Custou um dia inteiro de diagnóstico: a senha estava certa, o signIn
        tinha funcionado, e o que quebrava era o passo SEGUINTE, no servidor.
        A tela não tinha como distinguir "senha errada" de "servidor falando
        com o banco errado" — e quem estava na frente dela também não.

        A mensagem continua sem revelar se a conta existe. O que ela passa a
        revelar é em que etapa parou, que é informação sobre o SISTEMA, não
        sobre a pessoa.
      */
      if (etapa === "confirmacao") {
        setErro(
          "Sua senha foi aceita, mas o servidor não conseguiu confirmar a sessão. " +
            "Isso é falha de configuração do servidor, não da sua senha.",
        );
      } else if (etapa === "senha") {
        setErro("Não foi possível falar com o serviço de autenticação. Tente novamente em instantes.");
      } else {
        setErro(ERRO_NEUTRO);
      }
    } finally {
      setCarregando(false);
    }
  }

  // Espera por excesso de tentativas de senha. NÃO é trava de autoridade
  // operacional: é proteção de credencial (rate limit) e deve continuar
  // desabilitando o envio enquanto o contador não zerar.
  const emEspera = espera > 0;
  const rotuloEspera = `${Math.floor(espera / 60)}:${String(espera % 60).padStart(2, "0")}`;

  return (
    <EquipeMoldura
      titulo="Entrar no Desk"
      subtitulo="Painel de Calls continua em Comercial e no Painel Hoje. CRM Mestre e Catálogo 30 ficam na conta, embaixo. Campo com pendência continua editável."
    >
      <form onSubmit={onSubmit} method="post" action="?" className="space-y-4" autoComplete="on">
        <div>
          <label htmlFor="email" className="text-sm font-medium text-navy">
            E-mail corporativo
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-navy/20 bg-white px-3 py-2 text-navy outline-none focus:border-gold"
          />
        </div>
        <div>
          <label htmlFor="senha" className="text-sm font-medium text-navy">
            Senha
          </label>
          <input
            id="senha"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="mt-1 w-full rounded-lg border border-navy/20 bg-white px-3 py-2 text-navy outline-none focus:border-gold"
          />
        </div>
        {erro ? <p className="text-sm text-terracotta">{erro}</p> : null}
        {emEspera ? (
          <p className="text-sm text-navy/70">
            Acesso temporariamente pausado por excesso de tentativas. Liberação em{" "}
            <span className="font-medium text-navy">{rotuloEspera}</span>.
          </p>
        ) : null}
        <button
          type="submit"
          disabled={carregando || !pronto || emEspera}
          className="w-full rounded-lg bg-navy px-4 py-2.5 font-medium text-cream transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {!pronto
            ? "Carregando…"
            : emEspera
              ? `Aguarde ${rotuloEspera}`
              : carregando
                ? "Entrando…"
                : "Entrar"}
        </button>
      </form>

      <AvisoConfiguracao />

      <div className="mt-5 space-y-2 text-sm">
        <Link
          to="/equipe/esqueci-minha-senha"
          className="block text-navy/70 underline underline-offset-4"
        >
          Esqueci minha senha
        </Link>
        <Link to="/acesso" className="block text-navy/50 underline underline-offset-4">
          Sou cliente e recebi um link de acesso
        </Link>
      </div>
      <p className="mt-5 text-xs text-navy/50">
        Não há autocadastro: contas internas são criadas apenas por um administrador.
      </p>
      <PrimeiroAcesso />
    </EquipeMoldura>
  );
}

/** Aparece apenas enquanto a instância não tem nenhum acesso interno cadastrado. */
function PrimeiroAcesso() {
  const verificar = useServerFn(precisaProvisionamento);
  const criar = useServerFn(criarPrimeiroAdmin);
  const navigate = useNavigate();
  const q = useQuery({
    queryKey: ["provisionamento-equipe"],
    queryFn: () => verificar({}),
    retry: false,
  });
  const [form, setForm] = useState({ organizacao: "", nome: "", email: "", senha: "" });
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  if (!q.data?.pendente) return null;

  async function criarConta(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);
    try {
      await criar({ data: form });
      const { error } = await supabase.auth.signInWithPassword({
        email: form.email.trim().toLowerCase(),
        password: form.senha,
      });
      if (error) {
        setErro("Conta criada. Entre com o e-mail e a senha definidos.");
        return;
      }
      navigate({ to: "/painel", replace: true });
    } catch (err) {
      setErro((err as Error).message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <form
      onSubmit={criarConta}
      method="post"
      action="?"
      className="mt-6 space-y-3 rounded-xl border border-gold/40 bg-cream/60 p-4"
    >
      <p className="text-sm font-medium text-navy">Primeiro acesso da organização</p>
      <p className="text-xs text-navy/60">
        Ainda não existe nenhum acesso interno. Crie a organização e o administrador fundador.
        Depois disso, novos membros só entram por convite.
      </p>
      {(
        [
          ["organizacao", "Nome da organização", "text"],
          ["nome", "Seu nome", "text"],
          ["email", "Seu e-mail", "email"],
          ["senha", "Senha (mín. 10 caracteres)", "password"],
        ] as const
      ).map(([campo, rotulo, tipo]) => (
        <label key={campo} className="block text-xs text-navy/70">
          {rotulo}
          <input
            type={tipo}
            required
            value={form[campo]}
            onChange={(e) => setForm((f) => ({ ...f, [campo]: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-navy/20 bg-white px-3 py-2 text-sm text-navy outline-none focus:border-gold"
          />
        </label>
      ))}
      {erro ? <p className="text-sm text-terracotta">{erro}</p> : null}
      <button
        type="submit"
        disabled={carregando}
        className="w-full rounded-lg bg-gold px-4 py-2 text-sm font-medium text-navy disabled:opacity-60"
      >
        {carregando ? "Criando…" : "Criar organização e administrador"}
      </button>
    </form>
  );
}
