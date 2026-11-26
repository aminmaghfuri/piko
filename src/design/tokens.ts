import {
  CharacterPreset,
  DailyTask,
  FocusTimerPreset,
  IslandTheme,
  SchoolDay,
  SchoolSubjectItem,
  ShopItem,
} from '../types/game';

export const DESIGN_TOKENS = {
  radius: {
    card: 'rounded-3xl',
    inner: 'rounded-2xl',
    control: 'rounded-xl',
    chip: 'rounded-lg',
  },
  elevation: {
    hud: 'shadow-[0_3px_0_rgba(0,0,0,0.22)]',
    card: 'shadow-[0_10px_0_#d97706,0_22px_45px_rgba(0,0,0,0.38)]',
    button: 'active:translate-y-[2px] transition-transform duration-150',
  },
  zIndex: {
    canvas: 0,
    hud: 10,
    controls: 15,
    quiz: 25,
    modal: 30,
    shop: 35,
    parent: 40,
    pin: 45,
  },
} as const;

export const CHARACTER_PRESETS: CharacterPreset[] = [
  { id: 'boy', avatar: '👦', label: 'Cowok' },
  { id: 'girl', avatar: '👧', label: 'Cewek' },
  { id: 'hijab', avatar: '🧕', label: 'Berhijab' },
  { id: 'peci', avatar: '🧒', label: 'Cowok Peci' },
];

export const OUTFIT_COLORS: string[] = [
  '#d93838',
  '#ec4899',
  '#0284c7',
  '#10b981',
  '#8b5cf6',
  '#f59e0b',
];

export const ISLAND_THEMES: IslandTheme[] = [
  {
    id: 1,
    icon: '🏝️',
    name: 'Pulau Tropis Ceria',
    description: 'Hutan pinus, pantai pasir emas & dermaga.',
    skyTop: 0x1c6bd0,
    skyMid: 0x70c2f5,
    skyHorizon: 0xdbeeff,
    fog: 0x9bd7f5,
    water: 0x0685b8,
    sand: 0xf2d99b,
    deepSand: 0xc2a36b,
    grassLow: 0x4a9e3b,
    grassHigh: 0x367d2d,
    path: 0xb09468,
    treeType: 'pine',
    treeColors: [0x1f6b29, 0x2a7d34, 0x389440],
    monument: 'plaza',
    hasPier: true,
    hasPalms: true,
    flowerColors: [0xf43f5e, 0xfacc15, 0xc084fc, 0xfb923c],
    weather: 'sun',
  },
  {
    id: 2,
    icon: '🌸',
    name: 'Lembah Sakura',
    description: 'Padang bunga musim semi & kelopak sakura.',
    skyTop: 0x3b82f6,
    skyMid: 0x93c5fd,
    skyHorizon: 0xfde2e4,
    fog: 0xf5d0fe,
    water: 0x0ea5e9,
    sand: 0xfce7f3,
    deepSand: 0xd8b4fe,
    grassLow: 0x65a30d,
    grassHigh: 0x4d7c0f,
    path: 0xd6d3d1,
    treeType: 'sakura',
    treeColors: [0xf472b6, 0xf9a8d4, 0xfbcfe8],
    monument: 'arch',
    hasPier: false,
    hasPalms: false,
    flowerColors: [0xf472b6, 0xfb7185, 0xfef08a, 0xffffff],
    weather: 'petal',
  },
  {
    id: 3,
    icon: '🏜️',
    name: 'Gurun Piramida',
    description: 'Bukit pasir emas, kaktus & piramida kuno.',
    skyTop: 0x1d4ed8,
    skyMid: 0xfb923c,
    skyHorizon: 0xfef08a,
    fog: 0xfde68a,
    water: 0x0891b2,
    sand: 0xfde047,
    deepSand: 0xd97706,
    grassLow: 0xeab308,
    grassHigh: 0xca8a04,
    path: 0xb45309,
    treeType: 'cactus',
    treeColors: [0x15803d, 0x16a34a, 0x22c55e],
    monument: 'pyramid',
    hasPier: false,
    hasPalms: true,
    flowerColors: [0xfacc15, 0xf97316, 0xef4444, 0xfef08a],
    weather: 'sun',
  },
  {
    id: 4,
    icon: '❄️',
    name: 'Pulau Salju Kutub',
    description: 'Hujan salju sejuk, cemara putih & igloo.',
    skyTop: 0x1e3a8a,
    skyMid: 0x7dd3fc,
    skyHorizon: 0xf0f9ff,
    fog: 0xe0f2fe,
    water: 0x0369a1,
    sand: 0xbae6fd,
    deepSand: 0x7dd3fc,
    grassLow: 0xf1f5f9,
    grassHigh: 0xffffff,
    path: 0x94a3b8,
    treeType: 'snow',
    treeColors: [0x0f766e, 0xe2e8f0, 0xffffff],
    monument: 'igloo',
    hasPier: false,
    hasPalms: false,
    flowerColors: [0x38bdf8, 0xe0f2fe, 0x818cf8, 0xffffff],
    weather: 'snow',
  },
  {
    id: 5,
    icon: '🌋',
    name: 'Lembah Kristal Senja',
    description: 'Batu vulkanik & menara kristal ungu.',
    skyTop: 0x311042,
    skyMid: 0x7e22ce,
    skyHorizon: 0xf97316,
    fog: 0x9333ea,
    water: 0xc2410c,
    sand: 0x78716c,
    deepSand: 0x44403c,
    grassLow: 0x57534e,
    grassHigh: 0x6b21a8,
    path: 0xa8a29e,
    treeType: 'crys',
    treeColors: [0xa855f7, 0xc084fc, 0xf43f5e],
    monument: 'spire',
    hasPier: false,
    hasPalms: false,
    flowerColors: [0xf43f5e, 0xe879f9, 0xfbbf24, 0x38bdf8],
    weather: 'ember',
  },
  {
    id: 6,
    icon: '🌈',
    name: 'Pulau Bintang Juara',
    description: 'Langit aurora berbintang & piala emas!',
    skyTop: 0x090d2b,
    skyMid: 0x1e3a8a,
    skyHorizon: 0x2dd4bf,
    fog: 0x1e40af,
    water: 0x1d4ed8,
    sand: 0xa7f3d0,
    deepSand: 0x34d399,
    grassLow: 0x10b981,
    grassHigh: 0x059669,
    path: 0xfde047,
    treeType: 'rain',
    treeColors: [0x34d399, 0x38bdf8, 0xfacc15],
    monument: 'trophy',
    hasPier: true,
    hasPalms: true,
    flowerColors: [0xfacc15, 0x38bdf8, 0xf472b6, 0x34d399],
    weather: 'star',
  },
];

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'crown',
    icon: '👑',
    name: 'Mahkota Emas',
    description: 'Mahkota raja/ratu pintar 3D!',
    cost: 150,
    type: 'hat',
  },
  {
    id: 'prop',
    icon: '🧢',
    name: 'Topi Baling-Baling',
    description: 'Baling-baling berputar di kepala!',
    cost: 250,
    type: 'hat',
  },
  {
    id: 'cape',
    icon: '🦸',
    name: 'Jubah Pahlawan',
    description: 'Jubah keren di punggung!',
    cost: 300,
    type: 'cape',
  },
  {
    id: 'turbo',
    icon: '⚡',
    name: 'Sepatu Turbo',
    description: 'Lari jauh lebih cepat di pulau!',
    cost: 200,
    type: 'turbo',
  },
];

export const FOCUS_PRESETS: FocusTimerPreset[] = [
  { minutes: 15, label: 'Belajar Fokus', reward: 30, icon: '📚' },
  { minutes: 10, label: 'Baca Buku', reward: 25, icon: '📖' },
  { minutes: 20, label: 'Main Sehat', reward: 0, icon: '🎮' },
  { minutes: 5, label: 'Istirahat Mata', reward: 10, icon: '👀' },
];

export interface CrystalSpotDef {
  x: number;
  z: number;
  hidden: boolean;
}

export const CRYSTAL_SPOTS: CrystalSpotDef[] = [
  { x: 0, z: -32, hidden: false },
  { x: 28, z: -26, hidden: false },
  { x: 36, z: 2, hidden: true },
  { x: 26, z: 32, hidden: false },
  { x: -4, z: 36, hidden: true },
  { x: -30, z: 28, hidden: false },
  { x: -36, z: -4, hidden: true },
  { x: -28, z: -30, hidden: false },
  { x: 16, z: -16, hidden: true },
  { x: -16, z: 18, hidden: false },
  { x: 18, z: 18, hidden: true },
  { x: -18, z: -18, hidden: false },
];

export const CRYSTAL_COLORS: number[] = [
  0x3b82f6,
  0xec4899,
  0xa855f7,
  0x06b6d4,
  0xf59e0b,
  0x10b981,
  0xf43f5e,
  0x6366f1,
];

export function createDefaultTasks(): DailyTask[] {
  return [
    { id: 't1', title: '🛏️ Bangun & rapikan kasur', time: '05:30', period: 'Pagi', done: false },
    { id: 't2', title: '🪥 Mandi pagi & gosok gigi', time: '06:00', period: 'Pagi', done: false },
    { id: 't3', title: '🥣 Sarapan sehat', time: '06:30', period: 'Pagi', done: false },
    { id: 't4', title: '🏫 Belajar / sekolah semangat', time: '07:00', period: 'Pagi', done: false },
    { id: 't5', title: '🍱 Makan siang & cuci tangan', time: '12:30', period: 'Siang', done: false },
    { id: 't6', title: '😴 Istirahat siang', time: '13:30', period: 'Siang', done: false },
    { id: 't7', title: '📚 Kerjakan PR & belajar', time: '16:00', period: 'Sore', done: false },
    { id: 't8', title: '🚿 Mandi sore & olahraga', time: '17:00', period: 'Sore', done: false },
    { id: 't9', title: '🎒 Siapkan tas besok', time: '19:30', period: 'Malam', done: false },
    { id: 't10', title: '🌙 Gosok gigi & tidur tepat waktu', time: '20:30', period: 'Malam', done: false },
  ];
}

export const SCHOOL_DAYS: SchoolDay[] = [
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
];

export function getTodaySchoolDay(): { day: SchoolDay; isSunday: boolean } {
  const jsDay = new Date().getDay(); // 0 = Sunday, 1 = Monday ... 6 = Saturday
  if (jsDay === 0) {
    return { day: 'Senin', isSunday: true };
  }
  return { day: SCHOOL_DAYS[jsDay - 1], isSunday: false };
}

export function createDefaultSchoolSchedule(): SchoolSubjectItem[] {
  return [
    { id: 's1', day: 'Senin', subject: '🇮🇩 Upacara & PPKn', startTime: '07:00', endTime: '08:30', note: 'Seragam Merah Putih' },
    { id: 's2', day: 'Senin', subject: '🔢 Matematika', startTime: '08:45', endTime: '10:15', note: 'Buku berpetak' },
    { id: 's3', day: 'Selasa', subject: '📖 Bahasa Indonesia', startTime: '07:30', endTime: '09:00', note: 'Buku paket & tulis' },
    { id: 's4', day: 'Selasa', subject: '🌿 Ilmu Pengetahuan Alam', startTime: '09:15', endTime: '10:45' },
    { id: 's5', day: 'Rabu', subject: '🏃 PJOK (Olahraga)', startTime: '07:30', endTime: '09:00', note: 'Pakai seragam olahraga' },
    { id: 's6', day: 'Rabu', subject: '🎨 Seni Budaya', startTime: '09:15', endTime: '10:45', note: 'Bawa pensil warna' },
    { id: 's7', day: 'Kamis', subject: '🔢 Matematika', startTime: '07:30', endTime: '09:00' },
    { id: 's8', day: 'Kamis', subject: '🌍 Bahasa Inggris', startTime: '09:15', endTime: '10:45', note: 'Seragam Batik' },
    { id: 's9', day: 'Jumat', subject: '🕌 Pendidikan Agama', startTime: '07:30', endTime: '09:00', note: 'Seragam Muslim/Pramuka' },
    { id: 's10', day: 'Jumat', subject: '📖 Literasi & Membaca', startTime: '09:15', endTime: '10:15', note: 'Bawa buku cerita' },
    { id: 's11', day: 'Sabtu', subject: '⛺ Pramuka & Ekstrakurikuler', startTime: '07:30', endTime: '09:30', note: 'Seragam Pramuka' },
  ];
}
