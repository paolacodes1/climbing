'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { db } from '@/lib/db';
import { useBoulderingStore } from '@/lib/store';
import { Gym } from '@/types/climb';
import { PlusIcon } from '@heroicons/react/24/outline';

export function GymSelector() {
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGym, setNewGym] = useState({ name: '', location: '' });
  const { selectedGym, setSelectedGym } = useBoulderingStore();

  useEffect(() => {
    loadGyms();
  }, []);

  const loadGyms = async () => {
    try {
      const allGyms = await db.gyms.toArray();
      setGyms(allGyms);
    } catch (error) {
      console.error('Error loading gyms:', error);
    }
  };

  const handleAddGym = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newGym.name || !newGym.location) return;

    try {
      const gymId = await db.gyms.add({
        ...newGym,
        createdAt: new Date(),
      });
      
      setNewGym({ name: '', location: '' });
      setShowAddForm(false);
      await loadGyms();
      
      if (typeof gymId === 'number') {
        setSelectedGym(gymId);
      }
    } catch (error) {
      console.error('Error adding gym:', error);
    }
  };

  const selectedGymInfo = gyms.find(g => g.id === selectedGym);

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            Select Gym
            <Button 
              onClick={() => setShowAddForm(!showAddForm)}
              size="sm"
              variant="outline"
            >
              <PlusIcon className="w-4 h-4 mr-1" />
              Add Gym
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select 
            value={selectedGym?.toString() || ''} 
            onValueChange={(value) => setSelectedGym(parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose a gym to start logging climbs" />
            </SelectTrigger>
            <SelectContent>
              {gyms.map(gym => (
                <SelectItem key={gym.id} value={gym.id!.toString()}>
                  <div>
                    <div className="font-medium">{gym.name}</div>
                    <div className="text-sm text-gray-500">{gym.location}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedGymInfo && (
            <div className="mt-3 p-3 bg-green-50 rounded-lg">
              <div className="text-sm font-medium text-green-800">
                Selected: {selectedGymInfo.name}
              </div>
              <div className="text-xs text-green-600">{selectedGymInfo.location}</div>
            </div>
          )}
        </CardContent>
      </Card>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Gym</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddGym} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Gym Name</label>
                <Input
                  value={newGym.name}
                  onChange={(e) => setNewGym(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Boulder Rock Club"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <Input
                  value={newGym.location}
                  onChange={(e) => setNewGym(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g., Denver, CO"
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  Add Gym
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAddForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}