'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { db } from '@/lib/db';
import { Climb, Gym } from '@/types/climb';
import { GRADES } from '@/types/climb';
import { 
  TrophyIcon, 
  FireIcon, 
  UsersIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';

export function Community() {
  const [climbs, setClimbs] = useState<Climb[]>([]);
  const [, setGyms] = useState<Gym[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [climbsData, gymsData] = await Promise.all([
        db.climbs.orderBy('date').reverse().toArray(),
        db.gyms.toArray()
      ]);
      setClimbs(climbsData);
      setGyms(gymsData);
    } catch (error) {
      console.error('Error loading community data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">Loading community...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Simulate community data (in real app, this would come from a backend)
  const mockCommunityData = [
    {
      id: 1,
      name: 'Alex Chen',
      avatar: '🧗‍♂️',
      totalClimbs: 156,
      highestGrade: 'V7',
      recentActivity: 'Flashed a V5 at Boulder Rock Club',
      timeAgo: '2 hours ago'
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      avatar: '🧗‍♀️',
      totalClimbs: 203,
      highestGrade: 'V6',
      recentActivity: 'Completed first V6 at Vertical World',
      timeAgo: '5 hours ago'
    },
    {
      id: 3,
      name: 'Mike Rodriguez',
      avatar: '🧗',
      totalClimbs: 89,
      highestGrade: 'V4',
      recentActivity: 'Logged 8 climbs at Movement Gym',
      timeAgo: '1 day ago'
    },
    {
      id: 4,
      name: 'Emma Wilson',
      avatar: '🧗‍♀️',
      totalClimbs: 267,
      highestGrade: 'V8',
      recentActivity: 'New personal best: V8 flash!',
      timeAgo: '2 days ago'
    }
  ];

  // Generate leaderboards based on user's actual data + mock data
  const userStats = {
    name: 'You',
    avatar: '👤',
    totalClimbs: climbs.length,
    highestGrade: getHighestGrade(),
    completedClimbs: climbs.filter(c => c.status === 'completed' || c.status === 'flash').length,
    flashedClimbs: climbs.filter(c => c.status === 'flash').length
  };

  function getHighestGrade() {
    const completedClimbs = climbs.filter(c => c.status === 'completed' || c.status === 'flash');
    if (completedClimbs.length === 0) return 'V0';
    
    const gradeValues = GRADES.reduce((acc, grade, index) => {
      acc[grade] = index;
      return acc;
    }, {} as Record<string, number>);
    
    const completedGrades = completedClimbs.map(c => c.grade);
    return completedGrades.reduce((highest, current) => 
      (gradeValues[current] || 0) > (gradeValues[highest] || 0) ? current : highest
    );
  }

  // Combine user data with mock data for leaderboards
  const allClimbers = [userStats, ...mockCommunityData].sort((a, b) => b.totalClimbs - a.totalClimbs);
  
  const thisWeekChallenge = {
    name: 'Flash February',
    description: 'Flash 5 problems this week',
    progress: userStats.flashedClimbs,
    target: 5,
    participants: 127,
    timeLeft: '4 days left'
  };

  return (
    <div className="p-4 space-y-4">
      {/* Community Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UsersIcon className="w-5 h-5" />
            Community
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-muted-foreground mb-2">
              Connect with fellow climbers in your area
            </p>
            <Badge variant="secondary">Coming Soon: Full Social Features</Badge>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="leaderboard" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="leaderboard">Leaderboards</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="leaderboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrophyIcon className="w-5 h-5 text-yellow-600" />
                Total Climbs Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {allClimbers.map((climber, index) => (
                  <div 
                    key={climber.name}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      climber.name === 'You' ? 'bg-blue-50 border border-blue-200' : 'bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-muted-foreground">
                          #{index + 1}
                        </span>
                        <div className="text-2xl">{climber.avatar}</div>
                      </div>
                      <div>
                        <div className="font-medium">
                          {climber.name}
                          {climber.name === 'You' && (
                            <Badge variant="secondary" className="ml-2">You</Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Highest: {climber.highestGrade}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{climber.totalClimbs}</div>
                      <div className="text-sm text-muted-foreground">climbs</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="challenges" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FireIcon className="w-5 h-5 text-orange-600" />
                Weekly Challenge
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold">{thisWeekChallenge.name}</h3>
                      <p className="text-sm text-muted-foreground">{thisWeekChallenge.description}</p>
                    </div>
                    <Badge variant="outline">{thisWeekChallenge.timeLeft}</Badge>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{thisWeekChallenge.progress}/{thisWeekChallenge.target}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-orange-600 h-2 rounded-full transition-all"
                        style={{ 
                          width: `${Math.min((thisWeekChallenge.progress / thisWeekChallenge.target) * 100, 100)}%` 
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {thisWeekChallenge.participants} climbers participating
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Challenges</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <h4 className="font-medium">March Madness</h4>
                  <p className="text-sm text-muted-foreground">Complete 31 problems in March</p>
                  <Badge variant="outline" className="mt-1">Starts in 3 days</Badge>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <h4 className="font-medium">Grade Crusher</h4>
                  <p className="text-sm text-muted-foreground">Send your hardest grade yet</p>
                  <Badge variant="outline" className="mt-1">Monthly</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDaysIcon className="w-5 h-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockCommunityData.map((climber) => (
                  <div key={climber.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl">{climber.avatar}</div>
                    <div className="flex-1">
                      <div className="font-medium">{climber.name}</div>
                      <div className="text-sm text-muted-foreground">{climber.recentActivity}</div>
                      <div className="text-xs text-muted-foreground mt-1">{climber.timeAgo}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}