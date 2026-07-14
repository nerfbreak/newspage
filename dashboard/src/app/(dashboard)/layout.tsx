import { getCurrentUserProfile } from '@/server/auth';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentUserProfile();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar role={profile.role} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar profile={profile} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
