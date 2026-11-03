import {
  experienciaIntegralDoCaso,
  type ExperienciaIntegralDoCaso,
} from "@/lib/portal-experiencia-integral";

/**
 * Estado do App Cliente quando a leitura do caso não chegou (01/11/2026).
 *
 * A versão anterior preenchia régua de etapas, contrato e titulares com dados fixos "para nunca
 * mostrar vazio". Isso inventava conteúdo de cliente. Agora o fallback é o vazio honesto: todo bloco
 * aparece como "Não registrado". Falha de rede continua tratada por `portal-resiliencia.ts`
 * (a falha nunca vira ausência de dados); este módulo só diz o que mostrar quando não há dado.
 */
export function fallbackHonestoDoCaso(): ExperienciaIntegralDoCaso {
  return experienciaIntegralDoCaso(null);
}
