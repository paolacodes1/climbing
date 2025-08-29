export interface Climb {
  id?: number;
  routeName: string;
  grade: string;
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

export const ROUTE_TYPES = [
  { value: 'technical', label: '🧩 Technical', description: 'Requires precise footwork, body positioning, and problem-solving' },
  { value: 'power', label: '💪 Power', description: 'Explosive, dynamic moves requiring maximum strength' },
  { value: 'endurance', label: '⏱️ Endurance', description: 'Long routes that test your stamina and pump management' },
  { value: 'balance', label: '⚖️ Balance', description: 'Emphasizes core strength and body positioning' },
  { value: 'coordination', label: '🤸 Coordination', description: 'Complex sequences requiring timing and flow' },
  { value: 'dyno', label: '🚀 Dyno', description: 'Dynamic jumping moves requiring commitment and timing' },
];

export const WALL_ANGLES = [
  { value: 'slab', label: '📐 Slab', description: 'Less than vertical, requires balance and friction' },
  { value: 'vertical', label: '🧱 Vertical', description: 'Straight up wall, most common angle' },
  { value: 'overhang', label: '⛰️ Overhang', description: 'Past vertical, requires upper body strength' },
  { value: 'roof', label: '🏠 Roof', description: 'Nearly horizontal, maximum difficulty' },
];

export const HOLD_TYPES = [
  { value: 'jugs', label: '🍺 Jugs', description: 'Large, positive holds you can wrap your whole hand around' },
  { value: 'crimps', label: '🤏 Crimps', description: 'Small edges gripped with fingertips, knuckles bent' },
  { value: 'slopers', label: '🌊 Slopers', description: 'Round, smooth holds requiring open-hand grip and friction' },
  { value: 'pinches', label: '🤌 Pinches', description: 'Holds gripped between thumb and fingers like holding a book' },
  { value: 'pockets', label: '🕳️ Pockets', description: 'Holes in the wall for 1-3 fingers' },
];

export const GRADES = [
  'V0', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10', 'V10+', 'V11', 'V12', 'V13', 'V14', 'V15', 'V16', 'V17'
];