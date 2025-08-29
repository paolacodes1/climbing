import { ClimbLogger } from '@/components/climb-logger';
import { GymSelector } from '@/components/gym-selector';

export default function LogPage() {
  return (
    <div className="space-y-4">
      <GymSelector />
      <ClimbLogger />
    </div>
  );
}