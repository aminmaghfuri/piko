import React from 'react';

export interface GameShellTemplateProps {
  canvasContainerRef: React.RefObject<HTMLDivElement | null>;
  contextLost: boolean;
  hudLayer: React.ReactNode;
  modalLayer: React.ReactNode;
}

export const GameShellTemplate: React.FC<GameShellTemplateProps> = ({
  canvasContainerRef,
  contextLost,
  hudLayer,
  modalLayer,
}) => {
  return (
    <main className="relative w-full h-full overflow-hidden bg-sky-500">
      <div
        ref={canvasContainerRef}
        className="w-full h-full block cursor-grab active:cursor-grabbing touch-none"
      />

      {contextLost && (
        <div className="fixed inset-0 bg-sky-900/90 text-white flex flex-col items-center justify-center p-6 text-center z-50">
          <div className="text-4xl mb-2" aria-hidden="true">
            🏝️
          </div>
          <h2 className="font-display text-xl font-bold mb-1">
            Tampilan 3D sedang dipulihkan
          </h2>
          <p className="text-sm text-sky-100 max-w-sm">
            Konteks grafis WebGL sempat terputus. Mohon tunggu sebentar atau muat ulang halaman jika belum kembali.
          </p>
        </div>
      )}

      {hudLayer}
      {modalLayer}
    </main>
  );
};
