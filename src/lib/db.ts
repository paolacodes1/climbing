import Dexie, { Table } from 'dexie';

export interface Climb {
  id?: number;
  routeName: string;
  grade: string; // 'V0', 'V1', etc.
  gymId: number;
  attempts: number;
  status: 'attempted' | 'completed' | 'flash';
  routeType: string;
  wallAngle: string;
  holdTypes: string[];
  date: Date;
  notes?: string;
  photoUrl?: string;
  createdAt: Date;
}

export interface Gym {
  id?: number;
  name: string;
  location: string;
  totalClimbs?: number;
  lastVisit?: Date;
  createdAt: Date;
}

export interface UserStats {
  id?: number;
  totalClimbs: number;
  currentGrade: string;
  longestStreak: number;
  achievements: string[];
  createdAt: Date;
  updatedAt: Date;
}

class BoulderingDB extends Dexie {
  climbs!: Table<Climb>;
  gyms!: Table<Gym>;
  userStats!: Table<UserStats>;

  constructor() {
    super('BoulderingDB');
    this.version(1).stores({
      climbs: '++id, routeName, grade, gymId, date, status',
      gyms: '++id, name, location',
      userStats: '++id, updatedAt'
    });
  }
}

export const db = new BoulderingDB();