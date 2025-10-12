'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { db } from '@/lib/db';
import { Climb, Gym } from '@/lib/db';
import { format } from 'date-fns';
import { PencilIcon, TrashIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

interface ClimbHistoryProps {
  selectedDate?: Date;
  onEdit: (climb: Climb) => void;
}

export function ClimbHistory({ selectedDate, onEdit }: ClimbHistoryProps) {
  const [climbs, setClimbs] = useState<Climb[]>([]);
  const [gyms, setGyms] = useState<Map<number, Gym>>(new Map());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [climbToDelete, setClimbToDelete] = useState<Climb | null>(null);
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string>('');

  useEffect(() => {
    loadClimbs();
    loadGyms();
  }, [selectedDate]);

  const loadGyms = async () => {
    const allGyms = await db.gyms.toArray();
    const gymMap = new Map<number, Gym>();
    allGyms.forEach(gym => {
      if (gym.id) gymMap.set(gym.id, gym);
    });
    setGyms(gymMap);
  };

  const loadClimbs = async () => {
    const query = db.climbs.orderBy('date').reverse();

    if (selectedDate) {
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const filtered = await query.toArray();
      const dayClimbs = filtered.filter(climb => {
        const climbDate = new Date(climb.date);
        return climbDate >= startOfDay && climbDate <= endOfDay;
      });
      setClimbs(dayClimbs);
    } else {
      const allClimbs = await query.limit(50).toArray();
      setClimbs(allClimbs);
    }
  };

  const handleDelete = async () => {
    if (climbToDelete?.id) {
      await db.climbs.delete(climbToDelete.id);
      setDeleteDialogOpen(false);
      setClimbToDelete(null);
      loadClimbs();
    }
  };

  const openDeleteDialog = (climb: Climb) => {
    setClimbToDelete(climb);
    setDeleteDialogOpen(true);
  };

  const openPhotoDialog = (photoUrl: string) => {
    setSelectedPhoto(photoUrl);
    setPhotoDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'flash':
        return 'bg-yellow-500';
      case 'completed':
        return 'bg-green-500';
      case 'attempted':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (climbs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            {selectedDate ? `Climbs for ${format(selectedDate, 'MMM d, yyyy')}` : 'Recent Climbs'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            No climbs logged {selectedDate ? 'for this day' : 'yet'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>
            {selectedDate ? `Climbs for ${format(selectedDate, 'MMM d, yyyy')}` : 'Recent Climbs'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {climbs.map(climb => {
            const gym = climb.gymId ? gyms.get(climb.gymId) : null;

            return (
              <div
                key={climb.id}
                className="border rounded-lg p-4 space-y-2 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{climb.routeName}</h3>
                      <Badge variant="outline">{climb.grade}</Badge>
                      <Badge className={getStatusColor(climb.status)}>
                        {climb.status}
                      </Badge>
                    </div>

                    <div className="text-sm text-muted-foreground mt-1 space-y-1">
                      {gym && <p>{gym.name}</p>}
                      <p>{format(new Date(climb.date), 'MMM d, yyyy • h:mm a')}</p>
                      {climb.attempts > 1 && <p>{climb.attempts} attempts</p>}
                      {climb.routeType && (
                        <p className="capitalize">{climb.routeType.replace('-', ' ')}</p>
                      )}
                      {climb.holdTypes && climb.holdTypes.length > 0 && (
                        <div className="flex gap-1 flex-wrap">
                          {climb.holdTypes.map(hold => (
                            <Badge key={hold} variant="secondary" className="text-xs">
                              {hold}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {climb.notes && (
                        <p className="text-sm mt-2 italic">{climb.notes}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 ml-2">
                    {climb.photoUrl && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openPhotoDialog(climb.photoUrl!)}
                      >
                        <PhotoIcon className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(climb)}
                    >
                      <PencilIcon className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => openDeleteDialog(climb)}
                    >
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Climb</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{climbToDelete?.routeName}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Photo View Dialog */}
      <Dialog open={photoDialogOpen} onOpenChange={setPhotoDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Route Photo</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <img
              src={selectedPhoto}
              alt="Route"
              className="w-full h-auto rounded-lg"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
