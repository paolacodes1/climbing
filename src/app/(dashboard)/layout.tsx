import { Navigation } from '@/components/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <main className="pb-20">
        {children}
      </main>
      <Navigation />
    </div>
  );
}