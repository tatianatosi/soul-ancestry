# Plano executável — 01/11/2026

Formato da skill `execute-plan`: cada tarefa tem `Goal`, `File`, `Code` (conteúdo
completo do arquivo), `Verify` (um comando) e `Checkpoint`. O código das tarefas foi
aplicado e verificado antes de entrar aqui (tsc, vitest e `vite build`; no build, o
commit foi encontrado dentro do bundle do servidor).

**Dono:** C = Claude Code. Nenhuma tarefa grava no banco, aplica migration, faz merge
ou publica.

## Fora deste plano, de propósito

O formato da skill exige código exato por tarefa. Estes itens ainda não podem ter
código exato, por motivo medido; cada um segue por outro caminho:

| Item | Por que não cabe aqui | Caminho |
|---|---|---|
| Corte C (custo e prazo dos 76 itens) | Nenhuma fonte tem custo por item da Áustria (o Drive tem só base por país e o caso do Danilo/Croácia; o banco tem o teto da Áustria) | Decisão da Proprietária: valores da Áustria por categoria, só o teto, ou estimativa marcada |
| Corte H (aprovar parâmetros, prévia final, revisão, assinatura) | Atos da Proprietária na sessão autenticada; o sistema grava quem aprovou | Roteiro de cliques, depois de medir com a tarefa 5 |
| N1 Painel Hoje; N2 e N3 Governança, saneamento e navegação do portal | Exigem ler o código do trabalho parcial nos worktrees antes de existir código exato | Frente com agente em worktree e prova de teste, como no #209 |
| N5, N6, N7 | Decisões da Proprietária | Registradas no plano de tarefas, seção 4d |

## Tarefas

#### Task 1: Teste que renderiza o painel de estado contratual

**Goal:** Provar uso real da tela religada (contagens reais e erro visível, nunca zeros) com renderização no DOM, não só texto de código.

**File:** src/lib/__tests__/painel-estado-contratual-render-2026-11-01.test.tsx

**Code:**
```tsx
// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const leitura = vi.hoisted(() => ({ atual: (): Promise<unknown> => Promise.resolve(null) }));

vi.mock("@/lib/contratos.functions", () => ({ painelContratual: () => leitura.atual() }));
vi.mock("@tanstack/react-start", () => ({ useServerFn: (fn: unknown) => fn }));
vi.mock("@tanstack/react-router", () => ({
  Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a>,
}));

import { PainelEstadoContratual } from "@/components/contratos/painel-estado-contratual";

function montar() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <PainelEstadoContratual />
    </QueryClientProvider>,
  );
}

const VAZIO = {
  contratos: [],
  bloqueios: [],
  pendencias: [],
  revisaoPendente: [],
  anexosAusentes: [],
  ordensImpedidas: [],
  excecoesExpiradas: [],
};

afterEach(cleanup);

describe("PainelEstadoContratual renderizado (01/11/2026)", () => {
  it("mostra a contagem real de cada indicador", async () => {
    leitura.atual = () =>
      Promise.resolve(
        Object.assign({}, VAZIO, {
          contratos: [{ id: "c1" }, { id: "c2" }],
          bloqueios: [{ id: "b1", contract_id: "c1", label: "CPF ausente" }],
        }),
      );
    montar();
    await waitFor(() => expect(screen.getByText("instrumentos vivos")).toBeTruthy());
    expect(screen.getByText("CPF ausente")).toBeTruthy();
    expect(screen.getByText("validações bloqueantes").previousSibling?.textContent).toBe("1");
    expect(screen.getByText("instrumentos vivos").previousSibling?.textContent).toBe("2");
  });

  it("falha de leitura aparece como erro, nunca como zeros", async () => {
    leitura.atual = () => Promise.reject(new Error("permission denied for table contracts"));
    montar();
    await new Promise((resolve) => setTimeout(resolve, 100));
    const alerta = screen.getByRole("alert");
    expect(alerta.textContent).toContain("Não foi possível carregar o estado contratual");
    expect(screen.queryByText("instrumentos vivos")).toBeNull();
    expect(screen.queryByText("validações bloqueantes")).toBeNull();
  });

  it("deixa claro que nenhuma ação externa sai deste painel", async () => {
    leitura.atual = () => Promise.resolve(Object.assign({}, VAZIO, { contratos: [{ id: "c1" }] }));
    montar();
    await waitFor(() => expect(screen.getByText(/Nenhuma ação\s+externa é executada/)).toBeTruthy());
  });
});
```

**Verify:** npx vitest run src/lib/__tests__/painel-estado-contratual-render-2026-11-01.test.tsx

**Checkpoint:** 3 testes passando; o painel renderiza contagens e mostra erro em vez de zeros.

#### Task 2: Build grava o commit no bundle (vite.config.ts)

**Goal:** Fechar N9: o build injeta __BUILD_SHA__ a partir de variável de CI ou do git, para /api/saude provar a versão publicada.

**File:** vite.config.ts

**Code:**
```ts
// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { campos }, etc }) if needed.
import path from "node:path";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { execSync } from "node:child_process";
import { loadEnv } from "vite";

// Carrega variáveis sem prefixo VITE_ apenas para o runtime de servidor
// (rotas /lovable/*). Nunca são expostas ao bundle do cliente.
const serverEnv = loadEnv(process.env["NODE_ENV"] ?? "development", process.cwd(), "");
Object.assign(process.env, serverEnv);

function shaDoBuild(): string | null {
  const deAmbiente = process.env["GITHUB_SHA"] ?? process.env["COMMIT_SHA"] ?? process.env["VERCEL_GIT_COMMIT_SHA"];
  if (deAmbiente) return deAmbiente;
  try {
    return execSync("git rev-parse HEAD", { stdio: ["ignore", "pipe", "ignore"] }).toString().trim() || null;
  } catch {
    return null;
  }
}

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    define: { __BUILD_SHA__: JSON.stringify(shaDoBuild()) },
    resolve: {
      alias: {
        "entities/lib/decode.js": path.resolve(process.cwd(), "node_modules/entities/lib/decode.js"),
        "entities/lib/encode.js": path.resolve(process.cwd(), "node_modules/entities/lib/encode.js"),
        entities: path.resolve(process.cwd(), "node_modules/entities"),
      },
    },
  },
});
```

**Verify:** npx tsc --noEmit

**Checkpoint:** vite.config.ts tipa sem erro; defineConfig segue sendo o do Lovable.

#### Task 3: Rota /api/saude usa o SHA do build

**Goal:** Fazer a rota responder o SHA do build quando nenhuma variável de ambiente existir, mantendo null honesto sem fonte.

**File:** src/routes/api/saude.ts

**Code:**
```ts
import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

/**
 * Rota de saúde pública (#176, item 8 do laudo de prontidão, 27/10/2026):
 * "main pode divergir da produção sem alarme — nenhuma rota de saúde
 * expondo o SHA publicado". Esta rota expõe o commit publicado quando o
 * ambiente de deploy injeta alguma das variáveis comuns de CI/CD.
 *
 * Limite conhecido, documentado em vez de fingido: não há confirmação de
 * que o deploy do Lovable injeta qualquer uma destas variáveis hoje — se
 * nenhuma existir, `sha` responde `null` e `shaConhecida: false`
 * honestamente, em vez de inventar um valor. Se o ambiente de deploy
 * expuser outra variável, basta somar seu nome à lista abaixo.
 */
const VARIAVEIS_SHA = [
  "VERCEL_GIT_COMMIT_SHA",
  "GITHUB_SHA",
  "COMMIT_SHA",
  "SOURCE_VERSION",
  "RENDER_GIT_COMMIT",
] as const;

declare const __BUILD_SHA__: string | null | undefined;

const shaDoBuild = typeof __BUILD_SHA__ !== "undefined" ? __BUILD_SHA__ : null;

export const Route = createFileRoute("/api/saude")({
  server: {
    handlers: {
      GET: async () => {
        const sha = VARIAVEIS_SHA.map((v) => process.env[v]).find((v) => Boolean(v)) ?? shaDoBuild ?? null;
        return new Response(
          JSON.stringify({
            ok: true,
            sha,
            shaConhecida: sha !== null,
            agora: new Date().toISOString(),
          }),
          {
            status: 200,
            headers: {
              "content-type": "application/json; charset=utf-8",
              "cache-control": "no-store",
            },
          },
        );
      },
    },
  },
});
```

**Verify:** npx tsc --noEmit

**Checkpoint:** rota tipa sem erro e mantém o contrato ok/sha/shaConhecida/agora.

#### Task 4: Teste do SHA do build

**Goal:** Travar por teste que o SHA vem do build e nunca de entrada do usuário.

**File:** src/lib/__tests__/rota-saude-sha-build-2026-11-01.test.ts

**Code:**
```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * N9 do plano (01/11/2026): `/api/saude` respondia `sha: null` porque o deploy
 * do Lovable não injeta variável de CI. O build agora grava o commit no bundle
 * (`__BUILD_SHA__`, via `define` do Vite). Limite honesto: se o ambiente de
 * build não tiver `.git` nem variável de CI, o valor continua `null`.
 */
describe("SHA do build em /api/saude (01/11/2026)", () => {
  const vite = readFileSync("vite.config.ts", "utf8");
  const saude = readFileSync("src/routes/api/saude.ts", "utf8");

  it("o build injeta __BUILD_SHA__ a partir do ambiente ou do git", () => {
    expect(vite).toContain("__BUILD_SHA__");
    expect(vite).toContain("git rev-parse HEAD");
    expect(vite).toContain("GITHUB_SHA");
  });

  it("a rota usa o SHA do build só depois das variáveis de ambiente, sem inventar valor", () => {
    expect(saude).toContain('typeof __BUILD_SHA__ !== "undefined"');
    expect(saude).toContain("?? shaDoBuild ?? null");
    expect(saude).toContain("shaConhecida: sha !== null");
  });

  it("o SHA nunca é lido de entrada do usuário", () => {
    expect(saude).not.toContain("request.url");
    expect(saude).not.toContain("searchParams");
  });
});
```

**Verify:** npx vitest run src/lib/__tests__/rota-saude-sha-build-2026-11-01.test.ts src/lib/__tests__/rota-saude-sha-publicado-2026-10-27.test.ts

**Checkpoint:** os dois testes da rota de saúde passam.

#### Task 5: Consulta de medição dos cortes C e H

**Goal:** Dar à Proprietária e ao Claude um antes/depois medido: sem esses números, nenhum corte pode ser dado como feito.

**File:** docs/planos/medir-cortes-c-h.sql

**Code:**
```sql
-- Medição de leitura dos cortes C e H (01/11/2026). SOMENTE SELECT.
-- Uso: rodar no banco antes e depois de cada execução e colar os dois resultados
-- no relatório. "Feito" só vale com este antes/depois.
select 'corte_c.itens_do_plano' as medida, count(*)::text as valor
  from research_action_plan_items where archived_at is null
union all
select 'corte_c.itens_com_custo', count(*)::text
  from research_action_plan_items where archived_at is null and estimated_cost_amount is not null
union all
select 'corte_c.itens_com_prazo', count(*)::text
  from research_action_plan_items where archived_at is null and due_date is not null
union all
select 'corte_c.despesa_' || coalesce(expense_approval_status, 'sem_status'), count(*)::text
  from research_action_plan_items where archived_at is null group by expense_approval_status
union all
select 'corte_h.parametros_' || coalesce(status, 'sem_status') || '_aprovado_' || (aprovado_por is not null)::text, count(*)::text
  from contract_case_parameters where archived_at is null group by status, aprovado_por is not null
union all
select 'corte_h.previa_' || coalesce(tipo, 'sem_tipo') || '_' || coalesce(estado, 'sem_estado'), count(*)::text
  from contract_parameter_previews where archived_at is null group by tipo, estado
order by 1;
```

**Verify:** test -s docs/planos/medir-cortes-c-h.sql

**Checkpoint:** arquivo SQL criado; a trava da tarefa 6 o valida.

#### Task 6: Trava: a medição só lê

**Goal:** Garantir por teste que a consulta de medição nunca grava e cobre custo, prazo, aprovação e prévia final.

**File:** src/lib/__tests__/medicao-cortes-so-leitura-2026-11-01.test.ts

**Code:**
```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("medição dos cortes C e H é só leitura (01/11/2026)", () => {
  const sql = readFileSync("docs/planos/medir-cortes-c-h.sql", "utf8");
  const semComentarios = sql
    .split("\n")
    .filter((linha) => !linha.trim().startsWith("--"))
    .join("\n")
    .toLowerCase();

  it("não contém nenhum comando que grave", () => {
    for (const proibido of ["insert ", "update ", "delete ", "drop ", "alter ", "truncate ", "create ", "grant "]) {
      expect(semComentarios, proibido).not.toContain(proibido);
    }
  });

  it("mede os números que o plano cobra: custo, prazo, aprovação de parâmetros e prévia final", () => {
    expect(semComentarios).toContain("estimated_cost_amount");
    expect(semComentarios).toContain("due_date");
    expect(semComentarios).toContain("aprovado_por");
    expect(semComentarios).toContain("contract_parameter_previews");
  });
});
```

**Verify:** npx vitest run src/lib/__tests__/medicao-cortes-so-leitura-2026-11-01.test.ts

**Checkpoint:** 2 testes passando.
