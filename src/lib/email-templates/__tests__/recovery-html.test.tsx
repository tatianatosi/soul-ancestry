import * as React from "react";
import { render } from "@react-email/render";
import { describe, expect, it } from "vitest";

import { RecoveryEmail } from "@/lib/email-templates/recovery";

const TOKEN = "a7f3c9d1e5b84206f7c1a9d3e2b5847c1d0f6a92b3c48e7d51a6f0c2d9b34e81";
const URL_RECUPERACAO = `https://exemplo.supabase.co/auth/v1/verify?token=${TOKEN}&type=recovery&redirect_to=${encodeURIComponent(
  "https://soul-ancestry.lovable.app/equipe/redefinir-senha",
)}`;

async function html() {
  return render(React.createElement(RecoveryEmail, { siteName: "Clube Ancestral", confirmationUrl: URL_RECUPERACAO }));
}

function hrefs(markup: string) {
  return [...markup.matchAll(/href="([^"]+)"/g)].map((m) => m[1].replace(/&amp;/g, "&"));
}

describe("e-mail de recuperação — HTML entregue", () => {
  it("traz href absoluto e completo com o token intacto no botão e no endereço de contingência", async () => {
    const links = hrefs(await html());
    expect(links).toHaveLength(2);
    expect(new Set(links).size).toBe(1);
    for (const href of links) {
      expect(href.startsWith("https://")).toBe(true);
      const u = new URL(href);
      expect(u.searchParams.get("token")).toBe(TOKEN);
      expect(u.searchParams.get("type")).toBe("recovery");
      expect(u.searchParams.get("redirect_to")).toBe("https://soul-ancestry.lovable.app/equipe/redefinir-senha");
    }
  });

  it("mostra o endereço completo em texto, com quebra segura em telas estreitas", async () => {
    const markup = await html();
    expect(markup).toContain(TOKEN);
    expect(markup).toContain("word-break:break-all");
  });

  it("declara viewport de dispositivo para o iOS Mail não reduzir a página", async () => {
    const markup = await html();
    expect(markup).toMatch(/name="viewport"[^>]*width=device-width/);
    expect(markup).toMatch(/name="color-scheme"/);
  });

  it("usa CTA inline-block com área de toque e contraste da marca, sem CSS externo", async () => {
    const markup = await html();
    expect(markup).toMatch(/background-color:#2F4B6E/i);
    expect(markup).toMatch(/color:#FFFFFF/i);
    expect(markup).toMatch(/padding:14px 24px/);
    expect(markup).toMatch(/display:inline-block/);
    expect(markup).not.toMatch(/<style/i);
    expect(markup).not.toMatch(/<link[^>]+stylesheet/i);
  });

  it("mantém o aviso de uso único e validade de 20 minutos", async () => {
    const markup = await html();
    expect(markup).toContain("uso único");
    expect(markup).toContain("20 minutos");
  });
});
