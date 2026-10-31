import { createFileRoute } from "@tanstack/react-router";

/**
 * Retrato da conexão do SERVIDOR com o Supabase.
 *
 * 26/08/2026 — a Proprietária passou dois dias sem entrar. Cada rodada de
 * diagnóstico custava uma tentativa de senha dela e uma leitura de HTML minha,
 * e mesmo assim não distinguia "senha errada" de "servidor no banco errado".
 *
 * Esta rota responde isso de uma vez, sem senha e sem tentativa: diz a que
 * projeto o servidor está falando e se as credenciais dele funcionam ali.
 *
 * O que ela devolve é deliberadamente não sensível:
 *  - `ref` de projeto é público — viaja na URL de toda requisição;
 *  - chaves aparecem só como FORMATO ("sb_secret_", "jwt", "ausente"),
 *    nunca como valor;
 *  - as sondas devolvem só "funcionou / não funcionou" e a mensagem de erro
 *    do Supabase, higienizada contra eco de credencial.
 *
 * Não lê nem escreve dado de cliente: a sonda do banco é uma contagem
 * `head: true`, que não traz linha nenhuma.
 */
export const Route = createFileRoute("/equipe/diagnostico-conexao")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { diagnosticoDoServidor, urlDoServidor, chavePublicavelDoServidor, chaveSecretaDoServidor } =
          await import("@/lib/config-servidor");

        /*
         * 26/10/2026 (auditoria pré-lançamento, M1): a rota era pública e gastava
         * a chave secreta a cada acesso. Agora só responde a admin ativo,
         * com o token da sessão no cabeçalho Authorization.
         */
        const negado = () =>
          new Response(JSON.stringify({ erro: "Acesso restrito à administração." }), {
            status: 401,
            headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
          });
        const token = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
        if (!token) return negado();
        {
          const { createClient: criar } = await import("@supabase/supabase-js");
          const cliente = criar(urlDoServidor(), chavePublicavelDoServidor(), {
            auth: { persistSession: false, autoRefreshToken: false },
            global: { headers: { Authorization: `Bearer ${token}` } },
          });
          const { data: quem } = await cliente.auth.getUser(token);
          if (!quem?.user) return negado();
          const { data: staff } = await cliente
            .from("staff_access")
            .select("role,status")
            .eq("auth_user_id", quem.user.id)
            .is("archived_at", null)
            .maybeSingle();
          if (staff?.status !== "active" || staff?.role !== "admin") return negado();
        }

        const base = diagnosticoDoServidor();
        const url = urlDoServidor();
        const publicavel = chavePublicavelDoServidor();
        const secreta = chaveSecretaDoServidor();

        /** Nenhuma credencial pode atravessar a resposta, nem dentro de um erro. */
        const higienizar = (texto: string) => {
          let t = texto;
          for (const segredo of [publicavel, secreta]) {
            if (segredo && segredo.length > 8) t = t.split(segredo).join("«omitido»");
          }
          return t.slice(0, 300);
        };

        const { createClient } = await import("@supabase/supabase-js");

        /** O servidor consegue LER a tabela da equipe com a chave secreta? */
        let sondaSegredo: { ok: boolean; detalhe: string };
        if (!secreta) {
          sondaSegredo = { ok: false, detalhe: "Não há chave secreta no ambiente do servidor." };
        } else {
          try {
            const admin = createClient(url, secreta, {
              auth: { persistSession: false, autoRefreshToken: false },
              global: { headers: { apikey: secreta } },
            });
            const { error } = await admin
              .from("staff_access")
              .select("id", { count: "exact", head: true });
            sondaSegredo = error
              ? { ok: false, detalhe: higienizar(error.message) }
              : { ok: true, detalhe: "Leu staff_access no projeto em uso." };
          } catch (e) {
            sondaSegredo = { ok: false, detalhe: higienizar(String(e)) };
          }
        }

        /** A chave publicável responde no projeto em uso? */
        let sondaPublicavel: { ok: boolean; detalhe: string };
        try {
          const anon = createClient(url, publicavel, {
            auth: { persistSession: false, autoRefreshToken: false },
          });
          const { error } = await anon.auth.getUser("token.invalido.deproposito");
          // Um token inválido DEVE ser recusado. Recusar é sinal de que o
          // projeto respondeu; o que importa aqui é ter havido resposta.
          sondaPublicavel = error
            ? { ok: true, detalhe: "O projeto respondeu (recusou um token inválido, como deve)." }
            : { ok: false, detalhe: "O projeto aceitou um token inválido — resposta inesperada." };
        } catch (e) {
          sondaPublicavel = { ok: false, detalhe: higienizar(String(e)) };
        }

        const tudoCerto = sondaSegredo.ok && sondaPublicavel.ok && base.segredoPodeServir !== "nao";

        return new Response(
          JSON.stringify(
            {
              veredito: tudoCerto
                ? "O servidor está falando com o projeto declarado e as credenciais funcionam."
                : "O servidor NÃO consegue operar no projeto declarado. Detalhes abaixo.",
              ...base,
              sondaPublicavel,
              sondaSegredo,
              geradoEm: new Date().toISOString(),
            },
            null,
            2,
          ),
          {
            status: 200,
            headers: {
              "content-type": "application/json; charset=utf-8",
              "cache-control": "no-store",
              "x-robots-tag": "noindex",
            },
          },
        );
      },
    },
  },
});
