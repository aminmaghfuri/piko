import { createDefaultSchoolSchedule, createDefaultTasks } from '../design/tokens';
import { AppSaveData, ChildProfile, DailyTask, SchoolSubjectItem } from '../types/game';

const STORAGE_KEY = 'pulau_pintar_v5';

export function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function createInitialChild(): ChildProfile {
  return {
    id: 'c1',
    name: 'Budi',
    grade: 1,
    avatar: '👦',
    character: 'boy',
    color: '#d93838',
    score: 0,
    currentIsland: 1,
    unlockedIsland: 1,
    completedIslands: [],
    ownedItems: [],
    hat: 'cap',
    cape: false,
    turbo: false,
    lastDate: getTodayKey(),
    tasks: createDefaultTasks(),
    schoolSchedule: createDefaultSchoolSchedule(),
  };
}

export function createInitialSaveData(): AppSaveData {
  const child = createInitialChild();
  return {
    pin: '1234',
    activeChildId: child.id,
    children: [child],
  };
}

interface LegacyTask {
  id?: string;
  t?: string;
  tm?: string;
  p?: DailyTask['period'];
  d?: boolean;
  title?: string;
  time?: string;
  period?: DailyTask['period'];
  done?: boolean;
}

interface LegacyChild {
  id?: string;
  nm?: string;
  name?: string;
  gr?: number;
  grade?: number;
  av?: string;
  avatar?: string;
  chr?: ChildProfile['character'];
  character?: ChildProfile['character'];
  cl?: string;
  color?: string;
  sc?: number;
  score?: number;
  ci?: number;
  currentIsland?: number;
  ui?: number;
  unlockedIsland?: number;
  doneI?: number[];
  completedIslands?: number[];
  own?: string[];
  ownedItems?: string[];
  hat?: ChildProfile['hat'];
  cape?: boolean;
  turbo?: boolean;
  ld?: string;
  lastDate?: string;
  ts?: LegacyTask[];
  tasks?: LegacyTask[];
  schoolSchedule?: SchoolSubjectItem[];
}

function normalizeTasks(rawTasks: LegacyTask[] | undefined, resetDone: boolean): DailyTask[] {
  if (!rawTasks || rawTasks.length === 0) {
    return createDefaultTasks();
  }
  return rawTasks.map((item, idx) => ({
    id: item.id || `t_${idx}`,
    title: item.title ?? item.t ?? 'Kegiatan',
    time: item.time ?? item.tm ?? '08:00',
    period: item.period ?? item.p ?? 'Pagi',
    done: resetDone ? false : Boolean(item.done ?? item.d),
  }));
}

export function loadSaveData(): AppSaveData {
  const fallback = createInitialSaveData();
  try {
    const raw =
      localStorage.getItem(STORAGE_KEY) ||
      localStorage.getItem('pulau_pintar_v4');
    if (!raw) return fallback;

    const parsed = JSON.parse(raw) as {
      pin?: string;
      aid?: string;
      activeChildId?: string;
      ch?: LegacyChild[];
      children?: LegacyChild[];
    };

    const rawChildren = parsed.children || parsed.ch;
    if (!rawChildren || !rawChildren.length) return fallback;

    const today = getTodayKey();
    const children: ChildProfile[] = rawChildren.map((c, idx) => {
      const lastDate = c.lastDate ?? c.ld ?? today;
      const isNewDay = lastDate !== today;
      return {
        id: c.id || `c_${idx + 1}`,
        name: c.name ?? c.nm ?? 'Anak',
        grade: Math.min(6, Math.max(1, Number(c.grade ?? c.gr) || 1)),
        avatar: c.avatar ?? c.av ?? '👦',
        character: c.character ?? c.chr ?? 'boy',
        color: c.color ?? c.cl ?? '#d93838',
        score: Number(c.score ?? c.sc) || 0,
        currentIsland: Math.min(6, Math.max(1, Number(c.currentIsland ?? c.ci) || 1)),
        unlockedIsland: Math.min(6, Math.max(1, Number(c.unlockedIsland ?? c.ui) || 1)),
        completedIslands: Array.isArray(c.completedIslands ?? c.doneI)
          ? [...(c.completedIslands ?? c.doneI ?? [])]
          : [],
        ownedItems: Array.isArray(c.ownedItems ?? c.own)
          ? [...(c.ownedItems ?? c.own ?? [])]
          : [],
        hat: c.hat || 'cap',
        cape: Boolean(c.cape),
        turbo: Boolean(c.turbo),
        lastDate: today,
        tasks: normalizeTasks(c.tasks ?? c.ts, isNewDay),
        schoolSchedule:
          Array.isArray(c.schoolSchedule) && c.schoolSchedule.length > 0
            ? c.schoolSchedule
            : createDefaultSchoolSchedule(),
      };
    });

    const preferredId = parsed.activeChildId ?? parsed.aid;
    const activeChildId = children.some((c) => c.id === preferredId)
      ? (preferredId as string)
      : children[0].id;

    const normalized: AppSaveData = {
      pin: parsed.pin || '1234',
      activeChildId,
      children,
    };
    persistSaveData(normalized);
    return normalized;
  } catch {
    return fallback;
  }
}

export function persistSaveData(data: AppSaveData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage quota errors
  }
}
