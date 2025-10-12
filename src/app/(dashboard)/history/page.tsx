'use client';

import { useState } from 'react';
import { CalendarView } from '@/components/calendar-view';
import { ClimbHistory } from '@/components/climb-history';
import { ClimbEditor } from '@/components/climb-editor';
import { Climb } from '@/lib/db';

export default function HistoryPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editingClimb, setEditingClimb] = useState<Climb | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleEdit = (climb: Climb) => {
    setEditingClimb(climb);
  };

  const handleSave = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="p-4 space-y-4">
      <CalendarView onDateSelect={handleDateSelect} />
      <ClimbHistory
        key={refreshKey}
        selectedDate={selectedDate || undefined}
        onEdit={handleEdit}
      />
      <ClimbEditor
        climb={editingClimb}
        isOpen={!!editingClimb}
        onClose={() => setEditingClimb(null)}
        onSave={handleSave}
      />
    </div>
  );
}
