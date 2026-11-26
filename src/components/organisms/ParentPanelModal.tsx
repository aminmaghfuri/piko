import React, { useEffect, useState } from 'react';
import {
  CHARACTER_PRESETS,
  OUTFIT_COLORS,
  SCHOOL_DAYS,
} from '../../design/tokens';
import {
  CharacterPresetId,
  ChildProfile,
  DayPeriod,
  SchoolDay,
} from '../../types/game';
import { ColorSwatch } from '../atoms/ColorSwatch';
import { FilterChip } from '../atoms/FilterChip';
import { GameButton } from '../atoms/GameButton';
import { ModalShell } from '../molecules/ModalShell';
import { SchoolSubjectRow } from '../molecules/SchoolSubjectRow';
import { TaskItemRow } from '../molecules/TaskItemRow';

export interface ParentPanelModalProps {
  open: boolean;
  initialTab?: 'children' | 'schedule' | 'school' | 'settings';
  childrenProfiles: ChildProfile[];
  activeChildId: string;
  onEnterChildMode: () => void;
  onSwitchAndPlayChild: (childId: string) => void;
  onAddChild: (name: string, grade: number, character: CharacterPresetId, color: string) => void;
  onDeleteChild: (childId: string) => void;
  onResetChildTasks: (childId: string) => void;
  onAddChildTask: (childId: string, title: string, time: string, period: DayPeriod) => void;
  onDeleteChildTask: (childId: string, taskId: string) => void;
  onAddSchoolSubject: (
    childId: string,
    day: SchoolDay,
    subject: string,
    startTime: string,
    endTime: string,
    note?: string,
  ) => void;
  onDeleteSchoolSubject: (childId: string, subjectId: string) => void;
  onUpdatePin: (newPin: string) => boolean;
  onRequestFeature?: () => void;
}

export const ParentPanelModal: React.FC<ParentPanelModalProps> = ({
  open,
  initialTab = 'children',
  childrenProfiles,
  activeChildId,
  onEnterChildMode,
  onSwitchAndPlayChild,
  onAddChild,
  onDeleteChild,
  onResetChildTasks,
  onAddChildTask,
  onDeleteChildTask,
  onAddSchoolSubject,
  onDeleteSchoolSubject,
  onUpdatePin,
  onRequestFeature,
}) => {
  const [tab, setTab] = useState<'children' | 'schedule' | 'school' | 'settings'>(initialTab);
  const [selectedChildId, setSelectedChildId] = useState(activeChildId);

  // New child form
  const [childName, setChildName] = useState('');
  const [childGrade, setChildGrade] = useState(1);
  const [childChar, setChildChar] = useState<CharacterPresetId>('boy');
  const [childColor, setChildColor] = useState('#d93838');
  const [childFormError, setChildFormError] = useState('');

  // Daily schedule form
  const [taskTitle, setTaskTitle] = useState('');
  const [taskTime, setTaskTime] = useState('16:00');
  const [taskPeriod, setTaskPeriod] = useState<DayPeriod>('Sore');

  // School schedule form
  const [schoolDay, setSchoolDay] = useState<SchoolDay>('Senin');
  const [subjectName, setSubjectName] = useState('');
  const [startTime, setStartTime] = useState('07:30');
  const [endTime, setEndTime] = useState('09:00');
  const [subjectNote, setSubjectNote] = useState('');

  // PIN form
  const [newPin, setNewPin] = useState('');
  const [pinMsg, setPinMsg] = useState<{ text: string; ok: boolean } | null>(null);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab, open]);

  useEffect(() => {
    if (!childrenProfiles.some((c) => c.id === selectedChildId)) {
      setSelectedChildId(activeChildId);
    }
  }, [childrenProfiles, selectedChildId, activeChildId]);

  const targetChild =
    childrenProfiles.find((c) => c.id === selectedChildId) || childrenProfiles[0];

  const daySubjects = (targetChild?.schoolSchedule || [])
    .filter((s) => s.day === schoolDay)
    .slice()
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const handleSaveChild = () => {
    const clean = childName.trim();
    if (!clean) {
      setChildFormError('Isi nama anak terlebih dahulu.');
      return;
    }
    setChildFormError('');
    onAddChild(clean, childGrade, childChar, childColor);
    setChildName('');
  };

  const handleAddTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = taskTitle.trim();
    if (!clean || !targetChild) return;
    onAddChildTask(targetChild.id, clean, taskTime, taskPeriod);
    setTaskTitle('');
  };

  const handleAddSubjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSubject = subjectName.trim();
    if (!cleanSubject || !targetChild) return;
    onAddSchoolSubject(
      targetChild.id,
      schoolDay,
      cleanSubject,
      startTime,
      endTime,
      subjectNote.trim() || undefined,
    );
    setSubjectName('');
    setSubjectNote('');
  };

  const handleSavePin = () => {
    const trimmed = newPin.trim();
    if (trimmed.length < 4 || !/^\d+$/.test(trimmed)) {
      setPinMsg({ text: 'Harus 4-6 angka!', ok: false });
      return;
    }
    if (onUpdatePin(trimmed)) {
      setNewPin('');
      setPinMsg({ text: '✅ PIN tersimpan!', ok: true });
    }
  };

  return (
    <ModalShell
      open={open}
      onClose={onEnterChildMode}
      title="👨‍👩‍👧 Mode Orang Tua"
      subtitle="Kelola profil anak, jadwal harian, dan jadwal pelajaran sekolah"
      theme="white-indigo"
      maxWidthClass="max-w-[700px]"
      zIndexClass="z-40"
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-3">
        {[
          { id: 'children' as const, label: '👧👦 Profil Anak' },
          { id: 'schedule' as const, label: '📋 Jadwal Harian' },
          { id: 'school' as const, label: '📚 Pelajaran' },
          { id: 'settings' as const, label: '🔐 Ganti PIN' },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`py-2 px-2.5 rounded-xl border-2 font-display font-bold text-xs sm:text-sm cursor-pointer transition-colors whitespace-nowrap ${
              tab === item.id
                ? 'bg-indigo-600 border-indigo-600 text-white'
                : 'bg-slate-50 border-slate-300 text-slate-700'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'children' && (
        <div className="space-y-3">
          <div className="max-h-[185px] overflow-y-auto space-y-2 pr-0.5">
            {childrenProfiles.map((child) => (
              <div
                key={child.id}
                className="flex items-center justify-between gap-2 bg-slate-50 border-2 border-slate-200 rounded-2xl px-3 py-2 flex-wrap"
              >
                <div>
                  <div className="font-display font-bold text-sm text-slate-900">
                    {child.avatar} {child.name} (Kls {child.grade})
                  </div>
                  <div className="text-xs text-slate-500 tabular-nums">
                    Pulau {child.unlockedIsland}/6 · ⭐ {child.score}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <GameButton
                    variant="green"
                    size="sm"
                    onClick={() => onSwitchAndPlayChild(child.id)}
                  >
                    Main
                  </GameButton>
                  <GameButton
                    variant="orange"
                    size="sm"
                    onClick={() => {
                      setSelectedChildId(child.id);
                      setTab('schedule');
                    }}
                  >
                    Jadwal
                  </GameButton>
                  <GameButton
                    variant="sky"
                    size="sm"
                    onClick={() => {
                      setSelectedChildId(child.id);
                      setTab('school');
                    }}
                  >
                    Pelajaran
                  </GameButton>
                  <GameButton
                    variant="danger"
                    size="sm"
                    disabled={childrenProfiles.length <= 1}
                    onClick={() => onDeleteChild(child.id)}
                  >
                    Hapus
                  </GameButton>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-3.5 space-y-2.5">
            <div className="font-display font-bold text-sm text-indigo-900">
              ➕ Tambah Anak
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-[1fr_130px] gap-2">
              <input
                type="text"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                placeholder="Nama anak (mis: Siti)"
                maxLength={20}
                className="px-3 py-2 rounded-xl border-2 border-slate-300 bg-white text-sm"
              />
              <select
                value={childGrade}
                onChange={(e) => setChildGrade(Number(e.target.value))}
                className="px-2.5 py-2 rounded-xl border-2 border-slate-300 bg-white text-sm"
              >
                {[1, 2, 3, 4, 5, 6].map((g) => (
                  <option key={g} value={g}>
                    Kelas {g}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-slate-700 mr-1">Karakter:</span>
              {CHARACTER_PRESETS.map((pr) => (
                <button
                  key={pr.id}
                  type="button"
                  onClick={() => setChildChar(pr.id)}
                  className={`px-2.5 py-1 rounded-xl border-2 text-xs font-display font-bold cursor-pointer ${
                    childChar === pr.id
                      ? 'border-indigo-600 bg-indigo-100 text-indigo-900'
                      : 'border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  {pr.avatar} {pr.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-700">Warna Baju/Hijab:</span>
              {OUTFIT_COLORS.slice(0, 5).map((hex) => (
                <ColorSwatch
                  key={hex}
                  color={hex}
                  active={childColor === hex}
                  onSelect={setChildColor}
                />
              ))}
            </div>

            {childFormError && (
              <div className="text-xs font-bold text-red-600">{childFormError}</div>
            )}

            <div className="text-right">
              <GameButton variant="indigo" size="sm" onClick={handleSaveChild}>
                + Simpan Anak
              </GameButton>
            </div>
          </div>
        </div>
      )}

      {tab === 'schedule' && targetChild && (
        <div className="space-y-3">
          <div className="flex justify-between items-center gap-2 flex-wrap">
            <select
              value={targetChild.id}
              onChange={(e) => setSelectedChildId(e.target.value)}
              className="px-3 py-2 rounded-xl border-2 border-slate-300 bg-white text-sm font-semibold"
            >
              {childrenProfiles.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.avatar} {c.name} (Kls {c.grade})
                </option>
              ))}
            </select>
            <GameButton
              variant="danger"
              size="sm"
              onClick={() => onResetChildTasks(targetChild.id)}
            >
              🔄 Reset Centang
            </GameButton>
          </div>

          <div className="max-h-[210px] overflow-y-auto space-y-2 pr-0.5">
            {targetChild.tasks
              .slice()
              .sort((a, b) => a.time.localeCompare(b.time))
              .map((task) => (
                <TaskItemRow
                  key={task.id}
                  task={task}
                  readOnlyToggle
                  onDelete={() => onDeleteChildTask(targetChild.id, task.id)}
                />
              ))}
          </div>

          <form
            onSubmit={handleAddTaskSubmit}
            className="grid grid-cols-2 sm:grid-cols-[1fr_92px_96px_auto] gap-2 bg-slate-100 p-2.5 rounded-2xl"
          >
            <input
              type="text"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="Tambah jadwal harian anak..."
              required
              maxLength={50}
              className="col-span-2 sm:col-span-1 px-2.5 py-2 rounded-xl border-2 border-slate-300 bg-white text-sm"
            />
            <input
              type="time"
              value={taskTime}
              onChange={(e) => setTaskTime(e.target.value)}
              required
              className="px-2 py-2 rounded-xl border-2 border-slate-300 bg-white text-sm"
            />
            <select
              value={taskPeriod}
              onChange={(e) => setTaskPeriod(e.target.value as DayPeriod)}
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

      {tab === 'school' && targetChild && (
        <div className="space-y-3">
          <div className="flex justify-between items-center gap-2 flex-wrap">
            <select
              value={targetChild.id}
              onChange={(e) => setSelectedChildId(e.target.value)}
              className="px-3 py-2 rounded-xl border-2 border-slate-300 bg-white text-sm font-semibold"
            >
              {childrenProfiles.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.avatar} {c.name} (Kls {c.grade})
                </option>
              ))}
            </select>

            <div className="flex gap-1.5 flex-wrap">
              {SCHOOL_DAYS.map((day) => (
                <FilterChip
                  key={day}
                  active={schoolDay === day}
                  onClick={() => setSchoolDay(day)}
                >
                  {day}
                </FilterChip>
              ))}
            </div>
          </div>

          <div className="max-h-[195px] overflow-y-auto space-y-2 pr-0.5">
            {daySubjects.length > 0 ? (
              daySubjects.map((subj) => (
                <SchoolSubjectRow
                  key={subj.id}
                  item={subj}
                  onDelete={() => onDeleteSchoolSubject(targetChild.id, subj.id)}
                />
              ))
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-4 text-center text-sm text-slate-600">
                Belum ada mata pelajaran untuk hari {schoolDay}.
              </div>
            )}
          </div>

          <form
            onSubmit={handleAddSubjectSubmit}
            className="grid grid-cols-2 sm:grid-cols-[1fr_88px_88px] gap-2 bg-slate-100 p-3 rounded-2xl"
          >
            <input
              type="text"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              placeholder="Mata pelajaran (mis: Matematika)"
              required
              maxLength={40}
              className="col-span-2 sm:col-span-1 px-2.5 py-2 rounded-xl border-2 border-slate-300 bg-white text-sm"
            />
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
              title="Jam mulai"
              className="px-2 py-2 rounded-xl border-2 border-slate-300 bg-white text-sm"
            />
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
              title="Jam selesai"
              className="px-2 py-2 rounded-xl border-2 border-slate-300 bg-white text-sm"
            />
            <input
              type="text"
              value={subjectNote}
              onChange={(e) => setSubjectNote(e.target.value)}
              placeholder="Catatan / perlengkapan (opsional, mis: Seragam Batik)"
              maxLength={45}
              className="col-span-2 px-2.5 py-2 rounded-xl border-2 border-slate-300 bg-white text-sm"
            />
            <GameButton type="submit" variant="green" size="sm" className="col-span-2 sm:col-span-1">
              + Tambah Pelajaran
            </GameButton>
          </form>
        </div>
      )}

      {tab === 'settings' && (
        <div className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-4 space-y-3">
          <div className="font-display font-bold text-sm text-indigo-950">
            Ganti PIN Orang Tua (4-6 angka):
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              placeholder="PIN baru"
              className="px-3 py-2 rounded-xl border-2 border-slate-300 bg-white text-sm w-40"
            />
            <GameButton variant="indigo" size="sm" onClick={handleSavePin}>
              Simpan
            </GameButton>
          </div>
          {pinMsg && (
            <div className={`text-xs font-bold ${pinMsg.ok ? 'text-emerald-600' : 'text-red-600'}`}>
              {pinMsg.text}
            </div>
          )}
        </div>
      )}

      <div className="mt-4 pt-3 border-t-2 border-slate-200 flex items-center justify-between flex-wrap gap-2">
        <GameButton variant="orange" size="sm" onClick={onRequestFeature}>
          💡 Request Fitur ke Developer
        </GameButton>
        <GameButton variant="green" size="md" onClick={onEnterChildMode}>
          🚀 Kembali ke Mode Anak
        </GameButton>
      </div>
    </ModalShell>
  );
};
