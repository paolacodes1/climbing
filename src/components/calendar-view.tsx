'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { db } from '@/lib/db';
import { Climb } from '@/types/climb';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';

interface CalendarViewProps {
  onDateSelect: (date: Date) => void;
}

export function CalendarView({ onDateSelect }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [climbsByDate, setClimbsByDate] = useState<Map<string, Climb[]>>(new Map());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    loadClimbs();
  }, [currentMonth]);

  const loadClimbs = async () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);

    const climbs = await db.climbs
      .where('date')
      .between(start, end, true, true)
      .toArray();

    const grouped = new Map<string, Climb[]>();
    climbs.forEach(climb => {
      const dateKey = format(new Date(climb.date), 'yyyy-MM-dd');
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)!.push(climb);
    });

    setClimbsByDate(grouped);
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get the day of week for the first day (0 = Sunday, 6 = Saturday)
  const firstDayOfWeek = monthStart.getDay();

  // Create padding days for the start of the month
  const paddingDays = Array(firstDayOfWeek).fill(null);

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onDateSelect(date);
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const getDateStats = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const climbs = climbsByDate.get(dateKey) || [];
    const completed = climbs.filter(c => c.status === 'completed' || c.status === 'flash').length;
    const total = climbs.length;
    return { completed, total };
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{format(currentMonth, 'MMMM yyyy')}</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={previousMonth}>
              <ChevronLeftIcon className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={nextMonth}>
              <ChevronRightIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1">
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}

          {/* Padding days */}
          {paddingDays.map((_, index) => (
            <div key={`padding-${index}`} className="aspect-square" />
          ))}

          {/* Calendar days */}
          {daysInMonth.map(date => {
            const stats = getDateStats(date);
            const hasClimbs = stats.total > 0;
            const isSelected = selectedDate && isSameDay(date, selectedDate);
            const isCurrentDay = isToday(date);

            return (
              <button
                key={date.toISOString()}
                onClick={() => handleDateClick(date)}
                className={`
                  aspect-square p-1 rounded-lg border text-sm
                  flex flex-col items-center justify-center
                  transition-colors
                  ${isSelected ? 'bg-primary text-primary-foreground border-primary' : ''}
                  ${!isSelected && hasClimbs ? 'bg-primary/10 border-primary/20 hover:bg-primary/20' : ''}
                  ${!isSelected && !hasClimbs ? 'hover:bg-muted border-transparent' : ''}
                  ${isCurrentDay && !isSelected ? 'border-primary border-2' : ''}
                `}
              >
                <span className={`${isCurrentDay && !isSelected ? 'font-bold' : ''}`}>
                  {format(date, 'd')}
                </span>
                {hasClimbs && (
                  <span className="text-[10px] text-muted-foreground">
                    {stats.completed}/{stats.total}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {selectedDate && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium">
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </p>
            {(() => {
              const stats = getDateStats(selectedDate);
              if (stats.total === 0) {
                return <p className="text-sm text-muted-foreground mt-1">No climbs logged</p>;
              }
              return (
                <p className="text-sm text-muted-foreground mt-1">
                  {stats.total} climb{stats.total !== 1 ? 's' : ''} logged
                  {stats.completed > 0 && ` • ${stats.completed} completed`}
                </p>
              );
            })()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
