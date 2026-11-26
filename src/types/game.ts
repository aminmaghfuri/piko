export type CharacterPresetId = 'boy' | 'girl' | 'hijab' | 'peci';
export type HatId = 'cap' | 'crown' | 'prop';
export type DayPeriod = 'Pagi' | 'Siang' | 'Sore' | 'Malam';
export type ScheduleFilter = 'Semua' | DayPeriod;
export type SchoolDay = 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu';
export type IslandWeather = 'sun' | 'petal' | 'snow' | 'ember' | 'star';
export type IslandTreeType = 'pine' | 'sakura' | 'cactus' | 'snow' | 'crys' | 'rain';
export type IslandMonumentType = 'plaza' | 'arch' | 'pyramid' | 'igloo' | 'spire' | 'trophy';

export interface CharacterPreset {
  id: CharacterPresetId;
  avatar: string;
  label: string;
}

export interface IslandTheme {
  id: number;
  icon: string;
  name: string;
  description: string;
  skyTop: number;
  skyMid: number;
  skyHorizon: number;
  fog: number;
  water: number;
  sand: number;
  deepSand: number;
  grassLow: number;
  grassHigh: number;
  path: number;
  treeType: IslandTreeType;
  treeColors: [number, number, number];
  monument: IslandMonumentType;
  hasPier: boolean;
  hasPalms: boolean;
  flowerColors: [number, number, number, number];
  weather: IslandWeather;
}

export interface ShopItem {
  id: 'crown' | 'prop' | 'cape' | 'turbo';
  icon: string;
  name: string;
  description: string;
  cost: number;
  type: 'hat' | 'cape' | 'turbo';
}

export interface DailyTask {
  id: string;
  title: string;
  time: string;
  period: DayPeriod;
  done: boolean;
}

export interface SchoolSubjectItem {
  id: string;
  day: SchoolDay;
  subject: string;
  startTime: string;
  endTime: string;
  note?: string;
}

export interface ChildProfile {
  id: string;
  name: string;
  grade: number;
  avatar: string;
  character: CharacterPresetId;
  color: string;
  score: number;
  currentIsland: number;
  unlockedIsland: number;
  completedIslands: number[];
  ownedItems: string[];
  hat: HatId;
  cape: boolean;
  turbo: boolean;
  lastDate: string;
  tasks: DailyTask[];
  schoolSchedule: SchoolSubjectItem[];
}

export interface AppSaveData {
  pin: string;
  activeChildId: string;
  children: ChildProfile[];
}

export interface QuizQuestion {
  tier?: '1-2' | '3-4' | '5-6' | 'all';
  subject: string;
  question: string;
  options: string[];
  answerIndex: number;
}

export interface CrystalChallenge {
  index: number;
  questions: QuizQuestion[];
  currentIndex: number;
  collected: boolean;
  cooldown: boolean;
  hidden?: boolean;
}

export interface FocusTimerPreset {
  minutes: number;
  label: string;
  reward: number;
  icon: string;
}

export interface TimerState {
  totalSeconds: number;
  remainingSeconds: number;
  label: string;
  reward: number;
  running: boolean;
  endTimestamp: number;
}

export interface CompassReadout {
  angleDeg: number;
  distanceMeters: number | null;
}

export interface ObstacleCircle {
  x: number;
  z: number;
  r: number;
}
