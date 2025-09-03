// frontend/app/dashboard/page.tsx
import { fetchGrants } from '@/lib/grants';
import { auth } from '@clerk/nextjs/server';

export default async function DashboardPage() {
  const { getToken } = auth();
  const token = await getToken();
  const data = await fetchGrants('', token ?? undefined);

  return (
    <main style={{ padding: 20 }}>
      <h1>Dashboard</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </main>
  );
}
