'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { ROUTE_TYPES, WALL_ANGLES, HOLD_TYPES, GRADES } from '@/types/climb';
import { db } from '@/lib/db';
import { useBoulderingStore } from '@/lib/store';
import { Climb } from '@/types/climb';

export function ClimbLogger() {
  const [formData, setFormData] = useState({
    routeName: '',
    grade: '',
    attempts: 1,
    status: '' as '' | 'attempted' | 'completed' | 'flash',
    routeType: '',
    wallAngle: '',
    holdTypes: [] as string[],
    notes: '',
  });

  const { selectedGym, addClimbToSession } = useBoulderingStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedGym) {
      alert('Please select a gym first');
      return;
    }

    const climb: Climb = {
      ...formData,
      status: formData.status || 'attempted',
      gymId: selectedGym,
      date: new Date(),
      createdAt: new Date(),
    };

    try {
      await db.climbs.add(climb);
      addClimbToSession(climb);
      
      // Reset form
      setFormData({
        routeName: '',
        grade: '',
        attempts: 1,
        status: '',
        routeType: '',
        wallAngle: '',
        holdTypes: [],
        notes: '',
      });
    } catch (error) {
      console.error('Error saving climb:', error);
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
    <div className="p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            Log New Climb
          </CardTitle>
        </CardHeader>
        <CardContent>
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
                value={formData.status || undefined} 
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
              <div className="flex items-center gap-2 mb-2">
                <label className="block text-sm font-medium">Hold Types</label>
                <Dialog>
                  <DialogTrigger asChild>
                    <InformationCircleIcon className="w-4 h-4 text-[#0D5C63] cursor-pointer hover:text-[#0D5C63]/80" />
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Hold Types Guide</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      {HOLD_TYPES.map(hold => (
                        <div key={hold.value} className="space-y-1">
                          <h4 className="font-medium">{hold.label}</h4>
                          <p className="text-sm text-muted-foreground">{hold.description}</p>
                        </div>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
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

            <Button type="submit" className="w-full">
              Log Climb
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}