'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/theme-toggle';
import { db } from '@/lib/db';
import { useBoulderingStore } from '@/lib/store';
import { Climb, Gym } from '@/types/climb';
import { GRADES } from '@/types/climb';
import { 
  TrophyIcon, 
  CalendarIcon, 
  MapPinIcon,
  ChartBarIcon,
  FireIcon,
  StarIcon
} from '@heroicons/react/24/outline';

interface UserProfile {
  name: string;
  startDate: string;
  favoriteGym: number | null;
  goals: string[];
}

export function UserProfile() {
  const [climbs, setClimbs] = useState<Climb[]>([]);
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    startDate: new Date().toISOString().split('T')[0],
    favoriteGym: null,
    goals: []
  });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  const { } = useBoulderingStore();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [climbsData, gymsData] = await Promise.all([
        db.climbs.orderBy('date').toArray(),
        db.gyms.toArray()
      ]);
      setClimbs(climbsData);
      setGyms(gymsData);
      
      // Load profile from localStorage
      const savedProfile = localStorage.getItem('userProfile');
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = () => {
    localStorage.setItem('userProfile', JSON.stringify(profile));
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">Loading profile...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate achievements
  const completedClimbs = climbs.filter(c => c.status === 'completed' || c.status === 'flash');
  const flashedClimbs = climbs.filter(c => c.status === 'flash');
  
  const achievements = [];
  
  // Milestone achievements
  if (climbs.length >= 1) achievements.push({ icon: '🧗', title: 'First Climb', description: 'Logged your first climb!' });
  if (climbs.length >= 10) achievements.push({ icon: '🎯', title: 'Getting Started', description: '10 climbs logged' });
  if (climbs.length >= 50) achievements.push({ icon: '💪', title: 'Dedicated Climber', description: '50 climbs logged' });
  if (climbs.length >= 100) achievements.push({ icon: '🏆', title: 'Century Club', description: '100 climbs logged' });
  
  // Flash achievements
  if (flashedClimbs.length >= 1) achievements.push({ icon: '⚡', title: 'First Flash', description: 'Flashed your first problem' });
  if (flashedClimbs.length >= 5) achievements.push({ icon: '🔥', title: 'Flash Master', description: '5 problems flashed' });
  
  // Grade achievements
  const completedGrades = completedClimbs.map(c => c.grade);
  const gradeValues = GRADES.reduce((acc, grade, index) => {
    acc[grade] = index;
    return acc;
  }, {} as Record<string, number>);
  
  const highestGradeValue = completedGrades.length > 0 
    ? Math.max(...completedGrades.map(g => gradeValues[g] || 0))
    : -1;
    
  if (highestGradeValue >= 0) achievements.push({ icon: '🎖️', title: `${GRADES[highestGradeValue]} Climber`, description: `Completed your first ${GRADES[highestGradeValue]}` });
  if (highestGradeValue >= 3) achievements.push({ icon: '🌟', title: 'Intermediate', description: 'Completed V3 or higher' });
  if (highestGradeValue >= 5) achievements.push({ icon: '💎', title: 'Advanced', description: 'Completed V5 or higher' });
  if (highestGradeValue >= 8) achievements.push({ icon: '👑', title: 'Elite', description: 'Completed V8 or higher' });

  // Streak calculation (simplified)
  const currentStreak = climbs.length > 0 ? 1 : 0; // Simplified for demo
  
  const favoriteGym = gyms.find(g => g.id === profile.favoriteGym);
  const climbingDays = climbs.length > 0 
    ? Math.ceil((new Date().getTime() - new Date(climbs[0].date).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="p-4 space-y-4">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">
                {profile.name || 'Climber'} 
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                {climbingDays > 0 ? `Climbing for ${climbingDays} days` : 'New climber'}
              </p>
            </div>
            <Button 
              variant={isEditing ? "default" : "outline"} 
              size="sm"
              onClick={() => isEditing ? saveProfile() : setIsEditing(true)}
            >
              {isEditing ? 'Save' : 'Edit'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input
                  value={profile.name}
                  onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Your climbing name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Started Climbing</label>
                <Input
                  type="date"
                  value={profile.startDate}
                  onChange={(e) => setProfile(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <CalendarIcon className="w-4 h-4" />
                <span>Started: {new Date(profile.startDate).toLocaleDateString()}</span>
              </div>
              {favoriteGym && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPinIcon className="w-4 h-4" />
                  <span>Favorite gym: {favoriteGym.name}</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <ChartBarIcon className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold">{climbs.length}</div>
            <div className="text-sm text-muted-foreground">Total Climbs</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <FireIcon className="w-8 h-8 mx-auto mb-2 text-orange-600" />
            <div className="text-2xl font-bold">{currentStreak}</div>
            <div className="text-sm text-muted-foreground">Day Streak</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <TrophyIcon className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
            <div className="text-2xl font-bold">{completedClimbs.length}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <StarIcon className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold">{flashedClimbs.length}</div>
            <div className="text-sm text-muted-foreground">Flashes</div>
          </CardContent>
        </Card>
      </div>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle>Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          {achievements.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Start climbing to unlock achievements!
            </p>
          ) : (
            <div className="space-y-3">
              {achievements.map((achievement, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl">{achievement.icon}</div>
                  <div>
                    <div className="font-medium">{achievement.title}</div>
                    <div className="text-sm text-muted-foreground">{achievement.description}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* App Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium">Theme</div>
              <div className="text-sm text-muted-foreground">Toggle between light and dark mode</div>
            </div>
            <ThemeToggle />
          </div>
          
          <Separator />
          
          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium">Export Data</div>
              <div className="text-sm text-muted-foreground">Download your climbing data</div>
            </div>
            <Button variant="outline" size="sm" onClick={() => {
              const data = JSON.stringify({ climbs, gyms, profile }, null, 2);
              const blob = new Blob([data], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'climbing-data.json';
              a.click();
            }}>
              Export
            </Button>
          </div>
          
          <Separator />
          
          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium">Clear All Data</div>
              <div className="text-sm text-muted-foreground">Reset app to fresh state</div>
            </div>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={async () => {
                if (confirm('Are you sure? This will delete all your climbing data.')) {
                  await db.climbs.clear();
                  await db.gyms.clear();
                  localStorage.removeItem('userProfile');
                  window.location.reload();
                }
              }}
            >
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}