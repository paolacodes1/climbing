'use client';

import { useRouter, usePathname } from 'next/navigation';
import { 
  PencilIcon, 
  ChartBarIcon, 
  BuildingOffice2Icon, 
  UsersIcon, 
  UserIcon 
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

const tabs = [
  { id: 'log', label: 'Log Climbs', icon: PencilIcon, path: '/log' },
  { id: 'progress', label: 'Progress', icon: ChartBarIcon, path: '/progress' },
  { id: 'gyms', label: 'Gyms', icon: BuildingOffice2Icon, path: '/gyms' },
  { id: 'community', label: 'Community', icon: UsersIcon, path: '/community' },
  { id: 'profile', label: 'Profile', icon: UserIcon, path: '/profile' },
];

export function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  
  const activeTab = tabs.find(tab => pathname.startsWith(tab.path))?.id || 'log';

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border safe-area-pb z-50">
      <div className="flex justify-around items-center py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => router.push(tab.path)}
              className={cn(
                "flex flex-col items-center justify-center min-w-0 flex-1 px-1 py-2 text-xs font-medium transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}