/**
 * Criar e corrigir modelo na Biblioteca de Mensagens (Corte F, 05/10/2026).
 *
 * Medido antes de montar: a tela listava, versionava, mudava status e registrava
 * uso dos modelos — e **não deixava criar nem corrigir nenhum**. O escritor
 * `salvarTemplate` existia desde sempre, com validação de conteúdo
 * (`validarConteudoTemplate`: termo vetado em texto cliente-facing, variável
 * insegura como cpf/rg/token/senha/documento/valor) e sem chamador: modelo novo
 * só nascia por SQL.
 *
 * O modelo nasce em rascunho; promover a vigente continua sendo o fluxo de
 * status que a tela já tem, com os estados de administrador. Nada é enviado,
 * agendado ou disparado aqui.
 */

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { CaCard } from "@/components/ui/ca-card";
import { CANAIS, salvarTemplate, validarConteudoTemplate, type Canal } from "@/lib/message-library.functions";
import { useAvisoEdicaoNaoSalva } from "@/lib/aviso-edicao-nao-salva";

const PUBLICOS = [
  { valor: "interno", rotulo: "Interno (equipe)" },
  { valor: "cliente", rotulo: "Cliente" },
  { valor: "lead", rotulo: "Lead" },
  { valor: "publico", rotulo: "Público (editorial)" },
] as const;

export type TemplateEditavel = {
  id?: string;
  categoriaId: string;
  key: string;
  nome: string;
  objetivo: string;
  canal: Canal;
  etapa: string;
  publico: string;
  corpo: string;
  assunto: string;
};

const VAZIO: TemplateEditavel = {
  categoriaId: "",
  key: "",
  nome: "",
  objetivo: "",
  canal: "whatsapp",
  etapa: "",
  publico: "interno",
  corpo: "",
  assunto: "",
};

export function EditorTemplate({
  categorias,
  inicial,
  aoConcluir,
  aoCancelar,
}: {
  categorias: { id: string; name: string }[];
  inicial?: TemplateEditavel | null;
  aoConcluir: () => void;
  aoCancelar?: () => void;
}) {
  const salvar = useServerFn(salvarTemplate);
  const [form, setForm] = useState<TemplateEditavel>(inicial ?? VAZIO);
  /* F5 / sair da linha (09/10/2026): trava a saída com edição pendente. */
  useAvisoEdicaoNaoSalva(JSON.stringify(form) !== JSON.stringify(inicial ?? VAZIO));

  // Mesma função que o servidor aplica — o aviso aparece antes de enviar,
  // mas quem recusa continua sendo o servidor.
  const problemas = validarConteudoTemplate(form.corpo, form.publico);
  const faltando: string[] = [];
  if (!form.categoriaId) faltando.push("categoria");
  if (!form.key.trim()) faltando.push("chave");
  if (!form.nome.trim()) faltando.push("nome");
  if (!form.corpo.trim()) faltando.push("corpo");

  const m = useMutation({
    mutationFn: () =>
      salvar({
        data: {
          id: form.id,
          categoriaId: form.categoriaId,
          key: form.key,
          nome: form.nome,
          objetivo: form.objetivo || undefined,
          canal: form.canal,
          etapa: form.etapa || undefined,
          publico: form.publico,
          corpo: form.corpo,
          assunto: form.assunto || undefined,
        },
      }),
    onSuccess: () => {
      toast.success(
        form.id
          ? "Modelo corrigido. A versão anterior fica no histórico."
          : "Modelo criado em rascunho. Promover a vigente é o fluxo de status desta tela.",
      );
      setForm(VAZIO);
      aoConcluir();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <CaCard variante="compacto" titulo={form.id ? "Corrigir modelo" : "Criar modelo"} data-editor-template>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1 block text-navy/70">Categoria *</span>
          <select
            value={form.categoriaId}
            onChange={(e) => setForm({ ...form, categoriaId: e.target.value })}
            className="w-full rounded-lg border border-navy/20 px-3 py-2 text-sm"
          >
            <option value="">Selecione…</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-navy/70">Chave * (minúscula, sem espaço)</span>
          <input
            value={form.key}
            onChange={(e) => setForm({ ...form, key: e.target.value })}
            className="w-full rounded-lg border border-navy/20 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-navy/70">Nome *</span>
          <input
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            className="w-full rounded-lg border border-navy/20 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-navy/70">Canal</span>
          <select
            value={form.canal}
            onChange={(e) => setForm({ ...form, canal: e.target.value as Canal })}
            className="w-full rounded-lg border border-navy/20 px-3 py-2 text-sm"
          >
            {CANAIS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-navy/70">Público</span>
          <select
            value={form.publico}
            onChange={(e) => setForm({ ...form, publico: e.target.value })}
            className="w-full rounded-lg border border-navy/20 px-3 py-2 text-sm"
          >
            {PUBLICOS.map((p) => (
              <option key={p.valor} value={p.valor}>
                {p.rotulo}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-navy/70">Etapa da jornada (opcional)</span>
          <input
            value={form.etapa}
            onChange={(e) => setForm({ ...form, etapa: e.target.value })}
            className="w-full rounded-lg border border-navy/20 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="mb-1 block text-navy/70">Objetivo (opcional)</span>
          <input
            value={form.objetivo}
            onChange={(e) => setForm({ ...form, objetivo: e.target.value })}
            className="w-full rounded-lg border border-navy/20 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="mb-1 block text-navy/70">Assunto (e-mail, opcional)</span>
          <input
            value={form.assunto}
            onChange={(e) => setForm({ ...form, assunto: e.target.value })}
            className="w-full rounded-lg border border-navy/20 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="mb-1 block text-navy/70">Corpo * — personalize só campos seguros</span>
          <textarea
            rows={5}
            value={form.corpo}
            onChange={(e) => setForm({ ...form, corpo: e.target.value })}
            className="w-full rounded-lg border border-navy/20 px-3 py-2 text-sm"
          />
        </label>
      </div>

      {problemas.length > 0 ? (
        <ul data-template-problemas className="mt-3 space-y-1">
          {problemas.map((p) => (
            <li
              key={p}
              className="rounded-lg border border-terracotta/40 bg-terracotta/10 px-3 py-2 text-xs text-terracotta"
            >
              {p}
            </li>
          ))}
        </ul>
      ) : null}

      <p className="mt-3 text-[11px] text-navy/55">
        O modelo nasce em rascunho e não pode ser usado com cliente até passar pelos estados desta tela. Nada é
        enviado, agendado ou disparado aqui.
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={m.isPending || faltando.length > 0 || problemas.length > 0}
          onClick={() => m.mutate()}
          className="rounded-lg bg-navy px-3 py-1.5 text-xs text-cream disabled:opacity-50"
        >
          {form.id ? "Salvar correção" : "Criar modelo em rascunho"}
        </button>
        {aoCancelar ? (
          <button
            type="button"
            onClick={aoCancelar}
            className="rounded-lg border border-navy/20 px-3 py-1.5 text-xs text-navy"
          >
            Cancelar
          </button>
        ) : null}
        {faltando.length > 0 ? (
          <span className="self-center text-xs text-navy/60">Falta preencher: {faltando.join(", ")}.</span>
        ) : null}
      </div>
    </CaCard>
  );
}
