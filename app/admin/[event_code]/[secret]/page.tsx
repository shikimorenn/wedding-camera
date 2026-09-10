interface AdminTestPageProps {
  params: Promise<{
    event_code: string;
    secret: string;
  }>;
}

export default async function AdminTestPage({
  params,
}: AdminTestPageProps) {
  const { event_code, secret } = await params;

  return (
    <main style={{ padding: 40, fontFamily: "Arial" }}>
      <h1>ADMIN DYNAMIC ROUTE BERHASIL</h1>

      <p>Event Code: {event_code}</p>
      <p>Secret: {secret}</p>
    </main>
  );
}
