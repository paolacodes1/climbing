'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { db } from '@/lib/db';
import { Climb, Gym } from '@/types/climb';
import { ROUTE_TYPES, GRADES } from '@/types/climb';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

export function StatsDashboard() {
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
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">Loading your climbing stats...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (climbs.length === 0) {
    return (
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>Progress Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-muted-foreground">
              <p className="mb-2">No climbs logged yet!</p>
              <p>Start logging climbs to see your progress analytics.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate stats
  const totalClimbs = climbs.length;
  const completedClimbs = climbs.filter(c => c.status === 'completed' || c.status === 'flash');
  const flashedClimbs = climbs.filter(c => c.status === 'flash');
  const successRate = Math.round((completedClimbs.length / totalClimbs) * 100);
  const flashRate = Math.round((flashedClimbs.length / totalClimbs) * 100);

  // Get highest grade completed
  const completedGrades = completedClimbs.map(c => c.grade);
  const gradeValues = GRADES.reduce((acc, grade, index) => {
    acc[grade] = index;
    return acc;
  }, {} as Record<string, number>);
  
  const highestGrade = completedGrades.length > 0 
    ? completedGrades.reduce((highest, current) => 
        (gradeValues[current] || 0) > (gradeValues[highest] || 0) ? current : highest
      )
    : 'None';

  // Recent activity (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentClimbs = climbs.filter(c => new Date(c.date) >= sevenDaysAgo);

  // Grade distribution for completed climbs
  const gradeDistribution = completedClimbs.reduce((acc, climb) => {
    acc[climb.grade] = (acc[climb.grade] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const gradeChartData = Object.entries(gradeDistribution)
    .map(([grade, count]) => ({ grade, count }))
    .sort((a, b) => (gradeValues[a.grade] || 0) - (gradeValues[b.grade] || 0));

  // Route type analysis
  const routeTypeStats = completedClimbs.reduce((acc, climb) => {
    acc[climb.routeType] = (acc[climb.routeType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const routeTypeChartData = Object.entries(routeTypeStats).map(([type, count]) => {
    const typeInfo = ROUTE_TYPES.find(rt => rt.value === type);
    return {
      name: typeInfo?.label || type,
      value: count,
      percentage: Math.round((count / completedClimbs.length) * 100)
    };
  });

  // Colors for pie chart
  const COLORS = ['#2563eb', '#dc2626', '#16a34a', '#ca8a04', '#9333ea', '#c2410c'];

  // Monthly progress
  const monthlyData = climbs.reduce((acc, climb) => {
    const month = new Date(climb.date).toISOString().slice(0, 7); // YYYY-MM format
    if (!acc[month]) {
      acc[month] = { month, total: 0, completed: 0, flashed: 0 };
    }
    acc[month].total++;
    if (climb.status === 'completed' || climb.status === 'flash') {
      acc[month].completed++;
    }
    if (climb.status === 'flash') {
      acc[month].flashed++;
    }
    return acc;
  }, {} as Record<string, { month: string; total: number; completed: number; flashed: number }>);

  const monthlyChartData = Object.values(monthlyData).slice(-6); // Last 6 months

  return (
    <div className="p-4 space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Climbs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClimbs}</div>
            <Badge className="mt-1 bg-primary text-primary-foreground">{recentClimbs.length} this week</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate}%</div>
            <Progress value={successRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Highest Grade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{highestGrade}</div>
            <Badge variant="outline" className="mt-1">Completed</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Flash Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{flashRate}%</div>
            <Badge className="mt-1 bg-primary text-primary-foreground">{flashedClimbs.length} flashes</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Grade Distribution */}
      {gradeChartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Grade Distribution (Completed)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={gradeChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="grade" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Route Type Analysis */}
      {routeTypeChartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Route Type Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={routeTypeChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                  >
                    {routeTypeChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              
              <div className="space-y-4 pt-4 min-h-[120px]">
                {routeTypeChartData.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between py-2 px-2 min-h-[40px]">
                    <div className="flex items-center gap-5">
                      <div 
                        className="w-5 h-5 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-base font-medium min-w-0">{item.name}</span>
                    </div>
                    <Badge variant="outline" className="ml-4 flex-shrink-0 text-sm px-3 py-1">{item.value} climb{item.value !== 1 ? 's' : ''}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Monthly Progress */}
      {monthlyChartData.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Monthly Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="total" stroke="#2563eb" name="Total Climbs" />
                <Line type="monotone" dataKey="completed" stroke="#16a34a" name="Completed" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}