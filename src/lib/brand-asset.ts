/**
 * Referência ÚNICA e canônica do asset oficial de marca do Clube Ancestral.
 *
 * Regras (não remover):
 * - Nenhuma tela deve importar arquivo de logo diretamente; usar apenas <BrandLogo />.
 * - Proibida cópia local duplicada do arquivo: trocar o asset aqui atualiza todas as telas.
 * - O logo é asset público de marca; nunca deve ser guardado junto de documentos de cliente
 *   nem de storage privado de casos.
 * - Nenhum nome de cliente ou identificador de caso pode aparecer em URL de asset, metadados,
 *   logs ou eventos de autenticação.
 */
import logoOficial from "@/assets/clube-ancestral-logo.svg.asset.json";

export const BRAND_NAME = "Clube Ancestral";

/** URL do asset oficial (vetorial). `null` => marca oficial ausente. */
export const BRAND_LOGO_URL: string | null = logoOficial?.url ?? null;

/** Pendência registrada quando não existe asset oficial no projeto. */
export const BRAND_ASSET_PENDENTE = BRAND_LOGO_URL ? null : "ASSET_DE_MARCA_OFICIAL_PENDENTE";
