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
 * 25/08/2026 — o asset oficial passou a ser servido de `public/`.
 * `clube-ancestral-logo.svg.asset.json` aponta para `/__l5e/assets-v1/…`, rota
 * que só existe dentro do Lovable: fora dele o `<img>` dava 404 e o cabeçalho
 * renderizava imagem quebrada. O mesmo arquivo (127.559 bytes, idêntico ao que
 * era servido como favicon) agora mora em `public/clube-ancestral-logo.svg` e
 * serve de ícone de aba e de logo — um arquivo só, sem cópia duplicada.
 * O JSON do Lovable fica registrado como procedência histórica.
 */
import logoOficial from "@/assets/clube-ancestral-logo.svg.asset.json";

export const BRAND_NAME = "Clube Ancestral";

/** Caminho público do asset oficial, servido pelo próprio domínio. */
export const BRAND_LOGO_URL: string | null = "/clube-ancestral-logo.svg";

/** Procedência: onde o asset era servido no ambiente do Lovable. */
export const BRAND_LOGO_URL_LOVABLE: string | null = logoOficial?.url ?? null;

/** Pendência registrada quando não existe asset oficial no projeto. */
export const BRAND_ASSET_PENDENTE = BRAND_LOGO_URL ? null : "ASSET_DE_MARCA_OFICIAL_PENDENTE";
