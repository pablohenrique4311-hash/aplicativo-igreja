import React, { useState } from 'react';
import { useChurch } from '../../context/ChurchContext';
import { QrCodeSvg } from './QrCodeSvg';
import { X, Copy, Check, Share2 } from 'lucide-react';

export const QrModal: React.FC = () => {
  const { qrModalData, closeQrModal } = useChurch();
  const [copied, setCopied] = useState(false);

  if (!qrModalData?.isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(qrModalData.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm overflow-hidden bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 text-center">
        {/* Close Button */}
        <button
          onClick={closeQrModal}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <h3 className="text-lg font-bold text-white mb-1">
          {qrModalData.title}
        </h3>
        {qrModalData.subtitle && (
          <p className="text-xs text-slate-400 mb-5">
            {qrModalData.subtitle}
          </p>
        )}

        {/* QR Code Container */}
        <div className="flex justify-center my-4">
          <QrCodeSvg
            value={qrModalData.code}
            size={220}
            label={qrModalData.type === 'ticket' ? 'Apresente na Entrada' : qrModalData.type === 'pix' ? 'QR Code Dinâmico' : 'Credencial'}
          />
        </div>

        {/* Code representation */}
        <div className="mt-4 p-3 bg-slate-950/70 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
          <span className="text-xs font-mono text-slate-300 truncate max-w-[200px]">
            {qrModalData.code}
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 rounded-lg transition-colors shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Copiado
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copiar
              </>
            )}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center gap-2">
          <button
            onClick={closeQrModal}
            className="flex-1 py-2.5 px-4 rounded-xl text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            Fechar
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center justify-center gap-2 flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Compartilhar
          </button>
        </div>
      </div>
    </div>
  );
};
