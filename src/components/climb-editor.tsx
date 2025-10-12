'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ROUTE_TYPES, WALL_ANGLES, HOLD_TYPES, GRADES } from '@/types/climb';
import { db, Climb } from '@/lib/db';
import { PhotoCapture } from '@/components/photo-capture';
import { PhotoAnnotate } from '@/components/photo-annotate';
import { PencilSquareIcon } from '@heroicons/react/24/outline';

interface ClimbEditorProps {
  climb: Climb | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function ClimbEditor({ climb, isOpen, onClose, onSave }: ClimbEditorProps) {
  const [formData, setFormData] = useState({
    routeName: '',
    grade: '',
    attempts: 1,
    status: 'attempted' as 'attempted' | 'completed' | 'flash',
    routeType: '',
    wallAngle: '',
    holdTypes: [] as string[],
    notes: '',
    photoUrl: '',
  });

  const [showAnnotate, setShowAnnotate] = useState(false);

  useEffect(() => {
    if (climb) {
      setFormData({
        routeName: climb.routeName || '',
        grade: climb.grade || '',
        attempts: climb.attempts || 1,
        status: climb.status || 'attempted',
        routeType: climb.routeType || '',
        wallAngle: climb.wallAngle || '',
        holdTypes: climb.holdTypes || [],
        notes: climb.notes || '',
        photoUrl: climb.photoUrl || '',
      });
    }
  }, [climb]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!climb?.id) return;

    try {
      await db.climbs.update(climb.id, {
        ...formData,
      });

      onSave();
      onClose();
    } catch (error) {
      console.error('Error updating climb:', error);
    }
  };

  const toggleHoldType = (holdType: string) => {
    setFormData(prev => ({
      ...prev,
      holdTypes: prev.holdTypes.includes(holdType)
        ? prev.holdTypes.filter(h => h !== holdType)
        : [...prev.holdTypes, holdType]
    }));
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Climb</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Route Name</label>
              <Input
                value={formData.routeName}
                onChange={(e) => setFormData(prev => ({ ...prev, routeName: e.target.value }))}
                placeholder="e.g., Red Crimp Problem"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Grade</label>
                <Select
                  value={formData.grade}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, grade: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADES.map(grade => (
                      <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Attempts</label>
                <Input
                  type="number"
                  min="1"
                  value={formData.attempts}
                  onChange={(e) => setFormData(prev => ({ ...prev, attempts: parseInt(e.target.value) }))}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <Select
                value={formData.status}
                onValueChange={(value: 'attempted' | 'completed' | 'flash') =>
                  setFormData(prev => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="attempted">Attempted</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="flash">Flash</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Route Type</label>
              <Select
                value={formData.routeType}
                onValueChange={(value) => setFormData(prev => ({ ...prev, routeType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select route type">
                    {formData.routeType && ROUTE_TYPES.find(t => t.value === formData.routeType)?.label}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {ROUTE_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div>{type.label}</div>
                        <div className="text-xs text-foreground">{type.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Wall Angle</label>
              <Select
                value={formData.wallAngle}
                onValueChange={(value) => setFormData(prev => ({ ...prev, wallAngle: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select wall angle">
                    {formData.wallAngle && WALL_ANGLES.find(w => w.value === formData.wallAngle)?.label}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {WALL_ANGLES.map(angle => (
                    <SelectItem key={angle.value} value={angle.value}>
                      <div>
                        <div>{angle.label}</div>
                        <div className="text-xs text-foreground">{angle.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Hold Types</label>
              <div className="flex flex-wrap gap-2">
                {HOLD_TYPES.map(hold => (
                  <Badge
                    key={hold.value}
                    variant={formData.holdTypes.includes(hold.value) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/20"
                    onClick={() => toggleHoldType(hold.value)}
                  >
                    {hold.label}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Notes (Beta)</label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Sequence notes, beta, or thoughts..."
                rows={3}
              />
            </div>

            <PhotoCapture
              onPhotoCapture={(photo) => setFormData(prev => ({ ...prev, photoUrl: photo }))}
              existingPhoto={formData.photoUrl}
            />

            {formData.photoUrl && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setShowAnnotate(true)}
              >
                <PencilSquareIcon className="w-5 h-5 mr-2" />
                Annotate Photo
              </Button>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {showAnnotate && formData.photoUrl && (
        <PhotoAnnotate
          photo={formData.photoUrl}
          isOpen={showAnnotate}
          onSave={(annotatedPhoto) => {
            setFormData(prev => ({ ...prev, photoUrl: annotatedPhoto }));
            setShowAnnotate(false);
          }}
          onCancel={() => setShowAnnotate(false)}
        />
      )}
    </>
  );
}
