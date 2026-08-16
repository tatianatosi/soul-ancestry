import { createServerFn } from "@tanstack/react-start";

export const provisionarAdminDemo = createServerFn({ method: "POST" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const email = "admin.demo@exemplo.test";
  const password = "ClubeAncestral#2026";

  const { data: staff } = await supabaseAdmin
    .from("staff_access")
    .select("id, organization_id, email, role")
    .eq("email", email)
    .maybeSingle();

  if (!staff) return { ok: false, motivo: "staff_access nao encontrado" };

  const created = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  let userId = created.data.user?.id ?? null;
  if (!userId) {
    const list = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
    userId = list.data.users.find((u) => u.email === email)?.id ?? null;
    if (userId) await supabaseAdmin.auth.admin.updateUserById(userId, { password, email_confirm: true });
  }
  if (!userId) return { ok: false, motivo: created.error?.message ?? "sem user id" };

  const { error } = await supabaseAdmin
    .from("staff_access")
    .update({ auth_user_id: userId, status: "active", activated_at: new Date().toISOString() })
    .eq("id", staff.id);

  return { ok: !error, motivo: error?.message ?? null, email, organizacao: staff.organization_id };
});
