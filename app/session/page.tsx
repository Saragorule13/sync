import SessionLobby from "@/components/session-lobby";

export default async function SessionPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string | string[] }>;
}) {
  const params = await searchParams;
  const mode = Array.isArray(params.mode) ? params.mode[0] : params.mode;

  return <SessionLobby initialMode={mode === "join" ? "join" : "create"} />;
}
