import React, { useEffect, useState } from 'react';
import { CrystalChallenge } from '../../types/game';
import { GameButton } from '../atoms/GameButton';
import { ProgressBar } from '../atoms/ProgressBar';
import { ModalShell } from '../molecules/ModalShell';

export interface QuizModalProps {
  challenge: CrystalChallenge | null;
  onAnswerCorrect: (crystalIndex: number, pointsEarned: number, isFinalQuestion: boolean) => void;
  onAnswerWrong: () => void;
  onClose: () => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  challenge,
  onAnswerCorrect,
  onAnswerWrong,
  onClose,
}) => {
  const [questionIdx, setQuestionIdx] = useState(0);
  const [tries, setTries] = useState(0);
  const [locked, setLocked] = useState(false);
  const [wrongIndices, setWrongIndices] = useState<number[]>([]);
  const [correctIndex, setCorrectIndex] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ text: string; tone: 'ok' | 'no' } | null>(null);

  useEffect(() => {
    if (!challenge) return;
    setQuestionIdx(challenge.currentIndex);
    setTries(0);
    setLocked(false);
    setWrongIndices([]);
    setCorrectIndex(null);
    setFeedback(null);
  }, [challenge]);

  if (!challenge) return null;

  const total = challenge.questions.length;
  const currentQ = challenge.questions[questionIdx];
  if (!currentQ) return null;

  const progressPct = Math.round(((locked && correctIndex !== null ? questionIdx + 1 : questionIdx) / total) * 100);
  const multiplier = challenge.hidden ? 2 : 1;

  const handleOptionClick = (optIdx: number) => {
    if (locked || wrongIndices.includes(optIdx)) return;

    if (optIdx === currentQ.answerIndex) {
      setLocked(true);
      setCorrectIndex(optIdx);
      const basePts = 40 + (tries === 0 ? 10 : 0);
      const pts = basePts * multiplier;
      const isFinal = questionIdx + 1 >= total;
      const finalBonus = 50 * multiplier;

      setFeedback({
        text: isFinal
          ? `💎 Kristal Didapat! +${pts + finalBonus} Poin! ${challenge.hidden ? '(Bonus x2 Tersembunyi!)' : ''}`
          : `🎉 Benar! +${pts} Poin! Lanjut soal ${questionIdx + 2}...`,
        tone: 'ok',
      });

      onAnswerCorrect(challenge.index, isFinal ? pts + finalBonus : pts, isFinal);

      if (!isFinal) {
        window.setTimeout(() => {
          setQuestionIdx((prev) => prev + 1);
          setTries(0);
          setLocked(false);
          setWrongIndices([]);
          setCorrectIndex(null);
          setFeedback(null);
        }, 750);
      }
    } else {
      setTries((t) => t + 1);
      setWrongIndices((prev) => [...prev, optIdx]);
      setFeedback({ text: 'Belum tepat, coba pilihan lain ya! 💪', tone: 'no' });
      onAnswerWrong();
    }
  };

  return (
    <ModalShell
      open={Boolean(challenge)}
      theme="blue"
      maxWidthClass="max-w-[560px]"
      zIndexClass="z-25"
      centered
    >
      {challenge.hidden && (
        <div className="bg-purple-100 border-2 border-purple-300 text-purple-900 rounded-xl px-3 py-2 mb-2 text-xs font-display font-bold flex items-center gap-2">
          ✨ <b>KRISTAL TERSEMBUNYI!</b> Nilai Poin dan Hadiah dikalikan 2 (x2)!
        </div>
      )}

      <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
        <span className="bg-sky-100 text-sky-800 px-3 py-1 rounded-full text-xs font-display font-bold">
          {currentQ.subject}
        </span>
        <span className="bg-amber-100 text-amber-900 px-3 py-1 rounded-full text-xs font-display font-bold tabular-nums">
          💎 Soal {questionIdx + 1} / {total} {challenge.hidden ? '✨ [x2]' : ''}
        </span>
      </div>

      <ProgressBar percent={progressPct} heightClass="h-2.5" trackClass="bg-sky-100" />

      <div className="font-display font-bold text-lg text-slate-900 my-3.5 leading-snug">
        {currentQ.question}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 my-3">
        {currentQ.options.map((opt, idx) => {
          const isCorrect = correctIndex === idx;
          const isWrong = wrongIndices.includes(idx);
          return (
            <button
              key={`${questionIdx}-${idx}`}
              type="button"
              disabled={locked || isWrong}
              onClick={() => handleOptionClick(idx)}
              className={`rounded-2xl border-[3px] px-3 py-3 font-display font-semibold text-sm md:text-base cursor-pointer transition-all duration-150 ${
                isCorrect
                  ? 'bg-emerald-100 border-emerald-500 text-emerald-900'
                  : isWrong
                    ? 'bg-red-100 border-red-400 text-red-900 opacity-80'
                    : 'bg-slate-50 hover:bg-sky-50 border-slate-300 text-slate-900 shadow-[0_4px_0_#94a3b8] active:translate-y-[2px]'
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      <div
        className={`min-h-[24px] font-display font-bold text-sm ${
          feedback?.tone === 'ok' ? 'text-emerald-600' : 'text-red-600'
        }`}
      >
        {feedback?.text || ''}
      </div>

      <div className="mt-3">
        <GameButton
          variant="gray"
          size="sm"
          disabled={locked}
          onClick={onClose}
        >
          Tutup Sebentar
        </GameButton>
      </div>
    </ModalShell>
  );
};
