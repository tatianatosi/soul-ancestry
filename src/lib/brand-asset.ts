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
 *
 * 25/08/2026 — asset em `public/` (fora da rota Lovable `__l5e`).
 * 11/09/2026 — três variantes oficiais em `public/marca/`; principal =
 * `MARCA_LOGOS.principal` (alias estável = variante 1).
 */
import logoOficial from "@/assets/clube-ancestral-logo.svg.asset.json";
import { MARCA_LOGOS, SITE_OFICIAL } from "@/lib/marca";

export const BRAND_NAME = "Clube Ancestral";

/** Site institucional (SEO). Não confundir com o host do app Vercel. */
export const BRAND_SITE_URL = SITE_OFICIAL;

/** Caminho público do asset oficial, servido pelo próprio domínio do app. */
export const BRAND_LOGO_URL: string | null = MARCA_LOGOS.principal;

/** Variantes oficiais extras (guia / zip logotipo-clube). */
export const BRAND_LOGO_VARIANTES = MARCA_LOGOS;

/** Procedência: onde o asset era servido no ambiente do Lovable. */
export const BRAND_LOGO_URL_LOVABLE: string | null = logoOficial?.url ?? null;

/** Pendência registrada quando não existe asset oficial no projeto. */
export const BRAND_ASSET_PENDENTE = BRAND_LOGO_URL ? null : "ASSET_DE_MARCA_OFICIAL_PENDENTE";
