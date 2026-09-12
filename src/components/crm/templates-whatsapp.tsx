import { useMemo, useState } from "react";

import { Rotulo, Secao, inputCls } from "@/components/caso/campos";
import {
  INCONSISTENCIA_DATA_ANA,
  REGRAS_USO_TEMPLATES,
  REGUA_CANONICA,
  ROTULO_CAMPO,
  TEMPLATES_WHATSAPP,
  camposPendentes,
  preencherTemplate,
  validarPersonalizacao,
  type GrupoTemplate,
} from "@/lib/templates-whatsapp";

/**
 * Biblioteca de templates de WhatsApp por etapa — apenas leitura e cópia manual.
 * Nenhuma mensagem é enviada, agendada ou disparada por esta tela.
 */
export function TemplatesWhatsapp() {
  const [grupo, setGrupo] = useState<GrupoTemplate>("funil");
  const [selecionado, setSelecionado] = useState<string>("confirmacao_formal_pedido");
  const [valores, setValores] = useState<Record<string, string>>({});
  const [copiado, setCopiado] = useState(false);

  const lista = useMemo(() => TEMPLATES_WHATSAPP.filter((t) => t.grupo === grupo), [grupo]);
  const template = useMemo(
    () => TEMPLATES_WHATSAPP.find((t) => t.id === selecionado) ?? lista[0]!,
    [selecionado, lista],
  );
  const texto = preencherTemplate(template, valores);
  const pendentes = camposPendentes(template, valores);
  const avisos = validarPersonalizacao(valores);

  function trocarGrupo(g: GrupoTemplate) {
    setGrupo(g);
    const primeiro = TEMPLATES_WHATSAPP.find((t) => t.grupo === g);
    if (primeiro) setSelecionado(primeiro.id);
    setValores({});
    setCopiado(false);
  }

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 2500);
    } catch {
      setCopiado(false);
    }
  }

  return (
    <Secao
      titulo="Templates de WhatsApp por etapa"
      descricao="Uso manual. O Desk não envia, não agenda e não dispara mensagem: o texto é montado para revisão humana, cópia e envio pelo canal próprio."
    >
      <div className="mb-4 rounded-lg border border-terracotta/40 bg-terracotta/5 px-3 py-2 text-xs text-terracotta">
        <strong>{INCONSISTENCIA_DATA_ANA.titulo}.</strong> {INCONSISTENCIA_DATA_ANA.descricao}
        <ul className="mt-2 list-disc space-y-0.5 pl-4">
          {INCONSISTENCIA_DATA_ANA.acoes.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </div>

      <div className="mb-4 rounded-lg border border-navy/10 bg-cream/40 px-3 py-2 text-xs text-navy/70">
        <strong>Régua canônica:</strong> {REGUA_CANONICA.join(" → ")}. Nenhuma etapa posterior pode ser antecipada.
      </div>

      <div className="mb-4 flex gap-2">
        {(["funil", "onboarding"] as GrupoTemplate[]).map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => trocarGrupo(g)}
            className={`rounded-lg border px-3 py-1.5 text-xs ${
              grupo === g ? "border-navy bg-navy text-cream" : "border-navy/15 bg-cream/40 text-navy/70"
            }`}
          >
            {g === "funil" ? "Funil comercial" : "Onboarding e jornada"}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-[260px_1fr]">
        <ul className="space-y-1">
          {lista.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => {
                  setSelecionado(t.id);
                  setValores({});
                  setCopiado(false);
                }}
                className={`w-full rounded-lg border px-3 py-2 text-left text-xs ${
                  t.id === template.id ? "border-gold bg-gold/10 text-navy" : "border-navy/10 bg-cream/40 text-navy/70"
                }`}
              >
                <span className="block font-medium">{t.etapa}</span>
                <span className="block text-[11px] text-navy/50">{t.quandoUsar}</span>
              </button>
            </li>
          ))}
        </ul>

        <div className="space-y-3">
          <div className="rounded-lg border border-navy/10 bg-cream/40 px-3 py-2 text-xs text-navy/70">
            <Rotulo>Gates exigidos antes de usar</Rotulo>
            <ul className="list-disc space-y-0.5 pl-4">
              {template.gatesExigidos.map((g) => (
                <li key={g}>{g}</li>
              ))}
            </ul>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {template.campos.map((campo) => (
              <label key={campo} className="block">
                <Rotulo>{ROTULO_CAMPO[campo]}</Rotulo>
                <input
                  className={inputCls}
                  value={valores[campo] ?? ""}
                  onChange={(e) => setValores((v) => ({ ...v, [campo]: e.target.value }))}
                />
              </label>
            ))}
          </div>

          {avisos.length ? (
            <ul className="space-y-1 text-xs text-terracotta">
              {avisos.map((a) => (
                <li key={a.campo}>
                  <strong>{ROTULO_CAMPO[a.campo as keyof typeof ROTULO_CAMPO] ?? a.campo}</strong>: {a.mensagem}
                </li>
              ))}
            </ul>
          ) : null}

          <div>
            <Rotulo>Mensagem para revisão</Rotulo>
            <pre className="whitespace-pre-wrap rounded-lg border border-navy/15 bg-cream/40 px-3 py-3 text-sm text-navy">
              {texto}
            </pre>
          </div>

          {pendentes.length ? (
            <p className="text-xs text-navy/55">
              Campos ainda não preenchidos: {pendentes.map((c) => ROTULO_CAMPO[c]).join(", ")}.
            </p>
          ) : null}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => void copiar()}
              className="rounded-lg bg-navy px-3 py-2 text-sm text-cream"
            >
              Copiar texto
            </button>
            <span className="text-xs text-navy/55">
              {copiado ? "Copiado. Envie pelo canal e registre a interação." : "Copiar não envia nada ao cliente."}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-navy/10 bg-cream/40 px-3 py-2 text-xs text-navy/70">
        <Rotulo>Regras de uso</Rotulo>
        <ul className="list-disc space-y-0.5 pl-4">
          {REGRAS_USO_TEMPLATES.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </div>
    </Secao>
  );
}
