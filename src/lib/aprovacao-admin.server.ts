/** Authorization precedes domain overrides; database triggers enforce direct writes too. */
export async function exigirAdminAprovador(
  client: { rpc: (name: "contract_pode_aprovar", args: { _org: string }) => PromiseLike<{ data: unknown; error: { message: string } | null }> },
  organizationId: string,
) {
  const { data, error } = await client.rpc("contract_pode_aprovar", { _org: organizationId });
  if (error) throw new Error(error.message);
  if (data !== true) throw new Error("Somente admin da organização aprova preços e contratos.");
}