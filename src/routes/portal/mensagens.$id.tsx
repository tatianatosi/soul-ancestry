import { createFileRoute, useParams } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { COPY_GERAL, COPY_TELAS } from "@/lib/portal-copy";
import { PortalShell, PortalVazio, PortalCarregando } from "@/components/portal/portal-shell";
import { meuTicket, responderTicketCliente } from "@/lib/portal-cliente.functions";

export const Route = createFileRoute("/portal/mensagens/$id")({
  head: () => ({
    meta: [
      { title: "Atendimento — Portal Clube Ancestral" },
      { name: "description", content: "Converse com a equipe sobre o andamento do seu caso." },
      { property: "og:title", content: "Atendimento — Portal Clube Ancestral" },
      { property: "og:description", content: "Mensagens do seu atendimento." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MensagemPage,
});

function MensagemPage() {
  const { id } = useParams({ from: "/portal/mensagens/$id" });
  const queryClient = useQueryClient();
  const carregar = useServerFn(meuTicket);
  const responder = useServerFn(responderTicketCliente);
  const [texto, setTexto] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["portal-ticket", id],
    queryFn: () => carregar({ data: { ticketId: id } }),
  });

  const enviar = useMutation({
    mutationFn: () => responder({ data: { ticketId: id, mensagem: texto } }),
    onSuccess: () => {
      setTexto("");
      queryClient.invalidateQueries({ queryKey: ["portal-ticket", id] });
    },
  });

  if (isLoading) {
    return (
      <PortalShell titulo={COPY_TELAS.atendimento.titulo}>
        <PortalCarregando />
      </PortalShell>
    );
  }
  if (!data) {
    return (
      <PortalShell titulo={COPY_TELAS.atendimento.titulo}>
        <PortalVazio mensagem={COPY_GERAL.semPermissao} />
      </PortalShell>
    );
  }

  return (
    <PortalShell titulo={data.ticket.assunto} descricao={`${data.ticket.categoriaRotulo} · ${data.ticket.statusRotulo}`}>
      <ul className="space-y-3">
        {data.mensagens.map((m) => (
          <li
            key={m.id}
            className={
              m.autor_tipo === "cliente"
                ? "ml-auto max-w-[85%] rounded-xl bg-navy p-3 text-sm text-cream"
                : "max-w-[85%] rounded-xl border border-navy/10 bg-white p-3 text-sm"
            }
          >
            <p className="whitespace-pre-wrap">{m.corpo}</p>
            <p className={m.autor_tipo === "cliente" ? "mt-1 text-[11px] text-cream/60" : "mt-1 text-[11px] text-navy/50"}>
              {m.autor_tipo === "cliente" ? "Você" : "Equipe"} ·{" "}
              {new Date(m.created_at).toLocaleString("pt-BR")}
            </p>
          </li>
        ))}
      </ul>

      {data.ticket.status !== "fechado" ? (
        <div className="mt-5 rounded-xl border border-navy/10 bg-white p-4">
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            rows={4}
            placeholder="Escreva sua mensagem"
            className="w-full rounded-lg border border-navy/15 px-3 py-2 text-sm"
          />
          <button
            onClick={() => enviar.mutate()}
            disabled={enviar.isPending || !texto.trim()}
            className="mt-3 rounded-lg bg-navy px-4 py-2 text-sm text-cream disabled:opacity-60"
          >
            {enviar.isPending ? "Enviando…" : "Responder"}
          </button>
        </div>
      ) : (
        <p className="mt-5 text-sm text-navy/60">Esta conversa foi encerrada. Você pode iniciar uma nova quando precisar.</p>
      )}
    </PortalShell>
  );
}
