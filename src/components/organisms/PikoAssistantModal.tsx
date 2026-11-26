import React, { useState } from 'react';
import {
  FOCUS_PRESETS,
  getTodaySchoolDay,
  SCHOOL_DAYS,
} from '../../design/tokens';
import {
  ChildProfile,
  DayPeriod,
  FocusTimerPreset,
  ScheduleFilter,
  SchoolDay,
  TimerState,
} from '../../types/game';
import { FilterChip } from '../atoms/FilterChip';
import { GameButton } from '../atoms/GameButton';
import { ProgressBar } from '../atoms/ProgressBar';
import { ModalShell } from '../molecules/ModalShell';
import { SchoolSubjectRow } from '../molecules/SchoolSubjectRow';
import { TaskItemRow } from '../molecules/TaskItemRow';

export interface PikoAssistantModalProps {
  open: boolean;
  profile: ChildProfile;
  crystalsCollected: number;
  timer: TimerState;
  onClose: () => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onAddTask: (title: string, time: string, period: DayPeriod) => void;
  onSelectTimerPreset: (preset: FocusTimerPreset) => void;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onSpeakText: (text: string) => void;
}

const FILTERS: { value: ScheduleFilter; label: string }[] = [
  { value: 'Semua', label: 'Semua' },
  { value: 'Pagi', label: '☀️ Pagi' },
  { value: 'Siang', label: '🌤️ Siang' },
  { value: 'Sore', label: '🌇 Sore' },
  { value: 'Malam', label: '🌙 Malam' },
];

function getGreeting(name: string): string {
  const hour = new Date().getHours();
  const prefix =
    hour < 11
      ? 'Selamat pagi'
      : hour < 15
        ? 'Selamat siang'
        : hour < 18
          ? 'Selamat sore'
          : 'Selamat malam';
  return `${prefix}, ${name}! Ayo cek kegiatanmu!`;
}

function formatMMSS(sec: number): string {
  return `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;
}

export const PikoAssistantModal: React.FC<PikoAssistantModalProps> = ({
  open,
  profile,
  crystalsCollected,
  timer,
  onClose,
  onToggleTask,
  onDeleteTask,
  onAddTask,
  onSelectTimerPreset,
  onToggleTimer,
  onResetTimer,
  onSpeakText,
}) => {
  const [tab, setTab] = useState<'schedule' | 'school' | 'timer' | 'stats'>('schedule');
  const [filter, setFilter] = useState<ScheduleFilter>('Semua');
  const todayInfo = getTodaySchoolDay();
  const [selectedDay, setSelectedDay] = useState<SchoolDay>(todayInfo.day);
  const [titleInput, setTitleInput] = useState('');
  const [timeInput, setTimeInput] = useState('16:00');
  const [periodInput, setPeriodInput] = useState<DayPeriod>('Sore');

  const doneCount = profile.tasks.filter((t) => t.done).length;
  const totalCount = profile.tasks.length;
  const pct = totalCount ? Math.round((doneCount / totalCount) * 100) : 0;
  const rankLabel = pct >= 100 ? '🏆 Hebat!' : pct >= 50 ? '🔥 Rajin!' : '🌟 Ayo!';

  const filteredTasks = profile.tasks
    .filter((t) => filter === 'Semua' || t.period === filter)
    .slice()
    .sort((a, b) => a.time.localeCompare(b.time));

  const dayClasses = (profile.schoolSchedule || [])
    .filter((item) => item.day === selectedDay)
    .slice()
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = titleInput.trim();
    if (!clean) return;
    onAddTask(clean, timeInput, periodInput);
    setTitleInput('');
  };

  const handleReadSchoolSchedule = () => {
    if (dayClasses.length === 0) {
      onSpeakText(`Hari ${selectedDay} tidak ada jadwal pelajaran sekolah.`);
      return;
    }
    const listText = dayClasses
      .map((c) => `${c.subject.replace(/[^\w\s&,()-]/gu, '').trim()} jam ${c.startTime}`)
      .join(', ');
    onSpeakText(`Jadwal pelajaran hari ${selectedDay} untuk ${profile.name}: ${listText}`);
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title={`🤖 Asisten Piko - ${profile.avatar} ${profile.name}`}
      subtitle={getGreeting(profile.name)}
      theme="white-blue"
      maxWidthClass="max-w-[660px]"
      zIndexClass="z-35"
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-3">
        {[
          { id: 'schedule' as const, label: '📋 Jadwal' },
          { id: 'school' as const, label: '📚 Pelajaran' },
          { id: 'timer' as const, label: '⏱️ Timer' },
          { id: 'stats' as const, label: '🏆 Prestasi' },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`py-2 px-2.5 rounded-xl border-2 font-display font-bold text-xs sm:text-sm cursor-pointer transition-colors whitespace-nowrap ${
              tab === item.id
                ? 'bg-sky-600 border-sky-600 text-white'
                : 'bg-slate-50 border-slate-300 text-slate-700'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'schedule' && (
        <div>
          <div className="bg-sky-50 border-2 border-sky-200 rounded-2xl p-3 mb-3">
            <div className="flex justify-between items-center text-xs sm:text-sm font-display font-bold text-sky-800 mb-1.5 tabular-nums">
              <span>
                Progres: {doneCount}/{totalCount} ({pct}%)
              </span>
              <span>{rankLabel}</span>
            </div>
            <ProgressBar percent={pct} />
          </div>

          <div className="flex gap-1.5 flex-wrap mb-2.5">
            {FILTERS.map((f) => (
              <FilterChip
                key={f.value}
                active={filter === f.value}
                onClick={() => setFilter(f.value)}
              >
                {f.label}
              </FilterChip>
            ))}
          </div>

          <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto mb-3 pr-0.5">
            {filteredTasks.map((task) => (
              <TaskItemRow
                key={task.id}
                task={task}
                onToggle={() => onToggleTask(task.id)}
                onDelete={() => onDeleteTask(task.id)}
              />
            ))}
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-2 sm:grid-cols-[1fr_92px_96px_auto] gap-2 bg-slate-100 p-2.5 rounded-2xl"
          >
            <input
              type="text"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              placeholder="Tambah kegiatan sendiri..."
              required
              maxLength={50}
              className="col-span-2 sm:col-span-1 px-2.5 py-2 rounded-xl border-2 border-slate-300 bg-white text-sm"
            />
            <input
              type="time"
              value={timeInput}
              onChange={(e) => setTimeInput(e.target.value)}
              required
              className="px-2 py-2 rounded-xl border-2 border-slate-300 bg-white text-sm"
            />
            <select
              value={periodInput}
              onChange={(e) => setPeriodInput(e.target.value as DayPeriod)}
              className="px-2 py-2 rounded-xl border-2 border-slate-300 bg-white text-sm"
            >
              <option value="Pagi">Pagi</option>
              <option value="Siang">Siang</option>
              <option value="Sore">Sore</option>
              <option value="Malam">Malam</option>
            </select>
            <GameButton type="submit" variant="green" size="sm" className="col-span-2 sm:col-span-1">
              + Tambah
            </GameButton>
          </form>
        </div>
      )}

      {tab === 'school' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap bg-sky-50 border-2 border-sky-200 rounded-2xl px-3.5 py-2.5">
            <div className="text-xs sm:text-sm font-semibold text-sky-900">
              {todayInfo.isSunday && selectedDay === 'Senin'
                ? '☀️ Hari Minggu libur sekolah! Ini persiapan jadwal Senin:'
                : `📚 Jadwal Pelajaran Hari ${selectedDay} (Kls ${profile.grade})`}
            </div>
            <GameButton variant="subtle" size="sm" onClick={handleReadSchoolSchedule}>
              🔊 Bacakan
            </GameButton>
          </div>

          <div className="flex gap-1.5 flex-wrap">
            {SCHOOL_DAYS.map((day) => (
              <FilterChip
                key={day}
                active={selectedDay === day}
                onClick={() => setSelectedDay(day)}
              >
                {day}
              </FilterChip>
            ))}
          </div>

          <div className="flex flex-col gap-2 max-h-[250px] overflow-y-auto pr-0.5">
            {dayClasses.length > 0 ? (
              dayClasses.map((item) => <SchoolSubjectRow key={item.id} item={item} />)
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-5 text-center text-sm text-slate-600">
                Belum ada pelajaran tercatat untuk hari {selectedDay}.
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'timer' && (
        <div className="text-center py-2">
          <div className="font-display font-bold text-sky-800 text-base">
            ⏱️ {timer.label}
          </div>
          <div className="font-display font-bold text-5xl text-slate-900 my-2 tabular-nums">
            {formatMMSS(timer.remainingSeconds)}
          </div>

          <div className="flex justify-center gap-2 flex-wrap my-3">
            {FOCUS_PRESETS.map((preset) => (
              <FilterChip
                key={preset.label}
                active={timer.label === preset.label}
                onClick={() => onSelectTimerPreset(preset)}
              >
                {preset.icon} {preset.label} {preset.minutes}m
              </FilterChip>
            ))}
          </div>

          <div className="flex justify-center gap-2.5 mt-4">
            <GameButton variant="sky" size="md" onClick={onToggleTimer}>
              {timer.running ? '⏸️ Jeda' : '▶ Mulai'}
            </GameButton>
            <GameButton variant="gray" size="md" onClick={onResetTimer}>
              🔄 Ulang
            </GameButton>
          </div>
        </div>
      )}

      {tab === 'stats' && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 text-sm leading-relaxed text-slate-800 space-y-1.5 tabular-nums">
          <div>
            👤 <b>{profile.avatar} {profile.name}</b> (Kelas {profile.grade} SD)
          </div>
          <div>
            🏝️ <b>Pulau Terbuka:</b> {profile.unlockedIsland} / 6
          </div>
          <div>
            ⭐ <b>Total Poin:</b> {profile.score}
          </div>
          <div>
            📋 <b>Tugas Hari Ini:</b> {doneCount}/{totalCount}
          </div>
          <div>
            📚 <b>Total Pelajaran Sekolah:</b> {(profile.schoolSchedule || []).length} sesi/minggu
          </div>
          <div>
            💎 <b>Kristal Pulau Ini:</b> {crystalsCollected}/12
          </div>
        </div>
      )}
    </ModalShell>
  );
};
