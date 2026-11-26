import React, { useState } from 'react';
import { GameButton } from '../atoms/GameButton';
import { ModalShell } from '../molecules/ModalShell';

export interface FeatureRequestModalProps {
  open: boolean;
  onClose: () => void;
  defaultSender?: string;
}

export const FeatureRequestModal: React.FC<FeatureRequestModalProps> = ({
  open,
  onClose,
  defaultSender = '',
}) => {
  const [senderName, setSenderName] = useState(defaultSender);
  const [category, setCategory] = useState('Fitur Baru');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/feature-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderName: senderName || 'Orang Tua / Bocil',
          category,
          message,
          recipient: 'req.piko@kasirsolo.com',
        }),
      });

      if (!res.ok) {
        // Fallback to mailto if backend route is unavailable
        const subject = encodeURIComponent(`[Request Fitur] Petualangan Bocil - ${category}`);
        const body = encodeURIComponent(
          `Nama: ${senderName || 'Orang Tua / Bocil'}\nKategori: ${category}\n\nPesan Request:\n${message}\n\nTujuan: req.piko@kasirsolo.com`,
        );
        window.open(`mailto:req.piko@kasirsolo.com?subject=${subject}&body=${body}`);
      }
    } catch {
      // Client-side fallback mailto
      const subject = encodeURIComponent(`[Request Fitur] Petualangan Bocil - ${category}`);
      const body = encodeURIComponent(
        `Nama: ${senderName || 'Orang Tua / Bocil'}\nKategori: ${category}\n\nPesan Request:\n${message}\n\nTujuan: req.piko@kasirsolo.com`,
      );
      window.open(`mailto:req.piko@kasirsolo.com?subject=${subject}&body=${body}`);
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  };

  const handleReset = () => {
    setMessage('');
    setSubmitted(false);
    onClose();
  };

  return (
    <ModalShell open={open} theme="amber" maxWidthClass="max-w-[500px]" centered>
      <div className="flex flex-col items-center mb-3">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-2xl mb-2 shadow-inner">
          💡
        </div>
        <h2 className="font-display font-bold text-xl text-amber-950 m-0">
          Request Fitur ke Developer
        </h2>
        <p className="text-xs text-amber-800 text-center mt-1">
          Punya ide seru, pulau baru, atau karakter tambahan? Kirim langsung ke tim pengembang kami di <b>req.piko@kasirsolo.com</b>!
        </p>
      </div>

      {submitted ? (
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-5 text-center my-3">
          <div className="text-3xl mb-2">🎉</div>
          <h3 className="font-display font-bold text-emerald-900 text-base mb-1">
            Request Berhasil Dikirim!
          </h3>
          <p className="text-xs text-emerald-700 leading-relaxed mb-4">
            Terima kasih! Pesan dan ide hebatmu telah dikirimkan ke <b>req.piko@kasirsolo.com</b>. Developer kami akan segera memeriksanya!
          </p>
          <GameButton variant="green" size="md" onClick={handleReset}>
            Kembali ke Game ✨
          </GameButton>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="block font-display font-bold text-xs text-amber-900 mb-1">
              Nama Kamu / Orang Tua:
            </label>
            <input
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="Contoh: Bunda Rina / Budi"
              className="w-full px-3.5 py-2 rounded-xl border-2 border-amber-300 bg-amber-50/50 text-amber-950 text-sm focus:outline-none focus:border-amber-500 font-display"
            />
          </div>

          <div>
            <label className="block font-display font-bold text-xs text-amber-900 mb-1">
              Kategori Request:
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border-2 border-amber-300 bg-amber-50/50 text-amber-950 text-sm focus:outline-none focus:border-amber-500 font-display"
            >
              <option value="Fitur Baru">🌟 Fitur Pembelajaran / Game Baru</option>
              <option value="Peta/Pulau">🏝️ Ide Pulau / Map Tambahan</option>
              <option value="Karakter/Kostum">🧢 Karakter &amp; Kostum Peci/Topi</option>
              <option value="Jadwal Sekolah">🏫 Jadwal Pelajaran Sekolah</option>
              <option value="Lainnya">💬 Masukan / Saran Lain</option>
            </select>
          </div>

          <div>
            <label className="block font-display font-bold text-xs text-amber-900 mb-1">
              Deskripsi Ide / Request Fitur:
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ceritakan detail fitur yang kamu inginkan di sini..."
              className="w-full px-3 py-2 rounded-xl border-2 border-amber-300 bg-amber-50/50 text-amber-950 text-sm focus:outline-none focus:border-amber-500 font-display resize-none"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 mt-2">
            <GameButton variant="gray" size="sm" type="button" onClick={onClose}>
              Batal
            </GameButton>
            <GameButton variant="orange" size="md" type="submit" disabled={loading}>
              {loading ? 'Mengirim...' : 'Kirim ke Developer 🚀'}
            </GameButton>
          </div>
        </form>
      )}
    </ModalShell>
  );
};
