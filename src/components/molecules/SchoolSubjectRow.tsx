import React from 'react';
import { SchoolSubjectItem } from '../../types/game';

export interface SchoolSubjectRowProps {
  item: SchoolSubjectItem;
  onDelete?: () => void;
}

export const SchoolSubjectRow: React.FC<SchoolSubjectRowProps> = ({
  item,
  onDelete,
}) => {
  return (
    <div className="flex items-center justify-between gap-2.5 rounded-xl border-2 border-sky-200 bg-sky-50/70 px-3 py-2.5">
      <div className="min-w-0">
        <div className="font-display font-bold text-sm text-slate-900 leading-snug">
          {item.subject}
        </div>
        <div className="text-xs text-slate-600 tabular-nums mt-0.5">
          🕒 {item.startTime} - {item.endTime}
          {item.note ? ` · ${item.note}` : ''}
        </div>
      </div>

      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          aria-label={`Hapus pelajaran ${item.subject}`}
          className="p-1.5 rounded-lg hover:bg-red-100 text-sm cursor-pointer transition-colors shrink-0"
        >
          🗑️
        </button>
      )}
    </div>
  );
};
