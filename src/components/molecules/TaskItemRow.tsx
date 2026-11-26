import React from 'react';
import { DailyTask } from '../../types/game';

export interface TaskItemRowProps {
  task: DailyTask;
  onToggle?: () => void;
  onDelete: () => void;
  readOnlyToggle?: boolean;
}

export const TaskItemRow: React.FC<TaskItemRowProps> = ({
  task,
  onToggle,
  onDelete,
  readOnlyToggle = false,
}) => {
  return (
    <div
      className={`flex items-center justify-between gap-2 rounded-xl border-2 px-3 py-2 transition-colors ${
        task.done
          ? 'bg-emerald-50 border-emerald-300'
          : 'bg-slate-50 border-slate-200'
      }`}
    >
      <button
        type="button"
        disabled={readOnlyToggle}
        onClick={onToggle}
        className={`flex items-center gap-2.5 flex-1 text-left bg-transparent border-0 p-0 ${
          readOnlyToggle ? 'cursor-default' : 'cursor-pointer'
        }`}
      >
        <span
          className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center font-bold text-xs shrink-0 ${
            task.done
              ? 'bg-emerald-500 border-emerald-600 text-white'
              : 'bg-white border-slate-400 text-transparent'
          }`}
          aria-hidden="true"
        >
          ✓
        </span>
        <span className="min-w-0">
          <span
            className={`block text-sm font-semibold leading-snug ${
              task.done ? 'line-through text-slate-500' : 'text-slate-900'
            }`}
          >
            {task.title}
          </span>
          <span className="block text-xs text-slate-500 tabular-nums">
            🕒 {task.time} · {task.period} · +25 Poin
          </span>
        </span>
      </button>

      <button
        type="button"
        onClick={onDelete}
        aria-label={`Hapus ${task.title}`}
        className="p-1.5 rounded-lg hover:bg-red-100 text-sm cursor-pointer transition-colors shrink-0"
      >
        🗑️
      </button>
    </div>
  );
};
